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
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isBanned, setIsBanned] = useState(false);

  const fetchUserData = async (currentUser: User) => {
    try {
      const { db } = await import('@/lib/firebase');
      if (!db) return;

      const { doc, getDoc } = await import('firebase/firestore');
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data() as UserProfile;

        // Ensure photoURL and image are synced in the object for consistency
        const normalizedData: UserProfile = {
          ...userData,
          photoURL: userData.photoURL || userData.image || currentUser.photoURL || null,
          image: userData.image || userData.photoURL || currentUser.photoURL || null,
        };

        setIsBanned(!!normalizedData.isBanned);
        setUserProfile(normalizedData);
        setRole(normalizedData.role || null);
        setIsAdmin(normalizedData.role === 'admin');
      } else {
        setUserProfile(null);
        setRole(null);
        setIsAdmin(false);
        setIsBanned(false);
      }
    } catch (error) {
      console.error('[AuthContext] Error fetching user data:', error);
      setUserProfile(null);
      setRole(null);
      setIsAdmin(false);
      setIsBanned(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserData(user);
    }
  };

  useEffect(() => {
    let unsubscribe: () => void;

    // Lazy load Firebase
    import('@/lib/firebase').then(({ auth }) => {
      if (!auth) {
        setLoading(false);
        return;
      }

      import('firebase/auth').then(({ onAuthStateChanged }) => {
        unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
          setUser(currentUser);
          if (currentUser) {
            await fetchUserData(currentUser);
          } else {
            setUserProfile(null);
            setRole(null);
            setIsAdmin(false);
            setIsBanned(false);
          }
          setLoading(false);
        });
      });
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, role, isAdmin, isBanned, refreshProfile }}>
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
