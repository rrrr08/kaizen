'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
          <h1 className="font-header text-6xl md:text-8xl tracking-tighter mb-8 leading-none text-black">
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

        {/* SECTION 3 — JOURNEY TIMELINE */}
        <section className="mb-32 relative">
          <h2 className="font-black text-sm tracking-[0.2em] text-[#6C5CE7] mb-8 uppercase font-header text-center">Our Journey</h2>
          <h3 className="font-header text-4xl md:text-5xl mb-20 text-center text-black">The Joy Juncture Story</h3>
          
          <div className="relative max-w-4xl mx-auto">
            {/* Connecting Path Through Checkpoints */}
            <svg 
              className="absolute top-0 left-0 w-full h-full pointer-events-none hidden md:block" 
              viewBox="0 0 800 1000" 
              preserveAspectRatio="xMidYMid meet"
              style={{ zIndex: 0 }}
            >
              <defs>
                <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFD93D" />
                  <stop offset="25%" stopColor="#6C5CE7" />
                  <stop offset="50%" stopColor="#FF7675" />
                  <stop offset="75%" stopColor="#00B894" />
                  <stop offset="100%" stopColor="#6C5CE7" />
                </linearGradient>
              </defs>
              {/* Path: Checkpoint 1 → Emoji → Checkpoint 2 → Emoji → Checkpoint 3 → Emoji → Checkpoint 4 → Emoji → Checkpoint 5 */}
              <path
                d="M 200 60 
                   C 280 60, 350 80, 400 100
                   C 500 140, 550 180, 600 220
                   C 550 280, 450 320, 400 360
                   C 300 420, 250 460, 200 500
                   C 280 540, 350 580, 400 620
                   C 500 680, 550 720, 600 760
                   C 550 820, 450 860, 400 900
                   C 300 940, 250 960, 200 980"
                stroke="url(#pathGradient)"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.7"
              />
            </svg>

            {/* Timeline Checkpoints */}
            <div className="relative z-10 space-y-24 py-12">
              {/* Checkpoint 1 - The Spark */}
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/2 md:text-right md:pr-12">
                  <div className="bg-white p-8 rounded-[32px] border-4 border-[#FFD93D] shadow-[6px_6px_0px_#FFD93D] hover:shadow-[8px_8px_0px_#FFD93D] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
                    <div className="flex items-center gap-4 mb-4 md:flex-row-reverse md:justify-end">
                      <div className="w-14 h-14 bg-[#FFD93D] rounded-full border-4 border-black flex items-center justify-center font-black text-xl shadow-[3px_3px_0px_#000] flex-shrink-0">
                        1
                      </div>
                      <h4 className="font-header text-2xl font-black">The Spark</h4>
                    </div>
                    <p className="text-black/70 font-bold text-sm mb-3">2020</p>
                    <p className="text-black font-medium leading-relaxed">
                      Two dreamers decided to break free from traditional family businesses. Armed with nothing but passion and a lot of naivety, Joy Juncture was born.
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0 text-5xl">🎯</div>
                <div className="md:w-1/2"></div>
              </div>

              {/* Checkpoint 2 - Learning the Ropes */}
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/2"></div>
                <div className="flex-shrink-0 text-5xl">🎲</div>
                <div className="md:w-1/2 md:pl-12">
                  <div className="bg-white p-8 rounded-[32px] border-4 border-[#6C5CE7] shadow-[6px_6px_0px_#6C5CE7] hover:shadow-[8px_8px_0px_#6C5CE7] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-[#6C5CE7] rounded-full border-4 border-black flex items-center justify-center font-black text-xl text-white shadow-[3px_3px_0px_#000] flex-shrink-0">
                        2
                      </div>
                      <h4 className="font-header text-2xl font-black">Learning the Ropes</h4>
                    </div>
                    <p className="text-black/70 font-bold text-sm mb-3">2021</p>
                    <p className="text-black font-medium leading-relaxed">
                      Experimented with game mechanics, learned from failures, and discovered that making people laugh is harder than it looks. But we kept going.
                    </p>
                  </div>
                </div>
              </div>

              {/* Checkpoint 3 - First Launch */}
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/2 md:text-right md:pr-12">
                  <div className="bg-white p-8 rounded-[32px] border-4 border-[#FF7675] shadow-[6px_6px_0px_#FF7675] hover:shadow-[8px_8px_0px_#FF7675] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
                    <div className="flex items-center gap-4 mb-4 md:flex-row-reverse md:justify-end">
                      <div className="w-14 h-14 bg-[#FF7675] rounded-full border-4 border-black flex items-center justify-center font-black text-xl text-white shadow-[3px_3px_0px_#000] flex-shrink-0">
                        3
                      </div>
                      <h4 className="font-header text-2xl font-black">First Launch</h4>
                    </div>
                    <p className="text-black/70 font-bold text-sm mb-3">2022</p>
                    <p className="text-black font-medium leading-relaxed">
                      Our debut game hit the market! People actually bought it. And played it. And laughed. Mission accomplished.
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0 text-5xl">🚀</div>
                <div className="md:w-1/2"></div>
              </div>

              {/* Checkpoint 4 - Growing Community */}
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/2"></div>
                <div className="flex-shrink-0 text-5xl">🎉</div>
                <div className="md:w-1/2 md:pl-12">
                  <div className="bg-white p-8 rounded-[32px] border-4 border-[#00B894] shadow-[6px_6px_0px_#00B894] hover:shadow-[8px_8px_0px_#00B894] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-[#00B894] rounded-full border-4 border-black flex items-center justify-center font-black text-xl text-white shadow-[3px_3px_0px_#000] flex-shrink-0">
                        4
                      </div>
                      <h4 className="font-header text-2xl font-black">Building Community</h4>
                    </div>
                    <p className="text-black/70 font-bold text-sm mb-3">2023-2024</p>
                    <p className="text-black font-medium leading-relaxed">
                      From hosting game nights to building an online platform, we created a space where players become family. The community grew beyond our wildest dreams.
                    </p>
                  </div>
                </div>
              </div>

              {/* Checkpoint 5 - Today & Beyond */}
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/2 md:text-right md:pr-12">
                  <div className="relative bg-gradient-to-br from-[#FFD93D] via-[#A78BFA] to-[#00B894] p-[6px] rounded-[36px] shadow-[8px_8px_0px_#000] hover:shadow-[10px_10px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
                    <div className="bg-gradient-to-br from-[#FFD93D]/95 via-[#8B7FE7]/95 to-[#00B894]/95 p-8 rounded-[32px] backdrop-blur-sm">
                      <div className="flex items-center gap-4 mb-4 md:flex-row-reverse md:justify-end">
                        <div className="w-14 h-14 bg-white rounded-full border-4 border-black flex items-center justify-center font-black text-xl shadow-[4px_4px_0px_rgba(0,0,0,0.2)] flex-shrink-0">
                          5
                        </div>
                        <h4 className="font-header text-2xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">Today & Beyond</h4>
                      </div>
                      <p className="text-white font-bold text-sm mb-3 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">2025 - Future</p>
                      <p className="text-white font-medium leading-relaxed drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                        Joy Juncture is now a complete ecosystem - games, events, experiences, and a thriving rewards system. But we&apos;re just getting started. The best is yet to come!
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 text-5xl">✨</div>
                <div className="md:w-1/2"></div>
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

        {/* SECTION 6 — MEET THE MINDS BEHIND THE MADNESS */}
        <section className="mb-32">
          <h2 className="font-header text-4xl md:text-5xl mb-16 text-center text-black">Meet the Minds <br /> Behind the Madness</h2>

          <div className="space-y-12 mb-12">
            <div>
              <h2 className="font-black text-sm tracking-[0.2em] text-[#6C5CE7] mb-6 uppercase font-header">Founder&apos;s Journey</h2>
              <h3 className="font-header text-3xl md:text-4xl mb-6 text-black">Why Joy Juncture Started</h3>
              <div className="space-y-6 text-black/80 font-medium leading-relaxed max-w-4xl">
                <p>
                  Joy Juncture was born from a simple observation: in a world obsessed with digital isolation, people crave real connections and shared moments of joy. Games, in their purest form, are vehicles for these moments.
                </p>
                <p>
                  The founder spent years observing how a single board game could transform a room full of strangers into a community of friends. That magic inspired the creation of Joy Juncture—a platform that celebrates games not as products, but as catalysts for belonging.
                </p>
                <p>
                  Today, Joy Juncture is more than an e-commerce platform. It&apos;s a movement. A celebration of playfulness. A testament to the power of gathering, laughing, competing, and most importantly, connecting.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {founders.map((founder, i) => (
              <div key={i} className="group relative">
                <div className="aspect-[4/5] bg-white border-2 border-black rounded-[20px] overflow-hidden mb-6 neo-shadow group-hover:scale-[1.02] transition-transform duration-300 transform-gpu isolation-isolate">
                  {founder.image && founder.image.trim() !== "" ? (
                    <Image
                      src={founder.image}
                      alt={founder.name}
                      fill
                      className="object-cover object-top"
                    />
                  ) : (
                    <div className={`w-full h-full ${i === 0 ? 'bg-[#FFD93D]' : 'bg-[#00B894]'} flex items-center justify-center relative overflow-hidden`}>
                      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:16px_16px]"></div>
                      <span className="text-black font-header text-8xl opacity-20">{founder.name.split(' ').map((n: string) => n[0]).join('')}</span>
                    </div>
                  )}
                </div>
                <h3 className="font-header text-3xl mb-1 text-black">{founder.name}</h3>
                <p className={`${i === 0 ? 'text-[#FF7675]' : 'text-[#6C5CE7]'} font-black text-xs tracking-[0.3em] uppercase mb-4 bg-black/5 inline-block px-2 py-1 rounded`}>{founder.role}</p>
                <p className="text-black/70 font-bold text-sm">{founder.description}</p>
              </div>
            ))}
          </div>
        </section >

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