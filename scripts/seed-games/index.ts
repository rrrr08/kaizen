
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env.local or .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
if (!process.env.FIREBASE_DATABASE_URL) {
    dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}

// Initialize Firebase Admin
if (!admin.apps.length) {
    try {
        if (process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
            const serviceAccountJson = JSON.parse(process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT);
            if (serviceAccountJson.private_key) {
                serviceAccountJson.private_key = serviceAccountJson.private_key.replace(/\\n/g, '\n');
            }
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccountJson),
            });
        } else {
            console.log("No FIREBASE_ADMIN_SERVICE_ACCOUNT found, checking individual vars...");
            // Fallback to individual environment variables
            const serviceAccount = {
                type: process.env.FIREBASE_ADMIN_TYPE || 'service_account',
                project_id: process.env.FIREBASE_ADMIN_PROJECT_ID,
                private_key_id: process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID,
                private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
                client_id: process.env.FIREBASE_ADMIN_CLIENT_ID,
                auth_uri: process.env.FIREBASE_ADMIN_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
                token_uri: process.env.FIREBASE_ADMIN_TOKEN_URI || 'https://oauth2.googleapis.com/token',
                auth_provider_x509_cert_url: process.env.FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
                client_x509_cert_url: process.env.FIREBASE_ADMIN_CLIENT_X509_CERT_URL,
            };

            if (serviceAccount.project_id && serviceAccount.private_key && serviceAccount.client_email) {
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount as any),
                });
            } else {
                console.log("Individual vars missing, trying default credentials...");
                admin.initializeApp({
                    credential: admin.credential.applicationDefault()
                });
            }
        }
    } catch (error) {
        console.error('Failed to initialize admin:', error);
        process.exit(1);
    }
}

const db = admin.firestore();

interface GameData {
    name: string;
    subtitle: string;
    price: number | null;
    description: string;
    images: string[];
    players: string;
    age: string;
    features: { title: string; description: string }[];
    howToPlay: { title: string; description: string }[];
}

const parsePlayers = (playerStr: string) => {
    // "3-20" -> { min: 3, max: 20 }
    // "2-4 (2v2 teams)" -> { min: 2, max: 4 }
    // "1-99+" -> { min: 1, max: 99 }
    // "1-5" -> { min: 1, max: 5 }

    const nums = playerStr.match(/(\d+)/g);
    if (!nums) return { minPlayers: 1, maxPlayers: 10 }; // default

    if (nums.length === 1) {
        return { minPlayers: parseInt(nums[0]), maxPlayers: parseInt(nums[0]) };
    }

    return { minPlayers: parseInt(nums[0]), maxPlayers: parseInt(nums[1]) };
};

const main = async () => {
    const dataPath = path.join(process.cwd(), 'scripts/seed-games/games-data.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const games: GameData[] = JSON.parse(rawData);

    console.log(`Found ${games.length} games to import...`);

    const batch = db.batch();
    const collectionRef = db.collection('products');

    for (const game of games) {
        console.log(`Preparing ${game.name}...`);

        // Check if exists
        const snapshot = await collectionRef.where('name', '==', game.name).get();
        let docRef;

        if (!snapshot.empty) {
            console.log(`  - Updating existing game: ${game.name}`);
            docRef = snapshot.docs[0].ref;
        } else {
            console.log(`  - Creating new game: ${game.name}`);
            docRef = collectionRef.doc();
        }

        const { minPlayers, maxPlayers } = parsePlayers(game.players);

        const productData: any = {
            name: game.name,
            subtitle: game.subtitle,
            description: game.description,
            price: game.price || 0,
            salePrice: game.price,
            images: game.images,
            minPlayers,
            maxPlayers,
            ageGroup: game.age,
            features: game.features,
            howToPlay: game.howToPlay,
            categoryId: 'games',
            stock: 100,
            isActive: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        // We intentionally don't overwrite ID or createdAt if update
        if (!snapshot.empty) {
            delete productData.createdAt;
        }

        batch.set(docRef, productData, { merge: true });
    }

    await batch.commit();
    console.log('Seeding complete!');
};

main().catch(err => {
    console.error(err);
    process.exit(1);
});
