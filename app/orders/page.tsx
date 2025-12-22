'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { getUserOrders } from '@/lib/firebase';
import { Package, ArrowRight, Home } from 'lucide-react';

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
      <div className="min-h-screen bg-black flex items-center justify-center pt-24">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amber-500">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-black/80 pt-32 pb-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-display text-5xl md:text-6xl font-bold text-white mb-2">
            My Orders
          </h1>
          <p className="text-amber-500 text-lg">
            View and track all your purchases
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-8 text-red-400">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          // Empty State
          <div className="glass-card border border-amber-500/20 rounded-lg p-12 text-center">
            <Package className="w-16 h-16 text-amber-500/40 mx-auto mb-6" />
            <h2 className="font-display text-2xl font-bold text-white mb-3">
              No orders yet
            </h2>
            <p className="text-white/60 mb-8 max-w-md mx-auto">
              You haven't placed any orders yet. Start shopping and earn amazing rewards!
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-black font-header font-bold rounded-lg hover:bg-amber-400 transition-all"
            >
              <Home className="w-5 h-5" />
              Browse Shop
            </Link>
          </div>
        ) : (
          // Orders List
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/order-confirmation/${order.id}`}
                className="glass-card border border-amber-500/20 rounded-lg p-6 md:p-8 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all block group"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  {/* Left Section - Order Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Package className="w-5 h-5 text-amber-500" />
                      <div>
                        <p className="text-amber-500/70 text-sm uppercase tracking-widest">Order ID</p>
                        <p className="font-display text-xl font-bold text-white break-all">{order.id}</p>
                      </div>
                    </div>

                    {/* Order Date */}
                    <div className="mt-3">
                      <p className="text-white/60 text-sm">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Date not available'}
                      </p>
                    </div>

                    {/* Items Count */}
                    <div className="mt-3">
                      <p className="text-white/70 text-sm">
                        <span className="font-semibold">{order.items?.length || 0}</span> item{(order.items?.length || 0) !== 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Shipping Address */}
                    {order.shippingAddress && (
                      <div className="mt-3">
                        <p className="text-white/60 text-sm">
                          Shipping to: <span className="text-white/80 font-medium">{order.shippingAddress.city}, {order.shippingAddress.state}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Section - Price & Points */}
                  <div className="flex flex-col md:flex-col-reverse md:text-right gap-4 md:gap-2">
                    {/* Total Price */}
                    <div>
                      <p className="text-white/60 text-sm">Total Amount</p>
                      <p className="font-display text-3xl md:text-4xl font-bold text-amber-400">
                        ₹{order.totalPrice.toFixed(2)}
                      </p>
                    </div>

                    {/* Points Earned */}
                    <div>
                      <p className="text-white/60 text-sm">Points Earned</p>
                      <p className="text-amber-500 font-header font-semibold">
                        +{order.totalPoints} PTS
                      </p>
                    </div>

                    {/* Points Redeemed */}
                    {order.pointsRedeemed > 0 && (
                      <div>
                        <p className="text-white/60 text-sm">Points Redeemed</p>
                        <p className="text-green-500 font-header font-semibold text-sm">
                          -{order.pointsRedeemed} PTS
                        </p>
                      </div>
                    )}

                    {/* View Button */}
                    <div className="mt-4 md:mt-0">
                      <button className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded text-amber-500 hover:bg-amber-500/20 transition-all group-hover:translate-x-1">
                        View Details
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                {order.paymentStatus === 'completed' && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <span className="inline-flex items-center px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-xs font-semibold">
                      ✓ Completed
                    </span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}

        {/* Continue Shopping Link */}
        {orders.length > 0 && (
          <div className="mt-12 text-center">
            <Link
              href="/shop"
              className="text-amber-500 hover:text-amber-400 transition font-header text-sm tracking-widest uppercase"
            >
              Continue Shopping →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
