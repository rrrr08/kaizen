'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ArcadeHero from '@/components/home/ArcadeHero';
import MarketHero from '@/components/home/MarketHero';
import EventHero from '@/components/home/EventHero';
import { HeroContent } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

type AffinityMode = 'gamer' | 'shopper' | 'social';

interface ContextAwareLayoutProps {
    hero: HeroContent;
    heroShopper?: HeroContent;
    heroSocial?: HeroContent;
}

export default function ContextAwareLayout({ hero, heroShopper, heroSocial }: ContextAwareLayoutProps) {
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

                    // Simple logic: highest value wins, ties break to gamer -> shopper -> social
                    if (shopper > gamer && shopper >= social) setMode('shopper');
                    else if (social > gamer && social > shopper) setMode('social');
                    else setMode('gamer');
                }
            } catch (err) {
                console.error("Error fetching affinity:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAffinity();
    }, [user]);

    // Manual toggle for demo/testing purposes
    const cycleMode = () => {
        setMode(prev => {
            if (prev === 'gamer') return 'shopper';
            if (prev === 'shopper') return 'social';
            return 'gamer';
        });
    };

    // Determine current content based on mode
    const currentContent = React.useMemo(() => {
        if (mode === 'shopper' && heroShopper) return heroShopper;
        if (mode === 'social' && heroSocial) return heroSocial;
        return hero;
    }, [mode, hero, heroShopper, heroSocial]);

    if (loading) return <div className="h-[600px] w-full bg-gray-100 animate-pulse rounded-3xl" />;

    // Safety check: ensure hero exists before rendering
    if (!hero) return null;

    return (
        <div className="relative w-full min-h-[600px] overflow-hidden">

            {/* Hidden Dev Toggle - Double Click on bottom right corner to switch modes */}
            {/* Or a small visible interaction pill */}
            <div className="absolute bottom-4 right-4 z-50 opacity-0 hover:opacity-100 transition-opacity">
                <button
                    onClick={cycleMode}
                    className="bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm"
                >
                    Running Mode: {mode.toUpperCase()} (Click to Cycle)
                </button>
            </div>

            <AnimatePresence mode="wait">
                {mode === 'gamer' && (
                    <motion.div
                        key="gamer"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.5 }}
                        className="w-full"
                    >
                        <ArcadeHero
                            title={hero.title}
                            subtitle={hero.subtitle}
                            ctaText={hero.ctaTextShops}
                            ctaTextJoin={hero.ctaTextJoin}
                        />
                    </motion.div>
                )}

                {mode === 'shopper' && (
                    <motion.div
                        key="shopper"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="w-full"
                    >
                        <MarketHero
                            title={heroShopper?.title || "CURATED SELECTIONS"}
                            subtitle={heroShopper?.subtitle || `Welcome back, ${user?.displayName || 'Traveler'}`}
                            ctaText={heroShopper?.ctaTextShops || "Start Shopping"}
                            ctaTextJoin={heroShopper?.ctaTextJoin || "View Drops"}
                        />
                    </motion.div>
                )}

                {mode === 'social' && (
                    <motion.div
                        key="social"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ duration: 0.5 }}
                        className="w-full"
                    >
                        <EventHero
                            title={heroSocial?.title || "WHAT'S HAPPENING"}
                            subtitle={heroSocial?.subtitle || "Join events near you"}
                            ctaText={heroSocial?.ctaTextShops || "Find Events"}
                            ctaTextJoin={heroSocial?.ctaTextJoin || "Join Community"}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
