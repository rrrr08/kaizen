# Dynamic Content System Documentation

## Overview
All games now fetch content dynamically from Firestore, giving admins full control to add, edit, and delete game content without code changes.

---

## Features

### ✅ Dynamic Content
- All game content stored in Firestore
- No hardcoded questions, words, or puzzles
- Real-time updates without deployment

### ✅ Admin Control
- Add new content via admin panel
- Edit existing content inline
- Delete unwanted items
- Bulk save changes

### ✅ Daily Spin Integration
- Free daily spin for all users
- Win bonus points and prizes
- Additional spins available for purchase
- Integrated with points system

---

## Supported Games

### 1. **Riddles**
**Content Fields:**
- `question` (string): The riddle question
- `answer` (string): The correct answer
- `hint` (string): Optional hint for users

**Example:**
```json
{
  "id": "riddle_1",
  "question": "What has keys but no locks?",
  "answer": "keyboard",
  "hint": "You're probably using one right now"
}
```

### 2. **Trivia Questions**
**Content Fields:**
- `question` (string): The trivia question
- `options` (array): 4 answer options
- `correct` (number): Index of correct option (0-3)
- `category` (string): Question category

**Example:**
```json
{
  "id": "trivia_1",
  "question": "What is the capital of France?",
  "options": ["London", "Berlin", "Paris", "Madrid"],
  "correct": 2,
  "category": "Geography"
}
```

### 3. **Wordle Words**
**Content Fields:**
- `word` (string): 5-letter word (uppercase)

**Example:**
```json
{
  "id": "wordle_1",
  "word": "REACT"
}
```

### 4. **Chess Puzzles**
**Content Fields:**
- `fen` (string): FEN notation for board position
- `solution` (string): Winning move(s) in algebraic notation
- `difficulty` (string): Easy/Medium/Hard

**Example:**
```json
{
  "id": "chess_1",
  "fen": "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4",
  "solution": "Qxf7#",
  "difficulty": "Easy"
}
```

### 5. **Hangman Words**
**Content Fields:**
- `word` (string): Word to guess (uppercase)
- `category` (string): Word category/theme

**Example:**
```json
{
  "id": "hangman_1",
  "word": "JAVASCRIPT",
  "category": "Programming"
}
```

### 6. **Word Search Lists**
**Content Fields:**
- `words` (array): List of words to find
- `theme` (string): Theme/category

**Example:**
```json
{
  "id": "ws_1",
  "words": ["REACT", "NEXT", "CODE", "DEBUG", "ARRAY"],
  "theme": "Programming"
}
```

### 7. **Math Quiz** (Coming Soon)
**Content Fields:**
- `problem` (string): Math problem
- `answer` (number): Correct answer
- `difficulty` (string): Easy/Medium/Hard

---

## Admin Panel

### Access
Navigate to: `/admin/game-content`

### Features

#### 1. Game Selector
- Switch between different game types
- Each game has its own content structure
- Content loads automatically when selected

#### 2. Add New Content
- Click "Add New" button
- Form appears with appropriate fields
- Fill in all required fields
- Click "Save All" to persist

#### 3. Edit Content
- Edit fields directly inline
- Changes are tracked locally
- Click "Save All" to persist all changes

#### 4. Delete Content
- Click trash icon on any item
- Confirmation dialog appears
- Item removed immediately from database

#### 5. Bulk Save
- Edit multiple items
- Click "Save All" once
- All changes saved together

---

## API Endpoints

### Get Content
```bash
GET /api/games/content?gameId={id}
```

**Response:**
```json
{
  "content": {
    "items": [...],
    "updatedAt": "2025-12-27T10:30:00.000Z"
  }
}
```

### Update Content
```bash
POST /api/games/content
Body: {
  "gameId": "riddle",
  "content": {
    "items": [...]
  }
}
```

**Auth:** Admin only

### Delete Item
```bash
DELETE /api/games/content?gameId={id}&itemId={itemId}
```

**Auth:** Admin only

### Initialize Content
```bash
POST /api/games/content/initialize
```

**Auth:** Admin only
**Purpose:** Populate default content for all games

---

## Firestore Structure

### Document Path
```
gameContent/{gameId}
```

### Document Structure
```json
{
  "items": [
    {
      "id": "unique_id",
      "field1": "value1",
      "field2": "value2",
      ...
    }
  ],
  "updatedAt": "2025-12-27T10:30:00.000Z",
  "updatedBy": "admin@example.com"
}
```

### Example Documents

**gameContent/riddle:**
```json
{
  "items": [
    {
      "id": "riddle_1",
      "question": "What has keys but no locks?",
      "answer": "keyboard",
      "hint": "You're using one now"
    }
  ],
  "updatedAt": "2025-12-27T10:30:00.000Z"
}
```

**gameContent/trivia:**
```json
{
  "items": [
    {
      "id": "trivia_1",
      "question": "What is 2+2?",
      "options": ["3", "4", "5", "6"],
      "correct": 1,
      "category": "Math"
    }
  ],
  "updatedAt": "2025-12-27T10:30:00.000Z"
}
```

---

## Game Integration

### How Games Fetch Content

#### Example: Riddle Game
```typescript
useEffect(() => {
  const fetchRiddle = async () => {
    const res = await fetch('/api/games/content?gameId=riddle');
    const data = await res.json();
    const items = data.content?.items || [];
    
    // Select random riddle
    const riddle = items[Math.floor(Math.random() * items.length)];
    setRiddle(riddle);
  };
  
  fetchRiddle();
}, []);
```

#### Example: Trivia Game
```typescript
useEffect(() => {
  const fetchQuestions = async () => {
    const res = await fetch('/api/games/content?gameId=trivia');
    const data = await res.json();
    const allQuestions = data.content?.items || [];
    
    // Select 5 random questions
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 5);
    setQuestions(selected);
  };
  
  fetchQuestions();
}, []);
```

---

## Daily Spin System

### Overview
- Free spin once per 24 hours
- Additional spins cost points
- Win bonus points and prizes
- Integrated with gamification system

### Access
Navigate to: `/play/daily-spin`

### Features
- **Free Daily Spin**: One free spin every 24 hours
- **Paid Spins**: Buy additional spins with points
- **Prize Wheel**: Multiple prize tiers with different probabilities
- **Instant Rewards**: Points awarded immediately

### Prize Configuration
Located in: `kaizen/lib/gamification.ts`

```typescript
export const WHEEL_PRIZES = [
  { id: 'p1', label: '10 JP', value: 10, probability: 0.3, color: '#FFD93D' },
  { id: 'p2', label: '25 JP', value: 25, probability: 0.25, color: '#FF7675' },
  { id: 'p3', label: '50 JP', value: 50, probability: 0.2, color: '#74B9FF' },
  { id: 'p4', label: '100 JP', value: 100, probability: 0.15, color: '#00B894' },
  { id: 'p5', label: 'JACKPOT', value: 500, probability: 0.1, color: '#6C5CE7' }
];

export const SPIN_COST = 50; // Points cost for additional spins
```

### Admin Customization
Admins can modify:
- Prize values
- Probabilities
- Spin cost
- Prize colors and labels

---

## Migration Guide

### From Static to Dynamic

#### Before (Static):
```typescript
const RIDDLES = [
  { question: "...", answer: "..." },
  // Hardcoded array
];
```

#### After (Dynamic):
```typescript
const [riddle, setRiddle] = useState(null);

useEffect(() => {
  fetch('/api/games/content?gameId=riddle')
    .then(r => r.json())
    .then(data => {
      const items = data.content?.items || [];
      const random = items[Math.floor(Math.random() * items.length)];
      setRiddle(random);
    });
}, []);
```

---

## Best Practices

### 1. Content Quality
- Write clear, unambiguous questions
- Test all answers for correctness
- Provide helpful hints
- Use appropriate difficulty levels

### 2. Content Quantity
- Maintain at least 10-20 items per game
- Add new content regularly
- Remove outdated or problematic items
- Balance difficulty distribution

### 3. Categories/Themes
- Use consistent category names
- Group related content
- Make categories meaningful
- Update categories as needed

### 4. Testing
- Test new content before saving
- Verify answers are correct
- Check for typos and formatting
- Ensure all fields are filled

### 5. Backup
- Export content regularly
- Keep backup of good content
- Document major changes
- Version control important updates

---

## Troubleshooting

### Content Not Loading
**Issue**: Game shows "Loading..." indefinitely
**Solution**:
- Check Firestore document exists
- Verify document has `items` array
- Check browser console for errors
- Ensure API endpoint is accessible

### Empty Content
**Issue**: No items in admin panel
**Solution**:
- Run content initialization: `POST /api/games/content/initialize`
- Check Firestore permissions
- Verify admin authentication

### Changes Not Saving
**Issue**: Edits don't persist after save
**Solution**:
- Check admin authentication
- Verify Firestore write permissions
- Check browser console for errors
- Ensure all required fields are filled

### Daily Spin Not Working
**Issue**: Spin button disabled or not working
**Solution**:
- Check if user already spun today
- Verify user has enough points for paid spin
- Check gamification context is loaded
- Ensure wheel prizes are configured

---

## Future Enhancements

### Planned Features
1. **Content Import/Export**
   - CSV import for bulk content
   - JSON export for backup
   - Content templates

2. **Content Scheduling**
   - Schedule content for specific dates
   - Seasonal content rotation
   - Event-based content

3. **Content Analytics**
   - Track which content is played most
   - Difficulty analysis
   - User feedback integration

4. **Collaborative Editing**
   - Multiple admins can edit
   - Change history tracking
   - Approval workflow

5. **Content Validation**
   - Automatic spell checking
   - Answer verification
   - Duplicate detection

---

**Last Updated**: December 27, 2025
**Version**: 1.0
**Status**: ✅ Production Ready
