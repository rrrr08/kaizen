import type { Metadata } from 'next';
import WheelOfJoy from '@/components/gamification/WheelOfJoy';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Daily Spin',
  description: 'Spin the Wheel of Joy daily for a chance to win rewards, coins, and exclusive prizes at Joy Juncture.',
  keywords: ['daily spin', 'wheel of fortune', 'daily rewards', 'spin to win', 'free rewards'],
};
import { Gift, Coins, RotateCw, ArrowLeft } from 'lucide-react';

import InfoCards from './InfoCards';

export default function DailySpinPage() {
  return (
    <div className="min-h-screen pt-32 pb-16 bg-[#FFFDF5] text-[#2D3436]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <Link href="/play" className="inline-flex items-center gap-2 font-black text-xs tracking-[0.2em] text-black/40 hover:text-black uppercase border-b-2 border-transparent hover:border-black transition-all pb-1 mb-8">
          <ArrowLeft size={16} /> BACK TO ARCADE
        </Link>
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 bg-[#6C5CE7] border-2 border-black rounded-lg text-white text-xs font-black uppercase tracking-wider mb-4 shadow-[2px_2px_0px_#000]">
            Bonus Rewards
          </span>
          <h1 className="font-header text-6xl md:text-8xl tracking-tighter mb-6 text-black">
            DAILY <span className="text-[#FFD93D] drop-shadow-[4px_4px_0px_#000]">SPIN</span>
          </h1>
          <p className="text-black/80 font-bold text-xl max-w-2xl mx-auto leading-relaxed">
            Spin the wheel once per day for FREE! Win bonus points and prizes.
          </p>
        </div>

        <div className="bg-white border-2 border-black p-12 rounded-[30px] neo-shadow mb-12">
          <WheelOfJoy />
        </div>

        {/* Info Section - Animated Cards */}
        <InfoCards />
      </div>
    </div>
  );
}
