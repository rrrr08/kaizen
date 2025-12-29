
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function initializeFirebaseAdmin() {
    if (admin.apps.length > 0) {
        return;
    }

    try {
        if (process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
            const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT);
            // Fix private key formatting
            if (serviceAccount.private_key) {
                serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
            }
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: process.env.FIREBASE_DATABASE_URL,
            });
        } else {
            // Fallback to individual env vars
            const serviceAccount = {
                projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
                privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            };

            if (!serviceAccount.projectId || !serviceAccount.privateKey || !serviceAccount.clientEmail) {
                throw new Error('Missing FIREBASE_ADMIN_* environment variables');
            }

            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: process.env.FIREBASE_DATABASE_URL,
            });
        }
        console.log('✅ Firebase Admin initialized');
    } catch (error) {
        console.error('❌ Failed to initialize Firebase Admin:', error);
        process.exit(1);
    }
}


async function seedTestimonials() {
    console.log('🔧 Initializing Admin SDK...');
    initializeFirebaseAdmin();
    const db = admin.firestore();

    console.log('🌱 Starting testimonial seeding...');
    console.log('🔍 Checking database connection...');

    const mockTestimonials = [
        {
            name: 'Sarah M.',
            quote: 'Joy Juncture transformed our team building! We\'ve never laughed so hard together.',
            role: 'Corporate Team',
            image: 'https://picsum.photos/seed/person1/100/100',
            status: 'approved',
            createdAt: new Date(Date.now() - 10000000).toISOString()
        },
        {
            name: 'Marcus L.',
            quote: 'The games are exceptional quality and brought our entire family together.',
            role: 'Family Game Night',
            image: 'https://picsum.photos/seed/person2/100/100',
            status: 'approved',
            createdAt: new Date(Date.now() - 5000000).toISOString()
        },
        {
            name: 'Emily R.',
            quote: 'Best decision for our wedding reception. Every guest had a blast!',
            role: 'Wedding Reception',
            image: 'https://picsum.photos/seed/person3/100/100',
            status: 'approved',
            createdAt: new Date(Date.now() - 2000000).toISOString()
        },
        {
            name: 'David K.',
            quote: 'Amazing collection of rare board games. I found pieces I thought were lost to time.',
            role: 'Collector',
            image: 'https://picsum.photos/seed/person4/100/100',
            status: 'pending',
            createdAt: new Date().toISOString()
        },
        {
            name: 'Priya S.',
            quote: 'The staff was incredibly helpful in teaching us the rules. A truly welcoming space.',
            role: 'First Time Visitor',
            image: 'https://picsum.photos/seed/person5/100/100',
            status: 'pending',
            createdAt: new Date().toISOString()
        },
        {
            name: 'Rahul V.',
            quote: 'Too loud and crowded on weekends.',
            role: 'Visitor',
            image: 'https://picsum.photos/seed/person6/100/100',
            status: 'rejected',
            createdAt: new Date(Date.now() - 8000000).toISOString()
        }
    ];

    try {
        const testimonialsRef = db.collection('testimonials');
        console.log('📡 Fetching existing testimonials (timeout 15s)...');

        // Add a race with timeout
        const snapshot = await Promise.race([
            testimonialsRef.get(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout fetching testimonials - check your internet connection or VPN')), 15000))
        ]) as FirebaseFirestore.QuerySnapshot;

        console.log(`✅ Connection successful. Found ${snapshot.size} existing documents.`);

        const existingNames = new Set();
        snapshot.forEach((doc) => {
            existingNames.add(doc.data().name);
        });

        let addedCount = 0;
        for (const t of mockTestimonials) {
            if (!existingNames.has(t.name)) {
                console.log(`📝 Adding: ${t.name} (timeout 10s)...`);
                await Promise.race([
                    testimonialsRef.add(t),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout adding testimonial')), 10000))
                ]);
                console.log(`✅ Added: ${t.name}`);
                addedCount++;
            } else {
                console.log(`⏭️  Skipped (exists): ${t.name}`);
            }
        }

        console.log(`✨ Seeding complete! Added ${addedCount} new testimonials.`);
        process.exit(0);

    } catch (error) {
        console.error('❌ Error during seeding:', error);
        process.exit(1);
    }
}

seedTestimonials().catch((err) => {
    console.error('❌ Unhandled error:', err);
    process.exit(1);
});
