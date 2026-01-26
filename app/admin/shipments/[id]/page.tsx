
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import { ArrowLeft } from 'lucide-react';

export default function ShipmentDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [shipment, setShipment] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch(`/api/admin/shipments/${params.id}`);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setShipment(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center animate-pulse">Loading shipment details...</div>;
    if (!shipment) return <div className="p-8 text-center text-red-500">Shipment not found.</div>;

    return (
        <div className="p-8 max-w-5xl mx-auto font-sans">
            <button
                onClick={() => router.back()}
                className="mb-8 flex items-center gap-2 font-bold hover:translate-x-[-4px] transition-transform"
            >
                <ArrowLeft className="w-4 h-4" /> Back to shipments
            </button>

            <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-bold font-header mb-2">Shipment #{shipment.orderId}</h1>
                    <p className="text-charcoal/60 uppercase text-sm font-bold tracking-wider">
                        SHIPPING VIA {shipment.courierName || 'MANUAL DELIVERY'}
                    </p>
                </div>
                <div className="flex gap-4">
                    <Link
                        href={`/admin/shipments/labels?id=${shipment.id}`}
                        target="_blank"
                        className="bg-yellow px-6 py-3 neo-border neo-shadow-hover text-sm font-bold block text-center"
                    >
                        PRINT LABEL
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-8">
                    <div className="bg-mint p-6 neo-border neo-shadow">
                        <h3 className="text-xl font-bold mb-4">Customer Info</h3>
                        <div className="space-y-2">
                            <p className="font-bold text-lg">{shipment.customerName}</p>
                            <p className="text-sm">{shipment.customerEmail}</p>
                            <p className="text-sm">{shipment.customerPhone}</p>
                            <div className="mt-4 p-4 bg-white/50 rounded neo-border text-sm whitespace-pre-wrap">
                                {shipment.address || 'No address provided'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-cream p-6 neo-border neo-shadow">
                        <h3 className="text-xl font-bold mb-4">Shipment Details</h3>
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-charcoal/60">AWB Code</span>
                                <span className="font-mono font-bold select-all bg-yellow/20 px-1 rounded">{shipment.awbCode || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-charcoal/60">Weight</span>
                                <span className="font-bold">{shipment.weight ? `${shipment.weight} kg` : 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-charcoal/60">Status</span>
                                <span className={`px-2 py-0.5 bg-yellow rounded neo-border font-bold text-xs uppercase
                  ${shipment.status === 'NEW' ? 'bg-yellow' :
                                        shipment.status === 'DELIVERED' ? 'bg-mint' :
                                            shipment.status === 'CANCELED' ? 'bg-red-400' : 'bg-blue-300'
                                    }`}
                                >
                                    {shipment.status}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-charcoal/60">Created Date</span>
                                <span className="font-bold">
                                    {shipment.createdAt ? new Date(shipment.createdAt).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-charcoal/60">Last Updated</span>
                                <span className="font-bold">
                                    {shipment.updatedAt ? new Date(shipment.updatedAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
