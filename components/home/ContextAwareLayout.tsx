'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ArcadeHero from '@/components/home/ArcadeHero';
import MarketHero from '@/components/home/MarketHero';
import EventHero from '@/components/home/EventHero';

type AffinityMode = 'gamer' | 'shopper' | 'social';

export default function ContextAwareLayout() {
    const { user } = useAuth();
    const [mode, setMode] = useState<AffinityMode>('gamer');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchAffinity = async () => {
            try {
                const statsRef = doc(db, 'users', user.uid, 'stats', 'affinity');
                const snap = await getDoc(statsRef);

                if (snap.exists()) {
                    const data = snap.data();
                    const gamer = data.gamer || 0;
                    const shopper = data.shopper || 0;
                    const social = data.social || 0;

                    if (shopper > gamer && shopper > social) setMode('shopper');
                    else if (social > gamer && social > shopper) setMode('social');
                    else setMode('gamer'); // Default to gamer if tie or highest
                }
            } catch (err) {
                console.error("Error fetching affinity:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAffinity();
    }, [user]);

    // Loading skeleton or default
    if (loading) return <div className="animate-pulse h-[500px] bg-gray-200 rounded-3xl" />;

    return (
        <div className="w-full transition-all duration-500">
            {mode === 'gamer' && <ArcadeHero />}
            {mode === 'shopper' && <MarketHero />}
            {mode === 'social' && <EventHero />}
        </div>
    );
}
