
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import * as dotenv from 'dotenv';
dotenv.config();

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkContent() {
    console.log("Checking 'content/about'...");
    try {
        const docRef = doc(db, 'content', 'about');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            console.log("Document/About exists!");
            console.log(JSON.stringify(docSnap.data(), null, 2));
        } else {
            console.log("Document/About DOES NOT exist.");
        }
    } catch (error) {
        console.error("Error reading document:", error);
    }
}

checkContent();
