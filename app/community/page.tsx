'use client';

import Link from 'next/link';
import { usePopup } from '@/app/context/PopupContext';
import CommunityThreadList from '@/app/components/community/ThreadList';
import ProofOfJoyGrid from '@/components/community/ProofOfJoyGrid';

export default function Community() {
  const { showAlert } = usePopup();







  return (
    <div className="min-h-screen pt-32 pb-16 bg-[#FFFDF5] text-[#2D3436] selection:bg-[#FFD93D]/50">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="mb-20 border-b-4 border-black pb-12">
          <div className="flex flex-col items-start">
            <div className="text-[#6C5CE7] font-black text-xs md:text-sm tracking-[0.3em] mb-6 uppercase font-display bg-white px-3 py-1 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000]">
              Community Hub
            </div>
            <h1 className="font-header tracking-tighter text-[#2D3436] flex flex-col items-start leading-none mb-8">
              <span className="text-3xl md:text-4xl font-black uppercase mb-1">PLAY, GATHER &</span>
              <span className="text-6xl md:text-9xl italic font-serif text-black drop-shadow-[4px_4px_0px_#FFD93D] relative z-10">
                BELONG
              </span>
            </h1>
            <p className="text-black/70 font-bold text-lg md:text-2xl max-w-3xl leading-relaxed">
              The heart of Joy Juncture. Join our digital tribe, share your stories, and earn rewards for simply having fun.
            </p>
          </div>
        </div>

        {/* --- DIGITAL COMMUNITY SECTION --- */}
        <section className="mb-32">
          <div className="w-full">
            <CommunityThreadList />
          </div>
        </section>

        {/* --- PROOF OF JOY SECTION --- */}
        <section className="mb-32">
          <ProofOfJoyGrid />
        </section>



      </div>
    </div>
  );
}
