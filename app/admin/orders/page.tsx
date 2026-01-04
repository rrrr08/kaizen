
'use client';

import React from 'react';
import OrdersList from '@/components/admin/OrdersList';

export default function AdminOrdersPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 border-b-2 border-black pb-8">
        <h1 className="font-header text-6xl font-black text-black mb-2 uppercase tracking-tighter">MANAGE ORDERS</h1>
        <p className="text-xl text-black/60 font-bold">Review orders and create shipments manually.</p>
      </div>

      <div className="bg-cream p-6 neo-border neo-shadow-lg">
        <OrdersList />
      </div>
    </div>
  );
}
