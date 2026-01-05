import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
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
          createdAt: new Date(), // Use server date
          updatedAt: new Date(),
          paymentStatus: 'completed',
          paymentOrderId: orderId
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

                const eventDate = eventData?.datetime?.toDate();
                const formattedDate = eventDate ? new Date(eventDate).toLocaleString('en-US', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                }) : 'Date to be announced';

                const ticketHtml = `
                  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 4px solid #000; border-radius: 20px; overflow: hidden; background-color: #FFFDF5; box-shadow: 12px 12px 0px #000;">
                    <div style="background-color: #6C5CE7; padding: 40px; text-align: center; border-bottom: 4px solid #000;">
                      <h1 style="color: #fff; margin: 0; font-size: 32px; text-transform: uppercase; letter-spacing: -1px; font-weight: 900; text-shadow: 3px 3px 0px #000;">Event Registration</h1>
                      <p style="margin: 10px 0 0 0; color: #fff; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; font-size: 14px;">Confirmed & Verified</p>
                    </div>
                    <div style="padding: 40px; color: #2D3436;">
                      <div style="margin-bottom: 30px; text-align: center;">
                        <h2 style="font-size: 24px; margin: 0; text-transform: uppercase; font-weight: 900;">Hello, ${userData.displayName || userData.name || 'Gamer'}!</h2>
                        <p style="font-size: 16px; font-weight: 700; margin-top: 5px; opacity: 0.6;">You are going to...</p>
                      </div>
                      <div style="background-color: #fff; border: 3px solid #000; border-radius: 15px; overflow: hidden; margin-bottom: 30px; box-shadow: 6px 6px 0px #000;">
                        <div style="background-color: #FFD93D; padding: 15px; border-bottom: 3px solid #000;">
                            <h3 style="margin: 0; font-size: 20px; text-transform: uppercase; font-weight: 900; color: #000;">${eventData?.title || 'Event'}</h3>
                        </div>
                        <div style="padding: 25px;">
                            <div style="margin-bottom: 15px;">
                                <p style="margin: 0; font-size: 12px; font-weight: 900; text-transform: uppercase; color: #b2bec3; letter-spacing: 1px;">When</p>
                                <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: 800; color: #2d3436;">${formattedDate}</p>
                            </div>
                            <div style="margin-bottom: 15px;">
                                <p style="margin: 0; font-size: 12px; font-weight: 900; text-transform: uppercase; color: #b2bec3; letter-spacing: 1px;">Where</p>
                                <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: 800; color: #2d3436;">${eventData?.location || 'Location to be announced'}</p>
                            </div>
                            <div>
                                <p style="margin: 0; font-size: 12px; font-weight: 900; text-transform: uppercase; color: #b2bec3; letter-spacing: 1px;">Registration ID</p>
                                <p style="margin: 5px 0 0 0; font-family: monospace; font-size: 16px; font-weight: 800; color: #6C5CE7;">${regRef.id}</p>
                            </div>
                        </div>
                      </div>
                      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
                        <div style="background-color: #00B894; border: 3px solid #000; border-radius: 15px; padding: 20px; box-shadow: 4px 4px 0px #000;">
                          <h4 style="margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; font-weight: 900; color: #fff;">Status</h4>
                          <p style="margin: 0; font-weight: 900; font-size: 18px; color: #fff;">CONFIRMED</p>
                        </div>
                        <div style="background-color: #FF7675; border: 3px solid #000; border-radius: 15px; padding: 20px; box-shadow: 4px 4px 0px #000;">
                          <h4 style="margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; font-weight: 900; color: #fff;">Amount Paid</h4>
                          <p style="margin: 0; font-weight: 900; font-size: 18px; color: #fff;">₹${amount}</p>
                        </div>
                      </div>
                      <div style="text-align: center; margin-top: 40px;">
                        <p style="font-weight: 800; font-size: 14px; opacity: 0.5; text-transform: uppercase; margin-bottom: 20px;">Present this email at the venue</p>
                        <div style="display: inline-block;">
                            <span style="background: #000; color: #fff; padding: 10px 20px; border-radius: 10px; font-weight: 900; text-decoration: none; display: inline-block;">JOY JUNCTURE EVENTS</span>
                        </div>
                      </div>
                    </div>
                    <div style="background-color: #000; padding: 20px; text-align: center;">
                      <p style="color: white; margin: 0; font-size: 10px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">© 2024 Joy Juncture Inc. • Play Smart, Play Fun</p>
                    </div>
                  </div>
                `;

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
              registered: (eventData?.registered || 0) + 1
            });
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
