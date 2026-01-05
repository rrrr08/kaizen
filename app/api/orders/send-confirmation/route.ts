import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, email, name, items, totalPrice, shippingAddress } = body;

    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_APP_PASSWORD;

    if (!emailUser || !emailPass) {
      console.warn('Email skipped: Missing credentials in .env');
      return NextResponse.json({ success: true, message: 'Email skipped (no credentials)' });
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const { getOrderConfirmationTemplate } = await import('@/lib/email-templates');
    const receiptHtml = getOrderConfirmationTemplate(orderId, name, items, totalPrice, shippingAddress);

    await transporter.sendMail({
      from: `"Joy Juncture Shop" <${emailUser}>`,
      to: email,
      subject: `Order Confirmed: #${orderId}`,
      html: receiptHtml,
    });

    return NextResponse.json({ success: true, message: 'Confirmation email sent' });

  } catch (error: any) {
    console.error('Error sending confirmation email:', error);
    return NextResponse.json({ error: 'Failed to send email', details: error.message }, { status: 500 });
  }
}
