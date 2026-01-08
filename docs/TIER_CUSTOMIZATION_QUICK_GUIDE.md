# Tier System Customization - Quick Guide

## 🎯 Goal
Make tier system fully customizable from admin panel with automatic user recalculation.

---

## 📋 What Needs to Change

### 1. Admin Page (`/admin/xp-tiers/page.tsx`)

**Add These Features:**
- ✅ **"Add New Tier"** button
- ✅ **"Delete Tier"** button (with confirmation)
- ✅ **Reorder tiers** (up/down arrows)
- ✅ **Validation** before saving

**Current State:**
- Can edit existing tiers ✅
- Cannot add new tiers ❌
- Cannot delete tiers ❌
- Cannot reorder ❌

---

### 2. New API Endpoint

**Create:** `/app/api/admin/tiers/recalculate/route.ts`

**Purpose:**
- Recalculate all users' tiers when admin changes tier configuration
- Update user documents with new tier
- Return statistics (how many users updated)

**How It Works:**
```
1. Fetch all users from Firestore
2. Fetch new tier configuration
3. For each user:
   - Get user's XP
   - Calculate which tier they belong to
   - Update user document if tier changed
4. Return results
```

---

### 3. Recalculation Logic

**When to Recalculate:**

| Trigger | When | Automatic? |
|---------|------|------------|
| Admin saves tiers | Tier config changes | ✅ Yes |
| User earns XP | User plays games | ✅ Already works |
| Manual button | Admin clicks "Recalculate" | ⚠️ Manual |

**How Recalculation Works:**

```typescript
// Example: User has 2500 XP
// Old tiers: Player (500), Strategist (2000), Grandmaster (5000)
// User tier: Strategist ✅

// Admin changes: Player (1000), Strategist (3000), Grandmaster (5000)
// Recalculation: User has 2500 XP
// New tier: Player (because 2500 < 3000) ⬇️ Downgraded
```

---

## 🔄 Recalculation Scenarios

### Scenario 1: Add New Tier
**Before:**
- Newbie (0 XP)
- Player (500 XP)
- Strategist (2000 XP)
- Grandmaster (5000 XP)

**Admin Adds:** Legend (10000 XP)

**After:**
- Users with 10000+ XP → Legend tier ✅
- Other users → No change ✅

---

### Scenario 2: Change Tier Requirements
**Before:**
- Player tier: 500 XP

**Admin Changes:** Player tier: 1000 XP

**After:**
- Users with 500-999 XP → Downgraded to Newbie ⬇️
- Users with 1000+ XP → Keep Player ✅

---

### Scenario 3: Delete Tier
**Before:**
- Newbie (0)
- Player (500)
- Strategist (2000) ← Delete this
- Grandmaster (5000)

**Admin Deletes:** Strategist

**After:**
- Users with 2000-4999 XP → Downgraded to Player ⬇️
- Users with 5000+ XP → Keep Grandmaster ✅

---

### Scenario 4: Change Multiplier
**Before:**
- Grandmaster: 1.5x multiplier

**Admin Changes:** Grandmaster: 2.0x multiplier

**After:**
- Users keep same tier ✅
- Future JP earnings use 2.0x multiplier ✅
- Past earnings not affected ✅

---

## 📊 Data Flow

### Current Flow:
```
Admin edits tier → Saves to Firestore → Done
```

### New Flow:
```
Admin edits tier → Validates → Saves to Firestore 
→ Triggers recalculation → Updates all users → Done
```

---

## 🗂️ Files to Modify

### 1. Admin Page
**File:** `kaizen/app/admin/xp-tiers/page.tsx`

**Add Functions:**
```typescript
const addTier = () => {
  // Create new tier with default values
  const newTier = {
    name: 'New Tier',
    minXP: Math.max(...tiers.map(t => t.minXP)) + 1000,
    multiplier: 1.0,
    badge: 'New Badge',
    perk: 'New Perk',
    color: '#94a3b8',
    icon: '⭐',
    unlockPrice: 0
  };
  setTiers([...tiers, newTier]);
};

const deleteTier = (index: number) => {
  // Prevent deleting first tier (minXP: 0)
  if (tiers[index].minXP === 0) {
    alert('Cannot delete the base tier');
    return;
  }
  // Remove tier
  setTiers(tiers.filter((_, i) => i !== index));
};

const validateTiers = () => {
  // Check: sorted by minXP, no duplicates, etc.
  // Return { valid: boolean, errors: string[] }
};
```

### 2. New API Endpoint
**File:** `kaizen/app/api/admin/tiers/recalculate/route.ts`

**Main Function:**
```typescript
export async function POST(req: NextRequest) {
  // 1. Verify admin
  // 2. Get all users
  // 3. Get tier config
  // 4. Recalculate each user
  // 5. Batch update Firestore
  // 6. Return results
}
```

### 3. Utility Functions
**File:** `kaizen/lib/gamification.ts`

**Add:**
```typescript
export const recalculateUserTier = (xp: number, tiers: Tier[]) => {
  // Find highest tier user qualifies for
  const sorted = [...tiers].sort((a, b) => b.minXP - a.minXP);
  return sorted.find(tier => xp >= tier.minXP) || tiers[0];
};

export const validateTierConfig = (tiers: Tier[]) => {
  // Validate: sorted, unique names, etc.
};
```

---

## ✅ Validation Rules

Before saving tiers, check:

1. ✅ **At least 1 tier exists**
2. ✅ **First tier has minXP = 0**
3. ✅ **Tiers sorted by minXP (ascending)**
4. ✅ **No duplicate tier names**
5. ✅ **No duplicate minXP values**
6. ✅ **Multiplier >= 1.0**
7. ✅ **minXP >= 0**

---

## 🚀 Implementation Steps

### Step 1: Add UI Features (2-3 hours)
1. Add "Add Tier" button
2. Add delete button to each tier
3. Add reorder buttons
4. Add validation function

### Step 2: Create Recalculation API (3-4 hours)
1. Create `/api/admin/tiers/recalculate` endpoint
2. Implement batch processing
3. Add error handling
4. Return statistics

### Step 3: Integrate (1-2 hours)
1. Trigger recalculation on save
2. Show progress indicator
3. Display results

### Step 4: Test (2-3 hours)
1. Test add/delete/reorder
2. Test recalculation with sample users
3. Test edge cases
4. Test performance

**Total Time:** ~8-12 hours

---

## 📈 Performance

### Small User Base (< 1000 users):
- ✅ Recalculate immediately
- ✅ Process synchronously
- ✅ Show progress

### Large User Base (> 1000 users):
- ⚠️ Use background job
- ⚠️ Process in batches of 500
- ⚠️ Show progress indicator
- ⚠️ Allow cancellation

---

## 🔐 Security

- ✅ Only admins can modify tiers
- ✅ Only admins can trigger recalculation
- ✅ Validate all inputs
- ✅ Log all changes
- ✅ Rate limit API endpoint

---

## 📝 Summary

**What You Get:**
1. ✅ Add unlimited tiers from admin
2. ✅ Delete tiers (with validation)
3. ✅ Reorder tiers
4. ✅ Automatic user recalculation
5. ✅ Validation prevents errors
6. ✅ Progress tracking

**What Changes:**
- Admin UI gets add/delete/reorder buttons
- New API endpoint for recalculation
- Users automatically get updated tiers
- System validates tier configuration

**Impact:**
- ✅ Admins have full control
- ✅ Users always have correct tier
- ✅ No manual updates needed
- ✅ System stays consistent
