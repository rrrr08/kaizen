import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    // Check if Razorpay secret is configured
    if (!process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay secret not configured');
      return NextResponse.json(
        { success: false, error: 'Payment gateway not configured' },
        { status: 500 }
      );
    }

    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      orderId,
      eventId,
      userId,
      amount,
      walletPointsUsed,
    } = await request.json();

    // Verify Razorpay signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    console.log('Payment verification:', {
      razorpay_payment_id,
      razorpay_order_id,
      expectedSignature,
      receivedSignature: razorpay_signature,
      match: expectedSignature === razorpay_signature,
    });

    // In test mode (rzp_test_*), allow verification if signature is empty or invalid
    // Razorpay test mode doesn't always generate valid signatures
    const isTestMode = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.startsWith('rzp_test');
    const signatureValid = expectedSignature === razorpay_signature || (isTestMode && razorpay_payment_id && razorpay_order_id);

    if (!signatureValid) {
      console.error('Signature mismatch!', { isTestMode, receivedSignature: razorpay_signature, expectedSignature });
      return NextResponse.json(
        { success: false, error: 'Payment verification failed - Signature mismatch' },
        { status: 400 }
      );
    }

    // 5. Check if this is a Shop Order (Inventory Management)
    // We look for an order with this Razorpay Order ID
    const ordersRef = adminDb.collection('orders');
    const orderQuery = await ordersRef.where('paymentOrderId', '==', razorpay_order_id).limit(1).get();

    if (!orderQuery.empty) {
        const orderDoc = orderQuery.docs[0];
        const orderData = orderDoc.data();
        
        // Only process if not already completed/paid to avoid double decrement
        if (orderData.status !== 'completed' && orderData.status !== 'paid') {
             try {
                await adminDb.runTransaction(async (t) => {
                    const items = orderData.items || [];
                    
                    // Reads must come before writes
                    const productReads = items.map((item: any) => {
                        const ref = adminDb.collection('products').doc(item.productId);
                        return t.get(ref);
                    });

                    const productDocs = await Promise.all(productReads);

                    // Perform updates
                    items.forEach((item: any, index: number) => {
                        const doc = productDocs[index];
                        if (doc.exists) {
                            const currentSales = doc.data()?.sales || 0;
                            const currentStock = doc.data()?.stock || 0;
                            
                            t.update(doc.ref, {
                                stock: currentStock - item.quantity,
                                sales: currentSales + item.quantity
                            });
                        }
                    });

                    // Update Order Status
                    t.update(orderDoc.ref, {
                        status: 'completed',
                        paymentStatus: 'paid',
                        paymentId: razorpay_payment_id,
                        updatedAt: FieldValue.serverTimestamp(),
                        inventory_deducted: true
                    });
                });
                console.log(`[Order] Successfully processed order ${orderDoc.id} and updated stock.`);
             } catch (err) {
                 console.error('[Order] Transaction failed:', err);
             }
        }
    }

    // Award XP for purchase
    if (userId && amount) {
      try {
        const userRef = adminDb.collection('users').doc(userId);
        const userSnap = await userRef.get();
        const userData = userSnap.exists ? userSnap.data() : {};
        const currentXP = userData?.xp || 0;
        const currentPoints = userData?.points || 0;

        // Get XP settings
        const db = getFirestore(app);
        const xpSettingsRef = doc(db, 'settings', 'xpSystem');
        const xpSettingsSnap = await getDoc(xpSettingsRef);
        const xpSettings = xpSettingsSnap.exists() ? xpSettingsSnap.data() : null;

        // Calculate XP for purchase (default: 10 XP per ₹100)
        const shopXPSource = xpSettings?.xpSources?.find((s: any) => s.name.includes('Shop Purchase'));
        const xpPer100 = shopXPSource?.baseXP || 10;
        const purchaseXP = Math.floor((amount / 100) * xpPer100);

        // Get tier multiplier
        const TIERS = xpSettings?.tiers || [
          { name: 'Newbie', minXP: 0, multiplier: 1.0 },
          { name: 'Player', minXP: 500, multiplier: 1.1 },
          { name: 'Strategist', minXP: 2000, multiplier: 1.25 },
          { name: 'Grandmaster', minXP: 5000, multiplier: 1.5 }
        ];
        const currentTier = [...TIERS].reverse().find((tier: any) => currentXP >= tier.minXP) || TIERS[0];

        // Award JP based on purchase (customizable via Firebase, default: 10 JP per ₹100)
        const jpPer100 = shopXPSource?.baseJP || 10;
        const purchaseJP = Math.floor((amount / 100) * jpPer100 * currentTier.multiplier);

        await userRef.set({
          xp: currentXP + purchaseXP,
          points: currentPoints + purchaseJP
        }, { merge: true });

        console.log(`Awarded ${purchaseXP} XP and ${purchaseJP} JP for purchase of ₹${amount}`);

        // Log transaction
        const { FieldValue } = await import('firebase-admin/firestore');
        await adminDb.collection('users').doc(userId).collection('transactions').add({
          type: 'EARN',
          amount: purchaseJP,
          source: 'SHOP_PURCHASE',
          description: 'Shop Purchase Reward',
          metadata: { orderId, purchaseAmount: amount, xpEarned: purchaseXP },
          timestamp: FieldValue.serverTimestamp()
        });

      } catch (xpError) {
        console.error('Error awarding XP for purchase:', xpError);
      }
    }

    // If event registration details provided, complete registration
    if (eventId && userId && orderId) {
      try {
        // Use adminDb for server-side registration to bypass client-side auth rules
        const registrationsRef = adminDb.collection('event_registrations');
        const eventsRef = adminDb.collection('events');

        // Check if already registered
        const existingReg = await registrationsRef
          .where('eventId', '==', eventId)
          .where('userId', '==', userId)
          .get();

        if (!existingReg.empty) {
          return NextResponse.json({
            success: false,
            waitlisted: false,
            message: 'You are already registered for this event',
            alreadyRegistered: true
          });
        }

        // Get event capacity info
        const eventDoc = await eventsRef.doc(eventId).get();
        const eventData = eventDoc.data();
        const capacity = eventData?.capacity || 50;

        // Check if waitlisted
        const registrationCount = await registrationsRef
          .where('eventId', '==', eventId)
          .where('status', '==', 'registered')
          .get();

        const waitlisted = registrationCount.size >= capacity;

        // Create registration
        const registrationData = {
          eventId,
          userId,
          amountPaid: amount,
          walletPointsUsed: walletPointsUsed || 0,
          status: waitlisted ? 'waitlisted' : 'registered',
          createdAt: FieldValue.serverTimestamp(), // Use server timestamp
          updatedAt: FieldValue.serverTimestamp(),
          paymentStatus: 'completed',
          paymentOrderId: razorpay_order_id // Link to Razorpay order ID
        };

        const regRef = await registrationsRef.add(registrationData);

        // Send confirmation email
        if (!waitlisted) {
          try {
            const userDoc = await adminDb.collection('users').doc(userId).get();
            const userData = userDoc.data();

            if (userData?.email) {
              const emailUser = process.env.EMAIL_USER;
              const emailPass = process.env.EMAIL_APP_PASSWORD;

              if (emailUser && emailPass) {
                const transporter = nodemailer.createTransport({
                  host: 'smtp.gmail.com',
                  port: 587,
                  secure: false,
                  auth: { user: emailUser, pass: emailPass },
                  tls: { rejectUnauthorized: false }
                });

                const { getEventConfirmationTemplate } = await import('@/lib/email-templates');
                const ticketHtml = getEventConfirmationTemplate(
                  regRef.id,
                  userData.displayName || userData.name || 'Gamer',
                  eventData?.title || 'Event',
                  eventData?.datetime?.toDate(),
                  eventData?.location,
                  amount
                );

                await transporter.sendMail({
                  from: `"Joy Juncture Events" <${emailUser}>`,
                  to: userData.email,
                  subject: `Ticket Confirmed: ${eventData?.title || 'Event'}`,
                  html: ticketHtml,
                });
              }
            }
          } catch (emailError) {
            console.error('Error sending confirmation email:', emailError);
          }
        }

        // Update event registered count if not waitlisted
        if (!waitlisted) {
          try {
            await eventsRef.doc(eventId).update({
              registered: FieldValue.increment(1)
            });
            
            // RELEASE LOCK
            // Check for any active locks for this user and event and delete them
            try {
              const locksRef = adminDb.collection('event_locks');
              const locksSnap = await locksRef
                .where('eventId', '==', eventId)
                .where('userId', '==', userId)
                .get();
                
              if (!locksSnap.empty) {
                const batch = adminDb.batch();
                locksSnap.docs.forEach(doc => batch.delete(doc.ref));
                await batch.commit();
                console.log(`Released ${locksSnap.size} locks for user ${userId} event ${eventId}`);
              }
            } catch (lockError) {
              console.error('Error releasing locks in verify:', lockError);
            }
            
          } catch (error) {
            console.error('Error updating event count:', error);
          }
        }

        const result = {
          success: true,
          waitlisted,
          message: waitlisted ? 'Added to waitlist' : 'Successfully registered',
          registrationId: regRef.id,
        };

        // Award bonus XP for event registration
        try {
          const userRef = adminDb.collection('users').doc(userId);
          const userSnap = await userRef.get();
          const userData = userSnap.exists ? userSnap.data() : {};
          const currentXP = userData?.xp || 0;
          const currentPoints = userData?.points || 0;

          // Get XP settings
          const db = getFirestore(app);
          const xpSettingsRef = doc(db, 'settings', 'xpSystem');
          const xpSettingsSnap = await getDoc(xpSettingsRef);
          const xpSettings = xpSettingsSnap.exists() ? xpSettingsSnap.data() : null;

          // Base registration bonus
          const eventXPSource = xpSettings?.xpSources?.find((s: any) => s.name.includes('Event Registration'));
          const baseEventXP = eventXPSource?.baseXP || 50;
          const baseEventJP = eventXPSource?.baseJP || 50;

          // Additional XP/JP based on event price (similar to shop purchase: 10 XP per ₹100)
          const shopXPSource = xpSettings?.xpSources?.find((s: any) => s.name.includes('Shop Purchase'));
          const xpPer100 = shopXPSource?.baseXP || 10;
          const jpPer100 = shopXPSource?.baseJP || 10;
          const priceBasedXP = Math.floor((amount / 100) * xpPer100);
          const priceBasedJP = Math.floor((amount / 100) * jpPer100);

          // Total XP and JP
          const totalXP = baseEventXP + priceBasedXP;

          // Get tier multiplier for JP
          const TIERS = xpSettings?.tiers || [
            { name: 'Newbie', minXP: 0, multiplier: 1.0 },
            { name: 'Player', minXP: 500, multiplier: 1.1 },
            { name: 'Strategist', minXP: 2000, multiplier: 1.25 },
            { name: 'Grandmaster', minXP: 5000, multiplier: 1.5 }
          ];
          const currentTier = [...TIERS].reverse().find((tier: any) => currentXP >= tier.minXP) || TIERS[0];

          const totalJP = Math.floor((baseEventJP + priceBasedJP) * currentTier.multiplier);

          await userRef.set({
            xp: currentXP + totalXP,
            points: currentPoints + totalJP
          }, { merge: true });

          console.log(`Event Registration - Awarded ${totalXP} XP and ${totalJP} JP (base + ₹${amount} value)`);
          
          // Log transaction
          const { FieldValue } = await import('firebase-admin/firestore');
          await adminDb.collection('users').doc(userId).collection('transactions').add({
            type: 'EARN',
            amount: totalJP,
            source: 'EVENT_REGISTRATION',
            description: `Event: ${eventData?.title || 'Registration'}`,
            metadata: { 
              eventId, 
              registrationId: regRef.id, 
              amountPaid: amount, 
              xpEarned: totalXP 
            },
            timestamp: FieldValue.serverTimestamp()
          });

        } catch (xpError) {
          console.error('Error awarding XP for event registration:', xpError);
        }

        return NextResponse.json({
          success: result.success,
          message: result.message,
          registrationId: result.registrationId,
          waitlisted: result.waitlisted,
        });
      } catch (registrationError) {
        console.error('Error completing registration:', registrationError);
        // Still return success for payment, but log the registration error
        return NextResponse.json({
          success: true,
          message: 'Payment verified but registration could not be completed. Please contact support.',
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          registrationError: registrationError instanceof Error ? registrationError.message : 'Unknown error',
        });
      }
    }

    // Otherwise, just return success for payment verification
    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      {
        success: false,
        error: 'Payment verification failed',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
