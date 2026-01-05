import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '@/lib/firebase-admin';
import { ExperienceEnquiry } from '@/lib/types';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

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

    /* ---------------- GET ENQUIRY ---------------- */
    const enquiryDoc = await db.collection('experience_enquiries').doc(id).get();

    if (!enquiryDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Enquiry not found' },
        { status: 404 }
      );
    }

    const enquiry = {
      id: enquiryDoc.id,
      ...enquiryDoc.data(),
      createdAt: enquiryDoc.data()?.createdAt?.toDate(),
      updatedAt: enquiryDoc.data()?.updatedAt?.toDate(),
    } as ExperienceEnquiry;

    return NextResponse.json({
      success: true,
      enquiry,
    });
  } catch (error) {
    console.error('Error fetching experience enquiry:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

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

    /* ---------------- UPDATE ENQUIRY ---------------- */
    const updates = await request.json();

    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No update data provided' },
        { status: 400 }
      );
    }

    const cleanedUpdates = {
      ...updates,
      updatedAt: new Date(),
    };

    await db.collection('experience_enquiries').doc(id).update(cleanedUpdates);

    // Get updated enquiry
    const updatedDoc = await db.collection('experience_enquiries').doc(id).get();
    const updatedEnquiry = {
      id: updatedDoc.id,
      ...updatedDoc.data(),
      createdAt: updatedDoc.data()?.createdAt?.toDate(),
      updatedAt: updatedDoc.data()?.updatedAt?.toDate(),
    } as ExperienceEnquiry;

    return NextResponse.json({
      success: true,
      enquiry: updatedEnquiry,
    });
  } catch (error) {
    console.error('Error updating experience enquiry:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}