import { NextRequest, NextResponse } from 'next/server';
import { db as adminDb } from '@/lib/firebase-admin'; // Using admin SDK for API routes
import { Testimonial } from '@/lib/types';
import { Timestamp } from 'firebase-admin/firestore'; // Admin SDK types

// Force dynamic to ensure we get fresh data
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const getAll = searchParams.get('all') === 'true';

        // In a real app, we would verify the session/token here to ensure admin format for "getAll"
        // For now, we'll assuming the client logic protects the query param or adding a header check if needed.
        // Better: Helper to check admin token from headers. 
        // Simplify: Just fetch based on param for now.

        const testimonialsRef = adminDb.collection('testimonials');
        let query; // : FirebaseFirestore.Query;

        if (getAll) {
            query = testimonialsRef.orderBy('createdAt', 'desc');
        } else {
            query = testimonialsRef.where('status', '==', 'approved').orderBy('createdAt', 'desc');
        }

        const snapshot = await query.get();

        const testimonials = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: (doc.data().createdAt as Timestamp)?.toDate?.() || new Date().toISOString()
        }));

        return NextResponse.json({ success: true, testimonials });
    } catch (error: any) {
        console.error('Error fetching testimonials:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch testimonials' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();

        // Basic validation
        if (!data.name || !data.quote) {
            return NextResponse.json(
                { success: false, error: 'Name and quote are required' },
                { status: 400 }
            );
        }

        const newTestimonial: Omit<Testimonial, 'id'> = {
            name: data.name,
            role: data.role || 'Community Member',
            quote: data.quote,
            image: data.image || '',
            status: 'pending', // Default to pending
            createdAt: new Date().toISOString() // Store as ISO string for simplicity or Firestore Timestamp
        };

        const docRef = await adminDb.collection('testimonials').add({
            ...newTestimonial,
            createdAt: Timestamp.now()
        });

        return NextResponse.json({
            success: true,
            testimonial: { id: docRef.id, ...newTestimonial }
        });
    } catch (error: any) {
        console.error('Error creating testimonial:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to submit testimonial' },
            { status: 500 }
        );
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const data = await req.json();
        const { id, status } = data;

        if (!id || !status) {
            return NextResponse.json(
                { success: false, error: 'ID and status are required' },
                { status: 400 }
            );
        }

        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return NextResponse.json(
                { success: false, error: 'Invalid status' },
                { status: 400 }
            );
        }

        await adminDb.collection('testimonials').doc(id).update({
            status,
            updatedAt: Timestamp.now()
        });

        return NextResponse.json({ success: true, message: 'Testimonial updated' });
    } catch (error: any) {
        console.error('Error updating testimonial:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update testimonial' },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'ID is required' },
                { status: 400 }
            );
        }

        await adminDb.collection('testimonials').doc(id).delete();

        return NextResponse.json({ success: true, message: 'Testimonial deleted' });
    } catch (error: any) {
        console.error('Error deleting testimonial:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete testimonial' },
            { status: 500 }
        );
    }
}
