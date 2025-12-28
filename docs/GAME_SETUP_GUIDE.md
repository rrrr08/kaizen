# Game Setup Guide

## Available Games

1. **Sudoku** - Classic number puzzle
2. **Riddle Challenge** - Daily riddles
3. **Treasure Hunt** - Find hidden items
4. **Wheel of Joy** - Daily spin for rewards

## Game Configuration

Games are configured in Firebase at `settings/gamePoints`:

```json
{
  "sudoku": {
    "basePoints": 50,
    "retryPenalty": 5
  },
  "riddle": {
    "basePoints": 30,
    "retryPenalty": 3
  }
}
```

## Game of the Day

Set in `settings/gameOfTheDay`:
```json
{
  "gameId": "sudoku",
  "date": "2024-01-15"
}
```

Game of the Day awards 2x points!

## Play Limits

- Each game can be played once per day
- Play records stored in `users/{uid}/gamePlays/{gameId}_{date}`
