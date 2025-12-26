"use client";

import React from 'react';
import Link from 'next/link';

const Home: React.FC = () => {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex flex-col items-center justify-center text-center p-6 bg-black overflow-hidden scanlines">
        {/* Main Branding */}
        <div className="mb-12 relative z-10">
          <h1 className="font-arcade text-7xl md:text-[12rem] leading-[0.85] tracking-tight">
            <span className="text-white text-3d-orange-deep block">JOY</span>
            <span className="flare-text block mt-4">JUNCTURE</span>
          </h1>
        </div>

        {/* Headline */}
        <div className="max-w-4xl px-4 mb-16 relative z-10">
          <p className="text-white font-[Inter] font-black text-2xl md:text-5xl leading-tight uppercase tracking-tight italic">
            JOIN THE COLLECTIVE. FUEL THE VIBE. WIN THE NIGHT.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col md:flex-row gap-8 relative z-10">
          <Link href="/shop" className="bg-[#FF8C00] text-black font-arcade text-2xl px-16 py-6 border-b-8 border-[#A0522D] active:border-b-0 active:translate-y-2 transition-all hover:bg-white inline-block">
            IGNITE NOW
          </Link>
          <Link href="/shop" className="bg-[#FFD400] text-black font-arcade text-2xl px-16 py-6 border-b-8 border-[#B8860B] active:border-b-0 active:translate-y-2 transition-all hover:bg-white inline-block">
            THE VAULT
          </Link>
        </div>

        {/* Floating background elements */}
        <div className="absolute top-20 left-10 w-32 h-32 border-4 border-[#FF8C00] opacity-10 animate-pulse rotate-12"></div>
        <div className="absolute bottom-40 right-10 w-48 h-48 border-4 border-[#FFD400] opacity-10 animate-bounce -rotate-12"></div>
      </section>

      {/* Live Ticker */}
      <div className="bg-[#FF8C00] py-4 overflow-hidden whitespace-nowrap border-y-4 border-black shadow-[0_0_20px_rgba(255,140,0,0.4)] relative z-20">
        <div className="animate-marquee inline-block font-arcade text-black text-lg space-x-20">
          <span>🔥 NEXT EVENT: STRATEGY SUMMIT IN 42H 12M</span>
          <span>🕹️ NEW DROP: NEON KNIGHTS EXPANSION PACK</span>
          <span>💎 1,240 PLAYERS ONLINE NOW</span>
          <span>🏆 LEADERBOARD RESET IN 2 DAYS</span>
          <span>🔥 NEXT EVENT: STRATEGY SUMMIT IN 42H 12M</span>
        </div>
      </div>

      {/* Play Styles Selection */}
      <section className="max-w-7xl mx-auto py-32 px-4">
        <div className="text-center mb-20">
          <h2 className="font-arcade text-5xl inline-block text-white text-3d-orange-deep relative uppercase">
            CHOOSE YOUR PLAY STYLE
            <div className="absolute -bottom-4 left-0 w-full h-1 bg-[#FF8C00]"></div>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {[
            { title: 'PLAY AT HOME', desc: 'Shop Board Games', icon: '🎲', link: '/shop', color: '#FF8C00', tag: 'SYSTEM.HOME', status: 'READY' },
            { title: 'PLAY TOGETHER', desc: 'Join Live Events', icon: '🎉', link: '/events', color: '#FFD400', tag: 'SYSTEM.ARENA', status: 'LIVE' },
            { title: 'PLAY FOR OCCASIONS', desc: 'Custom Experiences', icon: '✨', link: '/experiences', color: '#FFFFFF', tag: 'SYSTEM.CUSTOM', status: 'STANDBY' },
            { title: 'PLAY & BELONG', desc: 'Join the Community', icon: '👾', link: '/community', color: '#FF8C00', tag: 'SYSTEM.NODES', status: 'CONNECTED' }
          ].map((style, idx) => (
            <div key={idx} className="relative group">
              <div className="arcade-panel-header" style={{ backgroundColor: style.color }}>{style.tag}</div>
              <Link
                href={style.link}
                className="arcade-card-3d block h-[420px] p-8 relative overflow-hidden flex flex-col group-hover:border-opacity-100 pixel-grid"
              >
                {/* Corner Brackets */}
                <div className="corner-bracket top-4 left-4 border-t-2 border-l-2"></div>
                <div className="corner-bracket top-4 right-4 border-t-2 border-r-2"></div>
                <div className="corner-bracket bottom-4 left-4 border-b-2 border-l-2"></div>
                <div className="corner-bracket bottom-4 right-4 border-b-2 border-r-2"></div>

                <div className="flex justify-between items-start mb-6">
                  <span className="font-arcade text-[10px] tracking-tighter" style={{ color: style.color }}>v2.5_OS</span>
                  <div className="flex items-center gap-2">
                    <span className={`status-dot ${style.status === 'LIVE' ? 'active' : ''}`}></span>
                    <span className="font-arcade text-[8px] text-gray-500 uppercase">{style.status}</span>
                  </div>
                </div>

                <div className="flex-grow flex items-center justify-center">
                  <div className="text-8xl opacity-10 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-125 group-hover:rotate-12" style={{ color: style.color }}>
                    {style.icon}
                  </div>
                </div>

                <div className="z-10 mt-auto pt-6 border-t border-[#222] group-hover:border-[#FF8C00]">
                  <h3 className="font-arcade text-2xl mb-1 text-white transition-all uppercase tracking-tight" style={{ textShadow: `2px 2px 0px ${style.color}` }}>{style.title}</h3>
                  <p className="text-gray-500 font-bold group-hover:text-white uppercase tracking-tighter text-xs">{style.desc}</p>
                  <div className="mt-4 flex gap-1 h-1">
                    <div className="flex-grow bg-[#222] group-hover:bg-[#FF8C00] transition-colors"></div>
                    <div className="w-4 bg-[#222] group-hover:bg-[#FFD400] transition-colors"></div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Proof of Joy */}
      <section className="bg-[#050505] py-32 border-y-8 border-[#1A1A1A] relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-24">
            <div className="lg:w-1/2">
              <div className="arcade-panel-header bg-[#FFD400]">ARCHIVES.JOY</div>
              <h2 className="font-arcade text-6xl mb-8 text-white text-3d-orange-deep leading-[0.9]">MOMENTS OF<br />PURE CHAOS</h2>
              <p className="text-gray-400 text-xl mb-10 leading-relaxed font-medium">
                We don't just sell games. We create legends. From corporate takeovers to wedding showdowns,
                our events are where memories are forged in the heat of competition.
              </p>
              <button className="bg-white text-black font-arcade text-xl px-12 py-5 border-b-8 border-gray-400 active:border-b-0 active:translate-y-2 transition-all hover:bg-[#FF8C00]">
                VIEW THE GALLERY
              </button>
            </div>
            <div className="lg:w-1/2 grid grid-cols-2 gap-8 relative">
              <div className="space-y-8 pt-12">
                <div className="bg-white p-3 shadow-[8px_8px_0px_#FF8C00] rotate-[-4deg] hover:rotate-0 transition-transform">
                  <img src="https://picsum.photos/seed/joy1/400/500" className="grayscale hover:grayscale-0 transition-all" alt="Joy" />
                </div>
                <div className="bg-white p-3 shadow-[8px_8px_0px_#FFD400] rotate-[3deg] hover:rotate-0 transition-transform">
                  <img src="https://picsum.photos/seed/joy2/400/300" className="grayscale hover:grayscale-0 transition-all" alt="Joy" />
                </div>
              </div>
              <div className="space-y-8">
                <div className="bg-white p-3 shadow-[8px_8px_0px_#FFD400] rotate-[2deg] hover:rotate-0 transition-transform">
                  <img src="https://picsum.photos/seed/joy3/400/300" className="grayscale hover:grayscale-0 transition-all" alt="Joy" />
                </div>
                <div className="bg-white p-3 shadow-[8px_8px_0px_#FF8C00] rotate-[-2deg] hover:rotate-0 transition-transform">
                  <img src="https://picsum.photos/seed/joy4/400/500" className="grayscale hover:grayscale-0 transition-all" alt="Joy" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gamification Teaser */}
      <section className="py-32 bg-black overflow-hidden">
        <div className="max-w-5xl mx-auto text-center px-4 relative">
          <div className="inline-block p-3 bg-[#FF8C00] text-black font-arcade text-sm mb-10 shadow-[4px_4px_0px_white]">SYSTEM REWARDS: ACTIVE</div>
          <h2 className="font-arcade text-5xl md:text-8xl mb-12 text-white text-3d-orange-deep leading-none">EARN → PLAY → REDEEM</h2>

          <div className="grid grid-cols-3 md:grid-cols-5 items-center gap-4 mb-16">
            <div className="flex flex-col items-center group">
              <div className="w-24 h-24 arcade-card-3d rounded-full flex items-center justify-center mb-6 text-4xl group-hover:border-[#FF8C00]">🪙</div>
              <span className="font-arcade text-xs text-gray-500 uppercase tracking-widest">Tokens</span>
            </div>
            <div className="hidden md:block h-1 bg-gradient-to-r from-[#FF8C00] to-transparent"></div>
            <div className="flex flex-col items-center group">
              <div className="w-24 h-24 arcade-card-3d rounded-full flex items-center justify-center mb-6 text-4xl group-hover:border-[#FFD400]">🕹️</div>
              <span className="font-arcade text-xs text-gray-500 uppercase tracking-widest">Action</span>
            </div>
            <div className="hidden md:block h-1 bg-gradient-to-l from-white to-transparent"></div>
            <div className="flex flex-col items-center group">
              <div className="w-24 h-24 arcade-card-3d rounded-full flex items-center justify-center mb-6 text-4xl group-hover:border-white">💎</div>
              <span className="font-arcade text-xs text-gray-500 uppercase tracking-widest">Swag</span>
            </div>
          </div>

          <p className="text-gray-400 text-xl mb-12 italic max-w-2xl mx-auto">"Every move you make builds your legacy. Spend tokens in the vault for exclusive games and gear."</p>
          <Link href="/community" className="inline-block font-arcade text-2xl text-[#FF8C00] hover:text-white transition-all underline underline-offset-8 decoration-4 decoration-[#FFD400]">
            JOIN THE COLLECTIVE
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
