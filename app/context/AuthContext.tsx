'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';

import { UserProfile } from '@/lib/types';

import BannedScreen from '@/components/auth/BannedScreen';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  role: string | null;
  isAdmin: boolean;
  isBanned: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isBanned, setIsBanned] = useState(false);

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
                  console.error('[AuthContext] Critical: Firebase db not initialized');
                  setLoading(true);
                  return;
                }

                const userDocRef = doc(db, 'users', currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                  const userData = userDocSnap.data() as UserProfile;

                  // Check for Ban Status
                  if (userData.isBanned) {
                    setIsBanned(true);
                  } else {
                    setIsBanned(false);
                  }

                  const userRole = userData?.role || null;
                  setUserProfile(userData);
                  setRole(userRole);
                  setIsAdmin(userRole === 'admin');
                } else {
                  setUserProfile(null);
                  setRole(null);
                  setIsAdmin(false);
                  setIsBanned(false);
                }
              } catch (error) {
                console.error('[AuthContext] Error fetching user role:', error);
                setUserProfile(null);
                setRole(null);
                setIsAdmin(false);
                setIsBanned(false);
              }
            } else {
              setUserProfile(null);
              setRole(null);
              setIsAdmin(false);
              setIsBanned(false);
            }

            setLoading(false);
          }, (error) => {
            console.error('[AuthContext] Auth error:', error);
            setUser(null);
            setUserProfile(null);
            setRole(null);
            setIsAdmin(false);
            setLoading(false);
            setIsBanned(false);
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
    <AuthContext.Provider value={{ user, userProfile, loading, role, isAdmin, isBanned }}>
      {isBanned ? <BannedScreen /> : children}
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
