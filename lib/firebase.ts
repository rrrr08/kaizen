import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  sendEmailVerification,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
  Timestamp,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  arrayUnion,
  deleteDoc,
  arrayRemove,
  onSnapshot,
} from "firebase/firestore";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
// Type imports removed for JavaScript conversion - Re-added for TypeScript
import { UserProfile, ChatMessage, Conversation, Product } from "./types";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

if (process.env.NODE_ENV !== 'production') {
  console.log('Firebase config:', {
    apiKey: firebaseConfig.apiKey ? 'SET' : 'MISSING',
    authDomain: firebaseConfig.authDomain ? 'SET' : 'MISSING',
    projectId: firebaseConfig.projectId ? 'SET' : 'MISSING',
  });
}

// Initialize Firebase app - only throws if trying to actually use it without proper config
let app: any;
try {
  if (!firebaseConfig.apiKey) {
    throw new Error('Firebase API key is missing');
  }
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
} catch (error) {
  if (typeof window !== 'undefined') {
    // Client-side: defer the error to when Firebase is actually used
    console.warn('Firebase initialization deferred:', error);
    app = null;
  } else {
    // Server-side: allow error to propagate
    throw error;
  }
}

const auth = app ? getAuth(app) : (null as any);
const db = app ? getFirestore(app) : (null as any);
const storage = app ? getStorage(app) : (null as any);
const googleProvider = new GoogleAuthProvider();

// Enable persistence (LOCAL is default, but let's make it explicit)
if (auth) {
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error('Error setting persistence:', error);
  });
}

// Helper function to check Firebase initialization
function ensureFirebaseInit() {
  if (!app || !auth || !db) {
    throw new Error('Firebase is not initialized. Please ensure NEXT_PUBLIC_FIREBASE_API_KEY is set.');
  }
}

// ProfileUpdateData interface removed for JavaScript conversion

export const createUser = async (email: string, password: string, userData: UserProfile) => {
  if (!auth) {
    throw new Error('Firebase authentication is not initialized');
  }
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  const profileToCreate = {
    ...userData,
    email: userCredential.user.email,
    role: userData.role || "member",
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  };
  await createUserProfile(
    userCredential.user.uid,
    profileToCreate
  );

  return userCredential;
};

export const signIn = async (email: string, password: string) => {
  if (!auth) {
    throw new Error('Firebase authentication is not initialized');
  }
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const { user } = userCredential;

  // Ensure user profile exists in Firestore
  if (user) {
    try {
      const userExists = await checkUserExists(user.uid);
      if (!userExists) {
        // Create profile if it doesn't exist
        const profileData: UserProfile = {
          email: user.email || '',
          name: user.displayName || user.email || 'User',
          role: "member",
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
          last_sign_in_at: serverTimestamp(),
        };
        await createUserProfile(user.uid, profileData);
      } else {
        // Update last sign-in time
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          last_sign_in_at: serverTimestamp(),
          updated_at: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("Error syncing user profile on sign-in:", error);
    }
  }

  return userCredential;
};

export const signInWithGoogle = async () => {
  try {
    if (!auth) {
      throw new Error('Firebase authentication is not initialized');
    }
    
    // Try popup first
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const { user } = userCredential;
      
      // Important: Google provides a verified email by default, but we check anyway
      if (user.email) {
        const userExists = await checkUserExists(user.uid);
        
        // For brand new users, we need to create their profile
        if (!userExists) {
          const profileData = {
            email: user.email,
            name: user.displayName || "",
            first_name: user.displayName?.split(" ")[0] || "",
            last_name: user.displayName?.split(" ").slice(1).join(" ") || "",
            photoURL: user.photoURL,
            avatar_url: user.photoURL, // Keep both for compatibility
            role: "member",
            likedBlogs: [],
            activity: [],
            blogCount: 0,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
            last_sign_in_at: serverTimestamp(),
          };
          await createUserProfile(user.uid, profileData);
        } else {
          // Update the user's last sign-in time
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, {
            last_sign_in_at: serverTimestamp(),
            updated_at: serverTimestamp()
          });
        }
      }
      
      return userCredential;
    } catch (popupError: any) {
      // If popup is blocked, fallback to redirect-based auth
      if (popupError.code === 'auth/popup-blocked') {
        console.warn('Popup blocked, using redirect-based authentication instead');
        
        // Store the redirect path in sessionStorage to retrieve after auth
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('authRedirectSource', 'google');
        }
        
        // Use redirect instead
        await signInWithRedirect(auth, googleProvider);
        
        // This won't return immediately as the page will redirect
        return null;
      }
      
      // Re-throw other errors
      throw popupError;
    }
  } catch (error) {
    console.error("Google sign-in error:", error);
    throw error;
  }
};

export const logOut = async () => {
  if (!auth) {
    console.warn('Firebase auth not initialized, skipping logout');
    return;
  }
  await signOut(auth);

  try {
    await fetch("/api/auth/signout", {
      method: "POST",
      credentials: "same-origin",
    });
  } catch (error) {
    console.error("Error clearing server session:", error);
  }
};

export const createUserProfile = async (userId: string, data: UserProfile) => {
  if (!db) {
    throw new Error('Firebase database is not initialized');
  }
  const userRef = doc(db, "users", userId);

  // Initialize with multiavatar if no photoURL provided
  let avatarData = {};
  if (!data.photoURL) {
    try {
      const { generateUserMultiavatar } = await import('./multiavatar');
      const multiavatar = generateUserMultiavatar(data);
      avatarData = {
        photoURL: multiavatar.dataUrl,
        avatarSeed: multiavatar.seed
      };
    } catch (error) {
      console.error('Error generating initial multiavatar:', error);
      // Continue without avatar if generation fails
    }
  }

  const profileDataToSet = {
    id: userId,
    role: data.role || "member",
    ...data,
    ...avatarData, // Add multiavatar data if generated
    created_at:
      data.created_at &&
      (data.created_at instanceof Timestamp ||
        typeof data.created_at === "string")
        ? data.created_at
        : data.created_at || serverTimestamp(),
    updated_at: serverTimestamp(),
  };
  await setDoc(userRef, profileDataToSet);
};

export const checkUserExists = async (userId: string) => {
  try {
    if (!db) return false;
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    return userSnap.exists();
  } catch (error) {
    console.error('Error checking user exists:', error);
    return false;
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    if (!db) {
      console.warn('Firebase not initialized in getUserProfile');
      return null;
    }
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }

    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Alias for getUserProfile for backward compatibility
export const getUserById = getUserProfile;

export const updateUserProfile = async (userId: string, data: Partial<UserProfile>) => {
  if (!db) {
    throw new Error('Firebase database is not initialized');
  }
  const userRef = doc(db, "users", userId);

  const dataToUpdate = {
    ...data,
    id: undefined,
    updated_at: serverTimestamp(),
  };
  delete dataToUpdate.id;

  await updateDoc(userRef, dataToUpdate);
};

export const checkUserIsAdmin = async (userId: string) => {
  try {
    const profile = await getUserProfile(userId);
    console.log('[Firebase] checkUserIsAdmin - Profile:', {
      uid: userId,
      role: profile?.role,
      email: profile?.email,
      isAdmin: profile?.role === "admin"
    });
    return profile?.role === "admin";
  } catch (error) {
    console.error('[Firebase] Error in checkUserIsAdmin:', error);
    return false;
  }
};

// Set up auth state listener only if Firebase is initialized
if (typeof window !== "undefined" && auth) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const exists = await checkUserExists(user.uid);
        if (!exists) {
          const profileData = {
            email: user.email,
            name: user.displayName || "",
            first_name: user.displayName?.split(" ")[0] || "",
            last_name: user.displayName?.split(" ").slice(1).join(" ") || "",
            photoURL: user.photoURL,
            avatar_url: user.photoURL, // Keep both for compatibility
            role: "member",
            likedBlogs: [],
            activity: [],
            blogCount: 0,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
            last_sign_in_at: serverTimestamp(),
          };
          await createUserProfile(
            user.uid,
            profileData
          );
          
          // For new users who signed in with Google but haven't verified email yet
          if (user.email && !user.emailVerified && user.providerData.some(p => p.providerId === 'google.com')) {
            console.log('New Google user, auto-redirecting to verification flow');
            // Don't auto-send email verification for Google users, just redirect to verify page
            window.location.href = `/auth/verify?email=${encodeURIComponent(user.email)}`;
          }
        } else {
          // Update last sign in for existing users
          if (db) {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
              last_sign_in_at: serverTimestamp(),
              updated_at: serverTimestamp()
            });
          }
        }
      } catch (error) {
        console.error(
          "Error ensuring user exists in Firestore (onAuthStateChanged):",
          error
        );
      }
    }
  });
}

export async function addProduct(product: Product) {
  const productData = {
    ...product,
    price: parseFloat(String(product.price)),
    stock: parseInt(String(product.stock), 10),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDoc(collection(db, 'products'), productData);
  return docRef.id;
}

export async function updateProduct(productId: string, product: Partial<Product>) {
  // Validate productId
  if (!productId || typeof productId !== 'string') {
    throw new Error(`Invalid productId: ${productId}. Must be a non-empty string.`);
  }
  
  // Validate product data
  if (!product || typeof product !== 'object') {
    throw new Error('Invalid product data. Must be an object.');
  }
  
  console.log('updateProduct called with:', { productId, product });
  
  try {
    const productRef = doc(db, 'products', productId);
    const productData = {
      ...product,
      price: parseFloat(String(product.price)) || 0,
      stock: parseInt(String(product.stock), 10) || 0,
      updatedAt: serverTimestamp(),
    };
    
    console.log('Updating product with data:', productData);
    await updateDoc(productRef, productData);
    console.log('Product updated successfully');
  } catch (error) {
    console.error('Error in updateProduct:', error);
    throw error;
  }
}

export async function deleteProduct(productId: string) {
  await deleteDoc(doc(db, 'products', productId));
}

export function subscribeToRealtimeStats(update: (stats: any[]) => void) {
  return onSnapshot(collection(db, 'stats'), snapshot => {
    const stats: any[] = [];
    snapshot.forEach(doc => {
      stats.push({ id: doc.id, ...doc.data() });
    });
    update(stats);
  });
}

export function subscribeToRealtimeOrders(update: (orders: any[]) => void) {
  const orderQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  return onSnapshot(orderQuery, snapshot => {
    const orders: any[] = [];
    snapshot.forEach(doc => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    update(orders);
  });
}

export { 
  app, 
  auth, 
  db, 
  storage,
  // Firestore functions
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  Timestamp,
  arrayUnion
};

// FirestoreConversationData interface removed for JavaScript conversion

const safeTimestampToDate = (timestamp: any): Date => {
  if (timestamp && typeof timestamp.toDate === "function") {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date();
};

export const createConversation = async (
  user_id: string,
  user_email: string,
  initialMessage: ChatMessage
) => {
  const docRef = doc(collection(db, "conversations"));

  const firstEmbeddedMessage = {
    id: initialMessage.id || docRef.id + "_msg_0",
    date: initialMessage.timestamp,
    message: initialMessage.content,
    role: initialMessage.role,
    attachedFiles: initialMessage.attachedFiles || [],
  };

  const conversationData = {
    id: docRef.id,
    user_id,
    user_email,
    messages: [firstEmbeddedMessage],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(docRef, conversationData);
  return docRef.id;
};

export const addMessageToConversation = async (
  conversationId: string,
  message: ChatMessage
) => {
  const conversationRef = doc(db, "conversations", conversationId);

  const messageId = message.id || doc(collection(db, "tmp")).id;

  const newMessage = {
    id: messageId,
    date: message.timestamp,
    message: message.content,
    role: message.role,
    attachedFiles: message.attachedFiles || [],
  };

  await updateDoc(conversationRef, {
    messages: arrayUnion(newMessage),
    updatedAt: serverTimestamp(),
  });

  return messageId;
};

export const getConversationsForUser = async (user_id: string) => {
  const q = query(
    collection(db, "conversations"),
    where("user_id", "==", user_id),
    orderBy("updatedAt", "desc"),
    limit(50)
  );
  const querySnapshot = await getDocs(q);
  const conversations: Conversation[] = [];
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    conversations.push({
      id: docSnap.id,
      user_id: data.user_id,
      user_email: data.user_email,
      difyConversationId: data.difyConversationId || undefined,
      createdAt: safeTimestampToDate(data.createdAt),
      updatedAt: safeTimestampToDate(data.updatedAt),
    });
  });
  return conversations;
};

export const getAllConversations = async (limitCount = 50) => {
  const q = query(
    collection(db, "conversations"),
    orderBy("updatedAt", "desc"),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);
  const conversations: Conversation[] = [];
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    conversations.push({
      id: docSnap.id,
      user_id: data.user_id,
      user_email: data.user_email,
      difyConversationId: data.difyConversationId || undefined,
      createdAt: safeTimestampToDate(data.createdAt),
      updatedAt: safeTimestampToDate(data.updatedAt),
    });
  });
  return conversations;
};

export const getConversationWithMessages = async (conversationId: string): Promise<Conversation | null> => {
  const conversationRef = doc(db, "conversations", conversationId);
  const docSnap = await getDoc(conversationRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    const messages = (data.messages || []).map((msg: any) => ({
      ...msg,
      date: safeTimestampToDate(msg.date),
    }));

    return {
      id: docSnap.id,
      user_id: data.user_id,
      user_email: data.user_email,
      messages,
      difyConversationId: data.difyConversationId || undefined,
      createdAt: safeTimestampToDate(data.createdAt),
      updatedAt: safeTimestampToDate(data.updatedAt),
    };
  }
  return null;
};

export const deleteConversation = async (conversationId: string) => {
  const conversationRef = doc(db, "conversations", conversationId);
  await deleteDoc(conversationRef);
};

export const updateConversationDifyId = async (
  firebaseConversationId: string,
  difyConversationId: string
) => {
  const conversationRef = doc(db, "conversations", firebaseConversationId);
  await updateDoc(conversationRef, {
    difyConversationId: difyConversationId,
    updatedAt: serverTimestamp(),
  });
};

// Google Calendar Integration
export const updateGoogleIntegration = async (
  userId: string,
  tokens: {
    access_token: string;
    refresh_token?: string;
    expiry_date?: number;
    scope?: string;
    token_type?: string;
  }
) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    googleIntegration: {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || null,
      expiryDate: tokens.expiry_date || null,
      scope: tokens.scope || null,
      tokenType: tokens.token_type || 'Bearer',
      connectedAt: serverTimestamp(),
    },
    updated_at: serverTimestamp(),
  });
};

// ===== WALLET & POINTS MANAGEMENT =====

export async function updateUserWallet(userId: string, pointsToAdd: number) {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    throw new Error('User not found');
  }

  const currentPoints = userDoc.data()?.points || 0;
  const newPoints = currentPoints + pointsToAdd;

  await updateDoc(userRef, {
    points: newPoints,
    updated_at: serverTimestamp(),
  });

  return newPoints;
}

export async function getUserWallet(userId: string) {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    return { points: 0, history: [] };
  }

  const data = userDoc.data();
  return {
    points: data?.points || 0,
    history: data?.pointHistory || [],
  };
}

export async function addPointHistory(
  userId: string,
  points: number,
  activity: string,
  orderId?: string
) {
  const userRef = doc(db, 'users', userId);
  const historyEntry = {
    date: new Date().toISOString(),
    points,
    activity,
    orderId: orderId || null,
  };

  await updateDoc(userRef, {
    pointHistory: arrayUnion(historyEntry),
    updated_at: serverTimestamp(),
  });
}

// ===== ORDERS MANAGEMENT =====

export async function createOrder(
  userId: string,
  orderData: {
    items: any[];
    totalPrice: number;
    totalPoints: number;
    paymentId: string;
    shippingAddress?: any;
  }
) {
  const orderId = Date.now().toString();
  
  const order = {
    id: orderId,
    userId,
    items: orderData.items,
    totalPrice: orderData.totalPrice,
    totalPoints: orderData.totalPoints,
    paymentId: orderData.paymentId,
    shippingAddress: orderData.shippingAddress || {},
    status: 'completed',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const orderRef = doc(db, 'orders', orderId);
  await setDoc(orderRef, order);

  return orderId;
}

export async function getUserOrders(userId: string) {
  const q = query(
    collection(db, 'orders'),
    where('userId', '==', userId)
  );

  const snapshot = await getDocs(q);
  const orders = snapshot.docs.map(doc => ({
    id: doc.id,
    items: doc.data().items || [],
    totalPrice: doc.data().totalPrice || 0,
    totalPoints: doc.data().totalPoints || 0,
    pointsRedeemed: doc.data().pointsRedeemed || 0,
    shippingAddress: doc.data().shippingAddress,
    createdAt: doc.data().createdAt?.toDate?.() || new Date(),
    paymentStatus: doc.data().paymentStatus || 'pending',
  } as any));
  
  // Sort by createdAt on the client side instead
  return orders.sort((a, b) => {
    const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
    const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
    return dateB.getTime() - dateA.getTime();
  });
}

export async function getOrderById(orderId: string) {
  const orderRef = doc(db, 'orders', orderId);
  const orderDoc = await getDoc(orderRef);
  
  if (!orderDoc.exists()) {
    return null;
  }

  return {
    id: orderDoc.id,
    ...orderDoc.data(),
    createdAt: orderDoc.data().createdAt?.toDate?.() || new Date(),
  };
}

// ===== CART MANAGEMENT =====

export async function updateUserCart(userId: string, cartItems: any[]) {
  const userRef = doc(db, 'users', userId);
  
  await updateDoc(userRef, {
    cart: cartItems,
    cartUpdatedAt: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
}

export async function getUserCart(userId: string) {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    return [];
  }

  return userDoc.data()?.cart || [];
}

export async function clearUserCart(userId: string) {
  const userRef = doc(db, 'users', userId);
  
  await updateDoc(userRef, {
    cart: [],
    cartUpdatedAt: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
}

// ===== NOTIFICATIONS MANAGEMENT =====

export interface NotificationHistory {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'offer' | 'warning';
  recipientType: 'all' | 'specific';
  recipientCount: number;
  sentAt: string;
  actionUrl?: string;
}

export async function getNotificationHistory() {
  const q = query(collection(db, 'notifications'), orderBy('sentAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as NotificationHistory[];
}

export async function addNotification(notification: Omit<NotificationHistory, 'id' | 'sentAt'> & { sentAt?: string }) {
  const notifRef = collection(db, 'notifications');
  const docRef = await addDoc(notifRef, {
    ...notification,
    sentAt: notification.sentAt || new Date().toISOString(),
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// ===== CAMPAIGNS MANAGEMENT =====

export interface Campaign {
  id: string;
  title: string;
  message: string;
  status: string;
  recipientCount: number;
  deliveredCount: number;
  interactionCount: number;
  createdAt: string;
  image?: string;
  actionUrl?: string;
  priority?: string;
}

export async function getCampaigns() {
  const q = query(collection(db, 'campaigns'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Campaign[];
}

export async function addCampaign(campaign: Omit<Campaign, 'id' | 'deliveredCount' | 'interactionCount'>) {
  const campaignRef = collection(db, 'campaigns');
  const docRef = await addDoc(campaignRef, {
    ...campaign,
    deliveredCount: 0,
    interactionCount: 0,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
}

// ===== GAMIFICATION CONFIG =====

export interface GamificationConfig {
  pointsPerRupee: number;
  firstTimeBonusPoints: number;
  firstTimeThreshold: number;
  redeemRate: number;
  maxRedeemPercent: number;
  referralBonus: number;
  birthdayBonus: number;
  bonusRules: any[];
  levelThresholds?: any[];
}

export async function getGamificationConfig(): Promise<GamificationConfig> {
  try {
    if (!db) {
      throw new Error('Firebase not initialized');
    }
    const configRef = doc(db, 'settings', 'gamification');
    const configDoc = await getDoc(configRef);
    
    if (configDoc.exists()) {
      return configDoc.data() as GamificationConfig;
    }
  } catch (error) {
    console.error('Error loading gamification config:', error);
  }

  // Return default if not found or Firebase not initialized
  return {
    pointsPerRupee: 1,
    firstTimeBonusPoints: 100,
    firstTimeThreshold: 500,
    redeemRate: 0.5,
    maxRedeemPercent: 50,
    referralBonus: 50,
    birthdayBonus: 100,
    bonusRules: [],
  };
}

export async function updateGamificationConfig(config: GamificationConfig) {
  if (!db) {
    throw new Error('Firebase not initialized');
  }
  const configRef = doc(db, 'settings', 'gamification');
  await setDoc(configRef, config);
}

// ============================================
// DATA FETCH FUNCTIONS (For Pages)
// ============================================

/**
 * Fetch all products from Firestore
 */
export async function getProducts() {
  try {
    const q = query(collection(db, 'products'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

/**
 * Fetch single product by ID
 */
export async function getProductById(id: string) {
  try {
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

/**
 * Fetch all events from Firestore
 */
export async function getEvents() {
  try {
    const q = query(collection(db, 'events'), orderBy('date', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

/**
 * Fetch single event by ID
 */
export async function getEventById(id: string) {
  try {
    const docRef = doc(db, 'events', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
}

/**
 * Fetch all games from Firestore
 */
export async function getGames() {
  try {
    const q = query(collection(db, 'games'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching games:', error);
    return [];
  }
}

/**
 * Fetch all experiences from Firestore
 */
export async function getExperiences() {
  try {
    const q = query(collection(db, 'experiences'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching experiences:', error);
    return [];
  }
}

/**
 * Fetch single experience by ID
 */
export async function getExperienceById(id: string) {
  try {
    const docRef = doc(db, 'experiences', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching experience:', error);
    return null;
  }
}

/**
 * Fetch all testimonials from Firestore
 */
export async function getTestimonials() {
  try {
    const q = query(collection(db, 'testimonials'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return [];
  }
}

/**
 * Fetch all blog posts from Firestore
 */
export async function getBlogPosts() {
  try {
    const q = query(
      collection(db, 'blog_posts'),
      where('published', '==', true),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}

/**
 * Fetch single blog post by ID
 */
export async function getBlogPostById(id: string) {
  try {
    const docRef = doc(db, 'blog_posts', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

/**
 * Handle Google Sign-In redirect result
 * Call this in the layout or main app component to complete redirect-based Google auth
 */
export async function handleGoogleSignInRedirect() {
  try {
    if (!auth) {
      console.warn('Firebase auth not initialized, skipping Google redirect result check');
      return null;
    }
    
    const result = await getRedirectResult(auth);
    
    if (result) {
      const { user } = result;
      
      // Create user profile if new user
      if (user.email) {
        const userExists = await checkUserExists(user.uid);
        
        if (!userExists) {
          const profileData = {
            email: user.email,
            name: user.displayName || "",
            first_name: user.displayName?.split(" ")[0] || "",
            last_name: user.displayName?.split(" ").slice(1).join(" ") || "",
            photoURL: user.photoURL,
            avatar_url: user.photoURL,
            role: "member",
            likedBlogs: [],
            activity: [],
            blogCount: 0,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
            last_sign_in_at: serverTimestamp(),
          };
          await createUserProfile(user.uid, profileData);
        } else {
          // Update last sign-in time
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, {
            last_sign_in_at: serverTimestamp(),
            updated_at: serverTimestamp()
          });
        }
      }
      
      return result;
    }
    return null;
  } catch (error) {
    console.error("Error handling Google redirect result:", error);
    throw error;
  }
}