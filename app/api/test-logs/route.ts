import { NextRequest, NextResponse } from 'next/server';
import { logUserActivity, logError, LogAggregator } from '@/lib/log-aggregator';
import { withRateLimit, RateLimitPresets } from '@/lib/redis-rate-limit';

async function handler(req: NextRequest) {
    try {
        // Create some test logs
        await logUserActivity('test-user-123', 'test_action', {
            message: 'This is a test log',
            timestamp: new Date().toISOString()
        });

        await LogAggregator.log({
            timestamp: Date.now(),
            level: 'info',
            event: 'test_info',
            data: { test: 'Info log example' }
        });

        await LogAggregator.log({
            timestamp: Date.now(),
            level: 'warn',
            event: 'test_warning',
            data: { test: 'Warning log example' }
        });

        await LogAggregator.log({
            timestamp: Date.now(),
            level: 'error',
            event: 'test_error',
            data: { test: 'Error log example' }
        });

        return NextResponse.json({
            success: true,
            message: 'Test logs created! Check /admin/logs to see them.'
        });
    } catch (error) {
        await logError(error as Error, { endpoint: '/api/test-logs' });
        return NextResponse.json(
            { error: 'Failed to create test logs' },
            { status: 500 }
        );
    }
}

// Export with rate limiting (30 requests per minute)
export const GET = withRateLimit(
    {
        endpoint: 'api:test-logs',
        ...RateLimitPresets.api,
    },
    handler
);
