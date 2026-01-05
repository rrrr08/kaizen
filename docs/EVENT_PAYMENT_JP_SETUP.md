# Event Payment & JP/XP System Setup

## Overview
Events now have the **same payment system as shop products**, including:
- ✅ **Razorpay Payment Gateway** integration
- ✅ **JP Wallet Points** redemption (up to 50% of order value)
- ✅ **Voucher/Promo Code** support
- ✅ **Tier-based discounts** (Workshop Discount for Strategist tier)
- ✅ **XP & JP rewards** based on event price + registration bonus
- ✅ **VIP Seating** option for Grandmaster tier

## Payment Flow

### 1. **Event Registration Form**
**File**: `components/EventRegistrationForm.tsx`

When a user clicks "REGISTER NOW" on an event:
1. Opens registration form modal
2. Collects user details (name, email, phone)
3. Shows tier perks (discounts, VIP seating, early access)
4. Allows JP wallet point redemption
5. Allows voucher/promo code application
6. Calculates final price with all discounts
7. Initiates Razorpay payment

### 2. **Price Calculation**
```
Base Price: ₹500 (event.price)
- Tier Discount: -₹50 (10% for Strategist tier)
- JP Wallet: -₹100 (200 JP @ ₹0.50 per JP)
- Voucher: -₹50 (WELCOME50 promo)
= Final Amount: ₹300
```

**Limits**:
- JP Wallet can redeem max 50% of order value
- Vouchers are validated against category: `events`
- Tier multipliers apply to JP earnings

### 3. **Payment Order Creation**
**API**: `POST /api/payments/create-order`

Creates Razorpay order with:
```json
{
  "amount": 300,
  "currency": "INR",
  "receipt": "EVT-event123-1234567890",
  "notes": {
    "eventId": "event123",
    "eventName": "Chess Championship 2026",
    "userName": "John Doe",
    "userEmail": "john@example.com"
  }
}
```

**Response**:
```json
{
  "success": true,
  "orderId": "order_NxYzABC123",
  "amount": 30000,
  "currency": "INR"
}
```

### 4. **Payment Verification & Registration**
**API**: `POST /api/payments/verify`

After Razorpay payment success:
1. Verifies payment signature (HMAC SHA256)
2. Completes event registration in Firestore
3. Awards XP & JP rewards
4. Marks voucher as used (if applied)
5. Redirects to success page

**XP/JP Rewards Formula**:
```
Base Registration XP: 50 XP (configurable)
Base Registration JP: 50 JP (configurable)

Price-based XP: (amount / 100) × 10 XP per ₹100
Price-based JP: (amount / 100) × 10 JP per ₹100

Total XP: Base + Price-based
Total JP: (Base + Price-based) × Tier Multiplier

Example for ₹300 event:
- XP: 50 + (300/100 × 10) = 50 + 30 = 80 XP
- JP: (50 + 30) × 1.25 (Strategist) = 100 JP
```

## JP Wallet Integration

### **Redemption UI**
Located in EventRegistrationForm modal:
```tsx
{walletPoints > 0 && (
  <div className="jp-wallet-section">
    <input 
      type="number" 
      max={Math.min(walletPoints, maxRedeemPoints)}
      onChange={handleRedeemPointsChange}
    />
    <button onClick={handleUseMaxPoints}>USE MAX</button>
  </div>
)}
```

### **Backend Point Deduction**
When user redeems points:
```typescript
// In EventRegistrationForm.tsx
const { updateDoc, increment } = await import('firebase/firestore');
await updateDoc(userRef, {
  points: increment(-actualRedeemPoints)
});
```

### **Point Worth Calculation**
```typescript
// From GamificationContext
config.redeemRate = 0.5 (default: ₹0.50 per JP)
pointsDiscount = redeemPoints × config.redeemRate

Example:
200 JP × ₹0.50 = ₹100 discount
```

## Voucher System

### **Validation**
**API**: `POST /api/rewards/validate`

```json
{
  "code": "WELCOME50",
  "orderTotal": 450,
  "category": "events"
}
```

**Response**:
```json
{
  "valid": true,
  "voucher": {
    "name": "Welcome Discount",
    "code": "WELCOME50",
    "type": "percentage",
    "value": 10
  },
  "discount": {
    "amount": 45.00
  },
  "voucherId": "voucher_abc123"
}
```

### **Mark as Used**
**API**: `POST /api/rewards/use`

After successful payment:
```json
{
  "voucherId": "voucher_abc123",
  "orderId": "order_NxYzABC123"
}
```

## Tier-Based Perks

### **Workshop Discount** (Strategist Tier)
- 10% discount on all events
- Applied automatically based on user's XP tier
- Shown in "YOUR TIER PERKS" section

### **VIP Seating** (Grandmaster Tier)
- Optional checkbox in registration form
- Stored in registration details
- Shown in confirmation email/page

### **Early Event Access** (Player Tier)
- Badge shown on event detail page
- Users with Player tier or higher see this perk

## Firebase Structure

### **Event Registration Document**
```
event_registrations/{registrationId}
{
  eventId: "event123",
  userId: "user456",
  status: "registered",
  timestamp: Timestamp,
  paymentStatus: "paid",
  amount: 300,
  pointsUsed: 200,
  voucherId: "voucher_abc123"
}
```

### **User Document (JP/XP)**
```
users/{userId}
{
  xp: 1250,
  points: 450,  // JP wallet balance
  tier: "Strategist"
}
```

### **Transaction Log**
```
transactions/{transactionId}
{
  userId: "user456",
  type: "event_registration",
  eventId: "event123",
  amount: 300,
  xpEarned: 80,
  jpEarned: 100,
  pointsRedeemed: 200,
  timestamp: Timestamp
}
```

## Setup Instructions

### 1. **Environment Variables**
Add to `.env.local`:
```env
# Razorpay (Same as shop products)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX

# Firebase Admin (already configured)
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=...
FIREBASE_ADMIN_PRIVATE_KEY=...
```

### 2. **Razorpay Account Setup**
1. Sign up at https://razorpay.com (free test account)
2. Go to Settings → API Keys
3. Generate Test Keys (rzp_test_*)
4. Copy Key ID and Secret to `.env.local`
5. **Important**: Test mode doesn't require actual payment

### 3. **Firebase XP Settings** (Optional)
Configure in `settings/xpSystem` document:
```json
{
  "xpSources": [
    {
      "name": "Event Registration",
      "baseXP": 50,
      "baseJP": 50
    },
    {
      "name": "Shop Purchase",
      "baseXP": 10,
      "baseJP": 10
    }
  ],
  "tiers": [
    { "name": "Newbie", "minXP": 0, "multiplier": 1.0 },
    { "name": "Player", "minXP": 500, "multiplier": 1.1 },
    { "name": "Strategist", "minXP": 2000, "multiplier": 1.25 },
    { "name": "Grandmaster", "minXP": 5000, "multiplier": 1.5 }
  ]
}
```

### 4. **Test the System**
1. Create a test event with price (e.g., ₹500)
2. Add JP to test user's wallet (manually in Firebase)
3. Try registering with:
   - JP wallet points
   - Voucher code (create one in Firebase)
   - Different tier levels
4. Verify XP/JP awarded after payment
5. Check registration in `event_registrations` collection

## Fixing the 400 Error

**Issue**: `POST /api/payments/create-order 400`

**Cause**: Missing or invalid Razorpay credentials

**Solution**:
1. Check `.env.local` has both variables:
   ```
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
   RAZORPAY_KEY_SECRET=...
   ```

2. Restart Next.js dev server after adding env vars:
   ```bash
   npm run dev
   ```

3. Verify in browser console:
   ```js
   console.log(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID)
   // Should NOT be undefined
   ```

4. **Test Mode**: If you see "Payment gateway not configured" error, it means credentials are missing. Get them from Razorpay dashboard.

## Key Differences from Shop Products

| Feature | Shop Products | Events |
|---------|--------------|--------|
| **Item Type** | Physical/digital products | Event registrations |
| **Quantity** | Multiple items in cart | Single event per registration |
| **Shipping** | Address required | Location shown in event details |
| **Capacity** | Unlimited stock | Limited seats (waitlist support) |
| **Delivery** | Physical/digital delivery | Attendance on event date |
| **Tier Perks** | General shop discounts | Workshop discount + VIP seating |

## Testing Checklist

- [ ] Razorpay credentials configured in `.env.local`
- [ ] User has JP in wallet (test by adding manually)
- [ ] Event has price > 0 set
- [ ] User can redeem up to 50% with JP
- [ ] Voucher validation works for `events` category
- [ ] Payment verification awards correct XP/JP
- [ ] Registration success page shows all details
- [ ] User's wallet balance updates after redemption
- [ ] Tier discounts applied correctly
- [ ] VIP seating checkbox works (Grandmaster tier)

## Troubleshooting

### **"Payment gateway not configured"**
- Missing env variables
- Restart dev server after adding credentials

### **"Invalid amount" 400 error**
- Event price is 0 or negative
- Check `event.price` field in Firebase

### **JP points not deducting**
- Check Firestore rules allow user to update their own `points` field
- Verify `increment(-amount)` is called correctly

### **XP/JP not awarded after payment**
- Check `/api/payments/verify` logs in terminal
- Verify `xpSystem` settings document exists in Firebase
- Check user document has `xp` and `points` fields

### **Voucher not applying**
- Voucher must have `category: "events"` or `category: "all"`
- Check voucher hasn't been used already
- Verify voucher is still valid (not expired)

## Code Files Modified

1. ✅ `components/EventRegistrationForm.tsx`
   - Added JP wallet redemption UI
   - Added points deduction on payment
   - Updated price calculation with points

2. ✅ `app/api/payments/verify/route.ts`
   - Enhanced XP/JP reward calculation
   - Added price-based rewards (like shop purchases)
   - Kept tier multiplier for JP

3. ✅ `app/api/payments/create-order/route.ts`
   - Already working (shared with shop products)

4. ✅ `lib/db/payments.ts`
   - Already supports event registration
   - `createPaymentOrder()` and `completeRegistration()` functions

## Summary

Events now have **full payment parity with shop products**:
- 💰 Same Razorpay payment flow
- 🪙 JP wallet point redemption (max 50%)
- 🎟️ Voucher/promo code support
- 👑 Tier-based perks and discounts
- ⭐ XP/JP rewards based on event value
- 📧 Transaction logging and confirmation

The system is production-ready once Razorpay credentials are configured!
