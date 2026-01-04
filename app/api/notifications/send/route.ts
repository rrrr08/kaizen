import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';
import twilio from 'twilio';

// Helper function to check if current time is within user's quiet hours
function isWithinQuietHours(quietHours?: { enabled: boolean; startTime: string; endTime: string; timezone: string }): boolean {
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
    const { title, message, type = 'info', actionUrl, recipientSegment = 'all', image, channels = ['push', 'in-app'], priority = 'normal' } = body;

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }

    if (!Array.isArray(channels) || channels.length === 0) {
      return NextResponse.json({ error: 'At least one notification channel must be selected' }, { status: 400 });
    }

    const sendPush = channels.includes('push');
    const sendInApp = channels.includes('in-app');
    const sendSMS = channels.includes('sms');

    // Get target users based on segment
    let usersSnapshot;
    
    if (recipientSegment !== 'all') {
      // Apply filters based on segment (e.g., tier level)
      usersSnapshot = await adminDb.collection('users')
        .where('tier', '==', recipientSegment)
        .get();
    } else {
      usersSnapshot = await adminDb.collection('users').get();
    }

    const userIds = usersSnapshot.docs.map(doc => doc.id);

    // Create in-app notifications if enabled
    let notificationCount = 0;
    let skippedDueToQuietHours = 0;
    if (sendInApp) {
      // Get user preferences to check if they have in-app notifications enabled
      const batch = adminDb.batch();

      for (const userId of userIds) {
        // Check user preferences
        const userPrefsDoc = await adminDb.collection('userNotificationPreferences').doc(userId).get();
        const userPrefs = userPrefsDoc.exists ? userPrefsDoc.data() : { inAppEnabled: true };

        // Skip if user has disabled in-app notifications
        if (userPrefs?.inAppEnabled === false) {
          continue;
        }

        // Check quiet hours for normal priority notifications
        if (priority === 'normal' && isWithinQuietHours(userPrefs?.quietHours)) {
          skippedDueToQuietHours++;
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

        notificationCount++;

        // Firestore batch has a limit of 500 operations
        if (notificationCount % 500 === 0) {
          await batch.commit();
        }
      }

      // Commit any remaining operations
      if (notificationCount % 500 !== 0) {
        await batch.commit();
      }
    }

    // Send FCM push notifications if enabled
    let pushSentCount = 0;
    let pushSkippedDueToQuietHours = 0;
    if (sendPush) {
      try {
        // Get user preferences to filter by pushEnabled
        const prefsSnapshot = await adminDb.collection('userNotificationPreferences').get();
        const userPrefsMap = new Map();
        prefsSnapshot.docs.forEach(doc => {
          userPrefsMap.set(doc.id, doc.data());
        });

        const tokensSnapshot = await adminDb.collection('userDeviceTokens')
          .where('isActive', '==', true)
          .get();

        // Filter tokens based on user push preferences and quiet hours
        const enabledTokens = tokensSnapshot.docs
          .filter(doc => {
            const userId = doc.data().userId;
            const userPrefs = userPrefsMap.get(userId);
            
            // Skip if push disabled
            if (userPrefs?.pushEnabled === false) {
              return false;
            }

            // Check quiet hours for normal priority
            if (priority === 'normal' && isWithinQuietHours(userPrefs?.quietHours)) {
              pushSkippedDueToQuietHours++;
              return false;
            }

            return true;
          })
          .map(doc => doc.data().deviceToken);

        if (enabledTokens.length > 0) {
          // FCM supports sending to up to 500 tokens at once
          const tokenBatches = [];
          for (let i = 0; i < enabledTokens.length; i += 500) {
            tokenBatches.push(enabledTokens.slice(i, i + 500));
          }

          for (const tokenBatch of tokenBatches) {
            const fcmMessage = {
              notification: {
                title,
                body: message,
                imageUrl: image || undefined,
              },
              data: {
                actionUrl: actionUrl || '/',
                type: type || 'info',
              },
              tokens: tokenBatch,
            };

            const response = await admin.messaging().sendEachForMulticast(fcmMessage);
            pushSentCount += response.successCount;

            // Log any failures
            if (response.failureCount > 0) {
              console.log(`Failed to send ${response.failureCount} push notifications`);
            }
          }
        }
      } catch (pushError) {
        console.error('Error sending push notifications:', pushError);
        // Don't fail the entire request if push fails
      }
    }

    // Send SMS notifications if enabled
    let smsSentCount = 0;
    let smsSkippedDueToQuietHours = 0;
    if (sendSMS) {
      try {
        // Initialize Twilio client
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

        if (!accountSid || !authToken || !twilioPhone) {
          console.error('Twilio credentials not configured');
        } else {
          const client = twilio(accountSid, authToken);

          // Get user preferences to filter by smsEnabled
          const prefsSnapshot = await adminDb.collection('userNotificationPreferences').get();
          const userPrefsMap = new Map();
          prefsSnapshot.docs.forEach(doc => {
            userPrefsMap.set(doc.id, doc.data());
          });

          // Get users with phone numbers
          const usersWithPhones: { phone: string; name: string; userId: string }[] = [];
          for (const userId of userIds) {
            const userDoc = await adminDb.collection('users').doc(userId).get();
            const user = userDoc.data();
            const userPrefs = userPrefsMap.get(userId);

            // Check if user has SMS enabled and has a verified phone number
            if (
              user?.phoneNumber &&
              user?.phoneVerified &&
              userPrefs?.smsEnabled !== false
            ) {
              // Check quiet hours for normal priority
              if (priority === 'normal' && isWithinQuietHours(userPrefs?.quietHours)) {
                smsSkippedDueToQuietHours++;
                continue;
              }

              usersWithPhones.push({
                phone: user.phoneNumber,
                name: user.displayName || user.firstName || 'User',
                userId
              });
            }
          }

          // Send SMS to each user (Twilio doesn't have batch API, send individually)
          for (const user of usersWithPhones) {
            try {
              const smsBody = `${title}\n\n${message}${actionUrl ? `\n\n${actionUrl}` : ''}`;
              
              await client.messages.create({
                body: smsBody,
                from: twilioPhone,
                to: user.phone
              });

              smsSentCount++;
            } catch (smsError) {
              console.error(`Failed to send SMS to ${user.phone}:`, smsError);
              // Continue with other users even if one fails
            }
          }
        }
      } catch (smsError) {
        console.error('Error sending SMS notifications:', smsError);
        // Don't fail the entire request if SMS fails
      }
    }

    return NextResponse.json({
      success: true,
      priority,
      notificationsSent: notificationCount,
      pushNotificationsSent: pushSentCount,
      smsNotificationsSent: smsSentCount,
      skippedDueToQuietHours: {
        inApp: skippedDueToQuietHours,
        push: pushSkippedDueToQuietHours,
        sms: smsSkippedDueToQuietHours,
        total: skippedDueToQuietHours + pushSkippedDueToQuietHours + smsSkippedDueToQuietHours
      },
      message: `Sent - In-app: ${notificationCount}, Push: ${pushSentCount}, SMS: ${smsSentCount}${
        priority === 'normal' 
          ? ` | Skipped (quiet hours): ${skippedDueToQuietHours + pushSkippedDueToQuietHours + smsSkippedDueToQuietHours}` 
          : ''
      }`
    });

  } catch (error: any) {
    console.error('Error sending notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
