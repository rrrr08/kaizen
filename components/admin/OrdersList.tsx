
'use client';

import React, { useState, useEffect } from 'react';
import { Package, Truck, Eye, MapPin, User, Phone, Mail, Calendar, Hash, ShoppingBag, X } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import CreateShipmentModal from './CreateShipmentModal';
import InvoiceModal from './InvoiceModal';
import { FileText } from 'lucide-react';
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
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple"></div>
        </div>
    );

    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-purple text-cream neo-border">
                            <th className="p-4 neo-border">Order ID</th>
                            <th className="p-4 neo-border">Customer</th>
                            <th className="p-4 neo-border">Quantity</th>
                            <th className="p-4 neo-border">Total</th>
                            <th className="p-4 neo-border">Date</th>
                            <th className="p-4 neo-border">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-cream">
                        {orders.map((order) => {
                            const shipment = shipmentsCache[order.id];
                            // Calculate total quantity
                            const totalQuantity = order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
                            
                            return (
                                <tr key={order.id} className="hover:bg-yellow/10 transition-colors">
                                    <td className="p-4 neo-border font-bold font-mono">
                                        #{order.id.slice(0, 8)}
                                        {shipment && (
                                            <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded border border-current uppercase
                                                ${shipment.status === 'DELIVERED' ? 'text-mint bg-mint/10' : 'text-blue-500 bg-blue-50'}
                                            `}>
                                                {shipment.status}
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 neo-border">
                                        <div className="font-bold">{order.shippingAddress?.name}</div>
                                        <div className="text-xs text-charcoal/60">{order.shippingAddress?.phone}</div>
                                    </td>
                                    <td className="p-4 neo-border text-center">
                                        <span className="font-bold bg-white px-2 py-1 rounded neo-border">
                                            {totalQuantity}
                                        </span>
                                    </td>
                                    <td className="p-4 neo-border font-bold">₹{order.totalPrice?.toLocaleString()}</td>
                                    <td className="p-4 neo-border">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td className="p-4 neo-border">
                                        <div className="flex gap-2">
                                            {shipment ? (
                                                <Link
                                                    href={`/admin/shipments/${shipment.id}`}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-mint neo-border hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform neo-shadow-hover text-xs font-bold uppercase text-charcoal"
                                                    title="View Shipment"
                                                >
                                                    <Truck size={14} /> Track
                                                </Link>
                                            ) : (
                                                <button
                                                    onClick={() => handleCreateShipment(order)}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-yellow neo-border hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform neo-shadow-hover text-xs font-bold uppercase"
                                                    title="Create Shipment"
                                                >
                                                    <Truck size={14} /> Create
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleShowDetails(order)}
                                                className="p-1.5 bg-purple text-cream neo-border hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform neo-shadow-hover"
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleShowInvoice(order)}
                                                className="p-1.5 bg-mint neo-border hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform neo-shadow-hover text-charcoal"
                                                title="View Invoice"
                                            >
                                                <FileText size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {orders.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center neo-border italic">
                                    No orders found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <CreateShipmentModal
                isOpen={isShipmentModalOpen}
                onClose={() => setIsShipmentModalOpen(false)}
                onSuccess={() => {
                    fetchOrdersAndShipments(); // Refresh to update status
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
        </>
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
                    className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.3 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="bg-black p-6 border-b-4 border-black flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white border-2 border-white">
                                    <ShoppingBag className="text-black" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black uppercase text-white">Order Details</h2>
                                    <p className="text-white/70 text-sm font-mono">#{order.id.slice(0, 12)}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 bg-white border-2 border-white hover:bg-gray-100 transition-all"
                            >
                                <X className="text-black" size={20} />
                            </button>
                        </div>

                        {/* Content - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
                            {/* Order Info Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-white border-2 border-black p-4"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <Hash size={16} className="text-black" />
                                        <span className="text-xs font-bold uppercase text-black/60">Order ID</span>
                                    </div>
                                    <p className="font-mono font-black text-black text-sm break-all">#{order.id}</p>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 }}
                                    className="bg-white border-2 border-black p-4"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar size={16} className="text-black" />
                                        <span className="text-xs font-bold uppercase text-black/60">Order Date</span>
                                    </div>
                                    <p className="font-bold text-black">{new Date(order.createdAt).toLocaleDateString()}</p>
                                    <p className="text-xs text-black/60">{new Date(order.createdAt).toLocaleTimeString()}</p>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-white border-2 border-black p-4"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <Package size={16} className="text-black" />
                                        <span className="text-xs font-bold uppercase text-black/60">Status</span>
                                    </div>
                                    <span className={`inline-block px-3 py-1 border-2 border-black text-xs font-black uppercase tracking-wide ${
                                        order.status === 'DELIVERED' ? 'bg-green-400 text-black' :
                                        order.status === 'SHIPPED' ? 'bg-yellow-300 text-black' :
                                        order.status === 'COMPLETED' ? 'bg-green-400 text-black' :
                                        order.status === 'CANCELLED' ? 'bg-red-400 text-white' :
                                        'bg-gray-200 text-black'
                                    }`}>
                                        {order.status || 'PENDING'}
                                    </span>
                                </motion.div>
                            </div>

                            {/* Items Section */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                className="bg-white border-4 border-black"
                            >
                                <div className="bg-black p-4 border-b-4 border-black">
                                    <div className="flex items-center gap-2">
                                        <ShoppingBag size={20} className="text-white" />
                                        <h3 className="font-black text-lg uppercase text-white">Order Items ({order.items?.length || 0})</h3>
                                    </div>
                                </div>
                                
                                <div className="p-4 space-y-3">
                                    {order.items?.map((item, idx) => {
                                        const itemPrice = item.product?.price || item.price || 0;
                                        const itemQuantity = item.quantity || 0;
                                        const itemSubtotal = itemPrice * itemQuantity;
                                        const itemName = item.product?.name || item.name || item.title || 'Product';
                                        const itemImage = item.product?.image || item.image;
                                        
                                        return (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.3 + idx * 0.05 }}
                                                className="flex gap-4 p-4 bg-white border-2 border-black/10"
                                            >
                                                {itemImage ? (
                                                    <div className="relative">
                                                        <img
                                                            src={itemImage}
                                                            alt={itemName}
                                                            className="w-24 h-24 object-cover border-2 border-black/10"
                                                        />
                                                        <div className="absolute -top-2 -right-2 bg-black text-white w-8 h-8 rounded-full border-2 border-white flex items-center justify-center font-black text-sm">
                                                            {itemQuantity}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="relative w-24 h-24 bg-gray-100 border-2 border-black/10 flex items-center justify-center">
                                                        <Package size={32} className="text-black/20" />
                                                        <div className="absolute -top-2 -right-2 bg-black text-white w-8 h-8 rounded-full border-2 border-white flex items-center justify-center font-black text-sm">
                                                            {itemQuantity}
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <h4 className="font-black text-black text-lg mb-2">
                                                        {itemName}
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2 mb-2">
                                                        {item.color && (
                                                            <span className="px-2 py-1 bg-gray-100 border border-black/20 text-xs font-bold">
                                                                Color: {item.color}
                                                            </span>
                                                        )}
                                                        {item.size && (
                                                            <span className="px-2 py-1 bg-gray-100 border border-black/20 text-xs font-bold">
                                                                Size: {item.size}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-black/70">
                                                        ₹{itemPrice.toLocaleString()} × {itemQuantity} units
                                                    </div>
                                                </div>
                                                <div className="text-right flex flex-col justify-between">
                                                    <div className="text-xs text-black/60 mb-1">Subtotal</div>
                                                    <div className="font-black text-2xl text-black">
                                                        ₹{itemSubtotal.toLocaleString()}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                                
                                {/* Totals Summary */}
                                <div className="p-6 bg-white border-t-4 border-black space-y-3">
                                    <div className="flex justify-between items-center pb-3 border-b-2 border-dashed border-black/20">
                                        <span className="font-bold text-black">Total Items:</span>
                                        <span className="font-black text-lg">{order.items?.length || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-3 border-b-2 border-dashed border-black/20">
                                        <span className="font-bold text-black">Total Quantity:</span>
                                        <span className="font-black text-lg">{totalQuantity}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="font-black text-xl uppercase">Grand Total:</span>
                                        <span className="font-black text-3xl text-black">₹{(order.totalPrice || 0).toLocaleString()}</span>
                                    </div>
                                    {(order.totalPoints || 0) > 0 && (
                                        <div className="flex justify-between items-center pt-3 border-t-2 border-green-500">
                                            <span className="font-bold text-black">🎁 Points Earned:</span>
                                            <span className="font-black text-xl text-green-600">+{order.totalPoints} pts</span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>

                            {/* Shipping Address */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35 }}
                                className="bg-white border-4 border-black"
                            >
                                <div className="bg-black p-4 border-b-4 border-black">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={20} className="text-white" />
                                        <h3 className="font-black text-lg uppercase text-white">Shipping Address</h3>
                                    </div>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-gray-100 border border-black/20">
                                            <User size={16} className="text-black" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-black/60 font-bold mb-1">NAME</div>
                                            <div className="font-black text-lg">{order.shippingAddress?.name}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-gray-100 border border-black/20">
                                                <Phone size={16} className="text-black" />
                                            </div>
                                            <div>
                                                <div className="text-xs text-black/60 font-bold mb-1">PHONE</div>
                                                <div className="font-bold">{order.shippingAddress?.phone}</div>
                                            </div>
                                        </div>
                                        
                                        {order.shippingAddress?.email && (
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-gray-100 border border-black/20">
                                                    <Mail size={16} className="text-black" />
                                                </div>
                                                <div>
                                                    <div className="text-xs text-black/60 font-bold mb-1">EMAIL</div>
                                                    <div className="font-bold break-all">{order.shippingAddress?.email}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-start gap-3 pt-3 border-t-2 border-dashed border-black/20">
                                        <div className="p-2 bg-gray-100 border border-black/20">
                                            <MapPin size={16} className="text-black" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-xs text-black/60 font-bold mb-2">DELIVERY ADDRESS</div>
                                            <div className="font-bold leading-relaxed">
                                                {order.shippingAddress?.address}<br />
                                                {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-100 p-4 border-t-4 border-black flex justify-between items-center">
                            <div className="text-sm text-black/60">
                                Order created on {new Date(order.createdAt).toLocaleString()}
                            </div>
                            <button
                                onClick={onClose}
                                className="px-8 py-3 bg-black text-white border-2 border-black font-black uppercase tracking-wide hover:bg-gray-800 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
