# Vercel Deployment: Firebase Configuration Guide

## 🔴 CRITICAL ISSUE FOUND

Your production site (https://kaizen-neon.vercel.app/) is showing multiple Firebase errors because **environment variables are not configured on Vercel**:

```
Error: Firebase Firestore not initialized
Error: Firebase not initialized
Cannot read properties of null (reading 'onAuthStateChanged')
500 Internal Server Error on API endpoints
```

### Root Cause

The `.env.local` file in your local development contains `NEXT_PUBLIC_FIREBASE_*` variables, but these are **not automatically included** when deploying to Vercel. You must manually configure them in your Vercel project settings.

---

## ✅ SOLUTION: Add Environment Variables to Vercel

### Step 1: Go to Vercel Dashboard

1. Visit https://vercel.com/dashboard
2. Click on your project **"kaizen"**
3. Go to **Settings** tab
4. Click on **Environment Variables** in the left sidebar

### Step 2: Add Each Firebase Configuration Variable

Add these 8 environment variables (copy values from your `.env.local` file):

| Variable Name | Value | Type |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyD7S6QWd6reHEt1TEtTow7ZnTA4VV4Y1q4` | Plaintext |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `gwoc-e598b.firebaseapp.com` | Plaintext |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `gwoc-e598b` | Plaintext |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `gwoc-e598b.firebasestorage.app` | Plaintext |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `594368440316` | Plaintext |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:594368440316:web:4b1ded550d642ecb047479` | Plaintext |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | `G-RP5NQZV91B` | Plaintext |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | `BLKUHkaG-bG2WouBWfosIQzd5_liy1mz7dxrxvThTVHseXN5BWe5e6WWhxrBL40a2OdAh31d0QMyA2AWhDFx07U` | Plaintext |

### Step 3: Add Server-Side (Private) Variables

Also add these sensitive variables that are used for server-side operations:

| Variable Name | Value | Type |
|---|---|---|
| `RAZORPAY_KEY_SECRET` | `P2tOk5wux22YyCwDezvTuUy7` | Encrypted |
| `FIREBASE_ADMIN_TYPE` | `service_account` | Plaintext |
| `FIREBASE_ADMIN_PROJECT_ID` | `gwoc-e598b` | Plaintext |
| `FIREBASE_ADMIN_PRIVATE_KEY_ID` | `90afc97a4ba5ea6f658a90bbf711dd4f571c3c17` | Plaintext |
| `FIREBASE_ADMIN_PRIVATE_KEY` | (from `.env`) | Encrypted |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | `firebase-adminsdk-fbsvc@gwoc-e598b.iam.gserviceaccount.com` | Plaintext |
| `FIREBASE_ADMIN_CLIENT_ID` | `114496868590446399385` | Plaintext |

### Step 4: Deploy

1. Click **Save** on all environment variables
2. Go to **Deployments** tab
3. Click on the latest deployment and **Redeploy**
   - OR push a new commit to trigger automatic redeployment

---

## 📋 Quick Copy-Paste Instructions

### For Vercel UI:

1. Go to your project Settings → Environment Variables
2. For each variable above:
   - Click **Add New**
   - Paste the variable name in **Name** field
   - Paste the value in **Value** field
   - Select **Plaintext** or **Encrypted** (use Encrypted for secrets)
   - Click **Save**
3. Trigger a redeployment from the Deployments tab

### Via Vercel CLI:

If you prefer command line:

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Link your project (from project directory)
vercel link

# Add environment variables
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
# ... repeat for all variables above

# Redeploy
vercel --prod
```

---

## 🔍 Verification

After deploying, verify the fix:

1. Go to https://kaizen-neon.vercel.app/
2. Open browser DevTools (F12)
3. Check Console tab - should be **clear of Firebase errors**
4. Try these actions:
   - Sign up or login → should work without errors
   - Navigate to Events page → should load events without "Firebase Firestore not initialized"
   - Check Cart → should load without errors
   - Try a purchase → should show Razorpay without errors

---

## 🛠️ How This Works

### Local Development (`.env.local`)
- Next.js automatically loads `.env.local` 
- Environment variables are available to the application
- Firebase initializes successfully

### Production (Vercel)
- Vercel does NOT automatically load `.env.local` files
- You must manually configure environment variables in Vercel Settings
- Environment variables are injected at build time and runtime
- Application reads these variables via `process.env.NEXT_PUBLIC_*`

---

## 📚 Files Affected

When Firebase environment variables are properly set, these files will work correctly:

- `lib/firebase.ts` - Line 45-60: Firebase initialization
- `app/context/AuthContext.tsx` - Uses `auth` variable
- `app/context/GamificationContext.tsx` - Uses `db` variable
- All API routes in `app/api/*` - Use Firebase services
- All database functions in `lib/db/*` - Use Firestore

---

## ⚠️ Important Notes

### NEXT_PUBLIC_ Variables
- These are **safe to be public** - they're used in browser-side JavaScript
- They're identifiable per Firebase project, not secret
- It's normal to commit these to Git

### Private Variables
- `RAZORPAY_KEY_SECRET` and `FIREBASE_ADMIN_*` should be marked as **Encrypted** in Vercel
- These should **NEVER** be committed to public repositories
- Only add to Vercel, not to `.env` in Git

---

## 🔗 References

- [Vercel Environment Variables Docs](https://vercel.com/docs/projects/environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Firebase Web Setup](https://firebase.google.com/docs/web/setup)

---

## ✨ After This Fix

All these errors will be resolved:
- ✅ "Error loading gamification config: Firebase not initialized"
- ✅ "Failed to save gamification config: Firebase not initialized"
- ✅ "Error fetching products: Firebase Firestore not initialized"
- ✅ "Error fetching experiences: Firebase Firestore not initialized"
- ✅ "Error fetching games: Firebase Firestore not initialized"
- ✅ 500 errors on `/api/events/upcoming`, `/api/events/past`, `/api/about`
- ✅ "Cannot read properties of null (reading 'onAuthStateChanged')"
