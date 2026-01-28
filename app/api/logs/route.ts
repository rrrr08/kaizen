import { NextRequest, NextResponse } from 'next/server';
import { LogAggregator } from '@/lib/log-aggregator';
import { withRateLimit, RateLimitPresets } from '@/lib/redis-rate-limit';

async function handler(req: NextRequest) {
    try {
        const body = await req.json();
        const { level, event, data, metadata } = body;

        // Basic validation
        if (!level || !event) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Add server-side metadata
        const enrichedMetadata = {
            ...metadata,
            ip: req.headers.get('x-forwarded-for') || 'unknown',
            userAgent: req.headers.get('user-agent') || 'unknown',
        };

        await LogAggregator.log({
            timestamp: Date.now(),
            level: level as 'info' | 'warn' | 'error',
            event,
            userId: body.userId, // Optional, sent from client if available
            data,
            metadata: enrichedMetadata
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        // Silent fail for logs to avoid infinite loops
        return NextResponse.json(
            { error: 'Failed to ingest log' },
            { status: 500 }
        );
    }
}

// Stricter rate limit for public logging endpoint
export const POST = withRateLimit(
    {
        endpoint: 'api:logs',
        maxRequests: 20, // 20 logs per minute per IP
        windowSeconds: 60,
    },
    handler
);
