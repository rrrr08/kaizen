/**
 * Change Data Capture (CDC) System
 * Replaces Kafka for database change tracking
 */

import { redis } from './redis';
import { adminDb } from './firebaseAdmin';
import { logError } from './log-aggregator';
import admin from 'firebase-admin';

export interface ChangeEvent {
    collection: string;
    documentId: string;
    operation: 'create' | 'update' | 'delete';
    before?: any;
    after?: any;
    timestamp: number;
    userId?: string;
}

export class ChangeDataCapture {
    /**
     * Capture a database change event
     */
    static async captureChange(event: ChangeEvent): Promise<void> {
        try {
            // 1. Store in Redis stream (like Kafka topic)
            const streamKey = `cdc:${event.collection}`;

            await redis.xadd(streamKey, '*', {
                documentId: event.documentId,
                operation: event.operation,
                before: JSON.stringify(event.before || {}),
                after: JSON.stringify(event.after || {}),
                timestamp: event.timestamp.toString(),
                userId: event.userId || 'system'
            });

            // 2. Publish to Redis Pub/Sub for real-time listeners
            await redis.publish(
                `changes:${event.collection}`,
                JSON.stringify(event)
            );

            // 3. Trigger side effects based on collection
            await this.handleSideEffects(event);
        } catch (error) {
            await logError(error as Error, { event });
        }
    }

    /**
     * Handle side effects (like Kafka consumers)
     */
    private static async handleSideEffects(event: ChangeEvent): Promise<void> {
        switch (event.collection) {
            case 'orders':
                await this.handleOrderChange(event);
                break;

            case 'users':
                await this.handleUserChange(event);
                break;

            case 'gameResults':
                await this.handleGameChange(event);
                break;

            case 'events':
                await this.handleEventChange(event);
                break;
        }
    }

    /**
     * Handle order changes
     */
    private static async handleOrderChange(event: ChangeEvent): Promise<void> {
        if (event.operation === 'create') {
            const order = event.after;

            // Parallel side effects
            await Promise.allSettled([
                this.updateInventory(order),
                this.updateAnalytics('order_created', order),
                this.updateUserStats(order.userId, { ordersCount: 1 })
            ]);
        }
    }

    /**
     * Handle user changes
     */
    private static async handleUserChange(event: ChangeEvent): Promise<void> {
        if (event.operation === 'update') {
            const before = event.before;
            const after = event.after;

            // Invalidate user cache
            await redis.del(`user:${event.documentId}`);

            // Check what changed
            if (before.phoneNumber !== after.phoneNumber) {
                await redis.sadd('users:with-phone', event.documentId);
            }

            if (before.totalXP !== after.totalXP) {
                await this.updateLeaderboard(event.documentId, after.totalXP);
            }
        }
    }

    /**
     * Handle game completion
     */
    private static async handleGameChange(event: ChangeEvent): Promise<void> {
        if (event.operation === 'create') {
            const game = event.after;

            await Promise.allSettled([
                this.updateLeaderboard(game.userId, game.xpEarned),
                this.updateAnalytics('game_completed', game),
                this.updateUserStats(game.userId, {
                    gamesPlayed: 1,
                    totalXP: game.xpEarned
                })
            ]);
        }
    }

    /**
     * Handle event changes
     */
    private static async handleEventChange(event: ChangeEvent): Promise<void> {
        if (event.operation === 'update') {
            // Invalidate event cache
            await redis.del(`event:${event.documentId}`);
            await redis.del('events:upcoming');
        }
    }

    // ============================================
    // Helper Methods
    // ============================================

    private static async updateInventory(order: any): Promise<void> {
        try {
            for (const item of order.items || []) {
                await adminDb.collection('products').doc(item.productId).update({
                    stock: admin.firestore.FieldValue.increment(-item.quantity)
                });
            }
        } catch (error) {
            await logError(error as Error, { orderId: order.id });
        }
    }

    private static async updateAnalytics(
        event: string,
        data: any
    ): Promise<void> {
        try {
            await redis.incr(`analytics:${event}:today`);
            await redis.lpush(`analytics:${event}:recent`, JSON.stringify(data));
            await redis.ltrim(`analytics:${event}:recent`, 0, 99);
        } catch (error) {
            await logError(error as Error, { event, data });
        }
    }

    private static async updateLeaderboard(
        userId: string,
        xp: number
    ): Promise<void> {
        try {
            await redis.zincrby('leaderboard:global', xp, userId);
        } catch (error) {
            await logError(error as Error, { userId, xp });
        }
    }

    private static async updateUserStats(
        userId: string,
        stats: any
    ): Promise<void> {
        try {
            const updates: any = {};

            if (stats.ordersCount) {
                updates.ordersCount = admin.firestore.FieldValue.increment(stats.ordersCount);
            }
            if (stats.gamesPlayed) {
                updates.gamesPlayed = admin.firestore.FieldValue.increment(stats.gamesPlayed);
            }
            if (stats.totalXP) {
                updates.totalXP = admin.firestore.FieldValue.increment(stats.totalXP);
            }

            await adminDb.collection('users').doc(userId).update(updates);
        } catch (error) {
            await logError(error as Error, { userId, stats });
        }
    }

    /**
     * Subscribe to changes (real-time)
     * Note: Upstash Redis doesn't support pub/sub in the same way as regular Redis
     * This method is commented out for now
     */
    /*
    static async subscribeToChanges(
        collection: string,
        callback: (event: ChangeEvent) => void
    ): Promise<any> {
        const subscriber = redis.duplicate();

        await subscriber.subscribe(`changes:${collection}`, (message: string) => {
            try {
                const event = JSON.parse(message);
                callback(event);
            } catch (error) {
                logError(error as Error, { collection, message });
            }
        });

        return subscriber;
    }
    */

    /**
     * Get recent changes
     */
    static async getRecentChanges(
        collection: string,
        limit: number = 50
    ): Promise<ChangeEvent[]> {
        try {
            const streamKey = `cdc:${collection}`;
            // Upstash Redis xrevrange: (key, end, start, count)
            const messages = await redis.xrevrange(streamKey, '+', '-', limit) as unknown as any[];

            // Check if messages is valid and is an array
            if (!messages || !Array.isArray(messages) || messages.length === 0) {
                return [];
            }

            return messages.map((msg: any) => ({
                collection,
                documentId: msg.message.documentId,
                operation: msg.message.operation,
                before: JSON.parse(msg.message.before),
                after: JSON.parse(msg.message.after),
                timestamp: parseInt(msg.message.timestamp),
                userId: msg.message.userId
            }));
        } catch (error) {
            await logError(error as Error, { collection });
            return [];
        }
    }
}

// Helper functions for common CDC scenarios
export async function captureOrderCreation(
    orderId: string,
    orderData: any
): Promise<void> {
    await ChangeDataCapture.captureChange({
        collection: 'orders',
        documentId: orderId,
        operation: 'create',
        after: orderData,
        timestamp: Date.now(),
        userId: orderData.userId
    });
}

export async function captureUserUpdate(
    userId: string,
    beforeData: any,
    afterData: any
): Promise<void> {
    await ChangeDataCapture.captureChange({
        collection: 'users',
        documentId: userId,
        operation: 'update',
        before: beforeData,
        after: afterData,
        timestamp: Date.now(),
        userId
    });
}

export async function captureGameCompletion(
    gameId: string,
    gameData: any
): Promise<void> {
    await ChangeDataCapture.captureChange({
        collection: 'gameResults',
        documentId: gameId,
        operation: 'create',
        after: gameData,
        timestamp: Date.now(),
        userId: gameData.userId
    });
}
