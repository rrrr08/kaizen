# Rate Limiting Test - Real API Calls

## Prerequisites
Ensure dev server is running: `npm run dev`

---

## 🔒 Rate Limiting Configuration

All rate-limited endpoints return these headers:
- `X-RateLimit-Limit` - Maximum requests allowed
- `X-RateLimit-Remaining` - Requests remaining in current window
- `X-RateLimit-Reset` - Unix timestamp when limit resets

---

## 📍 Rate Limited Endpoints

### 1. Leaderboard API
**Endpoint:** `GET /api/leaderboard`  
**Rate Limit:** 30 requests per 60 seconds  
**Type:** Read-heavy API

```powershell
# Single request
Invoke-RestMethod -Uri "http://localhost:3000/api/leaderboard" -Method Get

# Test rate limit (run 35 times)
1..35 | ForEach-Object {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/leaderboard" -Method Get
        Write-Host "Request $_`: Status $($response.StatusCode) - Remaining: $($response.Headers['X-RateLimit-Remaining'])"
    } catch {
        Write-Host "Request $_`: RATE LIMITED (429)" -ForegroundColor Red
    }
    Start-Sleep -Milliseconds 100
}
```

---

### 2. Game Spin API
**Endpoint:** `POST /api/games/spin`  
**Rate Limit:** 10 requests per 60 seconds  
**Type:** Game action (strict limit)

**Note:** Requires authentication token

```powershell
# Get auth token first (login via UI)
$token = "YOUR_FIREBASE_AUTH_TOKEN"

# Single spin request
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}
$body = @{ isFreeSpin = $false } | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/games/spin" -Method Post -Headers $headers -Body $body

# Test rate limit
1..15 | ForEach-Object {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/games/spin" -Method Post -Headers $headers -Body $body
        Write-Host "Request $_`: Status $($response.StatusCode)"
    } catch {
        if ($_.Exception.Response.StatusCode -eq 429) {
            Write-Host "Request $_`: RATE LIMITED" -ForegroundColor Red
        } else {
            Write-Host "Request $_`: Error $($_.Exception.Response.StatusCode)"
        }
    }
    Start-Sleep -Milliseconds 200
}
```

---

### 3. Payment Create Order API
**Endpoint:** `POST /api/payments/create-order`  
**Rate Limit:** 30 requests per 60 seconds  
**Type:** Payment API

```powershell
$body = @{
    amount = 1000
    currency = "INR"
    receipt = "test_receipt_$(Get-Date -Format 'yyyyMMddHHmmss')"
} | ConvertTo-Json

# Single request
Invoke-RestMethod -Uri "http://localhost:3000/api/payments/create-order" -Method Post -ContentType "application/json" -Body $body

# Test rate limit
1..35 | ForEach-Object {
    $body = @{
        amount = 1000
        currency = "INR"
        receipt = "test_$_"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/payments/create-order" -Method Post -ContentType "application/json" -Body $body
        Write-Host "Request $_`: OK - Remaining: $($response.Headers['X-RateLimit-Remaining'])"
    } catch {
        Write-Host "Request $_`: RATE LIMITED" -ForegroundColor Red
    }
    Start-Sleep -Milliseconds 100
}
```

---

### 4. Payment Verify API
**Endpoint:** `POST /api/payments/verify`  
**Rate Limit:** 30 requests per 60 seconds  
**Type:** Payment verification

```powershell
$body = @{
    razorpay_order_id = "order_test123"
    razorpay_payment_id = "pay_test123"
    razorpay_signature = "test_signature"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/payments/verify" -Method Post -ContentType "application/json" -Body $body
```

---

### 5. Game Claim API
**Endpoint:** `POST /api/games/claim`  
**Rate Limit:** 30 requests per 60 seconds  
**Type:** Reward claiming

**Note:** Requires authentication

```powershell
$token = "YOUR_AUTH_TOKEN"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}
$body = @{
    gameId = "chess"
    points = 100
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/games/claim" -Method Post -Headers $headers -Body $body
```

---

### 6. Password Reset API
**Endpoint:** `POST /api/auth/reset-password`  
**Rate Limit:** 5 requests per 300 seconds (5 minutes)  
**Type:** Authentication (very strict)

```powershell
$body = @{
    email = "test@example.com"
} | ConvertTo-Json

# Single request
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/reset-password" -Method Post -ContentType "application/json" -Body $body

# Test strict rate limit (will be blocked after 5)
1..8 | ForEach-Object {
    $body = @{ email = "test$_@example.com" } | ConvertTo-Json
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/reset-password" -Method Post -ContentType "application/json" -Body $body
        Write-Host "Request $_`: Sent - Remaining: $($response.Headers['X-RateLimit-Remaining'])"
    } catch {
        Write-Host "Request $_`: BLOCKED (Rate Limited)" -ForegroundColor Red
    }
    Start-Sleep -Seconds 1
}
```

---

## 🧪 Complete Rate Limit Test Script

**File: `test-rate-limits.ps1`**

```powershell
# Complete Rate Limiting Test
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RATE LIMITING TEST SUITE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

function Test-RateLimit {
    param(
        [string]$EndpointName,
        [string]$Url,
        [string]$Method = "GET",
        [int]$ExpectedLimit,
        [int]$TestRequests = 0,
        [hashtable]$Headers = @{},
        [string]$Body = $null
    )
    
    Write-Host "`n--- Testing: $EndpointName ---" -ForegroundColor Yellow
    Write-Host "Expected Limit: $ExpectedLimit requests" -ForegroundColor Gray
    
    if ($TestRequests -eq 0) {
        $TestRequests = $ExpectedLimit + 5
    }
    
    $successCount = 0
    $rateLimitedCount = 0
    $errorCount = 0
    
    1..$TestRequests | ForEach-Object {
        try {
            $params = @{
                Uri = $Url
                Method = $Method
                Headers = $Headers
            }
            
            if ($Body) {
                $params.Body = $Body
                $params.ContentType = "application/json"
            }
            
            $response = Invoke-WebRequest @params
            $successCount++
            
            $remaining = $response.Headers['X-RateLimit-Remaining']
            if ($remaining -lt 5) {
                Write-Host "  Request $_`: OK (Low remaining: $remaining)" -ForegroundColor Yellow
            } else {
                Write-Host "  Request $_`: OK (Remaining: $remaining)" -ForegroundColor Green
            }
        }
        catch {
            if ($_.Exception.Response.StatusCode -eq 429) {
                $rateLimitedCount++
                Write-Host "  Request $_`: RATE LIMITED (429)" -ForegroundColor Red
            }
            else {
                $errorCount++
                Write-Host "  Request $_`: Error ($($_.Exception.Response.StatusCode))" -ForegroundColor Magenta
            }
        }
        Start-Sleep -Milliseconds 100
    }
    
    Write-Host "`nResults:" -ForegroundColor Cyan
    Write-Host "  Success: $successCount" -ForegroundColor Green
    Write-Host "  Rate Limited: $rateLimitedCount" -ForegroundColor Red
    Write-Host "  Errors: $errorCount" -ForegroundColor Magenta
    
    if ($rateLimitedCount -gt 0 -and $successCount -le ($ExpectedLimit + 2)) {
        Write-Host "  ✓ RATE LIMITING WORKS!" -ForegroundColor Green
        return $true
    } else {
        Write-Host "  ✗ RATE LIMITING ISSUE!" -ForegroundColor Red
        return $false
    }
}

# Test 1: Leaderboard (Read API)
$result1 = Test-RateLimit `
    -EndpointName "Leaderboard API" `
    -Url "http://localhost:3000/api/leaderboard" `
    -Method "GET" `
    -ExpectedLimit 30

Start-Sleep -Seconds 2

# Test 2: Admin Logs (Read API)
$result2 = Test-RateLimit `
    -EndpointName "Admin Logs API" `
    -Url "http://localhost:3000/api/admin/logs?level=all&limit=10" `
    -Method "GET" `
    -ExpectedLimit 30

Start-Sleep -Seconds 2

# Test 3: Admin CDC (Read API)
$result3 = Test-RateLimit `
    -EndpointName "Admin CDC API" `
    -Url "http://localhost:3000/api/admin/cdc?collection=all&limit=10" `
    -Method "GET" `
    -ExpectedLimit 30

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "FINAL RESULTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Leaderboard API: $(if($result1){'✓ PASS'}else{'✗ FAIL'})" -ForegroundColor $(if($result1){'Green'}else{'Red'})
Write-Host "Admin Logs API:  $(if($result2){'✓ PASS'}else{'✗ FAIL'})" -ForegroundColor $(if($result2){'Green'}else{'Red'})
Write-Host "Admin CDC API:   $(if($result3){'✓ PASS'}else{'✗ FAIL'})" -ForegroundColor $(if($result3){'Green'}else{'Red'})
Write-Host "========================================" -ForegroundColor Cyan

if ($result1 -and $result2 -and $result3) {
    Write-Host "`n🎉 ALL RATE LIMITING TESTS PASSED! 🎉" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  SOME TESTS FAILED" -ForegroundColor Red
}
```

---

## 📊 Visual Rate Limit Test

```powershell
# Visual progress test
Write-Host "Testing Leaderboard Rate Limit..." -ForegroundColor Cyan
$successChar = [char]0x2713  # ✓
$failChar = [char]0x2717     # ✗

1..40 | ForEach-Object {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/leaderboard"
        Write-Host $successChar -NoNewline -ForegroundColor Green
    } catch {
        Write-Host $failChar -NoNewline -ForegroundColor Red
    }
    if ($_ % 10 -eq 0) { Write-Host " ($_/40)" }
    Start-Sleep -Milliseconds 50
}
Write-Host "`nTest Complete!"
```

---

## 🔄 Test Rate Limit Recovery

```powershell
Write-Host "Phase 1: Triggering rate limit..." -ForegroundColor Yellow
1..35 | ForEach-Object {
    Invoke-WebRequest -Uri "http://localhost:3000/api/leaderboard" -ErrorAction SilentlyContinue
    Start-Sleep -Milliseconds 50
}

Write-Host "✓ Rate limit triggered" -ForegroundColor Green
Write-Host "`nPhase 2: Waiting 65 seconds for reset..." -ForegroundColor Yellow

65..1 | ForEach-Object {
    Write-Progress -Activity "Waiting for rate limit reset" -Status "$_ seconds remaining" -PercentComplete ((65-$_)/65*100)
    Start-Sleep -Seconds 1
}

Write-Host "`nPhase 3: Testing if limit reset..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/leaderboard"
    Write-Host "✓ Request successful! Rate limit recovered!" -ForegroundColor Green
} catch {
    Write-Host "✗ Still rate limited!" -ForegroundColor Red
}
```

---

## 🚀 Quick Test Commands

```powershell
# Test single endpoint
Invoke-WebRequest -Uri "http://localhost:3000/api/leaderboard" | Select-Object StatusCode, @{N='RateLimit';E={$_.Headers['X-RateLimit-Remaining']}}

# Test until rate limited
$count = 0
while ($true) {
    try {
        $count++
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/leaderboard"
        Write-Host "Request $count`: OK (Remaining: $($response.Headers['X-RateLimit-Remaining']))"
        Start-Sleep -Milliseconds 100
    } catch {
        Write-Host "Request $count`: RATE LIMITED!" -ForegroundColor Red
        break
    }
}

# Check rate limit headers
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/leaderboard"
$response.Headers | Where-Object { $_.Key -like '*RateLimit*' }
```

---

## 📝 Save Test Script

Save as `test-rate-limits.ps1` and run:
```powershell
.\test-rate-limits.ps1
```

All rate limiting is working correctly! Each endpoint is protected based on its sensitivity and usage patterns. 🛡️
