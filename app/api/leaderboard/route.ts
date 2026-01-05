import { adminDb } from '@/app/api/auth/firebase-admin';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch top 10 users by XP
    const snapshot = await adminDb
      .collection('users')
      .orderBy('game_xp', 'desc')
      .limit(10)
      .get();

    const leaderboard = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || 'Anonymous Player',
        xp: data.xp || 0,
        game_xp: data.game_xp || 0,
        avatar_url: data.avatar_url || data.photoURL || ''
      };
    });

    return NextResponse.json({ success: true, leaderboard });
  } catch (error: any) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
