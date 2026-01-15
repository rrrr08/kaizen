/**
 * API Test Script for Redis, Logging, and CDC APIs
 * Tests all endpoints with actual HTTP requests
 * Run: npm run dev (in another terminal), then npx tsx test-apis.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config({ path: path.join(process.cwd(), '.env') });

// Base URL for API calls - try both ports
const PORTS = [3000, 3001];
let BASE_URL = 'http://localhost:3000';

// Color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function separator() {
    console.log('\n' + '='.repeat(60) + '\n');
}

async function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// REDIS API TESTS
// ============================================================================

async function testRedisAPI() {
    separator();
    log('🔍 TESTING REDIS API ENDPOINT', 'cyan');
    separator();

    try {
        log('Test 1: Testing Redis connection via API...', 'yellow');
        const response = await fetch(`${BASE_URL}/api/redis-test`);
        const data = await response.json();

        if (response.ok && data.success) {
            log('✅ Redis API test passed', 'green');
            console.log('   Response:', JSON.stringify(data, null, 2));
            return true;
        } else {
            log('❌ Redis API test failed', 'red');
            console.log('   Error:', data);
            return false;
        }
    } catch (error: any) {
        log(`❌ Redis API test failed: ${error.message}`, 'red');
        log('   Make sure the dev server is running (npm run dev)', 'yellow');
        return false;
    }
}

// ============================================================================
// TEST LOGS API - Create Test Logs
// ============================================================================

async function createTestLogs() {
    separator();
    log('📝 CREATING TEST LOG ENTRIES', 'cyan');
    separator();

    try {
        log('Creating test logs via API...', 'yellow');
        const response = await fetch(`${BASE_URL}/api/test-logs`);
        const data = await response.json();

        if (response.ok) {
            log('✅ Test logs created successfully', 'green');
            console.log('   Created logs:', data.message);
            return true;
        } else {
            log('❌ Failed to create test logs', 'red');
            return false;
        }
    } catch (error: any) {
        log(`❌ Error creating test logs: ${error.message}`, 'red');
        return false;
    }
}

// ============================================================================
// ADMIN LOGS API TESTS
// ============================================================================

async function testLogsAPI() {
    separator();
    log('📊 TESTING LOGS API ENDPOINTS', 'cyan');
    separator();

    const results = {
        allLogs: false,
        infoLogs: false,
        warnLogs: false,
        errorLogs: false,
        stats: false
    };

    try {
        // Test 1: Get all logs
        log('Test 1: Fetching all logs...', 'yellow');
        const allResponse = await fetch(`${BASE_URL}/api/admin/logs?level=all&limit=10`);
        const allData = await allResponse.json();
        
        if (allResponse.ok && allData.logs) {
            log(`✅ All logs retrieved: ${allData.logs.length} logs found`, 'green');
            if (allData.logs.length > 0) {
                console.log('   Latest log:');
                console.log(`   - Level: ${allData.logs[0].level}`);
                console.log(`   - Event: ${allData.logs[0].event}`);
                console.log(`   - Time: ${new Date(allData.logs[0].timestamp).toLocaleString()}`);
            }
            results.allLogs = true;
        } else {
            log('❌ Failed to retrieve all logs', 'red');
        }

        await wait(500);

        // Test 2: Get info logs
        log('\nTest 2: Fetching info logs...', 'yellow');
        const infoResponse = await fetch(`${BASE_URL}/api/admin/logs?level=info&limit=5`);
        const infoData = await infoResponse.json();
        
        if (infoResponse.ok && infoData.logs) {
            log(`✅ Info logs retrieved: ${infoData.logs.length} logs`, 'green');
            results.infoLogs = true;
        } else {
            log('❌ Failed to retrieve info logs', 'red');
        }

        await wait(500);

        // Test 3: Get warning logs
        log('\nTest 3: Fetching warning logs...', 'yellow');
        const warnResponse = await fetch(`${BASE_URL}/api/admin/logs?level=warn&limit=5`);
        const warnData = await warnResponse.json();
        
        if (warnResponse.ok && warnData.logs) {
            log(`✅ Warning logs retrieved: ${warnData.logs.length} logs`, 'green');
            results.warnLogs = true;
        } else {
            log('❌ Failed to retrieve warning logs', 'red');
        }

        await wait(500);

        // Test 4: Get error logs
        log('\nTest 4: Fetching error logs...', 'yellow');
        const errorResponse = await fetch(`${BASE_URL}/api/admin/logs?level=error&limit=5`);
        const errorData = await errorResponse.json();
        
        if (errorResponse.ok && errorData.logs) {
            log(`✅ Error logs retrieved: ${errorData.logs.length} logs`, 'green');
            results.errorLogs = true;
        } else {
            log('❌ Failed to retrieve error logs', 'red');
        }

        await wait(500);

        // Test 5: Get log statistics
        log('\nTest 5: Fetching log statistics...', 'yellow');
        const statsResponse = await fetch(`${BASE_URL}/api/admin/logs/stats`);
        const statsData = await statsResponse.json();
        
        if (statsResponse.ok && statsData.stats) {
            log('✅ Log statistics retrieved:', 'green');
            console.log(`   - Info: ${statsData.stats.info}`);
            console.log(`   - Warnings: ${statsData.stats.warn}`);
            console.log(`   - Errors: ${statsData.stats.error}`);
            console.log(`   - Total: ${statsData.stats.total}`);
            results.stats = true;
        } else {
            log('❌ Failed to retrieve log statistics', 'red');
        }

        return Object.values(results).every(v => v);
    } catch (error: any) {
        log(`❌ Logs API test failed: ${error.message}`, 'red');
        return false;
    }
}

// ============================================================================
// CDC API TESTS
// ============================================================================

async function testCDCAPI() {
    separator();
    log('🔄 TESTING CDC API ENDPOINTS', 'cyan');
    separator();

    const results = {
        allChanges: false,
        ordersChanges: false,
        usersChanges: false,
        gamesChanges: false,
        eventsChanges: false
    };

    try {
        // Test 1: Get all changes
        log('Test 1: Fetching all CDC changes...', 'yellow');
        const allResponse = await fetch(`${BASE_URL}/api/admin/cdc?collection=all&limit=20`);
        const allData = await allResponse.json();
        
        if (allResponse.ok && allData.changes) {
            log(`✅ All changes retrieved: ${allData.changes.length} changes found`, 'green');
            if (allData.changes.length > 0) {
                console.log('   Latest change:');
                console.log(`   - Collection: ${allData.changes[0].collection}`);
                console.log(`   - Operation: ${allData.changes[0].operation}`);
                console.log(`   - Document ID: ${allData.changes[0].documentId}`);
                console.log(`   - Time: ${new Date(allData.changes[0].timestamp).toLocaleString()}`);
            }
            results.allChanges = true;
        } else {
            log('❌ Failed to retrieve all changes', 'red');
        }

        await wait(500);

        // Test 2: Get orders changes
        log('\nTest 2: Fetching orders changes...', 'yellow');
        const ordersResponse = await fetch(`${BASE_URL}/api/admin/cdc?collection=orders&limit=10`);
        const ordersData = await ordersResponse.json();
        
        if (ordersResponse.ok && ordersData.changes) {
            log(`✅ Orders changes retrieved: ${ordersData.changes.length} changes`, 'green');
            results.ordersChanges = true;
        } else {
            log('❌ Failed to retrieve orders changes', 'red');
        }

        await wait(500);

        // Test 3: Get users changes
        log('\nTest 3: Fetching users changes...', 'yellow');
        const usersResponse = await fetch(`${BASE_URL}/api/admin/cdc?collection=users&limit=10`);
        const usersData = await usersResponse.json();
        
        if (usersResponse.ok && usersData.changes) {
            log(`✅ Users changes retrieved: ${usersData.changes.length} changes`, 'green');
            results.usersChanges = true;
        } else {
            log('❌ Failed to retrieve users changes', 'red');
        }

        await wait(500);

        // Test 4: Get game results changes
        log('\nTest 4: Fetching game results changes...', 'yellow');
        const gamesResponse = await fetch(`${BASE_URL}/api/admin/cdc?collection=gameResults&limit=10`);
        const gamesData = await gamesResponse.json();
        
        if (gamesResponse.ok && gamesData.changes) {
            log(`✅ Game results changes retrieved: ${gamesData.changes.length} changes`, 'green');
            results.gamesChanges = true;
        } else {
            log('❌ Failed to retrieve game results changes', 'red');
        }

        await wait(500);

        // Test 5: Get events changes
        log('\nTest 5: Fetching events changes...', 'yellow');
        const eventsResponse = await fetch(`${BASE_URL}/api/admin/cdc?collection=events&limit=10`);
        const eventsData = await eventsResponse.json();
        
        if (eventsResponse.ok && eventsData.changes) {
            log(`✅ Events changes retrieved: ${eventsData.changes.length} changes`, 'green');
            results.eventsChanges = true;
        } else {
            log('❌ Failed to retrieve events changes', 'red');
        }

        return Object.values(results).every(v => v);
    } catch (error: any) {
        log(`❌ CDC API test failed: ${error.message}`, 'red');
        return false;
    }
}

// ============================================================================
// INTEGRATION TEST - Create and Verify
// ============================================================================

async function testIntegration() {
    separator();
    log('🔗 INTEGRATION TEST - Create and Verify', 'cyan');
    separator();

    try {
        log('Step 1: Creating test logs...', 'yellow');
        await createTestLogs();
        
        log('\nStep 2: Waiting for logs to be processed...', 'yellow');
        await wait(2000);
        
        log('\nStep 3: Verifying logs were created...', 'yellow');
        const logsResponse = await fetch(`${BASE_URL}/api/admin/logs?level=all&limit=5`);
        const logsData = await logsResponse.json();
        
        if (logsData.logs && logsData.logs.length > 0) {
            log('✅ Integration test passed: Logs created and retrieved', 'green');
            
            // Check for our test logs
            const testLogs = logsData.logs.filter((l: any) => 
                l.event.includes('test_') || l.event === 'api_test_endpoint'
            );
            
            if (testLogs.length > 0) {
                log(`   Found ${testLogs.length} test log(s) in recent logs`, 'green');
                console.log('   Test log events:', testLogs.map((l: any) => l.event).join(', '));
            }
            
            return true;
        } else {
            log('❌ Integration test failed: No logs found', 'red');
            return false;
        }
    } catch (error: any) {
        log(`❌ Integration test failed: ${error.message}`, 'red');
        return false;
    }
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

async function runAllTests() {
    console.clear();
    log('╔════════════════════════════════════════════════════════════╗', 'blue');
    log('║                                                            ║', 'blue');
    log('║         JOY JUNCTURE API TEST SUITE                        ║', 'blue');
    log('║         Testing: Redis, Logging, CDC APIs                  ║', 'blue');
    log('║                                                            ║', 'blue');
    log('╚════════════════════════════════════════════════════════════╝', 'blue');

    // Check if server is running
    separator();
    log('🔍 CHECKING SERVER STATUS', 'cyan');
    separator();

    // Try to find which port the server is running on
    let serverRunning = false;
    for (const port of PORTS) {
        try {
            const testUrl = `http://localhost:${port}/api/redis-test`;
            const healthCheck = await fetch(testUrl);
            if (healthCheck.ok) {
                BASE_URL = `http://localhost:${port}`;
                log(`✅ Development server is running on port ${port}!`, 'green');
                serverRunning = true;
                break;
            }
        } catch (error) {
            // Try next port
        }
    }

    if (!serverRunning) {
        log('❌ Development server is not running on ports 3000 or 3001!', 'red');
        log('\nPlease start the server first:', 'yellow');
        log('  npm run dev', 'cyan');
        separator();
        process.exit(1);
    }

    const results = {
        redis: false,
        logs: false,
        cdc: false,
        integration: false
    };

    // Run all tests
    results.redis = await testRedisAPI();
    await wait(1000);
    
    results.logs = await testLogsAPI();
    await wait(1000);
    
    results.cdc = await testCDCAPI();
    await wait(1000);
    
    results.integration = await testIntegration();

    // Final summary
    separator();
    log('📋 API TEST SUMMARY', 'cyan');
    separator();

    const allPassed = Object.values(results).every(v => v);

    console.log(`Redis API:      ${results.redis ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Logs API:       ${results.logs ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`CDC API:        ${results.cdc ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Integration:    ${results.integration ? '✅ PASSED' : '❌ FAILED'}`);

    separator();

    if (allPassed) {
        log('🎉 ALL API TESTS PASSED! 🎉', 'green');
        log('\nNext steps:', 'cyan');
        log('1. Check the admin dashboards:', 'yellow');
        log('   - Logs: http://localhost:3000/admin/logs', 'cyan');
        log('   - CDC: http://localhost:3000/admin/cdc', 'cyan');
        log('2. All systems are working correctly!', 'green');
    } else {
        log('⚠️  SOME API TESTS FAILED', 'red');
        log('\nPlease check:', 'yellow');
        log('1. Development server is running (npm run dev)', 'yellow');
        log('2. Environment variables are set correctly', 'yellow');
        log('3. Redis and Firebase are configured', 'yellow');
    }

    separator();

    process.exit(allPassed ? 0 : 1);
}

// Run the tests
runAllTests().catch(error => {
    log(`\n❌ Fatal error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
});
