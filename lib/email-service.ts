
import nodemailer from 'nodemailer';
import { getBaseEmailTemplate } from './email-templates';
import { Logger } from '@/lib/logger';

interface EmailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

export const sendEmail = async ({ to, subject, text, html }: EmailOptions) => {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_APP_PASSWORD;

    if (!emailUser || !emailPass) {
        const msg = 'Email credentials not configured (EMAIL_USER/EMAIL_APP_PASSWORD).';
        Logger.warn(msg);
        return { success: false, error: msg };
    }

    // Create transporter inside the function to ensure process.env is ready
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // true for port 465
        auth: {
            user: emailUser,
            pass: emailPass,
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    try {
        const info = await transporter.sendMail({
            from: `"Joy Juncture Support" <${emailUser}>`,
            to,
            subject,
            text: text || '',
            html: html || getBaseEmailTemplate(subject, text || ''),
        });

        Logger.info(`Email sent successfully: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error: any) {
        Logger.error('SMTP Transmission Error:', error);
        return {
            success: false,
            error: error.message || 'Unknown SMTP error',
            code: error.code
        };
    }
};
