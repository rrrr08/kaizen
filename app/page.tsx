'use client';

import Link from 'next/link';
import Image from 'next/image';
import { PRODUCTS, EVENTS } from '@/lib/constants';
import { ArrowRight, Star, Heart, Trophy, Users, Puzzle, Calendar, ShoppingBag, MapPin, Gift, Crown, Info } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-black overflow-x-hidden">
      <div className="grain-overlay"></div>

      {/* SECTION 1: HERO */}
      <section className="relative h-screen flex items-center justify-center text-center px-4 overflow-hidden">
        {/* Background Atmosphere */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black z-10"></div>
          <Image
            src="https://images.unsplash.com/photo-1606167668584-78701c57f13d?q=80&w=2070&auto=format&fit=crop"
            alt="Friends playing games"
            fill
            className="object-cover opacity-60"
            priority
          />
        </div>

        <div className="relative z-20 max-w-5xl mx-auto space-y-8 pt-20">
          <div className="inline-block border border-white/20 px-6 py-2 rounded-full backdrop-blur-sm bg-black/30 animate-fade-in">
            <span className="font-header text-xs tracking-[0.3em] text-gold uppercase">Est. 2024 • The Art of Play</span>
          </div>

          <h1 className="font-sans font-bold text-5xl md:text-7xl lg:text-8xl leading-tight tracking-tight text-white drop-shadow-2xl">
            Where Play <br />
            <span className="font-serif italic text-gold">Becomes Meaning.</span>
          </h1>

          <h2 className="font-header text-sm md:text-base tracking-widest text-white/80 uppercase max-w-3xl mx-auto border-l-2 border-gold/50 pl-6 text-left md:text-center md:border-l-0 md:pl-0">
            Board games, live experiences, and playful communities — designed for how you want to play.
          </h2>

          <p className="font-serif text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
            Discover games, join live game nights, earn points, and belong to a growing community of players.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-8">
            <Link href="/shop" className="group relative px-8 py-4 bg-white text-black font-header text-xs tracking-widest hover:bg-gold transition-colors duration-300">
              <span className="flex items-center gap-2">SHOP GAMES <ShoppingBag size={14} /></span>
            </Link>
            <Link href="/events" className="group relative px-8 py-4 border border-white/30 text-white font-header text-xs tracking-widest hover:bg-white/10 transition-colors duration-300 backdrop-blur-md">
              <span className="flex items-center gap-2">JOIN A GAME NIGHT <Calendar size={14} /></span>
            </Link>
            <Link href="/signin" className="group relative px-8 py-4 text-gold font-header text-xs tracking-widest hover:text-white transition-colors duration-300">
              <span className="flex items-center gap-2 border-b border-gold/50 pb-1">PLAY FREE & EARN <Trophy size={14} /></span>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 2: CHOOSE YOUR PLAY STYLE */}
      <section className="relative z-20 py-32 px-6 md:px-12 max-w-8xl mx-auto bg-black">
        <div className="text-center mb-24">
          <h2 className="font-sans font-bold text-4xl md:text-5xl text-white mb-6">Choose How You Want to Play</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Play at Home */}
          <div className="group relative h-[500px] border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-500 overflow-hidden flex flex-col justify-between">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90 z-10"></div>
            <Image
              src="https://images.unsplash.com/photo-1632501641765-e568d28b0015?q=80&w=1974&auto=format&fit=crop"
              alt="Play at Home"
              fill
              className="object-cover opacity-50 group-hover:scale-105 transition-transform duration-700 grayscale group-hover:grayscale-0"
            />
            <div className="relative z-20 p-8 h-full flex flex-col justify-end">
              <div className="mb-auto pt-4 text-gold/80"><ShoppingBag /></div>
              <h3 className="font-header text-2xl text-white mb-4">Play at Home</h3>
              <ul className="text-white/60 text-sm space-y-2 mb-8 font-sans">
                <li>• Buy board & card games</li>
                <li>• Learn how to play</li>
                <li>• Play free online games</li>
                <li>• Earn points from play</li>
              </ul>
              <Link href="/shop" className="text-gold font-header text-xs tracking-widest flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                EXPLORE GAMES <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Card 2: Play Together */}
          <div className="group relative h-[500px] border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-500 overflow-hidden flex flex-col justify-between">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90 z-10"></div>
            <Image
              src="https://images.unsplash.com/photo-1511882150382-421056c89033?q=80&w=2071&auto=format&fit=crop"
              alt="Play Together"
              fill
              className="object-cover opacity-50 group-hover:scale-105 transition-transform duration-700 grayscale group-hover:grayscale-0"
            />
            <div className="relative z-20 p-8 h-full flex flex-col justify-end">
              <div className="mb-auto pt-4 text-gold/80"><Users /></div>
              <h3 className="font-header text-2xl text-white mb-4">Play Together</h3>
              <ul className="text-white/60 text-sm space-y-2 mb-8 font-sans">
                <li>• Game nights</li>
                <li>• Workshops</li>
                <li>• City-based events</li>
                <li>• Meet new players</li>
              </ul>
              <Link href="/events" className="text-gold font-header text-xs tracking-widest flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                VIEW EVENTS <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Card 3: Play for Occasions */}
          <div className="group relative h-[500px] border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-500 overflow-hidden flex flex-col justify-between">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90 z-10"></div>
            <Image
              src="https://images.unsplash.com/photo-1514525253440-b393452de23e?q=80&w=2074&auto=format&fit=crop"
              alt="Occasions"
              fill
              className="object-cover opacity-50 group-hover:scale-105 transition-transform duration-700 grayscale group-hover:grayscale-0"
            />
            <div className="relative z-20 p-8 h-full flex flex-col justify-end">
              <div className="mb-auto pt-4 text-gold/80"><Gift /></div>
              <h3 className="font-header text-2xl text-white mb-4">Play for Occasions</h3>
              <ul className="text-white/60 text-sm space-y-2 mb-8 font-sans">
                <li>• Corporate team building</li>
                <li>• Weddings & birthdays</li>
                <li>• Carnivals</li>
                <li>• Large-scale experiences</li>
              </ul>
              <Link href="/experiences" className="text-gold font-header text-xs tracking-widest flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                PLAN EXPERIENCE <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Card 4: Play & Belong */}
          <div className="group relative h-[500px] border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-500 overflow-hidden flex flex-col justify-between">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90 z-10"></div>
            <Image
              src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2064&auto=format&fit=crop"
              alt="Community"
              fill
              className="object-cover opacity-50 group-hover:scale-105 transition-transform duration-700 grayscale group-hover:grayscale-0"
            />
            <div className="relative z-20 p-8 h-full flex flex-col justify-end">
              <div className="mb-auto pt-4 text-gold/80"><Crown /></div>
              <h3 className="font-header text-2xl text-white mb-4">Play & Belong</h3>
              <ul className="text-white/60 text-sm space-y-2 mb-8 font-sans">
                <li>• Wallet & points system</li>
                <li>• Puzzles & riddles</li>
                <li>• Blogs & stories</li>
                <li>• Community rewards</li>
              </ul>
              <Link href="/community" className="text-gold font-header text-xs tracking-widest flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                JOIN COMMUNITY <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: WHAT'S HAPPENING NOW */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-gold font-header text-xs tracking-widest uppercase">Live Updates</span>
            </div>
            <h2 className="font-sans font-bold text-5xl text-white">What's Happening Now</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Panel 1: Upcoming Events */}
          <div className="bg-white/[0.03] border border-white/10 p-8 rounded-sm hover:border-gold/30 transition-all group">
            <div className="flex justify-between items-start mb-8">
              <Calendar className="text-white/40 group-hover:text-gold transition-colors" />
              <span className="bg-gold/10 text-gold text-[10px] font-header px-2 py-1 tracking-widest">SEATS FILLING</span>
            </div>
            <h3 className="font-header text-xl text-white mb-6">Upcoming Events</h3>
            <div className="space-y-6">
              {EVENTS.slice(0, 3).map(event => (
                <div key={event.id} className="flex justify-between items-center border-b border-white/5 pb-4 last:border-0 hover:pl-2 transition-all">
                  <div>
                    <p className="text-white font-medium">{event.title}</p>
                    <p className="text-white/40 text-xs mt-1 font-header">{event.date}</p>
                  </div>
                  <ArrowRight size={14} className="text-white/20 -rotate-45" />
                </div>
              ))}
            </div>
            <Link href="/events" className="mt-8 block w-full py-3 text-center border border-white/20 text-xs font-header tracking-widest hover:bg-white hover:text-black transition-all">
              RESERVE A SEAT
            </Link>
          </div>

          {/* Panel 2: New Games */}
          <div className="bg-white/[0.03] border border-white/10 p-8 rounded-sm hover:border-gold/30 transition-all group">
            <div className="flex justify-between items-start mb-8">
              <ShoppingBag className="text-white/40 group-hover:text-gold transition-colors" />
              <span className="bg-white/10 text-white/70 text-[10px] font-header px-2 py-1 tracking-widest">FRESH ARRIVALS</span>
            </div>
            <h3 className="font-header text-xl text-white mb-6">New Games</h3>
            <div className="space-y-6">
              {PRODUCTS.slice(0, 3).map(product => (
                <div key={product.id} className="flex justify-between items-center border-b border-white/5 pb-4 last:border-0 hover:pl-2 transition-all">
                  <div>
                    <p className="text-white font-medium">{product.name}</p>
                    <p className="text-gold text-xs mt-1 font-header">₹{product.price}</p>
                  </div>
                  <Image
                    src={product.image || "https://picsum.photos/50"}
                    alt={product.name}
                    width={40}
                    height={40}
                    className="rounded-sm opacity-80"
                  />
                </div>
              ))}
            </div>
            <Link href="/shop" className="mt-8 block w-full py-3 text-center border border-white/20 text-xs font-header tracking-widest hover:bg-white hover:text-black transition-all">
              SHOP NOW
            </Link>
          </div>

          {/* Panel 3: Community */}
          <div className="bg-gradient-to-br from-white/[0.05] to-gold/[0.05] border border-white/10 p-8 rounded-sm hover:border-gold/30 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-gold/5 blur-[80px] rounded-full"></div>
            <div className="flex justify-between items-start mb-8 relative z-10">
              <Puzzle className="text-gold group-hover:rotate-12 transition-transform duration-500" />
              <span className="bg-gold text-black text-[10px] font-header px-2 py-1 tracking-widest flex items-center gap-1">
                <Star size={10} fill="black" /> +10 POINTS
              </span>
            </div>
            <h3 className="font-header text-xl text-white mb-6 relative z-10">Puzzle of the Day</h3>
            <div className="relative z-10 bg-black/40 p-6 rounded border border-white/10 backdrop-blur-md mb-6">
              <p className="font-serif italic text-white/80 text-center">"I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?"</p>
            </div>
            <div className="relative z-10 text-center mb-8">
              <p className="text-xs font-header text-gold/80">120 PLAYERS EARNED POINTS TODAY</p>
            </div>
            <Link href="/community" className="relative z-10 block w-full py-3 text-center bg-white/10 hover:bg-gold hover:text-black text-xs font-header tracking-widest transition-all">
              ANSWER & EARN
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 4: PROOF OF JOY */}
      <section className="py-24 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="font-serif italic text-4xl text-white/90 mb-4">Moments We've Created</h2>
            <p className="font-header text-gold text-xs tracking-widest uppercase">TRUSTED BY THE COMMUNITY</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-6">
              <div className="aspect-square relative overflow-hidden rounded-sm grayscale hover:grayscale-0 transition-all duration-700">
                <Image src="https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop" alt="Event moment" fill className="object-cover" />
              </div>
              <blockquote className="text-white/70 font-serif italic text-sm text-center">"The best team-building experience we’ve had. Genuine connection."</blockquote>
            </div>
            <div className="space-y-6 md:translate-y-12">
              <div className="aspect-square relative overflow-hidden rounded-sm grayscale hover:grayscale-0 transition-all duration-700">
                <Image src="https://images.unsplash.com/photo-1551739440-5dd934d3a95a?q=80&w=1964&auto=format&fit=crop" alt="Event moment" fill className="object-cover" />
              </div>
              <blockquote className="text-white/70 font-serif italic text-sm text-center">"Everyone stayed longer than planned. Games that actually brought people together."</blockquote>
            </div>
            <div className="space-y-6">
              <div className="aspect-square relative overflow-hidden rounded-sm grayscale hover:grayscale-0 transition-all duration-700">
                <Image src="https://images.unsplash.com/photo-1570215778401-2bfa6743e493?q=80&w=2070&auto=format&fit=crop" alt="Event moment" fill className="object-cover" />
              </div>
              <blockquote className="text-white/70 font-serif italic text-sm text-center">"A hidden gem for board game lovers. Calculated joy."</blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: GAMIFICATION TEASER */}
      <section className="py-32 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gold/5">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/10 blur-[150px] rounded-full"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 border border-gold/30 rounded-full px-4 py-1 bg-black/40 backdrop-blur-md mb-8">
            <Crown size={14} className="text-gold" />
            <span className="text-gold font-header text-[10px] tracking-widest uppercase">JOY REWARDS</span>
          </div>

          <h2 className="font-sans font-bold text-6xl text-white mb-8">Play More. <span className="text-gold italic font-serif">Earn More.</span></h2>

          <p className="text-white/60 text-lg mb-12 max-w-xl mx-auto">
            Every interaction earns rewards. Attend game nights, solve puzzles, or buy a new game. Play is never wasted here.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 max-w-3xl mx-auto">
            <div className="bg-black/40 border border-white/10 p-4 rounded backdrop-blur-sm">
              <div className="text-2xl font-header text-white mb-1">+50</div>
              <div className="text-[10px] text-white/50 tracking-widest uppercase">Attend Event</div>
            </div>
            <div className="bg-black/40 border border-white/10 p-4 rounded backdrop-blur-sm">
              <div className="text-2xl font-header text-white mb-1">+10</div>
              <div className="text-[10px] text-white/50 tracking-widest uppercase">Daily Puzzle</div>
            </div>
            <div className="bg-black/40 border border-white/10 p-4 rounded backdrop-blur-sm">
              <div className="text-2xl font-header text-white mb-1">+100</div>
              <div className="text-[10px] text-white/50 tracking-widest uppercase">Buy Game</div>
            </div>
            <div className="bg-black/40 border border-white/10 p-4 rounded backdrop-blur-sm">
              <div className="text-2xl font-header text-white mb-1">VIP</div>
              <div className="text-[10px] text-white/50 tracking-widest uppercase">Unlock Status</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/signup" className="px-10 py-4 bg-gold text-black font-header text-xs tracking-widest hover:bg-white transition-all shadow-[0_0_20px_rgba(251,191,36,0.2)]">
              CREATE FREE ACCOUNT
            </Link>
            <Link href="/rewards" className="px-10 py-4 border border-white/20 text-white font-header text-xs tracking-widest hover:border-gold hover:text-gold transition-all">
              VIEW REWARDS
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 6: FINAL CTA */}
      <section className="py-40 px-6 text-center bg-gradient-to-t from-white/5 to-black">
        <h2 className="font-sans font-bold text-5xl md:text-8xl text-white mb-8 tracking-tighter">Ready to Play?</h2>
        <p className="font-serif text-white/50 text-xl max-w-2xl mx-auto mb-16 italic">
          "Discover the joy of games, the thrill of events, and the connection of community."
        </p>
        <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
          <Link href="/shop" className="group text-white font-header text-lg tracking-widest border-b border-white/30 pb-2 hover:border-gold hover:text-gold transition-all flex items-center gap-4">
            BROWSE GAMES <ArrowRight className="group-hover:translate-x-2 transition-transform" />
          </Link>
          <span className="text-white/20 font-serif italic text-lg hidden sm:block">or</span>
          <Link href="/events" className="group text-white font-header text-lg tracking-widest border-b border-white/30 pb-2 hover:border-gold hover:text-gold transition-all flex items-center gap-4">
            FIND EVENTS <ArrowRight className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}

