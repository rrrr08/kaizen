'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

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
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center">
        <div className="text-amber-500 font-header tracking-[0.3em] animate-pulse">
          LOADING ABOUT...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex flex-col items-center justify-center gap-4">
        <div className="text-red-500 font-header tracking-widest text-center">
          {error}
        </div>
        <button 
          onClick={fetchAboutData}
          className="px-6 py-2 border border-amber-500 text-amber-500 hover:bg-amber-500/10 transition-all"
        >
          TRY AGAIN
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-16 bg-black text-white selection:bg-amber-500/30">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* SECTION 1 — PAGE HERO */}
        <section className="mb-32">
          <div className="text-amber-500 font-header text-[20px] tracking-[0.6em] mb-4 uppercase">Our Story</div>
          <h1 className="font-header text-5xl md:text-7xl lg:text-8xl tracking-tighter mb-8 leading-none">
            OUR <br /><span className="text-amber-400 ">(accidentally awesome)</span> STORY
          </h1>
          <p className="text-white/60 font-serif italic text-lg max-w-3xl">
            A digital playground built on the belief that games are more than products—they're moments, memories, and shared joy.
          </p>
          <div className="max-w-2xl border-l-2 border-amber-500 pl-8 py-2 mt-8">
            <p className="text-white/80 font-serif italic text-xl md:text-2xl leading-relaxed">
              Honestly? There's no dramatic lifelong passion story here.
              Just two people who realized they're pretty good at creating chaos, laughter, and the kind of competitive tension that turns friends into frenemies.
            </p>
          </div>
        </section>

        {/* SECTION 2 — HOW IT ALL STARTED (FOUNDERS' JOURNEY) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-32 items-center">
          <div className="lg:col-span-12">
            <h2 className="font-header text-[10px] tracking-[0.6em] text-amber-500 mb-8 uppercase">How It All Started</h2>
            <div className="space-y-8 max-w-4xl">
              <p className="text-white/70 font-serif text-lg leading-relaxed">
                Instead of sticking to the 'safe' family businesses (textiles and electricals — thrilling, right?), we decided to channel our inner entrepreneurs.
              </p>
              <p className="text-white/90 font-serif text-lg italic border-l border-white/20 pl-6">
                Spoiler: we didn't know what we were doing.
              </p>
              <p className="text-white/70 font-serif text-lg leading-relaxed">
                But we did know how to make people laugh. And argue. And then laugh again.
                <br />
                Now here we are — turning random ideas into something real, fun, and (fingers crossed) successful.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3 — WHY GAMES? (THE WHY) */}
        <section className="mb-32 py-24 border-y border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] rounded-full pointer-events-none"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-header text-5xl md:text-6xl mb-6">Why Games?</h2>
            </div>
            <div>
              <p className="text-white/80 font-serif italic text-xl leading-loose">
                Our goal? To make games that bring people together.
                <br />
                Because let's be honest — nothing bonds people like arguing over rules or laughing at someone's questionable strategy.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 4 — OUR MISSION & BELIEF */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
          <div className="bg-white/5 p-12 rounded-sm border border-white/5 hover:border-amber-500/20 transition-all group">
            <h3 className="font-header text-[10px] tracking-[0.6em] text-amber-500 mb-6 uppercase">Our Mission</h3>
            <p className="text-2xl md:text-3xl font-header leading-tight text-white/90 group-hover:text-amber-50 transition-colors">
              Spread the magic of tabletop games wherever we go and build a culture that's all about fun.
            </p>
          </div>

          <div className="bg-gradient-to-br from-amber-600/20 to-transparent p-12 rounded-sm border border-amber-500/10 flex flex-col justify-center">
            <h3 className="font-header text-[10px] tracking-[0.6em] text-amber-500 mb-6 uppercase">We Believe</h3>
            <p className="text-white/80 font-serif italic text-xl space-y-2 leading-relaxed">
              "Games aren't just products.<br />
              They're moments.<br />
              They're memories.<br />
              They're shared joy."
            </p>
          </div>
        </section>

        {/* SECTION 5 — OUR PHILOSOPHY */}
        <section className="mb-32">
          <h2 className="font-header text-4xl mb-16 text-center">Our Philosophy</h2>
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
              <div key={idx} className="text-center p-8">
                <div className="w-2 h-2 bg-amber-500 mx-auto mb-6 rounded-full"></div>
                <h3 className="font-header text-[12px] tracking-[0.3em] uppercase mb-4 text-amber-100">{item.title}</h3>
                <p className="text-white/60 font-serif italic">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6 — MEET THE MINDS BEHIND THE MADNESS */}
        <section className="mb-32">
          <h2 className="font-header text-4xl md:text-5xl mb-16 text-center">Meet the Minds <br /> Behind the Madness</h2>

          <div className="space-y-12 mb-12">
            <div>
              <h2 className="font-header text-[10px] tracking-[0.6em] text-amber-500 mb-6 uppercase">Founder's Journey</h2>
              <h3 className="font-header text-3xl md:text-4xl mb-6">Why Joy Juncture Started</h3>
              <div className="space-y-6 text-white/70 font-serif italic">
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
              <div className="aspect-[4/5] bg-neutral-900 border border-white/10 rounded-sm overflow-hidden mb-6 filter grayscale group-hover:grayscale-0 transition-all duration-700">
                {/* Placeholder for Founder Image - You can replace src with real images later */}
                <div className="w-full h-full bg-gradient-to-b from-neutral-800 to-black flex items-center justify-center">
                  <span className="text-white/20 font-header text-6xl">KP</span>
                </div>
              </div>
              <h3 className="font-header text-2xl mb-1">Khushi Poddar</h3>
              <p className="text-amber-500 text-[10px] tracking-[0.3em] uppercase mb-4">Dreamer-in-Chief</p>
              <p className="text-white/60 font-serif italic text-sm">Brings ideas to life, chaos included.</p>
            </div>

            {/* Founder 2 */}
            <div className="group relative">
              <div className="aspect-[4/5] bg-neutral-900 border border-white/10 rounded-sm overflow-hidden mb-6 filter grayscale group-hover:grayscale-0 transition-all duration-700">
                {/* Placeholder for Founder Image */}
                <div className="w-full h-full bg-gradient-to-b from-neutral-800 to-black flex items-center justify-center">
                  <span className="text-white/20 font-header text-6xl">MP</span>
                </div>
              </div>
              <h3 className="font-header text-2xl mb-1">Muskan Poddar</h3>
              <p className="text-amber-500 text-[10px] tracking-[0.3em] uppercase mb-4">Design Whiz</p>
              <p className="text-white/60 font-serif italic text-sm">Makes sure every card, board, and token looks as good as it feels.</p>
            </div>
          </div>
        </section>

        {/* SECTION 7 — WHY CHOOSE JOY JUNCTURE? */}
        <section className="text-center py-20 border-t border-white/10">
          <p className="font-header text-2xl md:text-4xl mb-12 text-white/90">
            "Because life is too short for boring evenings."
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/shop"
              className="px-8 py-4 bg-amber-500 text-black font-header text-[10px] tracking-[0.4em] hover:bg-amber-400 transition-all rounded-sm"
            >
              EXPLORE GAMES
            </Link>
            <Link
              href="/community"
              className="px-8 py-4 border border-amber-500 text-amber-500 font-header text-[10px] tracking-[0.4em] hover:bg-amber-500/10 transition-all rounded-sm"
            >
              JOIN THE FUN
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}