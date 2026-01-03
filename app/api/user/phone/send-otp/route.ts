import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import twilio from 'twilio';

// Store OTPs temporarily (in production, use Redis or Firestore with TTL)
const otpStore = new Map<string, { otp: string; expiresAt: number; attempts: number }>();

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const authorization = req.headers.get('authorization');
    
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authorization.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const body = await req.json();
    const { phoneNumber } = body;

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Validate phone number format (basic E.164 validation)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json({ 
        error: 'Invalid phone number format. Use E.164 format (e.g., +1234567890)' 
      }, { status: 400 });
    }

    // Check if phone number is already verified by another user
    const existingUser = await adminDb.collection('users')
      .where('phoneNumber', '==', phoneNumber)
      .where('phoneVerified', '==', true)
      .get();

    if (!existingUser.empty && existingUser.docs[0].id !== userId) {
      return NextResponse.json({ 
        error: 'This phone number is already verified by another account' 
      }, { status: 409 });
    }

    // Initialize Twilio
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioPhone) {
      console.error('Twilio credentials not configured');
      return NextResponse.json({ 
        error: 'SMS service not configured' 
      }, { status: 500 });
    }

    const client = twilio(accountSid, authToken);

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP
    otpStore.set(phoneNumber, { otp, expiresAt, attempts: 0 });

    // Send SMS
    try {
      await client.messages.create({
        body: `Your verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nDo not share this code with anyone.`,
        from: twilioPhone,
        to: phoneNumber
      });

      // Update user's phone number (not verified yet)
      await adminDb.collection('users').doc(userId).set({
        phoneNumber,
        phoneVerified: false,
        phoneUpdatedAt: new Date()
      }, { merge: true });

      return NextResponse.json({
        success: true,
        message: 'OTP sent successfully',
        expiresIn: 600 // seconds
      });

    } catch (twilioError: any) {
      console.error('Twilio SMS error:', twilioError);
      return NextResponse.json({ 
        error: 'Failed to send SMS. Please check your phone number.' 
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error sending OTP:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
