'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '@/lib/types';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  appliedPointsDiscount: number;
  setAppliedPointsDiscount: (discount: number) => void;
  getFinalPrice: () => number;
  isLoading: boolean;
  mergeLocalCartWithFirebase: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_STORAGE_KEY = 'joy-juncture-cart';
const CART_USER_KEY = 'joy-juncture-cart-user';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [appliedPointsDiscount, setAppliedPointsDiscount] = useState(0);
  const { user } = useAuth();
  const [isClearing, setIsClearing] = useState(false);
  const [hasSynced, setHasSynced] = useState(false);
  const [lastUserId, setLastUserId] = useState<string | null>(null);

  // Helper: Save to localStorage
  const saveToLocalStorage = (cartItems: CartItem[], userId?: string | null) => {
    if (typeof window === 'undefined' || isClearing) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
      // Store userId to prevent cart transfer between users
      if (userId) {
        localStorage.setItem(CART_USER_KEY, userId);
      } else {
        localStorage.removeItem(CART_USER_KEY);
      }
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  };

  // Helper: Load from localStorage
  const loadFromLocalStorage = (currentUserId?: string | null): CartItem[] => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      const storedUserId = localStorage.getItem(CART_USER_KEY);

      // If user has changed, clear localStorage cart to prevent transfer
      if (currentUserId && storedUserId && storedUserId !== currentUserId) {
        console.log('User changed, clearing old cart from localStorage');
        localStorage.removeItem(CART_STORAGE_KEY);
        localStorage.removeItem(CART_USER_KEY);
        return [];
      }

      if (!stored) return [];
      const parsed = JSON.parse(stored);
      // Convert addedAt strings back to Date objects with validation
      return parsed.map((item: any) => {
        let addedAtDate;
        try {
          if (item.addedAt) {
            const testDate = new Date(item.addedAt);
            addedAtDate = !isNaN(testDate.getTime()) ? testDate : new Date();
          } else {
            addedAtDate = new Date();
          }
        } catch (error) {
          console.error('Error parsing addedAt date:', error);
          addedAtDate = new Date();
        }

        return {
          ...item,
          addedAt: addedAtDate,
        } as CartItem;
      });
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return [];
    }
  };

  // Helper: Save to Firebase
  const saveToFirebase = async (cartItems: CartItem[]) => {
    if (!user?.uid || isClearing) return;
    try {
      const { updateUserCart } = await import('@/lib/firebase');
      await updateUserCart(user.uid, cartItems);
    } catch (error) {
      console.error('Failed to save to Firebase:', error);
    }
  };

  // Helper: Load from Firebase
  const loadFromFirebase = async (): Promise<CartItem[]> => {
    if (!user?.uid) return [];
    try {
      const { getUserCart } = await import('@/lib/firebase');
      const cartData = await getUserCart(user.uid);
      // Convert addedAt strings back to Date objects with validation
      return (cartData || []).map((item: Partial<CartItem> & { addedAt?: string | number | Date }) => {
        let addedAtDate;
        try {
          if (item.addedAt) {
            const testDate = new Date(item.addedAt);
            addedAtDate = !isNaN(testDate.getTime()) ? testDate : new Date();
          } else {
            addedAtDate = new Date();
          }
        } catch (error) {
          console.error('Error parsing addedAt date:', error);
          addedAtDate = new Date();
        }

        return {
          ...item,
          addedAt: addedAtDate,
        } as CartItem;
      });
    } catch (error) {
      console.error('Failed to load from Firebase:', error);
      return [];
    }
  };

  // INITIAL LOAD: Load cart on mount
  useEffect(() => {
    const loadCart = async () => {
      if (isClearing) return;

      try {
        setIsLoading(true);

        // Detect user change (logout or switch)
        if (lastUserId && lastUserId !== (user?.uid || null)) {
          console.log('User changed from', lastUserId, 'to', user?.uid);
          // Clear everything when user changes
          setItems([]);
          saveToLocalStorage([], null);
          setHasSynced(false);
          setAppliedPointsDiscount(0);
        }

        setLastUserId(user?.uid || null);

        if (user?.uid) {
          // User authenticated: Load from Firebase
          const firebaseCart = await loadFromFirebase();

          // Merge with localStorage if not synced yet
          if (!hasSynced) {
            const localCart = loadFromLocalStorage(user.uid);
            if (localCart.length > 0) {
              // Merge: prefer higher quantity for duplicates
              const merged = [...firebaseCart];
              for (const localItem of localCart) {
                const existingIndex = merged.findIndex(
                  (item) => item.productId === localItem.productId
                );
                if (existingIndex >= 0) {
                  merged[existingIndex].quantity = Math.max(
                    merged[existingIndex].quantity,
                    localItem.quantity
                  );
                } else {
                  merged.push(localItem);
                }
              }
              setItems(merged);
              // Save merged cart to Firebase
              await saveToFirebase(merged);
              // Clear localStorage after merge
              saveToLocalStorage([], user.uid);
            } else {
              setItems(firebaseCart);
            }
            setHasSynced(true);
          } else {
            setItems(firebaseCart);
          }
        } else {
          // Guest user: Load from localStorage
          const localCart = loadFromLocalStorage(null);
          setItems(localCart);
        }
      } catch (error) {
        console.error('Failed to load cart:', error);
        // Fallback to localStorage
        const localCart = loadFromLocalStorage(user?.uid || null);
        setItems(localCart);
      } finally {
        setIsLoading(false);
        setMounted(true);
      }
    };

    loadCart();
  }, [user?.uid, isClearing]);

  // AUTO-SAVE: Save cart whenever items change
  useEffect(() => {
    if (!mounted || isClearing) return;

    const saveCart = async () => {
      if (user?.uid) {
        // Authenticated: Save to Firebase
        await saveToFirebase(items);
      } else {
        // Guest: Save to localStorage
        saveToLocalStorage(items, null);
      }
    };

    // Debounce saves
    const timer = setTimeout(saveCart, 500);
    return () => clearTimeout(timer);
  }, [items, mounted, user?.uid, isClearing]);

  const mergeLocalCartWithFirebase = async () => {
    if (!user?.uid || hasSynced) return;

    try {
      const localCart = loadFromLocalStorage(user.uid);
      if (localCart.length === 0) return;

      const firebaseCart = await loadFromFirebase();
      const merged = [...firebaseCart];

      for (const localItem of localCart) {
        const existingIndex = merged.findIndex(
          (item) => item.productId === localItem.productId
        );
        if (existingIndex >= 0) {
          merged[existingIndex].quantity = Math.max(
            merged[existingIndex].quantity,
            localItem.quantity
          );
        } else {
          merged.push(localItem);
        }
      }

      setItems(merged);
      await saveToFirebase(merged);
      saveToLocalStorage([], user.uid);
      setHasSynced(true);
    } catch (error) {
      console.error('Error merging cart:', error);
    }
  };

  const addToCart = (product: Product, quantity: number) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.productId === product.id);

      if (existingItem) {
        return prevItems.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [
        ...prevItems,
        {
          productId: product.id,
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            description: product.description,
            image: product.image,
            story: product.story || '',
            howToPlay: product.howToPlay || '',
            players: product.players || '',
            occasion: product.occasion || [],
            mood: product.mood || '',
            badges: product.badges || [],
            time: product.time || '',
            stock: product.stock || 0,
          },
          quantity,
          addedAt: new Date(),
        },
      ];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = async () => {
    console.log('clearCart called');
    setIsClearing(true);

    try {
      // Clear localStorage FIRST
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(CART_STORAGE_KEY);
          localStorage.removeItem(CART_USER_KEY);
          localStorage.removeItem('kaizen_cart');
          localStorage.removeItem('joy-juncture-cart');
          console.log('localStorage cleared');
        } catch (error) {
          console.error('Failed to clear localStorage:', error);
        }
      }

      // Clear Firebase if user is authenticated
      if (user?.uid) {
        try {
          const { clearUserCart } = await import('@/lib/firebase');
          await clearUserCart(user.uid);
          console.log('Firebase cart cleared');
        } catch (error) {
          console.error('Failed to clear Firebase cart:', error);
        }
      }

      // Clear state LAST
      setItems([]);
      setAppliedPointsDiscount(0);
      console.log('Cart state cleared');
    } finally {
      // Reset clearing flag immediately to allow reloads
      setIsClearing(false);
    }
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      const price = item.product?.price || 0;
      return total + price * item.quantity;
    }, 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getFinalPrice = () => {
    return Math.max(0, getTotalPrice() - appliedPointsDiscount);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
        appliedPointsDiscount,
        setAppliedPointsDiscount,
        getFinalPrice,
        isLoading,
        mergeLocalCartWithFirebase,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
