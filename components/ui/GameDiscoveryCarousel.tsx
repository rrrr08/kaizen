'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Users, Clock, Sparkles, Flame, Crown } from 'lucide-react';
import { FeaturedGame } from '@/lib/types';

interface GameDiscoveryCarouselProps {
    games?: FeaturedGame[];
}

const GameDiscoveryCarousel: React.FC<GameDiscoveryCarouselProps> = ({ games = [] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // If no games, don't render or render a fallback
    if (!games || games.length === 0) return null;

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % games.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + games.length) % games.length);
    };

    const currentGame = games[currentIndex];

    return (
        <section className="px-6 py-32 bg-[#FFFDF5] relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-20 right-20 w-64 h-64 bg-[#FFD93D]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-20 w-64 h-64 bg-[#6C5CE7]/10 rounded-full blur-3xl" />

            <div className="container mx-auto relative z-10">
                {/* Section Header */}
                <div className="flex flex-col mb-16 space-y-4">
                    <h2 className="text-6xl font-black flex items-center gap-6">
                        <span className="bg-[#6C5CE7] text-white px-6 py-2 rounded-2xl neo-border neo-shadow">01</span>
                        Featured This Week
                    </h2>
                    <p className="text-2xl font-semibold text-charcoal/60 max-w-2xl ml-2">
                        Handpicked games that are making waves in our community.
                    </p>
                </div>

                {/* Main Carousel */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    {/* Left Side - Game Visual */}
                    <div className="lg:col-span-7">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, x: 100 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ duration: 0.5, type: 'spring' }}
                                className="relative"
                            >
                                <div className={`relative aspect-[4/3] rounded-[50px] overflow-hidden neo-border-thick neo-shadow-lg ${currentGame.color} p-8`}>
                                    <div className="absolute inset-8 rounded-[40px] overflow-hidden">
                                        <Image
                                            src={currentGame.image}
                                            alt={currentGame.title}
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                    </div>

                                    {/* Badge */}
                                    <div className="absolute top-12 left-12 z-10">
                                        <span className="bg-white text-black px-6 py-3 rounded-full text-sm font-black neo-border neo-shadow flex items-center gap-2">
                                            {currentGame.badge === 'HOT' && <Flame size={20} className="text-red-500" />}
                                            {currentGame.badge === 'BESTSELLER' && <Crown size={20} className="text-[#FFD93D]" />}
                                            {currentGame.badge === 'AWARD WINNER' && <Sparkles size={20} className="text-[#6C5CE7]" />}
                                            {currentGame.badge}
                                        </span>
                                    </div>

                                    {/* Game Info Overlay */}
                                    <div className="absolute bottom-12 left-12 right-12 z-10 text-white">
                                        <h3 className="text-7xl font-black mb-4 drop-shadow-2xl">{currentGame.title}</h3>
                                        <p className="text-3xl font-bold opacity-90 drop-shadow-lg">{currentGame.tagline}</p>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Right Side - Game Details */}
                    <div className="lg:col-span-5 space-y-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4, delay: 0.2 }}
                                className="space-y-8"
                            >
                                {/* Stats Cards */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-white p-8 rounded-[30px] neo-border-thick neo-shadow">
                                        <Users size={40} className="text-[#6C5CE7] mb-4" />
                                        <p className="text-sm font-black uppercase tracking-widest text-charcoal/40 mb-2">Players</p>
                                        <p className="text-4xl font-black">{currentGame.players}</p>
                                    </div>
                                    <div className="bg-white p-8 rounded-[30px] neo-border-thick neo-shadow">
                                        <Clock size={40} className="text-[#00B894] mb-4" />
                                        <p className="text-sm font-black uppercase tracking-widest text-charcoal/40 mb-2">Duration</p>
                                        <p className="text-4xl font-black">{currentGame.time}</p>
                                    </div>
                                </div>

                                {/* Mood Tag */}
                                <div className="bg-[#FFD93D] p-8 rounded-[30px] neo-border-thick neo-shadow">
                                    <p className="text-sm font-black uppercase tracking-widest text-black/40 mb-2">Vibe Check</p>
                                    <p className="text-5xl font-black text-black">{currentGame.mood}</p>
                                </div>

                                {/* CTA Button */}
                                <motion.button
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-full bg-black text-white py-8 rounded-[30px] font-black text-2xl neo-border-thick neo-shadow hover:bg-[#6C5CE7] transition-colors"
                                >
                                    Explore This Game
                                </motion.button>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Navigation Controls */}
                <div className="flex justify-center items-center gap-8 mt-16">
                    <motion.button
                        whileHover={{ scale: 1.1, x: -5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={prevSlide}
                        className="w-20 h-20 bg-white rounded-full neo-border-thick neo-shadow flex items-center justify-center hover:bg-[#FFD93D] transition-colors"
                    >
                        <ChevronLeft size={40} className="font-black" />
                    </motion.button>

                    {/* Dots Indicator */}
                    <div className="flex gap-4">
                        {games.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`transition-all duration-300 rounded-full neo-border ${index === currentIndex
                                    ? 'w-16 h-6 bg-black'
                                    : 'w-6 h-6 bg-white hover:bg-gray-200'
                                    }`}
                            />
                        ))}
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.1, x: 5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={nextSlide}
                        className="w-20 h-20 bg-white rounded-full neo-border-thick neo-shadow flex items-center justify-center hover:bg-[#FFD93D] transition-colors"
                    >
                        <ChevronRight size={40} className="font-black" />
                    </motion.button>
                </div>
            </div>
        </section>
    );
};

export default GameDiscoveryCarousel;

