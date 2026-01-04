// Script to inject Firebase config into service worker
// Run this during build: node scripts/inject-firebase-config.js

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const swPath = path.join(__dirname, '../public/firebase-messaging-sw.js');
let swContent = fs.readFileSync(swPath, 'utf8');

// Replace empty strings with actual environment variables
swContent = swContent
  .replace('apiKey: ""', `apiKey: "${process.env.NEXT_PUBLIC_FIREBASE_API_KEY || ''}"`)
  .replace('authDomain: ""', `authDomain: "${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || ''}"`)
  .replace('projectId: ""', `projectId: "${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || ''}"`)
  .replace('storageBucket: ""', `storageBucket: "${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || ''}"`)
  .replace('messagingSenderId: ""', `messagingSenderId: "${process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || ''}"`)
  .replace('appId: ""', `appId: "${process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ''}"`);

fs.writeFileSync(swPath, swContent);
console.log('✅ Firebase config injected into service worker');
console.log('⚠️  Remember: Do not commit firebase-messaging-sw.js with real values!');
