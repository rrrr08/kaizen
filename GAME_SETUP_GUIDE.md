# 🎮 Game System - Quick Setup Guide

## 🚀 Getting Started (5 Minutes)

### Step 1: Initialize Default Game Settings

As an admin user, call the initialization endpoint:

```bash
# Using curl
curl -X POST http://localhost:3000/api/games/initialize \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie"

# Or using browser console
fetch('/api/games/initialize', { method: 'POST' })
  .then(r => r.json())
  .then(console.log);
```

This creates default settings for 5 games:
- ✅ Sudoku (20 points, -3 per retry)
- ✅ Riddle (15 points, -2 per retry)
- ✅ Wordle (25 points, -4 per retry)
- ✅ Chess Puzzle (30 points, -5 per retry)
- ✅ Trivia Quiz (10 points, -1 per retry)

### Step 2: Access Admin Panel

Navigate to: **`/admin/games`**

Here you can:
- View all configured games
- Edit points and penalties
- Set Game of the Day
- Add new games

### Step 3: Test the Games

1. **Play Sudoku**: `/play/sudoku`
   - Complete the puzzle
   - Check points awarded
   - Try to play again (should see "already played" message)

2. **Play Riddle**: `/play/riddles`
   - Answer the riddle
   - Make mistakes to test retry penalty
   - Check points calculation

### Step 4: Verify Everything Works

✅ **Check User Balance**
- Points should be added to user's wallet
- View at `/wallet` or user profile

✅ **Check Leaderboard**
- Should show your entry
- Visible in game pages

✅ **Check History**
- Your game should appear in history
- Shows date, points, level

✅ **Check Game of the Day**
- One game should have gold badge
- Should award 2x points

## 🎯 Common Tasks

### Change Points for a Game

1. Go to `/admin/games`
2. Find the game card
3. Edit "Base Points" field
4. Click "SAVE"

### Set a Game as Game of the Day

1. Go to `/admin/games`
2. Find the game card
3. Click "SET AS GOTD" button
4. Refresh game page to see badge

### Add a New Game

1. Go to `/admin/games`
2. Click "ADD NEW GAME"
3. Enter game ID (e.g., "chess")
4. Configure settings
5. Click "SAVE"

## 🔍 Testing Scenarios

### Test 1: Daily Restriction
```
1. Play Sudoku → Win → Get points ✓
2. Play Sudoku again → Error: "Already played today" ✓
3. Wait until tomorrow → Can play again ✓
```

### Test 2: Retry Penalty
```
1. Play Riddle
2. Make 3 wrong attempts (retry = 3)
3. Win the game
4. Points = 15 - (3 × 2) = 9 points ✓
```

### Test 3: Game of the Day
```
1. Check which game is GOTD
2. Play that game
3. Should receive 2x points ✓
4. Badge should display ✓
```

### Test 4: Admin Settings
```
1. Change Sudoku base points to 50
2. Play Sudoku
3. Should receive 50 points (or less with penalties) ✓
```

## 📊 Monitoring

### Check Firestore Data

**Game Settings:**
```
settings/gamePoints
```

**Game of the Day:**
```
settings/gameOfTheDay
```

**User Game History:**
```
users/{userId}/gameHistory/{gameId}_{date}
```

**Leaderboard:**
```
leaderboards/{gameId}/users/{userId}
```

## 🐛 Troubleshooting

### "Unauthorized" Error
- Make sure you're logged in as admin
- Check `session.user.isAdmin` is true

### Points Not Awarded
- Check browser console for errors
- Verify game settings exist in Firestore
- Check user is authenticated

### Game of the Day Not Showing
- Call `GET /api/games/game-of-the-day`
- Check Firestore `settings/gameOfTheDay`
- Verify date is today's date

### Already Played Message Not Working
- Check Firestore `users/{userId}/gameHistory`
- Verify document ID format: `{gameId}_{YYYY-MM-DD}`

## 🎨 Customization

### Change Retry Penalty Formula

Edit `app/api/games/award.ts`:
```typescript
// Current formula
awardedPoints = Math.max(basePoints - (retry * retryPenalty), 1);

// Example: Exponential penalty
awardedPoints = Math.max(basePoints - Math.pow(retry, 2), 1);
```

### Add Bonus for Fast Completion

Edit `app/api/games/award.ts`:
```typescript
// Add time bonus
if (time && time < 120) { // Under 2 minutes
  awardedPoints += 10; // Bonus points
}
```

### Enable Scratcher for All Games

In admin panel:
1. Edit each game
2. Check "Enable Scratcher"
3. Configure drop rates in code or add UI

## 📱 Mobile Testing

Games are responsive and work on mobile:
- Touch-friendly inputs
- Responsive grid layouts
- Mobile-optimized buttons

## 🔐 Security Notes

- All admin endpoints check `isAdmin` flag
- Daily restriction prevents point farming
- Atomic Firestore operations prevent race conditions
- Transaction logging for audit trail

## 📚 Full Documentation

For complete API reference and implementation details:
- **Full Docs**: `docs/GAME_SYSTEM.md`
- **Summary**: `docs/GAME_SYSTEM_SUMMARY.md`

## ✅ Checklist

Before going live:
- [ ] Initialize game settings
- [ ] Test all games
- [ ] Verify daily restriction works
- [ ] Check retry penalty calculation
- [ ] Test Game of the Day
- [ ] Verify admin panel access
- [ ] Check leaderboard updates
- [ ] Test on mobile devices
- [ ] Review Firestore security rules
- [ ] Set up monitoring/alerts

## 🎉 You're All Set!

The game system is fully functional and ready to use. Players can start earning points immediately!

**Need Help?**
- Check `docs/GAME_SYSTEM.md` for detailed documentation
- Review code comments in API files
- Test with the scenarios above

---

**Happy Gaming! 🎮**
