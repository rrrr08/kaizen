'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function About() {
  const [aboutData, setAboutData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/about');

      if (!response.ok) {
        throw new Error(`Failed to fetch about data: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setAboutData(data.data);
      } else {
        setError(data.error || 'Failed to load about data');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load about data');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="inline-block animate-pulse font-arcade text-[#FF8C00] tracking-[0.4em]">LOADING_STORY_DATA...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex flex-col items-center justify-center gap-4 bg-black">
        <div className="text-red-500 font-arcade tracking-widest text-center uppercase">
          ERROR: {error}
        </div>
        <button
          onClick={fetchAboutData}
          className="px-6 py-2 border border-[#FF8C00] text-[#FF8C00] hover:bg-[#FF8C00] hover:text-black transition-all font-arcade text-xs tracking-widest uppercase"
        >
          RETRY_CONNECTION
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-16 bg-black text-white selection:bg-[#FF8C00]/50 font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 pixel-grid opacity-20 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00B894]/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* SECTION 1 — PAGE HERO */}
        <section className="mb-32">
          <div className="text-[#FF8C00] font-arcade text-xs tracking-[0.2em] mb-4 uppercase inline-block border border-[#FF8C00] px-3 py-1">Mission Log // 001</div>
          <h1 className="font-arcade text-6xl md:text-8xl tracking-tighter mb-8 leading-none text-white text-3d-orange">
            OUR <br /><span className="text-[#00B894] italic font-serif">ORIGIN STORY</span>
          </h1>
          <p className="text-gray-400 font-bold text-xl max-w-3xl leading-relaxed font-sans">
            A digital playground built on the belief that games are more than products—they're moments, memories, and shared joy.
          </p>
          <div className="max-w-2xl border-l-4 border-[#FF8C00] pl-8 py-2 mt-8">
            <p className="text-gray-300 font-medium italic text-xl md:text-2xl leading-relaxed font-sans">
              Honestly? There's no dramatic lifelong passion story here.
              Just two agents who realized they're pretty good at creating chaos, laughter, and the kind of competitive tension that turns friends into frenemies.
            </p>
          </div>
        </section>

        {/* SECTION 2 — HOW IT ALL STARTED (FOUNDERS' JOURNEY) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-32 items-center">
          <div className="lg:col-span-12">
            <h2 className="font-arcade text-sm tracking-[0.2em] text-[#00B894] mb-8 uppercase">Introduction_Sequence</h2>
            <div className="space-y-8 max-w-4xl">
              <p className="text-gray-400 font-medium text-lg leading-relaxed font-sans">
                Instead of sticking to the 'safe' family businesses (textiles and electricals — thrilling, right?), we decided to channel our inner entrepreneurs.
              </p>
              <p className="text-[#FF8C00] font-arcade text-lg italic border-l-4 border-[#FF8C00] pl-6 py-2 bg-[#FF8C00]/10 rounded-r-lg">
                SPOILER: WE_DID_NOT_HAVE_CLEARANCE.
              </p>
              <p className="text-gray-400 font-medium text-lg leading-relaxed font-sans">
                But we did know how to make people laugh. And argue. And then laugh again.
                <br />
                Now here we are — turning random ideas into something real, fun, and (fingers crossed) successful.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3 — WHY GAMES? (THE WHY) */}
        <section className="mb-32 py-24 border-y border-[#333] relative overflow-hidden bg-[#111]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF8C00]/20 blur-[100px] rounded-full pointer-events-none"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center relative z-10">
            <div>
              <h2 className="font-arcade text-5xl md:text-6xl mb-6 text-white text-3d-purple">WHY GAMES?</h2>
            </div>
            <div>
              <p className="text-gray-300 font-bold italic text-2xl leading-loose font-sans">
                Our goal? To make games that bring people together.
                <br />
                <span className="text-[#00B894]">Because let's be honest — nothing bonds people like arguing over rules or laughing at someone's questionable strategy.</span>
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 4 — OUR MISSION & BELIEF */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
          <div className="bg-[#111] p-12 arcade-card-3d border border-[#333] hover:scale-[1.02] transition-transform group">
            <h3 className="font-arcade text-sm tracking-[0.2em] text-[#FFD400] mb-6 uppercase">Mission_Protocol</h3>
            <p className="text-2xl md:text-3xl font-sans leading-tight text-white group-hover:text-[#FFD400] transition-colors">
              Spread the magic of tabletop games wherever we go and build a culture that's all about fun.
            </p>
          </div>

          <div className="bg-[#FF8C00] p-12 arcade-card-3d border border-[#FF8C00] flex flex-col justify-center shadow-[0_0_20px_rgba(255,140,0,0.5)]">
            <h3 className="font-arcade text-black font-black text-sm tracking-[0.2em] mb-6 uppercase">Core_Belief_System</h3>
            <p className="text-black font-black italic text-2xl space-y-2 leading-relaxed font-sans">
              "Games aren't just products.<br />
              They're moments.<br />
              They're memories.<br />
              They're shared joy."
            </p>
          </div>
        </section>

        {/* SECTION 5 — OUR PHILOSOPHY */}
        <section className="mb-32">
          <h2 className="font-arcade text-4xl mb-16 text-center text-white uppercase text-3d-green">Our Philosophy</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Connection over competition',
                text: 'Our games are designed to bring people closer, no matter the outcome.'
              },
              {
                title: 'Quality and creativity',
                text: 'Every card, board, and mechanic is crafted with care (and a bit of obsession).'
              },
              {
                title: 'Fun for all',
                text: "Whether you're 10 or 100, there's a Joy Juncture game for you."
              }
            ].map((item, idx) => (
              <div key={idx} className="text-center p-8 border border-[#333] hover:border-[#00B894] hover:bg-[#111] hover:shadow-[0_0_15px_rgba(0,184,148,0.3)] transition-all duration-300 bg-black">
                <div className="w-4 h-4 bg-[#00B894] mx-auto mb-6 rounded-none rotate-45 shadow-[0_0_10px_#00B894]"></div>
                <h3 className="font-arcade text-sm tracking-[0.2em] uppercase mb-4 text-[#00B894]">{item.title}</h3>
                <p className="text-gray-400 font-medium italic font-sans">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6 — MEET THE MINDS BEHIND THE MADNESS */}
        <section className="mb-32">
          <h2 className="font-arcade text-4xl md:text-5xl mb-16 text-center text-white text-3d-purple uppercase">Architects of<br /> The Simulation</h2>

          <div className="space-y-12 mb-12">
            <div>
              <h2 className="font-arcade text-sm tracking-[0.2em] text-[#6C5CE7] mb-6 uppercase">Founder's Journey</h2>
              <h3 className="font-arcade text-3xl md:text-4xl mb-6 text-white uppercase">Why Joy Juncture Started</h3>
              <div className="space-y-6 text-gray-300 font-medium leading-relaxed max-w-4xl font-sans">
                <p>
                  Joy Juncture was born from a simple observation: in a world obsessed with digital isolation, people crave real connections and shared moments of joy. Games, in their purest form, are vehicles for these moments.
                </p>
                <p>
                  The founder spent years observing how a single board game could transform a room full of strangers into a community of friends. That magic inspired the creation of Joy Juncture—a platform that celebrates games not as products, but as catalysts for belonging.
                </p>
                <p>
                  Today, Joy Juncture is more than an e-commerce platform. It's a movement. A celebration of playfulness. A testament to the power of gathering, laughing, competing, and most importantly, connecting.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* Founder 1 */}
            <div className="group relative">
              <div className="aspect-[4/5] bg-[#111] border border-[#333] overflow-hidden mb-6 arcade-card-3d group-hover:scale-[1.02] transition-transform duration-300">
                {/* Placeholder for Founder Image */}
                <div className="w-full h-full bg-[#FF8C00] flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:16px_16px]"></div>
                  <span className="text-black font-arcade text-8xl opacity-20">KP</span>
                </div>
              </div>
              <h3 className="font-arcade text-3xl mb-1 text-white uppercase">Khushi Poddar</h3>
              <p className="text-[#FF8C00] font-arcade text-xs tracking-[0.3em] uppercase mb-4 bg-[#FF8C00]/10 inline-block px-2 py-1 border border-[#FF8C00]/30">Dreamer-in-Chief</p>
              <p className="text-gray-400 font-bold text-sm font-sans">Brings ideas to life, chaos included.</p>
            </div>

            {/* Founder 2 */}
            <div className="group relative">
              <div className="aspect-[4/5] bg-[#111] border border-[#333] overflow-hidden mb-6 arcade-card-3d group-hover:scale-[1.02] transition-transform duration-300">
                {/* Placeholder for Founder Image */}
                <div className="w-full h-full bg-[#00B894] flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:16px_16px]"></div>
                  <span className="text-black font-arcade text-8xl opacity-20">MP</span>
                </div>
              </div>
              <h3 className="font-arcade text-3xl mb-1 text-white uppercase">Muskan Poddar</h3>
              <p className="text-[#00B894] font-arcade text-xs tracking-[0.3em] uppercase mb-4 bg-[#00B894]/10 inline-block px-2 py-1 border border-[#00B894]/30">Design Whiz</p>
              <p className="text-gray-400 font-bold text-sm font-sans">Makes sure every card, board, and token looks as good as it feels.</p>
            </div>
          </div>
        </section>

        {/* SECTION 7 — WHY CHOOSE JOY JUNCTURE? */}
        <section className="text-center py-20 border-t border-[#333]">
          <p className="font-arcade text-3xl md:text-5xl mb-12 text-white leading-tight uppercase text-3d-orange">
            "Because life is too short for boring evenings."
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/shop"
              className="px-8 py-4 bg-[#FF8C00] text-black font-arcade text-xs tracking-[0.4em] hover:bg-white transition-all border-b-4 border-[#A0522D] active:border-b-0 active:translate-y-1 uppercase"
            >
              EXPLORE_GAMES
            </Link>
            <Link
              href="/community"
              className="px-8 py-4 bg-transparent text-[#FF8C00] border border-[#FF8C00] font-arcade text-xs tracking-[0.4em] hover:bg-[#FF8C00] hover:text-black transition-all uppercase"
            >
              JOIN_THE_FUN
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
