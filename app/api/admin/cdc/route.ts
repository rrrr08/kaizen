import { NextRequest, NextResponse } from 'next/server';
import { ChangeDataCapture } from '@/lib/change-data-capture';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const collection = searchParams.get('collection') || 'all';
        const limit = parseInt(searchParams.get('limit') || '100');

        if (collection === 'all') {
            // Get changes from all collections
            const [orders, users, games, events] = await Promise.all([
                ChangeDataCapture.getRecentChanges('orders', 25),
                ChangeDataCapture.getRecentChanges('users', 25),
                ChangeDataCapture.getRecentChanges('gameResults', 25),
                ChangeDataCapture.getRecentChanges('events', 25)
            ]);

            const changes = [...orders, ...users, ...games, ...events]
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, limit);

            return NextResponse.json({ changes });
        }

        const changes = await ChangeDataCapture.getRecentChanges(collection, limit);
        return NextResponse.json({ changes });
    } catch (error) {
        console.error('Failed to get changes:', error);
        return NextResponse.json(
            { error: 'Failed to get changes' },
            { status: 500 }
        );
    }
}
