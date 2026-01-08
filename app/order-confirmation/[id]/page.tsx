'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const dynamic = 'force-dynamic';

interface Order {
  id: string;
  items: any[];
  totalPrice: number;
  totalPoints: number;
  shippingAddress: any;
  createdAt: string;
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const { getOrderById } = await import('@/lib/firebase');
        const orderId = params.id as string;

        // Load from Firebase only
        const firebaseOrder = await getOrderById(orderId);
        if (firebaseOrder) {
          setOrder(firebaseOrder as any);
        } else {
          console.error('Order not found in Firebase');
          setOrder(null);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading order:', error);
        setLoading(false);
      }
    };

    loadOrder();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-[#FFFDF5]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-black border-t-[#FFD93D] mb-4"></div>
          <p className="text-black font-black text-xs tracking-[0.4em]">VERIFYING ORDER...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-[#FFFDF5]">
        <div className="text-center">
          <h1 className="font-header text-6xl font-black mb-6 text-black">ORDER NOT FOUND</h1>
          <Link href="/shop" className="inline-block px-8 py-4 bg-[#FFD93D] text-black font-black text-sm rounded-[15px] border-2 border-black neo-shadow hover:scale-105 transition-all">
            RETURN TO SHOP
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 md:pt-32 pb-16 bg-[#FFFDF5] text-[#2D3436]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-12">
        {/* Success Message */}
        <div className="text-center mb-12 md:mb-20">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 15 }}
            className="flex justify-center mb-8"
          >
            <div className="w-20 md:w-28 h-20 md:h-28 bg-[#00B894] rounded-full flex items-center justify-center shadow-2xl shadow-emerald-100 border border-white/20">
              <CheckCircle className="w-10 md:w-14 h-10 md:h-14 text-white" strokeWidth={2.5} />
            </div>
          </motion.div>
          <h1 className="font-header text-4xl md:text-7xl font-black mb-6 tracking-tighter text-black leading-none uppercase">
            Curiosity<br /><span className="text-[#00B894] italic font-serif">Secured!</span>
          </h1>
          <p className="text-sm md:text-xl text-black/40 font-medium italic max-w-lg mx-auto">
            High five! Your loot is safely cataloged. We&apos;ve dispatched a receipt to your digital inbox.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-black/5 rounded-[2.5rem] p-6 md:p-10 shadow-2xl shadow-black/[0.03] mb-8 relative overflow-hidden">
          {/* Decorative gradients */}
          <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-[#FFD93D]/10 rounded-full blur-[60px] pointer-events-none"></div>
          <div className="absolute bottom-[-50px] left-[-50px] w-40 h-40 bg-[#6C5CE7]/10 rounded-full blur-[60px] pointer-events-none"></div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10 relative z-10">
            <div>
              <p className="text-[10px] font-black tracking-[0.3em] text-black/20 mb-3 uppercase">Chronicle ID</p>
              <p className="font-mono text-sm font-bold bg-black/5 px-3 py-1.5 rounded-xl border border-black/5 inline-block text-black/60">{order.id.slice(0, 12)}</p>
            </div>
            <div>
              <p className="text-[10px] font-black tracking-[0.3em] text-black/20 mb-3 uppercase">Creation Date</p>
              <p className="font-header text-xl md:text-2xl font-black text-black">
                {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black tracking-[0.3em] text-black/20 mb-3 uppercase">Total Offering</p>
              <p className="font-header text-3xl md:text-4xl font-black text-[#6C5CE7] tracking-tight">₹{order.totalPrice.toLocaleString()}</p>
            </div>
          </div>

          {/* Points Earned */}
          <div className="border-t border-black/5 pt-10 relative z-10 text-center sm:text-left">
            <div className="bg-gradient-to-br from-[#FFD93D] to-[#F9CA24] rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-xl shadow-yellow-100 border border-white/20">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center border border-white/30 backdrop-blur-md shadow-inner text-3xl">
                🏆
              </div>
              <div>
                <p className="text-[10px] font-black tracking-[0.2em] text-black/40 uppercase mb-1">JP Stash Bonus</p>
                <p className="font-header text-4xl md:text-5xl font-black tracking-tighter text-black leading-none">+{order.totalPoints.toLocaleString()} <span className="text-xs opacity-40">PTS</span></p>
                <p className="text-sm text-black/60 font-bold mt-2 italic">
                  Points have been infused into your wallet!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Items & Address Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12">
          {/* Items */}
          <div className="bg-white/60 backdrop-blur-md border border-black/5 rounded-[2.5rem] p-8 shadow-xl shadow-black/[0.02]">
            <h2 className="font-header text-2xl mb-8 font-black flex items-center gap-3 text-black">
              <ShoppingBag size={24} className="text-[#6C5CE7]" />
              THE LOOT
            </h2>
            <div className="space-y-6">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-start gap-4 pb-4 border-b border-black/5 last:border-0 last:pb-0">
                  <div className="flex-1">
                    <p className="font-bold text-black text-sm md:text-base leading-tight">{item.product.name}</p>
                    <p className="text-[10px] font-black text-black/20 uppercase tracking-widest mt-1">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-black text-black text-sm md:text-base">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Address */}
          <div className="bg-white/40 backdrop-blur-md border border-black/5 rounded-[2.5rem] p-8 shadow-xl shadow-black/[0.02]">
            <h2 className="font-header text-2xl mb-8 font-black text-black">DESTINATION</h2>
            <div className="text-black font-bold text-sm space-y-2">
              <p className="text-xl font-black mb-3 capitalize text-[#00B894] tracking-tight">{order.shippingAddress.name}</p>
              <div className="space-y-1 text-black/60 italic">
                <p>{order.shippingAddress.address}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
              </div>
              <div className="mt-6 pt-6 border-t border-black/5 space-y-1">
                <p className="text-[10px] font-black text-black/20 uppercase tracking-widest leading-none mb-2">Comms Details</p>
                <p className="text-black/60">{order.shippingAddress.phone}</p>
                <p className="text-black/60 truncate">{order.shippingAddress.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 px-2">
          <Link
            href="/wallet"
            className="flex-1 py-5 bg-white border border-black/5 text-black font-black text-xs tracking-[0.2em] text-center rounded-[2rem] shadow-sm hover:gray-50 transition-all uppercase"
          >
            Check Your Stash
          </Link>
          <Link
            href="/shop"
            className="flex-1 py-5 bg-black text-white font-black text-xs tracking-[0.2em] text-center rounded-[2rem] shadow-xl shadow-black/20 hover:scale-[1.02] hover:bg-[#6C5CE7] transition-all flex items-center justify-center gap-3 uppercase"
          >
            Continue Journey <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
