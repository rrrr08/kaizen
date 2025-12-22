import { getServerSession } from 'next-auth';
import { db } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const userDoc = await db.collection('users').doc(session.user.email).get();
    if (!userDoc.exists || userDoc.data()?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      message,
      image,
      icon,
      actionUrl,
      actionType = 'navigate',
      recipientSegment = 'all',
      customFilters,
      scheduledFor,
      priority = 'normal',
    } = body;

    // Validate required fields
    if (!title || !message) {
      return Response.json(
        { error: 'Title and message are required' },
        { status: 400 }
      );
    }

    // Validate length constraints
    if (title.length > 65) {
      return Response.json(
        { error: 'Title must be 65 characters or less' },
        { status: 400 }
      );
    }

    if (message.length > 240) {
      return Response.json(
        { error: 'Message must be 240 characters or less' },
        { status: 400 }
      );
    }

    // Get recipient count based on segment
    let query: any = db.collection('users');

    if (recipientSegment === 'first-time') {
      query = query.where('isFirstTimeCustomer', '==', true);
    } else if (recipientSegment === 'loyal') {
      query = query.where('currentLevel', '>=', 3);
    } else if (recipientSegment === 'inactive') {
      // Last purchase more than 30 days ago
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      query = query.where('lastPurchaseAt', '<', Timestamp.fromDate(thirtyDaysAgo));
    } else if (recipientSegment === 'custom' && customFilters) {
      if (customFilters.minSpending) {
        query = query.where('totalSpent', '>=', customFilters.minSpending);
      }
      if (customFilters.maxSpending) {
        query = query.where('totalSpent', '<=', customFilters.maxSpending);
      }
      if (customFilters.purchaseCount) {
        query = query.where('purchaseCount', '>=', customFilters.purchaseCount);
      }
      if (customFilters.levels && customFilters.levels.length > 0) {
        query = query.where('currentLevel', 'in', customFilters.levels);
      }
    }

    const recipientSnapshot = await query.get();
    const recipientCount = recipientSnapshot.size;

    if (recipientCount === 0) {
      return Response.json(
        { error: 'No recipients found for this segment' },
        { status: 400 }
      );
    }

    // Create campaign
    const campaignRef = await db.collection('pushCampaigns').add({
      title,
      message,
      description: body.description || '',
      image: image || null,
      icon: icon || null,
      actionUrl: actionUrl || null,
      actionType,
      recipientSegment,
      customFilters: customFilters || null,
      scheduledFor: scheduledFor ? Timestamp.fromDate(new Date(scheduledFor)) : null,
      status: scheduledFor ? 'scheduled' : 'sent',
      sentAt: scheduledFor ? null : Timestamp.now(),
      priority,
      ttl: body.ttl || 86400, // 24 hours default
      recipientCount,
      deliveredCount: 0,
      failedCount: 0,
      interactionCount: 0,
      createdBy: session.user.email,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // If not scheduled, send immediately
    if (!scheduledFor) {
      // Queue the campaign for sending
      await queueCampaignForSending(campaignRef.id, recipientSnapshot.docs);
    }

    return Response.json({
      success: true,
      campaignId: campaignRef.id,
      recipientCount,
      message: scheduledFor
        ? `Campaign scheduled for ${new Date(scheduledFor).toLocaleString()}`
        : `Campaign sent to ${recipientCount} recipients`,
    });
  } catch (error) {
    console.error('Campaign creation error:', error);
    return Response.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}

async function queueCampaignForSending(
  campaignId: string,
  recipientDocs: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>[]
) {
  try {
    const campaignRef = db.collection('pushCampaigns').doc(campaignId);
    const campaignData = (await campaignRef.get()).data();

    if (!campaignData) return;

    // Create push activity records for each recipient
    const batch = db.batch();
    let batchCount = 0;

    for (const userDoc of recipientDocs) {
      const userDevices = await db
        .collection('userDeviceTokens')
        .where('userEmail', '==', userDoc.id)
        .where('isActive', '==', true)
        .get();

      for (const deviceDoc of userDevices.docs) {
        const activityRef = db.collection('pushActivities').doc();
        batch.set(activityRef, {
          campaignId,
          userEmail: userDoc.id,
          deviceId: deviceDoc.id,
          deviceToken: deviceDoc.data().deviceToken,
          status: 'queued',
          createdAt: Timestamp.now(),
        });

        batchCount++;

        // Commit batch every 500 writes
        if (batchCount === 500) {
          await batch.commit();
          batchCount = 0;
        }
      }
    }

    // Commit remaining
    if (batchCount > 0) {
      await batch.commit();
    }

    console.log(`Queued ${batchCount} push notifications for campaign ${campaignId}`);
  } catch (error) {
    console.error('Error queuing campaign for sending:', error);
  }
}
