'use client';

import { useAuth } from '@/app/context/AuthContext';
import { ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MarketHero() {
    const { user } = useAuth();
    const router = useRouter();

    return (
        <div className="relative overflow-hidden bg-white rounded-[32px] p-8 md:p-12 mb-12 shadow-sm border border-gray-100 group">

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="text-left space-y-6 max-w-xl">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#FFF0F0] text-[#FF7675] rounded-full">
                        <Tag size={14} />
                        <span className="text-xs font-bold tracking-[0.2em] uppercase">Just For You</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-light text-[#2D3436] tracking-tight leading-[1.1]">
                        Curated <br />
                        <span className="font-black italic text-[#2D3436]">Selections.</span>
                    </h1>

                    <p className="text-gray-500 text-lg leading-relaxed max-w-md">
                        Welcome back, {user?.displayName}. We've found some items that match your style.
                    </p>

                    <div className="flex gap-4 pt-2">
                        <button
                            onClick={() => router.push('/shop')}
                            className="px-8 py-4 bg-black text-white font-medium rounded-full hover:px-10 transition-all flex items-center gap-2"
                        >
                            Start Shopping <ArrowRight size={18} />
                        </button>
                    </div>
                </div>

                {/* Product Showcase */}
                <div className="relative w-80 h-96">
                    <div className="absolute inset-0 bg-[#F0F2F5] rounded-t-full rounded-b-[200px] transform scale-90 group-hover:scale-100 transition-transform duration-500" />
                    <div className="absolute inset-4 flex items-center justify-center">
                        {/* Placeholder for Product Image */}
                        <ShoppingBag size={64} className="text-gray-300" />
                    </div>
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur px-6 py-2 rounded-full shadow-lg whitespace-nowrap">
                        <span className="font-bold text-sm">Neon Hoodie</span>
                        <span className="mx-2 text-gray-300">|</span>
                        <span className="text-[#FF7675] font-bold">$49.99</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
