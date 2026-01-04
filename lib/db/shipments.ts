
import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';

export interface SavedShipment {
  id?: string;
  orderId: string;
  shiprocketOrderId?: number; // Made optional
  shiprocketShipmentId?: number; // Made optional
  awbCode: string | null;
  courierName: string | null;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  weight?: number | null; // kgs
  address?: string; // Full address string
  createdAt?: any;
  updatedAt?: any;
  metadata?: any;
}

const SHIPMENTS_COLLECTION = 'shipments';

export const saveShipment = async (shipmentData: SavedShipment) => {
  /* 
    Transaction would be better here, but for now we'll do two operations.
    If this scales, we should move to a transaction or cloud function.
  */
  const docRef = await addDoc(collection(db, SHIPMENTS_COLLECTION), {
    ...shipmentData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Update the original order to link the shipment
  if (shipmentData.orderId) {
    try {
        const orderRef = doc(db, 'orders', shipmentData.orderId);
        await updateDoc(orderRef, {
            shipmentId: docRef.id,
            shipmentStatus: shipmentData.status,
            updatedAt: serverTimestamp()
        });
    } catch (e) {
        console.error('Failed to update order with shipment info:', e);
        // We don't throw here to avoid failing the shipment creation itself
    }
  }

  return docRef.id;
};

export const updateShipmentStatus = async (id: string, status: string, additionalMetadata?: any) => {
  const shipmentRef = doc(db, SHIPMENTS_COLLECTION, id);
  await updateDoc(shipmentRef, {
    status,
    updatedAt: serverTimestamp(),
    ...(additionalMetadata ? { metadata: additionalMetadata } : {})
  });
};

export const updateShipmentDetails = async (id: string, updates: Partial<SavedShipment>) => {
  const shipmentRef = doc(db, SHIPMENTS_COLLECTION, id);
  await updateDoc(shipmentRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

export const deleteShipment = async (id: string) => {
  await deleteDoc(doc(db, SHIPMENTS_COLLECTION, id));
};

export const getShipments = async (limitCount = 50) => {
  const q = query(
    collection(db, SHIPMENTS_COLLECTION),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: (() => {
      const created = doc.data().createdAt;
      if (!created) return new Date().toISOString();
      if (typeof created.toDate === 'function') return created.toDate().toISOString();
      if (created instanceof Date) return created.toISOString();
      return String(created);
    })(),
  }));
};

export const getShipmentByOrderId = async (orderId: string) => {
  const q = query(
    collection(db, SHIPMENTS_COLLECTION),
    where('orderId', '==', orderId)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
};

export const getShipmentById = async (id: string) => {
  const docRef = doc(db, SHIPMENTS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { 
        id: docSnap.id, 
        ...docSnap.data(), 
        createdAt: (() => {
            const created = docSnap.data().createdAt;
            if (!created) return new Date().toISOString();
            if (typeof created.toDate === 'function') return created.toDate().toISOString();
            if (created instanceof Date) return created.toISOString();
            return String(created);
        })()
    };
  }
  return null;
};
