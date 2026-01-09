'use client';

import React from 'react';
import { Zap } from 'lucide-react';

const MESSAGES = [
    "🔥 Alex just scored 2048 in Classic Mode!",
    "⚡ New Item Drop: Cyberpunk Hoodie is selling fast!",
    "🏆 Sarah moved up to Gold Tier!",
    "👀 24 people are looking at Chess right now.",
    "🎉 Upcoming Event: 'Friday Night Gaming' starts in 4 hours."
];

export default function SocialPulseTicker() {
    return (
        <div className="bg-black text-white py-2 overflow-hidden border-y-2 border-[#2D3436] flex items-center gap-4">
            <div className="px-4 bg-[#FFD93D] text-black text-xs font-black uppercase tracking-widest -skew-x-12 ml-2">
                LIVE PULSE
            </div>

            <div className="flex whitespace-nowrap animate-marquee">
                {MESSAGES.map((msg, i) => (
                    <div key={i} className="flex items-center mx-8">
                        <Zap size={14} className="text-[#FFD93D] mr-2" />
                        <span className="text-sm font-bold tracking-wide">{msg}</span>
                    </div>
                ))}
                {/* Duplicate for smooth loop */}
                {MESSAGES.map((msg, i) => (
                    <div key={`dup-${i}`} className="flex items-center mx-8">
                        <Zap size={14} className="text-[#FFD93D] mr-2" />
                        <span className="text-sm font-bold tracking-wide">{msg}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
