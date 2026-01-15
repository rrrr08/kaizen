'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';

import { UserProfile } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  role: string | null;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    console.log('[AuthContext] Mounting - initializing auth listener');

    // Lazy load Firebase
    import('@/lib/firebase').then(({ auth, db }) => {
      // Check if Firebase is initialized
      if (!auth) {
        console.warn('[AuthContext] Firebase auth not initialized');
        setLoading(false);
        return;
      }

      import('firebase/auth').then(({ onAuthStateChanged, signOut }) => {
        import('firebase/firestore').then(({ doc, getDoc }) => {
          const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            console.log('[AuthContext] Auth state changed:', {
              email: currentUser?.email || 'logged out',
              uid: currentUser?.uid,
              timestamp: new Date().toLocaleTimeString()
            });

            setUser(currentUser);

            if (currentUser) {
              // Fetch user role from Firestore
              try {
                if (!db) {
                  // CRITICAL FIX: If DB is not ready, DO NOT load the user as "member" with empty data.
                  // Keep loading state true so the UI waits for DB to be ready or for a reload.
                  console.error('[AuthContext] Critical: Firebase db not initialized - keeping app in loading state to prevent data corruption');
                  setLoading(true);
                  return;
                }

                const userDocRef = doc(db, 'users', currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                  const userData = userDocSnap.data() as UserProfile;

                  // Check for Ban Status
                  if (userData.isBanned) {
                    console.warn('[AuthContext] User is banned. Logging out.');
                    await signOut(auth);
                    setUser(null);
                    setUserProfile(null);
                    setRole(null);
                    setIsAdmin(false);
                    setLoading(false);
                    // Optional: Redirect or Alert
                    if (typeof window !== 'undefined') {
                      alert("Your account has been suspended. Please contact support.");
                      window.location.href = "/";
                    }
                    return;
                  }

                  const userRole = userData?.role || null;
                  setUserProfile(userData);
                  setRole(userRole);
                  setIsAdmin(userRole === 'admin');
                  console.log('[AuthContext] User role:', userRole);
                } else {
                  setUserProfile(null);
                  setRole(null);
                  setIsAdmin(false);
                }
              } catch (error) {
                console.error('[AuthContext] Error fetching user role:', error);
                setUserProfile(null);
                setRole(null);
                setIsAdmin(false);
              }
            } else {
              setUserProfile(null);
              setRole(null);
              setIsAdmin(false);
            }

            setLoading(false);
          }, (error) => {
            console.error('[AuthContext] Auth error:', error);
            setUser(null);
            setUserProfile(null);
            setRole(null);
            setIsAdmin(false);
            setLoading(false);
          });

          return () => {
            console.log('[AuthContext] Cleaning up auth listener');
            unsubscribe();
          };
        });
      });
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, role, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
