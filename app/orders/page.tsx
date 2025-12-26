'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Package, ArrowRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { ErrorScreen } from '@/components/ui/error-screen';

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
      setError(null);
      if (user?.uid) {
        const { getUserOrders } = await import('@/lib/firebase');
        const userOrders = await getUserOrders(user.uid);
        setOrders((userOrders || []) as Order[]);
      }
    } catch (err) {
      console.error('Error loading orders:', err);
      setError('Failed to retrieve order history.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <LoadingScreen message="ACCESSING_PURCHASE_LOGS..." />;
  }

  if (error) {
    return <ErrorScreen message={error} reset={loadOrders} />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-16 px-4 md:px-8 selection:bg-[#FF8C00] selection:text-black">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 border-b-2 border-[#333] pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="font-arcade text-5xl md:text-7xl text-white leading-none mb-2 text-3d-orange">
              MY_ORDERS
            </h1>
            <p className="text-gray-500 font-sans text-lg tracking-wide uppercase">
              Acquisition Log & Transaction History
            </p>
          </div>

          <div className="bg-[#111] px-6 py-3 border border-[#FF8C00] rounded-sm shadow-[0_0_10px_rgba(255,140,0,0.3)]">
            <span className="font-arcade text-2xl text-[#FF8C00] block">{orders.length}</span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Total Acquisitions</span>
          </div>
        </div>

        {orders.length === 0 ? (
          // Empty State
          <div className="bg-[#080808] border border-[#333] rounded-sm p-16 text-center">
            <div className="w-24 h-24 bg-[#1A1A1A] rounded-full flex items-center justify-center border border-[#333] mx-auto mb-8">
              <Package className="w-10 h-10 text-[#FF8C00]" strokeWidth={1.5} />
            </div>
            <h2 className="font-arcade text-3xl text-white mb-4">
              NO_LOGS_FOUND
            </h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto font-mono text-sm">
              Your inventory is empty. Access the vault to acquire new assets.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#FF8C00] text-black font-arcade text-xs tracking-[0.2em] rounded-sm hover:bg-white transition-all border-b-4 border-[#A0522D] active:border-b-0 active:translate-y-1 uppercase"
            >
              <Home className="w-4 h-4" />
              ACCESS_VAULT
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
                  className="block bg-[#080808] border border-[#333] hover:border-[#FF8C00] rounded-sm p-6 md:p-8 transition-all duration-300 relative overflow-hidden"
                >
                  {/* Hover Glow */}
                  <div className="absolute inset-0 bg-[#FF8C00]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
                    {/* Left Section - Order Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="bg-[#1A1A1A] p-3 rounded-sm border border-[#333] group-hover:border-[#FF8C00]/50 transition-colors">
                          <Package className="w-6 h-6 text-[#FF8C00]" />
                        </div>
                        <div>
                          <p className="text-gray-600 text-[10px] font-mono uppercase tracking-widest mb-1">Transaction ID</p>
                          <p className="font-arcade text-lg text-white break-all leading-none tracking-widest">#{order.id.slice(0, 8)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
                        {/* Order Date */}
                        <div>
                          <p className="text-gray-600 text-[10px] font-mono uppercase tracking-widest mb-1">Date</p>
                          <p className="text-gray-300 font-sans text-sm">
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
                          <p className="text-gray-600 text-[10px] font-mono uppercase tracking-widest mb-1">Payload</p>
                          <p className="text-gray-300 font-sans text-sm">
                            {order.items?.length || 0} ITEMS
                          </p>
                        </div>

                        {/* Status */}
                        <div>
                          <p className="text-gray-600 text-[10px] font-mono uppercase tracking-widest mb-1">Status</p>
                          <span className="inline-flex items-center px-2 py-0.5 bg-[#00B894]/20 border border-[#00B894] rounded-sm text-[#00B894] text-[10px] font-arcade tracking-wider uppercase">
                            COMPLETED
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Price & Points */}
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-[#333] md:pl-8 pt-4 md:pt-0 gap-4">
                      <div>
                        <p className="text-gray-600 text-[10px] font-mono uppercase tracking-widest mb-1 text-right">Total Value</p>
                        <p className="font-arcade text-3xl text-white">
                          ₹{order.totalPrice.toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-[#FF8C00] font-arcade text-[10px] uppercase tracking-[0.2em] group-hover:translate-x-1 transition-transform">
                        ACCESS_RECEIPT <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
                {/* Absolute points badge */}
                {order.totalPoints > 0 && (
                  <div className="absolute top-4 right-4 bg-[#6C5CE7] text-white px-3 py-1 border border-white/20 rounded-sm font-arcade text-[10px] shadow-[0_0_10px_#6C5CE7] z-20">
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
