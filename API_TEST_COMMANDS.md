# API Testing Guide - Make Real HTTP Calls

## 🚀 Quick Start

1. **Start the dev server:**
   ```powershell
   npm run dev
   ```

2. **Run the rate limit test:**
   ```powershell
   .\test-rate-limits.ps1
   ```

---

## 📡 API Endpoints to Test

### 1. **Redis Test API**
```powershell
# Test Redis connection
Invoke-WebRequest -Uri "http://localhost:3000/api/redis-test" | Select-Object StatusCode, Content
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "✅ Redis is connected and working!"
}
```

---

### 2. **Create Test Logs**
```powershell
# Create test log entries
Invoke-WebRequest -Uri "http://localhost:3000/api/test-logs" | Select-Object StatusCode, Content
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Test logs created successfully"
}
```

---

### 3. **Get All Logs**
```powershell
# Get recent logs
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/admin/logs?level=all&limit=10"
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
```

**Test different log levels:**
```powershell
# Info logs
Invoke-WebRequest -Uri "http://localhost:3000/api/admin/logs?level=info&limit=5"

# Warning logs
Invoke-WebRequest -Uri "http://localhost:3000/api/admin/logs?level=warn&limit=5"

# Error logs
Invoke-WebRequest -Uri "http://localhost:3000/api/admin/logs?level=error&limit=5"
```

---

### 4. **Get Log Statistics**
```powershell
# Get log stats
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/admin/logs/stats"
$response.Content | ConvertFrom-Json
```

**Expected Response:**
```json
{
  "success": true,
  "stats": {
    "info": 50,
    "warn": 10,
    "error": 5,
    "total": 65
  }
}
```

---

### 5. **Get CDC Changes**
```powershell
# All changes
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/admin/cdc?collection=all&limit=20"
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
```

**Test specific collections:**
```powershell
# Orders
Invoke-WebRequest -Uri "http://localhost:3000/api/admin/cdc?collection=orders&limit=10"

# Users
Invoke-WebRequest -Uri "http://localhost:3000/api/admin/cdc?collection=users&limit=10"

# Games
Invoke-WebRequest -Uri "http://localhost:3000/api/admin/cdc?collection=gameResults&limit=10"

# Events
Invoke-WebRequest -Uri "http://localhost:3000/api/admin/cdc?collection=events&limit=10"
```

---

### 6. **Test Leaderboard (Rate Limited)**
```powershell
# Single request
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/leaderboard"
Write-Host "Status: $($response.StatusCode)"
Write-Host "Rate Limit: $($response.Headers.'X-RateLimit-Remaining')/$($response.Headers.'X-RateLimit-Limit')"
```

**Test rate limiting:**
```powershell
# Send multiple requests
1..35 | ForEach-Object {
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:3000/api/leaderboard" -ErrorAction Stop
        Write-Host "Request $_`: OK (Remaining: $($r.Headers.'X-RateLimit-Remaining'))" -ForegroundColor Green
    } catch {
        if ($_.Exception.Response.StatusCode -eq 429) {
            Write-Host "Request $_`: RATE LIMITED" -ForegroundColor Red
        }
    }
    Start-Sleep -Milliseconds 50
}
```

---

## 🔥 Rate Limiting Tests

### Test 1: Leaderboard API
**Limit:** 30 requests per 60 seconds

```powershell
# Test by sending 35 requests
$count = 0
$limited = 0

1..35 | ForEach-Object {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/leaderboard" -ErrorAction Stop
        $count++
        Write-Host "✓" -NoNewline -ForegroundColor Green
    } catch {
        if ($_.Exception.Response.StatusCode -eq 429) {
            $limited++
            Write-Host "X" -NoNewline -ForegroundColor Red
        }
    }
    Start-Sleep -Milliseconds 50
}

Write-Host ""
Write-Host "Successful: $count, Rate Limited: $limited"
```

---

### Test 2: Check Rate Limit Headers
```powershell
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/leaderboard"

Write-Host "Rate Limit Headers:"
Write-Host "  Limit: $($response.Headers.'X-RateLimit-Limit')"
Write-Host "  Remaining: $($response.Headers.'X-RateLimit-Remaining')"
Write-Host "  Reset: $($response.Headers.'X-RateLimit-Reset')"
```

---

### Test 3: Concurrent Requests
```powershell
# Send 10 concurrent requests
$jobs = 1..10 | ForEach-Object {
    Start-Job -ScriptBlock {
        param($url)
        Invoke-WebRequest -Uri $url -ErrorAction Stop
    } -ArgumentList "http://localhost:3000/api/leaderboard"
}

$jobs | Wait-Job | Receive-Job | Select-Object StatusCode
$jobs | Remove-Job
```

---

## 🎯 Complete Test Sequence

Run all tests in order:

```powershell
# 1. Test Redis
Write-Host "Testing Redis..." -ForegroundColor Cyan
Invoke-WebRequest -Uri "http://localhost:3000/api/redis-test"

# 2. Create test logs
Write-Host "Creating test logs..." -ForegroundColor Cyan
Invoke-WebRequest -Uri "http://localhost:3000/api/test-logs"

# 3. Wait a moment
Start-Sleep -Seconds 2

# 4. Get logs
Write-Host "Retrieving logs..." -ForegroundColor Cyan
$logs = Invoke-WebRequest -Uri "http://localhost:3000/api/admin/logs?level=all&limit=10"
$logs.Content | ConvertFrom-Json

# 5. Get stats
Write-Host "Getting statistics..." -ForegroundColor Cyan
$stats = Invoke-WebRequest -Uri "http://localhost:3000/api/admin/logs/stats"
$stats.Content | ConvertFrom-Json

# 6. Get CDC changes
Write-Host "Getting CDC changes..." -ForegroundColor Cyan
$cdc = Invoke-WebRequest -Uri "http://localhost:3000/api/admin/cdc?collection=all&limit=20"
$cdc.Content | ConvertFrom-Json

# 7. Test rate limiting
Write-Host "Testing rate limits..." -ForegroundColor Cyan
.\test-rate-limits.ps1
```

---

## 📊 Expected Results

✅ **Redis:** Connection successful  
✅ **Logs:** Can create and retrieve logs  
✅ **CDC:** Can capture and retrieve changes  
✅ **Rate Limiting:** Requests are limited after 30 calls  
✅ **Headers:** X-RateLimit-* headers present  

All systems operational! 🎉
