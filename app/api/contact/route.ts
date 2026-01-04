import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // 1. Save to Firestore
    const inquiryRef = await adminDb.collection('contact_inquiries').add({
      name,
      email,
      subject,
      message,
      status: 'unread',
      createdAt: new Date(),
    });

    // 2. Send Acknowledgement Email
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_APP_PASSWORD;

    console.log('Email Debug:', {
      hasUser: !!emailUser,
      hasPass: !!emailPass,
      userPrefix: emailUser?.split('@')[0]
    });

    if (emailUser && emailPass) {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // Use STARTTLS
        auth: {
          user: emailUser,
          pass: emailPass,
        },
        logger: true,
        debug: true,
        tls: {
          rejectUnauthorized: false
        }
      });

      const acknowledgementHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #000; border-radius: 12px; overflow: hidden; background-color: #FFFDF5; box-shadow: 8px 8px 0px #000;">
          <div style="background-color: #6C5CE7; padding: 30px; text-align: center; border-bottom: 2px solid #000;">
            <h1 style="color: white; margin: 0; font-size: 32px; text-transform: uppercase; letter-spacing: -1px;">Joy Juncture</h1>
          </div>
          <div style="padding: 40px; color: #2D3436;">
            <h2 style="font-size: 24px; margin-top: 0;">Hello ${name},</h2>
            <p style="font-size: 16px; line-height: 1.6; font-weight: 500;">
              Thank you for reaching out to us! We've received your inquiry regarding "<strong>${subject}</strong>".
            </p>
            <div style="background-color: #FFD93D; padding: 20px; border: 2px solid #000; border-radius: 8px; margin: 25px 0; box-shadow: 4px 4px 0px #000;">
              <p style="margin: 0; font-weight: 800; font-size: 14px; text-transform: uppercase; opacity: 0.6;">Your Message:</p>
              <p style="margin: 10px 0 0 0; font-weight: 600; font-style: italic;">"${message}"</p>
            </div>
            <p style="font-size: 16px; line-height: 1.6; font-weight: 500;">
              Our team will review your message and get back to you as soon as possible.
            </p>
            <div style="margin-top: 30px; border-top: 1px solid rgba(0,0,0,0.1); pt: 20px;">
              <p style="margin: 0; font-weight: 800;">Best Regards,</p>
              <p style="margin: 5px 0 0 0; font-weight: 800; color: #6C5CE7;">The Joy Juncture Team</p>
            </div>
          </div>
          <div style="background-color: #2D3436; padding: 15px; text-align: center;">
            <p style="color: white; margin: 0; font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">© 2024 Joy Juncture Inc. • Play Responsibly</p>
          </div>
        </div>
      `;

      try {
        console.log('Attempting to send email to:', email);
        const info = await transporter.sendMail({
          from: `"Joy Juncture Support" <${emailUser}>`,
          to: email,
          subject: `We've received your inquiry: ${subject}`,
          html: acknowledgementHtml,
        });
        console.log('Email sent successfully:', info.messageId);
      } catch (emailError) {
        console.error('Nodemailer Error:', emailError);
        // We still return success since the info was saved to DB
      }
    } else {
      console.warn('Email skipped: Missing credentials in .env');
    }

    return NextResponse.json({
      success: true,
      message: 'Inquiry received successfully',
      id: inquiryRef.id
    });

  } catch (error: any) {
    console.error('Error handling contact submission:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
