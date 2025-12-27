/**
 * API Endpoint Testing Script
 * Run with: node test-api-endpoints.js
 * 
 * Tests all game-related API endpoints
 */

const BASE_URL = 'http://localhost:3001';

// You need to replace this with a real Firebase Auth token
const AUTH_TOKEN = 'YOUR_FIREBASE_AUTH_TOKEN_HERE';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(name, method, url, body = null, requiresAuth = false) {
  log(`\n🧪 Testing: ${name}`, 'cyan');
  log(`   ${method} ${url}`, 'blue');
  
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (requiresAuth) {
      options.headers['Authorization'] = `Bearer ${AUTH_TOKEN}`;
    }

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (response.ok) {
      log(`   ✅ SUCCESS (${response.status})`, 'green');
      log(`   Response: ${JSON.stringify(data).substring(0, 100)}...`);
      return { success: true, data };
    } else {
      log(`   ❌ FAILED (${response.status})`, 'red');
      log(`   Error: ${JSON.stringify(data)}`);
      return { success: false, error: data };
    }
  } catch (error) {
    log(`   ❌ NETWORK ERROR`, 'red');
    log(`   ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  log('═══════════════════════════════════════════════', 'yellow');
  log('   API ENDPOINT TESTING SUITE', 'yellow');
  log('═══════════════════════════════════════════════', 'yellow');

  const results = {
    passed: 0,
    failed: 0,
  };

  // ============================================
  // GAME SETTINGS ENDPOINTS
  // ============================================
  log('\n\n📋 GAME SETTINGS ENDPOINTS', 'yellow');
  
  let result = await testEndpoint(
    'Get Game Settings',
    'GET',
    `${BASE_URL}/api/games/settings`
  );
  result.success ? results.passed++ : results.failed++;

  result = await testEndpoint(
    'Update Game Settings',
    'POST',
    `${BASE_URL}/api/games/settings`,
    {
      gameId: 'riddle',
      name: 'Riddle Game',
      basePoints: 15,
      retryPenalty: 2,
      maxRetries: 3,
      scratcher: { enabled: true }
    },
    true
  );
  result.success ? results.passed++ : results.failed++;

  // ============================================
  // GAME OF THE DAY ENDPOINTS
  // ============================================
  log('\n\n🎮 GAME OF THE DAY ENDPOINTS', 'yellow');
  
  result = await testEndpoint(
    'Get Game of the Day',
    'GET',
    `${BASE_URL}/api/games/game-of-the-day`
  );
  result.success ? results.passed++ : results.failed++;

  result = await testEndpoint(
    'Set Game of the Day',
    'POST',
    `${BASE_URL}/api/games/game-of-the-day`,
    {
      gameId: 'riddle',
      gameName: 'Riddle Game'
    },
    true
  );
  result.success ? results.passed++ : results.failed++;

  // ============================================
  // ROTATION POLICY ENDPOINTS
  // ============================================
  log('\n\n🔄 ROTATION POLICY ENDPOINTS', 'yellow');
  
  result = await testEndpoint(
    'Get Rotation Policy',
    'GET',
    `${BASE_URL}/api/games/rotation-policy`
  );
  result.success ? results.passed++ : results.failed++;

  result = await testEndpoint(
    'Update Rotation Policy',
    'POST',
    `${BASE_URL}/api/games/rotation-policy`,
    {
      enabled: true,
      gamesPerDay: 5
    },
    true
  );
  result.success ? results.passed++ : results.failed++;

  result = await testEndpoint(
    'Manual Rotation',
    'PUT',
    `${BASE_URL}/api/games/rotation-policy`,
    null,
    true
  );
  result.success ? results.passed++ : results.failed++;

  // ============================================
  // GAME CONTENT ENDPOINTS
  // ============================================
  log('\n\n💾 GAME CONTENT ENDPOINTS', 'yellow');
  
  result = await testEndpoint(
    'Get Riddle Content',
    'GET',
    `${BASE_URL}/api/games/content?gameId=riddle`
  );
  result.success ? results.passed++ : results.failed++;

  result = await testEndpoint(
    'Get Trivia Content',
    'GET',
    `${BASE_URL}/api/games/content?gameId=trivia`
  );
  result.success ? results.passed++ : results.failed++;

  result = await testEndpoint(
    'Initialize Content',
    'POST',
    `${BASE_URL}/api/games/content/initialize`,
    null,
    true
  );
  result.success ? results.passed++ : results.failed++;

  result = await testEndpoint(
    'Update Game Content',
    'POST',
    `${BASE_URL}/api/games/content`,
    {
      gameId: 'riddle',
      content: {
        items: [
          {
            id: 'test_riddle',
            question: 'Test riddle?',
            answer: 'test',
            hint: 'It is a test'
          }
        ]
      }
    },
    true
  );
  result.success ? results.passed++ : results.failed++;

  // ============================================
  // GAME AWARD ENDPOINTS
  // ============================================
  log('\n\n🏆 GAME AWARD ENDPOINTS', 'yellow');
  
  result = await testEndpoint(
    'Award Points',
    'POST',
    `${BASE_URL}/api/games/award`,
    {
      gameId: 'riddle',
      retry: 0,
      level: 'easy'
    },
    true
  );
  result.success ? results.passed++ : results.failed++;

  // ============================================
  // GAME HISTORY ENDPOINTS
  // ============================================
  log('\n\n📊 GAME HISTORY ENDPOINTS', 'yellow');
  
  result = await testEndpoint(
    'Get Game History',
    'GET',
    `${BASE_URL}/api/games/history?gameId=riddle`,
    null,
    true
  );
  result.success ? results.passed++ : results.failed++;

  // ============================================
  // EVENTS ENDPOINTS
  // ============================================
  log('\n\n📅 EVENTS ENDPOINTS', 'yellow');
  
  result = await testEndpoint(
    'Get Upcoming Events',
    'GET',
    `${BASE_URL}/api/events?status=upcoming`
  );
  result.success ? results.passed++ : results.failed++;

  result = await testEndpoint(
    'Get Past Events',
    'GET',
    `${BASE_URL}/api/events?status=past`
  );
  result.success ? results.passed++ : results.failed++;

  // ============================================
  // SUMMARY
  // ============================================
  log('\n\n═══════════════════════════════════════════════', 'yellow');
  log('   TEST SUMMARY', 'yellow');
  log('═══════════════════════════════════════════════', 'yellow');
  log(`\n✅ Passed: ${results.passed}`, 'green');
  log(`❌ Failed: ${results.failed}`, 'red');
  log(`📊 Total: ${results.passed + results.failed}`, 'blue');
  log(`\n📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`, 'cyan');
  
  if (results.failed === 0) {
    log('\n🎉 ALL TESTS PASSED!', 'green');
  } else {
    log('\n⚠️  SOME TESTS FAILED - Check logs above', 'yellow');
  }
  
  log('\n═══════════════════════════════════════════════\n', 'yellow');
}

// Run the tests
log('\n🚀 Starting API tests...', 'cyan');
log('⚠️  Make sure the server is running on http://localhost:3001', 'yellow');
log('⚠️  Update AUTH_TOKEN in this file with a valid Firebase token\n', 'yellow');

runTests().catch(console.error);
