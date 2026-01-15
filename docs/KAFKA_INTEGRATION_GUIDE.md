
# Kafka Integration Guide for Next.js (Serverless)

## 🎯 Recommended Approach: Upstash Kafka

Since you are using **Next.js on Vercel** (serverless environment) and already use `@upstash/redis`, the best way to integrate Kafka is using **Upstash Kafka**.

### Why Upstash Kafka?

- **Serverless-friendly**: Standard Kafka clients (`kafkajs`, `node-rdkafka`) maintain persistent TCP connections, which causes issues in serverless functions (lambda) that spin up and down. Upstash provides a REST-based API perfect for serverless.
- **No Management**: Fully managed, no Zookeeper or broker management.
- **Consumption**: Works great with Next.js API Routes (Producers) and Vercel Functions or Cron Jobs (Consumers).

---

## 🚀 Implementation Steps

### 1. Install Dependencies

You need the Upstash Kafka SDK, which is optimized for serverless (HTTP-based).

```bash
npm install @upstash/kafka
```

### 2. Configure Environment

Create a Kafka cluster in the [Upstash Console](https://console.upstash.com/kafka) and add credentials to `.env.local`:

```env
UPSTASH_KAFKA_REST_URL="https://your-cluster-url.upstash.io"
UPSTASH_KAFKA_REST_USERNAME="your-username"
UPSTASH_KAFKA_REST_PASSWORD="your-password"
```

### 3. Create a Helper (`lib/kafka.ts`)

Centralize your Kafka client configuration.

```typescript
import { Kafka } from "@upstash/kafka";

export const kafka = new Kafka({
  url: process.env.UPSTASH_KAFKA_REST_URL!,
  username: process.env.UPSTASH_KAFKA_REST_USERNAME!,
  password: process.env.UPSTASH_KAFKA_REST_PASSWORD!,
});
```

---

## 💻 Usage Patterns

### Pattern A: Producing Events (e.g., User Activity Log)

Send events from your API routes or Server Actions.

**Example: `app/api/events/track/route.ts`**

```typescript
import { kafka } from '@/lib/kafka';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();

  // Non-blocking produce
  const p = kafka.producer();
  const result = await p.produce("user_activity_events", JSON.stringify(body));

  return NextResponse.json({ success: true, meta: result });
}
```

### Pattern B: Consuming Events (The Serverless Challenge)

In a traditional app, you run a "worker" process that listens 24/7. In Next.js/Vercel, you don't have long-running processes.

**Option 1: Scheduled Processing (Cron Jobs)**
Use Vercel Cron to trigger a function every minute that pulls a batch of messages.

**Example: `app/api/cron/process-events/route.ts`**

```typescript
export async function GET() {
  const consumer = kafka.consumer();
  
  // Fetch batch of messages
  const messages = await consumer.fetch({
    topic: "user_activity_events",
    partition: 0,
    offset: "earliest", // or track your own offset
    limit: 100, // Process max 100 at a time
  });

  for (const msg of messages) {
    console.log("Processing:", msg.value);
    // ... Save to DB, trigger email, etc.
  }

  return NextResponse.json({ processed: messages.length });
}
```

**Option 2: Webhooks (QStash + Kafka)**
If you use Upstash QStash, you can have it "push" Kafka events to your API endpoints as webhooks.

### Pattern C: Real-time Updates (SSE/WebSockets)

If you need to push Kafka events to the frontend:

1. Producer sends event to Kafka.
2. A separate worker (or Vercel Cron) reads from Kafka.
3. The worker publishes to **Redis Pub/Sub** or **Ably/Pusher**.
4. The frontend subscribes to Redis/Ably to get the update.

*(Direct Kafka -> Frontend is not secure or recommended)*

---

## 📦 Alternative: Confluent Cloud

If you prefer standard Kafka (Confluent):

- **Pros**: Full Kafka ecosystem compatibility.
- **Cons**: Requires `kafkajs`. In Next.js, you must be careful about connection reuse. You typically need a separate long-running server (like a container on Railway/Fly.io) to run the consumer securely, as Vercel functions scale to zero.

**Recommendation**: Stick to **Upstash Kafka** for a pure Next.js/Vercel stack.
