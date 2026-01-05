import type { Metadata } from 'next';
import SudokuGame from '@/components/games/SudokuGame';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Play Sudoku Online',
  description: 'Play free Sudoku puzzles online. Challenge your mind with different difficulty levels at Joy Juncture.',
  keywords: ['sudoku', 'play sudoku online', 'free sudoku', 'sudoku puzzles', 'brain games', 'number puzzles'],
};
import { ArrowLeft } from 'lucide-react';

export default function SudokuPage() {
    return (
        <div className="min-h-screen pt-32 pb-16 bg-[#FFFDF5] text-[#2D3436]">
            <div className="max-w-4xl mx-auto px-6">
                <Link href="/play" className="inline-flex items-center gap-2 font-black text-xs tracking-[0.2em] text-black/40 hover:text-black uppercase border-b-2 border-transparent hover:border-black transition-all pb-1 mb-8">
                    <ArrowLeft size={16} /> BACK TO ARCADE
                </Link>

                <div className="text-center mb-12">
                    <span className="inline-block px-3 py-1 bg-[#6C5CE7] border-2 border-black rounded-lg text-white text-xs font-black uppercase tracking-wider mb-4 shadow-[2px_2px_0px_#000]">
                        Logic Puzzle
                    </span>
                    <h1 className="font-header text-6xl font-black text-black mb-4 uppercase tracking-tighter">Sudoku</h1>
                    <p className="text-black/60 font-medium text-lg max-w-lg mx-auto leading-relaxed">
                        Complete the grid to earn 20 JP & XP. Challenge your brain.
                    </p>
                </div>

                <SudokuGame />
            </div>
        </div>
    );
}
