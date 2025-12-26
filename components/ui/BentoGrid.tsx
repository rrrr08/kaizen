'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const journeys = [
    {
        id: 'home',
        title: 'Play at Home',
        desc: 'Curation for your living room table.',
        icon: "🏠",
        color: 'bg-white',
        gridClass: 'md:col-span-2 md:row-span-2',
        image: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 'live',
        title: 'Play Together (Live)',
        desc: 'Crowded workshops and local meetups.',
        icon: "👥",
        color: 'bg-[#6C5CE7]',
        textColor: 'text-white',
        gridClass: 'md:col-span-1 md:row-span-3',
        image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800',
        tag: '📅 Next Event: Friday'
    },
    {
        id: 'occasions',
        title: 'Play for Occasions',
        desc: 'Parties, Weddings & Corporate Fun.',
        icon: "🎉",
        color: 'bg-[#FFD93D]',
        gridClass: 'md:col-span-2 md:row-span-1',
        image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 'belong',
        title: 'Play & Belong',
        desc: 'Treasure your community and rewards.',
        icon: "💎",
        color: 'bg-[#00B894]',
        textColor: 'text-white',
        gridClass: 'md:col-span-1 md:row-span-1',
        image: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=800'
    }
];

const BentoGrid: React.FC = () => {
    return (
        <section className="px-6 py-32 bg-[#FFFDF5]">
            <div className="container mx-auto">
                <div className="flex flex-col mb-16 space-y-4">
                    <h2 className="text-6xl font-black flex items-center gap-6">
                        <span className="bg-black text-white px-6 py-2 rounded-2xl neo-border neo-shadow">01</span>
                        Choose Your Play Style
                    </h2>
                    <p className="text-2xl font-semibold text-charcoal/60 max-w-2xl ml-2">
                        Every journey leads to joy. Pick your path and start rolling.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-3 gap-8 h-auto md:h-[900px] group/container">
                    {journeys.map((item) => (
                        <motion.div
                            key={item.id}
                            whileHover={{ scale: 1.05, zIndex: 20 }}
                            className={`relative ${item.gridClass} ${item.color} ${item.textColor || 'text-charcoal'} 
                neo-border-thick neo-shadow rounded-[40px] overflow-hidden group/item transition-all duration-500
                hover:!grayscale-0 group-hover/container:grayscale group-hover/container:opacity-70 hover:!opacity-100`}
                        >
                            <div className="absolute inset-0 w-full h-full opacity-10 group-hover/item:opacity-40 transition-opacity duration-500">
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            <div className="relative p-10 h-full flex flex-col justify-between z-10">
                                <div>
                                    {item.tag && (
                                        <span className="inline-block bg-white text-black px-4 py-2 rounded-full text-sm font-black neo-border mb-6 animate-bounce">
                                            {item.tag}
                                        </span>
                                    )}
                                    <div className="text-6xl mb-6">{item.icon}</div>
                                    <h3 className="text-4xl font-black mb-4 leading-tight">{item.title}</h3>
                                    <p className="text-xl font-semibold opacity-90 leading-relaxed">{item.desc}</p>
                                </div>

                                <motion.button
                                    whileHover={{ x: 15 }}
                                    className="w-fit flex items-center gap-3 font-black text-xl mt-8 bg-black text-white px-6 py-3 rounded-2xl neo-border neo-shadow"
                                >
                                    Explore Journey <span className="text-2xl">➜</span>
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BentoGrid;
