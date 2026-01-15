'use client';

import { motion } from 'framer-motion';
import { Gift, Coins, RotateCw, Star, Trophy } from 'lucide-react';

export default function InfoCards() {
    const cards = [
        {
            title: "Free Daily Spin",
            description: "Get one free spin every 24 hours",
            icon: Gift,
            color: "#FFD93D", // Yellow
            rotate: 1
        },
        {
            title: "Win Big Prizes",
            description: "Earn bonus points and special rewards",
            icon: Trophy, // Swapped Coins for Trophy for 'Prizes' visual
            color: "#FF7675", // Coral Red
            rotate: -1
        },
        {
            title: "Extra Spins",
            description: "Use points to buy additional spins",
            icon: RotateCw,
            color: "#6C5CE7", // Purple
            rotate: 1
        }
    ];

    return (
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {cards.map((card, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -8, rotate: card.rotate * -1, scale: 1.02 }}
                    className="relative group"
                >
                    {/* Shadow Block */}
                    <div className="absolute inset-0 bg-black rounded-[24px] translate-x-3 translate-y-3 transition-transform group-hover:translate-x-4 group-hover:translate-y-4"></div>

                    {/* Card Content */}
                    <div className="relative h-full bg-white border-4 border-black p-8 rounded-[24px] flex flex-col items-center text-center overflow-hidden">

                        {/* Background Blob */}
                        <div
                            className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-20 transition-transform group-hover:scale-150 duration-500"
                            style={{ backgroundColor: card.color }}
                        ></div>

                        {/* Icon Box */}
                        <div
                            className="w-20 h-20 rounded-2xl border-4 border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_#000] group-hover:shadow-[6px_6px_0px_#000] group-hover:-rotate-6 transition-all duration-300 relative z-10"
                            style={{ backgroundColor: card.color }}
                        >
                            <card.icon size={36} className="text-black" strokeWidth={2.5} />
                        </div>

                        <h3 className="font-header text-2xl text-black mb-3 uppercase tracking-wide leading-none relative z-10">
                            {card.title}
                        </h3>

                        <p className="text-black/70 font-bold leading-relaxed relative z-10 text-sm">
                            {card.description}
                        </p>

                        {/* Bottom Decoration */}
                        <div className="mt-auto pt-6 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-300">
                            <Star size={24} fill={card.color} stroke="black" strokeWidth={2} />
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
