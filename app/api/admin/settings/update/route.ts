import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/app/api/auth/firebase-admin';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    // Verify admin token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.substring(7);
    const decodedClaims = await adminAuth.verifyIdToken(idToken);

    // Check if user is admin
    const userRef = doc(adminDb, 'users', decodedClaims.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists() || userSnap.data()?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();

    // Save settings to Firestore
    const settingsRef = doc(adminDb, 'admin_settings', 'configuration');
    await setDoc(settingsRef, {
      ...body,
      updatedAt: new Date(),
      updatedBy: decodedClaims.uid,
    }, { merge: true });

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
