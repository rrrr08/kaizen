'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '@/lib/types';
import { getUserCart, updateUserCart, clearUserCart } from '@/lib/firebase';
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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [appliedPointsDiscount, setAppliedPointsDiscount] = useState(0);
  const { user } = useAuth();
  const [pendingSync, setPendingSync] = useState(false);

  // Load cart from Firebase on mount and when user changes
  useEffect(() => {
    const loadCart = async () => {
      if (!user?.uid) {
        setItems([]);
        setIsLoading(false);
        setMounted(true);
        return;
      }

      try {
        setIsLoading(true);
        const cartData = await getUserCart(user.uid);
        setItems(cartData || []);
      } catch (error) {
        console.error('Failed to load cart from Firebase:', error);
        setItems([]);
      } finally {
        setIsLoading(false);
        setMounted(true);
      }
    };

    loadCart();
  }, [user?.uid]);

  // Save cart to Firebase whenever it changes (debounced)
  useEffect(() => {
    if (!mounted || !user?.uid || pendingSync) return;

    setPendingSync(true);
    const timer = setTimeout(async () => {
      try {
        await updateUserCart(user.uid, items);
      } catch (error) {
        console.error('Failed to save cart to Firebase:', error);
      } finally {
        setPendingSync(false);
      }
    }, 500); // Debounce by 500ms

    return () => clearTimeout(timer);
  }, [items, mounted, user?.uid, pendingSync]);

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
        await clearUserCart(user.uid);
      } catch (error) {
        console.error('Failed to clear cart in Firebase:', error);
      }
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
