'use client';

import React, { useState, useEffect } from 'react';
import { Timer, Gift, Crosshair, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DailyDropCard() {
    const router = useRouter();
    const [timeLeft, setTimeLeft] = useState('');

    // Countdown Logic (Expires at Midnight)
    useEffect(() => {
        const tick = () => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setHours(24, 0, 0, 0);
            const diff = tomorrow.getTime() - now.getTime();

            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            setTimeLeft(`${h}h ${m}m`);
        };

        tick(); // Init
        const interval = setInterval(tick, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-white rounded-3xl p-6 border-2 border-black shadow-[4px_4px_0px_#000] h-full flex flex-col justify-between group hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] transition-all">

            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFD93D] rounded-full border border-black mb-2">
                        <Timer size={14} />
                        <span className="text-xs font-black tracking-widest uppercase">{timeLeft} LEFT</span>
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter italic">THE DAILY DROP</h2>
                </div>
                <Gift size={32} className="text-[#6C5CE7]" />
            </div>

            {/* Quest 1: Game */}
            <div className="space-y-4 mb-6">
                <div className="p-4 bg-[#F0F2F5] rounded-xl border border-black/10 flex items-center gap-4 cursor-pointer hover:bg-[#E2E8F0] transition-colors" onClick={() => router.push('/play/chess')}>
                    <div className="bg-[#FF7675] p-2 rounded-lg border border-black">
                        <Crosshair size={20} className="text-white" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-gray-500 uppercase">Daily Challenge</p>
                        <p className="font-bold text-[#2D3436]">Win 1 Chess Game</p>
                    </div>
                    <div className="ml-auto text-xs font-black text-[#00B894]">+500 XP</div>
                </div>

                {/* Quest 2: Product */}
                <div className="p-4 bg-[#F0F2F5] rounded-xl border border-black/10 flex items-center gap-4 cursor-pointer hover:bg-[#E2E8F0] transition-colors" onClick={() => router.push('/shop')}>
                    <div className="bg-[#00B894] p-2 rounded-lg border border-black">
                        <ShoppingBag size={20} className="text-white" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-gray-500 uppercase">Flash Deal</p>
                        <p className="font-bold text-[#2D3436]">20% Off Hoodies</p>
                    </div>
                    <div className="ml-auto text-xs font-black text-[#00B894]">CLAIM</div>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Complete all to unlock Streak Bonus</p>
            </div>
        </div>
    );
}
