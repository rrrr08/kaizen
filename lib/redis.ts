/**
 * Redis Client Configuration
 * Using Upstash Redis for serverless-friendly caching, rate limiting, and leaderboards
 */

import { Redis } from '@upstash/redis';

// Initialize Redis client or a mock for development
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// Helper to warn about missing config, but only once
let hasWarned = false;
const warnMissingConfig = () => {
    if (!hasWarned && typeof window === 'undefined') {
        console.warn('⚠️  Redis credentials missing. Using mock Redis client. Rate limiting and caching will be disabled.');
        console.warn('   Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to your .env.local file.');
        hasWarned = true;
    }
};

export const redis = (redisUrl && redisToken)
    ? new Redis({
        url: redisUrl,
        token: redisToken,
    })
    : new Proxy({} as Redis, {
        get: (target, prop) => {
            warnMissingConfig();
            // Return no-op functions for common methods
            if (prop === 'incr') return async () => 1;
            if (prop === 'expire') return async () => 1;
            if (prop === 'get') return async () => null;
            if (prop === 'setex') return async () => 'OK';
            if (prop === 'del') return async () => 0;
            if (prop === 'ping') return async () => 'PONG';
            // Default safe return for others
            return async () => null;
        }
    });

/**
 * Redis Key Patterns
 * Organized by feature for easy management
 */
export const RedisKeys = {
    // Rate Limiting
    rateLimit: (endpoint: string, identifier: string, window: number) =>
        `ratelimit:${endpoint}:${identifier}:${window}`,

    // Leaderboards
    leaderboard: {
        global: (period: 'alltime' | 'daily' | 'weekly', date?: string) =>
            date ? `leaderboard:global:${period}:${date}` : `leaderboard:global:${period}`,
        game: (gameName: string, period: 'alltime' | 'daily' | 'weekly', date?: string) =>
            date ? `leaderboard:game:${gameName}:${period}:${date}` : `leaderboard:game:${gameName}:${period}`,
    },

    // Game Sessions
    gameSession: (gameType: string, userId: string) =>
        `session:game:${gameType}:${userId}`,

    // Daily Attempts
    attempts: (game: string, userId: string, date: string) =>
        `attempts:${game}:${userId}:${date}`,

    // Guest Sessions
    guestSession: (sessionId: string) =>
        `guest:session:${sessionId}`,

    // Analytics
    analytics: (metric: string, period: string) =>
        `analytics:${metric}:${period}`,

    // Cache
    cache: (type: string, id: string) =>
        `cache:${type}:${id}`,
};

/**
 * Helper Functions
 */

/**
 * Get current date in YYYY-MM-DD format
 */
export function getDateKey(): string {
    return new Date().toISOString().split('T')[0];
}

/**
 * Get current week in YYYY-Www format
 */
export function getWeekKey(): string {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    const week = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${week.toString().padStart(2, '0')}`;
}

/**
 * Get rounded timestamp for rate limiting windows
 */
export function getWindowTimestamp(windowSeconds: number): number {
    const now = Math.floor(Date.now() / 1000);
    return Math.floor(now / windowSeconds) * windowSeconds;
}

/**
 * Cache wrapper with automatic JSON serialization
 */
export async function cacheGet<T>(type: string, id: string): Promise<T | null> {
    try {
        const key = RedisKeys.cache(type, id);
        const data = await redis.get(key);

        if (!data) return null;

        // If data is already an object, return it directly
        if (typeof data === 'object') {
            return data as T;
        }

        // If data is a string, parse it as JSON
        if (typeof data === 'string') {
            return JSON.parse(data);
        }

        return null;
    } catch (error) {
        console.error('Redis cache get error:', error);
        return null;
    }
}

export async function cacheSet<T>(
    type: string,
    id: string,
    data: T,
    ttlSeconds: number = 300 // 5 minutes default
): Promise<void> {
    try {
        const key = RedisKeys.cache(type, id);
        await redis.setex(key, ttlSeconds, JSON.stringify(data));
    } catch (error) {
        console.error('Redis cache set error:', error);
    }
}

export async function cacheDel(type: string, id: string): Promise<void> {
    try {
        const key = RedisKeys.cache(type, id);
        await redis.del(key);
    } catch (error) {
        console.error('Redis cache delete error:', error);
    }
}

/**
 * Increment counter with TTL
 */
export async function incrementCounter(
    key: string,
    ttlSeconds?: number
): Promise<number> {
    const count = await redis.incr(key);
    if (ttlSeconds && count === 1) {
        // Only set TTL on first increment
        await redis.expire(key, ttlSeconds);
    }
    return count;
}

/**
 * Health check
 */
export async function redisHealthCheck(): Promise<boolean> {
    try {
        await redis.ping();
        return true;
    } catch (error) {
        console.error('Redis health check failed:', error);
        return false;
    }
}
