'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll } from 'framer-motion';

import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const DEFAULT_FOUNDERS = [
  {
    name: 'Khushi Poddar',
    role: 'Dreamer-in-Chief',
    description: 'Brings ideas to life, chaos included.',
    image: null // Fallback handled in render
  },
  {
    name: 'Muskan Poddar',
    role: 'Design Whiz',
    description: 'Makes sure every card, board, and token looks as good as it feels.',
    image: null
  }
];

interface Founder {
  name: string;
  role: string;
  description: string;
  image: string | null;
}

export default function About() {
  const [founders, setFounders] = useState<Founder[]>(DEFAULT_FOUNDERS);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.8", "end 0.8"]
  });

  useEffect(() => {
    async function fetchContent() {
      try {
        const docRef = doc(db, 'content', 'about');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().founders) {
          setFounders(docSnap.data().founders);
        }
      } catch (error) {
        console.error('Error fetching about content:', error);
      }
    }
    fetchContent();
  }, []);

  return (
    <div className="min-h-screen pt-32 pb-16 bg-[#FFFDF5] text-[#2D3436] selection:bg-[#FFD93D]/50 font-sans">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* SECTION 1 — PAGE HERO */}
        <section className="mb-32">
          <div className="text-[#6C5CE7] font-black text-sm tracking-[0.2em] mb-4 uppercase font-header">Our Story</div>
          <h1 className="font-header text-4xl md:text-8xl tracking-tighter mb-8 leading-none text-black">
            OUR <br /><span className="text-[#FFD93D] drop-shadow-[2px_2px_0px_#000] italic font-serif">(accidentally awesome)</span> STORY
          </h1>
          <p className="text-black/80 font-bold text-xl max-w-3xl leading-relaxed">
            A digital playground built on the belief that games are more than products—they&apos;re moments, memories, and shared joy.
          </p>
          <div className="max-w-2xl border-l-4 border-black pl-8 py-2 mt-8">
            <p className="text-black/70 font-medium italic text-xl md:text-2xl leading-relaxed">
              Honestly? There&apos;s no dramatic lifelong passion story here.
              Just two people who realized they&apos;re pretty good at creating chaos, laughter, and the kind of competitive tension that turns friends into frenemies.
            </p>
          </div>
        </section>

        {/* SECTION 2 — HOW IT ALL STARTED (FOUNDERS' JOURNEY) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-32 items-center">
          <div className="lg:col-span-12">
            <h2 className="font-black text-sm tracking-[0.2em] text-[#00B894] mb-8 uppercase font-header">How It All Started</h2>
            <div className="space-y-8 max-w-4xl">
              <p className="text-black/80 font-medium text-lg leading-relaxed">
                Instead of sticking to the &apos;safe&apos; family businesses (textiles and electricals — thrilling, right?), we decided to channel our inner entrepreneurs.
              </p>
              <p className="text-black font-black text-xl italic border-l-4 border-[#FFD93D] pl-6 py-2 bg-yellow-50/50 rounded-r-lg">
                Spoiler: we didn&apos;t know what we were doing.
              </p>
              <p className="text-black/80 font-medium text-lg leading-relaxed">
                But we did know how to make people laugh. And argue. And then laugh again.
                <br />
                Now here we are — turning random ideas into something real, fun, and (fingers crossed) successful.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3 — THE JOURNEY (PATHWAY) */}
        <section className="mb-40 relative">
          <div className="text-center mb-24">
            <div className="inline-block bg-black text-white px-6 py-2 rounded-full font-black text-xs tracking-[0.3em] uppercase mb-4 shadow-[4px_4px_0px_#FFD93D] hover:translate-y-1 hover:shadow-none transition-all">
              The Quest Log
            </div>
            <h2 className="font-header text-4xl md:text-7xl text-black leading-none uppercase drop-shadow-[5px_5px_0px_rgba(0,0,0,0.1)]">
              Leveling Up <br /> Since 2020
            </h2>
          </div>

          <div ref={containerRef} className="relative max-w-5xl mx-auto px-4">
            {/* SVG PATHWAY BACKGROUND */}
            {/* SCROLL PROGRESS PATH ANIMATION */}
            <svg
              className="absolute top-0 left-0 w-full h-full pointer-events-none hidden md:block"
              viewBox="0 0 1000 1200"
              fill="none"
              preserveAspectRatio="none"
              style={{ zIndex: 0 }}
            >
              <defs>
                <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFD93D" />
                  <stop offset="30%" stopColor="#FF7675" />
                  <stop offset="70%" stopColor="#6C5CE7" />
                  <stop offset="100%" stopColor="#00B894" />
                </linearGradient>
              </defs>

              {/* Track Path (Dashed/Faint) */}
              <path
                d="M 500 50 
                   C 500 100, 200 150, 200 300
                   C 200 450, 800 500, 800 650
                   C 800 800, 200 850, 200 1000
                   C 200 1100, 500 1150, 500 1200"
                stroke="#000"
                strokeWidth="4"
                strokeOpacity="0.1"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="10 10"
                vectorEffect="non-scaling-stroke"
              />

              {/* Animated Filling Path */}
              <motion.path
                d="M 500 50 
                   C 500 100, 200 150, 200 300
                   C 200 450, 800 500, 800 650
                   C 800 800, 200 850, 200 1000
                   C 200 1100, 500 1150, 500 1200"
                stroke="url(#pathGradient)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                style={{
                  pathLength: scrollYProgress,
                  opacity: 1
                }}
              />
            </svg>


            {/* Level 1: THE SPARK (Left Aligned on desktop path) */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="relative flex flex-col md:flex-row items-center gap-12 mb-36 group"
            >
              <div className="md:w-1/2 md:pr-16 text-center md:text-right order-2 md:order-1 relative">
                <div className="inline-block bg-[#FFD93D] border-2 border-black px-4 py-1 font-black text-xs mb-4 shadow-[3px_3px_0px_#000] rotate-2">
                  LEVEL 1
                </div>
                <h3 className="font-header text-5xl mb-4 text-black">The Spark</h3>
                <p className="text-black/80 font-bold text-lg leading-relaxed bg-white/60 backdrop-blur-sm p-6 rounded-[20px] border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,0.05)]">
                  2020: Two dreamers quit the safety net. Armed with passion, zero business plan, and a lot of caffeine, <span className="bg-[#FFD93D] px-1 border-b-2 border-black">Joy Juncture</span> was born.
                </p>
              </div>

              {/* Center Marker */}
              <div className="absolute left-[20px] md:left-1/2 -translate-x-1/2 w-20 h-20 bg-white border-4 border-black rounded-full z-20 hidden md:flex items-center justify-center shadow-[6px_6px_0px_#FFD93D] group-hover:scale-110 transition-transform md:top-0">
                <span className="text-4xl">💡</span>
              </div>

              <div className="md:w-1/2 md:pl-16 order-1 md:order-2">
                <div className="relative bg-[#FFD93D] p-2 rounded-3xl border-4 border-black rotate-3 group-hover:rotate-6 transition-transform hover:scale-105 duration-300">
                  <div className="bg-white rounded-2xl h-48 flex items-center justify-center relative overflow-hidden">
                    {/* Pattern */}
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#FFD93D_2px,transparent_2px)] [background-size:12px_12px]"></div>
                    <span className="font-header text-[#FFD93D] text-6xl md:text-8xl drop-shadow-[4px_4px_0px_#FFF]">2020</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Level 2: TRIAL & ERROR (Right Aligned on desktop path) */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="relative flex flex-col md:flex-row items-center gap-12 mb-36 group"
            >
              <div className="md:w-1/2 md:pr-16 order-2 md:order-1">
                <div className="relative bg-[#FF7675] p-2 rounded-3xl border-4 border-black -rotate-2 group-hover:-rotate-6 transition-transform hover:scale-105 duration-300">
                  <div className="bg-white rounded-2xl h-48 flex items-center justify-center relative overflow-hidden text-center p-4">
                    <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,#FF7675_25%,transparent_25%,transparent_50%,#FF7675_50%,#FF7675_75%,transparent_75%,transparent)] [background-size:20px_20px]"></div>
                    <div className="relative z-10 flex flex-col items-center">
                      <span className="font-header text-white text-5xl bg-black px-4 py-1 -rotate-3 inline-block shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">FAIL?</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Marker aligned with path curve roughly */}
              <div className="absolute left-[20px] md:left-1/2 -translate-x-1/2 w-20 h-20 bg-white border-4 border-black rounded-full z-20 hidden md:flex items-center justify-center shadow-[6px_6px_0px_#FF7675] group-hover:scale-110 transition-transform md:top-[-80px]">
                <span className="text-4xl">🧪</span>
              </div>

              <div className="md:w-1/2 md:pl-16 order-1 md:order-2 text-left md:text-left">
                <div className="md:pl-12">
                  <div className="inline-block bg-[#FF7675] border-2 border-black px-4 py-1 font-black text-xs mb-4 shadow-[3px_3px_0px_#000] -rotate-1">
                    LEVEL 2
                  </div>
                  <h3 className="font-header text-5xl mb-4 text-black">Trial & Chaos</h3>
                  <p className="text-black/80 font-bold text-lg leading-relaxed bg-white/60 backdrop-blur-sm p-6 rounded-[20px] border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,0.05)]">
                    2021: We made games. Some worked. Some didn't. We learned that breaking rules is fun, but game mechanics actually need rules.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Level 3: FIRST VICTORY (Left Aligned on desktop path) */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="relative flex flex-col md:flex-row items-center gap-12 mb-36 group"
            >
              <div className="md:w-1/2 md:pr-16 text-right order-1 md:order-1 relative">
                <div className="inline-block bg-[#6C5CE7] text-white border-2 border-black px-4 py-1 font-black text-xs mb-4 shadow-[3px_3px_0px_#000] rotate-2">
                  LEVEL 3
                </div>
                <h3 className="font-header text-5xl mb-4 text-black">Liftoff!</h3>
                <p className="text-black/80 font-bold text-lg leading-relaxed bg-white/60 backdrop-blur-sm p-6 rounded-[20px] border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,0.05)]">
                  2022: Our first hit game launched. People bought it. Played it. And actually laughed! We realized, "Wait, we might actually be good at this."
                </p>
              </div>

              {/* Center Marker */}
              <div className="absolute left-[20px] md:left-1/2 -translate-x-1/2 w-20 h-20 bg-white border-4 border-black rounded-full z-20 hidden md:flex items-center justify-center shadow-[6px_6px_0px_#6C5CE7] group-hover:scale-110 transition-transform md:top-[-80px]">
                <span className="text-4xl">🚀</span>
              </div>

              <div className="md:w-1/2 md:pl-16 order-2 md:order-2">
                <div className="relative bg-[#6C5CE7] p-2 rounded-3xl border-4 border-black rotate-1 group-hover:rotate-3 transition-transform hover:scale-105 duration-300">
                  <div className="bg-black rounded-2xl h-48 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#6C5CE7_2px,transparent_2px)] [background-size:12px_12px]"></div>
                    <div className="relative z-10 flex items-baseline">
                      <span className="font-header text-[#6C5CE7] text-[5rem] md:text-[8rem] leading-none drop-shadow-[4px_4px_0px_#FFF]">W</span>
                      <span className="font-header text-white text-4xl md:text-6xl ml-1">IN!</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Level 4: EXPANSION (Right Aligned on desktop path) */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="relative flex flex-col md:flex-row items-center gap-12 mb-36 group"
            >
              <div className="md:w-1/2 md:pr-16 order-2 md:order-1">
                <div className="relative bg-[#00B894] p-2 rounded-3xl border-4 border-black -rotate-2 group-hover:-rotate-4 transition-transform hover:scale-105 duration-300">
                  <div className="bg-white rounded-2xl h-48 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[#00B894]/20"></div>
                    <span className="font-header text-black text-5xl md:text-7xl z-10 tracking-widest">FAM</span>
                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-[#00B894] rounded-full border-2 border-black"></div>
                  </div>
                </div>
              </div>

              {/* Center Marker aligned with path curve roughly */}
              <div className="absolute left-[20px] md:left-1/2 -translate-x-1/2 w-20 h-20 bg-white border-4 border-black rounded-full z-20 hidden md:flex items-center justify-center shadow-[6px_6px_0px_#00B894] group-hover:scale-110 transition-transform md:top-[-80px]">
                <span className="text-4xl">🌍</span>
              </div>

              <div className="md:w-1/2 md:pl-16 order-1 md:order-2 text-left md:text-left">
                <div className="md:pl-12">
                  <div className="inline-block bg-[#00B894] border-2 border-black px-4 py-1 font-black text-xs mb-4 shadow-[3px_3px_0px_#000] -rotate-1">
                    LEVEL 4
                  </div>
                  <h3 className="font-header text-5xl mb-4 text-black">Building the Guild</h3>
                  <p className="text-black/80 font-bold text-lg leading-relaxed bg-white/60 backdrop-blur-sm p-6 rounded-[20px] border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,0.05)]">
                    2023-2024: It wasn't just about the games anymore. It was about the players. Game nights, tournaments, and a community that felt less like customers and more like a chaotic family.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Level 5: THE FUTURE */}
            <div className="relative flex justify-center mt-24">
              <div className="bg-black text-white p-12 rounded-[40px] border-4 border-[#FFD93D] shadow-[0px_12px_0px_rgba(0,0,0,0.2)] max-w-2xl text-center relative overflow-hidden group hover:-translate-y-2 transition-transform">
                <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-[#FFD93D] via-[#FF7675] to-[#6C5CE7]"></div>

                <div className="inline-block bg-white text-black px-4 py-1 rounded-full font-black text-xs tracking-widest mb-6 border-2 border-[#FFD93D]">LOADING NEXT LEVEL...</div>

                <h3 className="font-header text-5xl md:text-7xl mb-6 text-[#FFD93D]">2025 & Beyond</h3>
                <p className="text-xl text-gray-300 font-medium leading-relaxed mb-8">
                  New worlds. New games. Same mission: To rid the world of boring evenings, one dice roll at a time.
                </p>
                <Link href="/play" className="inline-block bg-[#FFD93D] text-black font-black text-sm md:text-lg px-6 py-3 md:px-8 md:py-4 rounded-xl border-b-4 border-[#C5A300] active:border-b-0 active:translate-y-1 transition-all hover:bg-white hover:scale-105">
                  JOIN THE ADVENTURE
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 4 — WHY GAMES? (THE WHY) */}
        <section className="mb-32 py-24 border-y-2 border-black relative overflow-hidden bg-white neo-pattern">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD93D]/20 blur-[100px] rounded-full pointer-events-none"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center relative z-10">
            <div>
              <h2 className="font-header text-5xl md:text-6xl mb-6 text-black">Why Games?</h2>
            </div>
            <div>
              <p className="text-black/90 font-bold italic text-2xl leading-loose">
                Our goal? To make games that bring people together.
                <br />
                <span className="text-[#6C5CE7]">Because let&apos;s be honest — nothing bonds people like arguing over rules or laughing at someone&apos;s questionable strategy.</span>
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 4 — OUR MISSION & BELIEF */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
          <div className="bg-white p-12 rounded-[20px] border-2 border-black neo-shadow hover:scale-[1.02] transition-transform group">
            <h3 className="font-black text-sm tracking-[0.2em] text-[#FF7675] mb-6 uppercase font-header">Our Mission</h3>
            <p className="text-2xl md:text-3xl font-header leading-tight text-black group-hover:text-[#FF7675] transition-colors">
              Spread the magic of tabletop games wherever we go and build a culture that&apos;s all about fun.
            </p>
          </div>

          <div className="bg-[#FFD93D] p-12 rounded-[20px] border-2 border-black neo-shadow flex flex-col justify-center shadow-[4px_4px_0px_#000]">
            <h3 className="font-black text-sm tracking-[0.2em] text-black mb-6 uppercase font-header">We Believe</h3>
            <p className="text-black font-black italic text-2xl space-y-2 leading-relaxed">
              &quot;Games aren&apos;t just products.<br />
              They&apos;re moments.<br />
              They&apos;re memories.<br />
              They&apos;re shared joy.&quot;
            </p>
          </div>
        </section>

        {/* SECTION 5 — OUR PHILOSOPHY */}
        <section className="mb-32">
          <h2 className="font-header text-4xl mb-16 text-center text-black">Our Philosophy</h2>
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
                text: "Whether you&apos;re 10 or 100, there&apos;s a Joy Juncture game for you."
              }
            ].map((item, idx) => (
              <div key={idx} className="text-center p-8 border-2 border-transparent hover:border-black hover:bg-white hover:neo-shadow hover:rounded-[20px] transition-all duration-300">
                <div className="w-4 h-4 bg-[#00B894] mx-auto mb-6 rounded-none rotate-45 border border-black"></div>
                <h3 className="font-black text-sm tracking-[0.2em] uppercase mb-4 text-black font-header">{item.title}</h3>
                <p className="text-black/70 font-medium italic">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6 — THE ORIGIN STORY & THE PLAYERS */}
        <section className="mb-32 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-full bg-[#FFD93D]/10 -skew-y-3 pointer-events-none rounded-[60px] -z-10"></div>

          <h2 className="font-header text-4xl md:text-7xl mb-24 text-center text-black leading-[0.9] drop-shadow-[4px_4px_0px_#00B894]">
            THE MINDS BEHIND <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6C5CE7] to-[#FF7675]">THE MADNESS</span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-24">
            {/* The Story / Manifesto */}
            <div className="bg-white p-10 rounded-[40px] border-4 border-black shadow-[12px_12px_0px_#6C5CE7] relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <div className="text-9xl">📜</div>
              </div>

              <div className="relative z-10">
                <div className="inline-block px-4 py-2 bg-[#FFD93D] border-2 border-black rounded-full font-black text-xs tracking-[0.2em] mb-6 shadow-[4px_4px_0px_#000]">
                  THE ORIGIN STORY
                </div>
                <h3 className="font-header text-4xl mb-8 text-black leading-none">Why We Started <br /> Joy Juncture?</h3>

                <div className="space-y-6 text-lg font-medium text-black/80 leading-relaxed font-sans">
                  <p>
                    <span className="font-black text-black text-xl bg-[#00B894]/20 px-1">We noticed a glitch in the matrix:</span> In a world obsessed with screens, people were forgetting the art of face-to-face chaos.
                  </p>
                  <p>
                    You know that feeling when you flip a board table in frustration? Or the high-five after a perfect team win? <span className="italic font-bold text-black">We missed that.</span>
                  </p>
                  <p>
                    So we built Joy Juncture. Not just to sell games, but to design <span className="border-b-4 border-[#FF7675]">excuses to get together.</span> It started as a small idea and exploded into a movement of people who believe that play isn't just for kids—it's for anyone with a pulse.
                  </p>
                </div>
              </div>
            </div>

            {/* Founder 1 Card - Player Style */}
            <div className="relative mt-8 lg:mt-0">
              {founders[0] && (
                <div className="relative bg-[#FF7675] p-1 rounded-[32px] border-4 border-black shadow-[12px_12px_0px_#000] rotate-[-2deg] hover:rotate-0 transition-transform duration-300 group">
                  <div className="bg-white rounded-[28px] p-6 h-full flex flex-col items-center text-center overflow-hidden relative">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#000000_2px,transparent_2px)] [background-size:16px_16px]"></div>

                    {/* Image / Avatar */}
                    <div className="w-48 h-48 mb-6 relative z-10">
                      <div className="absolute inset-0 bg-[#FFD93D] rounded-full border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,0.2)]"></div>
                      <div className="absolute inset-0 rounded-full overflow-hidden border-4 border-black transform translate-x-1 translate-y-1 bg-white">
                        {founders[0].image ? (
                          <Image src={founders[0].image} alt={founders[0].name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-6xl">👩‍🎨</div>
                        )}
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-black text-white px-3 py-1 rounded-full text-xs font-black tracking-widest border-2 border-white">LVL 99</div>
                    </div>

                    <h3 className="font-header text-4xl text-black mb-2 relative z-10">{founders[0].name}</h3>
                    <div className="bg-[#FFD93D] px-4 py-1 border-2 border-black rounded-lg font-black text-xs uppercase tracking-[0.2em] mb-6 shadow-[2px_2px_0px_#000] z-10">
                      {founders[0].role}
                    </div>

                    <p className="text-black/70 font-bold italic relative z-10">
                      "{founders[0].description}"
                    </p>

                    {/* Stats or Fun Tags */}
                    <div className="grid grid-cols-2 gap-2 w-full mt-6">
                      <div className="border-2 border-black/10 rounded-xl p-2 bg-gray-50">
                        <div className="text-[10px] font-black uppercase text-black/40">CHAOS</div>
                        <div className="font-black text-black">100%</div>
                      </div>
                      <div className="border-2 border-black/10 rounded-xl p-2 bg-gray-50">
                        <div className="text-[10px] font-black uppercase text-black/40">CREATIVITY</div>
                        <div className="font-black text-black">MAX</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Founder 2 Card - Player Style */}
            <div className="relative order-2 lg:order-1">
              {founders[1] && (
                <div className="relative bg-[#6C5CE7] p-1 rounded-[32px] border-4 border-black shadow-[12px_12px_0px_#000] rotate-[2deg] hover:rotate-0 transition-transform duration-300 group">
                  <div className="bg-white rounded-[28px] p-6 h-full flex flex-col items-center text-center overflow-hidden relative">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#000000_2px,transparent_2px)] [background-size:16px_16px]"></div>

                    {/* Image / Avatar */}
                    <div className="w-48 h-48 mb-6 relative z-10">
                      <div className="absolute inset-0 bg-[#00B894] rounded-full border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,0.2)]"></div>
                      <div className="absolute inset-0 rounded-full overflow-hidden border-4 border-black transform translate-x-1 translate-y-1 bg-white">
                        {founders[1].image ? (
                          <Image src={founders[1].image} alt={founders[1].name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-6xl">🧙‍♀️</div>
                        )}
                      </div>
                      <div className="absolute -bottom-2 -left-2 bg-black text-white px-3 py-1 rounded-full text-xs font-black tracking-widest border-2 border-white">LVL 99</div>
                    </div>

                    <h3 className="font-header text-4xl text-black mb-2 relative z-10">{founders[1].name}</h3>
                    <div className="bg-[#00B894] px-4 py-1 border-2 border-black rounded-lg font-black text-xs uppercase tracking-[0.2em] mb-6 shadow-[2px_2px_0px_#000] z-10">
                      {founders[1].role}
                    </div>

                    <p className="text-black/70 font-bold italic relative z-10">
                      "{founders[1].description}"
                    </p>

                    {/* Stats or Fun Tags */}
                    <div className="grid grid-cols-2 gap-2 w-full mt-6">
                      <div className="border-2 border-black/10 rounded-xl p-2 bg-gray-50">
                        <div className="text-[10px] font-black uppercase text-black/40">DESIGN</div>
                        <div className="font-black text-black">PIXEL PERFECT</div>
                      </div>
                      <div className="border-2 border-black/10 rounded-xl p-2 bg-gray-50">
                        <div className="text-[10px] font-black uppercase text-black/40">VIBES</div>
                        <div className="font-black text-black">IMMACULATE</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* The Vision / Future Card */}
            <div className="order-1 lg:order-2 bg-[#1A1A1A] p-10 rounded-[40px] border-4 border-black shadow-[-12px_12px_0px_#FFD93D] relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300 text-white">
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-[#FFD93D] rounded-full blur-[60px] opacity-20"></div>

              <div className="relative z-10">
                <div className="inline-block px-4 py-2 bg-transparent border-2 border-[#FFD93D] text-[#FFD93D] rounded-full font-black text-xs tracking-[0.2em] mb-6">
                  THE FUTURE
                </div>
                <h3 className="font-header text-4xl mb-8 leading-none">More Than Valid <br /> eCommerce.</h3>

                <div className="space-y-6 text-lg font-medium text-white/80 leading-relaxed font-sans">
                  <p>
                    Today, Joy Juncture is a platform. <span className="text-[#FFD93D]">Tomorrow? Who knows.</span> Maybe a global tournament. Maybe a physical arcade. Maybe a colony on Mars (okay, maybe not that).
                  </p>
                  <p>
                    But one thing won't change: our obsession with bringing people together.
                  </p>
                  <div className="pt-6">
                    <p className="text-2xl font-black text-white italic">
                      "We're building the <span className="text-[#00B894] underline decoration-4 decoration-wavy underline-offset-4">playground</span> of the future."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7 — WHY CHOOSE JOY JUNCTURE? */}
        < section className="text-center py-20 border-t-2 border-black/10" >
          <p className="font-header text-3xl md:text-5xl mb-12 text-black leading-tight">
            &quot;Because life is too short for boring evenings.&quot;
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/shop"
              className="px-8 py-4 bg-black text-white font-black text-xs tracking-[0.4em] hover:bg-[#6C5CE7] hover:scale-110 transition-all rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,0.2)]"
            >
              EXPLORE GAMES
            </Link>
            <Link
              href="/community"
              className="px-8 py-4 bg-[#FFD93D] text-black border-2 border-black font-black text-xs tracking-[0.4em] neo-shadow hover:scale-110 transition-all rounded-xl"
            >
              JOIN THE FUN
            </Link>
          </div>
        </section >
      </div >
    </div >
  );
}