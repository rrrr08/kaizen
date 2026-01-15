# Phone Number - Fetch & Schema Documentation

## 📊 **Firestore Schema**

### **Collection: `users`**
```typescript
users/{userId}
{
  // User Profile
  email: string,
  displayName: string,
  photoURL: string,
  
  // Phone Number Fields ← HERE
  phoneNumber: string,        // E.164 format: "+919876543210"
  phoneVerified: boolean,      // true/false
  phoneUpdatedAt: Timestamp,   // When phone was last updated
  
  // Other fields
  createdAt: Timestamp,
  lastLoginAt: Timestamp,
  currentLevel: number,
  totalXP: number,
  jpBalance: number,
  // ... more fields
}
```

---

## 🔍 **Where Phone Number is Fetched**

### **1. Notification Preferences Page (Real-time)**
**File**: `app/notification-preferences/page.tsx`  
**Lines**: 74-88

```typescript
// Real-time listener using onSnapshot
useEffect(() => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    const userRef = doc(db, 'users', currentUser.uid);
    
    // ← FETCH HAPPENS HERE (Real-time)
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.data();
        
        // Extract phone number
        setPhoneNumber(userData.phoneNumber || '');
        setPhoneVerified(userData.phoneVerified || false);
      }
    });

    return () => unsubscribe(); // Cleanup
  }
}, []);
```

**Type**: Real-time listener  
**Updates**: Automatically when Firestore changes  
**Used for**: Displaying current phone number

---

### **2. Notification Service (Server-side)**
**File**: `lib/notification-service.ts`  
**Lines**: 52-86

```typescript
// Fetch user data from Firestore
let userDocs: any[] = [];

if (userId) {
  // Single user
  const userDoc = await adminDb.collection('users').doc(userId).get();
  if (userDoc.exists) {
    userDocs = [userDoc];
  }
} else {
  // Multiple users (segmented)
  let query: any = adminDb.collection('users');
  
  if (recipientSegment === 'first-time') {
    query = query.where('isFirstTimeCustomer', '==', true);
  }
  
  const snapshot = await query.get();
  userDocs = snapshot.docs;
}

// Extract phone number for each user
for (const userDoc of userDocs) {
  const userData = userDoc.data();
  
  // ← PHONE NUMBER EXTRACTED HERE
  const { phoneNumber, phoneVerified } = userData;
  
  // Send SMS if verified
  if (phoneNumber && phoneVerified) {
    await sendSmsNotification(userData, title, message, actionUrl);
  }
}
```

**Type**: Server-side fetch  
**Used for**: Sending SMS notifications

---

### **3. OTP Verification (Save to Firestore)**
**File**: `app/api/user/phone/verify-otp/route.ts`  
**Lines**: 60-70

```typescript
// After OTP is verified, save to Firestore
await adminDb.collection('users').doc(userId).set({
  phoneNumber,           // ← SAVED HERE
  phoneVerified: true,   // ← MARKED AS VERIFIED
  phoneUpdatedAt: new Date()
}, { merge: true });
```

**Type**: Write operation  
**Used for**: Storing verified phone number

---

### **4. Check Existing Phone (Validation)**
**File**: `app/api/user/phone/send-otp/route.ts`  
**Lines**: 34-42

```typescript
// Check if phone number already exists
const existingUser = await adminDb.collection('users')
  .where('phoneNumber', '==', phoneNumber)
  .where('phoneVerified', '==', true)
  .get();

if (!existingUser.empty && existingUser.docs[0].id !== userId) {
  return NextResponse.json({
    error: 'This phone number is already verified by another account'
  }, { status: 409 });
}
```

**Type**: Query operation  
**Used for**: Preventing duplicate phone numbers

---

## 📋 **Complete Data Flow**

### **Step 1: User Enters Phone**
```
Frontend (PhoneVerification.tsx)
  ↓
User types: 9876543210
  ↓
Converted to: +919876543210
```

### **Step 2: Send OTP**
```
POST /api/user/phone/send-otp
  ↓
Body: { phoneNumber: "+919876543210" }
  ↓
Backend checks Firestore:
  - Query: users.where('phoneNumber', '==', '+919876543210')
  - If exists: Return error
  - If not: Send OTP via Twilio
```

### **Step 3: Verify OTP**
```
POST /api/user/phone/verify-otp
  ↓
Body: { phoneNumber: "+919876543210", otp: "123456" }
  ↓
Backend validates OTP
  ↓
Write to Firestore:
  users/{userId}.set({
    phoneNumber: "+919876543210",
    phoneVerified: true,
    phoneUpdatedAt: Date
  }, { merge: true })
```

### **Step 4: Real-time Update**
```
Firestore updated
  ↓
onSnapshot listener triggers
  ↓
Frontend updates:
  setPhoneNumber("+919876543210")
  setPhoneVerified(true)
  ↓
UI shows verified phone
```

### **Step 5: Use for SMS**
```
Admin sends notification
  ↓
Backend fetches from Firestore:
  const userDoc = await adminDb.collection('users').doc(userId).get()
  const { phoneNumber, phoneVerified } = userDoc.data()
  ↓
If phoneVerified === true:
  Send SMS to phoneNumber via Twilio
```

---

## 🗂️ **Firestore Structure Example**

```
Firestore Database
├── users (collection)
│   ├── user123 (document)
│   │   ├── email: "user@example.com"
│   │   ├── displayName: "Rahul Sharma"
│   │   ├── phoneNumber: "+919876543210"  ← HERE
│   │   ├── phoneVerified: true            ← HERE
│   │   ├── phoneUpdatedAt: 2026-01-15T10:30:00Z
│   │   ├── totalXP: 1500
│   │   └── jpBalance: 250
│   │
│   ├── user456 (document)
│   │   ├── email: "another@example.com"
│   │   ├── phoneNumber: "+918765432109"  ← HERE
│   │   ├── phoneVerified: false           ← HERE
│   │   └── ...
│   │
│   └── ...
```

---

## 🔍 **How to Query Phone Numbers**

### **1. Get Single User's Phone**
```typescript
// Client-side (React)
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const userRef = doc(db, 'users', userId);
const userSnap = await getDoc(userRef);

if (userSnap.exists()) {
  const phoneNumber = userSnap.data().phoneNumber;
  const phoneVerified = userSnap.data().phoneVerified;
}
```

### **2. Get All Verified Phone Numbers (Admin)**
```typescript
// Server-side
import { adminDb } from '@/lib/firebaseAdmin';

const snapshot = await adminDb.collection('users')
  .where('phoneVerified', '==', true)
  .get();

const verifiedUsers = snapshot.docs.map(doc => ({
  userId: doc.id,
  phoneNumber: doc.data().phoneNumber
}));
```

### **3. Real-time Listener**
```typescript
// Client-side (React)
import { doc, onSnapshot } from 'firebase/firestore';

const userRef = doc(db, 'users', userId);

const unsubscribe = onSnapshot(userRef, (snapshot) => {
  if (snapshot.exists()) {
    const phoneNumber = snapshot.data().phoneNumber;
    console.log('Phone updated:', phoneNumber);
  }
});

// Cleanup
return () => unsubscribe();
```

---

## 📊 **Schema Validation**

### **Phone Number Format**
```typescript
// E.164 validation regex
const phoneRegex = /^\+[1-9]\d{1,14}$/;

// Valid examples:
+919876543210 ✅
+14155552671 ✅
+447911123456 ✅

// Invalid examples:
9876543210 ❌ (no country code)
+91-98765-43210 ❌ (has dashes)
```

### **Firestore Rules (Recommended)**
```javascript
// firestore.rules
match /users/{userId} {
  allow read: if request.auth != null;
  
  allow write: if request.auth != null 
    && request.auth.uid == userId
    && (
      !('phoneNumber' in request.resource.data) 
      || request.resource.data.phoneNumber.matches('^\\+[1-9]\\d{1,14}$')
    );
}
```

---

## 🔒 **Security Considerations**

### **1. Phone Number Privacy**
```typescript
// ✅ Good: Only user can see their own phone
const userRef = doc(db, 'users', currentUser.uid);

// ❌ Bad: Exposing all phone numbers
const allUsers = await getDocs(collection(db, 'users'));
```

### **2. Verification Required**
```typescript
// ✅ Good: Check verification before SMS
if (phoneNumber && phoneVerified) {
  await sendSMS(phoneNumber);
}

// ❌ Bad: Send SMS without verification
await sendSMS(phoneNumber); // Might be unverified!
```

### **3. Duplicate Prevention**
```typescript
// ✅ Good: Check for duplicates
const existing = await adminDb.collection('users')
  .where('phoneNumber', '==', phoneNumber)
  .where('phoneVerified', '==', true)
  .get();

if (!existing.empty) {
  throw new Error('Phone already in use');
}
```

---

## ✅ **Quick Reference**

**Where is schema defined?**  
→ Firestore: `users/{userId}` collection

**Where is it fetched?**  
→ `notification-preferences/page.tsx` (real-time)  
→ `lib/notification-service.ts` (server-side)

**Where is it saved?**  
→ `app/api/user/phone/verify-otp/route.ts`

**Format?**  
→ E.164: `+919876543210`

**Fields?**  
→ `phoneNumber`, `phoneVerified`, `phoneUpdatedAt`

---

**Your phone number fetch and schema are properly implemented!** 📱✅
