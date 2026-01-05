
'use client';

import React, { useState, useEffect } from 'react';
import { updateShipmentStatus, deleteShipment } from '@/lib/db/shipments';
import { Pencil, Trash2, Printer, Check, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePopup } from '@/app/context/PopupContext';

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

export default function ShipmentList() {
    const { showConfirm } = usePopup();
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchShipments();
    }, []);

    const fetchShipments = async () => {
        try {
            const data = await import('@/lib/db/shipments').then(mod => mod.getShipments());
            setShipments(data as any); // Cast to handle potential type mismatches temporarily
        } catch (err) {
            console.error('Failed to fetch shipments:', err);
            setShipments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            // Optimistic update
            setShipments(shipments.map(s => s.id === id ? { ...s, status: newStatus } : s));
            await updateShipmentStatus(id, newStatus);
            setEditingId(null);
        } catch (err) {
            console.error('Failed to update status:', err);
            fetchShipments(); // Revert on error
        }
    };

    const handleDelete = async (id: string) => {
        const confirmed = await showConfirm('Are you sure you want to delete this shipment?', 'Delete Shipment');
        if (!confirmed) return;
        try {
            setShipments(shipments.filter(s => s.id !== id));
            await deleteShipment(id);
        } catch (err) {
            console.error('Failed to delete shipment:', err);
            fetchShipments(); // Revert on error
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple"></div>
        </div>
    );

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-purple text-cream neo-border">
                        <th className="p-4 neo-border">Order ID</th>
                        <th className="p-4 neo-border">Customer</th>
                        <th className="p-4 neo-border">AWB Code</th>
                        <th className="p-4 neo-border">Courier</th>
                        <th className="p-4 neo-border">Status</th>
                        <th className="p-4 neo-border">Date</th>
                        <th className="p-4 neo-border">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-cream">
                    {shipments.map((shipment) => (
                        <tr key={shipment.id} className="hover:bg-yellow/10 transition-colors">
                            <td className="p-4 neo-border font-bold">
                                <Link href={`/admin/shipments/${shipment.id}`} className="hover:underline">
                                    {shipment.orderId}
                                </Link>
                            </td>
                            <td className="p-4 neo-border">{shipment.customerName}</td>
                            <td className="p-4 neo-border">
                                <span className="font-mono bg-charcoal/5 px-2 py-1 rounded select-all">
                                    {shipment.awbCode || 'Pending'}
                                </span>
                            </td>
                            <td className="p-4 neo-border">{shipment.courierName || 'Not Assigned'}</td>
                            <td className="p-4 neo-border">
                                {editingId === shipment.id ? (
                                    <select
                                        value={shipment.status}
                                        onChange={(e) => handleStatusUpdate(shipment.id, e.target.value)}
                                        className="p-1 neo-border text-sm"
                                        autoFocus
                                        onBlur={() => setEditingId(null)}
                                    >
                                        {STATUS_OPTIONS.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <button
                                        onClick={() => setEditingId(shipment.id)}
                                        className={`px-2 py-1 rounded neo-border text-xs font-bold uppercase hover:opacity-80
                      ${shipment.status === 'NEW' ? 'bg-yellow' :
                                                shipment.status === 'DELIVERED' ? 'bg-mint' :
                                                    shipment.status === 'CANCELED' ? 'bg-red-400' : 'bg-blue-300'
                                            }`}
                                    >
                                        {shipment.status}
                                    </button>
                                )}
                            </td>
                            <td className="p-4 neo-border">{new Date(shipment.createdAt).toLocaleDateString()}</td>
                            <td className="p-4 neo-border h-full">
                                <div className="flex gap-2">
                                    <Link
                                        href={`/admin/shipments/labels?id=${shipment.id}`}
                                        target="_blank"
                                        className="p-2 bg-white neo-border hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform neo-shadow-hover"
                                        title="Print Label"
                                    >
                                        <Printer size={16} />
                                    </Link>
                                    <button
                                        onClick={() => setEditingId(shipment.id)}
                                        className="p-2 bg-white neo-border hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform neo-shadow-hover"
                                        title="Edit Status"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(shipment.id)}
                                        className="p-2 bg-red-100 neo-border hover:bg-red-200 transition-colors hover:translate-x-[-2px] hover:translate-y-[-2px] neo-shadow-hover"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {shipments.length === 0 && (
                        <tr>
                            <td colSpan={7} className="p-8 text-center neo-border italic">
                                No shipments found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
