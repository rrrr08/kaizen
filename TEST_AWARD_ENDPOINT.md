# Test Award Endpoint

## Quick Test

The error `POST http://localhost:3000/api/games/award 404` is showing port 3000, but your server runs on **port 3001**.

### Solution 1: Restart Dev Server

The Next.js dev server might have cached the old port. Restart it:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd kaizen
npm run dev
```

### Solution 2: Clear Next.js Cache

```bash
cd kaizen
rm -rf .next
npm run dev
```

### Solution 3: Test the Endpoint Directly

Open browser console on `http://localhost:3001` and run:

```javascript
// Get your auth token first
const user = firebase.auth().currentUser;
const token = await user.getIdToken();

// Test the endpoint
fetch('/api/games/award', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    gameId: 'riddle',
    retry: 0
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

### Solution 4: Check if Route File Exists

The file should be at: `kaizen/app/api/games/award/route.ts`

Verify it exists and has the POST export.

### Why the Error Shows localhost:3000

The browser console sometimes shows `localhost:3000` even when using relative URLs like `/api/games/award`. This is a display issue, not the actual request URL.

The actual request goes to whatever domain/port the page is loaded from (which should be `localhost:3001`).

### Verify Server is Running on 3001

Check your terminal - it should show:
```
- Local:        http://localhost:3001
```

If it shows 3000, update your `package.json`:
```json
{
  "scripts": {
    "dev": "next dev -p 3001"
  }
}
```

### Test from Admin Panel

1. Go to `http://localhost:3001/admin/api-test`
2. Click "RUN TESTS"
3. Check if "Award Points" test passes

This will show you the actual error if there is one.
