'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Eye, Truck, Mail, MapPin, CreditCard, Calendar } from 'lucide-react';
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
      <div className="min-h-screen pt-24 pb-16 px-6 bg-[#050505] flex items-center justify-center">
        <div className="text-[#FFD400] font-arcade tracking-[0.3em] animate-pulse text-xl">
          RETRIEVING_ORDERS...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 text-white bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-12 border-b-2 border-[#333] pb-8 flex justify-between items-end">
          <div>
            <h1 className="font-arcade text-5xl text-white mb-2 text-3d-orange">ORDER_LOGS</h1>
            <p className="text-gray-500 font-sans text-lg tracking-wide uppercase">Transaction History & Fulfillment</p>
          </div>
          <div className="bg-[#111] border border-[#333] px-4 py-2 rounded text-xs font-mono text-gray-400">
            TOTAL_ENTRIES: <span className="text-[#00B894]">{orders.length}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Orders List */}
          <div className="lg:col-span-2 border-2 border-[#333] rounded-[4px] p-0 bg-[#080808] max-h-[700px] overflow-y-auto custom-scrollbar">
            {orders.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-16 h-16 text-[#333] mx-auto mb-6" />
                <p className="text-gray-500 font-mono tracking-widest text-sm">NO_DATA_FOUND</p>
              </div>
            ) : (
              <div className="divide-y divide-[#222]">
                {orders.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`w-full p-6 text-left transition-all group hover:bg-[#111] ${selectedOrder?.id === order.id
                      ? 'bg-[#111] border-l-4 border-l-[#FFD400]'
                      : 'border-l-4 border-l-transparent'
                      }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-sm border ${selectedOrder?.id === order.id ? 'border-[#FFD400] text-[#FFD400]' : 'border-[#333] text-gray-500 group-hover:border-[#FFD400] group-hover:text-[#FFD400]'}`}>
                          <Package className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-mono text-white text-sm tracking-wider font-bold">#{order.id.substring(0, 8)}...</p>
                          <p className="text-[10px] text-gray-500 font-mono uppercase mt-0.5">{order.shippingAddress.name}</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-[#00B894]/10 border border-[#00B894]/30 text-[#00B894] text-[10px] font-mono font-bold uppercase tracking-wider rounded-sm">
                        COMPLETED
                      </span>
                    </div>

                    <div className="flex justify-between items-center mt-4 pl-11">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs font-mono">
                          <Calendar className="w-3 h-3" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs font-mono">
                          <Package className="w-3 h-3" />
                          {order.items.length} ITEM(S)
                        </div>
                      </div>
                      <p className="font-arcade text-[#FFD400] text-lg text-shadow-glow">₹{order.totalPrice}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Order Details */}
          <div className="lg:col-span-1">
            {selectedOrder ? (
              <div className="border-2 border-[#FFD400] rounded-[4px] p-0 bg-[#080808] sticky top-28 shadow-[0_0_30px_rgba(255,212,0,0.15)] overflow-hidden">
                <div className="bg-[#FFD400] p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-black p-1.5 rounded-sm">
                      <Eye className="w-4 h-4 text-[#FFD400]" />
                    </div>
                    <h2 className="font-arcade text-black text-lg tracking-wider">MANIFEST_DATA</h2>
                  </div>
                  <div className="px-2 py-0.5 bg-black text-[#FFD400] text-[10px] font-mono font-bold uppercase rounded-sm">
                    VERIFIED
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Order ID */}
                  <div className="pb-4 border-b border-[#333]">
                    <p className="text-[10px] text-[#FFD400] font-mono uppercase tracking-widest mb-1.5">TRANSACTION_ID</p>
                    <p className="font-mono text-white text-sm break-all bg-[#111] p-2 rounded-sm border border-[#333] select-all">{selectedOrder.id}</p>
                  </div>

                  {/* Customer */}
                  <div className="pb-4 border-b border-[#333]">
                    <p className="text-[10px] text-[#FFD400] font-mono uppercase tracking-widest mb-3">RECIPIENT_INFO</p>
                    <div className="flex items-start gap-3">
                      <div className="bg-[#111] p-2 border border-[#333] rounded-sm">
                        <MapPin className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-bold text-white font-mono text-sm uppercase">{selectedOrder.shippingAddress.name}</p>
                        <p className="text-xs text-gray-500 font-mono mt-1">{selectedOrder.shippingAddress.email}</p>
                        <p className="text-xs text-gray-500 font-mono">{selectedOrder.shippingAddress.phone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Items Count */}
                  <div className="pb-4 border-b border-[#333]">
                    <p className="text-[10px] text-[#FFD400] font-mono uppercase tracking-widest mb-2">CONTENTS</p>
                    <div className="flex items-center gap-2 text-white font-mono text-sm">
                      <span className="text-gray-500">{selectedOrder.items.length} UNIT(S)</span>
                      <span className="text-[#333]">|</span>
                      <span className="text-[#00B894]">PACKAGED</span>
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="pb-4 border-b border-[#333]">
                    <p className="text-[10px] text-[#FFD400] font-mono uppercase tracking-widest mb-3">FINANCIALS</p>
                    <div className="space-y-2 text-xs font-mono uppercase">
                      <div className="flex justify-between text-gray-400">
                        <span>Subtotal</span>
                        <span>₹{selectedOrder.totalPrice}</span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>Shipping</span>
                        <span className="text-[#00B894]">WAIVED</span>
                      </div>
                      <div className="flex justify-between text-white font-bold pt-2 border-t border-[#333] mt-2">
                        <span>TOTAL</span>
                        <span className="text-[#FFD400] text-base">₹{selectedOrder.totalPrice}</span>
                      </div>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="pb-4 border-b border-[#333]">
                    <div className="flex items-center justify-between bg-[#111] p-3 rounded-sm border border-[#333]">
                      <span className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">XP_GAINED</span>
                      <span className="font-arcade text-[#00B894] text-xl">+{selectedOrder.totalPoints}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-2">
                    <button className="w-full py-3 bg-[#FFD400] text-black font-arcade text-xs tracking-widest hover:bg-[#FFE066] transition-all rounded-sm flex items-center justify-center gap-2 group">
                      <Truck className="w-4 h-4" />
                      INITIATE_SHIPMENT
                    </button>
                    <button className="w-full py-3 bg-transparent border border-[#333] text-gray-400 font-arcade text-xs tracking-widest hover:text-white hover:border-white transition-all rounded-sm flex items-center justify-center gap-2">
                      <Mail className="w-4 h-4" />
                      SEND_STATION_MSG
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-[#333] rounded-[4px] p-6 bg-[#080808] flex flex-col items-center justify-center h-64 text-center">
                <div className="p-4 bg-[#111] rounded-full mb-4">
                  <Eye className="w-6 h-6 text-[#333]" />
                </div>
                <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">
                  AWAITING_SELECTION...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
