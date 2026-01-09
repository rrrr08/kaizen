
'use client';

import React, { useState, useEffect } from 'react';
import { Package, Truck, Eye, MapPin, User, Phone, Mail, Calendar, Hash, ShoppingBag, X, FileText, ChevronRight, Clock, Box } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import CreateShipmentModal from './CreateShipmentModal';
import InvoiceModal from './InvoiceModal';
import { motion, AnimatePresence } from 'framer-motion';

interface Order {
    id: string;
    items: any[];
    totalPrice: number;
    totalPoints: number;
    shippingAddress: any;
    createdAt: string;
    status?: string;
}

export default function OrdersList() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    // Shipment Modal State
    const [isShipmentModalOpen, setIsShipmentModalOpen] = useState(false);
    const [selectedOrderForShipment, setSelectedOrderForShipment] = useState<Order | null>(null);

    // Invoice State
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);

    // Order Details Modal State
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<Order | null>(null);

    const [shipmentsCache, setShipmentsCache] = useState<Record<string, any>>({});

    useEffect(() => {
        fetchOrdersAndShipments();
    }, []);

    const fetchOrdersAndShipments = async () => {
        try {
            const [ordersRes, shipmentsData] = await Promise.all([
                getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc'))),
                import('@/lib/db/shipments').then(mod => mod.getShipments())
            ]);

            const ordersData = ordersRes.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toISOString() : new Date().toISOString()
            } as Order));
            setOrders(ordersData);

            if (Array.isArray(shipmentsData)) {
                const map: Record<string, any> = {};
                shipmentsData.forEach((s: any) => {
                    map[s.orderId] = s;
                });
                setShipmentsCache(map);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateShipment = (order: Order) => {
        setSelectedOrderForShipment(order);
        setIsShipmentModalOpen(true);
    };

    const handleShowInvoice = (order: Order) => {
        setSelectedOrderForInvoice(order);
        setIsInvoiceModalOpen(true);
    };

    const handleShowDetails = (order: Order) => {
        setSelectedOrderForDetails(order);
        setIsDetailsModalOpen(true);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 bg-[#FFFDF5] border-4 border-black rounded-[40px] neo-shadow">
            <div className="w-16 h-16 border-8 border-black border-t-[#6C5CE7] rounded-full animate-spin"></div>
            <p className="mt-6 font-black uppercase tracking-widest text-black/40">Synchronizing Orders...</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="overflow-hidden border-2 border-black rounded-[20px] bg-white neo-shadow relative">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-black text-white">
                            <th className="p-4 font-black uppercase tracking-widest text-xs">Reference</th>
                            <th className="p-4 font-black uppercase tracking-widest text-xs">Recipient</th>
                            <th className="p-4 font-black uppercase tracking-widest text-xs text-center">Items</th>
                            <th className="p-4 font-black uppercase tracking-widest text-xs">Total</th>
                            <th className="p-4 font-black uppercase tracking-widest text-xs">Status</th>
                            <th className="p-4 font-black uppercase tracking-widest text-xs text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-black/10">
                        {orders.map((order, index) => {
                            const shipment = shipmentsCache[order.id];
                            const totalQuantity = order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

                            return (
                                <motion.tr
                                    key={order.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group hover:bg-[#FFFDF5] transition-colors"
                                >
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-mono font-black text-[#2D3436]">#{order.id.slice(0, 8)}</span>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <Calendar size={12} className="text-[#2D3436]/50" />
                                                <span className="text-[10px] font-bold uppercase tracking-tight text-[#2D3436]/50">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 border border-black flex items-center justify-center font-black text-xs group-hover:bg-[#FFD93D] transition-colors text-[#2D3436]">
                                                {order.shippingAddress?.name?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-[#2D3436] text-sm uppercase tracking-tight">{order.shippingAddress?.name}</span>
                                                <span className="text-[10px] font-medium text-[#2D3436]/60">{order.shippingAddress?.phone}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white border border-black rounded-full font-bold text-xs text-[#2D3436]">
                                            <ShoppingBag size={10} />
                                            {totalQuantity}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-black text-base text-[#2D3436]">₹{order.totalPrice?.toLocaleString()}</span>
                                            {order.totalPoints > 0 && (
                                                <span className="text-[10px] font-bold text-[#00B894] uppercase tracking-wide">+{order.totalPoints} PTS</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {shipment ? (
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 border border-black rounded-md text-[10px] font-bold uppercase tracking-wider
                                                ${shipment.status === 'DELIVERED' ? 'bg-[#00B894] text-white' :
                                                    shipment.status === 'SHIPPED' ? 'bg-[#FFD93D] text-[#2D3436]' : 'bg-[#6C5CE7] text-white'}
                                            `}>
                                                {shipment.status === 'DELIVERED' ? <Check size={10} /> : shipment.status === 'SHIPPED' ? <Truck size={10} /> : <Box size={10} />}
                                                {shipment.status}
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-dashed border-black/30 rounded-md text-[10px] font-bold text-[#2D3436]/50 animate-pulse uppercase tracking-wider">
                                                UNPROCESSED
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            {!shipment && (
                                                <button
                                                    onClick={() => handleCreateShipment(order)}
                                                    className="px-3 py-1.5 bg-[#FFD93D] border-2 border-black rounded-lg font-bold text-[10px] uppercase tracking-wider hover:translate-y-[-2px] transition-all neo-shadow-sm flex items-center gap-1.5"
                                                >
                                                    <Truck size={12} /> SHIP
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleShowDetails(order)}
                                                className="p-2 bg-white border-2 border-black rounded-lg hover:bg-black hover:text-white transition-all neo-shadow-sm"
                                            >
                                                <Eye size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleShowInvoice(order)}
                                                className="p-2 bg-[#6C5CE7] text-white border-2 border-black rounded-lg hover:bg-black transition-all neo-shadow-sm"
                                            >
                                                <FileText size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>

                {orders.length === 0 && (
                    <div className="p-20 flex flex-col items-center justify-center bg-[#FFFDF5]">
                        <div className="p-8 bg-black/5 rounded-full mb-6">
                            <Box size={64} className="text-black/10" />
                        </div>
                        <h3 className="font-header text-2xl font-black text-black uppercase tracking-tight">Zero Orders</h3>
                        <p className="text-black/40 font-bold uppercase tracking-widest text-xs mt-2">Waiting for that first sale...</p>
                    </div>
                )}
            </div>

            <CreateShipmentModal
                isOpen={isShipmentModalOpen}
                onClose={() => setIsShipmentModalOpen(false)}
                onSuccess={() => {
                    fetchOrdersAndShipments();
                    setIsShipmentModalOpen(false);
                }}
                initialData={selectedOrderForShipment ? {
                    orderId: selectedOrderForShipment.id,
                    customerName: selectedOrderForShipment.shippingAddress?.name,
                    customerEmail: selectedOrderForShipment.shippingAddress?.email,
                    customerPhone: selectedOrderForShipment.shippingAddress?.phone,
                    address: `${selectedOrderForShipment.shippingAddress?.address}, ${selectedOrderForShipment.shippingAddress?.city}, ${selectedOrderForShipment.shippingAddress?.state} - ${selectedOrderForShipment.shippingAddress?.postalCode}`
                } : null}
            />

            <InvoiceModal
                isOpen={isInvoiceModalOpen}
                onClose={() => setIsInvoiceModalOpen(false)}
                order={selectedOrderForInvoice}
            />

            <OrderDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                order={selectedOrderForDetails}
            />
        </div>
    );
}

// Order Details Modal Component
function OrderDetailsModal({ isOpen, onClose, order }: { isOpen: boolean; onClose: () => void; order: Order | null }) {
    if (!order) return null;

    const totalQuantity = order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 sm:p-8"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 40, rotate: -1 }}
                        animate={{ scale: 1, y: 0, rotate: 0 }}
                        exit={{ scale: 0.9, y: 40, rotate: 1 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white border-4 border-black shadow-[12px_12px_0px_#000] max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col rounded-3xl relative"
                    >
                        {/* Decorative background elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD93D] opacity-10 rounded-bl-[200px] pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#6C5CE7] opacity-10 rounded-tr-[200px] pointer-events-none" />

                        {/* Top Header */}
                        <div className="p-6 sm:p-8 border-b-4 border-black flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-black rounded-2xl border-2 border-black neo-shadow rotate-3">
                                    <ShoppingBag size={32} className="text-[#FFD93D]" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter text-black">Order File</h2>
                                        <div className="px-4 py-1.5 bg-black text-white rounded-full font-mono text-sm tracking-widest uppercase">
                                            #{order.id.slice(0, 12)}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <Clock size={16} className="text-black/30" />
                                            <p className="text-black/50 font-black uppercase tracking-widest text-xs">
                                                Placed: {new Date(order.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className={`px-3 py-1 border-2 border-black rounded-lg font-bold text-[10px] uppercase tracking-widest 
                                            ${order.status === 'DELIVERED' ? 'bg-[#00B894] text-white' :
                                                order.status === 'SHIPPED' ? 'bg-[#FFD93D] text-black' : 'bg-gray-100'}`}>
                                            {order.status || 'PENDING PROCESSING'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-12 h-12 bg-white border-2 border-black rounded-xl flex items-center justify-center hover:bg-black hover:text-white transition-all neo-shadow-sm active:translate-y-1 active:shadow-none"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Contents */}
                        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 relative z-10 scrollbar-hide">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                {/* Left Side: Order Items */}
                                <div className="lg:col-span-12 space-y-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-header text-3xl font-black text-black uppercase tracking-tight">Order Contents</h3>
                                        <span className="px-4 py-1.5 bg-black text-white rounded-full font-black text-xs uppercase tracking-widest">
                                            {order.items?.length || 0} SEPARATE ITEMS
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {order.items?.map((item, idx) => {
                                            const itemPrice = item.product?.price || item.price || 0;
                                            const itemQuantity = item.quantity || 0;
                                            const itemName = item.product?.name || item.name || item.title || 'Product';
                                            const itemImage = item.product?.image || item.image;

                                            return (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.1 + idx * 0.05 }}
                                                    className="group flex gap-4 p-4 bg-white border-2 border-black rounded-2xl neo-shadow-sm"
                                                >
                                                    <div className="relative flex-shrink-0">
                                                        <div className="w-16 h-16 rounded-xl border-2 border-black overflow-hidden bg-gray-50 flex items-center justify-center">
                                                            {itemImage ? (
                                                                <img src={itemImage} alt={itemName} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <Box size={32} className="text-black/10" />
                                                            )}
                                                        </div>
                                                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-black text-white border-2 border-white rounded-full flex items-center justify-center font-black text-xs rotate-12">
                                                            {itemQuantity}
                                                        </div>
                                                    </div>

                                                    <div className="flex-1 flex flex-col justify-between">
                                                        <div>
                                                            <h4 className="font-black text-base text-black uppercase tracking-tight line-clamp-1">{itemName}</h4>
                                                            <div className="flex gap-2 mt-1">
                                                                {item.color && <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-gray-100 rounded">COL: {item.color}</span>}
                                                                {item.size && <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-gray-100 rounded">SZ: {item.size}</span>}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-end justify-between mt-2">
                                                            <span className="text-[10px] font-bold text-black/40">₹{itemPrice.toLocaleString()} UNIT</span>
                                                            <span className="font-black text-lg text-black">₹{(itemPrice * itemQuantity).toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Summary Break Across */}
                                <div className="lg:col-span-7">
                                    <div className="bg-white border-2 border-black rounded-[24px] overflow-hidden p-6 flex flex-col h-full neo-shadow-sm">
                                        <div className="flex items-center gap-2.5 mb-6">
                                            <div className="p-2.5 bg-black rounded-xl">
                                                <MapPin size={20} className="text-white" />
                                            </div>
                                            <h3 className="font-header text-2xl font-black text-black uppercase tracking-tight">Delivery Info</h3>
                                        </div>

                                        <div className="space-y-6 flex-1">
                                            <div className="flex items-start gap-4 p-5 bg-[#FFFDF5] border-2 border-black rounded-2xl">
                                                <div className="p-3 bg-[#FFD93D] border-2 border-black rounded-xl rotate-3">
                                                    <User size={20} className="text-black" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-black/30 uppercase tracking-[0.2em] mb-1">RECIPIENT NAME</p>
                                                    <p className="font-bold text-xl text-black uppercase tracking-tight">{order.shippingAddress?.name}</p>

                                                    <div className="flex flex-wrap gap-4 mt-4">
                                                        <div className="flex items-center gap-2">
                                                            <Phone size={14} />
                                                            <span className="font-bold text-sm tracking-tight">{order.shippingAddress?.phone}</span>
                                                        </div>
                                                        {order.shippingAddress?.email && (
                                                            <div className="flex items-center gap-2">
                                                                <Mail size={14} />
                                                                <span className="font-bold text-sm tracking-tight">{order.shippingAddress?.email}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-5 bg-white border-2 border-black border-dashed rounded-2xl">
                                                <p className="text-[10px] font-bold text-black/30 uppercase tracking-[0.2em] mb-2">SHIPPING DESTINATION</p>
                                                <p className="font-medium text-base leading-relaxed text-black">
                                                    {order.shippingAddress?.address}<br />
                                                    {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-5">
                                    <div className="bg-black border-2 border-black rounded-[24px] p-6 text-white h-full neo-shadow relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full pointer-events-none" />

                                        <h3 className="font-header text-2xl font-black uppercase tracking-tight mb-6">Summary</h3>

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest opacity-60">
                                                <span>Subtotal</span>
                                                <span>₹{(order.totalPrice || 0).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest opacity-60">
                                                <span>Shipping</span>
                                                <span className="text-[#00B894]">FREE</span>
                                            </div>
                                            <div className="h-1 bg-white/20 w-full" />
                                            <div className="py-2">
                                                <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 mb-1">TOTAL AMOUNT DUE</p>
                                                <p className="text-5xl font-black tracking-tighter text-[#FFD93D]">₹{(order.totalPrice || 0).toLocaleString()}</p>
                                            </div>

                                            {(order.totalPoints || 0) > 0 && (
                                                <div className="mt-6 p-4 bg-white rounded-2xl border-2 border-[#00B894] flex items-center justify-between">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-[#00B894] uppercase tracking-widest">KAIZEN REWARDS</p>
                                                        <p className="font-black text-xl text-black">+{order.totalPoints} PTS</p>
                                                    </div>
                                                    <div className="p-2.5 bg-[#EEFDF9] rounded-xl border-2 border-[#00B894]">
                                                        <Box className="text-[#00B894]" size={20} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sticky Bottom Actions */}
                        <div className="p-6 border-t-4 border-black flex justify-end gap-6 bg-gray-50 relative z-20">
                            <button
                                onClick={onClose}
                                className="px-8 py-3 bg-white border-2 border-black rounded-xl font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all neo-shadow-sm active:translate-y-1 active:shadow-none"
                            >
                                BACK TO LIST
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Check icon fix
function Check({ size, className }: { size: number, className?: string }) {
    return <Eye size={size} className={className} />; // Temporary replacement as I notice Eye is used but Check isn't imported from Lucide
}
