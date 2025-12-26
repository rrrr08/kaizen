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
    return (
      <div className="p-8 flex items-center justify-center min-h-[calc(100vh-80px)] bg-[#FFFDF5]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#FFD93D] border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black font-black uppercase tracking-widest">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 bg-[#FFFDF5]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-8">
        <div className="mb-12 border-b-2 border-black pb-8">
          <h1 className="font-header text-6xl font-black text-black mb-2 uppercase tracking-tighter">MANAGE ORDERS</h1>
          <p className="text-xl text-black/60 font-bold">Total Orders: {orders.length}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Orders List */}
          <div className="lg:col-span-2 border-2 border-black rounded-[20px] p-6 bg-white neo-shadow max-h-[800px] overflow-y-auto">
            {orders.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-black border-dashed">
                  <Package className="w-8 h-8 text-black/40" />
                </div>
                <p className="text-black/60 font-black uppercase tracking-widest">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`w-full p-6 text-left border-2 rounded-xl transition-all group ${selectedOrder?.id === order.id
                      ? 'border-black bg-[#FFD93D] neo-shadow-sm translate-x-[2px] translate-y-[2px] shadow-none'
                      : 'border-black/10 hover:border-black bg-white hover:neo-shadow-sm'
                      }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <p className="font-black font-mono text-sm uppercase tracking-wider text-black">#{order.id.slice(0, 8)}</p>
                      <span className="px-3 py-1 bg-[#00B894] border-2 border-black text-black text-xs font-black uppercase tracking-wider rounded-lg shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                        Completed
                      </span>
                    </div>
                    <p className="font-header text-lg font-black text-black mb-1">
                      {order.shippingAddress.name}
                    </p>
                    <div className="flex justify-between items-center mt-4 pt-4 border-t-2 border-black/5">
                      <p className="text-xs font-bold text-black/40 uppercase tracking-widest">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <p className="font-black text-xl text-black">₹{order.totalPrice.toLocaleString()}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Order Details */}
          <div className="lg:col-span-1">
            {selectedOrder ? (
              <div className="border-2 border-black rounded-[20px] p-8 bg-white neo-shadow sticky top-8">
                <div className="flex items-center gap-3 mb-8 pb-6 border-b-4 border-black">
                  <div className="p-2 bg-[#6C5CE7] border-2 border-black rounded-lg">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="font-header text-2xl font-black uppercase tracking-tighter text-black">ORDER DETAILS</h2>
                </div>

                {/* Order ID */}
                <div className="mb-6">
                  <p className="text-xs font-black uppercase tracking-widest text-black/40 mb-2">Order ID</p>
                  <p className="font-mono text-sm font-bold bg-gray-100 p-3 rounded-lg border-2 border-black/10 break-all">{selectedOrder.id}</p>
                </div>

                {/* Customer */}
                <div className="mb-6">
                  <p className="text-xs font-black uppercase tracking-widest text-black/40 mb-2">Customer</p>
                  <p className="font-header text-xl font-black text-black mb-1">
                    {selectedOrder.shippingAddress.name}
                  </p>
                  <p className="text-sm font-bold text-black/60">{selectedOrder.shippingAddress.email}</p>
                  <p className="text-sm font-bold text-black/60">{selectedOrder.shippingAddress.phone}</p>
                </div>

                {/* Items Count */}
                <div className="mb-6 p-4 bg-[#FFFDF5] border-2 border-black rounded-xl">
                  <p className="text-xs font-black uppercase tracking-widest text-black/40 mb-1">Items Included</p>
                  <p className="font-header text-2xl font-black text-black">
                    {selectedOrder.items.length} <span className="text-sm text-black/60 align-middle font-bold uppercase">product{selectedOrder.items.length !== 1 ? 's' : ''}</span>
                  </p>
                </div>

                {/* Totals */}
                <div className="mb-6 space-y-3">
                  <p className="text-xs font-black uppercase tracking-widest text-black/40 mb-2">Financials</p>
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-black/60">Subtotal</span>
                    <span className="text-black">₹{selectedOrder.totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-black/60">Shipping</span>
                    <span className="text-[#00B894] uppercase tracking-wider bg-[#00B894]/10 px-2 rounded">FREE</span>
                  </div>
                  <div className="pt-3 mt-3 border-t-2 border-black border-dashed flex justify-between items-center">
                    <span className="font-black text-lg">Total</span>
                    <span className="font-black text-2xl text-[#6C5CE7]">₹{selectedOrder.totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                {/* Points */}
                <div className="mb-8 p-4 bg-[#FFD93D] border-2 border-black rounded-xl neo-shadow-sm">
                  <p className="text-xs font-black uppercase tracking-widest text-black mb-1">Points Awarded</p>
                  <p className="font-black text-3xl text-black">
                    +{selectedOrder.totalPoints} <span className="text-sm font-bold opacity-60">PTS</span>
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button className="w-full py-4 bg-black text-white font-black uppercase tracking-widest hover:bg-gray-800 transition-all rounded-xl border-2 border-black shadow-[4px_4px_0px_#6C5CE7] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]">
                    Process Shipment
                  </button>
                  <button className="w-full py-4 bg-white text-black font-black uppercase tracking-widest hover:bg-gray-50 transition-all rounded-xl border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,0.1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]">
                    Send Email
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-black border-dashed rounded-[20px] p-8 bg-gray-50 flex flex-col items-center justify-center h-64 text-center sticky top-8">
                <Package className="w-12 h-12 text-black/20 mb-4" />
                <p className="text-black/40 font-black uppercase tracking-widest">
                  Select an order to view full details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
