# Admin Features Documentation

Complete guide to all admin features implemented in the Joy platform.

## 🎯 Overview

The admin panel provides comprehensive control over:
- Game settings and configuration
- Content management
- User management
- Events and products
- Analytics and testing

## 📍 Access

**Admin Panel URL:** `http://localhost:3001/admin`

**Requirements:**
- Must be logged in with Firebase Auth
- User must have `isAdmin: true` or `role: 'admin'` in Firestore

---

## 🎮 Game Management

### 1. Game Settings (`/admin/games`)

**Features:**
- Configure points, retries, and penalties for each game
- Set "Game of the Day" (awards 2x points)
- Manage daily rotation policy
- Enable/disable scratcher bonuses
- Add new games dynamically

**Configurable Settings per Game:**
- **Base Points:** Points awarded for completing the game
- **Retry Penalty:** Points deducted per retry attempt
- **Max Retries:** Maximum number of retry attempts allowed
- **Scratcher:** Enable random bonus points after game completion

**Game of the Day:**
- Select any game to be featured
- Automatically awards 2x points
- Updates daily

**Daily Rotation Policy:**
- Enable/disable automatic game rotation
- Set number of games to show per day
- Manual rotation trigger
- View today's active games

**API Endpoints:**
- `GET /api/games/settings` - Fetch all game settings
- `POST /api/games/settings` - Update game settings (requires auth)
- `GET /api/games/game-of-the-day` - Get current game of the day
- `POST /api/games/game-of-the-day` - Set game of the day (requires auth)
- `GET /api/games/rotation-policy` - Get rotation policy
- `POST /api/games/rotation-policy` - Update rotation policy (requires auth)
- `PUT /api/games/rotation-policy` - Trigger manual rotation (requires auth)

---

### 2. Game Content (`/admin/game-content`)

**Features:**
- Initialize default content for all games
- Add new content items for each game type
- View all existing content
- Delete content items
- Switch between different game types

**Supported Games:**
1. **Riddles** - Question, Answer, Hint
2. **Trivia** - Question, Options (4), Correct Answer, Category
3. **Wordle** - 5-letter words
4. **Hangman** - Words with categories
5. **Word Search** - Word lists with themes
6. **Chess** - FEN notation, Solution, Difficulty

**Content Management:**
- Dynamic forms based on game type
- Real-time content viewing
- One-click initialization with default data
- Individual item deletion

**API Endpoints:**
- `GET /api/games/content?gameId={id}` - Fetch content for specific game
- `POST /api/games/content` - Update game content (requires auth)
- `DELETE /api/games/content?gameId={id}&itemId={id}` - Delete content item (requires auth)
- `POST /api/games/content/initialize` - Initialize all default content (requires auth)

**Default Content Included:**
- 10 Riddles
- 12 Trivia Questions
- 20 Wordle Words
- 14 Hangman Words
- 7 Word Search Lists
- 3 Chess Puzzles

---

### 3. Gamification Settings (`/admin/gamification`)

**Features:**
- Configure Wheel of Joy prize probabilities
- Set economy rules and rewards
- Adjust treasure hunt spawn rates

**Wheel Configuration:**
- Adjust probability for each prize segment
- Visual validation (must sum to 1.00)
- Color-coded prize indicators

**Economy Rules:**
- Sudoku rewards by difficulty
- Riddle completion rewards
- Treasure hunt spawn chances
- Other game-specific rewards

**API Endpoints:**
- Currently uses client-side constants from `/lib/gamification`
- Future: Will save to Firestore `gamification_config` collection

---

## 🏆 Game Play Features

### Award System

**Endpoint:** `POST /api/games/award`

**Features:**
- Awards points after game completion
- Prevents duplicate plays (once per day per game)
- Applies retry penalties
- Doubles points for Game of the Day
- Tracks game history

**Request Body:**
```json
{
  "gameId": "riddle",
  "retry": 0,
  "level": "easy",
  "points": 15
}
```

**Response:**
```json
{
  "success": true,
  "awardedPoints": 15,
  "message": "You earned 15 points!",
  "newBalance": 7140
}
```

**Error Cases:**
- 401: Not authenticated
- 409: Already played today
- 500: Server error

---

### Game History

**Endpoint:** `GET /api/games/history?gameId={id}`

**Features:**
- Fetch user's play history for specific game
- Shows dates, points earned, retry counts
- Requires authentication

**Response:**
```json
{
  "history": [
    {
      "gameId": "riddle",
      "date": "2025-12-28",
      "points": 15,
      "retry": 0
    }
  ]
}
```

---

## 📊 Dashboard (`/admin/dashboard`)

**Features:**
- Real-time statistics
- Recent orders table
- Quick action links to all admin features
- Points issued/redeemed tracking

**Statistics Displayed:**
- Total Users
- Total Orders
- Average Order Value
- Active Users (24h)
- Total Points Issued
- Total Points Redeemed
- Monthly Growth Rate

**Quick Actions:**
- Game Settings
- Gamification
- Game Content
- Users
- Events
- Products

---

## 🧪 API Testing (`/admin/api-test`)

**Features:**
- Test all game-related endpoints
- Visual success/failure indicators
- Response inspection
- Success rate calculation
- Real-time testing progress

**Tested Endpoints:**
- Game Settings (GET)
- Game of the Day (GET)
- Rotation Policy (GET)
- All Game Content (GET for each game type)
- Events (GET upcoming/past)
- Game History (GET with auth)

**Test Results Include:**
- HTTP status code
- Success/failure status
- Response data
- Error messages
- Overall success rate

---

## 🔐 Authentication

All admin features use **Firebase Authentication**.

**Protected Endpoints:**
- Require `Authorization: Bearer {token}` header
- Token obtained via `user.getIdToken()`
- Verified server-side with Firebase Admin SDK

**Admin Verification:**
- Checks `isAdmin: true` or `role: 'admin'` in user document
- Firestore path: `users/{uid}`

---

## 📁 File Structure

```
kaizen/
├── app/
│   ├── admin/
│   │   ├── dashboard/page.tsx       # Main dashboard
│   │   ├── games/page.tsx           # Game settings
│   │   ├── gamification/page.tsx    # Gamification config
│   │   ├── game-content/page.tsx    # Content management
│   │   ├── api-test/page.tsx        # API testing
│   │   └── layout.tsx               # Admin layout & nav
│   └── api/
│       └── games/
│           ├── settings/route.ts
│           ├── game-of-the-day/route.ts
│           ├── rotation-policy/route.ts
│           ├── content/route.ts
│           ├── content/initialize/route.ts
│           ├── award/route.ts
│           └── history/route.ts
├── data/                            # Default game content
│   ├── riddles.json
│   ├── trivia.json
│   ├── wordle.json
│   ├── hangman.json
│   ├── wordsearch.json
│   └── chess.json
├── lib/
│   ├── gameApi.ts                   # Client-side API helpers
│   ├── gamification.ts              # Gamification constants
│   └── firebaseAdmin.ts             # Server-side Firebase
└── test-api-endpoints.js            # Node.js test script
```

---

## 🚀 Getting Started

### 1. Initialize Game Content

1. Visit `/admin/game-content`
2. Click "INITIALIZE CONTENT"
3. Wait for success message
4. Content is now available in Firestore

### 2. Configure Game Settings

1. Visit `/admin/games`
2. Adjust points, retries, penalties for each game
3. Click "SAVE" for each game
4. Set a "Game of the Day" if desired

### 3. Test Endpoints

1. Visit `/admin/api-test`
2. Click "RUN TESTS"
3. Review results
4. All endpoints should return 200 (except auth-required ones if not logged in)

### 4. Enable Daily Rotation

1. Visit `/admin/games`
2. Scroll to "Daily Rotation Policy"
3. Enable rotation
4. Set games per day (default: 5)
5. Click "SAVE ROTATION POLICY"

---

## 🐛 Troubleshooting

### Content Returns 404
- Run initialization: `/admin/game-content` → "INITIALIZE CONTENT"
- Check Firestore collection: `gameContent`

### Authentication Errors (401)
- Verify user is logged in
- Check `isAdmin` field in Firestore user document
- Ensure Firebase Auth token is valid

### Game Not Awarding Points
- Check if already played today (409 error)
- Verify game settings exist in Firestore
- Check `gameHistory` collection for duplicates

### Rotation Not Working
- Verify rotation policy is enabled
- Check `rotationSchedule` in Firestore
- Trigger manual rotation if needed

---

## 📝 Notes

- All changes are saved to Firestore in real-time
- Game content is cached client-side for performance
- Admin actions are logged (future feature)
- Backup data before bulk operations
- Test in development before production changes

---

## 🔮 Future Enhancements

- [ ] Bulk content import/export (CSV/JSON)
- [ ] Content scheduling (publish dates)
- [ ] A/B testing for game settings
- [ ] Analytics dashboard for game performance
- [ ] User segment targeting
- [ ] Automated rotation based on popularity
- [ ] Content moderation queue
- [ ] Multi-language content support
