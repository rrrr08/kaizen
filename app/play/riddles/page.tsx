import RiddleGame from '@/components/games/RiddleGame';
import Link from 'next/link';

export default function RiddlesPage() {
    return (
        <div className="min-h-screen pt-28 pb-16 bg-black text-white">
            <div className="max-w-4xl mx-auto px-6">
                <Link href="/play" className="text-xs font-header tracking-widest text-white/40 hover:text-amber-500 mb-8 inline-block">
                    ← BACK TO ARCADE
                </Link>

                <div className="text-center mb-12">
                    <h1 className="font-display text-4xl mb-4">Daily Riddle</h1>
                    <p className="text-white/60 font-serif italic">Crack the code to earn rewards.</p>
                </div>

                <RiddleGame />
            </div>
        </div>
    );
}
