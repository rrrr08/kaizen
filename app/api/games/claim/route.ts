import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { headers } from 'next/headers';
import { withRateLimit, RateLimitPresets } from '@/lib/redis-rate-limit';
import { logUserActivity, logError } from '@/lib/log-aggregator';
import { captureGameCompletion } from '@/lib/change-data-capture';
import { getServerTodayString } from '@/lib/date-utils';

// POST /api/games/claim - Award points after game completion
async function claimHandler(req: NextRequest) {
  try {
    // Get Firebase Auth token from Authorization header
    const headersList = await headers();
    const authorization = headersList.get('authorization');

    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
    }

    const token = authorization.split('Bearer ')[1];
    let decodedToken;

    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    const userUid = decodedToken.uid;

    const body = await req.json();
    const { gameId, retry = 0, level, points: customPoints } = body;

    if (!gameId) {
      return NextResponse.json({ error: 'gameId is required' }, { status: 400 });
    }

    const today = getServerTodayString();
    const playRecordId = `${gameId}_${today}`;

    // Check if user already played this game today
    const userRef = adminDb.collection('users').doc(userUid);
    const playRecordRef = userRef.collection('gamePlays').doc(playRecordId);
    const playRecordSnap = await playRecordRef.get();
    const alreadyPlayed = playRecordSnap.exists;

    // Calculate points
    console.log(`[Award API] Processing award for game: ${gameId}, User: ${userUid}`);

    // Log game start
    await logUserActivity(userUid, 'game_started', {
      gameId,
      retry,
      level,
      alreadyPlayed
    });

    const settingsSnap = await adminDb.doc('settings/gamePoints').get();
    const gameSettings = settingsSnap.exists ? settingsSnap.data()?.[gameId] : null;

    // Calculate points
    const MAX_POINTS_LIMIT = 200; // Safety cap
    let basePoints = gameSettings?.basePoints || customPoints || 10;

    // Level Multipliers
    const LEVEL_MULTIPLIERS: Record<string, number> = {
      'easy': 1,
      'medium': 1.5,
      'hard': 2,
      'expert': 3
    };

    const multiplier = LEVEL_MULTIPLIERS[level?.toLowerCase()] || 1;

    // Apply multiplier to base points
    basePoints = Math.round(basePoints * multiplier);

    // Validate and cap
    if (basePoints > MAX_POINTS_LIMIT) {
      basePoints = MAX_POINTS_LIMIT;
    }

    const retryPenalty = gameSettings?.retryPenalty || 0;
    let finalPoints = Math.max(basePoints - (retry * retryPenalty), 1);

    console.log(`[Award API] Calculated points: ${finalPoints} (Base: ${basePoints}, Level: ${level}, Multiplier: ${multiplier})`);

    // Check if this is Game of the Day
    const gotdSnap = await adminDb.doc('settings/gameOfTheDay').get();
    const gotdData = gotdSnap.data();
    const isGameOfDay = gotdData?.gameId === gameId && gotdData?.date === today;

    // Apply 2x multiplier ONLY if it's Game of the Day AND first time playing today
    let appliedMultiplier = 1;
    if (isGameOfDay && !alreadyPlayed) {
      finalPoints = finalPoints * 2;
      appliedMultiplier = 2;
    }

    // Record the play (overwrite or update)
    if (alreadyPlayed) {
      // If already played, we might want to just update the 'lastPlayed' or keep the original 'playedAt'
      // For now, let's update the record to show the latest activity, but distinct from first play if needed.
      // Actually, requirements say "played other time it should give the same rewards".
      // We'll just update the record to reflect the latest play stats.
      await playRecordRef.update({
        lastPlayedAt: new Date().toISOString(),
        retry,
        level: level || 'default',
        latestPoints: finalPoints // tracking latest points just in case
      });
    } else {
      await playRecordRef.set({
        gameId,
        playedAt: new Date().toISOString(),
        date: today,
        retry,
        level: level || 'default',
        pointsAwarded: finalPoints,
        isGameOfDay,
        appliedMultiplier
      });
    }

    // Update user's total points and XP with tier multiplier
    const userSnap = await userRef.get();
    const userData = userSnap.exists ? userSnap.data() : {};
    const currentPoints = userData?.points || userData?.balance || 0;
    const currentXP = userData?.xp || 0;
    const currentGameXP = userData?.game_xp || 0;

    // Get user's current tier from Firebase settings
    const xpSettingsSnap = await adminDb.doc('settings/xpSystem').get();
    const TIERS = xpSettingsSnap.exists && xpSettingsSnap.data()?.tiers ? xpSettingsSnap.data()!.tiers : [
      { name: 'Newbie', minXP: 0, multiplier: 1.0 },
      { name: 'Player', minXP: 500, multiplier: 1.1 },
      { name: 'Strategist', minXP: 2000, multiplier: 1.25 },
      { name: 'Grandmaster', minXP: 5000, multiplier: 1.5 }
    ];
    const currentTier = [...TIERS].reverse().find((tier: any) => currentXP >= tier.minXP) || TIERS[0];

    // XP increases by base amount, JP increases by amount × tier multiplier
    const xpEarned = finalPoints;
    const jpEarned = Math.round(finalPoints * currentTier.multiplier);

    await userRef.set(
      {
        points: currentPoints + jpEarned,
        xp: currentXP + xpEarned,
        game_xp: currentGameXP + xpEarned,
        lastPlayed: new Date().toISOString()
      },
      { merge: true }
    );

    // Log transaction
    await adminDb.collection('users').doc(userUid).collection('transactions').add({
      type: 'EARN',
      amount: jpEarned,
      source: 'Game Award',
      description: `Won ${gameId} (${level || 'Standard'})`,
      timestamp: new Date(), // Use server timestamp if possible, but Date works for admin SDK usually
      metadata: {
        gameId,
        xpEarned,
        isGameXP: true,
        multiplier: currentTier.multiplier
      }
    });

    // Add to leaderboard
    const leaderboardRef = adminDb.collection('leaderboards').doc(gameId);
    const leaderboardSnap = await leaderboardRef.get();
    const leaderboardData = leaderboardSnap.exists ? leaderboardSnap.data() : { entries: [] };

    const entries = (leaderboardData?.entries || []) as any[];
    const existingEntryIndex = entries.findIndex((e: any) => e.uid === userUid);

    if (existingEntryIndex >= 0) {
      entries[existingEntryIndex].totalPoints += finalPoints;
      entries[existingEntryIndex].plays += 1;
      entries[existingEntryIndex].lastPlayed = new Date().toISOString();
    } else {
      const userData = userSnap.data();
      entries.push({
        uid: userUid,
        email: decodedToken.email || userData?.email || 'Unknown',
        name: userData?.displayName || decodedToken.name || decodedToken.email || 'Unknown',
        totalPoints: finalPoints,
        plays: 1,
        lastPlayed: new Date().toISOString()
      });
    }

    // Sort by totalPoints descending
    entries.sort((a: any, b: any) => b.totalPoints - a.totalPoints);

    await leaderboardRef.set({ entries, updatedAt: new Date().toISOString() });

    // ============================================
    // LOG GAME COMPLETION
    // ============================================

    // Log user activity
    await logUserActivity(userUid, 'game_completed', {
      gameId,
      xpEarned,
      jpEarned,
      tierMultiplier: currentTier.multiplier,
      tierName: currentTier.name,
      isGameOfDay,
      appliedMultiplier,
      finalPoints,
      retry,
      level: level || 'default',
      alreadyPlayed
    });

    // Capture CDC event for game completion
    await captureGameCompletion(`${gameId}_${userUid}_${Date.now()}`, {
      userId: userUid,
      gameId,
      gameType: gameId,
      xpEarned,
      jpEarned,
      score: finalPoints,
      tierMultiplier: currentTier.multiplier,
      tierName: currentTier.name,
      isGameOfDay,
      appliedMultiplier,
      retry,
      level: level || 'default',
      timestamp: Date.now()
    });

    return NextResponse.json({
      success: true,
      awardedPoints: jpEarned,
      awardedXP: xpEarned,
      tierMultiplier: currentTier.multiplier,
      currentTier: currentTier.name,
      isGameOfDay,
      appliedMultiplier,
      message: isGameOfDay && appliedMultiplier === 2
        ? `🎉 Game of the Day! You earned ${xpEarned} XP and ${jpEarned} JP (${currentTier.multiplier}x ${currentTier.name} bonus + 2x GotD Bonus)!`
        : `You earned ${xpEarned} XP and ${jpEarned} JP (${currentTier.multiplier}x ${currentTier.name} bonus)!`
    });

  } catch (error: any) {
    console.error('Error awarding points:', error);

    // Log error
    await logError(error, {
      endpoint: '/api/games/claim',
      context: 'game_completion'
    });

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Export with rate limiting (30 requests per minute - more lenient for game claims)
export const POST = withRateLimit(
  {
    endpoint: 'api:games:claim',
    ...RateLimitPresets.api,
  },
  claimHandler
);
