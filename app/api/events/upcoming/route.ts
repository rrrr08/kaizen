import { NextRequest, NextResponse } from 'next/server';
import { getEvents } from '@/lib/db/events';

export async function GET(request: NextRequest) {
    try{
        const events = await getEvents({ status: 'upcoming' });
        return NextResponse.json({
            success: true,
            events,
            count: events.length
        });
    } catch (error: any) {
        console.error('Error fetching upcoming events:', error);
        return NextResponse.json(
        { 
            success: false, 
            error: 'Failed to fetch upcoming events',
            message: error.message 
        },
        { status: 500 }
        );
    }
}