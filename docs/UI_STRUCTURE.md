# Joy Juncture - Complete User Interface Map

## 🗺️ **ENTIRE USER INTERFACE STRUCTURE**

**Total**: 73+ Pages | 168+ UI Elements

---

## 📱 **ALL PAGES**

### **PUBLIC** (4 pages)
1. `/` - Homepage
2. `/about` - About Us
3. `/contact` - Contact Form
4. `/terms` - Terms of Service

### **E-COMMERCE** (5 pages)
5. `/shop` - Product Catalog
6. `/shop/[id]` - Product Details
7. `/cart` - Shopping Cart
8. `/checkout` - Checkout & Payment
9. `/order-confirmation/[id]` - Order Success

### **GAMING** (17 pages)
10. `/games` - Games Hub
11-24. `/games/[name]` - 14 Individual Games
25. `/spin` - Daily Spin Wheel
26. `/leaderboard` - Rankings

### **EVENTS** (6 pages)
27. `/events` - Events Hub
28. `/events/upcoming` - Upcoming Events
29. `/events/upcoming/[id]` - Event Details
30. `/events/past` - Past Events
31. `/events/past/[id]` - Past Event Details
32. `/events/registration-success/[id]` - Registration Success

### **EXPERIENCES** (3 pages)
33. `/experiences` - All Experiences
34. `/experiences/[slug]` - Experience Details
35. `/experiences/[slug]/enquire` - Booking Form

### **AUTH** (5 pages)
36. `/auth/login` - Login
37. `/auth/signup` - Sign Up
38. `/auth/reset-password` - Reset Password
39. `/auth/verify` - Email Verification
40. `/auth/action` - Auth Actions Handler

### **USER PROFILE** (8 pages - Login Required)
41. `/profile` - User Profile
42. `/wallet` - JP Wallet
43. `/orders` - Order History
44. `/wishlist` - Saved Products
45. `/notification-preferences` - **PHONE NUMBER HERE** ← 📱
46. `/rewards` - Rewards Catalog
47. `/achievements` - Badges & Achievements
48. `/settings` - Account Settings

### **COMMUNITY** (2 pages)
49. `/community` - Discussion Forum
50. `/community/[threadId]` - Thread Details

### **BLOG** (2 pages)
51. `/blog` - Blog Posts
52. `/blog/[slug]` - Post Details

### **OTHER** (1 page)
53. `/proofofjoy` - Testimonials

### **ADMIN** (20 pages - Admin Only)
54. `/admin` - Dashboard
55. `/admin/products` - Products Management
56. `/admin/orders` - Orders Management
57. `/admin/events` - Events Management
58. `/admin/events/[id]/registrations` - Event Registrations
59. `/admin/experiences` - Experiences Management
60. `/admin/experiences/enquiries` - Enquiries
61. `/admin/users` - Users Management
62. `/admin/game-settings` - XP/JP Config
63. `/admin/notifications` - Send Notifications
64. `/admin/push-notifications` - Push Notifications
65. `/admin/emails` - Email Management
66. `/admin/vouchers` - Vouchers
67. `/admin/shipments` - Shipment Tracking
68. `/admin/inquiries` - Contact Inquiries
69. `/admin/media` - Media Library
70. `/admin/moderation` - Content Moderation
71. `/admin/blog` - Blog Management
72. `/admin/settings` - Site Settings
73. `/admin/wallet-transactions` - JP Transactions

---

## 🧩 **ALL COMPONENTS**

### **UI Components** (55+)
- Hero, Navbar, Footer
- ProductCard, GameCard, EventCard
- Button, Input, Modal, Toast
- InvoiceModal, Spinner, Badge, Avatar
- Card, Tabs, Switch, Select, Textarea
- Checkbox, Radio, Slider, Progress
- Skeleton, Alert, Dialog, Dropdown
- Popover, Tooltip, Separator, Accordion
- Calendar, Table, Pagination, Breadcrumb
- ScrollArea, Sheet, Drawer, Command
- ContextMenu, HoverCard, Label, Menubar
- NavigationMenu, AspectRatio, Collapsible
- Toggle, ToggleGroup, Sonner, Toaster
- Carousel, Chart, Sidebar

### **Feature Components** (40+)
- **PhoneVerification.tsx** ← Phone OTP UI
- EventRegistrationForm
- ExperiencePaymentForm
- ClientLayout, ErrorBoundary
- 14 Game Components (Chess, Sudoku, etc.)
- 4 Gamification Components (XPBar, TierBadge, etc.)
- 7 Home Components (FeaturedProducts, etc.)
- 4 Auth Components (LoginForm, etc.)
- 6 Admin Components (AdminSidebar, etc.)
- 3 Community Components (ThreadCard, etc.)
- 1 Analytics Component
- 3 Settings Components

---

## 📍 **PHONE NUMBER UI LOCATION**

**Page**: `/notification-preferences`  
**File**: `app/notification-preferences/page.tsx`  
**Component**: `components/PhoneVerification.tsx`

**What User Sees**:
```
Notification Preferences Page
  ↓
Toggle SMS Notifications ON
  ↓
Phone Verification Section Appears
  ↓
Enter Phone Number
  ↓
Send OTP
  ↓
Enter 6-Digit Code
  ↓
Verified! ✅
```

---

## 🗺️ **SITE NAVIGATION**

```
┌─ Homepage (/)
│
├─ Shop
│  ├─ All Products
│  ├─ Product Details
│  ├─ Cart
│  ├─ Checkout
│  └─ Order Confirmation
│
├─ Games
│  ├─ Games Hub
│  ├─ 14 Games
│  ├─ Daily Spin
│  └─ Leaderboard
│
├─ Events
│  ├─ Upcoming
│  ├─ Past
│  └─ Registration
│
├─ Experiences
│  ├─ Browse
│  └─ Book
│
├─ Profile (Login Required)
│  ├─ Profile
│  ├─ Wallet
│  ├─ Orders
│  ├─ Wishlist
│  ├─ Notifications ← PHONE HERE
│  ├─ Rewards
│  ├─ Achievements
│  └─ Settings
│
├─ Community
│  └─ Discussions
│
├─ Blog
│  └─ Posts
│
└─ Admin (Admin Only)
   └─ 20 Management Pages
```

---

**Complete UI documented in `docs/UI_STRUCTURE.md`!** 🗺️
