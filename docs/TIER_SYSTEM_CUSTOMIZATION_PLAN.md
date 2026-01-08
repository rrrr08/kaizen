# Tier System Customization Plan

## Overview
Make the tier system fully customizable from the admin panel with ability to add/remove tiers and automatically recalculate user tiers.

---

## Current State

### ✅ What Already Works:
- Admin page at `/admin/xp-tiers` exists
- Can edit existing tier properties (name, minXP, multiplier, etc.)
- Tiers are stored in Firestore: `settings/xpSystem`
- System reads tiers dynamically from Firebase
- Default fallback tiers exist

### ❌ What's Missing:
- **Add new tier** button
- **Delete tier** button
- **Reorder tiers** functionality
- **User tier recalculation** when tiers change
- **Validation** (minXP must be ascending, etc.)

---

## Implementation Plan

### Phase 1: Admin UI Enhancements

#### 1.1 Add "Add New Tier" Button
**Location:** `/admin/xp-tiers/page.tsx`

**Changes:**
- Add button above tier list
- Creates new tier with default values
- Auto-generates unique name if needed

**Default New Tier:**
```typescript
{
  name: 'New Tier',
  minXP: 10000,  // Higher than highest existing tier
  multiplier: 1.0,
  badge: 'New Badge',
  perk: 'New Perk',
  color: '#94a3b8',
  icon: '⭐',
  unlockPrice: 0
}
```

#### 1.2 Add "Delete Tier" Button
**Location:** Each tier card in `/admin/xp-tiers/page.tsx`

**Changes:**
- Add delete button (trash icon) to each tier
- Show confirmation dialog before deletion
- Prevent deletion of lowest tier (minXP: 0)
- Validate that at least one tier exists

#### 1.3 Add Tier Reordering
**Location:** Tier list section

**Changes:**
- Add up/down arrow buttons
- Drag-and-drop support (optional, nice-to-have)
- Ensures minXP values stay in ascending order

#### 1.4 Add Validation
**Location:** Before saving

**Validations:**
- ✅ Tiers must be sorted by minXP (ascending)
- ✅ First tier must have minXP = 0
- ✅ No duplicate tier names
- ✅ Multiplier must be >= 1.0
- ✅ At least one tier must exist
- ✅ minXP values must be unique

---

### Phase 2: User Tier Recalculation System

#### 2.1 Create Recalculation API Endpoint
**New File:** `/app/api/admin/tiers/recalculate/route.ts`

**Purpose:**
- Recalculates all users' tiers based on new tier configuration
- Updates user documents with new tier information
- Logs recalculation for audit trail

**Process:**
1. Fetch all users from Firestore
2. Fetch current tier configuration
3. For each user:
   - Get user's current XP
   - Calculate new tier based on updated tiers
   - Update user document if tier changed
   - Log tier change in user's history

**API Endpoint:**
```typescript
POST /api/admin/tiers/recalculate
Authorization: Bearer <admin-token>

Response: {
  success: true,
  usersProcessed: 150,
  tiersUpdated: 23,
  errors: []
}
```

#### 2.2 Add Recalculation Trigger Options

**Option A: Automatic (Recommended)**
- Trigger recalculation automatically when tiers are saved
- Show progress indicator
- Run in background (don't block UI)

**Option B: Manual Button**
- Add "Recalculate All Users" button
- Admin clicks when ready
- Show confirmation dialog
- Display progress/results

**Option C: Scheduled**
- Run recalculation nightly via cron
- Only recalculates if tiers changed

**Recommendation:** Use Option A (automatic) with Option B (manual) as backup

#### 2.3 User Tier History
**New Collection:** `users/{userId}/tierHistory`

**Purpose:**
- Track tier changes over time
- Audit trail for admin changes
- Show user tier progression

**Document Structure:**
```typescript
{
  fromTier: 'Player',
  toTier: 'Strategist',
  reason: 'admin_recalculation' | 'xp_earned' | 'manual_unlock',
  xpAtChange: 2500,
  changedAt: Timestamp,
  changedBy: 'admin_user_id' | 'system' | userId
}
```

---

### Phase 3: Data Structure Updates

#### 3.1 Tier Schema Enhancement
**Current:**
```typescript
interface Tier {
  name: string;
  minXP: number;
  multiplier: number;
  badge: string;
  perk: string;
  color: string;
  icon: string;
  unlockPrice?: number;
}
```

**Enhanced (Optional):**
```typescript
interface Tier {
  id: string;              // NEW: Unique identifier
  name: string;
  minXP: number;
  multiplier: number;
  badge: string;
  perk: string;
  color: string;
  icon: string;
  unlockPrice?: number;
  order: number;          // NEW: Display order
  enabled: boolean;       // NEW: Can disable without deleting
  createdAt?: string;     // NEW: When tier was created
  updatedAt?: string;      // NEW: Last modification
}
```

#### 3.2 User Document Updates
**Current User Fields:**
- `xp`: number
- `tier`: string (optional, might not exist)

**Add/Update:**
- `tier`: string (current tier name)
- `tierId`: string (reference to tier config)
- `tierUpdatedAt`: Timestamp (when tier was last calculated)
- `tierMultiplier`: number (cached multiplier for performance)

---

### Phase 4: Recalculation Logic

#### 4.1 When to Recalculate

**Automatic Triggers:**
1. ✅ Admin saves tier changes
2. ✅ User earns XP (already happens)
3. ✅ User unlocks tier manually (if unlockPrice set)

**Manual Triggers:**
1. Admin clicks "Recalculate All Users"
2. Admin clicks "Recalculate User" (single user)

#### 4.2 Recalculation Algorithm

```typescript
function recalculateUserTier(userXP: number, tiers: Tier[]): Tier {
  // Sort tiers by minXP descending
  const sortedTiers = [...tiers].sort((a, b) => b.minXP - a.minXP);
  
  // Find highest tier user qualifies for
  const userTier = sortedTiers.find(tier => userXP >= tier.minXP);
  
  // Fallback to lowest tier if somehow no match
  return userTier || tiers[0];
}
```

#### 4.3 Batch Processing

**For Large User Bases:**
- Process in batches of 100-500 users
- Use Firestore batch writes (max 500 per batch)
- Show progress indicator
- Handle errors gracefully (continue on error)

**Example:**
```typescript
async function recalculateAllUsers() {
  const usersSnapshot = await adminDb.collection('users').get();
  const batches = [];
  let currentBatch = adminDb.batch();
  let count = 0;
  
  for (const userDoc of usersSnapshot.docs) {
    const userData = userDoc.data();
    const newTier = recalculateUserTier(userData.xp || 0, tiers);
    
    if (userData.tier !== newTier.name) {
      currentBatch.update(userDoc.ref, {
        tier: newTier.name,
        tierMultiplier: newTier.multiplier,
        tierUpdatedAt: Timestamp.now()
      });
      count++;
      
      if (count % 500 === 0) {
        batches.push(currentBatch);
        currentBatch = adminDb.batch();
      }
    }
  }
  
  // Commit all batches
  await Promise.all(batches.map(batch => batch.commit()));
}
```

---

## File Changes Required

### 1. Admin Page Updates
**File:** `kaizen/app/admin/xp-tiers/page.tsx`

**Add:**
- `addTier()` function
- `deleteTier(index)` function
- `reorderTier(index, direction)` function
- `validateTiers()` function
- "Add Tier" button
- Delete buttons on each tier
- Reorder buttons
- Recalculation trigger/button

### 2. New API Endpoint
**New File:** `kaizen/app/api/admin/tiers/recalculate/route.ts`

**Functions:**
- `POST` - Recalculate all users
- `GET` - Get recalculation status/history

### 3. Utility Functions
**File:** `kaizen/lib/gamification.ts`

**Add:**
- `recalculateUserTier(xp, tiers)` - Calculate tier for user
- `validateTierConfiguration(tiers)` - Validate tier config
- `sortTiersByXP(tiers)` - Sort tiers correctly

### 4. User Tier Update
**Files:** 
- `kaizen/app/api/games/claim/route.ts` (already updates tier)
- `kaizen/app/api/payments/verify/route.ts` (update tier on purchase)
- `kaizen/app/context/GamificationContext.tsx` (read tier)

**Update:**
- Ensure tier is updated when XP changes
- Cache tier multiplier for performance

---

## User Experience Flow

### Admin Flow:
1. Admin goes to `/admin/xp-tiers`
2. Sees list of current tiers
3. Can:
   - Edit existing tier
   - Add new tier (click "Add Tier")
   - Delete tier (click trash icon)
   - Reorder tiers (click up/down arrows)
4. Clicks "Save Changes"
5. System validates tiers
6. If valid:
   - Saves to Firestore
   - Shows "Recalculating user tiers..." message
   - Triggers background recalculation
   - Shows success message with stats

### User Flow (After Recalculation):
1. User's tier is automatically updated
2. User sees new tier on profile/progress page
3. New multiplier applies to future JP earnings
4. User can see tier history (if implemented)

---

## Recalculation Scenarios

### Scenario 1: Admin Adds New Tier
**Example:** Add "Legend" tier at 10000 XP

**What Happens:**
- Users with 10000+ XP automatically get "Legend" tier
- Their multiplier updates to new tier's multiplier
- Previous tier assignments remain valid

### Scenario 2: Admin Changes Tier Requirements
**Example:** Change "Player" tier from 500 XP to 1000 XP

**What Happens:**
- Users with 500-999 XP lose "Player" tier
- They drop to "Newbie" tier
- Users with 1000+ XP keep "Player" tier
- All affected users get updated

### Scenario 3: Admin Deletes Tier
**Example:** Delete "Strategist" tier

**What Happens:**
- Users in "Strategist" tier get downgraded
- They move to highest tier they still qualify for
- Usually drops to "Player" tier
- All affected users notified (optional)

### Scenario 4: Admin Changes Multiplier
**Example:** Change "Grandmaster" multiplier from 1.5x to 2.0x

**What Happens:**
- Users keep same tier
- Future JP earnings use new multiplier
- Past earnings not affected (already awarded)

---

## Performance Considerations

### For Small User Base (< 1000 users):
- ✅ Recalculate immediately on save
- ✅ Process synchronously
- ✅ Show progress in UI

### For Large User Base (> 1000 users):
- ⚠️ Use background job/queue
- ⚠️ Process in batches
- ⚠️ Show progress indicator
- ⚠️ Allow cancellation
- ⚠️ Email admin when complete

### Optimization:
- Cache tier configuration in memory
- Only recalculate users whose tier might change
- Use Firestore batch writes (500 per batch)
- Index `users` collection by `xp` for faster queries

---

## Testing Checklist

- [ ] Add new tier works
- [ ] Delete tier works (with validation)
- [ ] Reorder tiers works
- [ ] Validation prevents invalid configs
- [ ] Recalculation updates all affected users
- [ ] Recalculation handles errors gracefully
- [ ] User tier updates correctly after recalculation
- [ ] Tier history is logged (if implemented)
- [ ] Performance is acceptable for large user base
- [ ] UI shows progress during recalculation

---

## Migration Strategy

### If Users Already Have Tiers:
1. Run one-time migration script
2. Calculate tier for each user based on XP
3. Update user documents
4. Log migration in tier history

### If Users Don't Have Tiers:
1. Recalculation will set initial tier
2. No migration needed

---

## Security Considerations

- ✅ Only admins can modify tiers
- ✅ Only admins can trigger recalculation
- ✅ Validate all tier data before saving
- ✅ Log all tier changes for audit
- ✅ Rate limit recalculation endpoint
- ✅ Require confirmation for destructive actions

---

## Future Enhancements (Optional)

1. **Tier Templates**
   - Save tier configurations as templates
   - Quick apply common tier setups

2. **Tier Analytics**
   - Show how many users in each tier
   - Distribution charts
   - Projected tier changes impact

3. **Tier Notifications**
   - Notify users when tier changes
   - Celebrate tier upgrades
   - Warn about tier downgrades

4. **Tier Requirements Beyond XP**
   - Add other requirements (purchases, events, etc.)
   - Complex tier logic

5. **Tier Expiration**
   - Tiers expire after inactivity
   - Time-based tier requirements

---

## Summary

### What Needs to Be Built:

1. **Admin UI** (`/admin/xp-tiers/page.tsx`)
   - Add tier button
   - Delete tier button
   - Reorder functionality
   - Validation

2. **Recalculation API** (`/app/api/admin/tiers/recalculate/route.ts`)
   - Process all users
   - Update tiers
   - Return statistics

3. **Utility Functions** (`lib/gamification.ts`)
   - Tier calculation logic
   - Validation functions
   - Helper functions

4. **User Updates**
   - Ensure tier field exists
   - Update tier on XP changes
   - Cache tier multiplier

### Estimated Complexity:
- **Admin UI Changes:** Medium (2-3 hours)
- **Recalculation API:** Medium-High (3-4 hours)
- **Testing & Edge Cases:** High (2-3 hours)
- **Total:** ~8-10 hours

### Priority:
- **High:** Add/Delete tiers, Basic recalculation
- **Medium:** Reordering, Validation
- **Low:** Tier history, Analytics, Notifications
