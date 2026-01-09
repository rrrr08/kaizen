
'use client';

import React, { useState, useEffect } from 'react';
import ShipmentList from '@/components/admin/ShipmentList';
import CreateShipmentModal from '@/components/admin/CreateShipmentModal';
import { Plus, Truck, Package, CheckCircle, Clock, BarChart3, TrendingUp, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminShipmentsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleShipmentCreated = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 max-w-7xl mx-auto space-y-12 pb-20"
        >
            {/* Top Toolbar */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b-8 border-black pb-12">
                <div className="flex items-center gap-6">
                    <div className="p-5 bg-black rounded-[32px] border-4 border-black neo-shadow rotate-3">
                        <Truck className="text-[#00B894]" size={40} />
                    </div>
                    <div>
                        <h1 className="font-header text-6xl font-black text-[#2D3436] mb-2 uppercase tracking-tighter">Logistic Hub</h1>
                        <p className="text-xl text-[#2D3436]/40 font-black uppercase tracking-widest">Cargo Manifest & Distribution Control</p>
                    </div>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="group px-8 py-5 bg-[#00B894] text-white border-4 border-black rounded-[24px] font-black uppercase tracking-widest flex items-center gap-3 hover:translate-y-[-4px] transition-all neo-shadow active:shadow-none active:translate-y-1"
                >
                    <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                    Deploy Manual Cargo
                </button>
            </div>

            {/* Insight Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-[#FFD93D] p-8 border-4 border-black rounded-[40px] neo-shadow relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Package size={80} />
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart3 size={18} className="text-[#2D3436]/40" />
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#2D3436]/60">Fleet Volume</h3>
                    </div>
                    <p className="text-6xl font-header font-black text-[#2D3436] mb-2">324</p>
                    <div className="flex items-center gap-1 text-[10px] font-black text-[#2D3436]/40 uppercase">
                        <TrendingUp size={12} /> +12% vs last month
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-[#00B894] p-8 border-4 border-black rounded-[40px] neo-shadow text-white relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <CheckCircle size={80} />
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                        <CheckCircle size={18} className="text-white/40" />
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/60">Successful Drops</h3>
                    </div>
                    <p className="text-6xl font-header font-black mb-2">48</p>
                    <div className="text-[10px] font-black text-white/40 uppercase">Today's Deliveries</div>
                </motion.div>

                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-black p-8 border-4 border-black rounded-[40px] neo-shadow text-white relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Clock size={80} />
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                        <Clock size={18} className="text-white/40" />
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/60">In Transit</h3>
                    </div>
                    <p className="text-6xl font-header font-black text-[#FFD93D] mb-2">15</p>
                    <div className="text-[10px] font-black text-white/40 uppercase">Pending Fulfilment</div>
                </motion.div>
            </div>

            {/* List Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-[#6C5CE7] rounded-full animate-pulse" />
                        <h2 className="text-3xl font-header font-black uppercase tracking-tight text-[#2D3436]">Active Dispatches</h2>
                    </div>
                    <div className="flex gap-4">
                        <button className="px-6 py-3 bg-white border-4 border-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all neo-shadow-sm flex items-center gap-2">
                            Export CSV <ArrowUpRight size={16} />
                        </button>
                    </div>
                </div>

                <ShipmentList key={refreshTrigger} />
            </div>

            <CreateShipmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleShipmentCreated}
            />
        </motion.div>
    );
}
