# 🧪 Testing & Verification Guide

## Test Your New Data Tables Setup

---

## Test 1: Initialize Mock Data

### Step 1: Start Your App
```bash
npm run dev
# App should be running on http://localhost:3000
```

### Step 2: Initialize Mock Data
Choose one method:

**Method A: Browser**
```
Open in browser: http://localhost:3000/api/admin/init-mock-data
Expected response:
{
  "success": true,
  "message": "Mock data initialized successfully"
}
```

**Method B: Curl (Windows PowerShell)**
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/admin/init-mock-data"
```

**Method C: Terminal/Git Bash**
```bash
curl http://localhost:3000/api/admin/init-mock-data
```

### Step 3: Check Firestore Console
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click "Firestore Database"
4. **You should see:**
   - `notifications` collection (3 documents)
   - `campaigns` collection (3 documents)

---

## Test 2: Verify Notifications Page

### Step 1: Navigate to Admin Notifications
```
http://localhost:3000/admin/notifications
```

### Step 2: Check Display
✅ Should show:
- Header: "Notifications Manager"
- Left sidebar: "Send Notification" form
- Right content area: Shows 3 notifications in history
  - "50% Off Sale" (offer, amber color)
  - "New Event Added" (info, blue color)
  - "Welcome to Joy Juncture!" (success, green color)

### Step 3: Test Sending Notification
1. Fill in form:
   - Title: "Test Notification"
   - Message: "This is a test"
   - Type: "offer"
   - Recipient Type: "all"

2. Click "Send Notification"

3. Verify:
   ✅ Alert says "Notification sent successfully!"
   ✅ New notification appears at top of list
   ✅ Form clears

### Step 4: Verify Persistence
1. Refresh the page (F5)
2. The notification list should still show all notifications including your new one
3. This proves data is in Firestore, not just memory!

---

## Test 3: Verify Campaigns Page

### Step 1: Navigate to Admin Push Notifications
```
http://localhost:3000/admin/push-notifications
```

### Step 2: Check Display
✅ Should show:
- Header: "Push Notifications"
- Tabs: "Send Notification", "Scheduled", "Analytics"
- Form to create campaign
- List of 3 campaigns below:
  - "Flash Sale Alert" (sent, 1150/1250 delivered)
  - "New Collection Launch" (sent, 1200/1250 delivered)
  - "Weekend Special" (scheduled)

### Step 3: Test Sending Campaign
1. Fill in form:
   - Title: "Test Campaign"
   - Message: "Test message for campaign"
   - Priority: "high"

2. Click "Send Notification"

3. Verify:
   ✅ Toast says "Success - Campaign sent successfully!"
   ✅ New campaign appears at top of list
   ✅ Form clears

### Step 4: Verify Persistence
1. Refresh the page (F5)
2. All campaigns including your new one should still be there
3. This proves data persists in Firestore!

---

## Test 4: Direct Firebase Console Check

### Step 1: Notifications Collection
```
Open Firebase Console → Your Project → Firestore Database
```

### Step 2: View Documents
```
notifications
├── Document 1: {
    title: "50% Off Sale",
    type: "offer",
    recipientCount: 1250,
    ...
}
├── Document 2: {
    title: "New Event Added",
    type: "info",
    ...
}
└── Document 3: {
    title: "Welcome to Joy Juncture!",
    type: "success",
    ...
}
```

### Step 3: View Campaigns Collection
```
campaigns
├── Document 1: {
    title: "Flash Sale Alert",
    status: "sent",
    deliveredCount: 1150,
    interactionCount: 340,
    ...
}
├── Document 2: {
    title: "New Collection Launch",
    status: "sent",
    deliveredCount: 1200,
    ...
}
└── Document 3: {
    title: "Weekend Special",
    status: "scheduled",
    deliveredCount: 0,
    ...
}
```

---

## Test 5: Code-Level Verification

### Check Firebase Functions Work
Open browser console (F12) and run:

```javascript
// Try to fetch notifications from Firestore
fetch('http://localhost:3000/admin/notifications')
  .then(r => r.text())
  .then(console.log)

// Check if data appears on page
const notificationTitles = document.querySelectorAll('h3')
notificationTitles.forEach(h => console.log(h.textContent))
```

Expected output:
```
50% Off Sale
New Event Added
Welcome to Joy Juncture!
```

---

## Test Results Checklist

### Initialization
- [ ] Mock data API returns success
- [ ] Firestore shows `notifications` collection
- [ ] Firestore shows `campaigns` collection
- [ ] Both collections have 3 documents each

### Notifications Page
- [ ] Page loads without errors
- [ ] Shows 3 mock notifications
- [ ] Can send new notification
- [ ] New notification appears in list
- [ ] Data persists after refresh

### Campaigns Page
- [ ] Page loads without errors
- [ ] Shows 3 mock campaigns
- [ ] Can send new campaign
- [ ] New campaign appears in list
- [ ] Data persists after refresh

### Data Structure
- [ ] Notifications have all required fields
- [ ] Campaigns have all required fields
- [ ] Timestamps are proper ISO format
- [ ] IDs are auto-generated by Firestore

---

## Common Issues & Solutions

### Issue: "Collections don't exist in Firestore"
**Solution:**
1. Refresh the page and ensure init was called
2. Check browser console for errors
3. Call init endpoint again: `http://localhost:3000/api/admin/init-mock-data`

### Issue: "Nothing shows on notifications page"
**Solution:**
1. Check browser console (F12) for errors
2. Verify Firestore connection in `.env.local`
3. Make sure you called init endpoint
4. Try refreshing the page

### Issue: "Cannot read properties of undefined"
**Solution:**
1. Check if you're logged in as admin
2. Verify Firebase config is correct
3. Clear browser cache and refresh

### Issue: "Firestore permission denied"
**Solution:**
1. Check Firebase Security Rules allow reads/writes
2. Go to Firebase Console → Firestore → Rules
3. Ensure your auth rules are set correctly

---

## Success Criteria

✅ **Initialization Works**
- Mock data endpoint returns success
- Collections created in Firestore

✅ **Notifications Page Works**
- Shows 3 mock notifications
- Can add new notifications
- Data persists

✅ **Campaigns Page Works**
- Shows 3 mock campaigns
- Can add new campaigns
- Data persists

✅ **Firestore Data**
- Collections exist with proper structure
- All documents have correct fields
- Can view in Firebase Console

---

## Next Steps After Verification

1. **Replace with Real Data** (When Ready)
   - Keep Firestore functions
   - Update data source
   - Admin pages work unchanged

2. **Add More Features** (Optional)
   - Delete notifications/campaigns
   - Edit notifications/campaigns
   - Real-time listeners with `onSnapshot()`
   - Advanced filtering and sorting

3. **Production Deployment**
   - Test with real data
   - Set up proper security rules
   - Monitor Firestore usage
   - Scale as needed

---

## Support

If tests fail:
1. Check [MOCK_DATA_IMPLEMENTATION.md](MOCK_DATA_IMPLEMENTATION.md) - Implementation details
2. Check [DATA_TABLES_COMPLETE.md](DATA_TABLES_COMPLETE.md) - Data structure
3. Review [DATA_TABLES_SETUP.md](DATA_TABLES_SETUP.md) - Setup guide
4. Check browser console (F12) for error messages
