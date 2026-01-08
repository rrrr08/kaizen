'use client';

import { useCart } from '@/app/context/CartContext';
import Link from 'next/link';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, Coins } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

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
    <div className="min-h-screen pt-24 md:pt-32 pb-16 bg-[#FFFDF5] text-[#2D3436]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-black/5 pb-10">
          <div>
            <Link
              href="/shop"
              className="font-black text-[10px] tracking-[0.3em] text-[#6C5CE7] hover:text-black mb-4 inline-flex items-center gap-2 transition-colors uppercase"
            >
              <ArrowLeft size={14} /> BACK TO SHOP
            </Link>
            <h1 className="font-header text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter mb-2 text-black leading-none">SHOPPING BAG</h1>
            <p className="text-sm md:text-xl text-black/40 font-medium italic">
              Currently holding {getTotalItems()} curiosity{getTotalItems() !== 1 ? 'ies' : ''}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {items.map((item) => (
              <motion.div
                layout
                key={item.productId}
                className="group bg-white/60 backdrop-blur-md border border-black/5 rounded-[2.5rem] p-4 md:p-6 shadow-xl shadow-black/[0.02] hover:shadow-black/[0.05] transition-all"
              >
                <div className="flex gap-4 md:gap-8">
                  {/* Product Image */}
                  <div className="flex-shrink-0 relative">
                    <div className="w-20 md:w-32 h-28 md:h-44 rounded-3xl overflow-hidden border border-black/5 shadow-inner relative">
                      <Image
                        src={item.product?.image || '/placeholder-product.png'}
                        alt={item.product?.name || 'Product'}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <Link
                          href={`/shop/${item.productId}`}
                          className="font-header text-lg md:text-2xl tracking-tight text-black hover:text-[#6C5CE7] transition leading-tight"
                        >
                          {item.product?.name || 'Product'}
                        </Link>
                        <p className="font-black text-base md:text-2xl text-black">
                          ₹{(item.product?.price || 0).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-[10px] md:text-sm text-black/40 mb-4 font-bold uppercase tracking-widest mt-1">
                        Category: {item.product?.category || 'General'}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-4 items-center justify-between mt-auto">
                      {/* Quantity Selector */}
                      <div className="flex items-center bg-white/80 backdrop-blur-sm border border-black/5 rounded-2xl overflow-hidden shadow-sm">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-10 h-10 flex items-center justify-center hover:bg-red-50 text-black transition-colors"
                        >
                          <Minus size={14} strokeWidth={3} />
                        </button>
                        <span className="w-10 text-center font-black text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-10 h-10 flex items-center justify-center hover:bg-emerald-50 text-black transition-colors"
                        >
                          <Plus size={14} strokeWidth={3} />
                        </button>
                      </div>

                      {/* Subtotal & Actions */}
                      <div className="flex items-center gap-4 md:gap-8">
                        <div className="text-right hidden sm:block">
                          <p className="text-[10px] font-black uppercase tracking-widest text-black/20 leading-none mb-1">Total</p>
                          <p className="font-black text-xl text-[#6C5CE7]">
                            ₹{((item.product?.price || 0) * item.quantity).toLocaleString()}
                          </p>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="w-10 h-10 flex items-center justify-center rounded-2xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm group/btn"
                          title="Remove from cart"
                        >
                          <Trash2 size={16} strokeWidth={2.5} />
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
            <div className="sticky top-32 bg-white/80 backdrop-blur-xl border border-black/5 rounded-[3rem] p-8 shadow-2xl space-y-8">
              <h2 className="font-header text-xl md:text-2xl tracking-tight font-black text-black">SUMMARY</h2>

              {/* Items Summary - Hidden on mobile if too many */}
              <div className="space-y-4 pb-8 border-b border-black/5 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between items-start gap-4">
                    <span className="text-xs font-bold text-black/60 line-clamp-1 flex-1">
                      {item.product?.name} <span className="text-black/30 font-black ml-1">x{item.quantity}</span>
                    </span>
                    <span className="text-xs font-black text-black">₹{((item.product?.price || 0) * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="space-y-4 pb-8 border-b border-black/5">
                <div className="flex justify-between text-sm md:text-base font-bold">
                  <span className="text-black/40">Subtotal</span>
                  <span className="text-black">₹{getTotalPrice().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm md:text-base font-bold">
                  <span className="text-black/40">Shipping</span>
                  <span className="text-[#00B894] font-black italic">FREE</span>
                </div>
              </div>

              {/* Points */}
              <div className="bg-[#6C5CE7] rounded-3xl p-5 flex items-center gap-5 border border-white/20 shadow-xl shadow-purple-200 text-white">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center border border-white/30 backdrop-blur-md shadow-inner">
                  <Coins className="text-white w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-white/60 tracking-widest mb-1">Est. Earnings</p>
                  <p className="font-header text-3xl tracking-tight leading-none font-black">
                    +{points.toLocaleString()} <span className="text-[10px] opacity-60">JP</span>
                  </p>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-end pb-4 pt-2">
                <span className="text-xs font-black text-black/30 uppercase tracking-[0.2em] mb-1">Total Due</span>
                <span className="font-header text-3xl md:text-4xl font-black text-black leading-none tracking-tighter">₹{getTotalPrice().toLocaleString()}</span>
              </div>

              {/* Buttons */}
              <div className="space-y-3 pt-4">
                <Link
                  href="/checkout"
                  className="flex items-center justify-center w-full py-5 bg-black text-white font-black text-sm tracking-[0.2em] rounded-[2rem] shadow-xl shadow-black/20 hover:scale-[1.02] transition-all uppercase"
                >
                  Checkout Now
                </Link>
                <Link
                  href="/shop"
                  className="flex items-center justify-center w-full py-5 bg-white border border-black/5 text-black font-black text-xs tracking-[0.2em] rounded-[2rem] shadow-sm hover:bg-gray-50 transition-all uppercase"
                >
                  Keep Exploring
                </Link>
              </div>

              {/* Info */}
              <p className="text-[10px] text-black/20 font-black text-center uppercase tracking-widest">
                Safe & Secure Checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
