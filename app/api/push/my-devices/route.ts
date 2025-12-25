import { getServerSession } from 'next-auth';
import { db } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function GET(request: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const devices = await db
      .collection('userDeviceTokens')
      .where('userEmail', '==', session.user.email)
      .where('isActive', '==', true)
      .get();

    const deviceList = devices.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      registeredAt: doc.data().registeredAt?.toDate?.(),
      lastUsedAt: doc.data().lastUsedAt?.toDate?.(),
    }));

    return Response.json({ devices: deviceList });
  } catch (error) {
    console.error('Error fetching devices:', error);
    return Response.json({ error: 'Failed to fetch devices' }, { status: 500 });
  }
}
