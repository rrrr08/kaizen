import { NextRequest, NextResponse } from 'next/server';
import { getEvents } from '@/lib/db/events';

export async function GET(request: NextRequest) {
    try{
        const events = await getEvents({ status: 'past' });
        return NextResponse.json({
            success: true,
            events,
            count: events.length
        });
    } catch (error: any) {
        console.error('Error fetching past events:', error);
        return NextResponse.json(
        { 
            success: false, 
            error: 'Failed to fetch past events',
            message: error.message 
        },
        { status: 500 }
        );
    }
}
