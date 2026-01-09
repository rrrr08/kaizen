'use client';

import React from 'react';
import OrdersList from '@/components/admin/OrdersList';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

export default function AdminOrdersPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 max-w-7xl mx-auto space-y-12 min-h-screen bg-[#FFFDF5]"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-black pb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-black rounded-2xl border-2 border-black neo-shadow -rotate-3">
            <ShoppingBag className="text-[#FFD93D] w-8 h-8" />
          </div>
          <div>
            <h1 className="font-header text-5xl font-black text-[#2D3436] mb-1 uppercase tracking-tighter">Order Ledger</h1>
            <p className="text-lg text-[#2D3436]/60 font-black uppercase tracking-widest">Global Order Status & Fulfilment</p>
          </div>
        </div>
      </div>

      <OrdersList />
    </motion.div>
  );
}
