
import nodemailer from 'nodemailer';
import { getBaseEmailTemplate } from './email-templates';

interface EmailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_APP_PASSWORD;

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: emailUser,
        pass: emailPass,
    },
    tls: {
        rejectUnauthorized: false
    }
});

export const sendEmail = async ({ to, subject, text, html }: EmailOptions) => {
    if (!emailUser || !emailPass) {
        console.warn('Email credentials not configured (EMAIL_USER/EMAIL_APP_PASSWORD). Skipping email.');
        return false;
    }

    try {
        const info = await transporter.sendMail({
            from: `"Joy Juncture Support" <${emailUser}>`,
            to,
            subject,
            text: text || '',
            html: html || getBaseEmailTemplate(subject, text || ''),
        });

        console.log(`Email sent: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};
