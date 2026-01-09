'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface GameRowProps {
    title: string;
    items: any[]; // Replace with proper Game type
    viewAllLink?: string;
}

export default function GameRow({ title, items, viewAllLink = '/play' }: GameRowProps) {
    return (
        <div className="mb-12">
            <div className="flex justify-between items-end mb-6 px-4 md:px-0">
                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic text-[#2D3436]">
                    {title}
                </h3>
                <Link href={viewAllLink} className="text-sm font-bold border-b-2 border-black hover:text-[#6C5CE7] hover:border-[#6C5CE7] transition-colors flex items-center gap-1">
                    VIEW ALL <ArrowRight size={14} />
                </Link>
            </div>

            <div className="flex overflow-x-auto pb-8 gap-6 px-4 md:px-0 scrollbar-hide snap-x">
                {items.map((item, idx) => (
                    <div key={idx} className="flex-none w-[280px] bg-white rounded-2xl border-2 border-black p-4 shadow-[4px_4px_0px_#000] hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_#000] transition-all cursor-pointer snap-center group">
                        <div className="aspect-[4/3] bg-gray-200 rounded-xl mb-4 overflow-hidden border border-black">
                            {/* Placeholder Image Logic */}
                            <div className={`w-full h-full ${item.color || 'bg-blue-400'}`} />
                        </div>
                        <h4 className="font-black text-xl uppercase leading-none mb-1">{item.title}</h4>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{item.category}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
