# Fix: Razorpay International Card Payment Rejection

## Problem Summary

**Error:** `BAD_REQUEST_ERROR - international_transaction_not_allowed`

Customers using international debit/credit cards (Visa, Mastercard, etc.) are unable to complete payments. The error occurs at the Razorpay payment gateway level.

**Affected Flow:**
1. Customer selects international card as payment method
2. Checkout page sends payment request to Razorpay
3. Razorpay rejects with: "international_transaction_not_allowed"
4. Customer sees payment failed error

---

## Root Causes

### 1. Merchant Account Configuration (Primary)
Your Razorpay merchant account has **international card transactions DISABLED**. This is a business rule restriction set in your Razorpay dashboard.

### 2. Card Type
The customer is using a **Consumer International Prepaid Card** which Razorpay identifies as an international card due to:
- Card BIN (Bank Identification Number) indicating foreign issuer
- Card flags indicating international/prepaid status
- Cardholder location mismatch

---

## Solutions

### Solution 1: Enable International Transactions (Recommended)

**For: Merchants who want to accept international cards**

Steps:
1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Go to **Settings** (gear icon, top-right)
3. Click **Payment Methods**
4. Find **Credit/Debit Cards** section
5. Look for toggle: **International Cards** or **International Transactions**
6. Enable the toggle
7. Click **Save**
8. Wait 5-10 minutes for settings to propagate
9. Test with international card

**Additional Checks:**
- Verify your Razorpay account is fully **activated** (not in sandbox/restricted mode)
- Check that your business is registered for international payments
- Contact Razorpay support if toggling doesn't appear

### Solution 2: Direct Customer to Supported Payment Methods

**For: Merchants who don't want international card support**

Inform customers to use:
- ✅ **UPI** - Fastest, no cards needed
- ✅ **Domestic Debit Cards** - Indian bank cards
- ✅ **Netbanking** - Direct bank transfer
- ✅ **Wallets** - Indian e-wallets (if supported)
- ✅ **EMI** - If available in merchant settings

---

## Code Changes Implemented

### 1. Enhanced Error Handling (✅ DONE)

**File:** `app/checkout/page.tsx` (Lines 254-286)

**What Changed:**
- Error catch block now detects specific error types
- International card errors show helpful message
- Different messages for card-declined, network, and other errors
- Users get actionable next steps

**Error Message for International Cards:**
```
Title: "International card not supported"
Description: "Please use a domestic Indian card, UPI, or other Indian payment methods."
```

### 2. Enhanced Error Page (✅ DONE)

**File:** `app/payment-error/page.tsx`

**What Changed:**
- Added new section: "Using an International Card?"
- Shows specific guidance for international card users
- Lists alternative payment methods
- Updated "What to do next" section with international card handling

**New Section:**
```
💳 Using an International Card?

If you're using an international debit or credit card, we currently don't 
support international card transactions. Here are your options:

→ Best Option: Use UPI or Indian payment methods
→ Use a domestic Indian debit/credit card if available
→ Contact your bank about using your card for Indian payments
```

---

## Testing the Fix

### Test Case 1: International Card (After enabling international transactions)

1. Go to checkout page
2. Use test card:
   - **Number:** 4111111111111111 (Visa)
   - **Expiry:** Any future date
   - **CVV:** Any 3 digits
3. Complete payment
4. Should succeed ✅

### Test Case 2: International Card (If not enabling)

1. Go to checkout page
2. Try international card
3. Should see error with international card guidance
4. Customer tries UPI instead
5. Payment succeeds ✅

---

## Razorpay Dashboard Settings Reference

### Account Settings Path
```
Razorpay Dashboard
└── Settings (gear icon)
    └── Payment Methods
        └── Credit/Debit Cards
            └── [Toggle] International Cards
```

### Related Settings
- **Account Status** → Must be "Active" for international payments
- **Business Type** → Verify correct business type is set
- **International Payments** → Check if explicitly enabled/disabled
- **Payment Method Settings** → Verify each card type settings

---

## Customer Communication

### What to Tell Customers

**If International Cards Are NOT Supported:**
```
"We currently only accept Indian payment methods. You can use:
- UPI (fastest!)
- Indian Debit/Credit Cards
- Netbanking
- Other Indian payment methods

If you'd like to pay with your international card, please contact support."
```

**If International Cards ARE Supported (After Fix):**
```
"We accept international cards! If you experience issues:
1. Verify card details are correct
2. Ensure sufficient funds
3. Contact your bank to enable international transactions for Indian merchants
4. Try a different payment method"
```

---

## Troubleshooting

### Issue: International Toggle Not Visible

**Solution:**
- Razorpay account may not be fully activated
- Contact Razorpay support: [support.razorpay.com](https://razorpay.com/support)
- Provide your Razorpay Account ID
- Request: "Enable international card transaction support"

### Issue: Toggle Enabled, Still Getting Error

**Solution:**
- Settings might need time to propagate (wait 5-10 minutes)
- Clear browser cache
- Try in incognito/private mode
- Verify in a fresh test payment
- Check Razorpay logs in dashboard for specific error code

### Issue: Only Some International Cards Fail

**Solution:**
- Some card networks have additional restrictions
- Check which card type is failing (Visa, Mastercard, Amex, etc.)
- Contact Razorpay support with card BIN (first 6 digits)
- Request whitelisting for that card type

---

## Implementation Status

| Component | Status | Details |
|-----------|--------|---------|
| Error Detection | ✅ Done | Checkout catches international_transaction_not_allowed |
| Error Message | ✅ Done | User-friendly message with alternatives |
| Error Page | ✅ Done | Enhanced with international card guidance |
| Admin Settings | ⏳ Admin Action | Need to enable in Razorpay dashboard |
| Customer Testing | ⏳ Pending | Test with international card after admin fix |

---

## Next Steps

### For Admin/Merchant:
1. Log in to Razorpay Dashboard
2. Go to Settings → Payment Methods
3. Enable International Cards toggle
4. Save and wait 5-10 minutes
5. Test with international card

### For Development Team:
1. ✅ Error handling improved (DONE)
2. ✅ Error page enhanced (DONE)
3. ⏳ Monitor customer payments after fix
4. ⏳ Collect feedback if more improvements needed

### For Customer Support:
1. Guide customers to international card instructions
2. Suggest UPI/domestic cards as alternative
3. Escalate to Razorpay support if needed
4. Inform customers once international payments are enabled

---

## Related Documentation

- [Razorpay Payment Methods](https://razorpay.com/docs/payments/paymentlinks/api/create-payment-link/#payment-method)
- [Razorpay Test Cards](https://razorpay.com/docs/payments/testing)
- [Razorpay Support](https://razorpay.com/support)
- [Checkout Page Code](./app/checkout/page.tsx)
- [Error Page Code](./app/payment-error/page.tsx)

---

**Last Updated:** Phase 5 - Payment Error Resolution
**Document Version:** 1.0
**Status:** Ready for Implementation
