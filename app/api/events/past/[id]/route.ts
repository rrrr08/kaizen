import { NextRequest, NextResponse } from 'next/server';
import { getEventById } from '@/lib/db/events';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const event = await getEventById(id);
        if (!event) {
            return NextResponse.json(
                { success: false, error: "Event not found" },
                { status: 404 }
            );
        }
        return NextResponse.json({
            success: true,
            event,
        });
    } catch (error) {
        console.error("Error fetching event:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
