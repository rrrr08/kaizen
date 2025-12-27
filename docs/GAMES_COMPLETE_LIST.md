# Complete Games System Documentation

## Overview
All games are fully functional with the following features:
- ✅ Points award system with retry penalty
- ✅ Daily play restriction (one play per day per game)
- ✅ Game of the Day (2x points multiplier)
- ✅ Admin customization for all settings
- ✅ Scratcher integration (optional)
- ✅ Leaderboard and history tracking
- ✅ Daily rotation policy (customizable)

---

## All Implemented Games

### 1. **Sudoku** (`/play/sudoku`)
- **Game ID**: `sudoku`
- **Features**:
  - Dynamic puzzle generation (Easy/Medium/Hard)
  - Timer with MM:SS format
  - Submit button with validation
  - Scratcher after win
- **Default Points**: 20 base, -3 per retry
- **Status**: ✅ Complete

### 2. **Riddles** (`/play/riddles`)
- **Game ID**: `riddle`
- **Features**:
  - Curated riddle collection
  - Answer reveal mechanic
  - Retry tracking
  - Scratcher after win
- **Default Points**: 15 base, -2 per retry
- **Status**: ✅ Complete

### 3. **Wordle** (`/play/wordle`)
- **Game ID**: `wordle`
- **Features**:
  - 5-letter word guessing
  - 6 attempts maximum
  - Color-coded feedback (Green/Yellow/Gray)
  - Retry = attempts - 1
- **Default Points**: 25 base, -4 per retry
- **Status**: ✅ Complete

### 4. **Chess Puzzle** (`/play/chess`)
- **Game ID**: `chess`
- **Features**:
  - Mate in 1-3 moves puzzles
  - Move notation validation
  - Hint system
  - Retry = wrong move attempts
- **Default Points**: 30 base, -5 per retry
- **Status**: ✅ Complete

### 5. **Trivia Quiz** (`/play/trivia`)
- **Game ID**: `trivia`
- **Features**:
  - 5 random questions
  - 30-second timer per question
  - Multiple categories (Geography, Science, Math, History, etc.)
  - Retry = wrong answers
- **Default Points**: 10 base, -1 per retry
- **Status**: ✅ Complete

### 6. **Brain Games (3-in-1)** (`/play/puzzles`)
- **Game ID**: `puzzles`
- **Features**:
  - Tic-Tac-Toe vs AI
  - Memory Match (card pairs)
  - Number Puzzle (sliding tiles)
  - **Must complete ALL 3 to earn points**
  - **Scratcher only after completing all 3**
  - Combined retry penalty
- **Default Points**: 35 base, -3 per retry
- **Status**: ✅ Complete

### 7. **2048** (`/play/2048`)
- **Game ID**: `2048`
- **Features**:
  - Tile merging logic
  - Keyboard controls (arrow keys)
  - Score tracking
  - Win condition: reach 2048 tile
  - Retry = moves / 10
- **Default Points**: 30 base, -2 per retry
- **Status**: ✅ Complete

### 8. **Hangman** (`/play/hangman`)
- **Game ID**: `hangman`
- **Features**:
  - Letter guessing
  - 6 wrong attempts allowed
  - Visual feedback
  - Retry = wrong guesses
- **Default Points**: 20 base, -3 per retry
- **Status**: ✅ Complete

### 9. **Word Search** (`/play/wordsearch`)
- **Game ID**: `wordsearch`
- **Features**:
  - 10x10 grid
  - 5 words to find
  - Horizontal and vertical placement
  - Click to select cells
  - Retry = wrong attempts
- **Default Points**: 25 base, -2 per retry
- **Status**: ✅ Complete

### 10. **Math Quiz** (`/play/mathquiz`)
- **Game ID**: `mathquiz`
- **Features**:
  - 10 math questions
  - 20 seconds per question
  - Addition, subtraction, multiplication
  - Need 7+ correct to win
  - Retry = wrong answers
- **Default Points**: 20 base, -1 per retry
- **Status**: ✅ Complete

---

## Admin Features

### Game Settings (`/admin/games`)
Admins can customize for each game:
- **Game Name**: Display name
- **Base Points**: Points awarded for winning
- **Retry Penalty**: Points deducted per retry
- **Max Retries**: Maximum allowed retries
- **Scratcher**: Enable/disable bonus scratcher
- **Set as Game of the Day**: Manual selection

### Rotation Policy
- **Enable/Disable**: Toggle daily rotation
- **Games Per Day**: Choose how many games appear (1-20)
- **Selected Games**: Which games to include in rotation
- **Manual Rotation**: Force immediate rotation
- **Today's Games**: View current day's featured games

---

## API Endpoints

### Game Award
- **POST** `/api/games/award`
- Awards points after game completion
- Checks daily restriction
- Applies Game of the Day multiplier
- Calculates retry penalty

### Game Settings
- **GET** `/api/games/settings` - Fetch all game settings
- **POST** `/api/games/settings` - Update game settings (admin)

### Game of the Day
- **GET** `/api/games/game-of-the-day` - Get current GOTD
- **POST** `/api/games/game-of-the-day` - Set GOTD (admin)

### Rotation Policy
- **GET** `/api/games/rotation-policy` - Get rotation config
- **POST** `/api/games/rotation-policy` - Update rotation (admin)
- **PUT** `/api/games/rotation-policy` - Manual rotation (admin)

### Leaderboard
- **GET** `/api/games/leaderboard?gameId={id}` - Game leaderboard

### History
- **GET** `/api/games/history` - User's game history

### Initialize
- **POST** `/api/games/initialize` - Initialize default settings (admin)
- **GET** `/api/games/initialize` - Check initialization status

---

## Points Calculation Formula

```
finalPoints = max(basePoints - (retries × retryPenalty), 1)

If Game of the Day:
  finalPoints = finalPoints × 2
```

**Example**:
- Base Points: 20
- Retry Penalty: 3
- Retries: 2
- Calculation: 20 - (2 × 3) = 14 points
- If GOTD: 14 × 2 = 28 points

---

## Daily Restriction System

Each game play is tracked using Firestore document ID:
```
{gameId}_{YYYY-MM-DD}
```

Example: `sudoku_2025-12-27`

This ensures:
- Users can only play each game once per day
- Points are only awarded once per day per game
- Attempting to replay shows "Already played today" message

---

## Rotation Policy System

### How It Works
1. Admin enables rotation and sets games per day (default: 5)
2. System randomly selects X games from the pool each day
3. Only selected games appear on `/play` page
4. Rotation happens automatically at midnight
5. Admin can manually trigger rotation anytime

### Configuration
```json
{
  "enabled": true,
  "gamesPerDay": 5,
  "selectedGames": ["sudoku", "wordle", "chess", "trivia", "2048"],
  "rotationSchedule": {
    "2025-12-27": ["sudoku", "wordle", "trivia", "hangman", "mathquiz"]
  },
  "lastRotation": "2025-12-27"
}
```

---

## File Structure

```
kaizen/
├── app/
│   ├── play/
│   │   ├── page.tsx (main games page with rotation)
│   │   ├── sudoku/page.tsx
│   │   ├── riddles/page.tsx
│   │   ├── wordle/page.tsx
│   │   ├── chess/page.tsx
│   │   ├── trivia/page.tsx
│   │   ├── puzzles/page.tsx
│   │   ├── 2048/page.tsx
│   │   ├── hangman/page.tsx
│   │   ├── wordsearch/page.tsx
│   │   └── mathquiz/page.tsx
│   ├── admin/
│   │   └── games/page.tsx (admin panel with rotation UI)
│   └── api/
│       └── games/
│           ├── award/route.ts
│           ├── settings/route.ts
│           ├── game-of-the-day/route.ts
│           ├── rotation-policy/route.ts
│           ├── leaderboard/route.ts
│           ├── history/route.ts
│           └── initialize/route.ts
└── components/
    └── games/
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

---

## Testing Checklist

- [x] All 10 games are playable
- [x] Points awarded correctly with retry penalty
- [x] Daily restriction prevents duplicate plays
- [x] Game of the Day shows 2x multiplier
- [x] Admin can customize all game settings
- [x] Scratcher appears after win (if enabled)
- [x] Rotation policy filters games on play page
- [x] Admin can enable/disable rotation
- [x] Admin can set games per day
- [x] Manual rotation works
- [x] Today's games display correctly

---

## Next Steps (Optional Enhancements)

1. Add automatic daily rotation cron job
2. Implement game statistics dashboard
3. Add achievements system
4. Create tournament mode
5. Add social sharing features
6. Implement streak bonuses
7. Add difficulty-based point multipliers
8. Create seasonal events with special games

---

**Last Updated**: December 27, 2025
**Status**: All games complete and functional ✅
