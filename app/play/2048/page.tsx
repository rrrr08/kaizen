import Game2048 from '@/components/games/Game2048';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function Game2048Page() {
    return (
        <div className="min-h-screen pt-32 pb-16 bg-[#FFFDF5] text-[#2D3436]">
            <div className="max-w-4xl mx-auto px-6">
                <Link href="/play" className="inline-flex items-center gap-2 font-black text-xs tracking-[0.2em] text-black/40 hover:text-black uppercase border-b-2 border-transparent hover:border-black transition-all pb-1 mb-8">
                    <ArrowLeft size={16} /> BACK TO ARCADE
                </Link>

                <div className="text-center mb-12">
                    <h1 className="font-header text-6xl font-black text-black mb-4 uppercase tracking-tighter">2048</h1>
                    <p className="text-black/60 font-medium text-lg max-w-lg mx-auto leading-relaxed">Combine tiles to reach the ultimate number. Strategy meets addiction.</p>
                </div>

                <Game2048 />
            </div>
        </div>
    );
}
