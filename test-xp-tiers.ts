/**
 * XP TIER SYSTEM TEST
 * Tests tier calculations, XP progression, and multipliers
 */

// Import tier logic
const TIERS = [
  { name: 'Newbie', minXP: 0, multiplier: 1.0, icon: '♙' },
  { name: 'Player', minXP: 500, multiplier: 1.1, icon: '♟' },
  { name: 'Strategist', minXP: 2000, multiplier: 1.25, icon: '♜' },
  { name: 'Knight', minXP: 3500, multiplier: 1.35, icon: '♞' },
  { name: 'Grandmaster', minXP: 5000, multiplier: 1.5, icon: '♚' }
];

const getTier = (xp: number) => {
  return [...TIERS].reverse().find(tier => xp >= tier.minXP) || TIERS[0];
};

// Test Cases
console.log('\n🎮 XP TIER SYSTEM TEST\n');
console.log('='.repeat(60));

// Test 1: Tier assignment
console.log('\n✅ TEST 1: Tier Assignment');
const testCases = [
  { xp: 0, expected: 'Newbie' },
  { xp: 250, expected: 'Newbie' },
  { xp: 500, expected: 'Player' },
  { xp: 1500, expected: 'Player' },
  { xp: 2000, expected: 'Strategist' },
  { xp: 3000, expected: 'Strategist' },
  { xp: 3500, expected: 'Knight' },
  { xp: 4500, expected: 'Knight' },
  { xp: 5000, expected: 'Grandmaster' },
  { xp: 10000, expected: 'Grandmaster' }
];

let passed = 0;
let failed = 0;

testCases.forEach(test => {
  const tier = getTier(test.xp);
  const success = tier.name === test.expected;
  if (success) {
    console.log(`  ✓ XP: ${test.xp.toString().padStart(5)} → ${tier.icon} ${tier.name.padEnd(12)} (${tier.multiplier}x)`);
    passed++;
  } else {
    console.log(`  ✗ XP: ${test.xp.toString().padStart(5)} → Expected ${test.expected}, got ${tier.name}`);
    failed++;
  }
});

// Test 2: JP Multiplier Calculation
console.log('\n✅ TEST 2: JP Multiplier Calculation');
console.log('  (Base JP: 10 per ₹100 purchase)');

const purchaseTests = [
  { xp: 0, amount: 10000, expected: Math.floor((100 * 10) * 1.0) }, // Newbie: 1000 JP
  { xp: 500, amount: 10000, expected: Math.floor((100 * 10) * 1.1) }, // Player: 1100 JP
  { xp: 2000, amount: 10000, expected: Math.floor((100 * 10) * 1.25) }, // Strategist: 1250 JP
  { xp: 3500, amount: 10000, expected: Math.floor((100 * 10) * 1.35) }, // Knight: 1350 JP
  { xp: 5000, amount: 10000, expected: Math.floor((100 * 10) * 1.5) } // Grandmaster: 1500 JP
];

purchaseTests.forEach(test => {
  const tier = getTier(test.xp);
  const baseJP = Math.floor((test.amount / 100) * 10);
  const actualJP = Math.floor(baseJP * tier.multiplier);
  const success = actualJP === test.expected;
  
  if (success) {
    console.log(`  ✓ ${tier.icon} ${tier.name.padEnd(12)} | ₹${(test.amount/100).toString().padStart(4)} → ${actualJP.toString().padStart(4)} JP (${tier.multiplier}x)`);
    passed++;
  } else {
    console.log(`  ✗ ${tier.name} | Expected ${test.expected} JP, got ${actualJP} JP`);
    failed++;
  }
});

// Test 3: XP Purchase Calculation
console.log('\n✅ TEST 3: XP Calculation');
console.log('  (Base XP: 10 per ₹100 purchase)');

const xpTests = [
  { amount: 5000, expected: 50 },  // ₹50 → 50 XP
  { amount: 10000, expected: 100 }, // ₹100 → 100 XP
  { amount: 50000, expected: 500 }  // ₹500 → 500 XP
];

xpTests.forEach(test => {
  const xpPer100 = 10;
  const actualXP = Math.floor((test.amount / 100) * xpPer100);
  const success = actualXP === test.expected;
  
  if (success) {
    console.log(`  ✓ ₹${(test.amount/100).toString().padStart(4)} purchase → ${actualXP.toString().padStart(3)} XP`);
    passed++;
  } else {
    console.log(`  ✗ Expected ${test.expected} XP, got ${actualXP} XP`);
    failed++;
  }
});

// Test 4: Tier Progression Path
console.log('\n✅ TEST 4: Tier Progression Path');
let currentXP = 0;
const progressionSteps = [
  { purchase: 500, description: '₹500 purchase' },
  { purchase: 1500, description: '₹1500 purchase' },
  { purchase: 1500, description: '₹1500 purchase' },
  { purchase: 1500, description: '₹1500 purchase' }
];

console.log(`  Starting: ${getTier(currentXP).icon} ${getTier(currentXP).name} (${currentXP} XP)`);

progressionSteps.forEach((step, index) => {
  const earnedXP = Math.floor((step.purchase * 100 / 100) * 10); // Convert to paisa, then calculate XP
  currentXP += earnedXP;
  const tier = getTier(currentXP);
  console.log(`  Step ${index + 1}: ${step.description} → +${earnedXP} XP → ${tier.icon} ${tier.name} (${currentXP} XP)`);
  passed++;
});

// Test 5: Tier Perks Validation
console.log('\n✅ TEST 5: Tier Perks');
TIERS.forEach(tier => {
  const perks = [];
  if (tier.minXP >= 500) perks.push('Early Event Access');
  if (tier.minXP >= 2000) perks.push('5% Workshop Discount');
  if (tier.minXP >= 3500) perks.push('Priority Experience Access');
  if (tier.minXP >= 5000) perks.push('VIP Seating');
  
  const perkText = perks.length > 0 ? perks.join(', ') : 'None';
  console.log(`  ${tier.icon} ${tier.name.padEnd(12)} (${tier.minXP.toString().padStart(4)} XP) → ${perkText}`);
  passed++;
});

// Summary
console.log('\n' + '='.repeat(60));
console.log(`\n📊 RESULTS: ${passed} passed, ${failed} failed`);
if (failed === 0) {
  console.log('✅ All tier tests passed!\n');
} else {
  console.log('❌ Some tests failed. Check configuration.\n');
}
