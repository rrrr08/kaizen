import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";

export async function getEvents(filters:{status:'upcoming' | 'past'}) {
  try {
    const database = await getFirebaseDb();
    const eventsCollection = collection(database, 'events');
    let q = query(
      eventsCollection,
      where('status', '==', filters.status),
      orderBy('datetime', filters.status === 'past' ? 'desc' : 'asc')
    );

    const snapshot = await getDocs(q);

    const events = snapshot.docs.map(docSnap => {
      const data = docSnap.data();

      return {
        id: docSnap.id,
        ...data,
        datetime: data.datetime?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      };
    });

    return events;
  } catch (error) {
    console.error('Error getting events', error);
    throw error;
  }
}

export async function getEventById(eventId: string) {
    try{
        const database = await getFirebaseDb();
        const ref = doc(database, "events", eventId);
        const snap = await getDoc(ref);

        if(!snap.exists()) {
            return null;
        }

        const data = snap.data();

        return {
            id: snap.id,
            ...data,
            datetime: data.datetime?.toDate(),
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
        };
    } catch (error) {
    console.error("Error getting event by id", error);
    throw error;
  }
}