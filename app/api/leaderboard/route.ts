import { adminDb } from '@/app/api/auth/firebase-admin';
import { NextResponse } from 'next/server';
import { cacheGet, cacheSet } from '@/lib/redis';
import { withRateLimit, RateLimitPresets } from '@/lib/redis-rate-limit';

export const dynamic = 'force-dynamic';

async function handler() {
  try {
    const CACHE_KEY_TYPE = 'leaderboard';
    const CACHE_KEY_ID = 'top10';
    const CACHE_TTL = 60; // 1 minute cache

    // Try to get from Redis cache first
    const cached = await cacheGet<any[]>(CACHE_KEY_TYPE, CACHE_KEY_ID);
    if (cached) {
      return NextResponse.json({
        success: true,
        leaderboard: cached,
        cached: true
      });
    }

    // Fetch from Firestore if not cached
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

    // Cache the result in Redis
    await cacheSet(CACHE_KEY_TYPE, CACHE_KEY_ID, leaderboard, CACHE_TTL);

    return NextResponse.json({
      success: true,
      leaderboard,
      cached: false
    });
  } catch (error: any) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}

// Export with rate limiting (100 requests per minute)
export const GET = withRateLimit(
  {
    endpoint: 'api:leaderboard',
    ...RateLimitPresets.read,
  },
  handler
);
