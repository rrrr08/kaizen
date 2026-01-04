import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '@/lib/firebase-admin';
import { ExperienceEnquiry } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    /* ---------------- AUTH ---------------- */
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = await auth.verifyIdToken(token);

    /* ---------------- GET USER ENQUIRIES ---------------- */
    const enquiriesSnap = await db
      .collection('experience_enquiries')
      .where('email', '==', decoded.email)
      .get();

    const enquiries = enquiriesSnap.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      }))
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA; // Descending order (newest first)
      }) as ExperienceEnquiry[];

    return NextResponse.json({
      success: true,
      enquiries,
    });
  } catch (error) {
    console.error('Error fetching user enquiries:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}