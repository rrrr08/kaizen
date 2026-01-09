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
      className="p-8 max-w-7xl mx-auto space-y-12"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-8 border-black pb-12">
        <div className="flex items-center gap-6">
          <div className="p-5 bg-black rounded-[32px] border-4 border-black neo-shadow -rotate-3">
            <ShoppingBag className="text-[#FFD93D]" size={40} />
          </div>
          <div>
            <h1 className="font-header text-6xl font-black text-[#2D3436] mb-2 uppercase tracking-tighter">Order Ledger</h1>
            <p className="text-xl text-[#2D3436]/40 font-black uppercase tracking-widest">Global Order Status & Fulfilment</p>
          </div>
        </div>
      </div>

      <OrdersList />
    </motion.div>
  );
}
