'use client';

import React from 'react';
import { Zap } from 'lucide-react';

export default function SocialPulseTicker() {
    const [messages, setMessages] = React.useState<string[]>([
        "🔥 Welcome to Joy Juncture! Play, Shop, & Connect.",
        "🎲 Daily Chess Challenge is live! Win 500 XP.",
        "✨ New arrivals in the shop just dropped!"
    ]);

    React.useEffect(() => {
        async function fetchPulse() {
            try {
                const res = await fetch('/api/social-pulse', { next: { revalidate: 60 } }); // Cache for 60s
                if (res.ok) {
                    const data = await res.json();
                    if (data.messages && data.messages.length > 0) {
                        setMessages(data.messages);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch social pulse:", error);
            }
        }
        fetchPulse();
    }, []);

    return (
        <div className="bg-black text-white py-2 overflow-hidden border-y-2 border-[#2D3436] flex items-center gap-4 relative z-0">
            <div className="px-4 bg-[#FFD93D] text-black text-xs font-black uppercase tracking-widest -skew-x-12 ml-2 flex-shrink-0 relative z-20 shadow-[2px_0_10px_rgba(0,0,0,0.5)]">
                LIVE PULSE
            </div>

            <div className="flex whitespace-nowrap animate-marquee">
                {messages.map((msg, i) => (
                    <div key={i} className="flex items-center mx-8">
                        <Zap size={14} className="text-[#FFD93D] mr-2" />
                        <span className="text-sm font-bold tracking-wide">{msg}</span>
                    </div>
                ))}
                {/* Duplicate for smooth loop */}
                {messages.map((msg, i) => (
                    <div key={`dup-${i}`} className="flex items-center mx-8">
                        <Zap size={14} className="text-[#FFD93D] mr-2" />
                        <span className="text-sm font-bold tracking-wide">{msg}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
