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

let db: any = null;
let registrationsCollection: any = null;
let eventsCollection: any = null;
let walletsCollection: any = null;

async function getDb() {
  if (!db) {
    const firebase = await import("@/lib/firebase");
    db = firebase.db;
    registrationsCollection = collection(db, 'event_registrations');
    eventsCollection = collection(db, 'events');
    walletsCollection = collection(db, 'wallets');
  }
  return db;
}

export { registrationsCollection, eventsCollection, walletsCollection };

export async function createPaymentOrder(
  eventId: string,
  userId: string,
  amount: number,
  walletPointsUsed: number = 0
) {
  try {
    const firebaseDb = await getDb();
    // Create payment order record in Firestore (for tracking)
    const orderData = {
      eventId,
      userId,
      amount,
      walletPointsUsed,
      status: 'pending', // pending, completed, failed, cancelled
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const orderRef = await addDoc(collection(firebaseDb, 'payment_orders'), orderData);

    return {
      success: true,
      orderId: orderRef.id,
      amount,
      walletPointsUsed,
    };
  } catch (error) {
    console.error('Error creating payment order:', error);
    throw error;
  }
}

export async function completeRegistration(
  eventId: string,
  userId: string,
  orderId: string,
  amount: number,
  walletPointsUsed: number = 0
) {
  try {
    // Check if already registered
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

    // Get event capacity info
    const eventDocs = await getDocs(eventsCollection);
    const eventDoc = eventDocs.docs.find((d: any) => d.id === eventId);
    const capacity = eventDoc?.data()?.capacity || 50;

    // Check if waitlisted
    const registrationCount = await getDocs(
      query(registrationsCollection, where('eventId', '==', eventId), where('status', '==', 'registered'))
    );

    const waitlisted = registrationCount.size >= capacity;

    // Create registration
    const registrationData = {
      eventId,
      userId,
      orderId,
      amountPaid: amount,
      walletPointsUsed,
      status: waitlisted ? 'waitlisted' : 'registered',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const regRef = await addDoc(registrationsCollection, registrationData);

    // Update payment order status
    await updateDoc(doc(db, 'payment_orders', orderId), {
      status: 'completed',
      registrationId: regRef.id,
      updatedAt: serverTimestamp(),
    });

    // Deduct wallet points if used
    if (walletPointsUsed > 0) {
      try {
        const walletSnap = await getDocs(
          query(walletsCollection, where('userId', '==', userId))
        );
        if (!walletSnap.empty) {
          const walletRef = walletSnap.docs[0].ref;
          await updateDoc(walletRef, {
            points: increment(-walletPointsUsed),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (error) {
        console.error('Error updating wallet:', error);
      }
    }

    // Update event registered count if not waitlisted
    if (!waitlisted) {
      try {
        await updateDoc(doc(db, 'events', eventId), {
          registered: increment(1),
          updatedAt: serverTimestamp(),
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
    console.error('Error completing registration:', error);
    throw error;
  }
}

export async function getUserWallet(userId: string) {
  try {
    const walletSnap = await getDocs(
      query(walletsCollection, where('userId', '==', userId))
    );

    if (walletSnap.empty) {
      return null;
    }

    const data = walletSnap.docs[0].data() as any;
    return {
      id: walletSnap.docs[0].id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    };
  } catch (error) {
    console.error('Error getting wallet:', error);
    throw error;
  }
}
