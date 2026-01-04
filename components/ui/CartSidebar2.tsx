'use client';

import { useState } from 'react';
import { useCart } from '@/app/context/CartContext';
import Link from 'next/link';
import { ShoppingCart, X } from 'lucide-react';
import Image from 'next/image';

export default function CartSidebar() {
  const { items, getTotalPrice, removeFromCart, updateQuantity, getTotalItems } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const points = Math.floor(getTotalPrice() * 0.1); // 10% points on purchase

  return (
    <>
      {/* Cart Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 z-40 p-4 bg-amber-500 hover:bg-amber-400 text-black rounded-full transition-all shadow-lg flex items-center justify-center"
        title="Shopping Cart"
      >
        <ShoppingCart className="w-6 h-6" />
        {getTotalItems() > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
            {getTotalItems()}
          </span>
        )}
      </button>

      {/* Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-gradient-to-b from-slate-900 to-black border-l border-amber-500/20 flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="font-header text-2xl tracking-wider">CART</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/60 hover:text-white transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center">
                  <div>
                    <ShoppingCart className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60 font-serif italic">Your cart is empty</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-amber-500/20 transition"
                    >
                      <div className="flex gap-4 mb-3">
                        <div className="w-16 h-20 relative rounded grayscale overflow-hidden">
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-header text-sm tracking-wider line-clamp-2">
                            {item.product.name}
                          </h3>
                          <p className="text-amber-500 font-serif italic text-sm mt-1">
                            ₹{item.product.price}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-white/20 rounded">
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity - 1)
                            }
                            className="px-2 py-1 text-xs hover:bg-white/5"
                          >
                            −
                          </button>
                          <span className="px-3 py-1 text-xs font-header">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1)
                            }
                            className="px-2 py-1 text-xs hover:bg-white/5"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-white/60 mb-1">
                            ₹{item.product.price * item.quantity}
                          </p>
                          <button
                            onClick={() => removeFromCart(item.productId)}
                            className="text-xs text-red-500 hover:text-red-400 font-header"
                          >
                            REMOVE
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-white/10 p-6 space-y-4">
                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Subtotal</span>
                    <span className="font-serif italic">₹{getTotalPrice()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-amber-500">
                    <span>Points Earned</span>
                    <span className="font-header tracking-wider">+{points}</span>
                  </div>
                  <div className="h-px bg-white/10 my-2" />
                  <div className="flex justify-between font-header tracking-wider text-lg">
                    <span>TOTAL</span>
                    <span className="text-amber-500">₹{getTotalPrice()}</span>
                  </div>
                </div>

                {/* Actions */}
                <Link
                  href="/checkout"
                  onClick={() => setIsOpen(false)}
                  className="block w-full py-3 bg-amber-500 text-black font-header text-[10px] tracking-[0.4em] text-center hover:bg-amber-400 transition-all rounded-sm uppercase"
                >
                  PROCEED TO CHECKOUT
                </Link>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full py-3 border border-white/20 text-white font-header text-[10px] tracking-[0.4em] hover:border-amber-500/40 transition-all rounded-sm uppercase"
                >
                  <Link href="/cart">CONTINUE SHOPPING</Link>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
