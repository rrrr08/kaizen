# XP & Tier System Documentation

## Overview
The XP (Experience Points) system rewards users for engagement and unlocks tier-based benefits with JP (Joy Points) multipliers.

## How It Works

### XP vs JP
- **XP (Experience Points)**: Determines your tier level. Never decreases.
- **JP (Joy Points)**: Currency for rewards and purchases. Can be spent.

### Earning System
When you earn rewards:
1. **XP increases by base amount** (no multiplier)
2. **JP increases by base amount × your tier multiplier**

Example: Earn 10 points at Strategist tier (1.25x)
- +10 XP
- +12.5 JP (rounded to 13)

## Tier System

### Default Tiers (Customizable by Admin)

| Tier | Min XP | Multiplier | Badge | Perk |
|------|--------|------------|-------|------|
| **Newbie** | 0 | 1.0x | Grey Meeple ♟️ | None |
| **Player** | 500 | 1.1x | Green Pawn ♟️ | Early access to Event Tickets |
| **Strategist** | 2000 | 1.25x | Blue Rook ♜ | 5% off all Workshops |
| **Grandmaster** | 5000 | 1.5x | Gold Crown 👑 | VIP Seating at Game Nights |

## XP Sources

### 1. Playing Games
- Daily games award XP based on game difficulty
- Game of the Day gives 2x points
- XP awarded: Base game points
- JP awarded: Base points × tier multiplier

### 2. Shop Purchases
- Default: 10 XP per ₹100 spent
- JP also awarded: 0.1 JP per ₹1 × tier multiplier
- Customizable by admin

### 3. Event Registration
- Default: 50 XP per event registration
- JP also awarded: 50 × tier multiplier
- Customizable by admin

### 4. Workshop Registration
- Default: 75 XP per workshop
- JP also awarded: 75 × tier multiplier
- Customizable by admin

### 5. Wheel of Joy
- Can win XP directly (75 XP prize)
- Can win JP prizes (30 JP, 1000 JP jackpot)

## Tier Perks Implementation

### Early Event Access (Player Tier+)
- Users with 500+ XP get priority access to event tickets
- Check: `hasEarlyEventAccess` from GamificationContext

### Workshop Discount (Strategist Tier+)
- 5% discount on workshop registrations
- Check: `workshopDiscountPercent` from GamificationContext

### VIP Seating (Grandmaster Tier)
- VIP seating at game nights and events
- Check: `hasVIPSeating` from GamificationContext

## Admin Customization

### Admin Panel: `/admin/xp-tiers`

Admins can customize:
1. **Tier Configuration**
   - Tier name
   - Minimum XP required
   - JP multiplier
   - Badge name and icon
   - Tier perk description
   - Color theme
   - **Unlock Price (JP)** - Optional price to unlock tier early

2. **XP Sources**
   - Enable/disable XP sources
   - Set base XP amounts
   - Add custom XP sources

### Tier Unlock Pricing
Admins can set an optional JP price for each tier. This allows users to either:
- **Earn XP naturally** by playing games, shopping, etc.
- **Pay JP to unlock early** and instantly jump to that tier

Example: Set Player tier unlock price to 2000 JP. Users can either:
- Earn 500 XP through gameplay (free)
- Pay 2000 JP to instantly unlock Player tier

### Firestore Structure
```
settings/xpSystem
{
  tiers: [
    {
      name: "Newbie",
      minXP: 0,
      multiplier: 1.0,
      badge: "Grey Meeple",
      perk: "None",
      color: "#94a3b8",
      icon: "♟️",
      unlockPrice: 0
    },
    {
      name: "Player",
      minXP: 500,
      multiplier: 1.1,
      badge: "Green Pawn",
      perk: "Early access to Event Tickets",
      color: "#34d399",
      icon: "♟️",
      unlockPrice: 2000
    },
    ...
  ],
  xpSources: [
    {
      name: "Shop Purchase (per ₹100)",
      baseXP: 10,
      enabled: true
    },
    ...
  ],
  updatedAt: "2025-12-28T..."
}
```

## User Progress Page

### Route: `/progress`

Shows users:
- Current XP and JP balance
- Current tier with icon and badge
- Progress bar to next tier
- XP remaining to next tier
- Complete tier roadmap with unlock status
- **Unlock buttons** for locked tiers (if admin set a price)
- How to earn XP guide

Users can click "Unlock for X JP" to instantly purchase a tier upgrade.

## API Endpoints

### Award Game Points
`POST /api/games/award`
- Awards both XP and JP with tier multiplier
- Returns: `awardedXP`, `awardedPoints` (JP), `tierMultiplier`, `currentTier`

### Get Tier Perks
`GET /api/user/tier-perks`
- Returns user's current tier and available perks
- Requires Firebase Auth token

### Payment Verification
`POST /api/payments/verify`
- Automatically awards XP for purchases and event registrations
- Applies tier multiplier to JP rewards

### Unlock Tier
`POST /api/user/unlock-tier`
- Allows users to purchase tier upgrades with JP
- Requires: `tierName`, `price`, `xpGrant`
- Deducts JP and grants XP instantly
- Logs transaction in user's transaction history

## Integration Guide

### Using in Components
```typescript
import { useGamification } from '@/app/context/GamificationContext';

function MyComponent() {
  const { 
    xp, 
    balance, 
    tier, 
    nextTier,
    hasEarlyEventAccess,
    workshopDiscountPercent,
    hasVIPSeating 
  } = useGamification();
  
  // Check tier perks
  if (hasEarlyEventAccess) {
    // Show early access button
  }
  
  if (workshopDiscountPercent > 0) {
    // Apply discount: price * (1 - workshopDiscountPercent / 100)
  }
  
  if (hasVIPSeating) {
    // Show VIP seating option
  }
}
```

### Awarding XP Manually
```typescript
const { awardPoints } = useGamification();

// Award 50 XP (and JP with multiplier)
await awardPoints(50, 'Custom achievement');
```

## Testing

1. **Test Game Awards**: Play games and verify XP/JP awarded correctly
2. **Test Purchases**: Make a purchase and check XP awarded
3. **Test Event Registration**: Register for event and verify bonus XP
4. **Test Tier Progression**: Verify multiplier increases at tier thresholds
5. **Test Perks**: Verify perks activate at correct XP levels

## Future Enhancements

- Achievement badges for XP milestones
- Seasonal XP events with bonus multipliers
- XP leaderboards
- Tier-exclusive content
- Custom tier icons upload
- XP decay for inactive users (optional)
