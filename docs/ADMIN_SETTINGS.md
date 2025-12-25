# 🎛️ Admin Customization System

Your platform is now fully customizable from the admin panel! All settings can be modified in real-time without code changes.

## 📋 Admin Settings Page
**URL:** `/admin/settings`

### What's Customizable:

#### 1. **Gamification Settings**
- ✅ Points Per Rupee Spent (e.g., 1 point per ₹X)
- ✅ First Time Bonus Points (welcome bonus)
- ✅ First Time Purchase Threshold (min purchase for bonus)
- ✅ Redeem Rate (how much ₹ = 1 point)
- ✅ Max Redeem Percentage (max % of order payable with points)
- ✅ Referral Bonus Points
- ✅ Birthday Bonus Points

#### 2. **Payment & Shipping Settings**
- ✅ GST Rate (%) - automatically applied to all checkouts
- ✅ Standard Shipping Cost (₹)
- ✅ Free Shipping Threshold (min order for free shipping)

#### 3. **General Settings**
- ✅ Store Name
- ✅ Store Email
- ✅ Store Phone
- ✅ Currency

## 🔧 How to Use:

1. **Log in as Admin**
   - Go to `/admin/settings`
   
2. **Modify Any Setting**
   - Change values in the form
   - Real-time preview of changes
   
3. **Save Settings**
   - Click "SAVE ALL SETTINGS"
   - Settings are stored in Firestore

4. **Reset to Defaults**
   - Click "RESET TO DEFAULT" to restore default values

## 📡 Settings Storage

All settings are saved in Firestore under:
```
admin_settings/configuration
```

### Example Settings Document:
```json
{
  "pointsPerRupee": 1,
  "firstTimeBonusPoints": 100,
  "firstTimeThreshold": 500,
  "redeemRate": 0.5,
  "maxRedeemPercent": 50,
  "referralBonus": 50,
  "birthdayBonus": 100,
  "gstRate": 18,
  "shippingCost": 50,
  "freeShippingThreshold": 500,
  "storeName": "Joy Juncture",
  "storeEmail": "support@joyjuncture.com",
  "storePhone": "+91-XXXXXXXXXX",
  "currency": "INR",
  "updatedAt": "2025-12-22T10:30:00Z",
  "updatedBy": "admin_user_id"
}
```

## 🔐 Security

- Only **admin users** can access `/admin/settings`
- All changes require **Firebase ID token authentication**
- Changes are logged with timestamp and admin user ID

## 🚀 Real-Time Updates

Changes take effect immediately:
- **Checkout Page** - Reads GST rate dynamically
- **Gamification** - Uses latest point multipliers
- **All Features** - Auto-fetch latest settings on page load

## 📝 Next Steps

To add more customizable items:

1. **Add field to admin/settings/page.tsx** (UI)
2. **Update API endpoints** to validate & save
3. **Use in your features** - fetch settings and apply

Example:
```typescript
// Fetch settings
const response = await fetch('/api/admin/settings/get', {
  headers: { Authorization: `Bearer ${idToken}` }
});
const settings = await response.json();

// Use in your code
const gstRate = settings.gstRate; // 18
```

## 🎯 Admin Menu

Access other admin features from the sidebar:
- ⚙️ **Settings** - All configurations
- 👥 **Users** - Manage users & roles
- 📊 **Analytics** - View statistics
- ⚡ **Gamification** - Bonus rules & levels
- 🔔 **Notifications** - Push notifications
- 📦 **Orders** - View all orders

---

**Your platform is now ready for production!** 🚀
