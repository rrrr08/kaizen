# Store Feature Integration Guide

## Quick Start

The store feature is fully integrated into the Joy Juncture website. Here's what's available out of the box:

### For Users:
1. **Browse Games**: Visit `/shop` to see all available games
2. **View Details**: Click on any game to see full details
3. **Add to Cart**: Click "Add to Cart" button with quantity selector
4. **View Cart**: Click the floating cart button or visit `/cart`
5. **Checkout**: Go to `/checkout` to place an order
6. **View Wallet**: Visit `/wallet` to see your points and rewards

### For Admins:
1. **Manage Orders**: Visit `/admin/orders` to see all customer orders
2. **View Details**: Click on any order to see full details

## What's Included

### Cart Management
- Floating cart button (bottom-right corner)
- Slide-out cart sidebar with item preview
- Full cart page with detailed view
- Persistent cart (saved in browser)

### Checkout Process
1. Shipping information form
2. Payment method selection
3. Order summary
4. Points earned preview
5. Order processing and confirmation

### Gamification
- Points earned on purchases (10% of total)
- Wallet to view and manage points
- Redeemable rewards at different point tiers
- Transaction history

### Admin Features
- View all customer orders
- See order details
- Track customer information
- Monitor points distribution

## Navigation Links

Add these links to your navigation or marketing pages:

```html
<!-- Shopping Links -->
<a href="/shop">Browse Games</a>
<a href="/cart">View Cart</a>
<a href="/checkout">Proceed to Checkout</a>

<!-- User Account Links -->
<a href="/wallet">My Wallet & Points</a>

<!-- Admin Links -->
<a href="/admin/orders">Manage Orders</a>
```

## How to Use in Components

### Access Cart in Any Component
```typescript
import { useCart } from '@/app/context/CartContext';

export default function MyComponent() {
  const { items, getTotalPrice, addToCart, removeFromCart } = useCart();
  
  return (
    <div>
      <p>Cart Items: {items.length}</p>
      <p>Total: ₹{getTotalPrice()}</p>
    </div>
  );
}
```

### Add Product to Cart
```typescript
import { useCart } from '@/app/context/CartContext';
import { PRODUCTS } from '@/lib/constants';

export default function GameCard() {
  const { addToCart } = useCart();
  
  const handleAdd = () => {
    const game = PRODUCTS[0];
    addToCart(game, 1);
  };
  
  return <button onClick={handleAdd}>Add to Cart</button>;
}
```

### Show Toast Notifications
```typescript
import { useToast } from '@/hooks/use-toast';

export default function MyComponent() {
  const { addToast } = useToast();
  
  const handleSuccess = () => {
    addToast({
      title: 'Success!',
      description: 'Operation completed',
      variant: 'success'
    });
  };
  
  return <button onClick={handleSuccess}>Click Me</button>;
}
```

## Key Files Reference

| File | Purpose |
|------|---------|
| `/app/context/CartContext.tsx` | Cart state management |
| `/components/ui/CartSidebar2.tsx` | Cart sidebar UI |
| `/app/shop/[id]/page.tsx` | Product detail with cart |
| `/app/cart/page.tsx` | Shopping cart page |
| `/app/checkout/page.tsx` | Checkout form |
| `/app/order-confirmation/[id]/page.tsx` | Order confirmation |
| `/app/wallet/page.tsx` | Points wallet |
| `/app/admin/orders/page.tsx` | Admin orders |
| `/lib/types.ts` | Type definitions |

## Data Storage (Development)

The store uses localStorage for now. View stored data in browser DevTools:

```javascript
// View cart
console.log(JSON.parse(localStorage.getItem('jj_cart')));

// View orders
console.log(JSON.parse(localStorage.getItem('jj_orders')));

// View wallet
console.log(JSON.parse(localStorage.getItem('jj_wallet')));

// Clear all store data
localStorage.removeItem('jj_cart');
localStorage.removeItem('jj_orders');
localStorage.removeItem('jj_wallet');
```

## Customization

### Change Points Earning Rate
In `/app/checkout/page.tsx`:
```typescript
// Change this line (currently 10% of purchase)
const points = Math.floor(getTotalPrice() * 0.1);

// To this (for example, 15% of purchase):
const points = Math.floor(getTotalPrice() * 0.15);
```

### Modify Reward Tiers
In `/app/wallet/page.tsx`, update the rewards array:
```typescript
{[
  { points: 100, reward: '₹100 Discount' },
  { points: 250, reward: '₹300 Discount' },
  { points: 500, reward: 'Free Game + ₹500 Discount' },
]}
```

### Change Cart Button Position
In `/components/ui/CartSidebar2.tsx`:
```typescript
// Change: fixed bottom-8 right-8
// To: fixed bottom-8 left-8 (or any other position)
className="fixed bottom-8 right-8 z-40 p-4 ..."
```

### Customize Cart Colors
The cart uses Tailwind classes:
- Primary: `bg-amber-500` (change to your brand color)
- Secondary: `bg-white/5` (change opacity/color as needed)
- Hover: `hover:bg-amber-400` (adjust hover color)

## Integration with Products

The store automatically uses products from `/lib/constants.ts`:

```typescript
import { PRODUCTS } from '@/lib/constants';

// Products should have this structure:
{
  id: '1',
  name: 'Game Name',
  price: 899,
  description: '...',
  story: '...',
  howToPlay: '...',
  players: '2-6 Players',
  occasion: ['Party', 'Family'],
  mood: 'Competitive',
  image: 'url',
  badges: ['Best Seller']
}
```

## Testing the Store

### 1. Test Add to Cart
- Go to `/shop`
- Click on a game
- Use quantity selector
- Click "Add to Cart"
- See cart button update

### 2. Test Cart Sidebar
- Click floating cart button
- See items listed
- Adjust quantities
- Click "Proceed to Checkout"

### 3. Test Checkout
- Fill shipping form
- Select payment method
- Verify total and points
- Click "Place Order"

### 4. Test Order Confirmation
- Check order details display
- Verify points earned
- Click "View Wallet"

### 5. Test Wallet
- Check points balance
- See transaction history
- Review reward tiers
- See how to earn points

### 6. Test Admin Orders
- Go to `/admin/orders`
- Click on an order
- Verify details display
- Check buttons appear

## Troubleshooting

### Cart Not Persisting
- Check browser localStorage is enabled
- Clear localStorage and refresh: `localStorage.clear()`
- Check browser console for errors

### Checkout Not Processing
- Ensure all form fields are filled
- Check browser console for validation errors
- Verify order object structure

### Points Not Showing
- Complete an order first
- Check wallet page
- Verify localStorage has `jj_wallet` key

### Admin Orders Not Showing
- Ensure at least one order has been placed
- Check browser console
- Verify localStorage has `jj_orders` key

## Performance Tips

1. **Optimize Product Images**: Use smaller image sizes
2. **Lazy Load Images**: Implement image lazy loading
3. **Cache Cart**: Cart is already cached in localStorage
4. **Pagination**: Add pagination to orders list for many orders
5. **Debounce Searches**: If adding search to orders

## Next Steps

1. **Database Integration**: Move localStorage to Firebase/database
2. **Authentication**: Link cart and orders to user accounts
3. **Payment Gateway**: Integrate Razorpay or Stripe
4. **Email Service**: Add order confirmation emails
5. **Analytics**: Track store metrics and user behavior
6. **More Features**: Add wishlist, reviews, recommendations

## Support Resources

- Check component comments for implementation details
- Review `/lib/types.ts` for data structure
- Look at existing pages for patterns to follow
- Check error messages in browser console
- Use React DevTools to inspect component state

## FAQ

**Q: How do I add a new product?**
A: Add to `PRODUCTS` array in `/lib/constants.ts`

**Q: How do I change the discount percentage?**
A: Find the points calculation in checkout and update the multiplier

**Q: Can I have guest checkout?**
A: Yes, checkout doesn't require authentication currently

**Q: Where are orders stored?**
A: In browser localStorage (need database for production)

**Q: How do I connect to a payment gateway?**
A: Follow Razorpay/Stripe integration guides in checkout page

**Q: Can users track orders?**
A: Add order tracking page by querying the orders localStorage

**Q: How do I send order confirmation emails?**
A: Use email service API (SendGrid, Mailgun) in checkout handler
