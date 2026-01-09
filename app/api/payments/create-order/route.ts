import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

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

export async function POST(request: NextRequest) {
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

    // Check if user is already registered (event logic)
    if (notes?.userId && notes?.eventId) {
      const existingReg = await adminDb.collection('event_registrations')
        .where('eventId', '==', notes.eventId)
        .where('userId', '==', notes.userId)
        .get();

      if (!existingReg.empty) {
        return NextResponse.json(
          { error: 'You are already registered for this event' },
          { status: 400 }
        );
      }
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Check for stock availability before creating order
    if (items && items.length > 0) {
      const productRefs = items.map((item: any) => adminDb.collection('products').doc(item.productId));
      const productDocs = await adminDb.getAll(...productRefs);

      const unavailableItems: string[] = [];

      for (let i = 0; i < productDocs.length; i++) {
        const doc = productDocs[i];
        const item = items[i];

        if (!doc.exists) {
          unavailableItems.push(`${item.name || 'Item'} (Not Found)`);
          continue;
        }

        const productData = doc.data();
        const currentStock = productData?.stock || 0;

        if (currentStock < item.quantity) {
          const reason = currentStock === 0 ? 'Out of Stock' : `Only ${currentStock} left`;
          unavailableItems.push(`${productData?.name || 'Item'} (${reason})`);
        }
      }

      if (unavailableItems.length > 0) {
        return NextResponse.json(
          { error: `Availability Update: ${unavailableItems.join(', ')}` },
          { status: 400 }
        );
      }
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
