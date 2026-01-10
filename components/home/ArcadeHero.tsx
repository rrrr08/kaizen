'use client';

import { useAuth } from '@/app/context/AuthContext';
import { Trophy, Play, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface ArcadeHeroProps {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaTextJoin: string;
}

export default function ArcadeHero({
    title,
    subtitle,
    ctaText,
    ctaTextJoin
}: ArcadeHeroProps) {
    const { user } = useAuth();
    const router = useRouter();

    // Robust fallbacks for empty strings
    const safeTitle = title || "LEVEL UP";
    const safeSubtitle = subtitle || "YOUR GAME";
    const safeCtaText = ctaText || "My Stats";
    const safeCtaTextJoin = ctaTextJoin || "Play Now";

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden bg-black rounded-[32px] p-8 md:p-12 mb-12 shadow-[8px_8px_0px_#FFD93D] border-4 border-[#FFD93D] group"
        >
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#6C5CE7] rounded-full blur-[100px] opacity-20 translate-x-1/2 -translate-y-1/2 group-hover:opacity-30 transition-opacity" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#FFD93D] rounded-full blur-[80px] opacity-10 -translate-x-1/2 translate-y-1/2" />

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="text-left space-y-6 max-w-xl">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#000] text-[#FFD93D] rounded-full border border-[#FFD93D]/30 shadow-[0_0_15px_rgba(255,217,61,0.3)]"
                    >
                        <Star size={14} className="fill-[#FFD93D]" />
                        <span className="text-xs font-black tracking-[0.2em] uppercase">Arcade Mode Active</span>
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter leading-[0.9]">
                        {safeTitle} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD93D] to-[#FF7675]">
                            {safeSubtitle}
                        </span>
                    </h1>

                    <p className="text-gray-400 font-medium text-lg leading-relaxed max-w-md">
                        Good to see you, {user?.displayName || 'Player'}. Your streak is waiting.
                    </p>

                    <div className="flex gap-4 pt-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.push('/play')}
                            className="px-8 py-4 bg-[#6C5CE7] text-white font-black uppercase tracking-wider rounded-xl border-2 border-black shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] transition-all flex items-center gap-2"
                        >
                            <Play size={20} className="fill-current" /> {safeCtaTextJoin}
                        </motion.button>
                        <button
                            onClick={() => router.push('/profile')}
                            className="px-8 py-4 bg-[#FFD93D] text-black font-black uppercase tracking-wider rounded-xl border-2 border-black hover:bg-[#FFEAA7] transition-all flex items-center gap-2 shadow-[4px_4px_0px_#000]"
                        >
                            {safeCtaText}
                        </button>
                    </div>
                </div>

                {/* Dynamic Widget Area (e.g., Last Played) */}
                <motion.div
                    initial={{ opacity: 0, width: "380px", x: 20, rotate: 2 }}
                    animate={{ opacity: 1, x: 0, rotate: 2 }}
                    whileHover={{ rotate: 0, scale: 1.02 }}
                    className="hidden md:block w-80 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-2xl"
                >
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">In Progress</span>
                        <Trophy size={16} className="text-[#FFD93D]" />
                    </div>
                    <div className="aspect-video bg-gray-800 rounded-lg mb-4 flex items-center justify-center border border-white/5 relative overflow-hidden group-hover:border-[#FFD93D]/50 transition-colors">
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/50" />
                        <span className="text-2xl font-black text-gray-600 z-10 group-hover:text-[#FFD93D] transition-colors">CHESS</span>
                    </div>
                    <div className="w-full bg-gray-700 h-2 rounded-full mb-2 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "75%" }}
                            transition={{ delay: 0.5, duration: 1 }}
                            className="bg-[#00B894] h-2 rounded-full"
                        />
                    </div>
                    <div className="flex justify-between text-xs font-bold text-gray-400">
                        <span>Lvl 5</span>
                        <span>750/1000 XP</span>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}

