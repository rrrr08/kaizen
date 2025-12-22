'use client';

import { useCart } from '@/app/context/CartContext';
import Link from 'next/link';
import { ShoppingCart, Trash2 } from 'lucide-react';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, getTotalPrice, getTotalItems } = useCart();
  const points = Math.floor(getTotalPrice() * 0.1);

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-20 h-20 text-white/20 mx-auto mb-8" />
          <h1 className="font-display text-6xl font-bold mb-6">YOUR CART IS EMPTY</h1>
          <p className="text-lg text-white/60 font-body mb-10">
            Discover amazing games in our repository
          </p>
          <Link
            href="/shop"
            className="inline-block px-8 py-4 bg-amber-500 text-black font-header-bold text-sm tracking-widest hover:bg-amber-400 transition-all rounded-lg uppercase shadow-lg hover:scale-105"
          >
            BROWSE GAMES
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-16 bg-black">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="mb-16">
          <Link
            href="/shop"
            className="font-header text-sm tracking-widest text-white/50 hover:text-amber-500 mb-8 inline-block transition-colors font-medium uppercase"
          >
            ← BACK TO SHOP
          </Link>
          <h1 className="font-display text-6xl font-bold tracking-tight mb-6">SHOPPING CART</h1>
          <p className="text-lg text-white/60 font-body">
            You have {getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="border border-white/10 rounded-lg p-6 bg-white/5 hover:border-amber-500/20 transition"
              >
                <div className="flex gap-6">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-24 h-32 object-cover rounded grayscale hover:grayscale-0 transition"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <Link
                      href={`/shop/${item.productId}`}
                      className="font-header text-xl tracking-wider hover:text-amber-500 transition mb-2 inline-block"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-sm text-white/60 mb-4 font-serif italic">
                      {item.product.description}
                    </p>

                    <div className="flex flex-wrap gap-4 items-center">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-white/20 rounded-sm">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="px-3 py-2 font-header text-[10px] hover:bg-white/5 transition"
                        >
                          −
                        </button>
                        <span className="px-4 py-2 font-header text-[10px] min-w-12 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="px-3 py-2 font-header text-[10px] hover:bg-white/5 transition"
                        >
                          +
                        </button>
                      </div>

                      {/* Price */}
                      <div className="flex-1 text-right">
                        <p className="text-white/60 text-sm mb-1">Price each</p>
                        <p className="font-serif italic text-xl text-amber-500">
                          ₹{item.product.price}
                        </p>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right">
                        <p className="text-white/60 text-sm mb-1">Subtotal</p>
                        <p className="font-serif italic text-xl text-amber-500">
                          ₹{item.product.price * item.quantity}
                        </p>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded transition"
                        title="Remove from cart"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 border border-white/10 rounded-lg p-8 bg-gradient-to-b from-white/5 to-transparent space-y-6">
              <h2 className="font-header text-2xl tracking-wider">ORDER SUMMARY</h2>

              {/* Items */}
              <div className="space-y-3 pb-6 border-b border-white/10">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-white/60">
                      {item.product.name} <span className="text-white/40">x{item.quantity}</span>
                    </span>
                    <span className="font-serif italic">₹{item.product.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="space-y-3 pb-6 border-b border-white/10">
                <div className="flex justify-between">
                  <span className="text-white/60">Subtotal</span>
                  <span className="font-serif italic">₹{getTotalPrice()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Shipping</span>
                  <span className="text-green-500 font-header text-[9px]">FREE</span>
                </div>
              </div>

              {/* Points */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                <p className="text-xs text-white/60 mb-2">YOU WILL EARN</p>
                <p className="font-header text-2xl tracking-wider text-amber-500">
                  +{points} <span className="text-sm text-white/60">PTS</span>
                </p>
              </div>

              {/* Total */}
              <div className="flex justify-between font-header text-lg tracking-wider pb-6 border-b border-white/10">
                <span>TOTAL</span>
                <span className="text-amber-500">₹{getTotalPrice()}</span>
              </div>

              {/* Buttons */}
              <Link
                href="/checkout"
                className="block w-full py-4 bg-amber-500 text-black font-header text-[10px] tracking-[0.4em] text-center hover:bg-amber-400 transition-all rounded-lg uppercase"
              >
                PROCEED TO CHECKOUT
              </Link>
              <Link
                href="/shop"
                className="block w-full py-4 border border-white/20 text-white font-header text-[10px] tracking-[0.4em] text-center hover:border-amber-500/40 transition-all rounded-lg uppercase"
              >
                CONTINUE SHOPPING
              </Link>

              {/* Info */}
              <p className="text-xs text-white/40 font-serif italic text-center">
                Points will be credited upon order confirmation
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
