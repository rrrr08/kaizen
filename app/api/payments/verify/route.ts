import Razorpay from 'razorpay';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const { paymentId, orderId, signature } = await request.json();

    if (!paymentId || !orderId || !signature) {
      return NextResponse.json(
        { error: 'Missing payment verification details' },
        { status: 400 }
      );
    }

    // Verify signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!);
    hmac.update(`${orderId}|${paymentId}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== signature) {
      return NextResponse.json(
        { error: 'Payment verification failed - invalid signature' },
        { status: 400 }
      );
    }

    // Fetch payment details from Razorpay for additional verification
    const paymentDetails = await razorpay.payments.fetch(paymentId);

    if (paymentDetails.status !== 'captured') {
      return NextResponse.json(
        { error: 'Payment not captured' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Payment verified successfully',
        paymentId,
        orderId,
        amount: paymentDetails.amount,
        currency: paymentDetails.currency,
        status: paymentDetails.status,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
