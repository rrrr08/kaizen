import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      registrationId,
      email,
      name,
      eventTitle,
      eventDate,
      eventLocation,
      amount
    } = body;

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

    const formattedDate = eventDate ? new Date(eventDate).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : 'Date to be announced';

    const { getEventConfirmationTemplate } = await import('@/lib/email-templates');
    const ticketHtml = getEventConfirmationTemplate(registrationId, name, eventTitle, eventDate, eventLocation, amount);

    await transporter.sendMail({
      from: `"Joy Juncture Events" <${emailUser}>`,
      to: email,
      subject: `Ticket Confirmed: ${eventTitle}`,
      html: ticketHtml,
    });

    return NextResponse.json({ success: true, message: 'Confirmation email sent' });

  } catch (error: any) {
    console.error('Error sending confirmation email:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
