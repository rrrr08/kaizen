# Store Feature Quick Reference

## 🎯 New Routes Available

| Route | Purpose | Status |
|-------|---------|--------|
| `/cart` | View full shopping cart | ✅ Ready |
| `/checkout` | Complete purchase | ✅ Ready |
| `/order-confirmation/:id` | View order details | ✅ Ready |
| `/wallet` | View points & rewards | ✅ Ready |
| `/admin/orders` | Manage customer orders | ✅ Ready |

## 🔌 Import Cart Context in Any Component

```typescript
import { useCart } from '@/app/context/CartContext';
```

### Available Methods
```typescript
const {
  items,              // Array of cart items
  addToCart,          // (product, quantity) => void
  removeFromCart,     // (productId) => void
  updateQuantity,     // (productId, quantity) => void
  clearCart,          // () => void
  getTotalPrice,      // () => number
  getTotalItems       // () => number
} = useCart();
```

## 📧 Toast Notifications

```typescript
import { useToast } from '@/hooks/use-toast';

const { addToast } = useToast();

// Success toast
addToast({
  title: 'Success',
  description: 'Item added to cart',
  variant: 'success'
});

// Error toast
addToast({
  title: 'Error',
  description: 'Something went wrong',
  variant: 'destructive'
});

// Default toast
addToast({
  title: 'Info',
  description: 'Just a message'
});
```

## 💾 LocalStorage Keys

```javascript
// Get cart
JSON.parse(localStorage.getItem('jj_cart'))

// Get orders
JSON.parse(localStorage.getItem('jj_orders'))

// Get wallet
JSON.parse(localStorage.getItem('jj_wallet'))

// Clear all
localStorage.removeItem('jj_cart');
localStorage.removeItem('jj_orders');
localStorage.removeItem('jj_wallet');
```

## 🎨 Key Components

### Cart Sidebar
- Location: `/components/ui/CartSidebar2.tsx`
- Imported in: `/components/ui/JoyNavbar.tsx`
- Shows: Cart button + slide-out panel

### Cart Context
- Location: `/app/context/CartContext.tsx`
- Wrapped in: `/app/layout.tsx`
- Provides: useCart hook to all components

### Checkout Form
- Location: `/app/checkout/page.tsx`
- Features: Validation, order creation, points calc

### Wallet
- Location: `/app/wallet/page.tsx`
- Features: Points balance, history, rewards

## 📊 Points Math

```typescript
// Points earned calculation
points = Math.floor(totalPrice * 0.1)

// Examples:
// ₹100 purchase = 10 points
// ₹999 purchase = 99 points
// ₹1000 purchase = 100 points
```

## 🎁 Reward Tiers

```typescript
100 points  → ₹100 Discount
250 points  → ₹300 Discount  
500 points  → Free Game + ₹500 Discount
```

## 📝 Product Structure

Products in `/lib/constants.ts` should have:

```typescript
{
  id: string;
  name: string;
  price: number;
  description: string;
  story: string;
  howToPlay: string;
  players: string;
  occasion: string[];
  mood: string;
  image: string;
  badges: string[];
  stock?: number;
}
```

## 🔧 Common Customizations

### Change Points Percentage
**File**: `/app/checkout/page.tsx` (line ~11)
```typescript
// Change from 10% to 15%
const points = Math.floor(getTotalPrice() * 0.15);
```

### Change Cart Button Position
**File**: `/components/ui/CartSidebar2.tsx` (line ~8)
```typescript
// Change position (bottom-8 right-8 to your preference)
className="fixed bottom-8 left-8 z-40 p-4 ..."
```

### Change Primary Color
**File**: All components using Tailwind
```typescript
// Change bg-amber-500 to your color
// Change hover:bg-amber-400 to your color
// Change text-amber-500 to your color
```

### Modify Rewards
**File**: `/app/wallet/page.tsx` (line ~75)
```typescript
{[
  { points: 100, reward: '₹100 Discount' },
  // Add or modify tiers here
]}
```

## 🚀 Production Checklist

- [ ] Switch from localStorage to database
- [ ] Add Firebase/Firestore integration
- [ ] Implement user authentication
- [ ] Add payment gateway (Razorpay/Stripe)
- [ ] Set up email notifications
- [ ] Add order tracking
- [ ] Implement inventory management
- [ ] Add order management admin panel
- [ ] Set up analytics
- [ ] Test on production server
- [ ] Enable HTTPS
- [ ] Add security headers
- [ ] Implement rate limiting
- [ ] Set up monitoring/logging

## 📱 Mobile Responsive

All store pages are fully responsive:
- ✅ Mobile (< 640px)
- ✅ Tablet (640px - 1024px)  
- ✅ Desktop (> 1024px)

## ⚡ Performance

- Cart uses React Context (optimized)
- LocalStorage for fast access
- CSS animations (GPU accelerated)
- Lazy image loading on products
- No unnecessary re-renders

## 🐛 Debugging Tips

```javascript
// Check cart in console
window.__CART__ = JSON.parse(localStorage.getItem('jj_cart'));

// Check orders
window.__ORDERS__ = JSON.parse(localStorage.getItem('jj_orders'));

// Check wallet
window.__WALLET__ = JSON.parse(localStorage.getItem('jj_wallet'));

// Clear and reset
localStorage.clear();
location.reload();
```

## 📚 Documentation Files

1. **STORE_FEATURE_DOCUMENTATION.md** - Complete technical details
2. **STORE_INTEGRATION_GUIDE.md** - How to use and customize
3. **STORE_FEATURE_SUMMARY.md** - What was implemented
4. **This file** - Quick reference

## ✨ Key Features Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Shopping Cart | ✅ | Persistent, real-time |
| Add to Cart | ✅ | With quantity selector |
| Checkout | ✅ | Form validation included |
| Order Processing | ✅ | Creates order objects |
| Order Confirmation | ✅ | Shows full details |
| Points System | ✅ | 10% of purchase |
| Wallet | ✅ | View & manage points |
| Rewards | ✅ | 3 tier system |
| Admin Orders | ✅ | View & manage |
| Responsive | ✅ | Mobile/tablet/desktop |
| Toast Notifications | ✅ | User feedback |

## 🎯 Next Meeting Topics

- Database integration strategy
- Payment gateway selection
- User authentication setup
- Email notification system
- Analytics implementation
- Mobile app considerations
