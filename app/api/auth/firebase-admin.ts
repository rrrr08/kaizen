import admin from 'firebase-admin';

let isInitialized = false;

function initializeFirebaseAdmin() {
  if (isInitialized || admin.apps.length > 0) {
    return;
  }

  try {
    // First, check if the JSON string is provided as a single environment variable
    if (process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
      try {
        const serviceAccountJson = JSON.parse(process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT);
        
        // Make sure private_key is formatted correctly
        if (serviceAccountJson.private_key) {
          serviceAccountJson.private_key = serviceAccountJson.private_key.replace(/\\n/g, '\n');
        }
        
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccountJson),
          databaseURL: process.env.FIREBASE_DATABASE_URL,
        });
        
        console.log('Firebase Admin initialized with service account JSON string');
      } catch (jsonError) {
        console.error('Error parsing FIREBASE_ADMIN_SERVICE_ACCOUNT:', jsonError);
        throw jsonError;
      }
    } else {
      // Fallback to individual environment variables
      const serviceAccount = {
        type: process.env.FIREBASE_ADMIN_TYPE || 'service_account',
        project_id: process.env.FIREBASE_ADMIN_PROJECT_ID,
        private_key_id: process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_ADMIN_CLIENT_ID,
        auth_uri: process.env.FIREBASE_ADMIN_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
        token_uri: process.env.FIREBASE_ADMIN_TOKEN_URI || 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: process.env.FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: process.env.FIREBASE_ADMIN_CLIENT_X509_CERT_URL,
      };
      
      // Validate required fields
      const requiredFields: (keyof typeof serviceAccount)[] = ['project_id', 'private_key', 'client_email'];
      const missingFields = requiredFields.filter(field => !serviceAccount[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required service account fields: ${missingFields.join(', ')}`);
      }
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as any),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });
      
      console.log('Firebase Admin initialized with individual environment variables');
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    throw error;
  }
  
  isInitialized = true;
}

export function getAdminDb() {
  initializeFirebaseAdmin();
  return admin.firestore();
}

export function getAdminAuth() {
  initializeFirebaseAdmin();
  return admin.auth();
}

// For compatibility with existing imports
export const adminDb = {
  collection: (path: string) => getAdminDb().collection(path),
};

export const adminAuth = {
  getUserByEmail: (email: string) => getAdminAuth().getUserByEmail(email),
  verifyIdToken: (token: string) => getAdminAuth().verifyIdToken(token),
  verifySessionCookie: (cookie: string) => getAdminAuth().verifySessionCookie(cookie),
  createSessionCookie: (idToken: string, options: any) => getAdminAuth().createSessionCookie(idToken, options),
  setCustomUserClaims: (uid: string, claims: any) => getAdminAuth().setCustomUserClaims(uid, claims),
  revokeRefreshTokens: (uid: string) => getAdminAuth().revokeRefreshTokens(uid),
};

export default admin;