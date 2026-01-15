import { NextRequest, NextResponse } from 'next/server';
import { LogAggregator } from '@/lib/log-aggregator';
import { withRateLimit, RateLimitPresets } from '@/lib/redis-rate-limit';

async function handler(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const level = searchParams.get('level') || 'all';
        const limit = parseInt(searchParams.get('limit') || '100');

        const logs = await LogAggregator.getRecentLogs(
            level as any,
            limit
        );

        return NextResponse.json({ logs });
    } catch (error) {
        console.error('Failed to get logs:', error);
        return NextResponse.json(
            { error: 'Failed to get logs' },
            { status: 500 }
        );
    }
}

// Export with rate limiting (30 requests per minute)
export const GET = withRateLimit(
    {
        endpoint: 'api:admin:logs',
        ...RateLimitPresets.api,
    },
    handler
);
