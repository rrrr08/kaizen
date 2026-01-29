'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Plus, Flame, ChevronRight, Calendar, Puzzle, Package, Wallet, Zap, Gift, Home as HomeIcon, Users, PartyPopper, Gamepad2 } from 'lucide-react';
// import ContextAwareLayout from '@/components/home/ContextAwareLayout';
// import DailyDropCard from '@/components/home/DailyDropCard';
// import GameDiscoveryCarousel from '@/components/ui/GameDiscoveryCarousel';
// import ArcadeHero from '@/components/home/ArcadeHero';
// import EventHero from '@/components/home/EventHero';
import Hero from '@/components/home/Hero';
import PlayStyleSelector from '@/components/home/PlayStyleSelector';
import { Product, GameEvent, HomepageContent } from '@/lib/types';
import { useAuth } from '@/app/context/AuthContext';
import { useGamification } from '@/app/context/GamificationContext';
import { DEFAULT_HOMEPAGE_CONTENT } from '@/lib/ui-config';

import { doc, getDoc } from 'firebase/firestore';
import { db, getUserWallet } from '@/lib/firebase';

import ProofOfJoyGrid from '@/components/community/ProofOfJoyGrid';

export default function Home() {
  const { user } = useAuth();
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [content, setContent] = useState<HomepageContent>(DEFAULT_HOMEPAGE_CONTENT);
  const [userBalance, setUserBalance] = useState<number | null>(null);
  const { rewardsConfig, xp } = useGamification();
  const [availableVouchers, setAvailableVouchers] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      // Fetch Page Content
      try {
        const docRef = doc(db, 'content', 'homepage');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          // Merge default content with Firestore content
          const firestoreData = docSnap.data() as Partial<HomepageContent>;
          setContent({
            ...DEFAULT_HOMEPAGE_CONTENT,
            ...firestoreData,
            hero: { ...DEFAULT_HOMEPAGE_CONTENT.hero, ...firestoreData.hero },
            heroSocial: { ...DEFAULT_HOMEPAGE_CONTENT.heroSocial, ...firestoreData.heroSocial },
            playStyle: { ...DEFAULT_HOMEPAGE_CONTENT.playStyle, ...firestoreData.playStyle },
            gamification: { ...DEFAULT_HOMEPAGE_CONTENT.gamification, ...firestoreData.gamification },
          } as HomepageContent);
        }
      } catch (err) {
        console.error('Error fetching homepage content:', err);
      }

      // Fetch Products (Actual Games)
      try {
        setLoadingProducts(true);
        const { getProducts } = await import('@/lib/firebase');
        const data = await getProducts();
        setProducts(data as Product[]);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoadingProducts(false);
      }

      // Fetch Events
      try {
        setLoadingEvents(true);
        const res = await fetch('/api/events?status=upcoming');
        if (!res.ok) throw new Error('Failed to fetch events');
        const data = await res.json();
        setEvents(data.events);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingEvents(false);
      }
    }
    fetchData();

    // Fetch Vouchers for Gamification Teaser
    async function fetchVouchers() {
      try {
        const res = await fetch('/api/admin/vouchers');
        if (res.ok) {
          const data = await res.json();
          // Get top 3 enabled vouchers
          const active = data.vouchers
            .filter((v: any) => v.enabled)
            .slice(0, 3);
          setAvailableVouchers(active);
        }
      } catch (err) {
        console.error('Failed to fetch vouchers:', err);
      }
    }
    fetchVouchers();
  }, []);

  // Fetch user wallet if logged in
  useEffect(() => {
    async function fetchWallet() {
      if (user) {
        try {
          const wallet = await getUserWallet(user.uid);
          setUserBalance(wallet.points);
        } catch (err) {
          console.error('Error fetching wallet:', err);
        }
      } else {
        setUserBalance(null);
      }
    }
    fetchWallet();
  }, [user]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pb-20 pt-20"
    >
      <Hero
        title={content.heroSocial?.title || content.hero?.title || undefined}
        subtitle={content.heroSocial?.subtitle || content.hero?.subtitle || undefined}
        ctaTextShops={content.heroSocial?.ctaTextShops || content.hero?.ctaTextShops || undefined}
        ctaTextJoin={content.heroSocial?.ctaTextJoin || content.hero?.ctaTextJoin || undefined}
        backgroundImage={content.heroSocial?.backgroundImage || content.hero?.backgroundImage || undefined}
      />


      {/* Section 2: Choose Your Play Style */}
      <section className="px-6 py-20 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4">Choose Your Play Style at Joy Juncture</h2>
            <p className="text-xl font-medium text-charcoal/60">Find your perfect way to play and connect with our community</p>
          </div>

          <PlayStyleSelector playStyles={content.playStyle as any} />
        </div>
      </section>

      {/* Section 3: What's Happening Now */}
      <section className="px-6 py-12 bg-gradient-to-br from-[#6C5CE7] to-[#8B7FE8] text-white">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black mb-2">What's Happening Now at Joy Juncture</h2>
            <p className="text-lg font-medium text-white/80">Stay updated with live activities and community events</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upcoming Events */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white text-black p-5 rounded-[20px] neo-border-thick neo-shadow"
            >
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-8 h-8 text-[#6C5CE7] fill-[#6C5CE7]/20" strokeWidth={2} />
                <h3 className="text-xl font-black">Upcoming Events</h3>
              </div>
              {loadingEvents ? (
                <div className="text-center py-4 font-bold">Loading...</div>
              ) : events.length > 0 ? (
                <div className="space-y-3">
                  {events.slice(0, 2).map((event) => (
                    <div key={event.id} className="border-2 border-black rounded-lg p-3 hover:bg-gray-50 transition-colors">
                      <h4 className="font-black text-base mb-1">{event.title}</h4>
                      <p className="text-xs font-bold text-black/60 mb-2">
                        {new Date(event.datetime).toLocaleDateString()} @ {event.location}
                      </p>
                      <Link href={`/events/upcoming/${event.id}`}>
                        <button className="text-[#6C5CE7] font-black text-xs hover:underline">
                          Register Now →
                        </button>
                      </Link>
                    </div>
                  ))}
                  <Link href="/events/upcoming">
                    <button className="w-full bg-[#6C5CE7] text-white font-black py-2 rounded-lg neo-border hover:bg-[#5B4CD6] transition-colors text-sm">
                      View All Events
                    </button>
                  </Link>
                </div>
              ) : (
                <p className="text-center py-4 text-black/60 font-medium text-sm">No upcoming events</p>
              )}
            </motion.div>

            {/* Active Puzzles (Dynamic) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white text-black p-5 rounded-[20px] neo-border-thick neo-shadow"
            >
              <div className="flex items-center gap-2 mb-4">
                <Puzzle className="w-8 h-8 text-[#00B894] fill-[#00B894]/20" strokeWidth={2} />
                <h3 className="text-xl font-black">Active Puzzles</h3>
              </div>
              <div className="space-y-3">
                {content.activePuzzles && content.activePuzzles.length > 0 ? (
                  content.activePuzzles.map((puzzle) => (
                    <div key={puzzle.id} className="border-2 border-black rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-black text-base">{puzzle.title}</h4>
                        {puzzle.isLive && (
                          <span className="bg-green-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full">LIVE</span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-black/60 mb-1">+{puzzle.xp} XP</p>
                      <Link href={puzzle.url}>
                        <button className="text-[#6C5CE7] font-black text-xs hover:underline">
                          Play Now →
                        </button>
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-black/60 font-medium text-sm">
                    More puzzles coming soon!
                  </div>
                )}

                <Link href="/play">
                  <button className="w-full bg-[#FFD93D] text-black font-black py-2 rounded-lg neo-border hover:bg-[#FFE066] transition-colors text-sm">
                    All Games
                  </button>
                </Link>
              </div>
            </motion.div>

            {/* New Games & Experiences */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#6C5CE7] text-white p-5 rounded-[20px] neo-border-thick neo-shadow-lg relative overflow-hidden group"
            >
              <div className="absolute -left-8 -bottom-8 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                <Sparkles size={150} strokeWidth={1} />
              </div>

              <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="w-10 h-10 bg-white rounded-xl neo-border flex items-center justify-center text-lg shadow-[3px_3px_0px_#000]">
                  <Package className="w-6 h-6 text-[#6C5CE7] fill-[#6C5CE7]/20" strokeWidth={2} />
                </div>
                <h3 className="text-2xl font-header font-black tracking-tighter uppercase">Recent Stock</h3>
              </div>

              {loadingProducts ? (
                <div className="text-center py-4 font-black tracking-widest animate-pulse uppercase text-xs">Synchronizing Catalog...</div>
              ) : products.length > 0 ? (
                <div className="space-y-3 relative z-10">
                  {products.slice(0, 2).map((product) => (
                    <div key={product.id} className="bg-white/10 neo-border-thick rounded-xl p-3 hover:bg-white hover:text-black transition-all group/item flex items-center justify-between cursor-pointer">
                      <div>
                        <h4 className="font-header text-base md:text-lg font-black uppercase tracking-tight mb-0.5">{product.name}</h4>
                        <p className="text-xs font-black opacity-60 italic group-hover/item:opacity-40 transition-opacity">Asset Valuation: ₹{product.price}</p>
                      </div>
                      <Link href={`/shop/${product.id}`}>
                        <button className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center group-hover/item:bg-black group-hover/item:text-white transition-all neo-border">
                          <Plus size={16} strokeWidth={4} />
                        </button>
                      </Link>
                    </div>
                  ))}
                  <Link href="/shop" className="block pt-2">
                    <button className="w-full bg-white text-black font-black py-3 rounded-xl neo-border-thick neo-shadow text-xs tracking-[0.2em] uppercase hover:bg-black hover:text-white transition-all">
                      Browse Full Catalog
                    </button>
                  </Link>
                </div>
              ) : (
                <p className="text-center py-4 text-white/40 font-black uppercase tracking-widest italic text-xs">Inventory currently undergoing audit...</p>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 4: Proof of Joy */}
      <section className="px-6 py-10 bg-[#FFD93D] overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-black/10" />
        <div className="container mx-auto">
          {/* Replaced with standardized ProofOfJoyGrid to sync content across site */}
          <ProofOfJoyGrid limit={3} />
        </div>
      </section>

      {/* Section 5: Gamification Teaser */}
      {/* Section 5: Gamification Teaser */}
      <section className="px-6 py-12 md:py-20 bg-black text-[#FFFDF5] overflow-hidden relative">
        <div className="absolute top-0 right-0 w-full h-[1px] bg-white/10" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#FF6B6B]/10 rounded-full blur-[150px] pointer-events-none" />

        <div className="container mx-auto relative z-10">
          <div className="text-center mb-12 md:mb-16 max-w-4xl mx-auto">
            <div className="text-[#00B894] font-black text-xs tracking-[0.3em] mb-4 uppercase font-display">Gamification Teaser</div>
            <h2 className="font-header text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.9] mb-6">
              Play. <span className="text-[#FFD93D]">Earn.</span> Redeem.
            </h2>
            <p className="text-white/60 font-medium text-lg md:text-xl max-w-2xl mx-auto">
              Every interaction within the grid generates value. Accumulate Joy Points and unlock real-world rewards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Wallet Preview */}
            <motion.div
              whileHover={{ y: -8 }}
              className="bg-[#6C5CE7] p-6 md:p-8 rounded-[32px] neo-border-thick neo-shadow-lg flex flex-col group relative overflow-hidden"
            >
              <div className="absolute -right-8 -top-8 opacity-20 rotate-[-15deg] group-hover:rotate-0 transition-transform duration-700">
                <div className="w-40 h-40 border-[20px] border-white rounded-full" />
              </div>

              <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="w-12 h-12 bg-white rounded-2xl neo-border flex items-center justify-center text-xl shadow-[4px_4px_0px_#000] text-black font-black">W</div>
                <h3 className="text-2xl font-header font-black tracking-tight uppercase text-white">Your Wallet</h3>
              </div>

              <div className="space-y-4 mb-6 relative z-10">
                <div className="bg-white neo-border-thick rounded-2xl p-4 md:p-6">
                  <p className="text-[10px] sm:text-xs font-black text-black/40 mb-1 uppercase tracking-widest">Available Balance</p>
                  <p className="text-4xl md:text-5xl font-header font-black text-black tracking-tighter leading-none">
                    {userBalance !== null
                      ? `${userBalance.toLocaleString()}`
                      : (content?.gamification?.sampleBalance ? `${content.gamification.sampleBalance.toLocaleString()}` : '0')}
                    <span className="text-lg md:text-xl ml-2 opacity-40">JP</span>
                  </p>
                </div>

                <div className="bg-white neo-border-thick rounded-2xl p-4 md:p-6">
                  <p className="text-[10px] sm:text-xs font-black text-black/40 mb-1 uppercase tracking-widest">Experience</p>
                  <p className="text-2xl md:text-3xl font-header font-black text-black/60 tracking-tighter leading-none">
                    {user ? xp.toLocaleString() : '0'}
                    <span className="text-sm md:text-base ml-1 opacity-60">XP</span>
                  </p>
                </div>
              </div>

              <div className="space-y-3 relative z-10 mt-auto">
                <p className="text-white/80 font-bold text-sm">
                  {user ? "You're earning points!" : "Join now to start earning."}
                </p>
                <Link href="/wallet" className="block">
                  <button className="w-full bg-white text-[#6C5CE7] font-black py-4 rounded-xl neo-border-thick neo-shadow text-sm tracking-wider uppercase hover:bg-black hover:text-white transition-all">
                    Access Wallet
                  </button>
                </Link>
              </div>
            </motion.div>

            {/* Yield Streams (Dynamic) */}
            <motion.div
              whileHover={{ y: -8 }}
              className="bg-[#FFD93D] text-black p-6 md:p-8 rounded-[32px] neo-border-thick neo-shadow-lg flex flex-col group relative overflow-hidden"
            >
              <div className="absolute -left-10 -bottom-10 opacity-10 rotate-[25deg] group-hover:rotate-0 transition-transform duration-700">
                <Flame size={180} strokeWidth={1.5} />
              </div>

              <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="w-12 h-12 bg-black text-white rounded-2xl neo-border flex items-center justify-center text-xl shadow-[4px_4px_0px_#FFFDF5]">⚡</div>
                <h3 className="text-2xl font-header font-black tracking-tight uppercase">Ways to Earn</h3>
              </div>

              <div className="space-y-3 mb-6 relative z-10">
                <div className="bg-white/80 neo-border-thick rounded-xl p-4 flex justify-between items-center group/item hover:bg-white transition-colors">
                  <span className="font-header font-black text-sm md:text-base uppercase tracking-tight">Daily Sudoku</span>
                  <span className="font-black text-xs md:text-sm bg-[#00B894] text-white px-3 py-1 rounded-lg neo-border shadow-[2px_2px_0px_#000]">Up to {rewardsConfig?.SUDOKU?.HARD || 100} JP</span>
                </div>
                <div className="bg-white/80 neo-border-thick rounded-xl p-4 flex justify-between items-center group/item hover:bg-white transition-colors">
                  <span className="font-header font-black text-sm md:text-base uppercase tracking-tight">Daily Riddle</span>
                  <span className="font-black text-xs md:text-sm bg-[#00B894] text-white px-3 py-1 rounded-lg neo-border shadow-[2px_2px_0px_#000]">{rewardsConfig?.RIDDLE?.SOLVE || 20} JP</span>
                </div>
                <div className="bg-white/80 neo-border-thick rounded-xl p-4 flex justify-between items-center group/item hover:bg-white transition-colors">
                  <span className="font-header font-black text-sm md:text-base uppercase tracking-tight">Shop Purchase</span>
                  <span className="font-black text-xs md:text-sm bg-[#00B894] text-white px-3 py-1 rounded-lg neo-border shadow-[2px_2px_0px_#000]">10% Back</span>
                </div>
              </div>

              <Link href="/progress" className="mt-auto relative z-10">
                <button className="w-full bg-black text-[#FFD93D] font-black py-4 rounded-xl neo-border-thick neo-shadow text-sm tracking-wider uppercase hover:bg-[#6C5CE7] hover:text-white transition-all">
                  Track Progress
                </button>
              </Link>
            </motion.div>

            {/* Asset Rewards (Dynamic Vouchers) */}
            <motion.div
              whileHover={{ y: -8 }}
              className="bg-[#FF7675] p-6 md:p-8 rounded-[32px] neo-border-thick neo-shadow-lg flex flex-col group relative overflow-hidden"
            >
              <div className="absolute -right-8 -bottom-8 opacity-10 rotate-12 transition-transform duration-1000">
                <Sparkles size={180} strokeWidth={1.5} />
              </div>

              <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="w-12 h-12 bg-white rounded-2xl neo-border flex items-center justify-center text-xl shadow-[4px_4px_0px_#000] text-black font-black">R</div>
                <h3 className="text-2xl font-header font-black tracking-tight uppercase text-white">Redeem Rewards</h3>
              </div>

              <div className="space-y-3 mb-6 relative z-10">
                {/* Dynamically Map Available Vouchers */}
                {/* Dynamically Map Available Vouchers */}
                {availableVouchers.length > 0 ? (
                  availableVouchers.map((voucher, i) => (
                    <div key={i} className="bg-white/10 neo-border-thick rounded-xl p-4 group/item hover:bg-white hover:text-black transition-all border-dashed border-white/30 flex justify-between items-center cursor-pointer">
                      <div>
                        <p className="font-header font-black text-sm md:text-base text-white group-hover:text-black tracking-tight mb-0.5">{voucher.name}</p>
                        <p className="font-bold text-[10px] text-white/60 group-hover:text-black/60 uppercase tracking-widest">{voucher.description?.slice(0, 20)}...</p>
                      </div>
                      <div className="font-black text-sm text-white group-hover:text-black bg-white/20 group-hover:bg-white px-2 py-1 rounded">
                        {voucher.pointsCost} JP
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-white/30 font-black uppercase tracking-[0.2em] italic text-xs">
                    More rewards coming soon...
                  </div>
                )}
              </div>
              <Link href="/rewards" className="mt-auto relative z-10">
                <button className="w-full bg-[#FFFDF5] text-[#FF7675] font-black py-4 rounded-xl neo-border-thick neo-shadow text-sm tracking-wider uppercase hover:bg-black hover:text-white transition-all">
                  Visit Rewards Store
                </button>
              </Link>
            </motion.div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-20 md:mt-32 relative z-10">
            <Link href={user ? '/play' : '/auth/signup'}>
              <motion.button
                whileHover={{ scale: 1.05, rotate: -1 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#00B894] text-black px-10 py-5 md:px-20 md:py-8 rounded-[24px] md:rounded-[40px] font-header font-black text-3xl md:text-6xl uppercase tracking-tighter neo-border-thick neo-shadow-lg hover:bg-white transition-all group"
              >
                {user ? (
                  <span>Start <span className="text-white group-hover:text-[#6C5CE7] transition-colors">Playing</span></span>
                ) : (
                  <span>Join The <span className="text-white group-hover:text-[#6C5CE7] transition-colors">Grid</span></span>
                )}
              </motion.button>
            </Link>
            {!user && (
              <p className="mt-6 text-white/30 font-black text-xs uppercase tracking-[0.3em]">* 500 Bonus JP on Signup</p>
            )}
          </div>
        </div>
      </section>

      {/* Footer / Bottom Spacing adjustments if needed */}
    </motion.div>
  );
}
