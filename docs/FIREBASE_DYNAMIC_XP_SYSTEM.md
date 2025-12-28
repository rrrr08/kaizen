# Firebase Dynamic XP System

## Overview

The XP system is fully dynamic and stored in Firebase at `settings/xpSystem`.

## Structure

```json
{
  "tiers": [
    {
      "name": "Newbie",
      "minXP": 0,
      "multiplier": 1.0,
      "badge": "Grey Meeple",
      "perk": "None",
      "color": "#94a3b8",
      "icon": "♟️",
      "unlockPrice": 0
    }
  ],
  "xpSources": [
    {
      "name": "Shop Purchase (per ₹100)",
      "baseXP": 10,
      "baseJP": 10,
      "enabled": true
    }
  ]
}
```

## Features

- ✅ Real-time updates via Firestore listeners
- ✅ Admin customizable through `/admin/xp-tiers`
- ✅ Tier multipliers apply to JP rewards
- ✅ Users can buy tier upgrades with JP

## Implementation

All XP/JP calculations fetch tier data from Firebase dynamically. No hardcoded values.
