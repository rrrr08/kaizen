# Tier Pricing System

## Overview

Users can now buy tier upgrades with Joy Points (JP) to unlock tiers early without earning XP.

## Features

- ✅ Set unlock price for each tier in admin panel
- ✅ Price of 0 = earn-only tier
- ✅ Price > 0 = can be purchased with JP
- ✅ Instant XP grant upon purchase
- ✅ Unlock button shown on progress page

## Implementation

### Admin Configuration

At `/admin/xp-tiers`, set the "Unlock Price (JP)" field:
- 0 = Free (earn only)
- 2000 = Costs 2000 JP to unlock

### User Experience

On `/progress` page:
- Locked tiers show "UNLOCK {price} JP" button
- Clicking deducts JP and grants tier's minimum XP
- User immediately gets tier benefits

### API Endpoint

`POST /api/user/unlock-tier`

```json
{
  "tierName": "Player",
  "price": 2000,
  "xpGrant": 500
}
```
