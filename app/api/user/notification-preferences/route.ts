import { getServerSession } from 'next-auth';
import { db } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function GET(request: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userPrefsRef = db.collection('userNotificationPreferences').doc(session.user.email);
    const userPrefs = await userPrefsRef.get();

    if (!userPrefs.exists) {
      // Return default preferences
      return Response.json({
        preferences: {
          pushEnabled: true,
          inAppEnabled: true,
          smsEnabled: true,
          categories: {
            promotional: true,
            offers: true,
            ordersShipping: true,
            gamification: true,
            announcements: true,
          },
          quietHours: {
            enabled: false,
            startTime: '22:00',
            endTime: '08:00',
            timezone: 'Asia/Kolkata',
          },
          frequency: 'all',
        },
      });
    }

    const prefs = userPrefs.data();
    return Response.json({
      preferences: {
        ...prefs,
        updatedAt: prefs?.updatedAt?.toDate?.(),
      },
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return Response.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const preferences = await request.json();

    await db.collection('userNotificationPreferences').doc(session.user.email).set({
      ...preferences,
      updatedAt: Timestamp.now(),
    }, { merge: true });

    return Response.json({
      success: true,
      message: 'Preferences updated',
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return Response.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
