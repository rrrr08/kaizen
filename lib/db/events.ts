import {
  collection,
  query,
  where,
  Query,
  updateDoc,
  DocumentData,
  orderBy,
  getDocs,
  serverTimestamp,
  getDoc,
  doc,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { GameEvent } from "../types";
import { db } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from "firebase-admin/firestore";

export type CreateEventInput = {
  title: string;
  description: string;
  datetime: Date;
  location: string;
  registered: number;
  capacity: number;

  image?: string;
  price?: number;

  highlights?: string[];
  testimonials?: {
    name: string;
    message: string;
  }[];
  gallery?: string[];
};


export async function getEvents(filters: { status: 'upcoming' | 'past' }) {
  try {
    const database = await getFirebaseDb();
    const eventsCollection = collection(database, 'events');

    const now = new Date();

    let q: Query<DocumentData>;

    if (filters.status === 'upcoming') {
      q = query(
        eventsCollection,
        where('datetime', '>', now),
        orderBy('datetime', 'asc')
      );
    } else {
      q = query(
        eventsCollection,
        where('datetime', '<=', now),
        orderBy('datetime', 'desc')
      );
    }

    const snapshot = await getDocs(q);

    return snapshot.docs.map(docSnap => {
      const data = docSnap.data();

      return {
        id: docSnap.id,
        ...data,
        datetime: data.datetime?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      };
    });
  } catch (error) {
    console.error('Error getting events', error);
    throw error;
  }
}

export async function getEventById(eventId: string): Promise<GameEvent | null> {
  try {
    const database = await getFirebaseDb();
    const ref = doc(database, "events", eventId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return null;
    }

    const data = snap.data();

    return {
      id: snap.id,
      ...data,
      datetime: data.datetime?.toDate(),
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as GameEvent;
  } catch (error) {
    console.error("Error getting event by id", error);
    throw error;
  }
}

export async function createEvent(input: CreateEventInput): Promise<string> {
  try {
    const payload: any = {
      title: input.title,
      description: input.description,
      datetime: Timestamp.fromDate(input.datetime),
      location: input.location,
      capacity: input.capacity,
      registered: input.registered,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (input.image !== undefined) payload.image = input.image;
    if (input.price !== undefined) payload.price = input.price;

    if (input.highlights !== undefined) payload.highlights = input.highlights;
    if (input.testimonials !== undefined) payload.testimonials = input.testimonials;
    if (input.gallery !== undefined) payload.gallery = input.gallery;

    const docRef = await db.collection('events').add(payload);
    return docRef.id;
  } catch (error) {
    console.error('Error creating event', error);
    throw error;
  }
}

export async function updateEventById(
  id: string,
  updates: Partial<GameEvent>
): Promise<GameEvent | null> {

  const ref = db.collection('events').doc(id);
  const snap = await ref.get();
  if (!snap.exists) return null;

  const payload: Record<string, any> = {};

  // Scalars
  if (typeof updates.title === 'string') payload.title = updates.title;
  if (typeof updates.description === 'string') payload.description = updates.description;
  if (typeof updates.location === 'string') payload.location = updates.location;
  if (typeof updates.image === 'string') payload.image = updates.image;

  if (typeof updates.capacity === 'number') payload.capacity = updates.capacity;
  if (typeof updates.price === 'number') payload.price = updates.price;

  // Datetime → Admin Timestamp
  if (updates.datetime) {
    payload.datetime = Timestamp.fromDate(new Date(updates.datetime as any));
  }

  // Arrays
  if (Array.isArray(updates.highlights)) payload.highlights = updates.highlights;
  if (Array.isArray(updates.gallery)) payload.gallery = updates.gallery;
  if (Array.isArray(updates.testimonials)) payload.testimonials = updates.testimonials;

  if (Object.keys(payload).length === 0) return null;

  payload.updatedAt = FieldValue.serverTimestamp();

  await ref.update(payload);

  const updatedSnap = await ref.get();
  return {
    id: updatedSnap.id,
    ...(updatedSnap.data() as Omit<GameEvent, 'id'>),
  };
}


export async function deleteEventById(id: string): Promise<boolean> {
  const ref = db.collection('events').doc(id);
  const snap = await ref.get();

  if (!snap.exists) return false;

  await ref.delete();
  return true;
}