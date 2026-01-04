
'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { saveShipment } from '@/lib/db/shipments';

interface CreateShipmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: {
        orderId?: string;
        customerName?: string;
        customerEmail?: string;
        customerPhone?: string;
        address?: string;
    } | null;
}

export default function CreateShipmentModal({ isOpen, onClose, onSuccess, initialData }: CreateShipmentModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        orderId: initialData?.orderId || '',
        customerName: initialData?.customerName || '',
        customerEmail: initialData?.customerEmail || '',
        customerPhone: initialData?.customerPhone || '',
        courierName: '',
        awbCode: '',
        address: initialData?.address || '',
        weight: ''
    });

    // Reset form when initialData changes or modal opens
    React.useEffect(() => {
        if (isOpen && initialData) {
            setFormData(prev => ({
                ...prev,
                orderId: initialData.orderId || prev.orderId,
                customerName: initialData.customerName || prev.customerName,
                customerEmail: initialData.customerEmail || prev.customerEmail,
                customerPhone: initialData.customerPhone || prev.customerPhone,
                address: initialData.address || prev.address,
            }));
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await saveShipment({
                orderId: formData.orderId,
                customerName: formData.customerName,
                customerEmail: formData.customerEmail,
                customerPhone: formData.customerPhone,
                courierName: formData.courierName || null,
                awbCode: formData.awbCode || null,
                address: formData.address,
                weight: formData.weight ? parseFloat(formData.weight) : null,
                status: 'NEW'
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to create shipment:', error);
            alert('Failed to create shipment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-cream w-full max-w-2xl max-h-[90vh] overflow-y-auto neo-border-thick neo-shadow-lg relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-red-400 neo-border transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="p-8">
                    <h2 className="text-3xl font-bold font-header mb-6">Create Manual Shipment</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="font-bold text-sm">Order ID *</label>
                                <input
                                    name="orderId"
                                    required
                                    value={formData.orderId}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-white neo-border focus:outline-none focus:ring-2 focus:ring-purple"
                                    placeholder="e.g. KZN-123456"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="font-bold text-sm">Customer Name *</label>
                                <input
                                    name="customerName"
                                    required
                                    value={formData.customerName}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-white neo-border focus:outline-none focus:ring-2 focus:ring-purple"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="font-bold text-sm">Email *</label>
                                <input
                                    name="customerEmail"
                                    type="email"
                                    required
                                    value={formData.customerEmail}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-white neo-border focus:outline-none focus:ring-2 focus:ring-purple"
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="font-bold text-sm">Phone *</label>
                                <input
                                    name="customerPhone"
                                    required
                                    value={formData.customerPhone}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-white neo-border focus:outline-none focus:ring-2 focus:ring-purple"
                                    placeholder="+91 9876543210"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="font-bold text-sm">Courier Name</label>
                                <input
                                    name="courierName"
                                    value={formData.courierName}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-white neo-border focus:outline-none focus:ring-2 focus:ring-purple"
                                    placeholder="e.g. Delhivery, Bluedart"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="font-bold text-sm">AWB Code</label>
                                <input
                                    name="awbCode"
                                    value={formData.awbCode}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-white neo-border focus:outline-none focus:ring-2 focus:ring-purple"
                                    placeholder="Tracking Number"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="font-bold text-sm">Weight (kg)</label>
                                <input
                                    name="weight"
                                    type="number"
                                    step="0.01"
                                    value={formData.weight}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-white neo-border focus:outline-none focus:ring-2 focus:ring-purple"
                                    placeholder="0.5"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="font-bold text-sm">Shipping Address</label>
                            <textarea
                                name="address"
                                rows={3}
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full p-3 bg-white neo-border focus:outline-none focus:ring-2 focus:ring-purple"
                                placeholder="Full shipping address..."
                            />
                        </div>

                        <div className="flex justify-end gap-4 pt-4 border-t-2 border-black">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 bg-white neo-border neo-shadow-hover font-bold"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit" // Corrected: submit button should be inside form
                                disabled={loading}
                                className="px-6 py-3 bg-yellow neo-border neo-shadow-hover font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Creating...' : 'Create Shipment'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
