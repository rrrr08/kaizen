
'use client';

import React, { useState, useEffect } from 'react';
import { updateShipmentStatus, deleteShipment } from '@/lib/db/shipments';
import { Pencil, Trash2, Printer, Check, X, Truck, Package, Search, ExternalLink, Calendar, User, Hash } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePopup } from '@/app/context/PopupContext';
import { motion, AnimatePresence } from 'framer-motion';

interface Shipment {
    id: string;
    orderId: string;
    customerName: string;
    awbCode: string | null;
    courierName: string | null;
    status: string;
    createdAt: string;
}

const STATUS_OPTIONS = ['NEW', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELED', 'RETURNED'];

const STATUS_COLORS: Record<string, string> = {
    'NEW': 'bg-[#FFD93D] text-black',
    'PROCESSING': 'bg-[#74B9FF] text-white',
    'SHIPPED': 'bg-[#6C5CE7] text-white',
    'DELIVERED': 'bg-[#00B894] text-white',
    'CANCELED': 'bg-[#FF7675] text-white',
    'RETURNED': 'bg-black text-white'
};

export default function ShipmentList() {
    const { showConfirm } = usePopup();
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchShipments();
    }, []);

    const fetchShipments = async () => {
        try {
            const data = await import('@/lib/db/shipments').then(mod => mod.getShipments());
            setShipments(data as any);
        } catch (err) {
            console.error('Failed to fetch shipments:', err);
            setShipments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            setShipments(shipments.map(s => s.id === id ? { ...s, status: newStatus } : s));
            await updateShipmentStatus(id, newStatus);
            setEditingId(null);
        } catch (err) {
            console.error('Failed to update status:', err);
            fetchShipments();
        }
    };

    const handleDelete = async (id: string) => {
        const confirmed = await showConfirm('Exterminate this shipment record?', 'Delete Shipment');
        if (!confirmed) return;
        try {
            setShipments(shipments.filter(s => s.id !== id));
            await deleteShipment(id);
        } catch (err) {
            console.error('Failed to delete shipment:', err);
            fetchShipments();
        }
    };

    const filteredShipments = shipments.filter(s =>
        s.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.awbCode?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 bg-[#FFFDF5] border-4 border-black rounded-[40px] neo-shadow">
            <div className="w-16 h-16 border-8 border-black border-t-[#00B894] rounded-full animate-spin"></div>
            <p className="mt-6 font-black uppercase tracking-widest text-black/40">Loading Cargo Files...</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-black transition-colors" size={24} />
                <input
                    type="text"
                    placeholder="Search by Customer, Order ID, or AWB..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-16 pr-8 py-6 bg-white border-4 border-black rounded-[32px] font-black text-xl uppercase tracking-tight focus:outline-none focus:bg-[#FFFDF5] transition-all neo-shadow-sm"
                />
            </div>

            <div className="overflow-hidden border-4 border-black rounded-[40px] bg-white neo-shadow relative">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-black text-white">
                            <th className="p-6 font-black uppercase tracking-widest text-xs">Logistic ID</th>
                            <th className="p-6 font-black uppercase tracking-widest text-xs">Recipient</th>
                            <th className="p-6 font-black uppercase tracking-widest text-xs">Tracking</th>
                            <th className="p-6 font-black uppercase tracking-widest text-xs text-center">Status</th>
                            <th className="p-6 font-black uppercase tracking-widest text-xs text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y-4 divide-black">
                        {filteredShipments.map((shipment, index) => (
                            <motion.tr
                                key={shipment.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.03 }}
                                className="group hover:bg-[#FFFDF5] transition-colors"
                            >
                                <td className="p-6">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <Hash size={14} className="text-black/30" />
                                            <Link href={`/admin/shipments/${shipment.id}`} className="font-mono font-black text-black hover:underline underline-offset-4">
                                                {shipment.orderId.slice(0, 12)}
                                            </Link>
                                        </div>
                                        <div className="flex items-center gap-1.5 opacity-40">
                                            <Calendar size={12} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">
                                                {new Date(shipment.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gray-100 border-2 border-black flex items-center justify-center font-black text-sm group-hover:bg-[#00B894] group-hover:text-white transition-colors">
                                            <User size={18} />
                                        </div>
                                        <span className="font-black text-black text-sm uppercase tracking-tight">{shipment.customerName}</span>
                                    </div>
                                </td>
                                <td className="p-6">
                                    <div className="flex flex-col gap-1">
                                        <div className="font-mono text-xs font-black px-3 py-1.5 bg-gray-100 rounded-lg border-2 border-black/5 select-all inline-block w-fit">
                                            {shipment.awbCode || 'PENDING_AWB'}
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-black/30 ml-1">
                                            {shipment.courierName || 'Unassigned Courier'}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-6 text-center">
                                    <AnimatePresence mode="wait">
                                        {editingId === shipment.id ? (
                                            <motion.div
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0.8, opacity: 0 }}
                                            >
                                                <select
                                                    value={shipment.status}
                                                    onChange={(e) => handleStatusUpdate(shipment.id, e.target.value)}
                                                    className="p-3 bg-white border-4 border-black rounded-2xl font-black text-[10px] uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-[#6C5CE7]/20"
                                                    autoFocus
                                                    onBlur={() => setEditingId(null)}
                                                >
                                                    {STATUS_OPTIONS.map(opt => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            </motion.div>
                                        ) : (
                                            <button
                                                onClick={() => setEditingId(shipment.id)}
                                                className={`px-4 py-2 border-4 border-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:translate-y-[-2px] transition-all neo-shadow-sm active:shadow-none active:translate-y-1
                                                    ${STATUS_COLORS[shipment.status] || 'bg-gray-100'}
                                                `}
                                            >
                                                {shipment.status}
                                            </button>
                                        )}
                                    </AnimatePresence>
                                </td>
                                <td className="p-6">
                                    <div className="flex items-center justify-end gap-3">
                                        <Link
                                            href={`/admin/shipments/labels?id=${shipment.id}`}
                                            target="_blank"
                                            className="p-3 bg-white border-4 border-black rounded-xl hover:bg-black hover:text-white transition-all neo-shadow-sm group-hover:rotate-2"
                                            title="Print Label"
                                        >
                                            <Printer size={18} />
                                        </Link>
                                        <button
                                            onClick={() => setEditingId(shipment.id)}
                                            className="p-3 bg-white border-4 border-black rounded-xl hover:bg-[#FFD93D] transition-all neo-shadow-sm group-hover:-rotate-2"
                                            title="Edit Status"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(shipment.id)}
                                            className="p-3 bg-[#FF7675] text-white border-4 border-black rounded-xl hover:bg-black transition-all neo-shadow-sm"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>

                {filteredShipments.length === 0 && (
                    <div className="p-20 flex flex-col items-center justify-center bg-[#FFFDF5]">
                        <div className="p-8 bg-black/5 rounded-full mb-6 rotate-12">
                            <Truck size={64} className="text-black/10" />
                        </div>
                        <h3 className="font-header text-2xl font-black text-black uppercase tracking-tight">No Cargo Found</h3>
                        <p className="text-black/40 font-bold uppercase tracking-widest text-xs mt-2">Adjust your filters or start shipping!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
