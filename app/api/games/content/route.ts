import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { adminDb } from '@/lib/firebaseAdmin';

// GET /api/games/content?gameId={id} - Get game content
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get('gameId');
    
    if (!gameId) {
      return NextResponse.json({ error: 'gameId required' }, { status: 400 });
    }
    
    const contentSnap = await adminDb.doc(`gameContent/${gameId}`).get();
    
    if (!contentSnap.exists) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }
    
    return NextResponse.json({ content: contentSnap.data() });
  } catch (error: any) {
    console.error('Error fetching game content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/games/content - Update game content (Admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { gameId, content } = body;
    
    if (!gameId || !content) {
      return NextResponse.json({ error: 'gameId and content required' }, { status: 400 });
    }
    
    await adminDb.doc(`gameContent/${gameId}`).set({
      ...content,
      updatedAt: new Date().toISOString(),
      updatedBy: session.user.email
    }, { merge: true });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating game content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/games/content - Delete content item (Admin only)
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get('gameId');
    const itemId = searchParams.get('itemId');
    
    if (!gameId || !itemId) {
      return NextResponse.json({ error: 'gameId and itemId required' }, { status: 400 });
    }
    
    const contentSnap = await adminDb.doc(`gameContent/${gameId}`).get();
    if (!contentSnap.exists) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }
    
    const content = contentSnap.data();
    const items = content?.items || [];
    const filtered = items.filter((item: any) => item.id !== itemId);
    
    await adminDb.doc(`gameContent/${gameId}`).update({
      items: filtered,
      updatedAt: new Date().toISOString()
    });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
