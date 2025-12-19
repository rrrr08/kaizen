'use client';

import Link from 'next/link';
import { PRODUCTS, EVENTS } from '@/lib/constants';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="relative min-h-screen">
      {/* Hero Section */}
      <section className="h-screen flex items-center justify-center text-center px-4 pt-24">
        <div className="max-w-4xl">
          <div className="mb-6 opacity-60 font-header text-[10px] tracking-[0.6em] uppercase">
            Est. 2024 • Members Only
          </div>
          <h1 className="font-header text-5xl md:text-7xl lg:text-8xl mb-8 leading-tight tracking-tighter">
            THE <span className="text-amber-500 italic font-serif">ART</span> OF <br />
            <span className="text-amber-400">CONSEQUENCE</span>
          </h1>
          <p className="font-serif italic text-lg md:text-2xl text-white/60 mb-12 max-w-2xl mx-auto">
            Where the high-stakes of strategy meet the whispered elegance of community.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <Link 
              href="/shop"
              className="group relative px-12 py-4 font-header text-[10px] tracking-[0.4em] overflow-hidden"
            >
              <div className="absolute inset-0 bg-amber-500 transition-transform duration-500 translate-y-[101%] group-hover:translate-y-0"></div>
              <span className="relative z-10 text-amber-500 group-hover:text-black transition-colors border border-amber-500/50 px-8 py-4 block">ENTER THE REPOSITORY</span>
            </Link>
            <Link 
              href="/events"
              className="font-header text-[10px] tracking-[0.4em] text-white/40 hover:text-white transition-colors"
            >
              RESERVE A SEAT
            </Link>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-12 opacity-30 hidden md:flex">
          <div className="w-[1px] h-32 bg-gradient-to-t from-amber-500 to-transparent"></div>
          <div className="font-header text-[8px] tracking-[0.5em] text-white/50 uppercase">Scroll for Revelation</div>
          <div className="w-[1px] h-32 bg-gradient-to-b from-amber-500 to-transparent"></div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
          {/* Play at Home */}
          <div className="space-y-8">
            <div className="aspect-[4/5] overflow-hidden group relative bg-emerald-950/20 rounded-sm">
              <img 
                src="https://picsum.photos/seed/luxury/800/1000" 
                className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110 grayscale group-hover:grayscale-0" 
                alt="Play at Home" 
              />
              <div className="absolute inset-0 bg-emerald-950/40 mix-blend-multiply transition-opacity group-hover:opacity-0 duration-500"></div>
              <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
                <div className="text-amber-500 font-header text-xs tracking-widest mb-4">PLAY AT HOME</div>
                <h3 className="font-header text-3xl md:text-4xl mb-6">PRIVATE ENCOUNTERS</h3>
                <p className="font-serif italic text-white/70 max-w-sm">Curated board games for the discerning mind, from casual family nights to competitive tournaments.</p>
              </div>
            </div>
            <Link href="/experiences" className="font-header text-[10px] tracking-[0.4em] border-b border-amber-500/20 pb-2 hover:border-amber-500 transition-all inline-block">
              EXPLORE MORE
            </Link>
          </div>

          {/* Play Together */}
          <div className="pt-0 md:pt-24 space-y-8">
            <div className="aspect-[4/5] overflow-hidden group relative bg-indigo-950/20 rounded-sm">
              <img 
                src="https://picsum.photos/seed/cards/800/1000" 
                className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110 grayscale group-hover:grayscale-0" 
                alt="Play Together" 
              />
              <div className="absolute inset-0 bg-indigo-950/40 mix-blend-multiply transition-opacity group-hover:opacity-0 duration-500"></div>
              <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
                <div className="text-amber-500 font-header text-xs tracking-widest mb-4">PLAY TOGETHER</div>
                <h3 className="font-header text-3xl md:text-4xl mb-6">LIVE EXPERIENCES</h3>
                <p className="font-serif italic text-white/70 max-w-sm">Game nights, workshops, and event registrations hosted across the city for the community.</p>
              </div>
            </div>
            <Link href="/events" className="font-header text-[10px] tracking-[0.4em] border-b border-amber-500/20 pb-2 hover:border-amber-500 transition-all inline-block">
              VIEW UPCOMING EVENTS
            </Link>
          </div>
        </div>
      </section>

      {/* What's Happening Now Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-24">
        <div className="mb-16">
          <div className="text-amber-500 font-header text-[10px] tracking-[0.6em] mb-4 uppercase">Dynamic Content</div>
          <h2 className="font-header text-5xl md:text-7xl tracking-tight">What's Happening Now</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Upcoming Events */}
          <div className="border border-white/10 p-8 hover:border-amber-500/50 transition-all rounded-sm">
            <div className="text-amber-500 font-header text-xs tracking-widest mb-4">UPCOMING</div>
            <h3 className="font-header text-xl mb-6">Featured Events</h3>
            <div className="space-y-4">
              {EVENTS.slice(0, 2).map(event => (
                <div key={event.id} className="border-b border-white/5 pb-4 last:border-0">
                  <p className="font-header text-sm tracking-wider text-amber-400">{event.title}</p>
                  <p className="font-serif italic text-xs text-white/50 mt-2">{event.date}</p>
                </div>
              ))}
            </div>
            <Link href="/events" className="font-header text-[9px] tracking-[0.3em] text-amber-500 hover:text-amber-400 mt-6 inline-block">
              VIEW ALL EVENTS →
            </Link>
          </div>

          {/* New Games */}
          <div className="border border-white/10 p-8 hover:border-amber-500/50 transition-all rounded-sm">
            <div className="text-amber-500 font-header text-xs tracking-widest mb-4">LATEST</div>
            <h3 className="font-header text-xl mb-6">New Games</h3>
            <div className="space-y-4">
              {PRODUCTS.slice(0, 2).map(product => (
                <div key={product.id} className="border-b border-white/5 pb-4 last:border-0">
                  <p className="font-header text-sm tracking-wider text-amber-400">{product.name}</p>
                  <p className="font-serif italic text-xs text-white/50 mt-2">₹{product.price}</p>
                </div>
              ))}
            </div>
            <Link href="/shop" className="font-header text-[9px] tracking-[0.3em] text-amber-500 hover:text-amber-400 mt-6 inline-block">
              SHOP ALL GAMES →
            </Link>
          </div>

          {/* Community Highlights */}
          <div className="border border-white/10 p-8 hover:border-amber-500/50 transition-all rounded-sm">
            <div className="text-amber-500 font-header text-xs tracking-widest mb-4">COMMUNITY</div>
            <h3 className="font-header text-xl mb-6">Get Involved</h3>
            <div className="space-y-4">
              <div className="border-b border-white/5 pb-4">
                <p className="font-header text-sm tracking-wider text-amber-400">Join Our Community</p>
                <p className="font-serif italic text-xs text-white/50 mt-2">Connect with fellow players</p>
              </div>
              <div className="border-b border-white/5 pb-4">
                <p className="font-header text-sm tracking-wider text-amber-400">Earn Points</p>
                <p className="font-serif italic text-xs text-white/50 mt-2">Unlock rewards & benefits</p>
              </div>
            </div>
            <Link href="/community" className="font-header text-[9px] tracking-[0.3em] text-amber-500 hover:text-amber-400 mt-6 inline-block">
              EXPLORE COMMUNITY →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-24 text-center">
        <h2 className="font-header text-5xl md:text-7xl mb-8">Ready to Play?</h2>
        <p className="text-white/60 text-lg mb-12 max-w-2xl mx-auto">
          Discover the joy of games, the thrill of events, and the connection of community.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link 
            href="/shop"
            className="px-8 py-4 bg-amber-500 text-black font-header text-[10px] tracking-[0.4em] hover:bg-amber-400 transition-all rounded-sm"
          >
            BROWSE GAMES
          </Link>
          <Link 
            href="/events"
            className="px-8 py-4 border border-amber-500 text-amber-500 font-header text-[10px] tracking-[0.4em] hover:bg-amber-500/10 transition-all rounded-sm"
          >
            FIND EVENTS
          </Link>
        </div>
      </section>
    </div>
  );
}

