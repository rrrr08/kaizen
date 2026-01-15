/**
 * Leaderboard Management with Redis Sorted Sets
 * Provides fast, scalable leaderboard functionality
 */

import { redis, RedisKeys, getDateKey, getWeekKey } from './redis';

export interface LeaderboardEntry {
    userId: string;
    score: number;
    rank: number;
    displayName?: string;
    avatar?: string;
}

export type LeaderboardPeriod = 'alltime' | 'daily' | 'weekly';
export type LeaderboardScope = 'global' | string; // 'global' or 'game:{gameName}'

/**
 * Add or update a user's score in the leaderboard
 */
export async function updateLeaderboardScore(
    scope: LeaderboardScope,
    period: LeaderboardPeriod,
    userId: string,
    score: number,
    increment: boolean = true
): Promise<void> {
    try {
        const date = period === 'daily' ? getDateKey() : period === 'weekly' ? getWeekKey() : undefined;
        const key = scope === 'global'
            ? RedisKeys.leaderboard.global(period, date)
            : RedisKeys.leaderboard.game(scope.replace('game:', ''), period, date);

        if (increment) {
            // Increment existing score
            await redis.zincrby(key, score, userId);
        } else {
            // Set absolute score
            await redis.zadd(key, { score, member: userId });
        }

        // Set TTL for time-based leaderboards
        if (period === 'daily') {
            await redis.expire(key, 86400 * 2); // 2 days
        } else if (period === 'weekly') {
            await redis.expire(key, 86400 * 14); // 2 weeks
        }
    } catch (error) {
        console.error('Error updating leaderboard:', error);
    }
}

/**
 * Get top N users from leaderboard
 */
export async function getTopLeaderboard(
    scope: LeaderboardScope,
    period: LeaderboardPeriod,
    limit: number = 100
): Promise<LeaderboardEntry[]> {
    try {
        const date = period === 'daily' ? getDateKey() : period === 'weekly' ? getWeekKey() : undefined;
        const key = scope === 'global'
            ? RedisKeys.leaderboard.global(period, date)
            : RedisKeys.leaderboard.game(scope.replace('game:', ''), period, date);

        // Get top scores with ranks
        const results = await redis.zrange(key, 0, limit - 1, {
            rev: true,
            withScores: true,
        });

        // Transform to leaderboard entries
        const entries: LeaderboardEntry[] = [];
        for (let i = 0; i < results.length; i += 2) {
            entries.push({
                userId: results[i] as string,
                score: results[i + 1] as number,
                rank: Math.floor(i / 2) + 1,
            });
        }

        return entries;
    } catch (error) {
        console.error('Error getting leaderboard:', error);
        return [];
    }
}

/**
 * Get a specific user's rank and score
 */
export async function getUserLeaderboardPosition(
    scope: LeaderboardScope,
    period: LeaderboardPeriod,
    userId: string
): Promise<LeaderboardEntry | null> {
    try {
        const date = period === 'daily' ? getDateKey() : period === 'weekly' ? getWeekKey() : undefined;
        const key = scope === 'global'
            ? RedisKeys.leaderboard.global(period, date)
            : RedisKeys.leaderboard.game(scope.replace('game:', ''), period, date);

        // Get user's score
        const score = await redis.zscore(key, userId);
        if (score === null) {
            return null;
        }

        // Get user's rank (0-indexed, so add 1)
        const rank = await redis.zrevrank(key, userId);
        if (rank === null) {
            return null;
        }

        return {
            userId,
            score,
            rank: rank + 1,
        };
    } catch (error) {
        console.error('Error getting user position:', error);
        return null;
    }
}

/**
 * Get users around a specific user (for context)
 */
export async function getLeaderboardAroundUser(
    scope: LeaderboardScope,
    period: LeaderboardPeriod,
    userId: string,
    range: number = 5
): Promise<LeaderboardEntry[]> {
    try {
        const date = period === 'daily' ? getDateKey() : period === 'weekly' ? getWeekKey() : undefined;
        const key = scope === 'global'
            ? RedisKeys.leaderboard.global(period, date)
            : RedisKeys.leaderboard.game(scope.replace('game:', ''), period, date);

        // Get user's rank
        const rank = await redis.zrevrank(key, userId);
        if (rank === null) {
            return [];
        }

        // Get users around this rank
        const start = Math.max(0, rank - range);
        const end = rank + range;

        const results = await redis.zrange(key, start, end, {
            rev: true,
            withScores: true,
        });

        // Transform to leaderboard entries
        const entries: LeaderboardEntry[] = [];
        for (let i = 0; i < results.length; i += 2) {
            entries.push({
                userId: results[i] as string,
                score: results[i + 1] as number,
                rank: start + Math.floor(i / 2) + 1,
            });
        }

        return entries;
    } catch (error) {
        console.error('Error getting leaderboard around user:', error);
        return [];
    }
}

/**
 * Get total number of users in leaderboard
 */
export async function getLeaderboardSize(
    scope: LeaderboardScope,
    period: LeaderboardPeriod
): Promise<number> {
    try {
        const date = period === 'daily' ? getDateKey() : period === 'weekly' ? getWeekKey() : undefined;
        const key = scope === 'global'
            ? RedisKeys.leaderboard.global(period, date)
            : RedisKeys.leaderboard.game(scope.replace('game:', ''), period, date);

        return await redis.zcard(key);
    } catch (error) {
        console.error('Error getting leaderboard size:', error);
        return 0;
    }
}

/**
 * Remove a user from leaderboard
 */
export async function removeFromLeaderboard(
    scope: LeaderboardScope,
    period: LeaderboardPeriod,
    userId: string
): Promise<void> {
    try {
        const date = period === 'daily' ? getDateKey() : period === 'weekly' ? getWeekKey() : undefined;
        const key = scope === 'global'
            ? RedisKeys.leaderboard.global(period, date)
            : RedisKeys.leaderboard.game(scope.replace('game:', ''), period, date);

        await redis.zrem(key, userId);
    } catch (error) {
        console.error('Error removing from leaderboard:', error);
    }
}

/**
 * Sync leaderboard from Firestore to Redis
 * Useful for initial population or recovery
 */
export async function syncLeaderboardFromFirestore(
    scope: LeaderboardScope,
    period: LeaderboardPeriod,
    users: Array<{ userId: string; score: number }>
): Promise<void> {
    try {
        const date = period === 'daily' ? getDateKey() : period === 'weekly' ? getWeekKey() : undefined;
        const key = scope === 'global'
            ? RedisKeys.leaderboard.global(period, date)
            : RedisKeys.leaderboard.game(scope.replace('game:', ''), period, date);

        // Clear existing data
        await redis.del(key);

        // Add all users in batch
        if (users.length > 0) {
            // Add members one by one or in smaller batches
            for (const user of users) {
                await redis.zadd(key, { score: user.score, member: user.userId });
            }
        }

        // Set TTL
        if (period === 'daily') {
            await redis.expire(key, 86400 * 2);
        } else if (period === 'weekly') {
            await redis.expire(key, 86400 * 14);
        }
    } catch (error) {
        console.error('Error syncing leaderboard:', error);
    }
}
