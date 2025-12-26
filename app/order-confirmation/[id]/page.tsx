'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { LoadingScreen } from '@/components/ui/loading-screen';

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
    return <LoadingScreen message="VERIFYING_TRANSACTION..." />;
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-black text-white">
        <div className="text-center p-8 border border-[#333] max-w-lg w-full bg-[#080808]">
          <h1 className="font-arcade text-4xl text-[#FF003C] mb-6">TRANSACTION_NOT_FOUND</h1>
          <p className="font-mono text-gray-500 mb-8 text-sm">The requested acquisition log does not exist or has been purged.</p>
          <Link href="/shop" className="inline-block px-8 py-4 bg-[#FF8C00] text-black font-arcade text-xs tracking-[0.2em] hover:bg-white transition-all border-b-4 border-[#A0522D] active:border-b-0 active:translate-y-1 uppercase">
            RETURN_TO_VAULT
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-16 bg-black text-white selection:bg-[#00B894] selection:text-black">
      <div className="max-w-3xl mx-auto px-6 md:px-12">
        {/* Success Message */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex justify-center mb-8"
          >
            <div className="w-24 h-24 bg-[#00B894]/20 rounded-full flex items-center justify-center border border-[#00B894] shadow-[0_0_30px_rgba(0,184,148,0.3)]">
              <CheckCircle className="w-12 h-12 text-[#00B894]" strokeWidth={2} />
            </div>
          </motion.div>
          <h1 className="font-arcade text-5xl md:text-7xl mb-6 tracking-tight text-white leading-none text-3d-green">
            ORDER<br /><span className="text-[#00B894]">CONFIRMED</span>
          </h1>
          <p className="text-xl text-gray-400 font-sans font-medium max-w-lg mx-auto">
            Operation successful. Assets secured. A digital receipt has been transmitted to your inbox.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-[#080808] border border-[#333] rounded-sm p-8 mb-8 relative overflow-hidden group hover:border-[#00B894]/50 transition-colors">
          {/* Decorative glint */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00B894]/5 blur-[50px]"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 relative z-10">
            <div>
              <p className="text-[10px] font-mono tracking-[0.2em] text-[#00B894] mb-2 uppercase">TRANSACTION ID</p>
              <p className="font-mono text-lg text-white bg-[#111] px-3 py-1 border border-[#333] inline-block font-bold">#{order.id.slice(0, 8)}</p>
            </div>
            <div>
              <p className="text-[10px] font-mono tracking-[0.2em] text-[#00B894] mb-2 uppercase">DATE</p>
              <p className="font-arcade text-xl text-white">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-mono tracking-[0.2em] text-[#00B894] mb-2 uppercase">TOTAL VALUE</p>
              <p className="font-arcade text-3xl text-[#00B894] text-shadow-glow">₹{order.totalPrice}</p>
            </div>
          </div>

          {/* Points Earned */}
          <div className="border-t border-[#333] pt-8 relative z-10">
            <div className="bg-[#1A1A1A] border border-[#333] p-6 flex items-center gap-6">
              <div className="w-16 h-16 bg-[#FFD400]/20 rounded-full flex items-center justify-center border border-[#FFD400] text-3xl shadow-[0_0_15px_rgba(255,212,0,0.2)]">
                🏆
              </div>
              <div>
                <p className="text-xs font-mono tracking-[0.2em] text-gray-500 uppercase mb-1">Experience Gained</p>
                <p className="font-arcade text-4xl text-[#FFD400] tracking-wide">+{order.totalPoints} XP</p>
                <p className="text-xs text-gray-400 font-mono mt-1">
                  Added to user profile cache.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Items & Address Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Items */}
          <div className="bg-[#080808] border border-[#333] rounded-sm p-8 relative">
            <h2 className="font-arcade text-2xl mb-6 text-white flex items-center gap-3 border-b border-[#333] pb-4">
              <ShoppingBag size={20} className="text-[#FF8C00]" />
              MANIFEST
            </h2>
            <div className="space-y-4">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-start pb-4 border-b border-[#333] last:border-0 last:pb-0">
                  <div>
                    <p className="font-arcade text-white text-sm mb-1">{item.product.name}</p>
                    <p className="text-[10px] font-mono text-gray-400 uppercase">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-mono text-[#FF8C00]">₹{item.product.price * item.quantity}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Address */}
          <div className="bg-[#080808] border border-[#333] rounded-sm p-8 relative">
            <h2 className="font-arcade text-2xl mb-6 text-white border-b border-[#333] pb-4">DESTINATION</h2>
            <div className="text-gray-300 font-mono text-sm space-y-2">
              <p className="text-white text-lg font-bold mb-2 uppercase">{order.shippingAddress.name}</p>
              <p className="opacity-80">{order.shippingAddress.address}</p>
              <p className="opacity-80">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
              <div className="mt-4 pt-4 border-t border-[#333]">
                <p className="text-[#00B894] text-[10px] uppercase tracking-widest mb-1">COMMS_LINK</p>
                <p className="opacity-80">{order.shippingAddress.phone}</p>
                <p className="opacity-80">{order.shippingAddress.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/wallet"
            className="flex-1 py-4 bg-transparent border border-white text-white font-arcade text-xs tracking-[0.2em] text-center hover:bg-white hover:text-black transition-all uppercase"
          >
            ACCESS_WALLET
          </Link>
          <Link
            href="/shop"
            className="flex-1 py-4 bg-[#FF8C00] text-black border border-[#FF8C00] font-arcade text-xs tracking-[0.2em] text-center hover:bg-white transition-all uppercase flex items-center justify-center gap-2 border-b-4 border-[#A0522D] active:border-b-0 active:translate-y-1"
          >
            ACQUIRE_MORE <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
