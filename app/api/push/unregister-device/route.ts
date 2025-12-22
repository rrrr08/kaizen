import { getServerSession } from 'next-auth';
import { db } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { deviceId } = await request.json();

    if (!deviceId) {
      return Response.json({ error: 'Device ID is required' }, { status: 400 });
    }

    // Verify ownership and deactivate
    const deviceRef = db.collection('userDeviceTokens').doc(deviceId);
    const device = await deviceRef.get();

    if (!device.exists || device.data()?.userEmail !== session.user.email) {
      return Response.json({ error: 'Device not found' }, { status: 404 });
    }

    await deviceRef.update({
      isActive: false,
      deactivatedAt: Timestamp.now(),
    });

    return Response.json({ success: true, message: 'Device unregistered' });
  } catch (error) {
    console.error('Error unregistering device:', error);
    return Response.json(
      { error: 'Failed to unregister device' },
      { status: 500 }
    );
  }
}
