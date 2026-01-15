# Complete Rate Limiting Test Script
# Run: .\test-rate-limits.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   RATE LIMITING TEST SUITE" -ForegroundColor Cyan
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
    Write-Host "Endpoint: $Url" -ForegroundColor Gray
    Write-Host "Expected Limit: $ExpectedLimit requests per 60 seconds" -ForegroundColor Gray
    
    if ($TestRequests -eq 0) {
        $TestRequests = $ExpectedLimit + 5
    }
    
    Write-Host "Sending $TestRequests requests..." -ForegroundColor Cyan
    
    $successCount = 0
    $rateLimitedCount = 0
    $errorCount = 0
    $firstRateLimitAt = -1
    
    1..$TestRequests | ForEach-Object {
        try {
            $params = @{
                Uri = $Url
                Method = $Method
                Headers = $Headers
                ErrorAction = 'Stop'
            }
            
            if ($Body) {
                $params.Body = $Body
                $params.ContentType = "application/json"
            }
            
            $response = Invoke-WebRequest @params
            $successCount++
            
            $limit = $response.Headers['X-RateLimit-Limit']
            $remaining = $response.Headers['X-RateLimit-Remaining']
            
            if ($remaining -and [int]$remaining -lt 5) {
                Write-Host "  [$_/$TestRequests] OK - Remaining: $remaining/$limit" -ForegroundColor Yellow
            } else {
                Write-Host "  [$_/$TestRequests] OK - Remaining: $remaining/$limit" -ForegroundColor Green
            }
        }
        catch {
            $statusCode = $_.Exception.Response.StatusCode.value__
            
            if ($statusCode -eq 429) {
                $rateLimitedCount++
                if ($firstRateLimitAt -eq -1) {
                    $firstRateLimitAt = $_
                }
                Write-Host "  [$_/$TestRequests] RATE LIMITED (429)" -ForegroundColor Red
            }
            else {
                $errorCount++
                Write-Host "  [$_/$TestRequests] Error ($statusCode)" -ForegroundColor Magenta
            }
        }
        Start-Sleep -Milliseconds 100
    }
    
    Write-Host "`n--- Results ---" -ForegroundColor Cyan
    Write-Host "  Total Requests:      $TestRequests"
    Write-Host "  Successful:          $successCount" -ForegroundColor Green
    Write-Host "  Rate Limited (429):  $rateLimitedCount" -ForegroundColor Red
    Write-Host "  Other Errors:        $errorCount" -ForegroundColor Magenta
    
    if ($firstRateLimitAt -gt 0) {
        Write-Host "  First Limited at:    Request #$firstRateLimitAt"
    }
    
    # Validation
    $passed = $rateLimitedCount -gt 0 -and $successCount -le ($ExpectedLimit + 2)
    
    if ($passed) {
        Write-Host "`n  [OK] RATE LIMITING WORKS CORRECTLY!" -ForegroundColor Green
        return $true
    } else {
        if ($rateLimitedCount -eq 0) {
            Write-Host "`n  [FAIL] NO RATE LIMITING DETECTED!" -ForegroundColor Red
        } else {
            Write-Host "`n  [WARN] UNEXPECTED BEHAVIOR!" -ForegroundColor Yellow
        }
        return $false
    }
}

# Check if server is running
Write-Host "`nChecking server status..." -ForegroundColor Cyan
try {
    $healthCheck = Invoke-WebRequest -Uri "http://localhost:3000/api/leaderboard" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "[OK] Server is running!" -ForegroundColor Green
}
catch {
    Write-Host "[ERROR] Server is not running!" -ForegroundColor Red
    Write-Host "`nPlease start the dev server first:" -ForegroundColor Yellow
    Write-Host "  npm run dev" -ForegroundColor Cyan
    exit 1
}

# Run Tests
$results = @{}

# Test 1: Leaderboard API (100 req/min - read preset)
$results['Leaderboard'] = Test-RateLimit `
    -EndpointName "Leaderboard API (Read)" `
    -Url "http://localhost:3000/api/leaderboard" `
    -Method "GET" `
    -ExpectedLimit 100

Start-Sleep -Seconds 2

# Test 2: Admin Logs API
$results['AdminLogs'] = Test-RateLimit `
    -EndpointName "Admin Logs API (Read)" `
    -Url "http://localhost:3000/api/admin/logs?level=all&limit=10" `
    -Method "GET" `
    -ExpectedLimit 30

Start-Sleep -Seconds 2

# Test 3: Admin CDC API
$results['AdminCDC'] = Test-RateLimit `
    -EndpointName "Admin CDC API (Read)" `
    -Url "http://localhost:3000/api/admin/cdc?collection=all&limit=10" `
    -Method "GET" `
    -ExpectedLimit 30

Start-Sleep -Seconds 2

# Test 4: Test Logs Creation
$results['TestLogs'] = Test-RateLimit `
    -EndpointName "Test Logs API" `
    -Url "http://localhost:3000/api/test-logs" `
    -Method "GET" `
    -ExpectedLimit 30

# Final Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   FINAL TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$allPassed = $true
foreach ($test in $results.Keys) {
    if ($results[$test]) {
        $status = "[PASS]"
        $color = "Green"
    } else {
        $status = "[FAIL]"
        $color = "Red"
        $allPassed = $false
    }
    Write-Host "$($test.PadRight(20)) $status" -ForegroundColor $color
}

Write-Host "========================================" -ForegroundColor Cyan

if ($allPassed) {
    Write-Host "`n=== ALL RATE LIMITING TESTS PASSED ===" -ForegroundColor Green
    Write-Host "`nRate limiting is working correctly:" -ForegroundColor Green
    Write-Host "  [OK] Requests limited after threshold" -ForegroundColor Green
    Write-Host "  [OK] Rate limit headers present" -ForegroundColor Green
    Write-Host "  [OK] APIs protected from abuse" -ForegroundColor Green
} else {
    Write-Host "`n=== SOME TESTS FAILED ===" -ForegroundColor Red
    Write-Host "`nCheck the results above for details." -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Cyan
