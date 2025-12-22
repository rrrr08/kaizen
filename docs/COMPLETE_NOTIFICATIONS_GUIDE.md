# 🔔 Complete Notifications System Guide

## Quick Answers to Your Questions

### Q1: Why is there no page for "order done"?
**A:** There IS! `/app/order-confirmation/[id]/page.tsx`
- After successful payment, user is redirected to this page
- Shows order details, items, price breakdown, points earned
- Has buttons to view wallet, continue shopping, or view all orders

---

### Q2: How are notifications sent?
**A:** Two ways currently:

#### Method 1: Manual (Admin)
- Admin navigates to `/admin/notifications/send` (NOT YET IMPLEMENTED)
- Admin fills form with message, type, target users
- Admin clicks Send
- Notification stored in Firestore
- User sees bell icon update next time they load page

#### Method 2: Automatic (Not implemented yet)
- Order created → trigger automatic "Order Confirmed" notification
- Points earned → trigger "Points Earned" notification
- But currently no automatic event triggers exist

**Current Implementation Status:**
- ✅ Notifications can be stored in Firestore manually
- ✅ Users can see them in the bell icon
- ❌ No admin UI to send notifications
- ❌ No automatic event triggers

---

### Q3: Does admin have the right to send notifications?
**A:** YES, but needs admin role:

**Security Check (in code):**
```typescript
// Every notification endpoint verifies:
const userRef = doc(db, 'users', userId);
const userSnap = await getDoc(userRef);

if (userSnap.data()?.role !== 'admin') {
  return { status: 403, error: 'Admin access required' };
}
```

**How to make admin:**
1. Go to Firestore Console
2. Open `users` collection
3. Find user document
4. Add/edit field: `role: "admin"`
5. Now that user can access /admin/* pages

---

### Q4: How are notifications received by the user?
**A:** Through the bell icon in navbar:

**Step-by-Step:**
```
1. Notification created in Firestore
   └─ Collection: /notifications/{notificationId}
   └─ Contains: userId, title, message, type, actionUrl, etc.

2. User opens app (or refreshes page)
   └─ JoyNavbar.tsx mounts

3. NotificationCenter.tsx runs useEffect
   └─ Checks if user is authenticated
   └─ If yes: calls GET /api/notifications/in-app

4. API endpoint fetches user's notifications from Firestore
   └─ Queries: where userId == currentUserId
   └─ Returns array of unread notifications

5. Bell icon updates
   └─ Shows number of unread notifications
   └─ User sees red badge on bell

6. User clicks bell icon
   └─ Dropdown appears showing notification list
   └─ Each shows: title, message, timestamp, type color

7. User clicks notification
   └─ Marked as read in Firestore
   └─ If actionUrl present: navigates to that URL
   └─ Example: click "Order Confirmed" → goes to /orders
```

---

## Complete Notification Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│              NOTIFICATION LIFECYCLE                          │
└─────────────────────────────────────────────────────────────┘

CREATION PHASE (Server-side)
┌──────────────┐
│ Admin sends  │  OR  │ Auto-trigger │
│ notification │      │ on event     │
└──────┬───────┘      └────┬─────────┘
       │                   │
       └───────┬───────────┘
               │
               ▼
    ┌─────────────────────┐
    │ Create notification │
    │ in Firestore        │
    │ /notifications/{id} │
    │ {                   │
    │   userId: "u123"    │
    │   title: "msg"      │
    │   message: "..."    │
    │   type: "success"   │
    │   read: false       │
    │   actionUrl: "/..." │
    │   createdAt: ts     │
    │ }                   │
    └─────────┬───────────┘
              │

DISCOVERY PHASE (Client-side)
              │
              ▼
    ┌──────────────────────┐
    │ User opens app/      │
    │ refreshes page       │
    └─────────┬────────────┘
              │
              ▼
    ┌──────────────────────────┐
    │ JoyNavbar.tsx mounts     │
    │ NotificationCenter loads │
    └─────────┬────────────────┘
              │
              ▼
    ┌──────────────────────────────┐
    │ Check auth.currentUser       │
    │ If authenticated: fetch      │
    └─────────┬────────────────────┘
              │
              ▼
    ┌──────────────────────────────────┐
    │ GET /api/notifications/in-app    │
    │ Include: Authorization: Bearer..│
    └─────────┬────────────────────────┘
              │
              ▼
    ┌────────────────────────────────────┐
    │ Server verifies ID token           │
    │ Queries: where userId == currentId │
    │ Returns: [notif1, notif2, ...]     │
    └─────────┬──────────────────────────┘
              │

DISPLAY PHASE
              │
              ▼
    ┌──────────────────────────────┐
    │ Bell icon in navbar updates  │
    │ Shows unread count           │
    │ "Bell: 2 unread"             │
    └─────────┬────────────────────┘
              │
              ▼
    ┌──────────────────────────────┐
    │ User clicks bell icon        │
    │ Dropdown appears             │
    └─────────┬────────────────────┘
              │
              ▼
    ┌──────────────────────────────────────┐
    │ Show notification list:              │
    │ ├─ ✓ Order Confirmed                 │
    │ │  "Your order ORD-123 confirmed"    │
    │ │  5 min ago                         │
    │ ├─ ✓ Points Earned                   │
    │ │  "You earned 150 points"           │
    │ │  10 min ago                        │
    │ └─ ✓ Welcome Message                 │
    │    "Thanks for joining!"             │
    │    2 hours ago                       │
    └──────────┬───────────────────────────┘
               │

INTERACTION PHASE
               │
      ┌────────┴────────┐
      │                 │
      ▼                 ▼
  ┌─────────────┐  ┌──────────────┐
  │ User clicks │  │ User clicks  │
  │ notification│  │ Dismiss (X)  │
  └──────┬──────┘  └────────┬─────┘
         │                  │
         ▼                  ▼
  ┌─────────────────┐  ┌────────────────┐
  │ POST /notif/[id]│  │ POST /notif/[id]
  │ /read           │  │ /dismiss       │
  │                 │  │                │
  │ Update:         │  │ Update:        │
  │ read: true      │  │ dismissed:true │
  └────────┬────────┘  └────────┬───────┘
           │                    │
           ▼                    ▼
  ┌──────────────────┐  ┌───────────────────┐
  │ Navigate to      │  │ Notification      │
  │ actionUrl if set │  │ removed from list │
  │ Example: /orders │  │ Reloads from DB   │
  └──────────────────┘  └───────────────────┘
```

---

## Firestore Notification Structure

```
Collection: notifications

notification_001/ {
  userId: "user123",
  title: "Order Confirmed!",
  message: "Your order ORD-20251222-001 has been confirmed",
  type: "success",           // "info" | "success" | "warning" | "offer"
  read: false,               // false until user clicks
  dismissed: false,          // false until user dismisses
  actionUrl: "/orders/ORD-20251222-001",  // Optional
  createdAt: Timestamp,      // Auto-generated
  priority: "high",          // Optional: for sorting
  expiresAt: Timestamp       // Optional: auto-remove old notifications
}

notification_002/ {
  userId: "user123",
  title: "Points Earned!",
  message: "You earned 150 points on your purchase",
  type: "success",
  read: false,
  dismissed: false,
  actionUrl: "/wallet",
  createdAt: Timestamp
}

notification_003/ {
  userId: "user123",
  title: "30% OFF Sale!",
  message: "Limited time offer on selected items",
  type: "offer",
  read: false,
  dismissed: false,
  actionUrl: "/shop?sale=true",
  createdAt: Timestamp
}
```

---

## Current Notification Types

```typescript
type NotificationType = 'info' | 'success' | 'warning' | 'offer';

// Styling in NotificationCenter.tsx:
const typeColors = {
  info:    'bg-blue-500/20 text-blue-600 border-blue-500/20',
  success: 'bg-green-500/20 text-green-600 border-green-500/20',
  warning: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/20',
  offer:   'bg-purple-500/20 text-purple-600 border-purple-500/20',
};
```

---

## How Admin Sends Notifications (Currently)

### Manual Method (via Code/API)
Since there's no UI yet, admin can use curl or API clients:

```bash
# 1. Get admin's ID token
# From Firebase Console or after login

# 2. Send notification via API
curl -X POST http://localhost:3001/api/notifications/send \
  -H "Authorization: Bearer {ID_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "target_user_123",
    "title": "Flash Sale!",
    "message": "50% off on premium items",
    "type": "offer",
    "actionUrl": "/shop?category=premium"
  }'

# Response:
# {
#   "success": true,
#   "notificationId": "notif_123"
# }
```

### Backend Code to Send (For Integration)

```typescript
// In lib/firebase.ts or api route:

export async function sendNotification(
  userId: string,
  title: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'offer',
  actionUrl?: string
) {
  const notificationsRef = collection(db, 'notifications');
  
  const docRef = await addDoc(notificationsRef, {
    userId,
    title,
    message,
    type,
    actionUrl: actionUrl || null,
    read: false,
    dismissed: false,
    createdAt: serverTimestamp(),
  });
  
  return docRef.id;
}

// Usage:
await sendNotification(
  'user123',
  'Order Confirmed!',
  'Your order ORD-001 is confirmed',
  'success',
  '/orders'
);
```

---

## API Endpoints Available

### Getting Notifications
```
GET /api/notifications/in-app
├─ Requires: Authorization header with ID token
├─ Returns: { notifications: [...], unreadCount: 5 }
└─ Fetches: All unread + recent notifications for user
```

### Marking as Read
```
POST /api/notifications/{id}/read
├─ Requires: Authorization header
├─ Body: { }
├─ Updates: notification.read = true
└─ Returns: { success: true }
```

### Dismissing Notification
```
POST /api/notifications/{id}/dismiss
├─ Requires: Authorization header
├─ Body: { }
├─ Updates: notification.dismissed = true
└─ Returns: { success: true }
```

### Getting Stats (Not implemented)
```
GET /api/notifications/stats
├─ Requires: Authorization header
├─ Returns: { total: 10, unread: 3, types: {...} }
└─ For dashboard analytics
```

### Clearing All (Not implemented)
```
POST /api/notifications/clear
├─ Requires: Authorization header
├─ Clears: All notifications for user
└─ Returns: { success: true }
```

---

## What's Missing - Need to Build

### 1. Admin Notification Sender Page
**File:** `app/admin/notifications/send/page.tsx`

**Should have:**
```
┌──────────────────────────────────┐
│ Send Notification                │
├──────────────────────────────────┤
│ Recipient: [Dropdown: All/User]  │
│ If User: [Select User Input]     │
├──────────────────────────────────┤
│ Title: [Text Input]              │
│ Message: [Text Area]             │
│ Type: [success/info/offer...]    │
│ Action URL: [Input]              │
├──────────────────────────────────┤
│ Preview: [Show notification UI]  │
├──────────────────────────────────┤
│ [SEND] [CANCEL]                  │
└──────────────────────────────────┘
```

### 2. Automatic Event Triggers
**Locations to add code:**

**In checkout after payment:**
```typescript
// After order created successfully
await sendNotification(
  userId,
  'Order Confirmed!',
  `Your order ${orderId} is confirmed`,
  'success',
  `/order-confirmation/${orderId}`
);
```

**In wallet update after points earned:**
```typescript
// After updateUserWallet()
await sendNotification(
  userId,
  'Points Earned!',
  `You earned ${earnedPoints} points`,
  'success',
  '/wallet'
);
```

**In point redemption:**
```typescript
// After redeeming points
await sendNotification(
  userId,
  'Points Redeemed!',
  `${pointsRedeemed} points used for ₹${discount} discount`,
  'success',
  '/wallet'
);
```

### 3. Admin Settings for Notifications
**Add to `/admin/settings`:**
- Enable/disable automatic notifications
- Set notification retention period
- Broadcast settings (who gets what notifications)

---

## Security & Permissions

### Who Can Access What?

**Anyone logged in can:**
- ✅ View their own notifications
- ✅ Mark their notifications as read
- ✅ Dismiss their notifications
- ✅ See notification in bell icon

**Only admins can:**
- ✅ Send notifications to users (if endpoint exists)
- ✅ View notification analytics
- ✅ Broadcast system messages
- ✅ Delete/edit scheduled notifications (if implemented)

**System-level:**
- ✅ Automatic notifications triggered by events (no auth needed)
- ✅ Server-side verification on all endpoints
- ✅ User ID validation in all queries

---

## How to Test Notifications

### Test 1: Manual Notification (Firebase Console)
```
1. Go to Firebase Console
2. Firestore → notifications collection
3. Add document with:
   - userId: your_user_id
   - title: "Test"
   - message: "This is a test"
   - type: "info"
   - read: false
   - dismissed: false
   - createdAt: now
4. Refresh app
5. Bell icon shows 1 unread
6. Click bell to see notification
```

### Test 2: Purchase Flow Notifications
```
1. Login as user
2. Buy something (checkout)
3. Complete Razorpay payment
4. Go to order confirmation page
5. Check Firestore → notifications
6. Should see notification created automatically
   (Once auto-trigger is implemented)
7. Refresh page
8. Bell icon shows unread count
```

### Test 3: Multiple Notifications
```
1. Create 5 notifications in Firestore
2. Refresh app
3. Bell shows "5"
4. Click bell
5. See list of 5
6. Click first notification
7. Goes to actionUrl
8. Mark as read
9. Count updates to "4"
10. Refresh
11. Count still shows "4"
```

---

## Summary Table

| Feature | Status | How It Works |
|---------|--------|--------------|
| Display in navbar | ✅ Done | Bell icon with badge |
| Get notifications | ✅ Done | GET /api/notifications/in-app |
| Mark as read | ✅ Done | POST /api/notifications/{id}/read |
| Dismiss | ✅ Done | POST /api/notifications/{id}/dismiss |
| Firestore storage | ✅ Done | notifications collection |
| Order confirmation page | ✅ Done | /order-confirmation/[id] |
| Send notifications | ❌ Missing | Admin page needed |
| Auto-triggers | ❌ Missing | Event handlers needed |
| Email notifications | ❌ Missing | Email service integration |
| Push notifications | ❌ Missing | FCM integration |
| Notification history | ❌ Missing | History page needed |
| Notification settings | ❌ Missing | User preferences |

---

## Next Steps

To make notifications fully functional:

1. **Implement Admin Sender UI**
   - Create `/admin/notifications/send` page
   - Form with recipient, title, message, type, URL
   - API endpoint to handle sending

2. **Add Auto-Triggers**
   - Order created → send notification
   - Points earned → send notification
   - Points redeemed → send notification

3. **Add to Admin Dashboard**
   - Track sent notifications
   - View analytics
   - Schedule messages

4. **Optional Enhancements**
   - Email notifications
   - Push notifications
   - User preferences (what types to receive)
   - Notification history/archive
