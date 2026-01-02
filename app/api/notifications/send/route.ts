import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';

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
    const { title, message, type = 'info', actionUrl, recipientSegment = 'all', image } = body;

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }

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

    // Create notification for each user
    const batch = adminDb.batch();
    let notificationCount = 0;

    for (const userId of userIds) {
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

    // Send FCM push notifications to all users' devices
    let pushSentCount = 0;
    try {
      const tokensSnapshot = await adminDb.collection('userDeviceTokens')
        .where('isActive', '==', true)
        .get();

      const tokens = tokensSnapshot.docs.map(doc => doc.data().deviceToken);

      if (tokens.length > 0) {
        // FCM supports sending to up to 500 tokens at once
        const tokenBatches = [];
        for (let i = 0; i < tokens.length; i += 500) {
          tokenBatches.push(tokens.slice(i, i + 500));
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

    return NextResponse.json({
      success: true,
      notificationsSent: notificationCount,
      pushNotificationsSent: pushSentCount,
      message: `In-app notifications sent to ${notificationCount} users, push notifications sent to ${pushSentCount} devices`
    });

  } catch (error: any) {
    console.error('Error sending notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
