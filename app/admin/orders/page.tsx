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
      className="px-3 py-4 pb-16 md:p-8 md:pb-16 min-h-screen bg-[#FFFDF5] overflow-x-hidden"
    >
      <div className="mb-8 md:mb-12 border-b-2 border-black pb-6 md:pb-8">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="p-2 bg-black rounded-lg border-2 border-black neo-shadow-sm">
            <ShoppingBag className="text-[#FFD93D] w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <h1 className="font-header text-3xl md:text-6xl font-black text-[#2D3436] uppercase tracking-tighter">Order Ledger</h1>
            <p className="text-[#2D3436]/60 font-bold text-sm md:text-lg uppercase tracking-widest">Global Order Status & Fulfilment</p>
          </div>
        </div>
      </div>

      <OrdersList />
    </motion.div>
  );
}
