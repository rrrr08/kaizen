/**
 * Log Aggregation System
 * Replaces Kafka for logging
 */

import { redis } from './redis';
import { adminDb } from './firebaseAdmin';

export interface LogEntry {
    timestamp: number;
    level: 'info' | 'warn' | 'error';
    event: string;
    userId?: string;
    data?: any;
    metadata?: {
        ip?: string;
        userAgent?: string;
        path?: string;
    };
}

export interface LogStats {
    info: number;
    warn: number;
    error: number;
    total: number;
}

export class LogAggregator {
    /**
     * Log an event to Redis (fast, temporary)
     * Errors are also saved to Firestore (permanent)
     */
    static async log(entry: LogEntry): Promise<void> {
        const logKey = `logs:${entry.level}:${Date.now()}`;

        try {
            // 1. Store in Redis (temporary - 24 hours)
            await redis.setex(logKey, 86400, JSON.stringify(entry));

            // 2. Add to sorted set for time-based queries
            await redis.zadd(`logs:timeline:${entry.level}`, {
                score: entry.timestamp,
                member: logKey
            });

            // 3. Increment counters
            await redis.incr(`logs:count:${entry.level}:today`);
            await redis.incr(`logs:count:total`);

            // 4. If error, also save to Firestore (permanent)
            if (entry.level === 'error') {
                await adminDb.collection('errorLogs').add({
                    ...entry,
                    createdAt: new Date(entry.timestamp)
                });
            }
        } catch (error) {
            console.error('Failed to log event:', error);
            // Fallback: at least log to console
            console.log('[LOG]', entry.level.toUpperCase(), entry.event, entry.data);
        }
    }

    /**
     * Get recent logs from Redis
     */
    static async getRecentLogs(
        level: 'info' | 'warn' | 'error' | 'all',
        limit: number = 100
    ): Promise<LogEntry[]> {
        try {
            if (level === 'all') {
                // Get from all levels
                const [info, warn, error] = await Promise.all([
                    this.getRecentLogs('info', limit),
                    this.getRecentLogs('warn', limit),
                    this.getRecentLogs('error', limit)
                ]);

                return [...info, ...warn, ...error]
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .slice(0, limit);
            }

            const keys = await redis.zrange(
                `logs:timeline:${level}`,
                -limit,
                -1,
                { rev: true }
            );

            const logs = await Promise.all(
                keys.map(async (key) => {
                    const data = await redis.get(key as string);
                    if (!data) return null;
                    // Redis might return object or string
                    if (typeof data === 'string') {
                        return JSON.parse(data);
                    }
                    return data;
                })
            );

            return logs.filter(Boolean) as LogEntry[];
        } catch (error) {
            console.error('Failed to get recent logs:', error);
            return [];
        }
    }

    /**
     * Get log statistics
     */
    static async getStats(): Promise<LogStats> {
        try {
            const [infoCount, warnCount, errorCount, totalCount] = await Promise.all([
                redis.get('logs:count:info:today'),
                redis.get('logs:count:warn:today'),
                redis.get('logs:count:error:today'),
                redis.get('logs:count:total')
            ]);

            return {
                info: parseInt(infoCount as string || '0'),
                warn: parseInt(warnCount as string || '0'),
                error: parseInt(errorCount as string || '0'),
                total: parseInt(totalCount as string || '0')
            };
        } catch (error) {
            console.error('Failed to get log stats:', error);
            return { info: 0, warn: 0, error: 0, total: 0 };
        }
    }

    /**
     * Clear old logs (run daily)
     */
    static async clearOldLogs(): Promise<void> {
        const yesterday = Date.now() - 86400000;

        await Promise.all([
            redis.zremrangebyscore('logs:timeline:info', 0, yesterday),
            redis.zremrangebyscore('logs:timeline:warn', 0, yesterday),
            redis.zremrangebyscore('logs:timeline:error', 0, yesterday)
        ]);
    }
}

// Helper functions for common logging scenarios
export async function logUserActivity(
    userId: string,
    action: string,
    data?: any
): Promise<void> {
    await LogAggregator.log({
        timestamp: Date.now(),
        level: 'info',
        event: 'user_activity',
        userId,
        data: { action, ...data }
    });
}

export async function logError(
    error: Error,
    context?: any
): Promise<void> {
    await LogAggregator.log({
        timestamp: Date.now(),
        level: 'error',
        event: 'error',
        data: {
            message: error.message,
            stack: error.stack,
            context
        }
    });
}

export async function logApiRequest(
    endpoint: string,
    method: string,
    userId?: string,
    metadata?: any
): Promise<void> {
    await LogAggregator.log({
        timestamp: Date.now(),
        level: 'info',
        event: 'api_request',
        userId,
        data: { endpoint, method },
        metadata
    });
}
