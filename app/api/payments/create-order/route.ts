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
    const { amount, currency = 'INR', receipt, notes } = await request.json();

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
    console.error('Razorpay order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    );
  }
}
