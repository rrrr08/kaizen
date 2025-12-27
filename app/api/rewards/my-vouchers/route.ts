import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';

// GET /api/rewards/my-vouchers - Get user's redeemed vouchers
export async function GET(req: NextRequest) {
  try {
    const authorization = req.headers.get('authorization');
    
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authorization.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userUid = decodedToken.uid;

    // Fetch user's vouchers
    const vouchersSnap = await adminDb
      .collection('vouchers')
      .where('userId', '==', userUid)
      .orderBy('redeemedAt', 'desc')
      .get();

    const vouchers = vouchersSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ vouchers });

  } catch (error: any) {
    console.error('Error fetching vouchers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
