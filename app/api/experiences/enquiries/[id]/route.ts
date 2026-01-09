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

    // If updating adminReply, fetch the doc first to get email and send notification
    if (updates.adminReply) {
      const enquiryDoc = await db.collection('experience_enquiries').doc(id).get();
      const enquiryData = enquiryDoc.data();

      if (enquiryData?.email) {
        console.log(`Attempting to send experience reply email to ${enquiryData.email}`);

        const { sendEmail } = await import('@/lib/email-service');
        const emailSent = await sendEmail({
          to: enquiryData.email,
          subject: `Re: Your ${enquiryData.categoryName || 'Experience'} Enquiry`,
          text: updates.adminReply,
          html: `
                <div style="font-family: sans-serif; color: #2D3436;">
                    <h1 style="color: #6C5CE7;">Update on your Experience Enquiry</h1>
                    <p>Hi ${enquiryData.name || 'Explorer'},</p>
                    <p>We have an update regarding your enquiry for <strong>${enquiryData.categoryName}</strong>.</p>
                    <blockquote style="border-left: 4px solid #FFD93D; padding-left: 1rem; margin: 1rem 0; color: #555;">
                        ${updates.adminReply.replace(/\n/g, '<br>')}
                    </blockquote>
                    <p>You can view the full status in your <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/profile/enquiries">Profile Dashboard</a>.</p>
                    <p>Stay Playful,<br>The Joy Juncture Team</p>
                </div>
            `
        });

        if (emailSent) {
          console.log(`Experience reply sent successfully to ${enquiryData.email}`);
        }
      }
    }

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