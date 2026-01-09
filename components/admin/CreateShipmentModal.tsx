
'use client';

import React, { useState } from 'react';
import { X, Truck, Package, User, Mail, Phone, MapPin, Weight, Hash, Sparkles } from 'lucide-react';
import { saveShipment } from '@/lib/db/shipments';
import { usePopup } from '@/app/context/PopupContext';
import { motion, AnimatePresence } from 'framer-motion';

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
    const { showAlert } = usePopup();
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/admin/shipments/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: formData.orderId,
                    customerName: formData.customerName,
                    customerEmail: formData.customerEmail,
                    customerPhone: formData.customerPhone,
                    courierName: formData.courierName || null,
                    awbCode: formData.awbCode || null,
                    address: formData.address,
                    weight: formData.weight ? parseFloat(formData.weight) : null,
                    status: 'NEW'
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create shipment');
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to create shipment:', error);
            await showAlert('Failed to create shipment. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const generateAWB = () => {
        const randomId = Math.floor(100000 + Math.random() * 900000);
        setFormData(prev => ({
            ...prev,
            awbCode: `KZN-${randomId}`,
            courierName: prev.courierName || 'Kaizen Express'
        }));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 40, rotate: -1 }}
                        animate={{ scale: 1, y: 0, rotate: 0 }}
                        exit={{ scale: 0.9, y: 40, rotate: 1 }}
                        className="bg-white w-full max-w-3xl max-h-[90vh] overflow-hidden border-4 border-black shadow-[12px_12px_0px_#000] rounded-3xl relative flex flex-col"
                    >
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-[#6C5CE7] opacity-10 rounded-bl-full pointer-events-none" />

                        {/* Header */}
                        <div className="p-6 sm:p-8 border-b-4 border-black flex justify-between items-center bg-[#FFFDF5] relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-black rounded-xl rotate-6 neo-shadow">
                                    <Truck size={24} className="text-[#FFD93D]" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tighter text-black">Manifest Cargo</h2>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40">Shipment Registration System</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 bg-white border-2 border-black rounded-lg flex items-center justify-center hover:bg-black hover:text-white transition-all neo-shadow-sm active:translate-y-1 active:shadow-none"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Form Content */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 relative z-10 scrollbar-hide">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Order ID */}
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest text-black/60 ml-2">
                                        <Hash size={12} /> Operation Reference *
                                    </label>
                                    <input
                                        name="orderId"
                                        required
                                        value={formData.orderId}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border-2 border-black rounded-xl font-bold uppercase tracking-tight focus:outline-none focus:bg-white focus:ring-4 focus:ring-[#6C5CE7]/10 transition-all text-sm"
                                        placeholder="KZN-XXXXXX"
                                    />
                                </div>

                                {/* Customer Name */}
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest text-black/60 ml-2">
                                        <User size={12} /> Consignee Name *
                                    </label>
                                    <input
                                        name="customerName"
                                        required
                                        value={formData.customerName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border-2 border-black rounded-xl font-bold uppercase tracking-tight focus:outline-none focus:bg-white focus:ring-4 focus:ring-[#6C5CE7]/10 transition-all text-sm"
                                        placeholder="Enter Full Name"
                                    />
                                </div>

                                {/* Email */}
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest text-black/60 ml-2">
                                        <Mail size={12} /> Contact Email *
                                    </label>
                                    <input
                                        name="customerEmail"
                                        type="email"
                                        required
                                        value={formData.customerEmail}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border-2 border-black rounded-xl font-bold focus:outline-none focus:bg-white focus:ring-4 focus:ring-[#6C5CE7]/10 transition-all text-sm"
                                        placeholder="Email Address"
                                    />
                                </div>

                                {/* Phone */}
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest text-black/60 ml-2">
                                        <Phone size={12} /> Contact Number *
                                    </label>
                                    <input
                                        name="customerPhone"
                                        required
                                        value={formData.customerPhone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border-2 border-black rounded-xl font-bold focus:outline-none focus:bg-white focus:ring-4 focus:ring-[#6C5CE7]/10 transition-all text-sm"
                                        placeholder="+91 XXXXX XXXXX"
                                    />
                                </div>

                                {/* Courier */}
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest text-black/60 ml-2">
                                        <Package size={12} /> Logistic Partner
                                    </label>
                                    <input
                                        name="courierName"
                                        value={formData.courierName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border-2 border-black rounded-xl font-bold uppercase tracking-tight focus:outline-none focus:bg-white focus:ring-4 focus:ring-[#6C5CE7]/10 transition-all text-sm"
                                        placeholder="e.g. Bluedart"
                                    />
                                </div>

                                {/* AWB Code */}
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest text-black/60 ml-2">
                                        <Sparkles size={12} /> Tracking AWB
                                    </label>
                                    <div className="flex gap-3">
                                        <input
                                            name="awbCode"
                                            value={formData.awbCode}
                                            onChange={handleChange}
                                            className="flex-1 px-4 py-3 bg-gray-50 border-2 border-black rounded-xl font-mono font-bold uppercase tracking-tight focus:outline-none focus:bg-white focus:ring-4 focus:ring-[#6C5CE7]/10 transition-all text-sm"
                                            placeholder="XXXX-XXXX"
                                        />
                                        <button
                                            type="button"
                                            onClick={generateAWB}
                                            className="px-4 bg-[#FFD93D] border-2 border-black rounded-lg font-bold text-[10px] uppercase tracking-widest hover:translate-y-[-2px] transition-all neo-shadow-sm active:translate-y-1 active:shadow-none"
                                        >
                                            AUTO
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Weight & Address */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                <div className="md:col-span-1 space-y-3">
                                    <label className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest text-black/60 ml-2">
                                        <Weight size={12} /> Mass (KG)
                                    </label>
                                    <input
                                        name="weight"
                                        type="number"
                                        step="0.01"
                                        value={formData.weight}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border-2 border-black rounded-xl font-bold focus:outline-none focus:bg-white focus:ring-4 focus:ring-[#6C5CE7]/10 transition-all text-sm"
                                        placeholder="1.0"
                                    />
                                </div>
                                <div className="md:col-span-3 space-y-3">
                                    <label className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest text-black/60 ml-2">
                                        <MapPin size={12} /> Delivery Destination
                                    </label>
                                    <textarea
                                        name="address"
                                        rows={2}
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border-2 border-black rounded-xl font-bold focus:outline-none focus:bg-white focus:ring-4 focus:ring-[#6C5CE7]/10 transition-all resize-none text-sm"
                                        placeholder="Full address details..."
                                    />
                                </div>
                            </div>

                            {/* Sticky Footer Actions */}
                            <div className="pt-6 flex flex-col sm:flex-row gap-4 pt-6 border-t-2 border-black">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-3 bg-white border-2 border-black rounded-xl font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all neo-shadow-sm active:translate-y-1 active:shadow-none text-xs"
                                >
                                    Abort Operation
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-3 bg-[#00B894] text-white border-2 border-black rounded-xl font-bold uppercase tracking-widest hover:translate-y-[-2px] transition-all neo-shadow-sm active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            REGISTERING
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={16} />
                                            INITIALIZE SHIPMENT
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )
            }
        </AnimatePresence >
    );
}
