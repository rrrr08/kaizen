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
        <div className="mb-20 border-b-2 border-black pb-12">
          <div className="text-[#6C5CE7] font-black text-sm tracking-[0.2em] mb-4 uppercase font-display">Community Hub</div>
          <h1 className="font-header text-6xl md:text-8xl tracking-tighter mb-8 text-[#2D3436]">
            PLAY, GATHER & <br /><span className="text-[#FFD93D] drop-shadow-[2px_2px_0px_#000] italic font-serif">BELONG</span>
          </h1>
          <p className="text-black/70 font-bold text-xl max-w-3xl leading-relaxed">
            The heart of Joy Juncture. Join our digital tribe, share your stories, and earn rewards for simply having fun.
          </p>
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


        {/* Final CTA */}
        <div className="text-center py-16 border-t-2 border-black/10">
          <h2 className="font-header text-4xl md:text-5xl mb-6 text-black">Ready to Join?</h2>
          <p className="text-black/70 font-bold text-lg mb-8 max-w-2xl mx-auto">
            Create your account and start earning points, engaging with the community, and discovering endless joy.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/auth/signup"
              className="px-8 py-4 bg-black text-white font-black text-xs tracking-[0.4em] hover:bg-[#6C5CE7] hover:scale-105 transition-all rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,0.2)]"
            >
              CREATE ACCOUNT
            </Link>
            <Link
              href="/play"
              className="px-8 py-4 bg-[#FFD93D] text-black font-black text-xs tracking-[0.4em] border-2 border-black neo-shadow hover:scale-105 transition-all rounded-xl"
            >
              PLAY NOW
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
