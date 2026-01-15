/**
 * Game Tracking Utilities
 * Track daily game attempts, active sessions, and game state
 */

import { redis, RedisKeys, getDateKey } from './redis';

/**
 * Check if user can play a daily game
 */
export async function canPlayDailyGame(
    gameName: string,
    userId: string,
    maxAttempts: number = 1
): Promise<{ canPlay: boolean; attemptsUsed: number; attemptsRemaining: number }> {
    try {
        const date = getDateKey();
        const key = RedisKeys.attempts(gameName, userId, date);

        const attempts = await redis.get<number>(key) || 0;
        const canPlay = attempts < maxAttempts;

        return {
            canPlay,
            attemptsUsed: attempts,
            attemptsRemaining: Math.max(0, maxAttempts - attempts),
        };
    } catch (error) {
        console.error('Error checking daily game:', error);
        // Fail open - allow play if Redis is down
        return {
            canPlay: true,
            attemptsUsed: 0,
            attemptsRemaining: maxAttempts,
        };
    }
}

/**
 * Record a game attempt
 */
export async function recordGameAttempt(
    gameName: string,
    userId: string
): Promise<number> {
    try {
        const date = getDateKey();
        const key = RedisKeys.attempts(gameName, userId, date);

        const attempts = await redis.incr(key);

        // Set TTL to expire at end of day (24 hours)
        if (attempts === 1) {
            await redis.expire(key, 86400);
        }

        return attempts;
    } catch (error) {
        console.error('Error recording game attempt:', error);
        return 0;
    }
}

/**
 * Save active game session
 */
export async function saveGameSession<T extends Record<string, any>>(
    gameType: string,
    userId: string,
    gameState: T,
    ttlSeconds: number = 3600 // 1 hour default
): Promise<void> {
    try {
        const key = RedisKeys.gameSession(gameType, userId);
        await redis.hset(key, gameState);
        await redis.expire(key, ttlSeconds);
    } catch (error) {
        console.error('Error saving game session:', error);
    }
}

/**
 * Get active game session
 */
export async function getGameSession<T extends Record<string, any>>(
    gameType: string,
    userId: string
): Promise<T | null> {
    try {
        const key = RedisKeys.gameSession(gameType, userId);
        const data = await redis.hgetall(key);
        return data && Object.keys(data).length > 0 ? (data as T) : null;
    } catch (error) {
        console.error('Error getting game session:', error);
        return null;
    }
}

/**
 * Delete game session
 */
export async function deleteGameSession(
    gameType: string,
    userId: string
): Promise<void> {
    try {
        const key = RedisKeys.gameSession(gameType, userId);
        await redis.del(key);
    } catch (error) {
        console.error('Error deleting game session:', error);
    }
}

/**
 * Update specific field in game session
 */
export async function updateGameSessionField(
    gameType: string,
    userId: string,
    field: string,
    value: string | number
): Promise<void> {
    try {
        const key = RedisKeys.gameSession(gameType, userId);
        await redis.hset(key, { [field]: value });
    } catch (error) {
        console.error('Error updating game session field:', error);
    }
}

/**
 * Guest Session Management
 */

export interface GuestSession {
    cart?: string; // JSON string
    gamesPlayed?: string; // Comma-separated game names
    totalXP?: number;
    createdAt?: number;
    lastActivity?: number;
}

/**
 * Create or update guest session
 */
export async function saveGuestSession(
    sessionId: string,
    data: GuestSession,
    ttlSeconds: number = 86400 // 24 hours
): Promise<void> {
    try {
        const key = RedisKeys.guestSession(sessionId);
        const sessionData = {
            ...data,
            lastActivity: Date.now(),
        };
        await redis.hset(key, sessionData as Record<string, string | number>);
        await redis.expire(key, ttlSeconds);
    } catch (error) {
        console.error('Error saving guest session:', error);
    }
}

/**
 * Get guest session
 */
export async function getGuestSession(
    sessionId: string
): Promise<GuestSession | null> {
    try {
        const key = RedisKeys.guestSession(sessionId);
        const data = await redis.hgetall(key);
        return data && Object.keys(data).length > 0 ? (data as GuestSession) : null;
    } catch (error) {
        console.error('Error getting guest session:', error);
        return null;
    }
}

/**
 * Delete guest session (on user signup/login)
 */
export async function deleteGuestSession(sessionId: string): Promise<void> {
    try {
        const key = RedisKeys.guestSession(sessionId);
        await redis.del(key);
    } catch (error) {
        console.error('Error deleting guest session:', error);
    }
}

/**
 * Analytics Tracking
 */

/**
 * Increment analytics counter
 */
export async function incrementAnalytics(
    metric: string,
    period: string = 'today',
    amount: number = 1
): Promise<number> {
    try {
        const key = RedisKeys.analytics(metric, period);
        const count = await redis.incrby(key, amount);

        // Set TTL based on period
        const ttl = period === 'today' ? 86400 * 2 : period === 'hour' ? 7200 : 86400;
        if (count === amount) {
            await redis.expire(key, ttl);
        }

        return count;
    } catch (error) {
        console.error('Error incrementing analytics:', error);
        return 0;
    }
}

/**
 * Get analytics counter
 */
export async function getAnalytics(
    metric: string,
    period: string = 'today'
): Promise<number> {
    try {
        const key = RedisKeys.analytics(metric, period);
        return await redis.get<number>(key) || 0;
    } catch (error) {
        console.error('Error getting analytics:', error);
        return 0;
    }
}

/**
 * Track popular games
 */
export async function trackGamePlay(gameName: string): Promise<void> {
    try {
        const key = RedisKeys.analytics('popular_games', 'today');
        await redis.hincrby(key, gameName, 1);
        await redis.expire(key, 86400 * 2);
    } catch (error) {
        console.error('Error tracking game play:', error);
    }
}

/**
 * Get popular games
 */
export async function getPopularGames(): Promise<Array<{ game: string; plays: number }>> {
    try {
        const key = RedisKeys.analytics('popular_games', 'today');
        const data = await redis.hgetall(key);

        if (!data) return [];

        return Object.entries(data)
            .map(([game, plays]) => ({ game, plays: Number(plays) }))
            .sort((a, b) => b.plays - a.plays);
    } catch (error) {
        console.error('Error getting popular games:', error);
        return [];
    }
}
