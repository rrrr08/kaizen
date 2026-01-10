const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}

const db = admin.firestore();

async function findAndRemovePhoneVerification(phoneNumber) {
    try {
        console.log(`\n🔍 Searching for phone number: ${phoneNumber}`);

        // Find all users with this phone number
        const usersSnapshot = await db.collection('users')
            .where('phoneNumber', '==', phoneNumber)
            .get();

        if (usersSnapshot.empty) {
            console.log('❌ No users found with this phone number');
            return;
        }

        console.log(`\n📱 Found ${usersSnapshot.size} user(s) with this phone number:\n`);

        for (const doc of usersSnapshot.docs) {
            const userData = doc.data();
            console.log(`User ID: ${doc.id}`);
            console.log(`  Email: ${userData.email || 'N/A'}`);
            console.log(`  Name: ${userData.name || 'N/A'}`);
            console.log(`  Phone: ${userData.phoneNumber}`);
            console.log(`  Phone Verified: ${userData.phoneVerified}`);
            console.log(`  Role: ${userData.role || 'user'}`);
            console.log('');
        }

        // Remove phone verification from all users
        console.log('🧹 Removing phone verification...\n');

        const batch = db.batch();

        for (const doc of usersSnapshot.docs) {
            batch.update(doc.ref, {
                phoneNumber: admin.firestore.FieldValue.delete(),
                phoneVerified: false,
                phoneUpdatedAt: admin.firestore.FieldValue.delete()
            });
            console.log(`✅ Removed phone verification from user: ${doc.id}`);
        }

        await batch.commit();
        console.log('\n✨ Successfully removed phone verification from all users!');
        console.log('You can now verify this phone number with any account.\n');

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Get phone number from command line or use default
const phoneNumber = process.argv[2] || '+919408569457';

console.log('╔════════════════════════════════════════════╗');
console.log('║   Phone Verification Cleanup Script       ║');
console.log('╚════════════════════════════════════════════╝');

findAndRemovePhoneVerification(phoneNumber)
    .then(() => {
        console.log('Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
