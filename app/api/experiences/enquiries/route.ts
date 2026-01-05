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

    /* ---------------- ROLE CHECK (DB) ---------------- */
    const userSnap = await db
      .collection('users')
      .doc(decoded.uid)
      .get();

    if (!userSnap.exists || userSnap.data()?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    /* ---------------- GET ENQUIRIES ---------------- */
    const enquiriesSnap = await db
      .collection('experience_enquiries')
      .orderBy('createdAt', 'desc')
      .get();

    const enquiries = enquiriesSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as ExperienceEnquiry[];

    return NextResponse.json({
      success: true,
      enquiries,
    });
  } catch (error) {
    console.error('Error fetching experience enquiries:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'email', 'categoryId', 'categoryName', 'occasionDetails', 'audienceSize', 'preferredDateRange', 'budgetRange'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    const enquiryData = {
      ...data,
      status: 'new',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await db.collection('experience_enquiries').add(enquiryData);

    return NextResponse.json({
      success: true,
      enquiry: {
        id: docRef.id,
        ...enquiryData,
      },
    });
  } catch (error) {
    console.error('Error creating experience enquiry:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}