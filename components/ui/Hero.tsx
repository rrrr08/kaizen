'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FloatingPatterns } from '@/lib/joy-constants';
import Image from 'next/image';

const Hero: React.FC = () => {
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

                    <h1 className="text-6xl lg:text-[100px] font-black leading-[0.9] tracking-tighter">
                        Games are <br />
                        <span className="text-[#FFD93D] neo-shadow inline-block transform -rotate-1 bg-black text-white px-4 py-1 neo-border">Moments</span>, <br />
                        Memories, and <br />
                        <span className="text-[#6C5CE7]">Shared Joy.</span>
                    </h1>

                    <p className="text-2xl text-charcoal/90 max-w-xl font-semibold leading-relaxed">
                        Analog connection for a digital world. Join the movement of people playing, belonging, and earning joy.
                    </p>

                    <div className="flex flex-wrap gap-8 pt-6">
                        <Link href="/shop">
                            <motion.button
                                whileHover={{ scale: 1.05, y: -8, rotate: -2 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-[#FFD93D] text-black px-12 py-6 rounded-[25px] font-black text-2xl neo-border-thick neo-shadow-lg hover:bg-yellow-400 transition-colors"
                            >
                                Shop Games 🎲
                            </motion.button>
                        </Link>
                        <Link href="/events">
                            <motion.button
                                whileHover={{ scale: 1.05, y: -8, rotate: 2 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-transparent text-black px-12 py-6 rounded-[25px] font-black text-2xl neo-border-thick hover:bg-black/5 transition-colors"
                            >
                                Join Game Night
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
                                src="https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&q=80&w=800"
                                alt="People laughing at a game night"
                                fill
                                className="object-cover grayscale-0 group-hover:grayscale-0 group-hover:sepia-[0.3] transition-all duration-700"
                            />
                        </motion.div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#6C5CE7]/40 to-transparent mix-blend-overlay" />

                        {/* Play Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-white p-6 rounded-full neo-border neo-shadow">
                                <span className="text-4xl">✨</span>
                            </div>
                        </div>
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
                        {/* Dice Icon placeholder */}
                        <div className="text-4xl">🎲</div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
