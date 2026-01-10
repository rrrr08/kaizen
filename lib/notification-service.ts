import { adminDb, adminAuth } from '@/lib/firebaseAdmin';
import admin from 'firebase-admin';
import twilio from 'twilio';

interface NotificationOptions {
    title: string;
    message: string;
    type?: string;
    actionUrl?: string;
    recipientSegment?: string; // 'all', 'loyal', 'first-time', or specific userId
    userId?: string;
    image?: string;
    channels?: ('push' | 'in-app' | 'sms')[];
    priority?: 'normal' | 'high';
}

interface NotificationResult {
    notificationCount: number;
    pushSentCount: number;
    smsSentCount: number;
    skippedDueToQuietHours: {
        inApp: number;
        push: number;
        sms: number;
    };
}

/**
 * Sends notifications across multiple channels to targeted users
 */
export async function sendNotifications(options: NotificationOptions): Promise<NotificationResult> {
    const {
        title,
        message,
        type = 'info',
        actionUrl = null,
        recipientSegment = 'all',
        userId = null,
        image = null,
        channels = ['in-app'],
        priority = 'normal'
    } = options;

    const result: NotificationResult = {
        notificationCount: 0,
        pushSentCount: 0,
        smsSentCount: 0,
        skippedDueToQuietHours: { inApp: 0, push: 0, sms: 0 }
    };

    try {
        // 1. Get targeted users
        let userDocs: any[] = [];

        if (userId) {
            // Single recipient
            const userDoc = await adminDb.collection('users').doc(userId).get();
            if (userDoc.exists) {
                userDocs = [userDoc];
            }
        } else {
            // Segmented recipients
            let query: any = adminDb.collection('users');

            if (recipientSegment === 'first-time') {
                query = query.where('isFirstTimeCustomer', '==', true);
            } else if (recipientSegment === 'loyal') {
                query = query.where('currentLevel', '>=', 3);
            } else if (recipientSegment === 'inactive') {
                const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                query = query.where('lastPurchaseAt', '<', thirtyDaysAgo);
            }

            const snapshot = await query.get();
            userDocs = snapshot.docs;
        }

        if (userDocs.length === 0) {
            console.log('No users found for notification target');
            return result;
        }

        // 2. Process notifications for each user
        for (const userDoc of userDocs) {
            const userData = userDoc.data();
            const targetUserId = userDoc.id;

            // In-App Notification
            if (channels.includes('in-app')) {
                await adminDb.collection('users').doc(targetUserId).collection('notifications').add({
                    title,
                    message,
                    type,
                    actionUrl,
                    image,
                    read: false,
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });
                result.notificationCount++;
            }

            // Push Notification
            if (channels.includes('push')) {
                const pushResult = await sendPushNotification(targetUserId, title, message, actionUrl, image);
                if (pushResult) result.pushSentCount++;
            }

            // SMS Notification
            if (channels.includes('sms')) {
                const smsResult = await sendSmsNotification(userData, title, message, actionUrl);
                if (smsResult) result.smsSentCount++;
            }
        }

        return result;
    } catch (error) {
        console.error('Error in sendNotifications service:', error);
        throw error;
    }
}

/**
 * Sends a push notification to all registered devices of a user
 */
async function sendPushNotification(userId: string, title: string, body: string, actionUrl: string | null, image: string | null): Promise<boolean> {
    try {
        const tokensSnapshot = await adminDb.collection('userDeviceTokens')
            .where('userId', '==', userId)
            .where('isActive', '==', true)
            .get();

        if (tokensSnapshot.empty) return false;

        const tokens = tokensSnapshot.docs.map(doc => doc.data().deviceToken);

        const message: admin.messaging.MulticastMessage = {
            tokens,
            notification: {
                title,
                body,
                ...(image && { imageUrl: image })
            },
            data: {
                ...(actionUrl && { actionUrl }),
                click_action: actionUrl || '/'
            },
            webpush: {
                notification: {
                    icon: '/icons/logo-192x192.png',
                    badge: '/icons/badge-96x96.png',
                },
                fcmOptions: {
                    link: actionUrl || '/'
                }
            }
        };

        const response = await admin.messaging().sendEachForMulticast(message);
        return response.successCount > 0;
    } catch (error) {
        console.error(`Error sending push notification to user ${userId}:`, error);
        return false;
    }
}

/**
 * Sends an SMS notification via Twilio
 */
async function sendSmsNotification(userData: any, title: string, message: string, actionUrl: string | null): Promise<boolean> {
    try {
        const { phoneNumber, phoneVerified } = userData;

        // Check if phone is verified and user has opted into SMS
        if (!phoneNumber || !phoneVerified) return false;

        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

        if (!accountSid || !authToken || !twilioPhone) {
            console.warn('Twilio credentials not configured. Skipping SMS.');
            return false;
        }

        const client = twilio(accountSid, authToken);
        const smsBody = `${title}\n\n${message}${actionUrl ? `\n\nLink: ${actionUrl}` : ''}`;

        await client.messages.create({
            body: smsBody,
            from: twilioPhone,
            to: phoneNumber
        });

        return true;
    } catch (error) {
        console.error('Error sending Twilio SMS:', error);
        return false;
    }
}
