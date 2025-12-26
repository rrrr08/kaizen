import { NextRequest, NextResponse } from 'next/server';
import { getEventById, updateEventById, deleteEventById } from '@/lib/db/events';

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


export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        const updates = await request.json(); // partial fields

        if (!updates || Object.keys(updates).length === 0) {
            return NextResponse.json(
                { success: false, error: 'No update data provided' },
                { status: 400 }
            );
        }

        const updatedEvent = await updateEventById(id, updates);

        if (!updatedEvent) {
            return NextResponse.json(
                { success: false, error: 'Event not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            event: updatedEvent,
        });
    } catch (error) {
        console.error('Error updating event:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const success = await deleteEventById(id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}
