import { adminDb, adminAuth } from './firebaseAdmin';
import * as admin from 'firebase-admin';
import twilio from 'twilio';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

// Helper function to check if current time is within user's quiet hours
export function isWithinQuietHours(quietHours?: { enabled: boolean; startTime: string; endTime: string; timezone: string }): boolean {
    if (!quietHours || !quietHours.enabled) {
        return false;
    }

    try {
        const now = new Date();
        const userTimezone = quietHours.timezone || 'UTC';

        // Get current time in user's timezone
        const currentTimeStr = now.toLocaleTimeString('en-US', {
            timeZone: userTimezone,
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        });

        const [currentHour, currentMinute] = currentTimeStr.split(':').map(Number);
        const currentMinutes = currentHour * 60 + currentMinute;

        // Parse quiet hours
        const [startHour, startMinute] = quietHours.startTime.split(':').map(Number);
        const startMinutes = startHour * 60 + startMinute;

        const [endHour, endMinute] = quietHours.endTime.split(':').map(Number);
        const endMinutes = endHour * 60 + endMinute;

        // Handle quiet hours that span midnight (e.g., 22:00 to 08:00)
        if (startMinutes > endMinutes) {
            return currentMinutes >= startMinutes || currentMinutes < endMinutes;
        } else {
            return currentMinutes >= startMinutes && currentMinutes < endMinutes;
        }
    } catch (error) {
        console.error('Error checking quiet hours:', error);
        return false;
    }
}

export interface SendNotificationOptions {
    title: string;
    message: string;
    type?: string;
    actionUrl?: string;
    image?: string;
    recipientSegment: string;
    channels: string[];
    priority?: 'high' | 'normal';
    userIds?: string[]; // Optional specific users
}

export async function sendNotifications(options: SendNotificationOptions) {
    const {
        title,
        message,
        type = 'info',
        actionUrl,
        recipientSegment,
        image,
        channels,
        priority = 'normal',
        userIds: specificUserIds
    } = options;

    const sendPush = channels.includes('push');
    const sendInApp = channels.includes('in-app');
    const sendSMS = channels.includes('sms');

    // Get target users based on segment if not provided
    let userIds = specificUserIds;

    if (!userIds) {
        let query: any = adminDb.collection('users');

        if (recipientSegment === 'first-time') {
            query = query.where('isFirstTimeCustomer', '==', true);
        } else if (recipientSegment === 'loyal') {
            query = query.where('currentLevel', '>=', 3);
        } else if (recipientSegment === 'inactive') {
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            query = query.where('lastPurchaseAt', '<', Timestamp.fromDate(thirtyDaysAgo));
        } else if (recipientSegment !== 'all') {
            // Fallback to tier-based filtering if it doesn't match above special segments
            query = query.where('tier', '==', recipientSegment);
        }

        const usersSnapshot = await query.get();
        userIds = usersSnapshot.docs.map((doc: any) => doc.id);
    }

    if (!userIds) return { notificationCount: 0, pushSentCount: 0, smsSentCount: 0, skippedDueToQuietHours: { inApp: 0, push: 0, sms: 0 } };

    const results = {
        notificationCount: 0,
        pushSentCount: 0,
        smsSentCount: 0,
        skippedDueToQuietHours: {
            inApp: 0,
            push: 0,
            sms: 0
        }
    };

    // 1. Create in-app notifications if enabled
    if (sendInApp) {
        const batch = adminDb.batch();
        let currentBatchCount = 0;

        for (const userId of userIds) {
            const userPrefsDoc = await adminDb.collection('userNotificationPreferences').doc(userId).get();
            const userPrefs = userPrefsDoc.exists ? userPrefsDoc.data() : { inAppEnabled: true };

            if (userPrefs?.inAppEnabled === false) continue;

            if (priority === 'normal' && isWithinQuietHours(userPrefs?.quietHours)) {
                results.skippedDueToQuietHours.inApp++;
                continue;
            }

            const notificationRef = adminDb
                .collection('users')
                .doc(userId)
                .collection('notifications')
                .doc();

            batch.set(notificationRef, {
                title,
                message,
                type,
                actionUrl: actionUrl || null,
                image: image || null,
                read: false,
                createdAt: FieldValue.serverTimestamp(),
                dismissed: false
            });

            results.notificationCount++;
            currentBatchCount++;

            if (currentBatchCount === 500) {
                await batch.commit();
                currentBatchCount = 0;
            }
        }

        if (currentBatchCount > 0) {
            await batch.commit();
        }
    }

    // 2. Send FCM push notifications if enabled
    if (sendPush) {
        try {
            const prefsSnapshot = await adminDb.collection('userNotificationPreferences').get();
            const userPrefsMap = new Map();
            prefsSnapshot.docs.forEach(doc => {
                userPrefsMap.set(doc.id, doc.data());
            });

            const tokensSnapshot = await adminDb.collection('userDeviceTokens')
                .where('isActive', '==', true)
                .get();

            const enabledTokens = tokensSnapshot.docs
                .filter((doc: any) => {
                    const userId = doc.data().userId;
                    // Only include if user is in our target list
                    if (!userIds.includes(userId)) return false;

                    const userPrefs = userPrefsMap.get(userId);
                    if (userPrefs?.pushEnabled === false) return false;

                    if (priority === 'normal' && isWithinQuietHours(userPrefs?.quietHours)) {
                        results.skippedDueToQuietHours.push++;
                        return false;
                    }
                    return true;
                })
                .map(doc => doc.data().deviceToken);

            if (enabledTokens.length > 0) {
                for (let i = 0; i < enabledTokens.length; i += 500) {
                    const tokenBatch = enabledTokens.slice(i, i + 500);
                    const fcmMessage = {
                        notification: { title, body: message, imageUrl: image || undefined },
                        data: { actionUrl: actionUrl || '/', type: type || 'info' },
                        tokens: tokenBatch,
                    };
                    const response = await admin.messaging().sendEachForMulticast(fcmMessage);
                    results.pushSentCount += response.successCount;
                }
            }
        } catch (pushError) {
            console.error('Error sending push notifications:', pushError);
        }
    }

    // 3. Send SMS notifications if enabled
    if (sendSMS) {
        try {
            const accountSid = process.env.TWILIO_ACCOUNT_SID;
            const authToken = process.env.TWILIO_AUTH_TOKEN;
            const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

            if (accountSid && authToken && twilioPhone) {
                const client = twilio(accountSid, authToken);
                const prefsSnapshot = await adminDb.collection('userNotificationPreferences').get();
                const userPrefsMap = new Map();
                prefsSnapshot.docs.forEach(doc => userPrefsMap.set(doc.id, doc.data()));

                for (const userId of userIds) {
                    const userDoc = await adminDb.collection('users').doc(userId).get();
                    const user = userDoc.data();
                    const userPrefs = userPrefsMap.get(userId);

                    if (user?.phoneNumber && user?.phoneVerified && userPrefs?.smsEnabled !== false) {
                        if (priority === 'normal' && isWithinQuietHours(userPrefs?.quietHours)) {
                            results.skippedDueToQuietHours.sms++;
                            continue;
                        }

                        try {
                            const smsBody = `${title}\n\n${message}${actionUrl ? `\n\n${actionUrl}` : ''}`;
                            await client.messages.create({ body: smsBody, from: twilioPhone, to: user.phone });
                            results.smsSentCount++;
                        } catch (err) {
                            console.error(`Failed to send SMS to ${user.phone}:`, err);
                        }
                    }
                }
            }
        } catch (smsError) {
            console.error('Error sending SMS notifications:', smsError);
        }
    }

    return results;
}
