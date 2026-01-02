'use client';

import { useCart } from '@/app/context/CartContext';
import Link from 'next/link';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, getTotalPrice, getTotalItems, isLoading } = useCart();
  const points = Math.floor(getTotalPrice() * 0.1);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-[#FFFDF5]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-black border-t-[#FFD93D] mb-4"></div>
          <p className="text-black font-black text-xs tracking-[0.4em]">LOADING CART...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-[#FFFDF5]">
        <div className="text-center max-w-lg mx-auto p-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-24 h-24 bg-[#FF7675] rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-black neo-shadow"
          >
            <ShoppingCart className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="font-header text-5xl font-black mb-6 text-black">YOUR CART IS EMPTY</h1>
          <p className="text-xl text-black/60 font-medium mb-10">
            Discover amazing games in our repository and start playing today!
          </p>
          <Link
            href="/shop"
            className="inline-block px-8 py-4 bg-[#FFD93D] text-black font-black text-sm tracking-[0.2em] hover:scale-105 transition-all rounded-xl uppercase border-2 border-black neo-shadow"
          >
            BROWSE GAMES
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-16 bg-[#FFFDF5] text-[#2D3436]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <Link
              href="/shop"
              className="font-black text-xs tracking-[0.3em] text-[#6C5CE7] hover:text-black mb-4 inline-flex items-center gap-2 transition-colors uppercase"
            >
              <ArrowLeft size={16} /> BACK TO SHOP
            </Link>
            <h1 className="font-header text-6xl md:text-7xl font-black tracking-tighter mb-2 text-black">SHOPPING CART</h1>
            <p className="text-xl text-black/60 font-bold">
              You have {getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''} in your cart
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <motion.div
                layout
                key={item.productId}
                className="group border-2 border-black rounded-[20px] p-6 bg-white neo-shadow hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] transition-all"
              >
                <div className="flex gap-6">
                  {/* Product Image */}
                  <div className="flex-shrink-0 relative">
                    <div className="w-24 h-32 rounded-xl overflow-hidden border-2 border-black shadow-[2px_2px_0px_#000]">
                      <img
                        src={item.product?.image || '/placeholder-product.png'}
                        alt={item.product?.name || 'Product'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <Link
                          href={`/shop/${item.productId}`}
                          className="font-header text-2xl tracking-tight text-black hover:text-[#6C5CE7] transition"
                        >
                          {item.product?.name || 'Product'}
                        </Link>
                        <p className="font-black text-xl text-black">
                          ₹{item.product?.price || 0}
                        </p>
                      </div>
                      <p className="text-sm text-black/60 mb-4 font-medium line-clamp-2 mt-1">
                        {item.product?.description || ''}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-4 items-center justify-between mt-2">
                      {/* Quantity Selector */}
                      <div className="flex items-center bg-[#FFFDF5] border-2 border-black rounded-lg overflow-hidden shadow-[2px_2px_0px_#000]">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-10 h-10 flex items-center justify-center hover:bg-[#FF7675] hover:text-white transition-colors"
                        >
                          <Minus size={16} strokeWidth={3} />
                        </button>
                        <span className="w-12 text-center font-black text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-10 h-10 flex items-center justify-center hover:bg-[#00B894] hover:text-white transition-colors"
                        >
                          <Plus size={16} strokeWidth={3} />
                        </button>
                      </div>

                      {/* Subtotal & Actions */}
                      <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                          <p className="text-[10px] font-black uppercase tracking-widest text-black/40">Subtotal</p>
                          <p className="font-black text-lg text-[#6C5CE7]">
                            ₹{(item.product?.price || 0) * item.quantity}
                          </p>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="w-10 h-10 flex items-center justify-center rounded-lg border-2 border-black bg-white text-black hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_#000]"
                          title="Remove from cart"
                        >
                          <Trash2 size={18} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 border-2 border-black rounded-[25px] p-8 bg-[#FFD93D] neo-shadow space-y-6">
              <h2 className="font-header text-2xl tracking-tight font-black text-black">ORDER SUMMARY</h2>

              {/* Items */}
              <div className="space-y-3 pb-6 border-b-2 border-black/10">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm font-bold">
                    <span className="text-black/70">
                      {item.product?.name || 'Product'} <span className="text-black/40">x{item.quantity}</span>
                    </span>
                    <span className="text-black">₹{(item.product?.price || 0) * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="space-y-3 pb-6 border-b-2 border-black/10">
                <div className="flex justify-between font-bold">
                  <span className="text-black/70">Subtotal</span>
                  <span className="text-black">₹{getTotalPrice()}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-black/70">Shipping</span>
                  <span className="text-[#00B894] font-black text-xs bg-white px-2 py-1 rounded border-2 border-black uppercase">FREE</span>
                </div>
              </div>

              {/* Points */}
              <div className="bg-white/50 border-2 border-black rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-[#6C5CE7] rounded-full flex items-center justify-center border-2 border-black text-white font-black">
                  P
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-black/60">YOU WILL EARN</p>
                  <p className="font-header text-2xl tracking-tight text-black leading-none">
                    +{points} <span className="text-xs font-black">PTS</span>
                  </p>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-end font-header text-3xl tracking-tight pb-2">
                <span className="text-black text-base font-black tracking-widest uppercase mb-1">Total</span>
                <span className="text-black">₹{getTotalPrice()}</span>
              </div>

              {/* Buttons */}
              <Link
                href="/checkout"
                className="block w-full py-4 bg-black text-white font-black text-xs tracking-[0.3em] text-center hover:bg-neutral-800 hover:scale-[1.02] transition-all rounded-xl uppercase shadow-[4px_4px_0px_#FFF]"
              >
                PROCEED TO CHECKOUT
              </Link>
              <Link
                href="/shop"
                className="block w-full py-4 bg-white border-2 border-black text-black font-black text-xs tracking-[0.3em] text-center hover:bg-gray-50 hover:scale-[1.02] transition-all rounded-xl uppercase shadow-[4px_4px_0px_rgba(0,0,0,0.1)]"
              >
                CONTINUE SHOPPING
              </Link>

              {/* Info */}
              <p className="text-[10px] text-black/50 font-bold text-center uppercase tracking-wider">
                Points credited after delivery
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
