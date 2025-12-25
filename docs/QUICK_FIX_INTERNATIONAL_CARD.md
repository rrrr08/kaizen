# 🚀 QUICK FIX: International Card Payment Error

## ⚡ The Problem
Customers using international credit/debit cards get payment error:
```
BAD_REQUEST_ERROR
Reason: international_transaction_not_allowed
```

## ✅ The Solution (3 Steps)

### Step 1: Enable International Payments
```
1. Go to: https://dashboard.razorpay.com
2. Click Settings (⚙️ icon)
3. Click "Payment Methods"
4. Find "Credit/Debit Cards"
5. Toggle ON: "International Cards"
6. Click Save
7. Wait 5-10 minutes
```

### Step 2: Test
- Use international test card (4111111111111111)
- Payment should now work ✅

### Step 3: Inform Customers
If you want to KEEP international cards disabled:
- Tell them to use: **UPI, Netbanking, or Indian debit cards**

---

## 📊 What We've Done in Code

✅ **app/checkout/page.tsx** - Detects international card errors and shows helpful message  
✅ **app/payment-error/page.tsx** - Shows customer-friendly guidance with alternatives  
✅ **Error Messages** - Now explains what to do instead of generic errors

---

## 🆘 Still Having Issues?

**If international toggle is missing:**
- Contact Razorpay: support@razorpay.com
- Provide your Account ID

**If it still fails after enabling:**
- Clear cache and try again
- Try in different browser
- Check Razorpay dashboard logs

---

## 📞 Customer Communication Template

**For international card users:**
> "We've added international card support! If you still see an error, please try:
> 1. Refresh the page
> 2. Check with your bank they allow Indian payments
> 3. Try UPI or Indian payment methods"

---

**Full Details:** See [RAZORPAY_INTERNATIONAL_CARD_FIX.md](./RAZORPAY_INTERNATIONAL_CARD_FIX.md)
