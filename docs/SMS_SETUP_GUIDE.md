# SMS Notifications Setup Guide

This guide explains how to set up SMS notifications using Twilio for your application.

## Overview

SMS notifications allow you to send text messages to users' mobile phones. This feature uses Twilio as the SMS provider.

## Features Implemented

✅ **SMS Channel Selection** - Admins can choose to send notifications via SMS
✅ **User Preferences** - Users can enable/disable SMS notifications
✅ **Phone Number Verification** - Only verified phone numbers receive SMS
✅ **SMS Integration** - Fully integrated with existing notification system

## Prerequisites

1. **Twilio Account** - Sign up at [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. **Phone Number** - Purchase a Twilio phone number
3. **Environment Variables** - Configure Twilio credentials

## Setup Steps

### 1. Create Twilio Account

1. Go to [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Sign up for a free trial account
3. Complete phone verification

### 2. Get Twilio Credentials

1. Log in to [Twilio Console](https://console.twilio.com)
2. From the dashboard, copy:
   - **Account SID** - Your account identifier
   - **Auth Token** - Your authentication token (click to reveal)

### 3. Get a Twilio Phone Number

1. Go to **Phone Numbers** → **Manage** → **Buy a number**
2. Select your country
3. Search for available numbers
4. Purchase a number with SMS capabilities
5. Copy the phone number (format: +1234567890)

### 4. Configure Environment Variables

Add these variables to your `.env.local` file:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

**Important:** Never commit these credentials to version control!

### 5. Add Phone Numbers to User Profiles

Users need to have phone numbers in their Firestore profile:

```typescript
// Firestore users/{userId} document
{
  phoneNumber: "+1234567890",  // E.164 format
  phoneVerified: true,          // Verified via SMS/OTP
  // ... other user fields
}
```

### 6. Implement Phone Verification (Recommended)

To verify phone numbers before sending SMS:

1. Create an OTP verification endpoint
2. Send verification code via Twilio
3. User enters code to verify
4. Set `phoneVerified: true` in Firestore

## Usage

### Admin - Sending SMS Notifications

1. Go to **Admin Dashboard** → **Push Notifications**
2. Fill in notification details:
   - Title
   - Message
   - Optional: Action URL
3. Select **Notification Channels**:
   - Check "SMS Notifications"
4. Choose recipient segment
5. Click "Send Notification"

### User - Managing SMS Preferences

1. Go to **Notification Preferences**
2. Find "SMS Notifications" toggle
3. Enable/disable SMS notifications
4. Save preferences

## How It Works

### Notification Flow

1. **Admin sends notification** with SMS channel selected
2. **System fetches users** based on recipient segment
3. **Filters users** who have:
   - Valid phone number
   - Phone verified (`phoneVerified: true`)
   - SMS enabled in preferences (`smsEnabled: true`)
4. **Sends SMS** via Twilio to each eligible user
5. **Returns count** of SMS sent

### SMS Format

```
{Title}

{Message}

{Action URL (if provided)}
```

Example:
```
Flash Sale - 50% Off!

Get 50% off on selected games this weekend only!

https://joyjuncture.com/shop
```

## Firestore Schema

### User Document (users/{userId})
```typescript
{
  phoneNumber: string,        // E.164 format: +1234567890
  phoneVerified: boolean,     // true if verified
  displayName: string,        // Used in SMS personalization
  // ... other fields
}
```

### Notification Preferences (userNotificationPreferences/{userId})
```typescript
{
  smsEnabled: boolean,        // User's SMS preference
  pushEnabled: boolean,
  inAppEnabled: boolean,
  // ... other preferences
}
```

## Cost Considerations

### Twilio Pricing (approximate, check current rates)

- **SMS (USA/Canada)**: ~$0.0075 per message
- **SMS (International)**: Varies by country ($0.01 - $0.50)
- **Trial Account**: $15 free credit
- **Phone Number**: ~$1.15/month

### Cost Management Tips

1. **Use SMS sparingly** - Reserve for critical notifications
2. **User preferences** - Respect opt-outs to save costs
3. **Segment wisely** - Don't send to all users unnecessarily
4. **Monitor usage** - Check Twilio console regularly
5. **Set alerts** - Configure spending limits in Twilio

## Testing

### Test with Twilio Trial

**Limitations:**
- Can only send to verified phone numbers
- Messages include "Sent from your Twilio trial account"
- Limited credits ($15)

**Steps:**
1. Verify your personal phone number in Twilio
2. Test SMS sending through admin interface
3. Check message delivery on your phone

### Production Testing

1. Upgrade Twilio account (remove trial restrictions)
2. Test with small user segment first
3. Monitor delivery rates in Twilio console
4. Check error logs for failed deliveries

## Troubleshooting

### SMS Not Sending

**Check:**
1. ✅ Twilio credentials configured correctly
2. ✅ Phone numbers in E.164 format (+1234567890)
3. ✅ User has `phoneVerified: true`
4. ✅ User has `smsEnabled: true` in preferences
5. ✅ Twilio account has sufficient credits
6. ✅ Phone number has SMS capability

### Common Errors

**Error: "The 'From' number is not a valid phone number"**
- Fix: Ensure `TWILIO_PHONE_NUMBER` is in E.164 format (+1234567890)

**Error: "Authenticate"**
- Fix: Check `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`

**Error: "Permission Denied"**
- Fix: Verify phone number in Twilio console (trial accounts)

**Error: "Unverified number"**
- Fix: Upgrade to paid account or verify number in Twilio

### Checking Logs

**Backend logs:**
```bash
npm run dev
# Check terminal for error messages
```

**Twilio Console:**
- Go to **Logs** → **Messaging**
- View delivery status and errors

## Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **Phone Verification**: Always verify before sending SMS
3. **Rate Limiting**: Implement to prevent abuse
4. **User Consent**: Require opt-in for SMS notifications
5. **Unsubscribe**: Provide easy opt-out mechanism
6. **Data Privacy**: Comply with TCPA, GDPR regulations

## Compliance

### SMS Regulations

- **TCPA (USA)**: Require explicit consent
- **GDPR (EU)**: Get user permission
- **Include opt-out**: Add "Reply STOP to unsubscribe"
- **Business hours**: Don't send late at night
- **Content restrictions**: No spam or misleading content

### Recommended SMS Footer

Add to messages:
```
Reply STOP to unsubscribe
```

## API Reference

### Send Notification API

**Endpoint:** `POST /api/notifications/send`

**Request:**
```json
{
  "title": "Flash Sale!",
  "message": "50% off this weekend",
  "channels": ["push", "in-app", "sms"],
  "recipientSegment": "all",
  "actionUrl": "https://example.com"
}
```

**Response:**
```json
{
  "success": true,
  "notificationsSent": 150,
  "pushNotificationsSent": 120,
  "smsNotificationsSent": 80,
  "message": "In-app: 150, Push: 120, SMS: 80"
}
```

## File Changes

### Modified Files

1. **app/api/notifications/send/route.ts**
   - Added Twilio SMS sending logic
   - Checks user phone verification and preferences

2. **app/admin/push-notifications/page.tsx**
   - Added SMS channel checkbox

3. **app/notification-preferences/page.tsx**
   - Added SMS toggle for users

4. **app/api/user/notification-preferences/route.ts**
   - Added `smsEnabled` field support

## Next Steps

### Recommended Enhancements

1. **Phone Verification Flow**
   - Create OTP verification endpoint
   - Build phone input component
   - Add verification UI

2. **SMS Templates**
   - Create reusable SMS templates
   - Support placeholders (name, etc.)
   - Preview before sending

3. **SMS Analytics**
   - Track delivery rates
   - Monitor costs
   - User engagement metrics

4. **Quiet Hours for SMS**
   - Respect time zones
   - Don't send during night hours
   - Queue for appropriate time

5. **Two-Way SMS**
   - Handle replies (STOP, HELP)
   - Auto-unsubscribe on STOP
   - Store conversation history

## Support

### Resources

- **Twilio Documentation**: [https://www.twilio.com/docs](https://www.twilio.com/docs)
- **Twilio Console**: [https://console.twilio.com](https://console.twilio.com)
- **Support**: [https://support.twilio.com](https://support.twilio.com)

### Contact

For issues with this implementation, check:
- Error logs in terminal
- Twilio console logs
- Browser console errors

## Summary

✅ **Installed**: Twilio SDK package
✅ **Backend**: SMS sending via Twilio API
✅ **Admin UI**: SMS channel selection
✅ **User UI**: SMS preference toggle
✅ **Preferences**: SMS enabled by default
✅ **Documentation**: Setup and usage guide

**Status:** SMS notification system fully implemented and ready for use after Twilio credentials are configured.
