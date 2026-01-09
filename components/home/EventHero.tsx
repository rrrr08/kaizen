'use client';

import { useAuth } from '@/app/context/AuthContext';
import { Calendar, Users, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function EventHero() {
    const { user } = useAuth();
    const router = useRouter();

    return (
        <div className="relative overflow-hidden bg-[#6C5CE7] rounded-[32px] p-8 md:p-12 mb-12 shadow-[8px_8px_0px_#000] border-4 border-black text-white">
            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 2px, transparent 2px)', backgroundSize: '30px 30px' }} />

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="text-left space-y-6 max-w-xl">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white text-black rounded-lg border-2 border-black shadow-[4px_4px_0px_#000]">
                        <Users size={14} />
                        <span className="text-xs font-black tracking-[0.2em] uppercase">Community Pulse</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none transform -rotate-1">
                        WHAT'S <br />
                        <span className="text-[#FFD93D] text-stroke-black">HAPPENING</span>
                    </h1>

                    <p className="text-white/80 font-bold text-lg max-w-md">
                        Yo {user?.displayName}! There are 3 meetups happening near you this week.
                    </p>

                    <button
                        onClick={() => router.push('/events')}
                        className="px-8 py-4 bg-[#FFD93D] text-black font-black uppercase tracking-wider rounded-xl border-2 border-black shadow-[4px_4px_0px_#000] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] transition-all flex items-center gap-2"
                    >
                        Find Events <Calendar size={20} />
                    </button>
                </div>

                {/* Ticket Stub Visual */}
                <div className="w-80 bg-[#FFFDF5] text-black p-6 rounded-xl border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,0.5)] rotate-3 group-hover:rotate-6 transition-transform">
                    <div className="border-b-2 border-dashed border-black pb-4 mb-4 flex justify-between items-end">
                        <div>
                            <span className="block text-xs font-black text-gray-400 uppercase">Next Up</span>
                            <span className="text-2xl font-black uppercase">Gaming Night</span>
                        </div>
                        <div className="text-right">
                            <span className="block text-3xl font-black text-[#6C5CE7]">12</span>
                            <span className="text-xs font-bold uppercase">Jan</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 font-bold text-sm">
                            <MapPin size={16} className="text-[#FF7675]" /> Central Hub
                        </div>
                        <div className="flex items-center gap-2 font-bold text-sm">
                            <Users size={16} className="text-[#00B894]" /> 24 Going
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
