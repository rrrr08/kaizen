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
import { getFirebaseDb } from "@/lib/firebase";

export async function registerForEvent(eventId: string, userId: string) {
  try {
    const database = await getFirebaseDb();
    const registrationsCollection = collection(database, 'event_registrations');
    const eventsCollection = collection(database, 'events');
    
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

    // Get event details - simpler approach
    const eventDoc = await getDocs(
      query(eventsCollection, where('__name__', '==', eventId))
    ).then(snap => {
      if (!snap.empty) return snap.docs[0].data();
      return null;
    }).catch(() => null);

    // Check capacity - prevent registration if at capacity
    const registrationCount = await getDocs(
      query(registrationsCollection, where('eventId', '==', eventId), where('status', '==', 'registered'))
    );

    const capacity = eventDoc?.capacity || 50;

    if (registrationCount.size >= capacity) {
      return {
        success: false,
        waitlisted: false,
        message: 'Event is at full capacity',
        fullCapacity: true
      };
    }

    // Create registration record
    const registrationData = {
      eventId,
      userId,
      status: 'registered',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const regRef = await addDoc(registrationsCollection, registrationData);

    // Update event registered count
    try {
      await updateDoc(doc(database, 'events', eventId), {
        registered: increment(1),
      });
    } catch (error) {
      console.error('Error updating event count:', error);
    }

    return {
      success: true,
      waitlisted: false,
      message: 'Successfully registered',
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
    const database = await getFirebaseDb();
    const registrationsCollection = collection(database, 'event_registrations');
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
    const database = await getFirebaseDb();
    const registrationsCollection = collection(database, 'event_registrations');
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
    const database = await getFirebaseDb();
    
    // Get current registration status
    const regDoc = await getDocs(query(
      collection(database, 'event_registrations'),
      where('__name__', '==', registrationId)
    ));
    
    if (regDoc.empty) {
      throw new Error('Registration not found');
    }
    
    const currentStatus = regDoc.docs[0].data().status;
    
    await updateDoc(doc(database, 'event_registrations', registrationId), {
      status: 'cancelled',
      updatedAt: serverTimestamp(),
    });

    // Decrement event registered count only if it was registered
    if (currentStatus === 'registered') {
      try {
        await updateDoc(doc(database, 'events', eventId), {
          registered: increment(-1),
        });
      } catch (error) {
        console.error('Error updating event count:', error);
      }
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
