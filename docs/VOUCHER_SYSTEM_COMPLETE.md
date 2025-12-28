# Voucher System Complete

## Overview

Complete voucher/coupon system for discounts on shop, events, and experiences.

## Features

### User Features
- ✅ Buy vouchers with JP at `/rewards`
- ✅ Apply vouchers at checkout
- ✅ Category validation (shop/events/experiences)
- ✅ View "My Vouchers" section
- ✅ Used vouchers auto-removed from list

### Admin Features
- ✅ Create/edit vouchers at `/admin/vouchers`
- ✅ Set discount type (percentage/fixed)
- ✅ Set min purchase and max discount
- ✅ Set expiry days
- ✅ Enable/disable vouchers
- ✅ Initialize default vouchers

## Voucher Structure

```json
{
  "name": "10% Welcome Discount",
  "code": "WELCOME10",
  "pointsCost": 500,
  "discountType": "percentage",
  "discountValue": 10,
  "category": "shop",
  "minPurchase": 500,
  "maxDiscount": 200,
  "expiryDays": 30,
  "enabled": true
}
```

## Usage Flow

1. User buys voucher with JP → stored in Firestore
2. User applies code at checkout → validates
3. Discount applied to order
4. After payment → voucher marked as used
5. Used voucher removed from "My Vouchers"
