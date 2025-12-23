import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  increment,
  serverTimestamp,
} from "firebase/firestore";

export const registrationsCollection = collection(db, 'event_registrations');
export const eventsCollection = collection(db, 'events');

export async function registerForEvent(eventId: string, userId: string) {
  try {
    // Check if user is already registered
    const existingReg = query(
      registrationsCollection,
      where('eventId', '==', eventId),
      where('userId', '==', userId)
    );

    const existingSnapshot = await getDocs(existingReg);
    
    if (!existingSnapshot.empty) {
      return {
        success: false,
        waitlisted: false,
        message: 'You are already registered for this event',
        alreadyRegistered: true
      };
    }

    // Get event details
    const eventRef = doc(db, 'events', eventId);
    const eventSnap = await (async () => {
      const snap = await getDocs(
        query(eventsCollection, where(doc(db, 'events', eventId).path.split('/')[1], '==', eventId))
      );
      return snap.docs[0];
    })().catch(async () => {
      const snap = await getDocs(eventsCollection);
      return snap.docs.find((d: any) => d.id === eventId);
    });

    // Simpler approach - just get the event doc directly
    const eventDoc = await (async () => {
      try {
        const docRef = doc(db, 'events', eventId);
        const snap = await getDocs(
          query(collection(db, 'events'), where('__name__', '==', eventId))
        );
        if (!snap.empty) return snap.docs[0].data();
        return null;
      } catch {
        return null;
      }
    })();

    // Check capacity - determine if waitlisted
    const registrationCount = await getDocs(
      query(registrationsCollection, where('eventId', '==', eventId), where('status', '==', 'registered'))
    );

    let waitlisted = false;
    const capacity = eventDoc?.capacity || 50;

    if (registrationCount.size >= capacity) {
      waitlisted = true;
    }

    // Create registration record
    const registrationData = {
      eventId,
      userId,
      status: waitlisted ? 'waitlisted' : 'registered',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const regRef = await addDoc(registrationsCollection, registrationData);

    // Update event registered count if not waitlisted
    if (!waitlisted) {
      try {
        await updateDoc(doc(db, 'events', eventId), {
          registered: increment(1),
        });
      } catch (error) {
        console.error('Error updating event count:', error);
      }
    }

    return {
      success: true,
      waitlisted,
      message: waitlisted ? 'Added to waitlist' : 'Successfully registered',
      registrationId: regRef.id,
      eventId,
      userId,
    };
  } catch (error) {
    console.error('Error registering for event:', error);
    throw error;
  }
}

export async function getEventRegistrations(eventId: string) {
  try {
    const q = query(
      registrationsCollection,
      where('eventId', '==', eventId)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data() as any).createdAt?.toDate(),
      updatedAt: (doc.data() as any).updatedAt?.toDate(),
    }));
  } catch (error) {
    console.error('Error getting event registrations:', error);
    throw error;
  }
}

export async function getUserEventRegistrations(userId: string) {
  try {
    const q = query(
      registrationsCollection,
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data() as any).createdAt?.toDate(),
      updatedAt: (doc.data() as any).updatedAt?.toDate(),
    }));
  } catch (error) {
    console.error('Error getting user registrations:', error);
    throw error;
  }
}

export async function cancelRegistration(registrationId: string, eventId: string) {
  try {
    await updateDoc(doc(db, 'event_registrations', registrationId), {
      status: 'cancelled',
      updatedAt: serverTimestamp(),
    });

    // Decrement event registered count
    try {
      await updateDoc(doc(db, 'events', eventId), {
        registered: increment(-1),
      });
    } catch (error) {
      console.error('Error updating event count:', error);
    }

    return {
      success: true,
      message: 'Registration cancelled',
    };
  } catch (error) {
    console.error('Error cancelling registration:', error);
    throw error;
  }
}
