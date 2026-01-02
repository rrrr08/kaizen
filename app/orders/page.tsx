'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { 
  Package, 
  ArrowRight, 
  Home, 
  Calendar,
  MapPin,
  CreditCard,
  Award,
  ChevronDown,
  ChevronUp,
  Download,
  TrendingUp,
  Coins
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const dynamic = 'force-dynamic';

interface OrderItem {
  productId: string;
  product?: {
    name: string;
    price: number;
    image?: string;
  };
  name?: string;
  price?: number;
  quantity: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  totalPrice: number;
  subtotal?: number;
  gst?: number;
  gstRate?: number;
  originalPrice?: number;
  discount?: number;
  totalPoints: number;
  pointsRedeemed: number;
  shippingAddress?: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city: string;
    state: string;
    zipCode?: string;
  };
  paymentId?: string;
  razorpayOrderId?: string;
  createdAt?: string;
  paymentStatus?: string;
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<'all' | 'recent' | 'high-value'>('all');

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

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const getFilteredOrders = () => {
    switch (filterStatus) {
      case 'recent':
        return orders.slice(0, 5);
      case 'high-value':
        return [...orders].sort((a, b) => b.totalPrice - a.totalPrice).slice(0, 10);
      default:
        return orders;
    }
  };

  const totalSpent = orders.reduce((sum, order) => sum + order.totalPrice, 0);
  const totalPointsEarned = orders.reduce((sum, order) => sum + (order.totalPoints || 0), 0);
  const totalPointsRedeemed = orders.reduce((sum, order) => sum + (order.pointsRedeemed || 0), 0);

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

  const filteredOrders = getFilteredOrders();

  return (
    <div className="min-h-screen bg-[#FFFDF5] pt-32 pb-16 px-4 md:px-8 text-[#2D3436]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/profile" className="font-black text-xs uppercase tracking-[0.3em] text-[#6C5CE7] hover:text-black mb-6 inline-block transition-colors">
            ← BACK TO PROFILE
          </Link>
          <h1 className="font-header text-6xl md:text-7xl font-black text-black leading-none mb-4">
            PURCHASE HISTORY
          </h1>
          <p className="text-black/60 font-bold text-lg">
            Complete record of your orders and transactions
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#FFD93D] border-2 border-black rounded-[15px] p-6 neo-shadow">
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-5 h-5 text-black" strokeWidth={2.5} />
              <span className="text-[10px] font-black uppercase tracking-widest text-black/70">Total Orders</span>
            </div>
            <span className="font-header text-4xl font-black text-black block">{orders.length}</span>
          </div>

          <div className="bg-[#00B894] border-2 border-black rounded-[15px] p-6 neo-shadow">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-white" strokeWidth={2.5} />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/90">Total Spent</span>
            </div>
            <span className="font-header text-4xl font-black text-white block">₹{totalSpent.toLocaleString()}</span>
          </div>

          <div className="bg-[#6C5CE7] border-2 border-black rounded-[15px] p-6 neo-shadow">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-5 h-5 text-white" strokeWidth={2.5} />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/90">Points Earned</span>
            </div>
            <span className="font-header text-4xl font-black text-white block">{totalPointsEarned.toLocaleString()}</span>
          </div>

          <div className="bg-white border-2 border-black rounded-[15px] p-6 neo-shadow">
            <div className="flex items-center gap-3 mb-2">
              <Coins className="w-5 h-5 text-[#FF7675]" strokeWidth={2.5} />
              <span className="text-[10px] font-black uppercase tracking-widest text-black/70">Points Redeemed</span>
            </div>
            <span className="font-header text-4xl font-black text-black block">{totalPointsRedeemed.toLocaleString()}</span>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-3 mb-8 flex-wrap">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 font-black text-xs uppercase tracking-widest rounded-lg border-2 border-black transition-all ${
              filterStatus === 'all' 
                ? 'bg-black text-white' 
                : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            All Orders
          </button>
          <button
            onClick={() => setFilterStatus('recent')}
            className={`px-4 py-2 font-black text-xs uppercase tracking-widest rounded-lg border-2 border-black transition-all ${
              filterStatus === 'recent' 
                ? 'bg-black text-white' 
                : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            Recent (5)
          </button>
          <button
            onClick={() => setFilterStatus('high-value')}
            className={`px-4 py-2 font-black text-xs uppercase tracking-widest rounded-lg border-2 border-black transition-all ${
              filterStatus === 'high-value' 
                ? 'bg-black text-white' 
                : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            High Value
          </button>
        </div>

        {error && (
          <div className="bg-[#FF7675] border-2 border-black rounded-[15px] p-4 mb-8 text-white font-bold neo-shadow">
            ⚠️ {error}
          </div>
        )}

        {filteredOrders.length === 0 ? (
          // Empty State
          <div className="bg-white border-2 border-black rounded-[25px] p-16 text-center neo-shadow">
            <div className="w-24 h-24 bg-[#FFD93D] rounded-full flex items-center justify-center border-3 border-black neo-shadow mx-auto mb-8">
              <Package className="w-10 h-10 text-black" strokeWidth={2.5} />
            </div>
            <h2 className="font-header text-4xl font-black text-black mb-4">
              NO ORDERS YET
            </h2>
            <p className="text-black/60 mb-8 max-w-md mx-auto font-medium">
              Your purchase history is empty! Visit the shop to find amazing games.
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
          <div className="space-y-4">
            {filteredOrders.map((order, index) => {
              const isExpanded = expandedOrders.has(order.id);
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={order.id}
                  className="bg-white border-2 border-black rounded-[20px] overflow-hidden neo-shadow hover:shadow-[6px_6px_0px_#000] transition-all"
                >
                  {/* Order Header - Always Visible */}
                  <div className="p-6 cursor-pointer" onClick={() => toggleOrderExpansion(order.id)}>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Left Section */}
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="bg-[#FFD93D] p-2 rounded-lg border-2 border-black">
                            <Package className="w-5 h-5 text-black" />
                          </div>
                          <div>
                            <p className="text-black/40 text-[10px] font-black uppercase tracking-[0.2em]">Order ID</p>
                            <p className="font-mono text-sm font-bold text-black">{order.id.slice(0, 16)}...</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

                          <div>
                            <p className="text-black/40 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Items</p>
                            <p className="text-black font-bold text-sm">
                              {order.items?.length || 0} items
                            </p>
                          </div>

                          <div>
                            <p className="text-black/40 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Status</p>
                            <span className="inline-flex items-center px-2 py-1 bg-[#00B894] border border-black rounded-md text-white text-[10px] font-black uppercase">
                              ✓ Paid
                            </span>
                          </div>

                          <div>
                            <p className="text-black/40 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Points</p>
                            <p className="text-[#6C5CE7] font-bold text-sm">
                              +{order.totalPoints || 0} JP
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Right Section */}
                      <div className="flex items-center justify-between lg:flex-col lg:items-end gap-4 border-t-2 lg:border-t-0 lg:border-l-2 border-black/10 lg:pl-6 pt-4 lg:pt-0">
                        <div className="text-right">
                          <p className="text-black/40 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total</p>
                          <p className="font-header text-3xl font-black text-black">
                            ₹{order.totalPrice.toFixed(2)}
                          </p>
                        </div>

                        <button className="flex items-center gap-2 text-[#6C5CE7] hover:text-black transition-colors font-black text-xs uppercase tracking-widest">
                          {isExpanded ? (
                            <>Hide Details <ChevronUp className="w-4 h-4" /></>
                          ) : (
                            <>View Details <ChevronDown className="w-4 h-4" /></>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t-2 border-black/10"
                      >
                        <div className="p-6 bg-gray-50">
                          {/* Order Items */}
                          <div className="mb-6">
                            <h3 className="font-header text-lg font-black text-black mb-4 flex items-center gap-2">
                              <Package className="w-5 h-5" /> Order Items
                            </h3>
                            <div className="space-y-3">
                              {order.items?.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-white border border-black/10 rounded-lg p-4">
                                  <div className="flex items-center gap-4">
                                    {item.product?.image && (
                                      <div className="w-12 h-12 rounded-lg border border-black/10 overflow-hidden bg-gray-100">
                                        <img 
                                          src={item.product.image} 
                                          alt={item.product.name || item.name || 'Product'} 
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    )}
                                    <div>
                                      <p className="font-bold text-black">{item.product?.name || item.name || 'Product'}</p>
                                      <p className="text-xs text-black/60 font-medium">Qty: {item.quantity}</p>
                                    </div>
                                  </div>
                                  <p className="font-black text-black">
                                    ₹{((item.product?.price || item.price || 0) * item.quantity).toFixed(2)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Shipping Address */}
                            {order.shippingAddress && (
                              <div>
                                <h3 className="font-header text-lg font-black text-black mb-4 flex items-center gap-2">
                                  <MapPin className="w-5 h-5" /> Shipping Address
                                </h3>
                                <div className="bg-white border border-black/10 rounded-lg p-4 space-y-2">
                                  <p className="font-bold text-black">{order.shippingAddress.name}</p>
                                  {order.shippingAddress.address && (
                                    <p className="text-sm text-black/70">{order.shippingAddress.address}</p>
                                  )}
                                  <p className="text-sm text-black/70">
                                    {order.shippingAddress.city}, {order.shippingAddress.state}
                                    {order.shippingAddress.zipCode && ` - ${order.shippingAddress.zipCode}`}
                                  </p>
                                  {order.shippingAddress.phone && (
                                    <p className="text-sm text-black/70">📞 {order.shippingAddress.phone}</p>
                                  )}
                                  {order.shippingAddress.email && (
                                    <p className="text-sm text-black/70">✉️ {order.shippingAddress.email}</p>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Payment & Pricing Details */}
                            <div>
                              <h3 className="font-header text-lg font-black text-black mb-4 flex items-center gap-2">
                                <CreditCard className="w-5 h-5" /> Payment Details
                              </h3>
                              <div className="bg-white border border-black/10 rounded-lg p-4 space-y-3">
                                {order.originalPrice && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-black/60 font-medium">Original Price</span>
                                    <span className="font-bold text-black">₹{order.originalPrice.toFixed(2)}</span>
                                  </div>
                                )}
                                {order.discount && order.discount > 0 && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-black/60 font-medium">Discount</span>
                                    <span className="font-bold text-[#00B894]">-₹{order.discount.toFixed(2)}</span>
                                  </div>
                                )}
                                {order.pointsRedeemed > 0 && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-black/60 font-medium">Points Redeemed</span>
                                    <span className="font-bold text-[#6C5CE7]">{order.pointsRedeemed} JP</span>
                                  </div>
                                )}
                                {order.subtotal && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-black/60 font-medium">Subtotal</span>
                                    <span className="font-bold text-black">₹{order.subtotal.toFixed(2)}</span>
                                  </div>
                                )}
                                {order.gst && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-black/60 font-medium">GST ({order.gstRate || 18}%)</span>
                                    <span className="font-bold text-black">₹{order.gst.toFixed(2)}</span>
                                  </div>
                                )}
                                <div className="flex justify-between pt-3 border-t-2 border-black/10">
                                  <span className="font-black text-black uppercase text-sm">Total Paid</span>
                                  <span className="font-header text-xl font-black text-black">₹{order.totalPrice.toFixed(2)}</span>
                                </div>
                                {order.paymentId && (
                                  <div className="pt-3 border-t border-black/5">
                                    <p className="text-[10px] text-black/40 font-bold uppercase tracking-widest mb-1">Payment ID</p>
                                    <p className="text-xs font-mono text-black/60">{order.paymentId}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="mt-6 flex gap-3 flex-wrap">
                            <Link
                              href={`/order-confirmation/${order.id}`}
                              className="px-6 py-3 bg-[#6C5CE7] text-white font-black text-xs uppercase tracking-widest rounded-lg border-2 border-black hover:bg-[#5B4CD6] transition-all neo-shadow"
                            >
                              View Receipt
                            </Link>
                            <button
                              onClick={() => window.print()}
                              className="px-6 py-3 bg-white text-black font-black text-xs uppercase tracking-widest rounded-lg border-2 border-black hover:bg-gray-100 transition-all"
                            >
                              <Download className="w-4 h-4 inline mr-2" />
                              Download
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
