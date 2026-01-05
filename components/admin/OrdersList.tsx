
'use client';

import React, { useState, useEffect } from 'react';
import { Package, Truck, Eye } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import CreateShipmentModal from './CreateShipmentModal';
import InvoiceModal from './InvoiceModal';
import { FileText } from 'lucide-react';

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
                            <th className="p-4 neo-border">Items</th>
                            <th className="p-4 neo-border">Total</th>
                            <th className="p-4 neo-border">Date</th>
                            <th className="p-4 neo-border">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-cream">
                        {orders.map((order) => {
                            const shipment = shipmentsCache[order.id];
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
                                            {order.items?.length || 0}
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
                                            {/* Placeholder for future details view if needed */}
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
        </>
    );
}
