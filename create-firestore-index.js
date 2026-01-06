#!/usr/bin/env node

/**
 * This script helps you create the required Firestore index for scheduled notifications
 * Run with: node create-firestore-index.js
 */

console.log('\n🔧 Firestore Index Setup for Scheduled Notifications\n');
console.log('═══════════════════════════════════════════════════\n');

console.log('You need to create a composite index in Firestore.\n');
console.log('📋 Index Configuration:');
console.log('   Collection: pushCampaigns');
console.log('   Field 1: status (Ascending)');
console.log('   Field 2: scheduledFor (Ascending)\n');

console.log('🔗 Direct Link to Create Index:');
console.log('   https://console.firebase.google.com/project/gwoc-e598b/firestore/indexes\n');

console.log('📝 Steps:');
console.log('   1. Click the link above');
console.log('   2. Click "Create Index" button');
console.log('   3. Set Collection ID: pushCampaigns');
console.log('   4. Add Field: status → Ascending');
console.log('   5. Add Field: scheduledFor → Ascending');
console.log('   6. Click "Create Index"');
console.log('   7. Wait 1-2 minutes for it to build\n');

console.log('✅ After index is created, run:');
console.log('   node scripts/process-scheduled-notifications.js\n');

console.log('═══════════════════════════════════════════════════\n');
