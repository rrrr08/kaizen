import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { completeRegistration } from '@/lib/db/payments';

export async function POST(request: NextRequest) {
  try {
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
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Payment verification failed' },
        { status: 400 }
      );
    }

    // If event registration details provided, complete registration
    if (eventId && userId && orderId) {
      const result = await completeRegistration(
        eventId,
        userId,
        orderId,
        amount || 0,
        walletPointsUsed || 0
      );

      return NextResponse.json({
        success: result.success,
        message: result.message,
        registrationId: result.registrationId,
        waitlisted: result.waitlisted,
      });
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
