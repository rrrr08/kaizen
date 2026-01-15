# Manual API Testing Guide

## Prerequisites
1. Start the development server: `npm run dev`
2. Server should be running on http://localhost:3000

## Test 1: Redis Connection Test

**Endpoint:** GET `/api/redis-test`

**Test using browser:**
- Open: http://localhost:3000/api/redis-test

**Test using PowerShell:**
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/redis-test" | Select-Object -ExpandProperty Content
```

**Expected Response:**
```json
{
  "success": true,
  "message": "✅ Redis is connected and working!",
  "testKey": "test:redis:xxxxx",
  "testValue": "Hello from Joy Juncture!",
  "keysInRedis": 50
}
```

---

## Test 2: Create Test Logs

**Endpoint:** GET `/api/test-logs`

**Test using browser:**
- Open: http://localhost:3000/api/test-logs

**Test using PowerShell:**
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/test-logs" | Select-Object -ExpandProperty Content
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Test logs created successfully"
}
```

---

## Test 3: View All Logs

**Endpoint:** GET `/api/admin/logs?level=all&limit=10`

**Test using browser:**
- Open: http://localhost:3000/api/admin/logs?level=all&limit=10

**Test using PowerShell:**
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/admin/logs?level=all&limit=10" | Select-Object -ExpandProperty Content
```

**Expected Response:**
```json
{
  "success": true,
  "logs": [
    {
      "timestamp": 1736975405000,
      "level": "info",
      "event": "test_info_log",
      "userId": "test_user_123",
      "data": {...}
    }
  ]
}
```

---

## Test 4: View Info Logs Only

**Endpoint:** GET `/api/admin/logs?level=info&limit=5`

**Test using browser:**
- Open: http://localhost:3000/api/admin/logs?level=info&limit=5

---

## Test 5: View Warning Logs

**Endpoint:** GET `/api/admin/logs?level=warn&limit=5`

**Test using browser:**
- Open: http://localhost:3000/api/admin/logs?level=warn&limit=5

---

## Test 6: View Error Logs

**Endpoint:** GET `/api/admin/logs?level=error&limit=5`

**Test using browser:**
- Open: http://localhost:3000/api/admin/logs?level=error&limit=5

---

## Test 7: Get Log Statistics

**Endpoint:** GET `/api/admin/logs/stats`

**Test using browser:**
- Open: http://localhost:3000/api/admin/logs/stats

**Test using PowerShell:**
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/admin/logs/stats" | Select-Object -ExpandProperty Content
```

**Expected Response:**
```json
{
  "success": true,
  "stats": {
    "info": 10,
    "warn": 5,
    "error": 2,
    "total": 17
  }
}
```

---

## Test 8: View All CDC Changes

**Endpoint:** GET `/api/admin/cdc?collection=all&limit=20`

**Test using browser:**
- Open: http://localhost:3000/api/admin/cdc?collection=all&limit=20

**Test using PowerShell:**
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/admin/cdc?collection=all&limit=20" | Select-Object -ExpandProperty Content
```

**Expected Response:**
```json
{
  "success": true,
  "changes": [
    {
      "collection": "orders",
      "documentId": "test_order_123",
      "operation": "create",
      "timestamp": 1736975405000
    }
  ]
}
```

---

## Test 9: View Orders CDC Changes

**Endpoint:** GET `/api/admin/cdc?collection=orders&limit=10`

**Test using browser:**
- Open: http://localhost:3000/api/admin/cdc?collection=orders&limit=10

---

## Test 10: View Users CDC Changes

**Endpoint:** GET `/api/admin/cdc?collection=users&limit=10`

**Test using browser:**
- Open: http://localhost:3000/api/admin/cdc?collection=users&limit=10

---

## Test 11: View Game Results CDC Changes

**Endpoint:** GET `/api/admin/cdc?collection=gameResults&limit=10`

**Test using browser:**
- Open: http://localhost:3000/api/admin/cdc?collection=gameResults&limit=10

---

## Test 12: View Events CDC Changes

**Endpoint:** GET `/api/admin/cdc?collection=events&limit=10`

**Test using browser:**
- Open: http://localhost:3000/api/admin/cdc?collection=events&limit=10

---

## Admin Dashboard Tests

### Logs Dashboard
**URL:** http://localhost:3000/admin/logs

**Features to test:**
- ✅ View real-time logs
- ✅ Filter by level (All, Info, Warn, Error)
- ✅ Search logs
- ✅ Auto-refresh toggle
- ✅ Statistics cards showing counts
- ✅ Log details (timestamp, event, user, data)

### CDC Dashboard
**URL:** http://localhost:3000/admin/cdc

**Features to test:**
- ✅ View real-time database changes
- ✅ Filter by collection (All, Orders, Users, Games, Events)
- ✅ Search changes
- ✅ Auto-refresh toggle
- ✅ Operation types (Create, Update, Delete)
- ✅ Before/After data comparison

---

## Complete Test Sequence

Run these commands in order:

```powershell
# 1. Test Redis connection
Invoke-WebRequest -Uri "http://localhost:3000/api/redis-test"

# 2. Create test logs
Invoke-WebRequest -Uri "http://localhost:3000/api/test-logs"

# 3. Wait a moment
Start-Sleep -Seconds 2

# 4. View all logs
Invoke-WebRequest -Uri "http://localhost:3000/api/admin/logs?level=all&limit=10"

# 5. Get log stats
Invoke-WebRequest -Uri "http://localhost:3000/api/admin/logs/stats"

# 6. View CDC changes
Invoke-WebRequest -Uri "http://localhost:3000/api/admin/cdc?collection=all&limit=20"
```

---

## Expected Results Summary

✅ **Redis:** Connection successful, can read/write data  
✅ **Logging:** Can create info/warn/error logs, retrieve them by level, get statistics  
✅ **CDC:** Can capture database changes, retrieve by collection, track operations  
✅ **Admin UI:** Both dashboards load and display data correctly  

All systems working = **Production Ready!** 🎉
