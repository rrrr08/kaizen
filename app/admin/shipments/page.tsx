
'use client';

import React, { useState } from 'react';
import ShipmentList from '@/components/admin/ShipmentList';
import CreateShipmentModal from '@/components/admin/CreateShipmentModal';
import { Plus } from 'lucide-react';

export default function AdminShipmentsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleShipmentCreated = () => {
        // Adding a key change prop or similar would be better, but for now we rely on the list component fetching on mount.
        // To trigger a re-fetch, we can signal the list, or cleaner: just reload the window or use a context.
        // For simplicity, I'll essentially force a re-mount of the list.
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-bold font-header mb-2">Shipment Management</h1>
                    <p className="text-charcoal/60">Manage your shipments manually and generate labels.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-purple text-cream px-6 py-3 neo-border neo-shadow-hover font-bold flex items-center gap-2"
                >
                    <Plus size={20} />
                    Add Manual Shipment
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-yellow p-6 neo-border neo-shadow">
                    <h3 className="text-xl font-bold mb-1">Total Shipments</h3>
                    <p className="text-3xl font-header">--</p>
                </div>
                <div className="bg-mint p-6 neo-border neo-shadow">
                    <h3 className="text-xl font-bold mb-1">Delivered Today</h3>
                    <p className="text-3xl font-header">--</p>
                </div>
                <div className="bg-purple text-cream p-6 neo-border neo-shadow">
                    <h3 className="text-xl font-bold mb-1">Pending</h3>
                    <p className="text-3xl font-header">--</p>
                </div>
            </div>

            <div className="bg-cream p-6 neo-border neo-shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold font-header">Active Shipments</h2>
                    <div className="flex gap-2">
                        <button className="bg-white px-4 py-2 neo-border neo-shadow-hover text-sm font-bold opacity-50 cursor-not-allowed">
                            Bulk Export
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
        </div>
    );
}
