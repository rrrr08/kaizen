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

      const { getBaseEmailTemplate } = await import('@/lib/email-templates');
      const acknowledgementHtml = getBaseEmailTemplate(
        `We've received your inquiry: ${subject}`,
        `Hello ${name},<br><br>Thank you for reaching out to us! We've received your message and our team will get back to you shortly.<br><br><div style="background:white; border:2px solid black; padding:15px; box-shadow:4px 4px 0px black;"><strong>Your Message:</strong><br><br><i>${message}</i></div>`
      );

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
