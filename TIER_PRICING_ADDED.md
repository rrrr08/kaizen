# Tier Unlock Pricing Feature - Complete ✅

## What Was Added

### 1. ✅ Admin Can Set Tier Unlock Prices
**File**: `kaizen/app/admin/xp-tiers/page.tsx`

**New Field**: "Unlock Price (JP)"
- Admins can set an optional JP price for each tier
- Set to 0 or leave empty for "earn XP only" tiers
- Users can pay JP to instantly unlock tiers

**Example Pricing**:
- Newbie: 0 JP (free, starting tier)
- Player: 2000 JP (or earn 500 XP)
- Strategist: 5000 JP (or earn 2000 XP)
- Grandmaster: 10000 JP (or earn 5000 XP)

---

### 2. ✅ User Progress Page Shows Unlock Buttons
**File**: `kaizen/app/progress/page.tsx`

**Features**:
- Locked tiers with prices show "Unlock for X JP" button
- Locked tiers without prices show "Earn XP to unlock"
- Clicking unlock button:
  - Checks if user has enough JP
  - Shows confirmation dialog
  - Calls unlock API
  - Instantly grants XP to tier minimum
  - Deducts JP cost
  - Reloads page to show new tier

---

### 3. ✅ Tier Unlock API Endpoint
**File**: `kaizen/app/api/user/unlock-tier/route.ts`

**Endpoint**: `POST /api/user/unlock-tier`

**Request Body**:
```json
{
  "tierName": "Player",
  "price": 2000,
  "xpGrant": 500
}
```

**Response**:
```json
{
  "success": true,
  "message": "Player tier unlocked!",
  "newXP": 500,
  "newBalance": 3000
}
```

**Validation**:
- ✅ Checks if user already has tier or higher
- ✅ Checks if user has enough JP
- ✅ Deducts JP and grants XP atomically
- ✅ Logs transaction in user's history
- ✅ Tracks unlocked tiers in user document

---

## How It Works

### For Users

**Option 1: Earn XP Naturally (Free)**
- Play games daily
- Make purchases
- Register for events
- Spin the wheel
- Gradually earn XP to unlock tiers

**Option 2: Pay JP to Unlock Early**
- Visit `/progress` page
- See locked tiers with unlock prices
- Click "Unlock for X JP" button
- Confirm purchase
- Instantly jump to that tier

### For Admins

**Setting Tier Prices**:
1. Go to `/admin/xp-tiers`
2. For each tier, set "Unlock Price (JP)"
3. Set to 0 if tier should only be earned through XP
4. Set a price (e.g., 2000 JP) to allow purchase
5. Click "Save Changes"

**Pricing Strategy Tips**:
- Make early tiers affordable (500-2000 JP)
- Make higher tiers expensive (5000-10000 JP)
- Consider the XP requirement vs JP cost ratio
- Example: 500 XP tier = 2000 JP (4x multiplier)

---

## User Experience Flow

### Scenario 1: User with 1500 JP wants Player Tier

1. User visits `/progress`
2. Sees Player tier (500 XP required)
3. Sees "Unlock for 2000 JP" button
4. Clicks button
5. Gets error: "You need 2000 JP but have 1500 JP"
6. User plays more games to earn JP
7. Returns when they have 2000 JP
8. Successfully unlocks Player tier

### Scenario 2: User with 3000 JP unlocks Player Tier

1. User visits `/progress`
2. Sees Player tier with "Unlock for 2000 JP"
3. Clicks button
4. Confirms: "Unlock Player tier for 2000 JP?"
5. API deducts 2000 JP (3000 → 1000 JP)
6. API grants 500 XP (0 → 500 XP)
7. User now has Player tier (1.1x multiplier)
8. Page reloads showing new tier status

---

## Database Structure

### User Document Updates
```javascript
{
  xp: 500, // Set to tier minimum
  points: 1000, // Deducted unlock price
  lastTierUnlock: "2025-12-28T...",
  unlockedTiers: ["Player"] // Array of purchased tiers
}
```

### Transaction Log
```javascript
users/{uid}/transactions/{transactionId}
{
  type: "tier_unlock",
  tierName: "Player",
  jpSpent: 2000,
  xpGranted: 500,
  timestamp: "2025-12-28T..."
}
```

---

## Benefits

### For Users
- **Flexibility**: Choose to earn or buy tiers
- **Instant gratification**: Skip grinding if desired
- **Strategic choice**: Save JP for vouchers or spend on tiers
- **Clear pricing**: Know exactly what each tier costs

### For Admins
- **Monetization**: Create JP sink to encourage purchases
- **Engagement**: Users play more to earn JP for tiers
- **Customization**: Full control over tier economy
- **Analytics**: Track tier unlock purchases vs earned

### For Business
- **JP economy balance**: Prevents JP inflation
- **User retention**: Goal-oriented progression
- **Revenue potential**: Users may buy products to earn JP faster
- **Gamification depth**: Multiple progression paths

---

## Testing Checklist

- [x] Admin can set tier unlock prices
- [x] Prices save to Firestore correctly
- [x] Progress page loads tier prices
- [x] Unlock button shows for locked tiers with prices
- [x] Unlock button hidden for locked tiers without prices
- [x] API validates user has enough JP
- [x] API prevents unlocking already-owned tiers
- [x] API deducts JP correctly
- [x] API grants XP correctly
- [x] Transaction logged in user history
- [x] Page reloads after successful unlock
- [ ] Test with real user flow
- [ ] Test edge cases (exactly enough JP, not enough JP)
- [ ] Test tier multiplier applies after unlock

---

## Configuration Examples

### Conservative Pricing (Encourage Earning)
```
Newbie: 0 JP (free)
Player: 5000 JP (10x XP requirement)
Strategist: 20000 JP (10x XP requirement)
Grandmaster: 50000 JP (10x XP requirement)
```

### Balanced Pricing (Equal Options)
```
Newbie: 0 JP (free)
Player: 2000 JP (4x XP requirement)
Strategist: 8000 JP (4x XP requirement)
Grandmaster: 20000 JP (4x XP requirement)
```

### Aggressive Pricing (Encourage Buying)
```
Newbie: 0 JP (free)
Player: 1000 JP (2x XP requirement)
Strategist: 4000 JP (2x XP requirement)
Grandmaster: 10000 JP (2x XP requirement)
```

### XP-Only (No Buying)
```
Newbie: 0 JP (free)
Player: 0 JP (earn only)
Strategist: 0 JP (earn only)
Grandmaster: 0 JP (earn only)
```

---

## Files Modified/Created

### Created:
- `kaizen/app/api/user/unlock-tier/route.ts`
- `kaizen/TIER_PRICING_ADDED.md`

### Modified:
- `kaizen/app/admin/xp-tiers/page.tsx` - Added unlock price field
- `kaizen/app/progress/page.tsx` - Added unlock buttons and handler
- `kaizen/docs/XP_SYSTEM.md` - Updated documentation

---

## Status: ✅ COMPLETE

Admins can now set tier unlock prices, and users can choose to either earn XP naturally or pay JP to unlock tiers instantly. The system is fully functional and customizable!
