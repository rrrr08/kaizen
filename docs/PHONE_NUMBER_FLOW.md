# Phone Number Flow in Joy Juncture

## 📱 Phone Number Storage & Usage Map

---

## 🗄️ **Where Phone Numbers are Stored**

### **1. Firebase Firestore - User Document**
```
Collection: users
Document: {userId}
Fields:
  - phoneNumber: string (e.g., "+919876543210")
  - phoneVerified: boolean
  - phoneUpdatedAt: Date
```

**Location**: Firestore Database  
**Access**: Server-side (Firebase Admin) & Client-side (Firebase SDK)

---

## 📍 **Where Phone Numbers are Displayed**

### **1. Notification Preferences Page**
**File**: `app/notification-preferences/page.tsx`  
**Line**: 68, 81, 385, 389

```typescript
const [phoneNumber, setPhoneNumber] = useState<string>('');

// Fetched from Firestore
setPhoneNumber(userData.phoneNumber || '');

// Displayed in PhoneVerification component
<PhoneVerification 
  currentPhone={phoneNumber}
  onVerified={(verifiedPhone) => {
    setPhoneNumber(verifiedPhone);
  }}
/>
```

**User sees**: Their verified phone number in settings

---

### **2. Phone Verification Component**
**File**: `components/PhoneVerification.tsx`  
**Lines**: 22, 214, 250

```typescript
// Shows current phone
const [phoneNumber, setPhoneNumber] = useState(currentPhone || '');

// Displays in UI
<input value={phoneNumber} />

// Shows in OTP step
"We sent a 6-digit code to {phoneNumber}"
```

**User sees**: 
- Input field to enter phone
- Confirmation message with their phone number

---

### **3. Invoice/Order Display**
**File**: `components/ui/InvoiceModal.tsx`  
**Line**: 76

```typescript
<p>Contact: {order.shippingAddress?.phone}</p>
```

**User sees**: Phone number on order invoice

---

### **4. Event Registration Form**
**File**: `components/EventRegistrationForm.tsx`  
**Lines**: 69, 122, 166-172

```typescript
phone: '',  // Form field

// Validation
if (!formData.phone.trim()) {
  setError('Please enter your phone number');
}
```

**User sees**: Phone input field in event registration

---

### **5. Experience Payment Form**
**File**: `components/ExperiencePaymentForm.tsx`  
**Lines**: 42, 68-69, 307-308

```typescript
phone: enquiry.phone || user?.phoneNumber || '',

// Validation
if (!/^\d{10}$/.test(formData.phone)) {
  setError('Please enter a valid phone number');
}
```

**User sees**: Phone input in experience booking

---

## 📤 **Where Phone Numbers are Used for SMS**

### **1. OTP Verification SMS**
**File**: `app/api/user/phone/send-otp/route.ts`  
**Lines**: 20, 77, 108

```typescript
const { phoneNumber } = body;

// Store OTP
otpStore.set(phoneNumber, { otp, expiresAt, attempts: 0 });

// Send SMS via Twilio
await client.messages.create({
  body: SmsTemplates.otp(otp, 10),
  from: twilioPhone,
  to: phoneNumber  // ← SENT HERE
});
```

**SMS sent to**: User's entered phone number

---

### **2. General Notifications**
**File**: `lib/notification-service.ts`  
**Lines**: 172, 175, 192

```typescript
const { phoneNumber, phoneVerified } = userData;

// Check if verified
if (!phoneNumber || !phoneVerified) return false;

// Send SMS
await client.messages.create({
  body: smsBody,
  from: twilioPhone,
  to: phoneNumber  // ← SENT HERE
});
```

**SMS sent to**: User's verified phone from Firestore

---

## 🔄 **Complete Phone Number Flow**

### **Step 1: User Enters Phone**
```
User visits: /notification-preferences
  ↓
Enters phone number in PhoneVerification component
  ↓
Clicks "Send OTP"
```

### **Step 2: OTP Sent**
```
Frontend → POST /api/user/phone/send-otp
  ↓
Backend validates phone format
  ↓
Generates OTP
  ↓
Twilio sends SMS to phoneNumber
  ↓
OTP stored in memory (otpStore)
```

### **Step 3: User Verifies**
```
User enters OTP
  ↓
Frontend → POST /api/user/phone/verify-otp
  ↓
Backend validates OTP
  ↓
Updates Firestore:
  - phoneNumber: "+919876543210"
  - phoneVerified: true
  - phoneUpdatedAt: Date
```

### **Step 4: Phone Stored**
```
Firestore Database
  ↓
users/{userId}
  ↓
{
  phoneNumber: "+919876543210",
  phoneVerified: true,
  phoneUpdatedAt: "2026-01-15T10:30:00Z"
}
```

### **Step 5: Used for SMS**
```
When notification sent:
  ↓
Fetch user from Firestore
  ↓
Get phoneNumber field
  ↓
Check phoneVerified === true
  ↓
Send SMS via Twilio to phoneNumber
```

---

## 📋 **Phone Number Format**

### **Input Format**
```
User enters: 9876543210
System converts to: +919876543210 (E.164 format)
```

### **Storage Format**
```
Firestore: "+919876543210"
Display: "+91 98765 43210" (formatted)
SMS: "+919876543210" (E.164)
```

### **Validation**
```typescript
// E.164 format validation
const phoneRegex = /^\+[1-9]\d{1,14}$/;

// Example valid numbers:
+919876543210 ✅
+14155552671 ✅
+447911123456 ✅

// Invalid:
9876543210 ❌ (missing country code)
+91-98765-43210 ❌ (has dashes)
```

---

## 🔍 **How to Find User's Phone Number**

### **Option 1: Firebase Console**
```
1. Go to Firebase Console
2. Firestore Database
3. Collection: users
4. Document: {userId}
5. Field: phoneNumber
```

### **Option 2: Admin API**
```typescript
// Get user's phone
const userDoc = await adminDb.collection('users').doc(userId).get();
const phoneNumber = userDoc.data()?.phoneNumber;
const isVerified = userDoc.data()?.phoneVerified;
```

### **Option 3: Client-side**
```typescript
// In React component
const { user } = useAuth();
const phoneNumber = user?.phoneNumber;
const isVerified = user?.phoneVerified;
```

---

## 📊 **Phone Number Usage Summary**

| Location | Purpose | Format |
|----------|---------|--------|
| **Firestore** | Storage | E.164 (+919876543210) |
| **PhoneVerification** | Input/Display | Formatted (+91 98765 43210) |
| **OTP SMS** | Verification | E.164 (+919876543210) |
| **Notification SMS** | Alerts | E.164 (+919876543210) |
| **Order Invoice** | Contact Info | As entered |
| **Event Registration** | Contact Info | As entered |

---

## 🔒 **Security & Privacy**

### **Phone Number Protection**
```
✅ Stored in Firestore (secure)
✅ Only sent to verified Twilio number
✅ Not exposed in public APIs
✅ Requires authentication to access
✅ Verified before SMS sending
```

### **Verification Required**
```
phoneVerified: false → No SMS sent ❌
phoneVerified: true → SMS sent ✅
```

---

## 🛠️ **Testing Phone Numbers**

### **Development Mode**
```typescript
// In .env.local
USE_MOCK_OTP=true

// OTP will be logged to console instead of SMS
console.log('🔐 OTP for +919876543210: 123456');
```

### **Twilio Trial Account**
```
- Can only send to verified numbers
- Add test numbers in Twilio console
- Or use mock mode for development
```

---

## 📱 **Example Phone Number Journey**

```
1. User signs up
   └─ No phone number yet

2. User goes to /notification-preferences
   └─ Sees "Verify Phone Number" option

3. User enters: 9876543210
   └─ System converts to: +919876543210

4. User clicks "Send OTP"
   └─ SMS sent to +919876543210
   └─ "Your OTP: 123456"

5. User enters OTP: 123456
   └─ Verified! ✅

6. Firestore updated:
   └─ phoneNumber: "+919876543210"
   └─ phoneVerified: true

7. Future notifications:
   └─ SMS sent to +919876543210
   └─ "🎮 New Feature Alert..."
```

---

## ✅ **Quick Reference**

**Where is it stored?**  
→ Firestore: `users/{userId}/phoneNumber`

**Where is it displayed?**  
→ Notification Preferences page  
→ Phone Verification component  
→ Order invoices  
→ Event registration forms

**Where is it used for SMS?**  
→ OTP verification  
→ General notifications  
→ Event confirmations  
→ Order updates

**Format?**  
→ E.164: `+919876543210`

**Verified?**  
→ Check: `phoneVerified` field in Firestore

---

**Your phone number system is complete and working!** 📱✅
