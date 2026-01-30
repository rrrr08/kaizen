'use client';

import React, { useState, useEffect, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ShoppingBag, Users, PartyPopper, Gamepad2 } from 'lucide-react';

interface PlayStyle {
    emoji: string;
    title: string;
    description: string;
    images?: string[];
}

interface PlayStyleSelectorProps {
    playStyles?: Record<string, PlayStyle>;
}

const defaultStyles = [
    {
        id: 'home',
        title: 'Play at Home',
        description: 'Shop premium board games and puzzles for your home collection.',
        icon: ShoppingBag,
        images: [
            'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1585504198199-20277593b94f?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1611891487122-207579d67d98?auto=format&fit=crop&q=80&w=800'
        ],
        link: '/shop',
        linkText: 'Browse Shop',
        accentColor: 'border-[#6C5CE7]'
    },
    {
        id: 'together',
        title: 'Play Together',
        description: 'Join live game nights and community events in your city.',
        icon: Users,
        images: [
            'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=800'
        ],
        link: '/events',
        linkText: 'View Events',
        accentColor: 'border-[#FF7675]'
    },
    {
        id: 'occasions',
        title: 'Play for Occasions',
        description: 'Book custom game experiences for weddings, parties & corporate events.',
        icon: PartyPopper,
        images: [
            'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800'
        ],
        link: '/experiences',
        linkText: 'Explore Experiences',
        accentColor: 'border-[#FFD93D]'
    },
    {
        id: 'earn',
        title: 'Play & Earn',
        description: 'Play free puzzles daily and earn rewards you can redeem.',
        icon: Gamepad2,
        images: [
            
            '/game-points-rewards.png',
            'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800',
            
        ],
        link: '/play',
        linkText: 'Play Now Free',
        accentColor: 'border-[#00B894]'
    }
];

// Sub-component to handle background imagery without re-rendering the whole card
const BackgroundLayer = memo(({ images, title, isActive }: { images: string[], title: string, isActive: boolean }) => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (!isActive) {
            setIndex(0); // Optional: Reset to first image when inactive
            return;
        }

        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % images.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [images.length, isActive]);

    const currentImage = images[index];

    return (
        <div className="absolute inset-0 w-full h-full bg-black overflow-hidden pointer-events-none">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5 }}
                    className="absolute inset-0 w-full h-full"
                >
                    <Image
                        src={currentImage}
                        alt={title}
                        fill
                        priority={isActive}
                        className={`
                            object-cover transition-all duration-1000 ease-out
                            ${isActive ? 'scale-110' : 'scale-100 grayscale-[30%] group-hover:grayscale-0'}
                        `}
                    />
                </motion.div>
            </AnimatePresence>
            <div className={`absolute inset-0 bg-black/40 transition-opacity duration-500 z-[1] ${isActive ? 'opacity-20' : 'opacity-60'}`} />
            <div className={`absolute inset-0 bg-gradient-to-t from-black/90 to-transparent transition-opacity duration-500 z-[2] ${isActive ? 'opacity-80' : 'opacity-40'}`} />
        </div>
    );
});

BackgroundLayer.displayName = 'BackgroundLayer';

const PlayStyleSelector: React.FC<PlayStyleSelectorProps> = ({ playStyles }) => {
    const [activeId, setActiveId] = useState<string>('home');

    // Combine prop data with structure (icons/colors/links) from defaultStyles
    // This allows dynamic content while keeping structural integrity (links/icons) stable
    const mergedStyles = defaultStyles.map(style => {
        // Map playStyle keys to default ids
        let dynamicData;
        if (playStyles) {
            switch (style.id) {
                case 'home': dynamicData = playStyles.playAtHome; break;
                case 'together': dynamicData = playStyles.playTogether; break;
                case 'occasions': dynamicData = playStyles.playOccasions; break;
                case 'earn': dynamicData = playStyles.playEarn; break;
            }
        }

        return {
            ...style,
            title: dynamicData?.title || style.title,
            description: dynamicData?.description || style.description,
            // Use dynamic images if available and not empty, otherwise fallback
            images: (dynamicData?.images && dynamicData.images.length > 0) ? dynamicData.images : style.images
        };
    });

    const [isPaused, setIsPaused] = useState(false);

    // Auto-rotation logic
    useEffect(() => {
        if (isPaused) return;

        // Disable auto-rotation on mobile (screen width < 1024px) to prevent layout shifting
        if (window.innerWidth < 1024) return;

        const currentStyleIndex = mergedStyles.findIndex(s => s.id === activeId);
        if (currentStyleIndex === -1) return;

        const currentStyle = mergedStyles[currentStyleIndex];
        // Calculate duration based on number of images (5s per image)
        // If no images (fallback), default to 5s
        const imageCount = currentStyle.images?.length || 1;
        const duration = imageCount * 5000;

        const timer = setTimeout(() => {
            const nextIndex = (currentStyleIndex + 1) % mergedStyles.length;
            setActiveId(mergedStyles[nextIndex].id);
        }, duration);

        return () => clearTimeout(timer);
    }, [activeId, isPaused, mergedStyles]);

    return (
        <div
            className="flex flex-col lg:flex-row gap-2 h-auto lg:h-[600px] w-full items-stretch"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {mergedStyles.map((style) => {
                const isActive = activeId === style.id;

                return (
                    <div
                        key={style.id}
                        onMouseEnter={() => setActiveId(style.id)}
                        // Click also sets active, useful for touch devices
                        onClick={() => setActiveId(style.id)}
                        className={`
                            relative overflow-hidden cursor-pointer
                            transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]
                            ${isActive ? 'lg:flex-[3.5] min-h-[450px]' : 'lg:flex-[1] min-h-[140px]'}
                            lg:min-h-0 lg:min-w-[100px]
                            rounded-3xl border-2 hover:border-4 border-black group
                            will-change-[flex,transform]
                        `}
                    >
                        {/* Background Layer with isolated re-renders */}
                        <BackgroundLayer
                            images={style.images}
                            title={style.title}
                            isActive={isActive}
                        />

                        {/* Content Container */}
                        <div className="absolute inset-0 p-6 flex flex-col justify-end z-10 select-none">

                            {/* Header: Icon + Title */}
                            <div className={`
                                flex items-center gap-4 mb-4 transition-all duration-500 
                                ${isActive ? 'translate-y-0' : 'lg:translate-y-[-40px] lg:items-start lg:flex-col lg:gap-8'}
                            `}>
                                {/* Icon Badge */}
                                <div className={`
                                    w-14 h-14 flex items-center justify-center rounded-2xl 
                                    bg-white/10 backdrop-blur-md border border-white/20 text-white shrink-0
                                    shadow-[4px_4px_0px_rgba(0,0,0,0.5)]
                                    transition-all duration-500
                                    ${isActive ? 'scale-100' : 'scale-90 lg:mt-8'}
                                `}>
                                    <style.icon size={28} strokeWidth={2.5} />
                                </div>

                                {/* Title */}
                                <div className="relative overflow-hidden">
                                    <h3 className={`
                                        text-2xl lg:text-3xl font-black uppercase tracking-tighter text-white leading-none
                                        transition-all duration-500
                                        ${isActive ? 'opacity-100 translate-x-0' : 'lg:hidden opacity-0 -translate-x-4'}
                                    `}>
                                        {style.title}
                                    </h3>

                                    {/* Vertical Title for Inactive State */}
                                    {!isActive && (
                                        <h3 className={`
                                            hidden lg:block text-2xl font-black uppercase tracking-widest text-white/70 
                                            vertical-rl rotate-180 origin-bottom-left absolute -bottom-20 left-1
                                            whitespace-nowrap transition-all duration-500 delay-100
                                        `}>
                                            {style.title}
                                        </h3>
                                    )}
                                </div>
                            </div>

                            {/* Description & Action (Only visible when active) */}
                            <div className={`
                                overflow-hidden transition-all duration-500 ease-out
                                ${isActive ? 'max-h-[500px] opacity-100 delay-150' : 'max-h-0 opacity-0'}
                            `}>
                                <p className="text-white/80 font-bold text-lg leading-snug mb-6 max-w-lg">
                                    {style.description}
                                </p>

                                <Link href={style.link} className="inline-block relative group/btn" onClick={(e) => e.stopPropagation()}>
                                    <button className="flex items-center gap-3 px-8 py-4 bg-white text-black font-black text-sm uppercase tracking-widest rounded-xl hover:bg-[#FFD93D] transition-colors border-2 border-transparent relative z-10">
                                        {style.linkText}
                                        <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                    {/* Retro Shadow */}
                                    <div className="absolute top-2 left-2 w-full h-full bg-black rounded-xl z-0 group-hover/btn:top-3 group-hover/btn:left-3 transition-all" />
                                </Link>
                            </div>

                        </div>

                        {/* Active Border Highlight */}
                        {isActive && (
                            <div className={`absolute inset-0 border-[6px] ${style.accentColor} rounded-[22px] pointer-events-none z-20`} />
                        )}

                    </div>
                );
            })}
        </div>
    );
};

export default PlayStyleSelector;
