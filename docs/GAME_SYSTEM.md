# Game System Documentation

## Overview
The game system provides a fully functional points-based gaming platform with daily restrictions, retry penalties, Game of the Day bonuses, and admin customization.

## Features

### 1. **Daily Points Restriction**
- Users can only earn points **once per day** for each game
- Prevents point farming and encourages daily engagement
- Returns a friendly error message if user tries to play again

### 2. **Retry Penalty System**
- Points are deducted based on number of retries
- Formula: `finalPoints = basePoints - (retries × retryPenalty)`
- Minimum points awarded: 1 (never goes below 1)
- Configurable per game via admin panel

### 3. **Game of the Day**
- One game is randomly selected each day as "Game of the Day"
- Awards **2x points** for that game
- Automatically rotates daily
- Admin can manually override the selection
- Displays special badge in game UI

### 4. **Admin Customization**
All game settings are customizable via `/admin/games`:
- **Base Points**: Starting points for winning
- **Retry Penalty**: Points deducted per retry
- **Max Retries**: Maximum allowed retries
- **Game Name**: Display name for the game
- **Scratcher**: Enable/disable bonus scratcher feature
- **Set as Game of the Day**: Manually set any game as GOTD

### 5. **Leaderboard System**
- Tracks total points per user per game
- Shows games played count
- Displays best time (for timed games)
- Real-time updates

### 6. **Game History**
- Personal history for each user
- Shows date, points earned, level played
- Tracks all past games

## API Endpoints

### Award Points
```
POST /api/games/award
Body: {
  gameId: string,
  retry: number,
  level?: string,
  time?: number
}
```

**Response:**
- Success: `{ success: true, awardedPoints: number, isGameOfDay: boolean, message: string }`
- Already played: `{ error: 'Already played today', message: string }` (409)
- Error: `{ error: string }` (500)

### Get Game of the Day
```
GET /api/games/game-of-the-day
```

**Response:**
```json
{
  "gameId": "sudoku",
  "date": "2025-12-27",
  "gameName": "Sudoku"
}
```

### Set Game of the Day (Admin Only)
```
POST /api/games/game-of-the-day
Body: {
  gameId: string,
  gameName?: string
}
```

### Get Game Settings
```
GET /api/games/settings
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
      "scratcher": { "enabled": false }
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

### Update Game Settings (Admin Only)
```
POST /api/games/settings
Body: {
  gameId: string,
  name?: string,
  basePoints?: number,
  retryPenalty?: number,
  maxRetries?: number,
  scratcher?: object,
  setAsGameOfDay?: boolean
}
```

### Get Leaderboard
```
GET /api/games/leaderboard?gameId=sudoku&limit=10
```

**Response:**
```json
{
  "leaderboard": [
    {
      "userId": "user123",
      "totalPoints": 450,
      "gamesPlayed": 15,
      "bestTime": 180,
      "lastPlayed": "2025-12-27T10:30:00Z"
    }
  ]
}
```

### Get Game History
```
GET /api/games/history?gameId=sudoku
```

**Response:**
```json
{
  "history": [
    {
      "id": "sudoku_2025-12-27",
      "gameId": "sudoku",
      "date": "2025-12-27",
      "points": 20,
      "retries": 1,
      "level": "medium",
      "time": 240,
      "awardedAt": "2025-12-27T10:30:00Z",
      "isGameOfDay": true
    }
  ]
}
```

## Firestore Data Structure

### Settings Collection
```
settings/
  gamePoints/
    {
      sudoku: {
        name: "Sudoku",
        basePoints: 20,
        retryPenalty: 3,
        maxRetries: 3,
        scratcher: { enabled: false }
      },
      riddle: { ... }
    }
  
  gameOfTheDay/
    {
      gameId: "sudoku",
      gameName: "Sudoku",
      date: "2025-12-27",
      autoSelected: true
    }
```

### User Data
```
users/
  {userId}/
    balance: 1500
    xp: 1500
    
    gameHistory/
      {gameId}_{date}/
        {
          gameId: "sudoku",
          userId: "user123",
          date: "2025-12-27",
          points: 20,
          retries: 1,
          level: "medium",
          time: 240,
          awardedAt: "2025-12-27T10:30:00Z",
          isGameOfDay: true
        }
    
    walletTransactions/
      {txId}/
        {
          id: "sudoku_2025-12-27_1234567890",
          type: "earn",
          points: 20,
          reason: "game_of_the_day",
          gameId: "sudoku",
          level: "medium",
          retries: 1,
          awardedAt: "2025-12-27T10:30:00Z",
          isGameOfDay: true
        }
```

### Leaderboards
```
leaderboards/
  {gameId}/
    users/
      {userId}/
        {
          userId: "user123",
          totalPoints: 450,
          gamesPlayed: 15,
          lastPlayed: "2025-12-27T10:30:00Z",
          bestTime: 180,
          level: "hard"
        }
```

## Game Implementation Guide

### Adding a New Game

1. **Create Game Component** (`components/games/YourGame.tsx`)
```typescript
const YOUR_GAME_ID = 'your-game';

const YourGame: React.FC = () => {
  const [retry, setRetry] = useState(0);
  const [isGameOfDay, setIsGameOfDay] = useState(false);
  
  useEffect(() => {
    // Check if Game of the Day
    fetch('/api/games/game-of-the-day')
      .then(r => r.json())
      .then(d => {
        if(d.gameId === YOUR_GAME_ID) setIsGameOfDay(true);
      });
  }, []);
  
  const handleWin = async () => {
    const res = await fetch('/api/games/award', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        gameId: YOUR_GAME_ID, 
        retry 
      }),
    });
    const data = await res.json();
    
    if (data.success) {
      // Show success message
    } else if (res.status === 409) {
      // Already played today
    }
  };
  
  return (
    <div>
      {isGameOfDay && <GameOfTheDayBadge />}
      {/* Your game UI */}
    </div>
  );
};
```

2. **Configure in Admin Panel**
- Go to `/admin/games`
- Click "Add New Game"
- Enter game ID (e.g., "chess")
- Configure points, penalties, etc.
- Save settings

3. **Create Game Page** (`app/play/your-game/page.tsx`)
```typescript
import YourGame from '@/components/games/YourGame';

export default function YourGamePage() {
  return (
    <div className="min-h-screen pt-28 pb-16 bg-black text-white">
      <div className="max-w-4xl mx-auto px-6">
        <YourGame />
      </div>
    </div>
  );
}
```

## Best Practices

1. **Always check for Game of the Day** in your game component
2. **Track retries** to apply penalty correctly
3. **Handle 409 errors** gracefully (already played today)
4. **Show clear feedback** to users about points earned
5. **Display retry count** so users know penalty is being applied
6. **Use confetti** or animations for wins to enhance UX

## Testing

### Test Daily Restriction
1. Play a game and win
2. Try to play again immediately
3. Should see "Already played today" message

### Test Retry Penalty
1. Make intentional mistakes to increase retry count
2. Win the game
3. Points should be: `basePoints - (retries × retryPenalty)`

### Test Game of the Day
1. Check `/api/games/game-of-the-day`
2. Play that game
3. Should receive 2x points
4. Badge should display in UI

### Test Admin Settings
1. Go to `/admin/games`
2. Change base points for a game
3. Play the game
4. Should receive updated points

## Troubleshooting

### Points not awarded
- Check if user is authenticated
- Verify game settings exist in Firestore
- Check browser console for errors

### Daily restriction not working
- Verify date format is consistent (YYYY-MM-DD)
- Check Firestore rules allow writes to gameHistory

### Game of the Day not rotating
- Check if cron job is set up (optional)
- Manually trigger by calling GET endpoint
- Verify Firestore settings/gameOfTheDay document

## Future Enhancements

- [ ] Streak bonuses (play X days in a row)
- [ ] Weekly tournaments
- [ ] Multiplayer games
- [ ] Achievement system
- [ ] Power-ups and boosters
- [ ] Social sharing of scores
- [ ] Push notifications for Game of the Day
