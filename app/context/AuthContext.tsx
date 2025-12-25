'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: string | null;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
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
      
      import('firebase/auth').then(({ onAuthStateChanged }) => {
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
                  console.warn('[AuthContext] Firebase db not initialized');
                  setRole(null);
                  setIsAdmin(false);
                  setLoading(false);
                  return;
                }
                
                const userDocRef = doc(db, 'users', currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                
                if (userDocSnap.exists()) {
                  const userData = userDocSnap.data();
                  const userRole = userData?.role || null;
                  setRole(userRole);
                  setIsAdmin(userRole === 'admin');
                  console.log('[AuthContext] User role:', userRole);
                } else {
                  setRole(null);
                  setIsAdmin(false);
                }
              } catch (error) {
                console.error('[AuthContext] Error fetching user role:', error);
                setRole(null);
                setIsAdmin(false);
              }
            } else {
              setRole(null);
              setIsAdmin(false);
            }
            
            setLoading(false);
          }, (error) => {
            console.error('[AuthContext] Auth error:', error);
            setUser(null);
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
    <AuthContext.Provider value={{ user, loading, role, isAdmin }}>
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
