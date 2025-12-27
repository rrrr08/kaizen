# Game System API Examples

## 🧪 Testing API Endpoints

### 1. Initialize Game Settings (Admin Only)

**First time setup - creates default configurations**

```bash
# cURL
curl -X POST http://localhost:3000/api/games/initialize \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"

# JavaScript (Browser Console)
fetch('/api/games/initialize', {
  method: 'POST',
  credentials: 'include'
}).then(r => r.json()).then(console.log);
```

**Response:**
```json
{
  "success": true,
  "message": "Game settings initialized successfully",
  "gamesConfigured": ["sudoku", "riddle", "wordle", "chess", "trivia"],
  "gameOfTheDay": "sudoku"
}
```

---

### 2. Get Game of the Day

**Check which game has 2x points today**

```bash
# cURL
curl http://localhost:3000/api/games/game-of-the-day

# JavaScript
fetch('/api/games/game-of-the-day')
  .then(r => r.json())
  .then(console.log);
```

**Response:**
```json
{
  "gameId": "sudoku",
  "date": "2025-12-27",
  "gameName": "Sudoku"
}
```

---

### 3. Set Game of the Day (Admin Only)

**Manually set a specific game as GOTD**

```bash
# cURL
curl -X POST http://localhost:3000/api/games/game-of-the-day \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "gameId": "riddle",
    "gameName": "Daily Riddle"
  }'

# JavaScript
fetch('/api/games/game-of-the-day', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    gameId: 'riddle',
    gameName: 'Daily Riddle'
  })
}).then(r => r.json()).then(console.log);
```

**Response:**
```json
{
  "success": true,
  "gameId": "riddle",
  "date": "2025-12-27"
}
```

---

### 4. Award Points (After Winning Game)

**Called automatically by game components**

```bash
# cURL
curl -X POST http://localhost:3000/api/games/award \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "gameId": "sudoku",
    "retry": 2,
    "level": "medium",
    "time": 240
  }'

# JavaScript
fetch('/api/games/award', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    gameId: 'sudoku',
    retry: 2,
    level: 'medium',
    time: 240
  })
}).then(r => r.json()).then(console.log);
```

**Success Response:**
```json
{
  "success": true,
  "awardedPoints": 28,
  "isGameOfDay": true,
  "message": "You earned 28 points! (Game of the Day - 2x Points!)"
}
```

**Already Played Response (409):**
```json
{
  "error": "Already played today",
  "message": "You can only earn points once per day for this game. Come back tomorrow!"
}
```

**Calculation:**
- Base points: 20
- Retry penalty: 2 × 3 = 6
- Subtotal: 20 - 6 = 14
- Game of the Day: 14 × 2 = **28 points**

---

### 5. Get All Game Settings

**View current configuration for all games**

```bash
# cURL
curl http://localhost:3000/api/games/settings

# JavaScript
fetch('/api/games/settings')
  .then(r => r.json())
  .then(console.log);
```

**Response:**
```json
{
  "settings": {
    "sudoku": {
      "name": "Sudoku",
      "basePoints": 20,
      "retryPenalty": 3,
      "maxRetries": 3,
      "scratcher": {
        "enabled": false,
        "drops": [
          { "prob": 0.5, "points": 10, "label": "Bronze" },
          { "prob": 0.3, "points": 25, "label": "Silver" },
          { "prob": 0.15, "points": 50, "label": "Gold" },
          { "prob": 0.05, "points": 100, "label": "Diamond" }
        ]
      }
    },
    "riddle": {
      "name": "Daily Riddle",
      "basePoints": 15,
      "retryPenalty": 2,
      "maxRetries": 5,
      "scratcher": { "enabled": false }
    }
  }
}
```

---

### 6. Update Game Settings (Admin Only)

**Change points, penalties, or other settings**

```bash
# cURL
curl -X POST http://localhost:3000/api/games/settings \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "gameId": "sudoku",
    "name": "Sudoku Master",
    "basePoints": 30,
    "retryPenalty": 5,
    "maxRetries": 3
  }'

# JavaScript
fetch('/api/games/settings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    gameId: 'sudoku',
    name: 'Sudoku Master',
    basePoints: 30,
    retryPenalty: 5,
    maxRetries: 3
  })
}).then(r => r.json()).then(console.log);
```

**Response:**
```json
{
  "success": true,
  "gameId": "sudoku",
  "config": {
    "name": "Sudoku Master",
    "basePoints": 30,
    "retryPenalty": 5,
    "maxRetries": 3
  }
}
```

---

### 7. Enable Scratcher for a Game (Admin Only)

**Add random bonus points feature**

```bash
# JavaScript
fetch('/api/games/settings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    gameId: 'riddle',
    scratcher: {
      enabled: true,
      drops: [
        { prob: 0.5, points: 5, label: 'Bronze' },
        { prob: 0.3, points: 15, label: 'Silver' },
        { prob: 0.15, points: 30, label: 'Gold' },
        { prob: 0.05, points: 50, label: 'Diamond' }
      ]
    }
  })
}).then(r => r.json()).then(console.log);
```

---

### 8. Get Leaderboard

**View top players for a game**

```bash
# cURL
curl "http://localhost:3000/api/games/leaderboard?gameId=sudoku&limit=10"

# JavaScript
fetch('/api/games/leaderboard?gameId=sudoku&limit=10')
  .then(r => r.json())
  .then(console.log);
```

**Response:**
```json
{
  "leaderboard": [
    {
      "userId": "user123abc",
      "totalPoints": 450,
      "gamesPlayed": 15,
      "lastPlayed": "2025-12-27T10:30:00Z",
      "bestTime": 180,
      "level": "hard"
    },
    {
      "userId": "user456def",
      "totalPoints": 380,
      "gamesPlayed": 12,
      "lastPlayed": "2025-12-27T09:15:00Z",
      "bestTime": 220,
      "level": "medium"
    }
  ]
}
```

---

### 9. Get User Game History

**View personal play history**

```bash
# cURL
curl "http://localhost:3000/api/games/history?gameId=sudoku" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"

# JavaScript
fetch('/api/games/history?gameId=sudoku', {
  credentials: 'include'
}).then(r => r.json()).then(console.log);
```

**Response:**
```json
{
  "history": [
    {
      "id": "sudoku_2025-12-27",
      "gameId": "sudoku",
      "userId": "user123abc",
      "date": "2025-12-27",
      "points": 28,
      "retries": 2,
      "level": "medium",
      "time": 240,
      "awardedAt": "2025-12-27T10:30:00Z",
      "isGameOfDay": true
    },
    {
      "id": "sudoku_2025-12-26",
      "gameId": "sudoku",
      "userId": "user123abc",
      "date": "2025-12-26",
      "points": 17,
      "retries": 1,
      "level": "easy",
      "time": 180,
      "awardedAt": "2025-12-26T14:20:00Z",
      "isGameOfDay": false
    }
  ]
}
```

---

## 🧪 Testing Scenarios

### Scenario 1: First Time Player

```javascript
// 1. Initialize system (admin)
await fetch('/api/games/initialize', { method: 'POST' });

// 2. Check Game of the Day
const gotd = await fetch('/api/games/game-of-the-day').then(r => r.json());
console.log('Today\'s GOTD:', gotd.gameId);

// 3. Play the game (in game component)
// ... player wins ...

// 4. Award points
const result = await fetch('/api/games/award', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    gameId: gotd.gameId,
    retry: 0
  })
}).then(r => r.json());

console.log('Points earned:', result.awardedPoints);
// Expected: basePoints × 2 (if GOTD)
```

---

### Scenario 2: Testing Daily Restriction

```javascript
// 1. Play game first time today
const first = await fetch('/api/games/award', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ gameId: 'sudoku', retry: 0 })
}).then(r => r.json());

console.log('First play:', first);
// Expected: { success: true, awardedPoints: 20 }

// 2. Try to play again immediately
const second = await fetch('/api/games/award', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ gameId: 'sudoku', retry: 0 })
}).then(r => r.json());

console.log('Second play:', second);
// Expected: { error: 'Already played today', message: '...' }
```

---

### Scenario 3: Testing Retry Penalty

```javascript
// Sudoku: basePoints=20, retryPenalty=3

// No retries
await fetch('/api/games/award', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ gameId: 'sudoku', retry: 0 })
}).then(r => r.json());
// Expected: 20 points

// 2 retries (next day)
await fetch('/api/games/award', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ gameId: 'sudoku', retry: 2 })
}).then(r => r.json());
// Expected: 20 - (2 × 3) = 14 points

// 5 retries (next day)
await fetch('/api/games/award', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ gameId: 'sudoku', retry: 5 })
}).then(r => r.json());
// Expected: max(20 - (5 × 3), 1) = 5 points
```

---

### Scenario 4: Admin Configuration

```javascript
// 1. View current settings
const settings = await fetch('/api/games/settings').then(r => r.json());
console.log('Current Sudoku points:', settings.settings.sudoku.basePoints);

// 2. Update settings
await fetch('/api/games/settings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    gameId: 'sudoku',
    basePoints: 50,
    retryPenalty: 10
  })
}).then(r => r.json());

// 3. Verify update
const updated = await fetch('/api/games/settings').then(r => r.json());
console.log('Updated Sudoku points:', updated.settings.sudoku.basePoints);
// Expected: 50

// 4. Play game with new settings
const result = await fetch('/api/games/award', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ gameId: 'sudoku', retry: 1 })
}).then(r => r.json());
// Expected: 50 - (1 × 10) = 40 points
```

---

## 🔐 Authentication Notes

All API calls require authentication except:
- `GET /api/games/game-of-the-day`
- `GET /api/games/settings`
- `GET /api/games/leaderboard`

Admin-only endpoints:
- `POST /api/games/initialize`
- `POST /api/games/game-of-the-day`
- `POST /api/games/settings`

User-specific endpoints (require auth):
- `POST /api/games/award`
- `GET /api/games/history`

---

## 📝 Response Status Codes

- **200** - Success
- **401** - Unauthorized (not logged in or not admin)
- **400** - Bad Request (missing parameters)
- **409** - Conflict (already played today)
- **500** - Internal Server Error

---

## 🎯 Quick Test Script

Copy and paste this into your browser console:

```javascript
// Complete test flow
async function testGameSystem() {
  console.log('🎮 Testing Game System...\n');
  
  // 1. Check GOTD
  const gotd = await fetch('/api/games/game-of-the-day').then(r => r.json());
  console.log('✅ Game of the Day:', gotd.gameId);
  
  // 2. Get settings
  const settings = await fetch('/api/games/settings').then(r => r.json());
  console.log('✅ Settings loaded:', Object.keys(settings.settings).length, 'games');
  
  // 3. Award points (will fail if already played)
  const award = await fetch('/api/games/award', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gameId: 'sudoku', retry: 1 })
  }).then(r => r.json());
  console.log('✅ Award result:', award);
  
  // 4. Get leaderboard
  const leaderboard = await fetch('/api/games/leaderboard?gameId=sudoku&limit=5')
    .then(r => r.json());
  console.log('✅ Leaderboard:', leaderboard.leaderboard.length, 'entries');
  
  // 5. Get history
  const history = await fetch('/api/games/history?gameId=sudoku')
    .then(r => r.json());
  console.log('✅ History:', history.history.length, 'games played');
  
  console.log('\n🎉 All tests complete!');
}

testGameSystem();
```

---

**Happy Testing! 🧪**
