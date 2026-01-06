# Quick Guide: Enable Notification Scheduling

## The Issue
The scheduled notifications feature requires a Firestore composite index that doesn't exist yet.

## Solution: Create the Index

### Method 1: Click the Auto-Generated Link (Easiest)
1. Try to schedule a notification from the admin panel
2. Open your browser's Developer Console (F12)
3. Look for an error message with a clickable link
4. Click the link - it will take you directly to Firebase Console
5. Click "Create Index" and wait 1-2 minutes

### Method 2: Manual Creation in Firebase Console
1. Go to: https://console.firebase.google.com/project/gwoc-e598b/firestore/indexes
2. Click "Create Index"
3. Configure:
   - Collection ID: `pushCampaigns`
   - Field 1: `status` (Ascending)
   - Field 2: `scheduledFor` (Ascending)
   - Query scope: Collection
4. Click "Create Index"
5. Wait 1-2 minutes for it to build

### Method 3: Deploy via Firebase CLI
```bash
# In your project directory
firebase deploy --only firestore:indexes
```

## After Index is Created

### Test Scheduled Notifications:

1. **Create a test notification:**
   - Go to `/admin/push-notifications`
   - Fill in title and message
   - Set "Schedule" to 2 minutes from now
   - Click "Send Notification"

2. **Manually trigger the processor:**
   ```bash
   node scripts/process-scheduled-notifications.js
   ```

3. **Check if it worked:**
   - After 2 minutes, run the script again
   - You should see the notification being sent

## For Production (Vercel)

Once the index is created:
1. Deploy to Vercel: `vercel --prod`
2. Vercel will automatically run the cron job every minute
3. Scheduled notifications will be sent automatically

## Troubleshooting

**If you see "No scheduled campaigns due":**
- Good! The system is working, just no notifications are scheduled yet

**If you still see index error:**
- Wait a few more minutes for the index to finish building
- Check Firebase Console to see if index status is "Enabled"

**If notifications aren't sending:**
- Check Firestore `pushCampaigns` collection
- Verify `scheduledFor` timestamp is in the past
- Check `status` is 'scheduled'
