import {
  collection,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";

export async function getAboutData() {
  try {
    const database = await getFirebaseDb();
    const aboutCollection = collection(database, 'about');
    const snapshot = await getDocs(aboutCollection);

    if (snapshot.empty) {
      console.warn('No about data found in Firestore');
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
    console.error('Error getting about data:', error);
    throw error;
  }
}

export async function getCommunityData() {
  try {
    // Get community settings/content
    const database = await getFirebaseDb();
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
