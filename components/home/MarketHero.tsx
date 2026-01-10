'use client';

import { useAuth } from '@/app/context/AuthContext';
import { ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface MarketHeroProps {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaTextJoin: string;
}

export default function MarketHero({ title, subtitle, ctaText, ctaTextJoin }: MarketHeroProps) {
    const { user } = useAuth();
    const router = useRouter();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden bg-white rounded-[32px] p-8 md:p-12 mb-12 border-2 border-black shadow-[8px_8px_0px_#000] group"
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-dot-pattern z-0" />

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="text-left space-y-6 max-w-xl">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#FFF0F0] text-[#FF7675] border-2 border-[#FF7675] rounded-full shadow-[4px_4px_0px_#FF7675]"
                    >
                        <Tag size={14} className="fill-current" />
                        <span className="text-xs font-black tracking-[0.2em] uppercase">Just For You</span>
                    </motion.div>

                    <h1 className="text-6xl md:text-8xl font-black text-[#2D3436] tracking-tighter leading-[0.85] uppercase italic mb-2">
                        {title}
                    </h1>

                    <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF7675] to-[#fab1a0] tracking-tighter leading-none uppercase italic stroke-black decoration-4">
                        {subtitle}
                    </h2>

                    <div className="flex gap-4 pt-4">
                        <button
                            onClick={() => router.push('/shop')}
                            className="px-8 py-4 bg-black text-[#FFD93D] font-black uppercase tracking-wider rounded-xl border-2 border-black shadow-[4px_4px_0px_#FFD93D] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#FFD93D] active:translate-y-[0px] active:shadow-[0px_0px_0px_#FFD93D] transition-all flex items-center gap-2"
                        >
                            {ctaText} <ArrowRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Product Showcase */}
                <div className="relative w-80 h-96 perspective-1000">
                    <motion.div
                        whileHover={{ rotateY: 10, rotateX: 5 }}
                        className="relative w-full h-full bg-[#FFEAA7] rounded-3xl border-4 border-black shadow-[8px_8px_0px_#000] flex items-center justify-center overflow-hidden"
                    >
                        {/* Decorative Elements */}
                        <div className="absolute top-4 left-4 w-4 h-4 rounded-full bg-white border-2 border-black" />
                        <div className="absolute top-4 right-4 w-4 h-4 rounded-full bg-white border-2 border-black" />

                        <ShoppingBag size={80} className="text-black/20" />

                        {/* Floating Price Tag */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.4, type: "spring" }}
                            className="absolute bottom-8 -right-4 bg-white px-6 py-3 rounded-xl border-2 border-black shadow-[4px_4px_0px_#000] rotate-[-5deg]"
                        >
                            <span className="font-black text-xl text-[#FF7675]">$49.99</span>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
