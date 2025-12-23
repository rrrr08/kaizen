import {
  collection,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";

let db: any = null;

async function getDb() {
  if (!db) {
    const firebase = await import("@/lib/firebase");
    db = firebase.db;
  }
  return db;
}

export async function getAboutData() {
  try {
    const database = await getDb();
    const aboutCollection = collection(database, 'about');
    const snapshot = await getDocs(aboutCollection);

    if (snapshot.empty) {
      return null;
    }

    const docSnap = snapshot.docs[0];
    const data = docSnap.data() as any;

    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    };
  } catch (error) {
    console.error('Error getting about data', error);
    throw error;
  }
}

export async function getCommunityData() {
  try {
    // Get community settings/content
    const database = await getDb();
    const communityRef = doc(database, 'community', 'main');
    const snap = await getDoc(communityRef);

    if (!snap.exists()) {
      return null;
    }

    const data = snap.data() as any;
    return {
      id: snap.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    };
  } catch (error) {
    console.error("Error getting community data", error);
    throw error;
  }
}
