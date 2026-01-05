import type { Metadata } from 'next';
import HangmanGame from '@/components/games/HangmanGame';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Play Hangman Online',
  description: 'Play the classic Hangman word guessing game online for free. Guess the word before running out of chances at Joy Juncture.',
  keywords: ['hangman game', 'word guessing game', 'play hangman online', 'free word games', 'educational games'],
};
import { ArrowLeft } from 'lucide-react';

export default function HangmanPage() {
    return (
        <div className="min-h-screen pt-32 pb-16 bg-[#FFFDF5] text-[#2D3436]">
            <div className="max-w-4xl mx-auto px-6">
                <Link href="/play" className="inline-flex items-center gap-2 font-black text-xs tracking-[0.2em] text-black/40 hover:text-black uppercase border-b-2 border-transparent hover:border-black transition-all pb-1 mb-8">
                    <ArrowLeft size={16} /> BACK TO ARCADE
                </Link>

                <div className="text-center mb-12">
                    <span className="inline-block px-3 py-1 bg-[#E17055] border-2 border-black rounded-lg text-black text-xs font-black uppercase tracking-wider mb-4 shadow-[2px_2px_0px_#000]">
                        Classic
                    </span>
                    <h1 className="font-header text-6xl font-black text-black mb-4 uppercase tracking-tighter">Hangman</h1>
                    <p className="text-black/60 font-medium text-lg max-w-lg mx-auto leading-relaxed">
                        Guess the word or phrase before the stickman is drawn.
                    </p>
                </div>

                <HangmanGame />
            </div>
        </div>
    );
}
