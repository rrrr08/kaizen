import WheelOfJoy from '@/components/gamification/WheelOfJoy';
import Link from 'next/link';
import { Gift, Coins, RotateCw, ArrowLeft } from 'lucide-react';

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

        {/* Info Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#FFFDF5] border-2 border-black p-6 rounded-2xl text-center shadow-[4px_4px_0px_#000]">
            <div className="mb-3 flex justify-center text-black">
              <Gift size={40} />
            </div>
            <h3 className="font-black text-black mb-2 uppercase tracking-wide">Free Daily Spin</h3>
            <p className="text-black/70 text-sm font-bold">
              Get one free spin every 24 hours
            </p>
          </div>
          <div className="bg-[#FFFDF5] border-2 border-black p-6 rounded-2xl text-center shadow-[4px_4px_0px_#000]">
            <div className="mb-3 flex justify-center text-black">
              <Coins size={40} />
            </div>
            <h3 className="font-black text-black mb-2 uppercase tracking-wide">Win Big Prizes</h3>
            <p className="text-black/70 text-sm font-bold">
              Earn bonus points and special rewards
            </p>
          </div>
          <div className="bg-[#FFFDF5] border-2 border-black p-6 rounded-2xl text-center shadow-[4px_4px_0px_#000]">
            <div className="mb-3 flex justify-center text-black">
              <RotateCw size={40} />
            </div>
            <h3 className="font-black text-black mb-2 uppercase tracking-wide">Extra Spins</h3>
            <p className="text-black/70 text-sm font-bold">
              Use points to buy additional spins
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
