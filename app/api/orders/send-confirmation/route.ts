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

        const itemsHtml = items.map((item: any) => `
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(0,0,0,0.1); padding: 10px 0;">
        <div style="font-weight: 800;">${item.product.name} (x${item.quantity})</div>
        <div style="font-weight: 800;">₹${(item.product.price * item.quantity).toFixed(2)}</div>
      </div>
    `).join('');

        const receiptHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 4px solid #000; border-radius: 20px; overflow: hidden; background-color: #FFFDF5; box-shadow: 12px 12px 0px #000;">
        <div style="background-color: #FFD93D; padding: 40px; text-align: center; border-bottom: 4px solid #000;">
          <h1 style="color: #000; margin: 0; font-size: 48px; text-transform: uppercase; letter-spacing: -2px; font-weight: 900;">JOY JUNCTURE</h1>
          <p style="margin: 10px 0 0 0; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; font-size: 14px;">Order Confirmation</p>
        </div>
        
        <div style="padding: 40px; color: #2D3436;">
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 28px; margin: 0; text-transform: uppercase; font-weight: 900;">THANK YOU, ${name}!</h2>
            <p style="font-size: 16px; font-weight: 700; margin-top: 5px; opacity: 0.6;">Your order #${orderId} has been confirmed.</p>
          </div>

          <div style="background-color: #fff; border: 3px solid #000; border-radius: 15px; padding: 25px; margin-bottom: 30px; box-shadow: 6px 6px 0px #000;">
            <h3 style="margin-top: 0; font-size: 18px; text-transform: uppercase; font-weight: 900; border-bottom: 3px solid #000; padding-bottom: 10px; margin-bottom: 15px;">Order Summary</h3>
            ${itemsHtml}
            <div style="display: flex; justify-content: space-between; margin-top: 20px; font-size: 24px;">
              <div style="font-weight: 900;">TOTAL PAID</div>
              <div style="font-weight: 900; color: #6C5CE7;">₹${totalPrice.toFixed(2)}</div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
            <div style="background-color: #A29BFE; border: 3px solid #000; border-radius: 15px; padding: 20px; box-shadow: 4px 4px 0px #000;">
              <h4 style="margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; font-weight: 900; opacity: 0.7;">Shipping To</h4>
              <p style="margin: 0; font-weight: 800; font-size: 14px; line-height: 1.4;">
                ${shippingAddress.name}<br>
                ${shippingAddress.address}<br>
                ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}
              </p>
            </div>
            <div style="background-color: #55EFC4; border: 3px solid #000; border-radius: 15px; padding: 20px; box-shadow: 4px 4px 0px #000;">
              <h4 style="margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; font-weight: 900; opacity: 0.7;">Delivery Est.</h4>
              <p style="margin: 0; font-weight: 800; font-size: 14px; line-height: 1.4;">
                3-5 Business Days
              </p>
            </div>
          </div>

          <div style="text-align: center; margin-top: 40px;">
            <p style="font-weight: 800; font-size: 14px; opacity: 0.5; text-transform: uppercase; margin-bottom: 20px;">Follow us for more updates</p>
            <div style="display: inline-block;">
                <span style="background: #000; color: #fff; padding: 10px 20px; border-radius: 10px; font-weight: 900; text-decoration: none; display: inline-block;">@JOYJUNCTURE</span>
            </div>
          </div>
        </div>

        <div style="background-color: #000; padding: 20px; text-align: center;">
          <p style="color: white; margin: 0; font-size: 10px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">© 2024 Joy Juncture Inc. • Play Smart, Play Fun</p>
        </div>
      </div>
    `;

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
