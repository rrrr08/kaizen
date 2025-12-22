'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[AuthContext] Mounting - initializing auth listener');
    
    // Check if auth object is ready
    console.log('[AuthContext] Auth object:', {
      currentUser: auth.currentUser?.email || 'null',
      app: auth.app.name
    });
    
    // Initialize auth state from Firebase
    console.log('[AuthContext] Initializing onAuthStateChanged listener');
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('[AuthContext] Auth state changed:', {
        email: currentUser?.email || 'logged out',
        uid: currentUser?.uid,
        timestamp: new Date().toLocaleTimeString()
      });
      setUser(currentUser);
      setLoading(false);
    });

    return () => {
      console.log('[AuthContext] Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
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
