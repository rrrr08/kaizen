'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FloatingPatterns } from '@/lib/joy-constants';
import Image from 'next/image';
import { Sparkles, Dice5 } from 'lucide-react';

interface HeroProps {
    title?: string;
    subtitle?: string;
    ctaTextShops?: string;
    ctaTextJoin?: string;
    backgroundImage?: string;
}

const Hero: React.FC<HeroProps> = ({
    title = 'Games are <br /> Moments, <br /> Memories, and <br /> Shared Joy.',
    subtitle = 'Analog connection for a digital world. Join the movement of people playing, belonging, and earning joy.',
    ctaTextShops = 'Shop Games',
    ctaTextJoin = 'Join Game Night',
    backgroundImage = '/hero-image.png'
}) => {
    return (
        <section className="relative min-h-[85vh] flex items-center px-6 lg:px-20 overflow-hidden pt-12">
            <FloatingPatterns />

            <div className="container mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
                {/* Text Area (60%) */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="lg:col-span-7 space-y-10"
                >
                    <div className="inline-flex items-center gap-2 bg-[#6C5CE7] text-white px-5 py-2 rounded-full neo-border neo-shadow font-black text-sm uppercase tracking-widest">
                        <span className="animate-pulse">●</span> Level up your social life
                    </div>

                    <h1
                        className="text-4xl md:text-6xl lg:text-[100px] font-black leading-[0.9] tracking-tighter"
                        dangerouslySetInnerHTML={{ __html: title }}
                    />

                    <p className="text-lg md:text-2xl text-charcoal/90 max-w-xl font-semibold leading-relaxed">
                        {subtitle}
                    </p>

                    <div className="flex flex-wrap gap-4 md:gap-8 pt-6">
                        <Link href="/events/upcoming">
                            <motion.button
                                whileHover={{ scale: 1.05, y: -8, rotate: -2 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-[#FFD93D] text-black px-8 py-4 md:px-12 md:py-6 rounded-[20px] md:rounded-[25px] font-black text-lg md:text-2xl neo-border-thick neo-shadow-lg hover:bg-yellow-400 transition-colors"
                            >
                                {ctaTextShops}
                            </motion.button>
                        </Link>
                        <Link href="/shop">
                            <motion.button
                                whileHover={{ scale: 1.05, y: -8, rotate: 2 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-transparent text-black px-8 py-4 md:px-12 md:py-6 rounded-[20px] md:rounded-[25px] font-black text-lg md:text-2xl neo-border-thick hover:bg-black/5 transition-colors"
                            >
                                {ctaTextJoin}
                            </motion.button>
                        </Link>
                    </div>
                </motion.div>

                {/* Visual Area (40%) - Blob Mask Montage */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ duration: 1.2, delay: 0.3, type: "spring" }}
                    className="lg:col-span-5 relative"
                >
                    <div className="relative w-full aspect-[4/5] overflow-hidden blob-mask neo-border-thick bg-[#FFD93D] neo-shadow-lg group">
                        <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="w-full h-full relative"
                        >
                            <Image
                                src={backgroundImage}
                                alt="Hero visual"
                                fill
                                priority
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                                className="object-cover grayscale-0 group-hover:grayscale-0 group-hover:sepia-[0.3] transition-all duration-700"
                            />
                        </motion.div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#6C5CE7]/40 to-transparent mix-blend-overlay" />


                    </div>

                    {/* Floating Dopamine Accents */}
                    <motion.div
                        animate={{ y: [0, -20, 0], rotate: [5, -5, 5] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -top-12 -right-8 w-32 h-32 bg-[#00B894] rounded-full neo-border neo-shadow flex items-center justify-center text-white"
                    >
                        <div className="text-center">
                            <p className="font-black text-3xl">10k+</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest">Happy Players</p>
                        </div>
                    </motion.div>

                    <motion.div
                        animate={{ y: [0, 20, 0], scale: [1, 1.1, 1] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute -bottom-12 -left-12 w-40 h-40 bg-[#FFD93D] rounded-[30px] neo-border neo-shadow flex items-center justify-center -rotate-12"
                    >
                        <Dice5 size={48} className="text-black" />
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
