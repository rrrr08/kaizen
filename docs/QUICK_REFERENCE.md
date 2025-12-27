# Games System - Quick Reference

## 🎮 All Games (10 Total)

| Game | ID | Route | Points | Retry Penalty |
|------|----|----|--------|---------------|
| Sudoku | `sudoku` | `/play/sudoku` | 20 | -3 |
| Riddles | `riddle` | `/play/riddles` | 15 | -2 |
| Wordle | `wordle` | `/play/wordle` | 25 | -4 |
| Chess | `chess` | `/play/chess` | 30 | -5 |
| Trivia | `trivia` | `/play/trivia` | 10 | -1 |
| Brain Games | `puzzles` | `/play/puzzles` | 35 | -3 |
| 2048 | `2048` | `/play/2048` | 30 | -2 |
| Hangman | `hangman` | `/play/hangman` | 20 | -3 |
| Word Search | `wordsearch` | `/play/wordsearch` | 25 | -2 |
| Math Quiz | `mathquiz` | `/play/mathquiz` | 20 | -1 |

---

## 🔧 Admin URLs

- **Game Settings**: `/admin/games`
- **Initialize System**: `POST /api/games/initialize`

---

## 📡 API Endpoints

### Award Points
```bash
POST /api/games/award
Body: { gameId, retry, level? }
```

### Game Settings
```bash
GET /api/games/settings
POST /api/games/settings (admin)
Body: { gameId, name, basePoints, retryPenalty, maxRetries, scratcher }
```

### Game of the Day
```bash
GET /api/games/game-of-the-day
POST /api/games/game-of-the-day (admin)
Body: { gameId, gameName }
```

### Rotation Policy
```bash
GET /api/games/rotation-policy
POST /api/games/rotation-policy (admin)
Body: { enabled, gamesPerDay, selectedGames }
PUT /api/games/rotation-policy (admin) - Manual rotation
```

### Leaderboard & History
```bash
GET /api/games/leaderboard?gameId={id}
GET /api/games/history
```

---

## 💡 Points Formula

```javascript
finalPoints = max(basePoints - (retries × retryPenalty), 1)

// If Game of the Day
finalPoints = finalPoints × 2
```

---

## 🔄 Rotation Policy

### Enable Rotation
1. Go to `/admin/games`
2. Check "Enable Daily Rotation"
3. Set "Games Per Day" (1-20)
4. Click "Save Rotation Policy"

### Manual Rotation
Click "Rotate Now" button in admin panel

### Disable Rotation
Uncheck "Enable Daily Rotation" and save

---

## 🎯 Daily Restriction

- Each game can only be played once per day
- Tracked by: `{gameId}_{YYYY-MM-DD}`
- Example: `sudoku_2025-12-27`

---

## 🎁 Scratcher System

Enable in admin for each game:
```javascript
scratcher: {
  enabled: true,
  drops: [
    { prob: 0.5, points: 10, label: 'Bronze' },
    { prob: 0.3, points: 25, label: 'Silver' },
    { prob: 0.15, points: 50, label: 'Gold' },
    { prob: 0.05, points: 100, label: 'Diamond' }
  ]
}
```

---

## 📁 File Locations

### Components
```
kaizen/components/games/
├── SudokuGame.tsx
├── RiddleGame.tsx
├── WordleGame.tsx
├── ChessGame.tsx
├── TriviaGame.tsx
├── BrainGamesSet.tsx
├── Game2048.tsx
├── HangmanGame.tsx
├── WordSearchGame.tsx
└── MathQuizGame.tsx
```

### Routes
```
kaizen/app/play/
├── page.tsx (main)
├── sudoku/page.tsx
├── riddles/page.tsx
├── wordle/page.tsx
├── chess/page.tsx
├── trivia/page.tsx
├── puzzles/page.tsx
├── 2048/page.tsx
├── hangman/page.tsx
├── wordsearch/page.tsx
└── mathquiz/page.tsx
```

### APIs
```
kaizen/app/api/games/
├── award/route.ts
├── settings/route.ts
├── game-of-the-day/route.ts
├── rotation-policy/route.ts
├── leaderboard/route.ts
├── history/route.ts
└── initialize/route.ts
```

---

## 🚀 Quick Start

### 1. Initialize (First Time)
```bash
curl -X POST http://localhost:3000/api/games/initialize
```

### 2. Play a Game
Navigate to `/play` and click any game

### 3. Configure Admin
Go to `/admin/games` to customize settings

### 4. Enable Rotation
In admin panel, enable rotation and set games per day

---

## 🐛 Troubleshooting

### Games not awarding points?
- Check if user already played today
- Verify game settings exist in Firestore
- Check browser console for errors

### Rotation not working?
- Ensure rotation is enabled in admin
- Check today's date exists in rotation schedule
- Try manual rotation

### Scratcher not appearing?
- Enable scratcher in game settings
- Verify drops array is configured
- Check if user already played today

---

## 📚 Full Documentation

- **Complete List**: `kaizen/docs/GAMES_COMPLETE_LIST.md`
- **Rotation Guide**: `kaizen/docs/ROTATION_POLICY_GUIDE.md`
- **Task Summary**: `kaizen/docs/TASK_4_COMPLETION_SUMMARY.md`

---

**Last Updated**: December 27, 2025
