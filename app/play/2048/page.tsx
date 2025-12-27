import Game2048 from '@/components/games/Game2048';
import Link from 'next/link';

export default function Game2048Page() {
    return (
        <div className="min-h-screen pt-28 pb-16 bg-black text-white">
            <div className="max-w-4xl mx-auto px-6">
                <Link href="/play" className="text-xs font-header tracking-widest text-white/40 hover:text-amber-500 mb-8 inline-block">
                    ← BACK TO ARCADE
                </Link>

                <div className="text-center mb-12">
                    <h1 className="font-display text-4xl mb-4">2048</h1>
                    <p className="text-white/60 font-serif italic">Combine tiles to reach 2048</p>
                </div>

                <Game2048 />
            </div>
        </div>
    );
}
