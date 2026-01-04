# Phone Verification & Device Registration Flow

## Overview
This document explains how phone verification and device registration work together for SMS and push notifications.

## Phone Verification Flow

### 1. Enter Phone Number
- User enters phone number in E.164 format (+1234567890)
- Frontend validates format
- Calls `/api/user/phone/send-otp` with phone number

### 2. OTP Generation & Storage
- Backend generates 6-digit OTP
- Stores in shared `lib/otpStore.ts` Map with:
  - OTP code
  - Phone number
  - Creation timestamp
  - Attempts counter (max 5)
  - Expiry: 10 minutes

### 3. SMS Delivery
- Twilio sends OTP via SMS
- Firestore updated: `otpSentAt` timestamp

### 4. OTP Verification
- User enters 6-digit code
- Calls `/api/user/phone/verify-otp`
- Backend checks:
  - OTP exists in store
  - Not expired (< 10 mins)
  - Attempts < 5
  - Code matches
- On success: Firestore `phoneVerified` = true

### 5. UI Update
- Parent component sets `phoneVerified` state immediately
- Real-time Firestore listener updates from database
- Verified badge shows instantly

## Device Registration Flow

### 1. Push Notification Permission
When user enables push notifications toggle:
1. Browser requests notification permission
2. If granted, Firebase Cloud Messaging (FCM) generates device token
3. Token is automatically registered via `/api/push/register-device`

### 2. Device Token Storage
```
Collection: userDeviceTokens
Document fields:
  - userId: Firebase UID
  - userEmail: User's email
  - deviceToken: FCM token
  - deviceType: 'web', 'android', 'ios'
  - deviceName: 'Chrome on Windows'
  - isActive: true/false
  - registeredAt: timestamp
  - lastUsedAt: timestamp
```

### 3. Device Display
Registered devices appear in "Registered Devices" section after:
1. Granting browser notification permission
2. FCM token generated and saved
3. Device record created in Firestore

## Authentication Requirements

### All User APIs Require Firebase Auth Token:
```typescript
const token = await auth.currentUser.getIdToken(true); // true forces refresh

headers: {
  'Authorization': `Bearer ${token}`
}
```

### Token Refresh
Use `getIdToken(true)` to force refresh before important operations like:
- Saving preferences
- Registering devices
- Verifying phone numbers

## Key Files

### Frontend
- `app/notification-preferences/page.tsx` - Main preferences UI
- `components/PhoneVerification.tsx` - Phone verification widget
- `app/hooks/use-push-notifications.ts` - FCM integration hook

### Backend
- `app/api/user/phone/send-otp/route.ts` - Send OTP via SMS
- `app/api/user/phone/verify-otp/route.ts` - Verify OTP code
- `app/api/push/register-device/route.ts` - Register FCM device token
- `lib/otpStore.ts` - Shared OTP storage (singleton)

## Common Issues & Solutions

### Issue: "OTP not found or expired"
**Cause:** OTP store not shared between send/verify routes  
**Solution:** Both routes now import from `lib/otpStore.ts`

### Issue: 401 Unauthorized on save
**Cause:** Auth token stale or not refreshed  
**Solution:** Use `getIdToken(true)` to force refresh

### Issue: No devices showing after verification
**Cause:** Device registration requires push notification permission  
**Solution:** User must enable push toggle to trigger device registration

### Issue: Phone verified but UI doesn't update
**Cause:** UI waiting for Firestore sync  
**Solution:** Parent immediately sets `phoneVerified` state in `onVerified` callback

## SMS vs Push Notifications

### SMS Notifications
- **Requirement:** Verified phone number
- **Trigger:** Phone verification flow
- **Storage:** Phone saved in Firestore user document
- **Delivery:** Twilio sends directly to phone number

### Push Notifications
- **Requirement:** Device token + browser permission
- **Trigger:** Enable push toggle
- **Storage:** FCM token in `userDeviceTokens` collection
- **Delivery:** FCM sends to specific device token

## Testing Checklist

1. ✅ Phone Verification
   - Enter phone number
   - Receive SMS with OTP
   - Enter OTP and verify
   - See verified badge immediately
   - Phone saved in Firestore

2. ✅ Device Registration
   - Enable push notifications toggle
   - Grant browser permission
   - See device appear in registered devices list
   - Token saved in userDeviceTokens collection

3. ✅ Save Preferences
   - Make preference changes
   - Click Save Preferences
   - Success toast appears
   - Changes persisted in Firestore

4. ✅ Notifications Delivery
   - Admin sends test notification
   - If SMS enabled + phone verified: Receive SMS
   - If push enabled + device registered: Receive push
   - Quiet hours respected for normal priority

## Architecture Notes

### Why Shared OTP Store?
API routes run in separate processes. In-memory Maps don't persist across routes unless exported from a shared module. The singleton pattern in `lib/otpStore.ts` ensures both send and verify routes use the same Map instance.

### Why Force Token Refresh?
After phone verification or other auth-related operations, the user's claims or state might change. Forcing a token refresh (`getIdToken(true)`) ensures the backend receives the latest auth state.

### Why Immediate UI Update?
Firestore real-time listeners can have network delays or connection issues. Setting local state immediately in the `onVerified` callback provides better UX - instant feedback while still syncing with database in background.
