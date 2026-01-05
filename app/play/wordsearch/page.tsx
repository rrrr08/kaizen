import type { Metadata } from 'next';
import WordSearchGame from '@/components/games/WordSearchGame';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Play Word Search Online',
  description: 'Find hidden words in our free online word search puzzles. Multiple difficulty levels and themes available.',
  keywords: ['word search', 'word search puzzle', 'play word search online', 'free word search', 'word games'],
};
import { ArrowLeft } from 'lucide-react';

export default function WordSearchPage() {
  return (
    <div className="min-h-screen pt-32 pb-16 bg-[#FFFDF5] text-[#2D3436]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="max-w-4xl mx-auto mb-12">
          <Link href="/play" className="inline-flex items-center gap-2 font-black text-xs tracking-[0.2em] text-black/40 hover:text-black uppercase border-b-2 border-transparent hover:border-black transition-all pb-1 mb-8">
            <ArrowLeft size={16} /> BACK TO ARCADE
          </Link>
          <div className="text-center">
            <span className="inline-block px-3 py-1 bg-[#00B894] border-2 border-black rounded-lg text-black text-xs font-black uppercase tracking-wider mb-4 shadow-[2px_2px_0px_#000]">
              Word Puzzle
            </span>
            <h1 className="font-header text-6xl font-black text-black mb-4 uppercase tracking-tighter">Word Search</h1>
            <p className="text-black/60 font-medium text-lg max-w-lg mx-auto leading-relaxed">
              Find the hidden words in the grid.
            </p>
          </div>
        </div>
        <WordSearchGame />
      </div>
    </div>
  );
}
