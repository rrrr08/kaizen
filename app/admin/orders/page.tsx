'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Eye } from 'lucide-react';
import { getDocs, collection, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Order {
  id: string;
  items: any[];
  totalPrice: number;
  totalPoints: number;
  shippingAddress: any;
  createdAt: string;
  status?: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const ordersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Order));
        setOrders(ordersData);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="min-h-screen pt-28 pb-16 bg-black">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-16">
          <h1 className="font-display text-6xl font-bold tracking-tight mb-4">MANAGE ORDERS</h1>
          <p className="text-lg text-white/60 font-body">Total Orders: {orders.length}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Orders List */}
          <div className="lg:col-span-2 border border-white/10 rounded-lg p-6 bg-white/5 max-h-[600px] overflow-y-auto">
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/60 font-serif italic">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`w-full p-4 text-left border rounded-lg transition-all ${
                      selectedOrder?.id === order.id
                        ? 'border-amber-500/40 bg-amber-500/5'
                        : 'border-white/10 hover:border-amber-500/20 bg-black'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-header tracking-wider">{order.id}</p>
                      <span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs font-header rounded">
                        Completed
                      </span>
                    </div>
                    <p className="text-sm text-white/60 mb-2">
                      {order.shippingAddress.name}
                    </p>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-white/40">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <p className="font-serif italic text-amber-500">₹{order.totalPrice}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Order Details */}
          <div className="lg:col-span-1">
            {selectedOrder ? (
              <div className="border border-white/10 rounded-lg p-6 bg-white/5 sticky top-8">
                <div className="flex items-center gap-2 mb-6">
                  <Eye className="w-5 h-5 text-amber-500" />
                  <h2 className="font-header tracking-wider">ORDER DETAILS</h2>
                </div>

                {/* Order ID */}
                <div className="mb-4 pb-4 border-b border-white/10">
                  <p className="text-xs text-white/60 mb-1">Order ID</p>
                  <p className="font-mono text-sm break-all">{selectedOrder.id}</p>
                </div>

                {/* Customer */}
                <div className="mb-4 pb-4 border-b border-white/10">
                  <p className="text-xs text-white/60 mb-1">Customer Name</p>
                  <p className="font-header tracking-wider">
                    {selectedOrder.shippingAddress.name}
                  </p>
                  <p className="text-xs text-white/60 mt-2">{selectedOrder.shippingAddress.email}</p>
                  <p className="text-xs text-white/60">{selectedOrder.shippingAddress.phone}</p>
                </div>

                {/* Items Count */}
                <div className="mb-4 pb-4 border-b border-white/10">
                  <p className="text-xs text-white/60 mb-1">Items</p>
                  <p className="font-serif italic text-lg">
                    {selectedOrder.items.length} product{selectedOrder.items.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Totals */}
                <div className="mb-4 pb-4 border-b border-white/10">
                  <p className="text-xs text-white/60 mb-2">Pricing</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{selectedOrder.totalPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span className="text-green-500">FREE</span>
                    </div>
                  </div>
                </div>

                {/* Points */}
                <div className="mb-4 pb-4 border-b border-white/10">
                  <p className="text-xs text-white/60 mb-1">Points Awarded</p>
                  <p className="font-serif italic text-amber-500 text-lg">
                    +{selectedOrder.totalPoints}
                  </p>
                </div>

                {/* Date */}
                <div>
                  <p className="text-xs text-white/60 mb-1">Order Date</p>
                  <p className="text-sm">
                    {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 space-y-2">
                  <button className="w-full py-2 bg-amber-500 text-black font-header text-[9px] tracking-[0.3em] hover:bg-amber-400 transition-all rounded">
                    PROCESS SHIPMENT
                  </button>
                  <button className="w-full py-2 border border-white/20 text-white font-header text-[9px] tracking-[0.3em] hover:border-amber-500/40 transition-all rounded">
                    SEND EMAIL
                  </button>
                </div>
              </div>
            ) : (
              <div className="border border-white/10 rounded-lg p-6 bg-white/5 flex items-center justify-center h-64">
                <p className="text-white/60 font-serif italic text-center">
                  Select an order to view details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
