import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as 'past' | 'upcoming' | null;

    const eventsCollection = adminDb.collection('events');
    const now = new Date();

    let query;

    if (status === 'upcoming' || !status) {
      query = eventsCollection
        .where('datetime', '>', now)
        .orderBy('datetime', 'asc');
    } else {
      query = eventsCollection
        .where('datetime', '<=', now)
        .orderBy('datetime', 'desc');
    }

    const snapshot = await query.get();

    const events = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        datetime: data.datetime?.toDate?.() || data.datetime,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      };
    });

    return NextResponse.json({
      success: true,
      events,
      count: events.length,
    });
  } catch (error: any) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch events',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      title,
      description,
      image,
      datetime,
      status,
      location,
      registered,
      capacity,
      price,
      highlights,
      testimonials,
      gallery,
    } = body;

    // Required for ALL events
    if (!title || !description || !datetime || !location || capacity === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Base payload
    const payload: any = {
      title,
      description,
      datetime: Timestamp.fromDate(new Date(datetime)),
      location,
      status: status ?? 'upcoming',
      registered: registered || 0,
      capacity: Number(capacity),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (price !== undefined) payload.price = Number(price);
    if (image !== undefined) payload.image = image;

    // Optional: only meaningful for past events
    if (status === 'past') {
      if (highlights !== undefined) payload.highlights = highlights;
      if (testimonials !== undefined) payload.testimonials = testimonials;
      if (gallery !== undefined) payload.gallery = gallery;
    }

    const docRef = await adminDb.collection('events').add(payload);

    return NextResponse.json(
      { success: true, id: docRef.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[POST /api/events]', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create event',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
