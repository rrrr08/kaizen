// Re-export from the properly initialized firebase-admin setup
// This maintains backward compatibility for existing API routes
export {
  adminDb,
  adminAuth,
  adminDb as db,
  adminAuth as auth,
  default
} from '@/app/api/auth/firebase-admin';
