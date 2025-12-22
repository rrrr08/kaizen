# Store Feature User Flow & Architecture

## 🔄 User Journey Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        JOY JUNCTURE STORE                        │
└─────────────────────────────────────────────────────────────────┘

                          CUSTOMER JOURNEY
                          ───────────────

    START
      │
      ├─→ [BROWSE] /shop
      │      │
      │      └─→ View Products
      │           │
      │           ├─→ [FILTER] By occasion/mood/players
      │           │
      │           └─→ [CLICK] View Product Details
      │                │
      │                ├─→ [READ] Story, How to Play
      │                │
      │                ├─→ [SELECT] Quantity 
      │                │
      │                └─→ [ADD TO CART] /product
      │
      ├─→ [REPEAT] Browse more products
      │
      ├─→ [CART] Click floating cart button
      │      │
      │      ├─→ View Cart Items
      │      │
      │      ├─→ [MANAGE] Quantities/Remove items
      │      │
      │      └─→ [PROCEED] To Checkout
      │
      ├─→ [FULL CART] Visit /cart (optional)
      │      │
      │      └─→ [DETAILED VIEW] With prices & points
      │
      ├─→ [CHECKOUT] /checkout
      │      │
      │      ├─→ [FILL] Shipping Form
      │      │    ├─ Name
      │      │    ├─ Email
      │      │    ├─ Phone
      │      │    ├─ Address
      │      │    ├─ City/State/ZIP
      │      │    └─ Payment Method
      │      │
      │      ├─→ [REVIEW] Order Summary
      │      │    ├─ Items & prices
      │      │    ├─ Shipping (FREE)
      │      │    ├─ Total Price
      │      │    └─ Points to Earn (10%)
      │      │
      │      └─→ [PLACE ORDER]
      │
      ├─→ [ORDER CONFIRMATION] /order-confirmation/:id
      │      │
      │      ├─→ [SUCCESS] Message & Order ID
      │      │
      │      ├─→ [DETAILS] 
      │      │    ├─ Order ID
      │      │    ├─ Items ordered
      │      │    ├─ Total amount
      │      │    ├─ Points earned
      │      │    └─ Shipping address
      │      │
      │      └─→ [OPTIONS]
      │           ├─ View Wallet [→ /wallet]
      │           └─ Continue Shopping [→ /shop]
      │
      └─→ [WALLET] /wallet
             │
             ├─→ [VIEW] Points Balance
             │
             ├─→ [HISTORY] Transaction log
             │    └─ Shows all purchases & points earned
             │
             └─→ [REWARDS] Redeem points
                  ├─ 100 pts = ₹100 Discount
                  ├─ 250 pts = ₹300 Discount
                  └─ 500 pts = Free Game + ₹500 Discount

                          ADMIN JOURNEY
                          ─────────────

    ADMIN → [ORDERS] /admin/orders
               │
               ├─→ [LIST] All customer orders
               │    ├─ Order ID
               │    ├─ Customer name
               │    ├─ Order date
               │    └─ Order total
               │
               ├─→ [CLICK] Select an order
               │
               └─→ [DETAILS] Order information panel
                    ├─ Full customer info
                    ├─ Items ordered
                    ├─ Prices breakdown
                    ├─ Points awarded
                    └─ Admin actions

```

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     FRONTEND (React/Next.js)                  │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────────┐      ┌──────────────────┐               │
│  │  Pages          │      │  Components      │               │
│  ├─────────────────┤      ├──────────────────┤               │
│  │ /shop           │      │ CartSidebar      │               │
│  │ /shop/[id]      │      │ Navbar           │               │
│  │ /cart           │      │ CartIcon         │               │
│  │ /checkout       │      │ ProductCard      │               │
│  │ /order-confirm  │      │ CheckoutForm     │               │
│  │ /wallet         │      │ WalletDisplay    │               │
│  │ /admin/orders   │      │ OrderList        │               │
│  └─────────────────┘      └──────────────────┘               │
│         │                         │                          │
│         └────────────┬────────────┘                          │
│                      │                                       │
│         ┌────────────▼────────────┐                          │
│         │  CartContext (Redux-like)│                         │
│         ├────────────────────────┤                          │
│         │ • items                │                          │
│         │ • addToCart()          │                          │
│         │ • removeFromCart()     │                          │
│         │ • updateQuantity()     │                          │
│         │ • getTotalPrice()      │                          │
│         │ • getTotalItems()      │                          │
│         └────────────┬────────────┘                          │
│                      │                                       │
│         ┌────────────▼────────────┐                          │
│         │   useToast Hook         │                          │
│         ├────────────────────────┤                          │
│         │ • addToast()           │                          │
│         │ • Toast notifications  │                          │
│         └────────────────────────┘                          │
│                                                                │
└──────────────────────────────────────────────────────────────┘
                           │
                           │ API/Storage
                           │
┌──────────────────────────▼──────────────────────────────────┐
│               STORAGE LAYER (localStorage)                  │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  jj_cart     │  │  jj_orders   │  │ jj_wallet    │      │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤      │
│  │ items[]      │  │ orders[]     │  │ points: num  │      │
│  │  • product   │  │  • id        │  │              │      │
│  │  • quantity  │  │  • items     │  │ Tracks:      │      │
│  │  • addedAt   │  │  • total     │  │ • Total      │      │
│  │              │  │  • address   │  │ • History    │      │
│  └──────────────┘  │  • created   │  └──────────────┘      │
│                    │  • points    │                         │
│                    └──────────────┘                         │
│                                                               │
└──────────────────────────────────────────────────────────────┘
                           │
        (FUTURE) ───────────┼───────────┬──────────────────────┐
                            │           │                      │
                     ┌──────▼──────┐   │              ┌────────▼────────┐
                     │  Firestore  │   │              │  Payment        │
                     │  Database   │   │              │  Gateway        │
                     └─────────────┘   │              │  (Razorpay)     │
                                       │              └─────────────────┘
                              ┌────────▼────────┐
                              │ Email Service   │
                              │ (SendGrid, etc) │
                              └─────────────────┘
```

## 📊 Data Models

```
┌─────────────────────────────────────────────────────────┐
│                      CartItem                           │
├─────────────────────────────────────────────────────────┤
│ productId: string                                       │
│ product: Product                                        │
│ quantity: number                                        │
│ addedAt: Date                                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                       Order                             │
├─────────────────────────────────────────────────────────┤
│ id: string                  (ORD-{timestamp})          │
│ userId: string              (future)                    │
│ items: CartItem[]                                       │
│ totalPrice: number                                      │
│ totalPoints: number         (10% of totalPrice)        │
│ status: 'pending'|'completed'|'cancelled'             │
│ paymentId: string           (future)                    │
│ createdAt: Date                                         │
│ updatedAt: Date                                         │
│ shippingAddress: {                                      │
│   name: string                                          │
│   email: string                                         │
│   phone: string                                         │
│   address: string                                       │
│   city: string                                          │
│   state: string                                         │
│   zipCode: string                                       │
│ }                                                       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                      Wallet                             │
├─────────────────────────────────────────────────────────┤
│ userId: string              (future)                    │
│ totalPoints: number                                     │
│ history: WalletTransaction[]                            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│               WalletTransaction                         │
├─────────────────────────────────────────────────────────┤
│ id: string                                              │
│ type: 'earn' | 'redeem'                                │
│ points: number                                          │
│ reason: string              ('purchase'|'event'|etc)   │
│ orderId: string             (if purchase)              │
│ eventId: string             (if event)                 │
│ createdAt: Date                                         │
└─────────────────────────────────────────────────────────┘
```

## 🔌 Component Dependencies

```
CartProvider (Layout)
    │
    ├─→ Navbar
    │      │
    │      └─→ CartSidebar
    │             │
    │             ├─→ CartIcon + Badge
    │             ├─→ CartList
    │             └─→ CartSummary
    │
    ├─→ Shop Pages
    │      │
    │      ├─→ ProductList
    │      │      │
    │      │      └─→ ProductCard
    │      │             │
    │      │             ├─→ useCart (addToCart)
    │      │             └─→ useToast
    │      │
    │      └─→ ProductDetail
    │             │
    │             ├─→ QuantitySelector
    │             ├─→ AddToCartButton
    │             ├─→ useCart
    │             └─→ useToast
    │
    ├─→ Cart Page
    │      │
    │      ├─→ CartList
    │      ├─→ CartSummary
    │      └─→ useCart
    │
    ├─→ Checkout Page
    │      │
    │      ├─→ ShippingForm
    │      ├─→ PaymentMethod
    │      ├─→ OrderSummary
    │      ├─→ useCart
    │      └─→ useToast
    │
    ├─→ Order Confirmation
    │      │
    │      ├─→ OrderHeader
    │      ├─→ OrderDetails
    │      ├─→ ItemsList
    │      └─→ ShippingInfo
    │
    └─→ Wallet Page
           │
           ├─→ PointsBalance
           ├─→ RewardsTiers
           └─→ TransactionHistory
```

## 🔄 State Flow

```
GLOBAL STATE (CartContext)
    │
    ├─ items: CartItem[]
    │    └─ Updated by: addToCart, removeFromCart, updateQuantity
    │    └─ Used in: All cart views, checkout, confirmation
    │    └─ Persisted in: localStorage 'jj_cart'
    │
    └─ Derived values:
       ├─ getTotalPrice() → Used in: Checkout, Wallet, Summary
       ├─ getTotalItems() → Used in: Cart badge
       └─ points = (totalPrice * 0.1) → Used in: Checkout, Confirmation

LOCAL STATE (Per Page)
    │
    ├─ /checkout:
    │    └─ formData (shipping info)
    │    └─ isProcessing (loading state)
    │
    ├─ /admin/orders:
    │    └─ orders (from localStorage)
    │    └─ selectedOrder
    │
    └─ /wallet:
         └─ wallet (points data)
         └─ transactions (order history)
```

## 🔐 Data Flow During Purchase

```
1. USER ADDS TO CART
   Product Detail Page
       │
       ├─→ Click "Add to Cart"
       │
       └─→ addToCart(product, quantity)
              │
              └─→ CartContext updates state
                     │
                     └─→ localStorage saved automatically

2. USER PROCEEDS TO CHECKOUT
   Cart Page → Checkout Page
       │
       └─→ Cart data loaded from CartContext
              │
              └─→ Displayed in Order Summary

3. USER SUBMITS CHECKOUT FORM
   Checkout Page
       │
       ├─→ Form validation
       │
       ├─→ Create Order object
       │    ├─ id = "ORD-{timestamp}"
       │    ├─ items = CartContext.items
       │    ├─ totalPrice = CartContext.getTotalPrice()
       │    ├─ totalPoints = floor(totalPrice * 0.1)
       │    ├─ shippingAddress = formData
       │    └─ createdAt = now()
       │
       ├─→ Save to localStorage
       │    ├─ Push to jj_orders array
       │    └─ Update jj_wallet with points
       │
       ├─→ Clear cart (clearCart())
       │
       └─→ Redirect to /order-confirmation/:id

4. ORDER CONFIRMATION
   Confirmation Page
       │
       └─→ Load order from localStorage
              │
              └─→ Display all details
```

## 📱 Responsive Breakpoints

```
Mobile        0px - 640px (sm)
              └─→ Single column, stacked layout

Tablet        640px - 1024px (md/lg)
              └─→ 2 columns, side panels

Desktop       1024px+ (lg/xl)
              └─→ 3 columns, full layouts, sidebars

Specific Adjustments:
├─ Cart sidebar: Full width mobile, slide-out desktop
├─ Checkout form: Single column mobile, 2 column desktop
├─ Admin orders: List mobile, details panel desktop
└─ Wallet: Stack mobile, grid desktop
```

This completes the store feature implementation with all required functionality!
