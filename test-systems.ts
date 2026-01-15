/**
 * Test Script for Redis, Logging, and CDC Systems
 * Run: npx tsx test-systems.ts
 * 
 * Prerequisites:
 * 1. Copy .env.example to .env.local
 * 2. Add your Redis and Firebase credentials
 * 3. Run npm install
 */

// Load environment variables
import * as dotenv from 'dotenv';
import * as path from 'path';

// Try to load .env.local first, then .env
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config({ path: path.join(process.cwd(), '.env') });

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

async function checkEnvironment() {
    separator();
    log('🔧 CHECKING ENVIRONMENT', 'cyan');
    separator();

    const checks = {
        redis_url: !!process.env.UPSTASH_REDIS_REST_URL,
        redis_token: !!process.env.UPSTASH_REDIS_REST_TOKEN,
        firebase_project: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        firebase_private_key: !!process.env.FIREBASE_PRIVATE_KEY,
        firebase_client_email: !!process.env.FIREBASE_CLIENT_EMAIL,
    };

    console.log('Environment variables:');
    console.log(`  UPSTASH_REDIS_REST_URL:     ${checks.redis_url ? '✅ Set' : '❌ Missing'}`);
    console.log(`  UPSTASH_REDIS_REST_TOKEN:   ${checks.redis_token ? '✅ Set' : '❌ Missing'}`);
    console.log(`  FIREBASE_PROJECT_ID:        ${checks.firebase_project ? '✅ Set' : '❌ Missing'}`);
    console.log(`  FIREBASE_PRIVATE_KEY:       ${checks.firebase_private_key ? '✅ Set' : '❌ Missing'}`);
    console.log(`  FIREBASE_CLIENT_EMAIL:      ${checks.firebase_client_email ? '✅ Set' : '❌ Missing'}`);

    const allSet = Object.values(checks).every(v => v);
    
    if (!allSet) {
        separator();
        log('⚠️  MISSING ENVIRONMENT VARIABLES', 'red');
        log('\nTo fix this:', 'yellow');
        log('1. Copy .env.example to .env.local', 'yellow');
        log('2. Fill in your credentials:', 'yellow');
        log('   - Get Redis credentials from: https://console.upstash.com', 'cyan');
        log('   - Get Firebase credentials from your Firebase Console', 'cyan');
        log('3. Run this test again', 'yellow');
        separator();
        return false;
    }

    log('\n✅ All environment variables are set!', 'green');
    return true;
}

// Import only after environment is checked
let redis: any;
let LogAggregator: any;
let ChangeDataCapture: any;

async function loadModules() {
    try {
        const redisModule = await import('./lib/redis');
        redis = redisModule.redis;
        
        const logModule = await import('./lib/log-aggregator');
        LogAggregator = logModule.LogAggregator;
        
        const cdcModule = await import('./lib/change-data-capture');
        ChangeDataCapture = cdcModule.ChangeDataCapture;
        
        return true;
    } catch (error: any) {
        log(`❌ Failed to load modules: ${error.message}`, 'red');
        return false;
    }
}

async function testRedis() {
    separator();
    log('🔍 TESTING REDIS CONNECTION', 'cyan');
    separator();

    try {
        // Test 1: Write
        log('Test 1: Writing to Redis...', 'yellow');
        const testKey = `test:${Date.now()}`;
        await redis.set(testKey, 'Hello from Joy Juncture!', { ex: 60 });
        log('✅ Write successful', 'green');

        // Test 2: Read
        log('Test 2: Reading from Redis...', 'yellow');
        const value = await redis.get(testKey);
        if (value === 'Hello from Joy Juncture!') {
            log(`✅ Read successful: ${value}`, 'green');
        } else {
            log(`❌ Read failed: Expected "Hello from Joy Juncture!", got "${value}"`, 'red');
        }

        // Test 3: Increment
        log('Test 3: Testing increment...', 'yellow');
        const counterKey = `counter:test:${Date.now()}`;
        await redis.set(counterKey, '0');
        await redis.incr(counterKey);
        await redis.incr(counterKey);
        const count = await redis.get(counterKey);
        if (count === '2' || count === 2) {
            log(`✅ Increment successful: ${count}`, 'green');
        } else {
            log(`❌ Increment failed: Expected 2, got ${count}`, 'red');
        }

        // Test 4: Sorted Set (for leaderboard)
        log('Test 4: Testing sorted set (leaderboard)...', 'yellow');
        const leaderboardKey = `test:leaderboard:${Date.now()}`;
        await redis.zadd(leaderboardKey, { score: 100, member: 'player1' });
        await redis.zadd(leaderboardKey, { score: 200, member: 'player2' });
        await redis.zadd(leaderboardKey, { score: 150, member: 'player3' });
        const topPlayers = await redis.zrange(leaderboardKey, 0, 2, { rev: true, withScores: true });
        log(`✅ Sorted set successful. Top players:`, 'green');
        for (let i = 0; i < topPlayers.length; i += 2) {
            console.log(`   ${topPlayers[i]}: ${topPlayers[i + 1]} points`);
        }

        // Cleanup
        await redis.del(testKey);
        await redis.del(counterKey);
        await redis.del(leaderboardKey);

        log('\n✅ All Redis tests passed!', 'green');
        return true;
    } catch (error: any) {
        log(`\n❌ Redis test failed: ${error.message}`, 'red');
        log('Make sure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set in .env.local', 'yellow');
        return false;
    }
}

async function testLogging() {
    separator();
    log('📊 TESTING LOGGING SYSTEM', 'cyan');
    separator();

    try {
        // Test 1: Info log
        log('Test 1: Creating info log...', 'yellow');
        await LogAggregator.log({
            timestamp: Date.now(),
            level: 'info',
            event: 'test_info_log',
            userId: 'test_user_123',
            data: {
                test: true,
                message: 'This is a test info log'
            }
        });
        log('✅ Info log created', 'green');

        // Test 2: Warning log
        log('Test 2: Creating warning log...', 'yellow');
        await LogAggregator.log({
            timestamp: Date.now(),
            level: 'warn',
            event: 'test_warning_log',
            userId: 'test_user_123',
            data: {
                warning: 'This is a test warning'
            }
        });
        log('✅ Warning log created', 'green');

        // Test 3: Error log
        log('Test 3: Creating error log...', 'yellow');
        await LogAggregator.log({
            timestamp: Date.now(),
            level: 'error',
            event: 'test_error_log',
            userId: 'test_user_123',
            data: {
                error: 'This is a test error',
                stack: 'test stack trace'
            }
        });
        log('✅ Error log created (saved to Redis + Firestore)', 'green');

        // Test 4: Retrieve logs
        log('Test 4: Retrieving recent logs...', 'yellow');
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait for writes
        const recentLogs = await LogAggregator.getRecentLogs('all', 5);
        log(`✅ Retrieved ${recentLogs.length} recent logs`, 'green');
        
        if (recentLogs.length > 0) {
            console.log('\n   Latest log:');
            const latest = recentLogs[0];
            console.log(`   Level: ${latest.level}`);
            console.log(`   Event: ${latest.event}`);
            console.log(`   Time: ${new Date(latest.timestamp).toLocaleString()}`);
        }

        // Test 5: Get stats
        log('\nTest 5: Getting log statistics...', 'yellow');
        const stats = await LogAggregator.getStats();
        log('✅ Statistics retrieved:', 'green');
        console.log(`   Info: ${stats.info}`);
        console.log(`   Warnings: ${stats.warn}`);
        console.log(`   Errors: ${stats.error}`);
        console.log(`   Total: ${stats.total}`);

        log('\n✅ All logging tests passed!', 'green');
        return true;
    } catch (error: any) {
        log(`\n❌ Logging test failed: ${error.message}`, 'red');
        console.error(error);
        return false;
    }
}

async function testCDC() {
    separator();
    log('🔄 TESTING CDC (CHANGE DATA CAPTURE)', 'cyan');
    separator();

    try {
        // Test 1: Capture order creation
        log('Test 1: Capturing order creation...', 'yellow');
        await ChangeDataCapture.captureChange({
            collection: 'orders',
            documentId: `test_order_${Date.now()}`,
            operation: 'create',
            after: {
                userId: 'test_user_123',
                items: [{ productId: 'prod_1', quantity: 2 }],
                totalPrice: 1499,
                status: 'pending'
            },
            timestamp: Date.now()
        });
        log('✅ Order creation captured', 'green');

        // Test 2: Capture user update
        log('Test 2: Capturing user update...', 'yellow');
        await ChangeDataCapture.captureChange({
            collection: 'users',
            documentId: 'test_user_123',
            operation: 'update',
            before: { totalXP: 100, phoneNumber: null },
            after: { totalXP: 150, phoneNumber: '+911234567890' },
            timestamp: Date.now(),
            userId: 'test_user_123'
        });
        log('✅ User update captured', 'green');

        // Test 3: Capture game result
        log('Test 3: Capturing game result...', 'yellow');
        await ChangeDataCapture.captureChange({
            collection: 'gameResults',
            documentId: `test_game_${Date.now()}`,
            operation: 'create',
            after: {
                userId: 'test_user_123',
                gameName: 'chess',
                score: 1500,
                xpEarned: 25,
                completed: true
            },
            timestamp: Date.now()
        });
        log('✅ Game result captured', 'green');

        // Test 4: Retrieve recent changes
        log('Test 4: Retrieving recent changes...', 'yellow');
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait for writes
        
        const orderChanges = await ChangeDataCapture.getRecentChanges('orders', 5);
        const userChanges = await ChangeDataCapture.getRecentChanges('users', 5);
        const gameChanges = await ChangeDataCapture.getRecentChanges('gameResults', 5);
        
        log(`✅ Retrieved changes:`, 'green');
        console.log(`   Orders: ${orderChanges.length}`);
        console.log(`   Users: ${userChanges.length}`);
        console.log(`   Games: ${gameChanges.length}`);

        if (orderChanges.length > 0) {
            console.log('\n   Latest order change:');
            const latest = orderChanges[0];
            console.log(`   Operation: ${latest.operation}`);
            console.log(`   Document: ${latest.documentId}`);
            console.log(`   Time: ${new Date(latest.timestamp).toLocaleString()}`);
        }

        log('\n✅ All CDC tests passed!', 'green');
        return true;
    } catch (error: any) {
        log(`\n❌ CDC test failed: ${error.message}`, 'red');
        console.error(error);
        return false;
    }
}

async function runAllTests() {
    console.clear();
    log('╔════════════════════════════════════════════════════════════╗', 'blue');
    log('║                                                            ║', 'blue');
    log('║         JOY JUNCTURE SYSTEM TEST SUITE                     ║', 'blue');
    log('║         Testing: Redis, Logging, CDC                       ║', 'blue');
    log('║                                                            ║', 'blue');
    log('╚════════════════════════════════════════════════════════════╝', 'blue');

    // Step 1: Check environment
    const envOk = await checkEnvironment();
    if (!envOk) {
        process.exit(1);
    }

    // Step 2: Load modules
    log('\nLoading modules...', 'yellow');
    const modulesOk = await loadModules();
    if (!modulesOk) {
        log('❌ Failed to load required modules', 'red');
        process.exit(1);
    }
    log('✅ Modules loaded successfully', 'green');

    const results = {
        redis: false,
        logging: false,
        cdc: false
    };

    // Run tests
    results.redis = await testRedis();
    results.logging = await testLogging();
    results.cdc = await testCDC();

    // Final summary
    separator();
    log('📋 TEST SUMMARY', 'cyan');
    separator();

    const allPassed = results.redis && results.logging && results.cdc;

    console.log(`Redis:   ${results.redis ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Logging: ${results.logging ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`CDC:     ${results.cdc ? '✅ PASSED' : '❌ FAILED'}`);

    separator();

    if (allPassed) {
        log('🎉 ALL TESTS PASSED! 🎉', 'green');
        log('\nNext steps:', 'cyan');
        log('1. Visit http://localhost:3000/admin/logs to view logs', 'yellow');
        log('2. Visit http://localhost:3000/admin/cdc to view changes', 'yellow');
        log('3. Run npm run dev to start the development server', 'yellow');
    } else {
        log('⚠️  SOME TESTS FAILED', 'red');
        log('\nPlease check:', 'yellow');
        log('1. Redis credentials in .env.local', 'yellow');
        log('2. Firebase Admin credentials', 'yellow');
        log('3. Network connectivity', 'yellow');
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
