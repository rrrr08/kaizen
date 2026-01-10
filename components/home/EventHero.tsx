'use client';

import { useAuth } from '@/app/context/AuthContext';
import { Calendar, Users, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EventHeroProps {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaTextJoin: string;
}

export default function EventHero({ title, subtitle, ctaText, ctaTextJoin }: EventHeroProps) {
    const { user } = useAuth();
    const router = useRouter();

    return (
        <div className="relative overflow-hidden bg-[#FFFDF5] rounded-[32px] p-8 md:p-12 mb-12 border-4 border-black text-black">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#6C5CE7]/5 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#FFD93D]/10 rounded-full blur-[80px] -translate-x-1/2 translate-y-1/2 pointer-events-none" />

            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
                {/* Left Content */}
                <div className="text-left space-y-8 max-w-xl flex-1">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#6C5CE7] text-white rounded-full border-2 border-black shadow-[4px_4px_0px_#000] rotate-[-2deg]">
                        <Users size={16} />
                        <span className="text-xs font-black tracking-[0.2em] uppercase">Level Up Your Social Life</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-header font-black tracking-tighter leading-[0.9]">
                        Games are <br />
                        Moments, <br />
                        Memories, <br />
                        and Shared Joy.
                    </h1>

                    <p className="text-black/70 font-medium text-lg max-w-md leading-relaxed">
                        {subtitle}
                    </p>

                    <div className="flex gap-4 pt-2">
                        <button
                            onClick={() => router.push('/shop')}
                            className="px-10 py-4 bg-[#FFD93D] text-black font-black uppercase tracking-wider rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000] hover:bg-[#FFEAA7] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] transition-all"
                        >
                            {ctaTextJoin}
                        </button>
                        <button
                            onClick={() => router.push('/events')}
                            className="px-10 py-4 bg-white text-black font-black uppercase tracking-wider rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000] hover:bg-gray-50 hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] transition-all"
                        >
                            {ctaText}
                        </button>
                    </div>
                </div>

                {/* Right Visuals */}
                <div className="relative w-full md:w-[500px] h-[400px] md:h-[500px] flex-shrink-0">
                    {/* Blob Image Mask */}
                    <div className="absolute inset-0 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] overflow-hidden border-4 border-black bg-gray-200 shadow-[8px_8px_0px_rgba(0,0,0,0.1)]">
                        <img
                            src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=1000"
                            alt="Friends playing games"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Floating Elements */}
                    <div className="absolute top-10 right-0 translate-x-1/2 bg-[#00B894] text-white p-4 rounded-full border-4 border-black shadow-[4px_4px_0px_#000] w-24 h-24 flex flex-col items-center justify-center text-center rotate-12 z-20">
                        <span className="font-black text-xl leading-none">10K+</span>
                        <span className="text-[8px] font-bold uppercase leading-tight">Happy Gamers</span>
                    </div>

                    <div className="absolute bottom-0 left-10 -translate-x-1/2 bg-[#FFD93D] p-6 rounded-[2rem] border-4 border-black shadow-[8px_8px_0px_#000] rotate-[-12deg] z-20">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="w-3 h-3 bg-black rounded-full" />
                            <div className="w-3 h-3 bg-transparent rounded-full" />
                            <div className="w-3 h-3 bg-transparent rounded-full" />
                            <div className="w-3 h-3 bg-black rounded-full" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
