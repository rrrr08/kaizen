# Rewards System Documentation

## Overview
Users can redeem their Joy Points (JP) for discount vouchers and coupons that can be used on shop purchases, event tickets, and gaming experiences.

## Features

### Rewards Store (`/rewards`)
- Browse available vouchers by category (Shop, Events, Experiences)
- View point cost and discount value for each voucher
- Redeem vouchers instantly
- View all redeemed vouchers with codes and expiry dates

### Available Vouchers

#### Shop Vouchers
- **10% Off Shop** - 500 JP - 10% discount on any purchase
- **20% Off Shop** - 1000 JP - 20% discount on any purchase
- **₹100 Off** - 800 JP - ₹100 off on orders above ₹500

#### Event Vouchers
- **15% Off Events** - 600 JP - 15% discount on event tickets
- **Free Event Entry** - 1500 JP - One free entry to any community event

#### Experience Vouchers
- **25% Off Experiences** - 1200 JP - 25% discount on gaming experiences

## How It Works

### For Users

1. **Earn Points**: Play games to earn Joy Points
2. **Browse Rewards**: Visit `/rewards` to see available vouchers
3. **Redeem**: Click "REDEEM NOW" on any voucher you can afford
4. **Get Code**: Receive a unique voucher code (e.g., `JOYKX7A2B9C`)
5. **Use Code**: Apply the code at checkout to get your discount

### Voucher Properties

Each voucher has:
- **Name**: Display name
- **Description**: What the voucher offers
- **Points Cost**: How many JP required
- **Discount Type**: Percentage or fixed amount
- **Discount Value**: The discount amount
- **Category**: Shop, Events, or Experiences
- **Expiry**: Valid for X days after redemption

## API Endpoints

### POST `/api/rewards/redeem`
Redeem points for a voucher.

**Headers:**
```
Authorization: Bearer {firebase-token}
```

**Body:**
```json
{
  "voucherId": "shop_10",
  "pointsCost": 500,
  "voucherData": {
    "name": "10% Off Shop",
    "description": "Get 10% discount on any shop purchase",
    "discountType": "percentage",
    "discountValue": 10,
    "category": "shop",
    "expiryDays": 30
  }
}
```

**Response:**
```json
{
  "success": true,
  "code": "JOYKX7A2B9C",
  "expiresAt": "2026-01-27T10:30:00.000Z",
  "newBalance": 4500
}
```

### GET `/api/rewards/my-vouchers`
Get user's redeemed vouchers.

**Headers:**
```
Authorization: Bearer {firebase-token}
```

**Response:**
```json
{
  "vouchers": [
    {
      "id": "abc123",
      "userId": "user123",
      "voucherId": "shop_10",
      "code": "JOYKX7A2B9C",
      "name": "10% Off Shop",
      "description": "Get 10% discount on any shop purchase",
      "discountType": "percentage",
      "discountValue": 10,
      "category": "shop",
      "pointsCost": 500,
      "redeemedAt": "2025-12-28T10:30:00.000Z",
      "expiresAt": "2026-01-27T10:30:00.000Z",
      "used": false,
      "usedAt": null
    }
  ]
}
```

## Firestore Collections

### `vouchers`
Stores all redeemed vouchers.

**Document Structure:**
```javascript
{
  userId: string,
  voucherId: string,
  code: string,
  name: string,
  description: string,
  discountType: 'percentage' | 'fixed',
  discountValue: number,
  category: 'shop' | 'events' | 'experiences',
  pointsCost: number,
  redeemedAt: timestamp,
  expiresAt: timestamp,
  used: boolean,
  usedAt: timestamp | null
}
```

### `transactions`
Logs all point transactions including voucher redemptions.

**Document Structure:**
```javascript
{
  userId: string,
  type: 'voucher_redemption',
  amount: number, // negative for spending
  voucherId: string,
  voucherCode: string,
  timestamp: timestamp
}
```

## Integration with Checkout

To apply vouchers at checkout:

1. User enters voucher code
2. Validate code:
   - Check if exists in `vouchers` collection
   - Check if belongs to user
   - Check if not expired
   - Check if not already used
3. Apply discount based on `discountType` and `discountValue`
4. Mark voucher as used:
   ```javascript
   {
     used: true,
     usedAt: new Date().toISOString()
   }
   ```

## Admin Management

Admins can:
- View all redeemed vouchers
- Track redemption statistics
- Add new voucher types (update `AVAILABLE_VOUCHERS` array)
- Adjust point costs
- Set expiry periods

## Future Enhancements

- [ ] Limited-time vouchers
- [ ] Seasonal/special event vouchers
- [ ] Voucher gifting to other users
- [ ] Voucher stacking rules
- [ ] Minimum purchase requirements
- [ ] Category-specific restrictions
- [ ] Voucher usage analytics
- [ ] Email notifications on redemption
- [ ] Push notifications for expiring vouchers

## Security

- All endpoints require Firebase Authentication
- Users can only redeem vouchers if they have sufficient points
- Voucher codes are unique and randomly generated
- Expired vouchers cannot be used
- Used vouchers cannot be reused
- Points are deducted atomically with voucher creation

## Testing

1. Earn points by playing games
2. Visit `/rewards`
3. Try redeeming a voucher you can afford
4. Check "MY VOUCHERS" section for your code
5. Verify points were deducted from balance
6. Check Firestore `vouchers` collection for the document
