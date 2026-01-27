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
import { Logger } from '@/lib/logger';

export async function createPaymentOrder(
  eventId: string,
  userId: string,
  amount: number,
  walletPointsUsed: number = 0
) {
  try {
    const firebaseDb = await getFirebaseDb();
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
    Logger.error('Error creating payment order:', error);
    throw error;
  }
}

export async function completeRegistration(
  eventId: string,
  userId: string,
  orderId: string | null,
  amount: number,
  walletPointsUsed: number = 0
) {
  try {
    // Initialize Firebase Firestore first
    const firebaseDb = await getFirebaseDb();
    
    // Create collection references using returned db
    const registrations = collection(firebaseDb, 'event_registrations');
    const events = collection(firebaseDb, 'events');
    const wallets = collection(firebaseDb, 'wallets');
    
    // Check if already registered
    const existingReg = query(
      registrations,
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
    const eventDocs = await getDocs(events);
    const eventDoc = eventDocs.docs.find((d: any) => d.id === eventId);
    const capacity = (eventDoc?.data() as any)?.capacity || 50;

    // Check if event is at capacity
    const registrationCount = await getDocs(
      query(registrations, where('eventId', '==', eventId), where('status', '==', 'registered'))
    );

    if (registrationCount.size >= capacity) {
      return {
        success: false,
        waitlisted: false,
        message: 'Event is at full capacity',
        fullCapacity: true
      };
    }

    // Create registration
    const registrationData: any = {
      eventId,
      userId,
      amountPaid: amount,
      walletPointsUsed,
      status: 'registered',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Only include orderId if it exists (paid registrations)
    if (orderId) {
      registrationData.orderId = orderId;
    }

    Logger.info('Creating event registration:', { ...registrationData, userId, eventId });
    const regRef = await addDoc(registrations, registrationData);
    Logger.info('Registration created successfully with ID:', regRef.id);

    // Update payment order status only if orderId exists
    if (orderId) {
      await updateDoc(doc(firebaseDb, 'payment_orders', orderId), {
        status: 'completed',
        registrationId: regRef.id,
        updatedAt: serverTimestamp(),
      });
    }

    // Deduct wallet points if used
    if (walletPointsUsed > 0) {
      try {
        const walletSnap = await getDocs(
          query(wallets, where('userId', '==', userId))
        );
        if (!walletSnap.empty) {
          const walletRef = walletSnap.docs[0].ref;
          await updateDoc(walletRef, {
            points: increment(-walletPointsUsed),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (error) {
        Logger.error('Error updating wallet:', error);
      }
    }

    // Update event registered count
    try {
      const eventRef = doc(firebaseDb, 'events', eventId);
      await updateDoc(eventRef, {
        registered: increment(1),
        updatedAt: serverTimestamp(),
      });
      Logger.info(`Successfully incremented registered count for event ${eventId}`);
    } catch (error) {
      Logger.error('Error updating event count:', { error, eventId });
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
    Logger.error('Error completing registration:', error);
    throw error;
  }
}

export async function getUserWallet(userId: string) {
  try {
    const firebaseDb = await getFirebaseDb();
    const wallets = collection(firebaseDb, 'wallets');
    
    const walletSnap = await getDocs(
      query(wallets, where('userId', '==', userId))
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
    Logger.error('Error getting wallet:', error);
    throw error;
  }
}
