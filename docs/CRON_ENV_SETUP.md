# Cron Jobs Environment Variables Setup Guide

## Required Environment Variables

For cron jobs to work, you need Firebase Admin credentials. You have **two options**:

### Option 1: Individual Variables (Recommended for Vercel)

Add these to your `.env.local` (for development) and Vercel Environment Variables (for production):

```env
# Required - Firebase Admin Credentials
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"

# Optional - For additional security
CRON_SECRET=your-random-secret-string-here
```

### Option 2: Single JSON String (Alternative)

```env
# Single JSON string with all service account data
FIREBASE_ADMIN_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}

# Optional - For additional security
CRON_SECRET=your-random-secret-string-here
```

---

## Where to Find These Values

### Step 1: Go to Firebase Console

1. Visit: https://console.firebase.google.com/
2. Select your project

### Step 2: Get Service Account Key

1. Click the **⚙️ Settings** icon (top left)
2. Select **Project settings**
3. Go to the **Service accounts** tab
4. Click **Generate new private key**
5. Click **Generate key** in the popup
6. A JSON file will download (e.g., `your-project-firebase-adminsdk-xxxxx.json`)

### Step 3: Extract Values from JSON

Open the downloaded JSON file. It looks like this:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

### Step 4: Set Environment Variables

#### For Local Development (`.env.local`):

```env
# Copy these values from the JSON file
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"

# Optional: Generate a random secret for cron security
CRON_SECRET=my-super-secret-random-string-12345
```

**Important Notes:**
- Keep the quotes around `FIREBASE_ADMIN_PRIVATE_KEY`
- Keep the `\n` characters in the private key (they represent newlines)
- The private key should be on one line with `\n` characters

#### For Vercel Production:

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add each variable:
   - `FIREBASE_ADMIN_PROJECT_ID` = your project ID
   - `FIREBASE_ADMIN_CLIENT_EMAIL` = your client email
   - `FIREBASE_ADMIN_PRIVATE_KEY` = your private key (with quotes and `\n`)
   - `CRON_SECRET` = your random secret (optional)

---

## CRON_SECRET (Optional but Recommended)

This adds security to prevent unauthorized access to your cron endpoint.

### Generate a Random Secret:

**Option 1: Using Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option 2: Using OpenSSL**
```bash
openssl rand -hex 32
```

**Option 3: Online Generator**
- Visit: https://randomkeygen.com/
- Use a "CodeIgniter Encryption Keys" or any random string

### Add to Environment:

```env
CRON_SECRET=your-generated-random-string-here
```

**Note:** If you set `CRON_SECRET`, Vercel cron jobs will need to include it. However, since Vercel cron jobs don't send custom headers, you can either:
- Leave it unset (cron will work without auth)
- Or configure Vercel to pass it as a query parameter (advanced)

---

## Quick Setup Checklist

- [ ] Download Firebase service account JSON file
- [ ] Extract `project_id` → `FIREBASE_ADMIN_PROJECT_ID`
- [ ] Extract `client_email` → `FIREBASE_ADMIN_CLIENT_EMAIL`
- [ ] Extract `private_key` → `FIREBASE_ADMIN_PRIVATE_KEY` (keep quotes and `\n`)
- [ ] Generate `CRON_SECRET` (optional)
- [ ] Add to `.env.local` for development
- [ ] Add to Vercel Environment Variables for production
- [ ] Restart your development server
- [ ] Test the cron endpoint manually

---

## Testing

After setting up environment variables:

1. **Test locally:**
   ```bash
   curl http://localhost:3000/api/cron/process-scheduled-notifications
   ```

2. **Test with secret (if set):**
   ```bash
   curl "http://localhost:3000/api/cron/process-scheduled-notifications?secret=your-cron-secret"
   ```

3. **Check Vercel logs** after deployment to see if cron jobs are running

---

## Troubleshooting

**Error: "Missing required service account fields"**
- Make sure all three required variables are set
- Check for typos in variable names
- Ensure private key has quotes and `\n` characters

**Error: "Unauthorized" when calling cron endpoint**
- If `CRON_SECRET` is set, include it in the request
- Or remove `CRON_SECRET` to allow unauthenticated access (for Vercel cron)

**Cron jobs not running in production**
- Check Vercel dashboard → Settings → Cron Jobs
- Verify `vercel.json` is deployed
- Check Vercel logs for errors
- Ensure environment variables are set in Vercel
