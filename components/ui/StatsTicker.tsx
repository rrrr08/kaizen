'use client';

import React from 'react';
import { motion } from 'framer-motion';

const stats = [
    { label: 'Happy Players', value: '10,000+' },
    { label: 'Board Games', value: '500+' },
    { label: 'Events Hosted', value: '150+' },
    { label: 'XP Earned', value: '1M+' },
    { label: 'Cities', value: '12+' },
    { label: 'Community Rating', value: '4.9/5' }
];

const StatsTicker: React.FC = () => {
    return (
        <div className="bg-[#FFFDF5] py-12 overflow-hidden border-y border-black/5">
            <div className="flex whitespace-nowrap">
                <motion.div
                    animate={{ x: [0, -1000] }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 30,
                            ease: "linear",
                        },
                    }}
                    className="flex items-center gap-12 px-6"
                >
                    {[...stats, ...stats].map((stat, i) => (
                        <div key={i} className="flex items-center gap-6">
                            <div className="flex flex-col items-start">
                                <span className="text-3xl font-black text-black tracking-tighter uppercase">{stat.value}</span>
                                <span className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">{stat.label}</span>
                            </div>
                            <div className="w-2 h-2 bg-[#6C5CE7] rounded-full opacity-20" />
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default StatsTicker;
