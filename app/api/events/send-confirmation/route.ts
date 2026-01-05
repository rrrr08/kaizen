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

        const ticketHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 4px solid #000; border-radius: 20px; overflow: hidden; background-color: #FFFDF5; box-shadow: 12px 12px 0px #000;">
        <!-- Header -->
        <div style="background-color: #6C5CE7; padding: 40px; text-align: center; border-bottom: 4px solid #000;">
          <h1 style="color: #fff; margin: 0; font-size: 32px; text-transform: uppercase; letter-spacing: -1px; font-weight: 900; text-shadow: 3px 3px 0px #000;">Event Registration</h1>
          <p style="margin: 10px 0 0 0; color: #fff; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; font-size: 14px;">Confirmed & Verified</p>
        </div>
        
        <div style="padding: 40px; color: #2D3436;">
          <div style="margin-bottom: 30px; text-align: center;">
            <h2 style="font-size: 24px; margin: 0; text-transform: uppercase; font-weight: 900;">Hello, ${name}!</h2>
            <p style="font-size: 16px; font-weight: 700; margin-top: 5px; opacity: 0.6;">You are going to...</p>
          </div>

          <!-- Event Card -->
          <div style="background-color: #fff; border: 3px solid #000; border-radius: 15px; overflow: hidden; margin-bottom: 30px; box-shadow: 6px 6px 0px #000;">
            <div style="background-color: #FFD93D; padding: 15px; border-bottom: 3px solid #000;">
                <h3 style="margin: 0; font-size: 20px; text-transform: uppercase; font-weight: 900; color: #000;">${eventTitle}</h3>
            </div>
            <div style="padding: 25px;">
                <div style="margin-bottom: 15px;">
                    <p style="margin: 0; font-size: 12px; font-weight: 900; text-transform: uppercase; color: #b2bec3; letter-spacing: 1px;">When</p>
                    <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: 800; color: #2d3436;">${formattedDate}</p>
                </div>
                <div style="margin-bottom: 15px;">
                    <p style="margin: 0; font-size: 12px; font-weight: 900; text-transform: uppercase; color: #b2bec3; letter-spacing: 1px;">Where</p>
                    <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: 800; color: #2d3436;">${eventLocation || 'Location to be announced'}</p>
                </div>
                <div>
                    <p style="margin: 0; font-size: 12px; font-weight: 900; text-transform: uppercase; color: #b2bec3; letter-spacing: 1px;">Registration ID</p>
                    <p style="margin: 5px 0 0 0; font-family: monospace; font-size: 16px; font-weight: 800; color: #6C5CE7;">${registrationId}</p>
                </div>
            </div>
          </div>

          <!-- Ticket Details -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
            <div style="background-color: #00B894; border: 3px solid #000; border-radius: 15px; padding: 20px; box-shadow: 4px 4px 0px #000;">
              <h4 style="margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; font-weight: 900; color: #fff;">Status</h4>
              <p style="margin: 0; font-weight: 900; font-size: 18px; color: #fff;">CONFIRMED</p>
            </div>
            <div style="background-color: #FF7675; border: 3px solid #000; border-radius: 15px; padding: 20px; box-shadow: 4px 4px 0px #000;">
              <h4 style="margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; font-weight: 900; color: #fff;">Amount Paid</h4>
              <p style="margin: 0; font-weight: 900; font-size: 18px; color: #fff;">₹${amount}</p>
            </div>
          </div>

          <div style="text-align: center; margin-top: 40px;">
            <p style="font-weight: 800; font-size: 14px; opacity: 0.5; text-transform: uppercase; margin-bottom: 20px;">Present this email at the venue</p>
            <div style="display: inline-block;">
                <span style="background: #000; color: #fff; padding: 10px 20px; border-radius: 10px; font-weight: 900; text-decoration: none; display: inline-block;">JOY JUNCTURE EVENTS</span>
            </div>
          </div>
        </div>

        <div style="background-color: #000; padding: 20px; text-align: center;">
          <p style="color: white; margin: 0; font-size: 10px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">© 2024 Joy Juncture Inc. • Play Smart, Play Fun</p>
        </div>
      </div>
    `;

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
