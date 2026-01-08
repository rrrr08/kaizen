import { NextRequest, NextResponse } from 'next/server';

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

    const { amount, currency = 'INR', receipt, notes } = await request.json();

    // Check if user is already registered
    if (notes?.userId && notes?.eventId) {
      // Validate Admin Keys before importing
      if (!process.env.FIREBASE_ADMIN_PROJECT_ID || !process.env.FIREBASE_ADMIN_CLIENT_EMAIL || !process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
        console.error('Missing Firebase Admin Keys for duplicate check');
        return NextResponse.json(
          { error: 'Server misconfigured: Missing Firebase Admin Keys.' },
          { status: 500 }
        );
      }

      const { adminDb } = await import('@/lib/firebaseAdmin');
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

    // Amount should be in paise (multiply by 100)
    const razorpayAmount = Math.round(amount * 100);

    const razorpay = await getRazorpay();
    const order = await razorpay.orders.create({
      amount: razorpayAmount,
      currency,
      receipt,
      notes,
    });

    return NextResponse.json(
      {
        success: true,
        orderId: order.id,
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
