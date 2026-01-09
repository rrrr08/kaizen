
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
            className="p-8 max-w-7xl mx-auto space-y-8 pb-20 min-h-screen bg-[#FFFDF5]"
        >
            {/* Top Toolbar */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-black pb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-black rounded-2xl border-2 border-black neo-shadow rotate-3">
                        <Truck className="text-[#00B894]" size={32} />
                    </div>
                    <div>
                        <h1 className="font-header text-4xl sm:text-5xl font-black text-[#2D3436] mb-1 uppercase tracking-tighter">Logistic Hub</h1>
                        <p className="text-lg text-[#2D3436]/60 font-black uppercase tracking-widest">Cargo Manifest & Distribution Control</p>
                    </div>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="group px-6 py-3 bg-[#00B894] text-white border-2 border-black rounded-xl font-black uppercase tracking-widest flex items-center gap-2 hover:translate-y-[-2px] transition-all neo-shadow active:shadow-none active:translate-y-1"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                    Deploy Manual Cargo
                </button>
            </div>

            {/* Insight Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-[#FFD93D] p-6 border-2 border-black rounded-2xl neo-shadow relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                        <Package size={64} />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                        <BarChart3 size={16} className="text-[#2D3436]/40" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2D3436]/60">Fleet Volume</h3>
                    </div>
                    <p className="text-4xl font-header font-black text-[#2D3436] mb-1">324</p>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-[#2D3436]/40 uppercase">
                        <TrendingUp size={12} /> +12% vs last month
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-[#00B894] p-6 border-2 border-black rounded-2xl neo-shadow text-white relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                        <CheckCircle size={64} />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle size={16} className="text-white/40" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Successful Drops</h3>
                    </div>
                    <p className="text-4xl font-header font-black mb-1">48</p>
                    <div className="text-[10px] font-bold text-white/40 uppercase">Today's Deliveries</div>
                </motion.div>

                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-black p-6 border-2 border-black rounded-2xl neo-shadow text-white relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                        <Clock size={64} />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                        <Clock size={16} className="text-white/40" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">In Transit</h3>
                    </div>
                    <p className="text-4xl font-header font-black text-[#FFD93D] mb-1">15</p>
                    <div className="text-[10px] font-bold text-white/40 uppercase">Pending Fulfilment</div>
                </motion.div>
            </div>

            {/* List Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-[#6C5CE7] rounded-full animate-pulse" />
                        <h2 className="text-2xl font-header font-black uppercase tracking-tight text-[#2D3436]">Active Dispatches</h2>
                    </div>
                    <div className="flex gap-4">
                        <button className="px-4 py-2 bg-white border-2 border-black rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all neo-shadow-sm flex items-center gap-2">
                            Export CSV <ArrowUpRight size={14} />
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
