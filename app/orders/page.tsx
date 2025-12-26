'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Package, ArrowRight, Home, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export const dynamic = 'force-dynamic';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  totalPrice: number;
  totalPoints: number;
  pointsRedeemed: number;
  shippingAddress?: {
    name: string;
    city: string;
    state: string;
  };
  createdAt?: string;
  paymentStatus?: string;
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/orders');
      return;
    }

    if (user) {
      loadOrders();
    }
  }, [user, authLoading, router]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      if (user?.uid) {
        const { getUserOrders } = await import('@/lib/firebase');
        const userOrders = await getUserOrders(user.uid);
        setOrders((userOrders || []) as Order[]);
      }
    } catch (err) {
      console.error('Error loading orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center pt-24">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-[#FFD93D] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black font-black text-xs tracking-[0.2em]">FETCHING HISTORY...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FFFDF5] pt-32 pb-16 px-4 md:px-8 text-[#2D3436]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 border-b-2 border-black pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="font-header text-6xl md:text-7xl font-black text-black leading-none mb-2">
              MY ORDERS
            </h1>
            <p className="text-black/60 font-bold text-lg">
              History of your acquired loot.
            </p>
          </div>

          <div className="bg-[#FFD93D] px-6 py-3 border-2 border-black rounded-[15px] neo-shadow rotate-1">
            <span className="font-black text-xl text-black block">{orders.length}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-black/70">Total Orders</span>
          </div>
        </div>

        {error && (
          <div className="bg-[#FF7675] border-2 border-black rounded-[15px] p-4 mb-8 text-black font-bold neo-shadow">
            ⚠️ {error}
          </div>
        )}

        {orders.length === 0 ? (
          // Empty State
          <div className="bg-white border-2 border-black rounded-[25px] p-16 text-center neo-shadow">
            <div className="w-24 h-24 bg-[#FFD93D] rounded-full flex items-center justify-center border-3 border-black neo-shadow mx-auto mb-8">
              <Package className="w-10 h-10 text-black" strokeWidth={2.5} />
            </div>
            <h2 className="font-header text-4xl font-black text-black mb-4">
              NO ORDERS YET
            </h2>
            <p className="text-black/60 mb-8 max-w-md mx-auto font-medium">
              Your inventory is empty! Visit the repository to find some treasures.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-3 px-8 py-4 bg-black text-white font-black text-sm tracking-widest rounded-[15px] border-2 border-transparent hover:bg-[#6C5CE7] hover:-translate-y-1 transition-all neo-shadow shadow-black/20 uppercase"
            >
              <Home className="w-4 h-4" />
              Start Shopping
            </Link>
          </div>
        ) : (
          // Orders List
          <div className="space-y-6">
            {orders.map((order) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={order.id}
                className="group relative"
              >
                <Link
                  href={`/order-confirmation/${order.id}`}
                  className="block bg-white border-2 border-black rounded-[20px] p-6. md:p-8 hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_#000] transition-all duration-200 neo-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    {/* Left Section - Order Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="bg-[#FFD93D] p-2 rounded-lg border-2 border-black">
                          <Package className="w-6 h-6 text-black" />
                        </div>
                        <div>
                          <p className="text-black/40 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Order ID</p>
                          <p className="font-mono text-lg font-bold text-black break-all leading-none">{order.id.slice(0, 8)}...</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                        {/* Order Date */}
                        <div>
                          <p className="text-black/40 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Date</p>
                          <p className="text-black font-bold text-sm">
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                              : 'N/A'}
                          </p>
                        </div>

                        {/* Items Count */}
                        <div>
                          <p className="text-black/40 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Items</p>
                          <p className="text-black font-bold text-sm">
                            {order.items?.length || 0} items
                          </p>
                        </div>

                        {/* Status */}
                        <div>
                          <p className="text-black/40 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Status</p>
                          <span className="inline-flex items-center px-2 py-0.5 bg-[#00B894] border-2 border-black rounded-md text-white text-[10px] font-black uppercase">
                            Paid
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Price & Points */}
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t-2 md:border-t-0 md:border-l-2 border-black/5 md:pl-8 pt-4 md:pt-0 gap-4">
                      <div>
                        <p className="text-black/40 text-[10px] font-black uppercase tracking-[0.2em] mb-1 text-right">Total</p>
                        <p className="font-header text-4xl font-black text-black">
                          ₹{order.totalPrice}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-black/40 group-hover:text-[#6C5CE7] transition-colors font-black text-xs uppercase tracking-widest">
                        View Receipt <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
                {/* Absolute points badge */}
                {order.totalPoints > 0 && (
                  <div className="absolute -top-3 -right-3 bg-[#6C5CE7] text-white px-3 py-1 border-2 border-black rounded-full font-black text-xs neo-shadow shadow-black rotate-3 z-10">
                    +{order.totalPoints} XP
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
