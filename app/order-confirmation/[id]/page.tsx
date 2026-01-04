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
    <div className="min-h-screen pt-32 pb-16 bg-[#FFFDF5] text-[#2D3436]">
      <div className="max-w-3xl mx-auto px-6 md:px-12">
        {/* Success Message */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex justify-center mb-8"
          >
            <div className="w-24 h-24 bg-[#00B894] rounded-full flex items-center justify-center border-3 border-black neo-shadow">
              <CheckCircle className="w-12 h-12 text-white" strokeWidth={3} />
            </div>
          </motion.div>
          <h1 className="font-header text-6xl md:text-7xl font-black mb-6 tracking-tighter text-black leading-none">
            ORDER<br /><span className="text-[#00B894] drop-shadow-[3px_3px_0px_#000]">CONFIRMED!</span>
          </h1>
          <p className="text-xl text-black/70 font-bold max-w-lg mx-auto">
            High five! Your loot is secured. We&apos;ve sent a receipt to your inbox.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white border-2 border-black rounded-[25px] p-8 neo-shadow mb-8 relative overflow-hidden">
          {/* Decorative bg */}
          <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-[#FFD93D]/20 rounded-full blur-[40px]"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 relative z-10">
            <div>
              <p className="text-[10px] font-black tracking-[0.2em] text-black/40 mb-2 uppercase">ORDER ID</p>
              <p className="font-mono text-lg font-bold bg-[#F0F0F0] px-3 py-1 rounded border border-black/10 inline-block">{order.id.slice(0, 10)}...</p>
            </div>
            <div>
              <p className="text-[10px] font-black tracking-[0.2em] text-black/40 mb-2 uppercase">DATE</p>
              <p className="font-header text-xl font-black text-black">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black tracking-[0.2em] text-black/40 mb-2 uppercase">TOTAL</p>
              <p className="font-header text-3xl font-black text-[#6C5CE7]">₹{order.totalPrice}</p>
            </div>
          </div>

          {/* Points Earned */}
          <div className="border-t-2 border-dashed border-black/20 pt-8 relative z-10">
            <div className="bg-[#FFD93D] border-2 border-black rounded-xl p-6 flex items-center gap-6 shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-2 border-black font-black text-2xl">
                🏆
              </div>
              <div>
                <p className="text-xs font-black tracking-[0.1em] text-black/60 uppercase mb-1">XP Gained</p>
                <p className="font-header text-4xl font-black tracking-tight text-black">+{order.totalPoints} PTS</p>
                <p className="text-sm text-black font-bold mt-1">
                  Added to your stash!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Items & Address Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Items */}
          <div className="bg-white border-2 border-black rounded-[25px] p-8 neo-shadow">
            <h2 className="font-header text-2xl mb-6 font-black flex items-center gap-2">
              <ShoppingBag size={24} />
              THE LOOT
            </h2>
            <div className="space-y-4">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-start pb-4 border-b-2 border-black/5 last:border-0">
                  <div>
                    <p className="font-bold text-black text-sm">{item.product.name}</p>
                    <p className="text-xs font-bold text-black/40">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-black text-black">₹{item.product.price * item.quantity}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Address */}
          <div className="bg-[#FFFDF5] border-2 border-black rounded-[25px] p-8 neo-shadow">
            <h2 className="font-header text-2xl mb-6 font-black">SHIPPING TO</h2>
            <div className="text-black font-bold text-sm space-y-1">
              <p className="text-lg mb-2 capitalize">{order.shippingAddress.name}</p>
              <p className="text-black/70">{order.shippingAddress.address}</p>
              <p className="text-black/70">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
              <div className="mt-4 pt-4 border-t-2 border-black/5">
                <p className="text-black/50 text-xs uppercase tracking-wide">Contact</p>
                <p>{order.shippingAddress.phone}</p>
                <p>{order.shippingAddress.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/wallet"
            className="flex-1 py-4 bg-white border-2 border-black text-black font-black text-sm tracking-wider text-center hover:bg-gray-50 hover:-translate-y-1 transition-all rounded-[15px] uppercase neo-shadow"
          >
            VIEW WALLET
          </Link>
          <Link
            href="/shop"
            className="flex-1 py-4 bg-black text-white border-2 border-black font-black text-sm tracking-wider text-center hover:bg-[#6C5CE7] hover:-translate-y-1 transition-all rounded-[15px] uppercase neo-shadow flex items-center justify-center gap-2"
          >
            CONTINUE SHOPPING <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
