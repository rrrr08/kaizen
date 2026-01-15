# Redis Integration Guide

## Overview

Joy Juncture uses **Upstash Redis** for high-performance caching, rate limiting, leaderboards, and session management. This guide covers setup, usage, and best practices.

## Why Redis?

- **Performance**: 10x faster leaderboard queries using sorted sets
- **Cost Optimization**: 60-80% reduction in Firestore reads
- **Rate Limiting**: Protect APIs from abuse
- **Session Management**: Better guest user experience
- **Real-time Analytics**: Track active users and popular games

## Setup

### 1. Create Upstash Account

1. Go to [console.upstash.com](https://console.upstash.com/)
2. Sign up for a free account
3. Create a new Redis database
4. Select a region close to your users (e.g., `us-east-1`)

### 2. Get Credentials

From your Upstash dashboard:
1. Click on your database
2. Scroll to "REST API" section
3. Copy `UPSTASH_REDIS_REST_URL`
4. Copy `UPSTASH_REDIS_REST_TOKEN`

### 3. Add to Environment

Add to `.env.local`:

```env
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token_here
```

## Features

### 1. Rate Limiting

Protect your APIs from abuse with configurable rate limits.

#### Usage Example

```typescript
import { withRateLimit, RateLimitPresets } from '@/lib/redis-rate-limit';

// Wrap your API handler
export const GET = withRateLimit(
  {
    endpoint: 'api:games:wordle',
    ...RateLimitPresets.game, // 10 requests per minute
  },
  async (req) => {
    // Your handler logic
    return NextResponse.json({ success: true });
  }
);
```

#### Presets

- `RateLimitPresets.game`: 10 req/min (strict, for games)
- `RateLimitPresets.api`: 30 req/min (moderate)
- `RateLimitPresets.read`: 100 req/min (generous, for reads)
- `RateLimitPresets.auth`: 5 req/5min (very strict, for auth)

### 2. Leaderboards

Fast, scalable leaderboards using Redis sorted sets.

#### Update Score

```typescript
import { updateLeaderboardScore } from '@/lib/redis-leaderboard';

// Add points to user's score
await updateLeaderboardScore(
  'global',      // scope: 'global' or 'game:chess'
  'alltime',     // period: 'alltime', 'daily', 'weekly'
  userId,
  100,           // points to add
  true           // increment (true) or set absolute (false)
);
```

#### Get Top Players

```typescript
import { getTopLeaderboard } from '@/lib/redis-leaderboard';

const topPlayers = await getTopLeaderboard('global', 'alltime', 100);
// Returns: [{ userId, score, rank }, ...]
```

#### Get User Position

```typescript
import { getUserLeaderboardPosition } from '@/lib/redis-leaderboard';

const position = await getUserLeaderboardPosition('global', 'alltime', userId);
// Returns: { userId, score, rank } or null
```

### 3. Daily Game Tracking

Track and limit daily game attempts (Wordle, Daily Spin, etc.).

#### Check if User Can Play

```typescript
import { canPlayDailyGame } from '@/lib/redis-game-tracker';

const { canPlay, attemptsUsed, attemptsRemaining } = await canPlayDailyGame(
  'wordle',
  userId,
  1  // max attempts per day
);

if (!canPlay) {
  return NextResponse.json({ error: 'Already played today' }, { status: 429 });
}
```

#### Record Attempt

```typescript
import { recordGameAttempt } from '@/lib/redis-game-tracker';

const attempts = await recordGameAttempt('wordle', userId);
```

### 4. Game Sessions

Save active game state in Redis for quick access.

#### Save Session

```typescript
import { saveGameSession } from '@/lib/redis-game-tracker';

await saveGameSession(
  'chess',
  userId,
  {
    gameId: 'chess_123',
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    moves: 'e4,e5,Nf3',
    startedAt: Date.now().toString(),
  },
  3600  // TTL in seconds (1 hour)
);
```

#### Get Session

```typescript
import { getGameSession } from '@/lib/redis-game-tracker';

const session = await getGameSession('chess', userId);
if (session) {
  // Resume game
}
```

### 5. Guest Sessions

Manage guest user sessions (cart, games played, XP).

#### Save Guest Session

```typescript
import { saveGuestSession } from '@/lib/redis-game-tracker';

await saveGuestSession(
  sessionId,
  {
    cart: JSON.stringify(cartItems),
    gamesPlayed: 'chess,sudoku,wordle',
    totalXP: 150,
  },
  86400  // 24 hours
);
```

#### Get Guest Session

```typescript
import { getGuestSession } from '@/lib/redis-game-tracker';

const session = await getGuestSession(sessionId);
```

### 6. Caching

Cache frequently accessed data to reduce Firestore reads.

#### Cache Data

```typescript
import { cacheSet } from '@/lib/redis';

await cacheSet('product', productId, productData, 300); // 5 min TTL
```

#### Get Cached Data

```typescript
import { cacheGet } from '@/lib/redis';

const product = await cacheGet('product', productId);
if (product) {
  // Use cached data
} else {
  // Fetch from Firestore and cache
}
```

### 7. Analytics

Track real-time metrics.

#### Increment Counter

```typescript
import { incrementAnalytics } from '@/lib/redis-game-tracker';

await incrementAnalytics('active_users', 'now');
await incrementAnalytics('games_played', 'today');
```

#### Track Popular Games

```typescript
import { trackGamePlay, getPopularGames } from '@/lib/redis-game-tracker';

// Track a game play
await trackGamePlay('chess');

// Get popular games
const popular = await getPopularGames();
// Returns: [{ game: 'chess', plays: 234 }, ...]
```

## Redis Key Patterns

All keys follow a consistent naming pattern:

```
ratelimit:{endpoint}:{identifier}:{window}
leaderboard:{scope}:{period}:{date?}
session:game:{gameType}:{userId}
attempts:{game}:{userId}:{date}
guest:session:{sessionId}
analytics:{metric}:{period}
cache:{type}:{id}
```

## Best Practices

### 1. Always Set TTL

```typescript
// Good
await redis.setex(key, 3600, value);

// Bad (no expiration)
await redis.set(key, value);
```

### 2. Handle Redis Failures Gracefully

```typescript
try {
  const cached = await cacheGet('product', id);
  if (cached) return cached;
} catch (error) {
  console.error('Redis error:', error);
  // Fall back to Firestore
}
```

### 3. Use Appropriate TTLs

- **Leaderboards**: 60 seconds (frequently updated)
- **Product cache**: 300 seconds (5 minutes)
- **Game sessions**: 3600 seconds (1 hour)
- **Daily attempts**: 86400 seconds (24 hours)
- **Guest sessions**: 86400 seconds (24 hours)

### 4. Batch Operations When Possible

```typescript
// Good - single pipeline
const pipeline = redis.pipeline();
pipeline.incr('counter1');
pipeline.incr('counter2');
await pipeline.exec();

// Bad - multiple round trips
await redis.incr('counter1');
await redis.incr('counter2');
```

## Monitoring

### Health Check

```typescript
import { redisHealthCheck } from '@/lib/redis';

const isHealthy = await redisHealthCheck();
```

### View Metrics

Check your Upstash dashboard for:
- Total commands
- Memory usage
- Request latency
- Error rate

## Troubleshooting

### Connection Errors

**Issue**: `ECONNREFUSED` or timeout errors

**Solution**:
1. Check environment variables are set correctly
2. Verify Upstash database is active
3. Check network connectivity

### Rate Limit Not Working

**Issue**: Users can exceed rate limits

**Solution**:
1. Ensure middleware is applied to route
2. Check identifier function returns consistent values
3. Verify Redis is accessible

### Leaderboard Not Updating

**Issue**: Scores not appearing in leaderboard

**Solution**:
1. Check `updateLeaderboardScore` is called after game completion
2. Verify userId is correct
3. Check Redis sorted set with `redis.zrange(key, 0, -1)`

## Cost Optimization

### Free Tier Limits

Upstash free tier includes:
- 10,000 commands/day
- 256 MB storage
- 1 GB bandwidth

### Staying Within Limits

1. **Use appropriate TTLs** to auto-expire data
2. **Cache strategically** - only cache frequently accessed data
3. **Batch operations** to reduce command count
4. **Monitor usage** in Upstash dashboard

### Estimated Usage

For 1,000 daily active users:
- Rate limiting: ~3,000 commands/day
- Leaderboards: ~2,000 commands/day
- Game sessions: ~1,000 commands/day
- Caching: ~2,000 commands/day

**Total: ~8,000 commands/day** (within free tier)

## Migration from Firestore

If you want to populate Redis leaderboards from existing Firestore data:

```typescript
import { syncLeaderboardFromFirestore } from '@/lib/redis-leaderboard';
import { adminDb } from '@/lib/firebase-admin';

// Fetch users from Firestore
const snapshot = await adminDb
  .collection('users')
  .orderBy('game_xp', 'desc')
  .limit(1000)
  .get();

const users = snapshot.docs.map(doc => ({
  userId: doc.id,
  score: doc.data().game_xp || 0,
}));

// Sync to Redis
await syncLeaderboardFromFirestore('global', 'alltime', users);
```

## Next Steps

1. ✅ Set up Upstash account
2. ✅ Add environment variables
3. ✅ Test leaderboard API
4. 🔄 Add rate limiting to game APIs
5. 🔄 Implement daily game tracking
6. 🔄 Add analytics tracking

---

**Need Help?** Check the [Upstash Documentation](https://docs.upstash.com/redis) or open an issue.
