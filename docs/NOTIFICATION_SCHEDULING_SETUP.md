# Notification Scheduling Setup Guide

## Overview
Scheduled notifications are stored in the `pushCampaigns` collection with a `scheduledFor` timestamp. A background worker processes these at the scheduled time.

## How It Works

1. **Creating a Scheduled Notification:**
   - Admin creates a notification with a future date/time
   - Stored in `pushCampaigns` with `status: 'scheduled'`
   - Also appears in the admin dashboard immediately

2. **Processing Scheduled Notifications:**
   - A cron job checks for due notifications every minute
   - Endpoint: `/api/cron/process-scheduled-notifications`
   - Sends notifications and updates status to 'sent'

## Setup Options

### Option 1: Vercel Cron Jobs (Production - Recommended)

Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/process-scheduled-notifications",
    "schedule": "* * * * *"
  }]
}
```

### Option 2: External Cron Service (Production Alternative)

Use services like:
- **Cron-job.org**: https://cron-job.org
- **EasyCron**: https://www.easycron.com
- **GitHub Actions** (free)

Setup:
1. Create a cron job that hits: `https://your-domain.com/api/cron/process-scheduled-notifications`
2. Set schedule: Every 1 minute (`* * * * *`)
3. Add header: `Authorization: Bearer YOUR_CRON_SECRET` (optional)

### Option 3: Manual Testing (Development)

**Test scheduled notifications immediately:**

1. Open a new terminal
2. Run:
```bash
curl http://localhost:3000/api/cron/process-scheduled-notifications
```

Or create a test script:

**File: `scripts/process-notifications.js`**
```javascript
async function processScheduledNotifications() {
  try {
    const response = await fetch('http://localhost:3000/api/cron/process-scheduled-notifications');
    const data = await response.json();
    console.log('Processed:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

processScheduledNotifications();
```

Run with: `node scripts/process-notifications.js`

## Environment Variables (Optional)

Add to `.env.local` for security:
```env
CRON_SECRET=your-random-secret-here
```

Then call the endpoint with:
```bash
curl -H "Authorization: Bearer your-random-secret-here" \
  http://localhost:3000/api/cron/process-scheduled-notifications
```

## Checking Scheduled Notifications

### Via Firebase Console:
1. Go to Firestore
2. Open `pushCampaigns` collection
3. Filter by `status == 'scheduled'`
4. Check `scheduledFor` timestamps

### Via Admin Dashboard:
- Scheduled notifications appear with a yellow "SCHEDULED" badge
- Shows the scheduled date/time

## Troubleshooting

**Notification not sending:**
1. Check if it appears in `pushCampaigns` with `status: 'scheduled'`
2. Verify `scheduledFor` timestamp is in the past
3. Manually trigger the cron endpoint
4. Check server logs for errors

**Testing a scheduled notification:**
1. Create a notification scheduled for 1 minute from now
2. Wait 1 minute
3. Manually call the cron endpoint
4. Check if status changed to 'sent' in Firestore
5. Verify notification was received

## Next Steps

For production deployment:
1. Choose Option 1 (Vercel Cron) or Option 2 (External Service)
2. Set up the cron job
3. Test with a notification scheduled 2 minutes ahead
4. Monitor the first few scheduled sends
