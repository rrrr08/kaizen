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

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [appliedPointsDiscount, setAppliedPointsDiscount] = useState(0);
  const { user } = useAuth();
  const [pendingSync, setPendingSync] = useState(false);
  const [hasMergedCart, setHasMergedCart] = useState(false);

  // Save cart to localStorage whenever items change (for unauthenticated users)
  useEffect(() => {
    if (!mounted) return;
    
    try {
      // Always save to localStorage as backup
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [items, mounted]);

  // Load cart from localStorage or Firebase
  useEffect(() => {
    const loadCart = async () => {
      try {
        setIsLoading(true);

        // User is authenticated
        if (user?.uid) {
          // Lazy load Firebase functions
          const { getUserCart, updateUserCart } = await import('@/lib/firebase');
          const cartData = await getUserCart(user.uid);
          
          // Merge local cart with Firebase on first authentication
          if (!hasMergedCart) {
            const localCart = getLocalCart();
            if (localCart.length > 0) {
              // Merge: combine both carts, preferring higher quantity for duplicate items
              const mergedCart = [...(cartData || [])];
              
              for (const localItem of localCart) {
                const existingIndex = mergedCart.findIndex(item => item.productId === localItem.productId);
                if (existingIndex >= 0) {
                  // Item exists in both - take the higher quantity
                  mergedCart[existingIndex].quantity = Math.max(
                    mergedCart[existingIndex].quantity,
                    localItem.quantity
                  );
                } else {
                  // Item only in local cart - add it
                  mergedCart.push(localItem);
                }
              }
              
              // Save merged cart to Firebase and update state
              await updateUserCart(user.uid, mergedCart);
              setItems(mergedCart);
              
              // Clear local cart since we've merged it
              saveLocalCart([]);
            } else {
              // No local cart, just use Firebase cart
              setItems(cartData || []);
            }
            setHasMergedCart(true);
          } else {
            // Already merged, just load from Firebase
            setItems(cartData || []);
          }
        } else {
          // User is not authenticated - load from localStorage
          const localCart = getLocalCart();
          setItems(localCart);
        }
      } catch (error) {
        console.error('Failed to load cart:', error);
        // Fallback to localStorage
        const localCart = getLocalCart();
        setItems(localCart);
      } finally {
        setIsLoading(false);
        setMounted(true);
      }
    };

    loadCart();
  }, [user?.uid, hasMergedCart]);

  // Save cart to Firebase when user is authenticated, or localStorage when not
  useEffect(() => {
    if (!mounted || pendingSync) return;

    setPendingSync(true);
    const timer = setTimeout(async () => {
      try {
        if (user?.uid) {
          // User authenticated - save to Firebase
          const { updateUserCart } = await import('@/lib/firebase');
          await updateUserCart(user.uid, items);
        } else {
          // User not authenticated - save to localStorage
          saveLocalCart(items);
        }
      } catch (error) {
        console.error('Failed to save cart:', error);
        // Fallback: save to localStorage
        if (!user?.uid) {
          saveLocalCart(items);
        }
      } finally {
        setPendingSync(false);
      }
    }, 500); // Debounce by 500ms

    return () => clearTimeout(timer);
  }, [items, mounted, user?.uid, pendingSync]);

  const getLocalCart = (): CartItem[] => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading local cart:', error);
      return [];
    }
  };

  const saveLocalCart = (cartItems: CartItem[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving local cart:', error);
    }
  };

  const mergeLocalCartWithFirebase = async () => {
    if (!user?.uid) return;

    try {
      // Lazy load Firebase functions
      const { getUserCart, updateUserCart } = await import('@/lib/firebase');
      const localCart = getLocalCart();
      const firebaseCart = await getUserCart(user.uid);

      if (localCart.length === 0) return;

      // Merge carts: if item exists in both, take the one with higher quantity
      const mergedCart = [...(firebaseCart || [])];

      for (const localItem of localCart) {
        const existingIndex = mergedCart.findIndex(item => item.productId === localItem.productId);
        
        if (existingIndex >= 0) {
          // Item exists in both - take the higher quantity
          mergedCart[existingIndex].quantity = Math.max(
            mergedCart[existingIndex].quantity,
            localItem.quantity
          );
        } else {
          // Item only in local cart - add it
          mergedCart.push(localItem);
        }
      }

      // Save merged cart to Firebase and state
      await updateUserCart(user.uid, mergedCart);
      setItems(mergedCart);

      // Clear local cart
      saveLocalCart([]);
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
          product,
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
    setItems([]);
    if (user?.uid) {
      try {
        // Lazy load Firebase function
        const { clearUserCart } = await import('@/lib/firebase');
        await clearUserCart(user.uid);
      } catch (error) {
        console.error('Failed to clear cart in Firebase:', error);
      }
    } else {
      saveLocalCart([]);
    }
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.product.price * item.quantity, 0);
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
