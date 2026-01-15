# Email Invoice Pricing Fix

## Problem
Email invoices were displaying prices multiplied by 100. For example:
- Actual price: ₹100
- Email display: ₹10,000

## Root Cause
Razorpay (payment gateway) sends amounts in **paisa** (Indian currency subunit), where:
- **1 Rupee = 100 Paisa**
- A ₹100 purchase is sent as 10000 paisa

The payment verification endpoint (`/api/payments/verify`) was receiving amounts in paisa from Razorpay but passing them directly to email templates without converting to rupees.

## Solution
Divide all monetary values by 100 before passing to email templates to convert from paisa to rupees.

### Files Modified
- **app/api/payments/verify/route.ts** (2 locations)

### Changes Made

#### 1. Order Invoice Email (Lines 177-186)
```typescript
// BEFORE
const invoiceHtml = getOrderInvoiceTemplate({
  id: orderDoc.id,
  createdAt: new Date(),
  items: orderData.items,
  totalPrice: amount,
  shippingAddress: orderData.shippingAddress || {},
  subtotal: orderData.subtotal || amount,
  gst: orderData.gst || 0,
  gstRate: orderData.gstRate || 0
});

// AFTER
const invoiceHtml = getOrderInvoiceTemplate({
  id: orderDoc.id,
  createdAt: new Date(),
  items: orderData.items,
  totalPrice: amount / 100, // Convert from paisa to rupees
  shippingAddress: orderData.shippingAddress || {},
  subtotal: (orderData.subtotal || amount) / 100, // Convert from paisa to rupees
  gst: (orderData.gst || 0) / 100, // Convert from paisa to rupees
  gstRate: orderData.gstRate || 0
});
```

#### 2. Event Confirmation Email (Line 302)
```typescript
// BEFORE
const ticketHtml = getEventConfirmationTemplate(
  regRef.id,
  userData.displayName || userData.name || 'Gamer',
  eventData?.title || 'Event',
  eventData?.datetime?.toDate(),
  eventData?.location,
  amount
);

// AFTER
const ticketHtml = getEventConfirmationTemplate(
  regRef.id,
  userData.displayName || userData.name || 'Gamer',
  eventData?.title || 'Event',
  eventData?.datetime?.toDate(),
  eventData?.location,
  amount / 100 // Convert from paisa to rupees
);
```

## Why Item Prices Don't Need Conversion
- Item prices in cart come from Firestore `products` collection
- Products are stored with prices in **rupees** (not paisa)
- Only Razorpay callback amounts are in paisa
- Item prices in email template are already correct

## Payment Flow
1. **Order Creation** (`/api/payments/create-order`)
   - Client sends `amount` in rupees (e.g., 100)
   - Converts to paisa: `razorpayAmount = amount * 100` (e.g., 10000)
   - Sends 10000 to Razorpay

2. **Razorpay Callback** (`/api/payments/verify`)
   - Razorpay sends `amount: 10000` (paisa)
   - **OLD**: Passed 10000 directly to email → displayed ₹10,000
   - **NEW**: Divides by 100 → displayed ₹100 ✓

## Verification
```bash
npm run build
```
Build successful with 0 errors.

## Related Code References
- Payment creation: `app/api/payments/create-order/route.ts` (Line 89: multiplies by 100)
- XP calculation: `app/api/payments/verify/route.ts` (Line 90: already divides by 100)
- Email templates: `lib/email-templates.ts`
  - `getOrderInvoiceTemplate()` (Lines 120-229)
  - `getEventConfirmationTemplate()` (Lines 243-329)

## Status
✅ Fixed
✅ Build verified
✅ Ready for deployment
