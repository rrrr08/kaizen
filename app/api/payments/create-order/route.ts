import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { withRateLimit, RateLimitPresets } from '@/lib/redis-rate-limit';

let razorpayInstance: any = null;

async function getRazorpay() {
  if (!razorpayInstance) {
    const Razorpay = (await import('razorpay')).default;
    razorpayInstance = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }
  return razorpayInstance;
}

async function createOrderHandler(request: NextRequest) {
  try {
    // Check if Razorpay credentials are set
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay credentials not configured');
      return NextResponse.json(
        { error: 'Payment gateway not configured. Please contact support.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { amount, currency = 'INR', receipt, notes, items, shippingAddress, userId } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Parallelize validation checks
    const validationPromises: Promise<any>[] = [];

    // Check if user is already registered (event logic)
    if (notes?.userId && notes?.eventId) {
      validationPromises.push(
        adminDb.collection('event_registrations')
          .where('eventId', '==', notes.eventId)
          .where('userId', '==', notes.userId)
          .limit(1)
          .get()
          .then(existingReg => {
            if (!existingReg.empty) {
              throw new Error('EVENT_ALREADY_REGISTERED');
            }
          })
      );
    }

    // Check for stock availability
    if (items && items.length > 0) {
      const productRefs = items.map((item: any) => adminDb.collection('products').doc(item.productId));
      validationPromises.push(
        adminDb.getAll(...productRefs).then(productDocs => {
          const unavailableItems: string[] = [];

          productDocs.forEach((doc, i) => {
            const item = items[i];

            if (!doc.exists) {
              unavailableItems.push(`${item.name || 'Item'} (Not Found)`);
              return;
            }

            const productData = doc.data();
            const currentStock = productData?.stock || 0;

            if (currentStock < item.quantity) {
              const reason = currentStock === 0 ? 'Out of Stock' : `Only ${currentStock} left`;
              unavailableItems.push(`${productData?.name || 'Item'} (${reason})`);
            }
          });

          if (unavailableItems.length > 0) {
            throw new Error(`STOCK_UNAVAILABLE:${unavailableItems.join(', ')}`);
          }
        })
      );
    }

    // Wait for all validations
    try {
      await Promise.all(validationPromises);
    } catch (validationError: any) {
      if (validationError.message === 'EVENT_ALREADY_REGISTERED') {
        return NextResponse.json(
          { error: 'You are already registered for this event' },
          { status: 400 }
        );
      }
      if (validationError.message.startsWith('STOCK_UNAVAILABLE:')) {
        const items = validationError.message.replace('STOCK_UNAVAILABLE:', '');
        return NextResponse.json(
          { error: `Availability Update: ${items}` },
          { status: 400 }
        );
      }
      throw validationError;
    }

    // Amount should be in paise (multiply by 100)
    const razorpayAmount = Math.round(amount * 100);

    const razorpay = await getRazorpay();
    const order = await razorpay.orders.create({
      amount: razorpayAmount,
      currency,
      receipt,
      notes,
    });

    // Create a PENDING order in Firestore if items are present (Shop Purchase)
    // For Events, we don't necessarily need an 'orders' doc, but standardizing is good.
    // Current flow: Event registration handles its own logic in verify.
    // We will only create 'orders' doc if this is a Shop purchase (has items).
    let firestoreOrderId = null;

    if (items && items.length > 0) {
      const orderRef = adminDb.collection('orders').doc();
      firestoreOrderId = orderRef.id;

      await orderRef.set({
        id: firestoreOrderId,
        userId: userId || notes?.userId || 'guest',
        items: items,
        shippingAddress: shippingAddress || {},
        totalPrice: amount, // Storing in Rupees as per existing schema
        status: 'PENDING',
        paymentStatus: 'initiated',
        paymentGateway: 'razorpay',
        paymentOrderId: order.id, // Link to Razorpay Order ID
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });
    }

    return NextResponse.json(
      {
        success: true,
        orderId: order.id, // Razorpay Order ID
        dbOrderId: firestoreOrderId, // Our internal DB Order ID
        amount: order.amount,
        currency: order.currency,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Razorpay/Firebase error in create-order:', error);

    // Check if it's a Firebase Admin initialization error
    if (String(error).includes('credential')) {
      return NextResponse.json(
        { error: 'Server configuration error (Firebase Admin). Please check logs.' },
        { status: 500 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to create payment order', details: errorMessage },
      { status: 500 }
    );
  }
}

// Export with strict rate limiting (5 requests per 5 minutes - prevents payment fraud)
export const POST = withRateLimit(
  {
    endpoint: 'api:payments:create-order',
    ...RateLimitPresets.auth, // 5 req/5min (very strict)
  },
  createOrderHandler
);
