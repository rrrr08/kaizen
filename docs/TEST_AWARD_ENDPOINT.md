# Test Award Endpoint

## Endpoint

`POST /api/games/award`

## Request

```json
{
  "gameId": "sudoku",
  "retry": 0,
  "level": "medium"
}
```

## Headers

```
Authorization: Bearer {firebase-token}
```

## Response

```json
{
  "success": true,
  "awardedPoints": 55,
  "awardedXP": 50,
  "tierMultiplier": 1.1,
  "currentTier": "Player",
  "isGameOfDay": false,
  "message": "You earned 50 XP and 55 JP (1.1x Player bonus)!"
}
```

## Testing

1. Get Firebase auth token from browser console
2. Use Postman or curl to test endpoint
3. Check Firestore for updated points/XP
