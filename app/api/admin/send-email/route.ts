import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const authorization = req.headers.get('authorization');
    
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authorization.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Check if user is admin
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();
    
    if (!userData?.isAdmin && userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { subject, message, htmlContent, recipientSegment = 'all' } = body;

    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
    }

    // Check email configuration
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_APP_PASSWORD;

    if (!emailUser || !emailPass) {
      console.error('Email credentials not configured');
      return NextResponse.json({ 
        error: 'Email service not configured. Please add EMAIL_USER and EMAIL_APP_PASSWORD to environment variables.' 
      }, { status: 500 });
    }

    // Create transporter with explicit port 587 and STARTTLS
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // use STARTTLS
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      tls: {
        rejectUnauthorized: false // Allow self-signed certificates (for development)
      }
    });

    // Get users based on segment
    let usersSnapshot;
    
    if (recipientSegment !== 'all') {
      usersSnapshot = await adminDb.collection('users')
        .where('tier', '==', recipientSegment)
        .get();
    } else {
      usersSnapshot = await adminDb.collection('users').get();
    }

    const users = usersSnapshot.docs
      .map(doc => doc.data())
      .filter(user => user.email);

    if (users.length === 0) {
      return NextResponse.json({ 
        error: 'No users found with email addresses' 
      }, { status: 400 });
    }

    // Prepare email content
    const emailHtml = htmlContent || `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #6C5CE7; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">GWOC</h1>
        </div>
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #2D3436;">${subject}</h2>
          <div style="background-color: white; padding: 20px; border-radius: 8px; border: 2px solid #000; box-shadow: 4px 4px 0px #000;">
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>
        <div style="background-color: #2D3436; padding: 20px; text-align: center;">
          <p style="color: white; margin: 0; font-size: 12px;">© ${new Date().getFullYear()} GWOC. All rights reserved.</p>
        </div>
      </div>
    `;

    // Send emails (batch sending)
    let sentCount = 0;
    let failedCount = 0;

    for (const user of users) {
      try {
        await transporter.sendMail({
          from: `"GWOC" <${emailUser}>`,
          to: user.email,
          subject: subject,
          text: message,
          html: emailHtml,
        });
        sentCount++;
      } catch (emailError) {
        console.error(`Failed to send email to ${user.email}:`, emailError);
        failedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      emailsSent: sentCount,
      emailsFailed: failedCount,
      totalRecipients: users.length,
      message: `Emails sent to ${sentCount} users${failedCount > 0 ? `, ${failedCount} failed` : ''}`
    });

  } catch (error: any) {
    console.error('Error sending emails:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}
