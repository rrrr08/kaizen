# Manual Testing Guide - Rate Limiting & Redis

## 🧪 Complete Endpoint Testing Checklist

This guide shows you how to manually test all rate-limited endpoints and Redis features.

---

## ✅ Protected Endpoints Summary

| # | Endpoint | Method | Rate Limit | Auth Required |
|---|----------|--------|------------|---------------|
| 1 | `/api/leaderboard` | GET | 100/min | No |
| 2 | `/api/games/spin` | POST | 10/min | Yes |
| 3 | `/api/games/claim` | POST | 30/min | Yes |
| 4 | `/api/payments/create-order` | POST | 5/5min | No |
| 5 | `/api/payments/verify` | POST | 5/5min | No |
| 6 | `/api/auth/reset-password` | POST | 5/5min | No |

---

## 🔧 Testing Tools

### Option 1: Browser (Easiest)
Just visit the URL and refresh multiple times

### Option 2: cURL (Command Line)
Copy-paste commands in terminal

### Option 3: Postman/Thunder Client
Import the requests

---

## 📋 Test Each Endpoint

### 1. **Leaderboard API** (100 req/min)

#### Test Caching
```bash
# First request (cache miss)
curl http://localhost:3000/api/leaderboard

# Second request (cache hit - within 60 seconds)
curl http://localhost:3000/api/leaderboard
```

**Expected Results:**
- First request: `"cached": false`
- Second request: `"cached": true`

#### Test Rate Limiting
```bash
# Send 101 requests (limit is 100/min)
for i in {1..101}; do
  curl -s http://localhost:3000/api/leaderboard | jq '.success'
  echo "Request $i"
done
```

**Expected Results:**
- Requests 1-100: `true`
- Request 101: `false` with 429 status

---

### 2. **Daily Spin API** (10 req/min)

#### Test Rate Limiting
```bash
# Send 11 requests (limit is 10/min)
for i in {1..11}; do
  curl -X POST http://localhost:3000/api/games/spin \
    -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"isFreeSpin": false}'
  echo "\nRequest $i"
  sleep 1
done
```

**Expected Results:**
- Requests 1-10: Success (or auth error if no token)
- Request 11: 429 Too Many Requests

**How to get Firebase token:**
1. Open browser DevTools (F12)
2. Go to Application → Local Storage
3. Find your auth token
4. Or login and check Network tab for Authorization header

---

### 3. **Game Claim API** (30 req/min)

#### Test Rate Limiting
```bash
# Send 31 requests (limit is 30/min)
for i in {1..31}; do
  curl -X POST http://localhost:3000/api/games/claim \
    -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"gameId": "chess", "points": 10}'
  echo "\nRequest $i"
done
```

**Expected Results:**
- Requests 1-30: Success (or auth error)
- Request 31: 429 Too Many Requests

---

### 4. **Payment Create Order API** (5 req/5min) 🔴 STRICT

#### Test Rate Limiting
```bash
# Send 6 requests (limit is 5 per 5 minutes)
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/payments/create-order \
    -H "Content-Type: application/json" \
    -d '{
      "amount": 100,
      "currency": "INR",
      "receipt": "test_receipt_'$i'",
      "notes": {"test": true}
    }'
  echo "\n\nRequest $i"
  sleep 2
done
```

**Expected Results:**
- Requests 1-5: Success (creates Razorpay order)
- Request 6: 429 Too Many Requests
- **Wait 5 minutes** to reset

---

### 5. **Payment Verify API** (5 req/5min) 🔴 STRICT

#### Test Rate Limiting
```bash
# Send 6 requests (limit is 5 per 5 minutes)
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/payments/verify \
    -H "Content-Type: application/json" \
    -d '{
      "razorpay_payment_id": "test_payment_'$i'",
      "razorpay_order_id": "test_order_'$i'",
      "razorpay_signature": "test_signature"
    }'
  echo "\n\nRequest $i"
  sleep 2
done
```

**Expected Results:**
- Requests 1-5: Signature mismatch error (expected)
- Request 6: 429 Too Many Requests
- **Wait 5 minutes** to reset

---

### 6. **Reset Password API** (5 req/5min) 🔴 STRICT

#### Test Rate Limiting
```bash
# Send 6 requests (limit is 5 per 5 minutes)
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/reset-password \
    -H "Content-Type: application/json" \
    -d '{"email": "test@example.com"}'
  echo "\n\nRequest $i"
  sleep 2
done
```

**Expected Results:**
- Requests 1-5: Success (email sent or user not found)
- Request 6: 429 Too Many Requests
- **Wait 5 minutes** to reset

---

## 🔍 Check Rate Limit Headers

All rate-limited endpoints return these headers:

```bash
curl -I http://localhost:3000/api/leaderboard
```

**Look for:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1737012360
```

---

## 📊 Monitor in Upstash Dashboard

### View Rate Limit Keys

1. Go to https://console.upstash.com/
2. Click your database
3. Go to **Data Browser** tab
4. Look for keys like:
   ```
   ratelimit:api:leaderboard:127.0.0.1:1737012300
   ratelimit:api:games:spin:127.0.0.1:1737012300
   ratelimit:api:payments:create-order:127.0.0.1:1737012300
   ```

### What You'll See

```
Key: ratelimit:api:leaderboard:127.0.0.1:1737012300
Type: string
Value: 5  (number of requests made)
TTL: 45s  (time until reset)
```

---

## 🧪 Quick Test Script (All Endpoints)

Save this as `test-rate-limits.sh`:

```bash
#!/bin/bash

echo "🧪 Testing All Rate-Limited Endpoints"
echo "======================================"

# Test 1: Leaderboard (should succeed)
echo "\n1️⃣ Testing Leaderboard (100/min)..."
curl -s http://localhost:3000/api/leaderboard | jq '.success, .cached'

# Test 2: Leaderboard again (should be cached)
echo "\n2️⃣ Testing Leaderboard Cache..."
curl -s http://localhost:3000/api/leaderboard | jq '.success, .cached'

# Test 3: Payment Create (should succeed)
echo "\n3️⃣ Testing Payment Create Order (5/5min)..."
curl -s -X POST http://localhost:3000/api/payments/create-order \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "currency": "INR"}' | jq '.success // .error'

# Test 4: Reset Password (should succeed)
echo "\n4️⃣ Testing Reset Password (5/5min)..."
curl -s -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}' | jq '.success // .error'

echo "\n\n✅ Basic tests complete!"
echo "Run individual tests above to trigger rate limits"
```

**Run it:**
```bash
chmod +x test-rate-limits.sh
./test-rate-limits.sh
```

---

## 📝 Testing Checklist

### Leaderboard
- [ ] First request shows `"cached": false`
- [ ] Second request shows `"cached": true`
- [ ] 101st request returns 429
- [ ] Cache expires after 60 seconds

### Daily Spin
- [ ] 11th request returns 429
- [ ] Rate limit resets after 60 seconds
- [ ] Daily limit prevents free spin twice

### Game Claim
- [ ] 31st request returns 429
- [ ] Rate limit resets after 60 seconds

### Payment Create
- [ ] 6th request returns 429
- [ ] Rate limit resets after 5 minutes
- [ ] Headers show remaining requests

### Payment Verify
- [ ] 6th request returns 429
- [ ] Rate limit resets after 5 minutes

### Reset Password
- [ ] 6th request returns 429
- [ ] Rate limit resets after 5 minutes

---

## 🎯 Expected 429 Response

When rate limit is exceeded:

```json
{
  "error": "Too many requests. Please try again later.",
  "retryAfter": 45
}
```

**Headers:**
```
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1737012360
Retry-After: 45
```

---

## 🔧 Troubleshooting

### Rate Limit Not Working?

1. **Check Redis connection:**
   ```bash
   curl http://localhost:3000/api/redis-test
   ```
   Should return: `"success": true`

2. **Check environment variables:**
   - `UPSTASH_REDIS_REST_URL` set?
   - `UPSTASH_REDIS_REST_TOKEN` set?

3. **Restart dev server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

### Rate Limit Keys Not Appearing?

- Make sure you're making requests
- Check Upstash Data Browser
- Refresh the page
- Keys expire after TTL (60s or 300s)

---

## ✅ Success Criteria

Your rate limiting is working if:

1. ✅ Leaderboard caches data (`"cached": true`)
2. ✅ 101st leaderboard request returns 429
3. ✅ 11th spin request returns 429
4. ✅ 31st claim request returns 429
5. ✅ 6th payment request returns 429 (wait 5 min to reset)
6. ✅ 6th auth request returns 429 (wait 5 min to reset)
7. ✅ Rate limit keys appear in Upstash dashboard
8. ✅ Headers show limit/remaining/reset info

---

## 🚀 Production Testing

After deploying to Vercel:

```bash
# Replace with your production URL
PROD_URL="https://joy-juncture.vercel.app"

# Test leaderboard
curl $PROD_URL/api/leaderboard

# Test rate limiting
for i in {1..101}; do
  curl -s $PROD_URL/api/leaderboard | jq '.success'
done
```

---

**Ready to test?** Start with the leaderboard endpoint - it's the easiest! 🧪
