'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SectionHeadingProps {
    number: string;
    title: string;
    description: string;
    light?: boolean;
}

const SectionHeading: React.FC<SectionHeadingProps> = ({ number, title, description, light = false }) => {
    return (
        <div className="flex flex-col mb-16 space-y-6">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-6"
            >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black border-4 shadow-[4px_4px_0px_#000] ${light ? 'bg-white text-black border-white' : 'bg-[#FFD93D] text-black border-black'}`}>
                    {number}
                </div>
                <div className="flex flex-col">
                    <span className={`text-xs font-black uppercase tracking-[0.3em] ${light ? 'text-white/40' : 'text-black/30'}`}>
                        Discovery Phase
                    </span>
                    <h2 className={`text-5xl lg:text-7xl font-black tracking-tighter uppercase leading-[0.85] ${light ? 'text-white' : 'text-black'}`}>
                        {title}
                    </h2>
                </div>
            </motion.div>
            <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className={`text-xl lg:text-3xl font-bold max-w-3xl leading-tight ${light ? 'text-white/60' : 'text-black/50'}`}
            >
                {description}
            </motion.p>
        </div>
    );
};

export default SectionHeading;
