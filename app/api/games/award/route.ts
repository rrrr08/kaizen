import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { headers } from 'next/headers';

// POST /api/games/award - Award points after game completion
export async function POST(req: NextRequest) {
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

    const today = new Date().toISOString().slice(0, 10);
    const playRecordId = `${gameId}_${today}`;

    // Check if user already played this game today
    const userRef = adminDb.collection('users').doc(userUid);
    const playRecordRef = userRef.collection('gamePlays').doc(playRecordId);
    const playRecordSnap = await playRecordRef.get();

    if (playRecordSnap.exists) {
      return NextResponse.json(
        { 
          error: 'Already played today',
          message: 'You already played this game today. Come back tomorrow!'
        },
        { status: 409 }
      );
    }

    // Get game settings
    const settingsSnap = await adminDb.doc('settings/gamePoints').get();
    const gameSettings = settingsSnap.exists ? settingsSnap.data()?.[gameId] : null;

    if (!gameSettings && !customPoints) {
      return NextResponse.json({ error: 'Game settings not found' }, { status: 404 });
    }

    // Calculate points
    let basePoints = customPoints || gameSettings?.basePoints || 10;
    const retryPenalty = gameSettings?.retryPenalty || 0;
    let finalPoints = Math.max(basePoints - (retry * retryPenalty), 1);

    // Check if this is Game of the Day
    const gotdSnap = await adminDb.doc('settings/gameOfTheDay').get();
    const gotdData = gotdSnap.data();
    const isGameOfDay = gotdData?.gameId === gameId && gotdData?.date === today;

    if (isGameOfDay) {
      finalPoints = finalPoints * 2;
    }

    // Record the play
    await playRecordRef.set({
      gameId,
      playedAt: new Date().toISOString(),
      date: today,
      retry,
      level: level || 'default',
      pointsAwarded: finalPoints,
      isGameOfDay
    });

    // Update user's total points and XP with tier multiplier
    const userSnap = await userRef.get();
    const userData = userSnap.exists ? userSnap.data() : {};
    const currentPoints = userData?.points || userData?.balance || 0;
    const currentXP = userData?.xp || 0;
    
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
        lastPlayed: new Date().toISOString()
      },
      { merge: true }
    );

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

    return NextResponse.json({
      success: true,
      awardedPoints: jpEarned,
      awardedXP: xpEarned,
      tierMultiplier: currentTier.multiplier,
      currentTier: currentTier.name,
      isGameOfDay,
      message: isGameOfDay 
        ? `🎉 Game of the Day! You earned ${xpEarned} XP and ${jpEarned} JP (${currentTier.multiplier}x ${currentTier.name} bonus)!`
        : `You earned ${xpEarned} XP and ${jpEarned} JP (${currentTier.multiplier}x ${currentTier.name} bonus)!`
    });

  } catch (error: any) {
    console.error('Error awarding points:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
