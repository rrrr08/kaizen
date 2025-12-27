# Daily Game Rotation Policy Guide

## Overview
The rotation policy allows admins to control which games appear on the main play page each day. This creates variety and encourages users to try different games.

---

## Features

### 1. **Customizable Games Per Day**
- Set how many games appear daily (1-20)
- Default: 5 games per day
- Games are randomly selected from the pool

### 2. **Automatic Daily Rotation**
- Games rotate automatically at midnight
- New random selection each day
- Previous day's schedule is preserved in history

### 3. **Manual Rotation**
- Admin can force immediate rotation
- Useful for special events or testing
- Generates new random selection instantly

### 4. **Enable/Disable Toggle**
- When disabled: All games appear on play page
- When enabled: Only today's selected games appear
- Easy to switch between modes

---

## Admin Configuration

### Access
Navigate to: `/admin/games`

### Settings Panel
Located below "Game of the Day" section with purple gradient background.

### Configuration Options

#### 1. Enable Daily Rotation
- **Checkbox**: Toggle rotation on/off
- **Effect**: When enabled, filters games on play page

#### 2. Games Per Day
- **Input**: Number field (1-20)
- **Default**: 5
- **Effect**: How many games to show each day

#### 3. Last Rotation
- **Display**: Shows date of last rotation
- **Format**: YYYY-MM-DD

#### 4. Rotate Now Button
- **Action**: Manually trigger new rotation
- **Use Case**: Special events, testing, or immediate refresh

#### 5. Today's Games
- **Display**: Shows current day's featured games
- **Visual**: Game names in pill-shaped badges

#### 6. Save Button
- **Action**: Saves rotation policy configuration
- **Feedback**: Success/error message

---

## How It Works

### Backend Logic

1. **Initialization** (`/api/games/initialize`)
   - Creates default rotation policy
   - Selects initial games for today
   - Sets enabled to `false` by default

2. **Get Policy** (`GET /api/games/rotation-policy`)
   - Returns current configuration
   - Includes today's game schedule
   - Used by play page to filter games

3. **Update Policy** (`POST /api/games/rotation-policy`)
   - Admin updates settings
   - Generates new rotation for today
   - Saves to Firestore

4. **Manual Rotation** (`PUT /api/games/rotation-policy`)
   - Forces new random selection
   - Updates today's schedule
   - Preserves other settings

### Frontend Integration

#### Play Page (`/play`)
```typescript
// Fetch rotation policy
const rotationRes = await fetch('/api/games/rotation-policy');
const rotationData = await rotationRes.json();

// Get today's games
if (rotationData.enabled) {
  const today = new Date().toISOString().slice(0, 10);
  const todaysGameIds = rotationData.rotationSchedule?.[today] || [];
  setTodaysGames(todaysGameIds);
}

// Filter games in UI
{(!rotationPolicy?.enabled || todaysGames.includes('sudoku')) && (
  <GameCard ... />
)}
```

#### Admin Page (`/admin/games`)
```typescript
// Fetch policy
const res = await fetch('/api/games/rotation-policy');
const data = await res.json();
setRotationPolicy(data);

// Save policy
await fetch('/api/games/rotation-policy', {
  method: 'POST',
  body: JSON.stringify(rotationPolicy)
});

// Manual rotation
await fetch('/api/games/rotation-policy', {
  method: 'PUT'
});
```

---

## Data Structure

### Firestore Document
**Path**: `settings/rotationPolicy`

```json
{
  "enabled": true,
  "gamesPerDay": 5,
  "selectedGames": [
    "sudoku",
    "wordle",
    "chess",
    "trivia",
    "2048",
    "hangman",
    "wordsearch",
    "mathquiz",
    "riddle",
    "puzzles"
  ],
  "rotationSchedule": {
    "2025-12-27": ["sudoku", "wordle", "trivia", "hangman", "mathquiz"],
    "2025-12-28": ["chess", "2048", "wordsearch", "riddle", "puzzles"]
  },
  "lastRotation": "2025-12-27",
  "updatedAt": "2025-12-27T10:30:00.000Z"
}
```

### Field Descriptions

- **enabled** (boolean): Whether rotation is active
- **gamesPerDay** (number): How many games to show daily
- **selectedGames** (array): Pool of games to rotate from
- **rotationSchedule** (object): Date-to-games mapping
- **lastRotation** (string): Date of last rotation
- **updatedAt** (string): Last configuration update

---

## Use Cases

### 1. **Daily Variety**
- Enable rotation with 5 games per day
- Users see different games each day
- Encourages exploration of all games

### 2. **Special Events**
- Manually select specific games for events
- Use "Rotate Now" to activate immediately
- Disable after event ends

### 3. **Testing**
- Enable rotation with 2-3 games
- Test specific game combinations
- Quick manual rotation for different sets

### 4. **Seasonal Themes**
- Adjust games per day based on season
- More games during holidays
- Fewer games during slow periods

### 5. **All Games Available**
- Disable rotation
- All 10 games appear on play page
- Good for initial launch or promotions

---

## Best Practices

### 1. **Start Disabled**
- Let users discover all games first
- Enable rotation after 1-2 weeks
- Announce the change to users

### 2. **Optimal Games Per Day**
- 5 games: Good balance of variety and choice
- 3 games: More focused, higher engagement per game
- 7-8 games: More choice, less rotation impact

### 3. **Manual Rotation Timing**
- Use for special announcements
- Coordinate with marketing campaigns
- Avoid frequent manual rotations (confusing)

### 4. **Monitor Engagement**
- Track which games get played most
- Adjust rotation to feature popular games more
- Use data to inform game development

### 5. **Communication**
- Show "Today's Featured Games" badge
- Notify users when rotation is enabled
- Explain the system in help/FAQ

---

## Troubleshooting

### Games Not Filtering
**Issue**: All games still appear when rotation enabled
**Solution**: 
- Check `rotationPolicy.enabled` is `true`
- Verify today's date exists in `rotationSchedule`
- Ensure play page is fetching policy correctly

### Empty Today's Games
**Issue**: No games appear on play page
**Solution**:
- Run manual rotation to generate schedule
- Check `gamesPerDay` is > 0
- Verify `selectedGames` array is not empty

### Rotation Not Saving
**Issue**: Changes don't persist after save
**Solution**:
- Check admin authentication
- Verify Firestore permissions
- Check browser console for errors

### Manual Rotation Not Working
**Issue**: "Rotate Now" button doesn't change games
**Solution**:
- Ensure admin is authenticated
- Check API endpoint is responding
- Verify Firestore write permissions

---

## API Reference

### GET /api/games/rotation-policy
**Description**: Fetch current rotation policy
**Auth**: None (public)
**Response**:
```json
{
  "enabled": true,
  "gamesPerDay": 5,
  "selectedGames": [...],
  "rotationSchedule": {...},
  "lastRotation": "2025-12-27"
}
```

### POST /api/games/rotation-policy
**Description**: Update rotation policy
**Auth**: Admin only
**Body**:
```json
{
  "enabled": true,
  "gamesPerDay": 5,
  "selectedGames": [...]
}
```
**Response**:
```json
{
  "success": true,
  "policy": {...}
}
```

### PUT /api/games/rotation-policy
**Description**: Manually trigger rotation
**Auth**: Admin only
**Response**:
```json
{
  "success": true,
  "todaysGames": ["sudoku", "wordle", ...]
}
```

---

## Future Enhancements

1. **Scheduled Rotations**
   - Set specific games for specific dates
   - Plan rotations in advance
   - Calendar view for scheduling

2. **Weighted Selection**
   - Prioritize certain games
   - Feature new games more often
   - Balance based on popularity

3. **User Preferences**
   - Let users favorite games
   - Ensure favorites appear more often
   - Personalized rotation

4. **Analytics Dashboard**
   - Track rotation effectiveness
   - See which combinations work best
   - Optimize based on data

5. **A/B Testing**
   - Test different rotation strategies
   - Compare engagement metrics
   - Data-driven decisions

---

**Last Updated**: December 27, 2025
**Version**: 1.0
