'use client';

import { useAuth } from '@/app/context/AuthContext';
import { Trophy, Play, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ArcadeHero() {
    const { user } = useAuth();
    const router = useRouter();

    return (
        <div className="relative overflow-hidden bg-[#2D3436] rounded-[32px] p-8 md:p-12 mb-12 shadow-[8px_8px_0px_#000] border-4 border-black group">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#6C5CE7] rounded-full blur-[100px] opacity-20 translate-x-1/2 -translate-y-1/2 group-hover:opacity-30 transition-opacity" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#FFD93D] rounded-full blur-[80px] opacity-10 -translate-x-1/2 translate-y-1/2" />

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="text-left space-y-4 max-w-xl">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#000] text-[#FFD93D] rounded-full border border-[#FFD93D]/30 shadow-[0_0_15px_rgba(255,217,61,0.3)]">
                        <Star size={14} className="fill-[#FFD93D]" />
                        <span className="text-xs font-black tracking-[0.2em] uppercase">Arcade Mode Active</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter leading-[0.9]">
                        LEVEL UP <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD93D] to-[#FF7675]">
                            YOUR GAME
                        </span>
                    </h1>

                    <p className="text-gray-400 font-medium text-lg leading-relaxed max-w-md">
                        Good to see you, {user?.displayName || 'Player'}. Your streak is waiting.
                    </p>

                    <div className="flex gap-4 pt-4">
                        <button
                            onClick={() => router.push('/play')}
                            className="px-8 py-4 bg-[#6C5CE7] text-white font-black uppercase tracking-wider rounded-xl border-2 border-black shadow-[4px_4px_0px_#000] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] transition-all flex items-center gap-2"
                        >
                            <Play size={20} className="fill-current" /> Play Now
                        </button>
                        <button
                            onClick={() => router.push('/profile')}
                            className="px-8 py-4 bg-[#2D3436] text-white font-black uppercase tracking-wider rounded-xl border-2 border-gray-600 hover:border-white transition-all flex items-center gap-2"
                        >
                            My Stats
                        </button>
                    </div>
                </div>

                {/* Dynamic Widget Area (e.g., Last Played) */}
                <div className="hidden md:block w-80 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 transform rotate-2 hover:rotate-0 transition-transform">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">In Progress</span>
                        <Trophy size={16} className="text-[#FFD93D]" />
                    </div>
                    <div className="aspect-video bg-gray-800 rounded-lg mb-4 flex items-center justify-center border border-white/5">
                        <span className="text-2xl font-black text-gray-600">CHESS</span>
                    </div>
                    <div className="w-full bg-gray-700 h-2 rounded-full mb-2">
                        <div className="bg-[#00B894] h-2 rounded-full w-[75%]" />
                    </div>
                    <div className="flex justify-between text-xs font-bold text-gray-400">
                        <span>Lvl 5</span>
                        <span>750/1000 XP</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
