
'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Barcode from 'react-barcode';

export default function LabelPage() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const [shipment, setShipment] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        fetchShipment();
    }, [id]);

    const fetchShipment = async () => {
        try {
            const docRef = doc(db, 'shipments', id!);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setShipment({ id: docSnap.id, ...docSnap.data() });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!loading && shipment) {
            window.print();
        }
    }, [loading, shipment]);

    if (loading) return <div>Loading label...</div>;
    if (!shipment) return <div>Shipment not found</div>;

    return (
        <div className="p-8 bg-white min-h-screen text-black flex justify-center">
            <div className="w-[4in] border-2 border-black p-4 bg-white relative">
                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-4">
                    <div>
                        <h1 className="text-xl font-bold font-mono">SHIPPING LABEL</h1>
                        <p className="text-xs uppercase font-bold text-gray-600">
                            {shipment.courierName || 'STANDARD SHIPPING'}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold">WEIGHT: {shipment.weight || '0.5'}</p>
                        <p className="font-bold">KG</p>
                    </div>
                </div>

                {/* To Address */}
                <div className="mb-6">
                    <p className="text-xs uppercase font-bold text-gray-500 mb-1">SHIP TO:</p>
                    <p className="font-bold text-lg">{shipment.customerName}</p>
                    <div className="text-sm whitespace-pre-wrap font-mono uppercase">
                        {shipment.address || 'NO ADDRESS PROVIDED'}
                    </div>
                    <p className="text-sm mt-1">{shipment.customerPhone}</p>
                </div>

                {/* Barcode Area */}
                <div className="mb-6 flex justify-center border-y-2 border-black py-4">
                    {shipment.awbCode ? (
                        <Barcode value={shipment.awbCode} width={2} height={50} fontSize={14} />
                    ) : (
                        <Barcode value={shipment.orderId} width={2} height={50} fontSize={14} />
                    )}
                </div>

                {/* Order Info */}
                <div className="border-b-2 border-black pb-4 mb-4">
                    <div className="flex justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-500">ORDER #</p>
                            <p className="font-mono font-bold">{shipment.orderId}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-gray-500">DATE</p>
                            <p className="font-mono font-bold">
                                {shipment.createdAt?.toDate ? shipment.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center text-xs font-bold mt-8">
                    <p>AUTHORIZED SHIPPING DOCUMENT</p>
                    <p className="mt-1">KAIZEN STORE</p>
                </div>

            </div>
            <style jsx global>{`
        @media print {
          @page {
            size: 4in 6in;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            background: white;
          }
          .no-print {
            display: none;
          }
        }
      `}</style>
        </div>
    );
}
