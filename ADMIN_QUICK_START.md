# Admin Panel Quick Start Guide

## 🚀 Access Admin Panel

**URL:** `http://localhost:3001/admin`

**Login Required:** Yes (must have `isAdmin: true` in Firestore)

---

## ✅ Quick Setup Checklist

### Step 1: Initialize Game Content
1. Go to **Game Content** (`/admin/game-content`)
2. Click **"INITIALIZE CONTENT"** button
3. Wait for success message ✅
4. This populates Firestore with riddles, trivia, wordle words, etc.

### Step 2: Configure Game Settings
1. Go to **Games** (`/admin/games`)
2. Review default settings for each game
3. Adjust points/retries as needed
4. Click **"SAVE"** for each game you modify

### Step 3: Set Game of the Day (Optional)
1. In **Games** page, find any game
2. Click **"SET AS GOTD"** button
3. That game now awards 2x points!

### Step 4: Test Everything
1. Go to **API Test** (`/admin/api-test`)
2. Click **"RUN TESTS"**
3. Verify all endpoints return success ✅

---

## 📋 Admin Features Overview

| Feature | URL | Purpose |
|---------|-----|---------|
| **Dashboard** | `/admin/dashboard` | Overview, stats, quick actions |
| **Games** | `/admin/games` | Configure points, retries, Game of the Day |
| **Gamification** | `/admin/gamification` | Wheel odds, economy rules |
| **Game Content** | `/admin/game-content` | Add/edit riddles, trivia, puzzles |
| **API Test** | `/admin/api-test` | Test all endpoints |
| **Users** | `/admin/users` | Manage users |
| **Events** | `/admin/events` | Create/manage events |
| **Products** | `/admin/products` | Shop inventory |

---

## 🎮 Game Settings Explained

### Base Points
Points awarded when user completes the game successfully.

### Retry Penalty
Points deducted for each retry attempt (e.g., -2 points per retry).

### Max Retries
Maximum number of times user can retry before game ends.

### Scratcher
Enable random bonus points after game completion.

### Game of the Day
- Selected game awards **2x points**
- Changes daily (or manually)
- Shows special badge on game card

---

## 🔄 Daily Rotation

**What it does:** Automatically shows different games each day

**How to enable:**
1. Go to `/admin/games`
2. Find "Daily Rotation Policy" section
3. Check "Enable Daily Rotation"
4. Set "Games Per Day" (default: 5)
5. Click "SAVE ROTATION POLICY"

**Manual rotation:** Click "ROTATE NOW" to change games immediately

---

## 💾 Game Content Types

| Game | Fields Required |
|------|----------------|
| **Riddle** | Question, Answer, Hint |
| **Trivia** | Question, 4 Options, Correct Index, Category |
| **Wordle** | 5-letter word (uppercase) |
| **Hangman** | Word (uppercase), Category |
| **Word Search** | Words list, Theme |
| **Chess** | FEN notation, Solution, Difficulty |

---

## 🧪 Testing Endpoints

### Browser Test (Recommended)
1. Visit `/admin/api-test`
2. Click "RUN TESTS"
3. View results in real-time

### Node.js Test (Advanced)
1. Open `test-api-endpoints.js`
2. Replace `YOUR_FIREBASE_AUTH_TOKEN_HERE` with real token
3. Run: `node test-api-endpoints.js`

---

## 🔐 API Authentication

**All admin endpoints require:**
```
Authorization: Bearer {firebase-token}
```

**Get token in browser:**
```javascript
const token = await user.getIdToken();
```

**Protected endpoints:**
- POST /api/games/settings
- POST /api/games/game-of-the-day
- POST /api/games/rotation-policy
- POST /api/games/content
- POST /api/games/content/initialize
- POST /api/games/award
- GET /api/games/history

---

## 📊 Key Firestore Collections

| Collection | Purpose |
|------------|---------|
| `gameSettings` | Game configuration (points, retries) |
| `gameContent` | Riddles, trivia, puzzles |
| `gameHistory` | User play history |
| `gameOfTheDay` | Current featured game |
| `rotationPolicy` | Daily rotation settings |
| `users` | User data (includes points balance) |

---

## ⚠️ Common Issues

### "Content not found" (404)
**Solution:** Initialize content at `/admin/game-content`

### "Unauthorized" (401)
**Solution:** 
- Make sure you're logged in
- Verify `isAdmin: true` in your Firestore user document

### "Already played today" (409)
**Solution:** This is expected - users can only play each game once per day

### Games not rotating
**Solution:**
- Enable rotation policy
- Click "ROTATE NOW" for manual rotation
- Check `rotationSchedule` in Firestore

---

## 🎯 Best Practices

1. **Always test after changes** - Use API Test page
2. **Backup before bulk operations** - Export Firestore data
3. **Set reasonable point values** - Balance economy
4. **Monitor user feedback** - Adjust difficulty/rewards
5. **Use Game of the Day strategically** - Promote specific games

---

## 📞 Need Help?

- Check `/docs/ADMIN_FEATURES.md` for detailed documentation
- Review API responses in browser DevTools
- Check Firestore console for data verification
- Test endpoints at `/admin/api-test`

---

## 🎉 You're Ready!

Your admin panel is fully configured. Start by:
1. ✅ Initializing content
2. ✅ Setting up games
3. ✅ Testing endpoints
4. ✅ Monitoring dashboard

Happy administrating! 🚀
