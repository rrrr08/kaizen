'use client';

import React, { useEffect, useState } from 'react';
import JoyCard from './JoyCard';
import { Loader2, Sparkles, MessageSquarePlus } from 'lucide-react';

import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ProofOfJoy {
    id: string;
    name: string;
    role: string;
    quote: string;
    image?: string;
    createdAt: string;
}


import ShareJoyModal from './ShareJoyModal';

interface ProofOfJoyGridProps {
    limit?: number;
    showAddButton?: boolean;
}

export default function ProofOfJoyGrid({ limit, showAddButton = true }: ProofOfJoyGridProps) {
    const [joys, setJoys] = useState<ProofOfJoy[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchJoys = async () => {
        try {
            setLoading(true);
            // Fetch approved proof of joys directly from Firestore
            const q = query(
                collection(db, 'proofofjoys'),
                where('status', '==', 'approved'),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Handle timestamp conversion if needed, falling back to ISO string
                createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
            })) as ProofOfJoy[];

            setJoys(data);
        } catch (error) {
            console.error("Failed to fetch proof of joy:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJoys();
    }, []);

    const displayedJoys = limit ? joys.slice(0, limit) : joys;

    return (
        <div className="w-full py-20">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <Sparkles className="text-[#00B894]" size={24} />
                        <span className="font-black text-sm uppercase tracking-[0.2em] text-[#00B894]">Testimonials</span>
                    </div>
                    <h2 className="font-header text-5xl md:text-6xl text-black tracking-tighter">
                        Proof of <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6C5CE7] to-[#FF7675]">Joy</span>
                    </h2>
                </div>

                {showAddButton && (
                    <button
                        className="px-8 py-4 bg-white border-4 border-black rounded-2xl flex items-center gap-3 font-black uppercase tracking-widest hover:bg-black hover:text-white hover:translate-y-[-4px] transition-all neo-shadow"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <MessageSquarePlus size={20} />
                        <span>Share Your Story</span>
                    </button>
                )}
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-black/20" size={48} />
                </div>
            ) : displayedJoys.length === 0 ? (
                <div className="text-center py-20 bg-white border-4 border-black border-dashed rounded-[32px]">
                    <p className="font-bold text-black/40 text-xl">Be the first to share the joy!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {displayedJoys.map((joy, index) => (
                        <JoyCard
                            key={joy.id}
                            index={index}
                            name={joy.name}
                            role={joy.role}
                            quote={joy.quote}
                            image={joy.image}
                        />
                    ))}
                </div>
            )}

            <ShareJoyModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchJoys}
            />
        </div>
    );
}
