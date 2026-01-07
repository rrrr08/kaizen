import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebaseAdmin';
import { sendNotifications } from '@/lib/notification-service';
import { Timestamp } from 'firebase-admin/firestore';

export async function GET(request: Request) {
    // Optional: Add a simple secret check if needed
    // Note: Vercel cron jobs don't send auth headers, so we check for CRON_SECRET in query params or headers
    const authHeader = request.headers.get('authorization');
    const url = new URL(request.url);
    const secretParam = url.searchParams.get('secret');
    
    if (process.env.CRON_SECRET) {
        const providedSecret = authHeader?.replace('Bearer ', '') || secretParam;
        if (providedSecret !== process.env.CRON_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    try {
        // Get current time in UTC (Firestore Timestamp)
        const now = Timestamp.now();

        // Find scheduled campaigns that are due (scheduledFor is stored as UTC Timestamp)
        // This query finds all campaigns where scheduledFor <= current time (UTC)
        const campaignsSnapshot = await adminDb.collection('pushCampaigns')
            .where('status', '==', 'scheduled')
            .where('scheduledFor', '<=', now)
            .get();

        if (campaignsSnapshot.empty) {
            return NextResponse.json({ message: 'No scheduled campaigns due' });
        }

        const processedCampaigns = [];

        for (const doc of campaignsSnapshot.docs) {
            const campaign = doc.data();
            const campaignId = doc.id;

            try {
                // Mark as processing to avoid duplicate runs
                await doc.ref.update({ status: 'processing', updatedAt: now });

                const results = await sendNotifications({
                    title: campaign.title,
                    message: campaign.message,
                    type: campaign.actionType || 'info', // Using actionType as notification type
                    actionUrl: campaign.actionUrl,
                    image: campaign.image,
                    recipientSegment: campaign.recipientSegment,
                    channels: campaign.channels || ['push', 'in-app'],
                    priority: campaign.priority || 'normal'
                });

                // Update campaign status to sent
                await doc.ref.update({
                    status: 'sent',
                    sentAt: now,
                    updatedAt: now,
                    deliveredCount: results.pushSentCount,
                    // You could add more detailed stats here
                });

                // Update the legacy 'campaigns' collection record for the UI
                const legacySnapshot = await adminDb.collection('campaigns')
                    .where('pushCampaignId', '==', campaignId)
                    .limit(1)
                    .get();

                if (!legacySnapshot.empty) {
                    await legacySnapshot.docs[0].ref.update({
                        status: 'sent',
                        deliveredCount: results.pushSentCount,
                        sentAt: now.toDate().toISOString() // Convert to ISO string for UI compatibility
                    });
                } else {
                    // If no legacy record found, try to find by title and scheduledFor as fallback
                    console.warn(`No legacy campaign found for pushCampaignId: ${campaignId}, trying fallback search`);
                    const fallbackSnapshot = await adminDb.collection('campaigns')
                        .where('title', '==', campaign.title)
                        .where('status', '==', 'scheduled')
                        .limit(1)
                        .get();
                    
                    if (!fallbackSnapshot.empty) {
                        await fallbackSnapshot.docs[0].ref.update({
                            status: 'sent',
                            deliveredCount: results.pushSentCount,
                            sentAt: now.toDate().toISOString(),
                            pushCampaignId: campaignId // Link them for future updates
                        });
                    }
                }

                processedCampaigns.push({
                    id: campaignId,
                    title: campaign.title,
                    status: 'success',
                    results
                });
            } catch (campaignError: any) {
                console.error(`Error processing campaign ${campaignId}:`, campaignError);
                await doc.ref.update({
                    status: 'failed',
                    error: campaignError.message,
                    updatedAt: now
                });
                processedCampaigns.push({
                    id: campaignId,
                    status: 'failed',
                    error: campaignError.message
                });
            }
        }

        return NextResponse.json({
            success: true,
            processed: processedCampaigns.length,
            details: processedCampaigns
        });

    } catch (error: any) {
        console.error('Cron job error:', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
