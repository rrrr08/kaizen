'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Plus, Flame, ChevronRight } from 'lucide-react';
// import ContextAwareLayout from '@/components/home/ContextAwareLayout';
// import DailyDropCard from '@/components/home/DailyDropCard';
// import GameDiscoveryCarousel from '@/components/ui/GameDiscoveryCarousel';
// import ArcadeHero from '@/components/home/ArcadeHero';
// import EventHero from '@/components/home/EventHero';
import Hero from '@/components/home/Hero';
import { Product, GameEvent, HomepageContent } from '@/lib/types';
import { useAuth } from '@/app/context/AuthContext';
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
            <h2 className="text-3xl md:text-5xl font-black mb-4">Choose Your Play Style</h2>
            <p className="text-xl font-medium text-charcoal/60">Find your perfect way to play</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {content.playStyle && Object.values(content.playStyle).map((style, idx) => {
              const colors = [
                'from-[#6C5CE7] to-[#8B7FE8]',
                'from-[#FF6B6B] to-[#FF8E8E]',
                'from-[#FFD93D] to-[#FFE066]',
                'from-[#00D9A3] to-[#00F5B8]'
              ];
              const textColors = [
                'text-white',
                'text-white',
                'text-black',
                'text-black'
              ];
              const btnColors = [
                'text-[#6C5CE7]',
                'text-[#FF6B6B]',
                'text-black',
                'text-[#00D9A3]'
              ];
              const links = ['/shop', '/events', '/experiences', '/play'];
              const linkTexts = ['Browse Shop', 'View Events', 'Explore Experiences', 'Play Now Free'];

              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className={`bg-gradient-to-br ${colors[idx % 4]} ${textColors[idx % 4]} p-8 rounded-[24px] neo-border-thick neo-shadow cursor-pointer`}
                >
                  <div className="text-5xl mb-4">{style.emoji}</div>
                  <h3 className="text-2xl font-black mb-3">{style.title}</h3>
                  <p className={`font-medium mb-6 opacity-90`}>
                    {style.description}
                  </p>
                  <Link href={links[idx % 4]}>
                    <button className={`w-full bg-white ${btnColors[idx % 4]} font-black py-3 rounded-xl neo-border hover:bg-gray-50 transition-colors`}>
                      {linkTexts[idx % 4]}
                    </button>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 3: What's Happening Now */}
      <section className="px-6 py-12 bg-gradient-to-br from-[#6C5CE7] to-[#8B7FE8] text-white">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black mb-2">What's Happening Now</h2>
            <p className="text-lg font-medium text-white/80">Stay updated with live activities</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upcoming Events */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white text-black p-5 rounded-[20px] neo-border-thick neo-shadow"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📅</span>
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
                      <Link href={`/events/${event.id}`}>
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
                <span className="text-2xl">🧩</span>
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
                <div className="w-10 h-10 bg-black rounded-xl neo-border flex items-center justify-center text-lg shadow-[2px_2px_0px_#FFFDF5]">📦</div>
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
      <section className="px-6 py-12 bg-black text-[#FFFDF5] overflow-hidden relative">
        <div className="absolute top-0 right-0 w-full h-[1px] bg-white/10" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#FF6B6B]/10 rounded-full blur-[150px] pointer-events-none" />

        <div className="container mx-auto relative z-10">
          <div className="text-center mb-8 max-w-4xl mx-auto">
            <div className="text-[#00B894] font-black text-[10px] tracking-[0.4em] mb-2 uppercase font-display">Economic Protocol</div>
            <h2 className="font-header text-3xl md:text-4xl font-black uppercase tracking-tighter leading-[0.9]">Play <br /> <span className="italic font-serif text-[#FFD93D]">Earn</span> <br /> Redeem</h2>
            <p className="text-white/40 font-medium text-base mt-4 italic">Every interaction within the grid generates value. Accumulate assets, unlock experiences.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Wallet Preview */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-[#6C5CE7] p-6 rounded-[24px] neo-border-thick neo-shadow-lg flex flex-col group relative overflow-hidden"
            >
              <div className="absolute -right-8 -top-8 opacity-20 rotate-[-15deg] group-hover:rotate-0 transition-transform duration-700">
                <div className="w-40 h-40 border-[20px] border-white rounded-full" />
              </div>

              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-10 h-10 bg-white rounded-xl neo-border flex items-center justify-center text-lg shadow-[3px_3px_0px_#000] text-black italic">W</div>
                <h3 className="text-xl font-header font-black tracking-tighter uppercase text-white">Grid Wallet</h3>
              </div>

              <div className="bg-white neo-border-thick rounded-xl p-4 mb-4 relative z-10">
                <p className="text-[10px] font-black text-black/30 mb-1 uppercase tracking-[0.2em] italic">Consolidated XP Balance</p>
                <p className="text-3xl font-header font-black text-black tracking-tighter leading-none">
                  {userBalance !== null
                    ? `${userBalance.toLocaleString()}`
                    : (content?.gamification?.sampleBalance ? `${content.gamification.sampleBalance.toLocaleString()}` : '0')}
                  <span className="text-sm ml-1 opacity-40">Credits</span>
                </p>
              </div>

              <Link href="/wallet" className="mt-auto relative z-10">
                <button className="w-full bg-white text-[#6C5CE7] font-black py-3 rounded-xl neo-border-thick neo-shadow text-xs tracking-[0.2em] uppercase hover:bg-black hover:text-white transition-all">
                  Access Wallet
                </button>
              </Link>
            </motion.div>

            {/* Sample Points Earned */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-[#FFD93D] text-black p-6 rounded-[24px] neo-border-thick neo-shadow-lg flex flex-col group relative overflow-hidden"
            >
              <div className="absolute -left-10 -bottom-10 opacity-10 rotate-[25deg] group-hover:rotate-0 transition-transform duration-700">
                <Flame size={150} strokeWidth={1} />
              </div>

              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-10 h-10 bg-black text-white rounded-xl neo-border flex items-center justify-center text-lg shadow-[3px_3px_0px_#FFFDF5]">⚡</div>
                <h3 className="text-xl font-header font-black tracking-tighter uppercase">Yield Streams</h3>
              </div>

              <div className="space-y-2 mb-4 relative z-10">
                {content?.gamification?.activities && content.gamification.activities.length > 0 ? (
                  content.gamification.activities.map((activity, i) => (
                    <div key={i} className="bg-white/80 neo-border-thick rounded-lg p-3 flex justify-between items-center group/item hover:bg-white transition-colors">
                      <span className="font-header font-black text-sm uppercase tracking-tight">{activity.name}</span>
                      <span className="font-black text-xs bg-[#00B894] text-white px-2 py-0.5 rounded neo-border shadow-[1px_1px_0px_#000]">+{activity.xp}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-black/30 font-black uppercase tracking-[0.2em] italic text-xs">
                    Discovery protocol active...
                  </div>
                )}
              </div>

              <Link href="/progress" className="mt-auto relative z-10">
                <button className="w-full bg-black text-[#FFD93D] font-black py-3 rounded-xl neo-border-thick neo-shadow text-xs tracking-[0.2em] uppercase hover:bg-[#6C5CE7] hover:text-white transition-all">
                  Track Yield
                </button>
              </Link>
            </motion.div>

            {/* Rewards Explanation */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-[#FF7675] p-6 rounded-[24px] neo-border-thick neo-shadow-lg flex flex-col group relative overflow-hidden"
            >
              <div className="absolute -right-8 -bottom-8 opacity-10 rotate-12 transition-transform duration-1000">
                <Sparkles size={150} strokeWidth={1} />
              </div>

              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-10 h-10 bg-white rounded-xl neo-border flex items-center justify-center text-lg shadow-[3px_3px_0px_#000] text-black italic">R</div>
                <h3 className="text-xl font-header font-black tracking-tighter uppercase text-white">Asset Rewards</h3>
              </div>

              <div className="space-y-2 mb-4 relative z-10">
                {content?.gamification?.rewards && content.gamification.rewards.length > 0 ? (
                  content.gamification.rewards.map((reward, i) => (
                    <div key={i} className="bg-white/10 neo-border-thick rounded-lg p-3 group/item hover:bg-white/20 transition-all border-dashed border-white/20">
                      <p className="font-header font-black text-lg text-white tracking-tighter leading-none mb-0.5 italic">{reward.xp} Credits</p>
                      <p className="font-medium text-[10px] text-white/60 uppercase tracking-widest">{reward.reward}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-white/30 font-black uppercase tracking-[0.2em] italic text-xs">
                    Asset pool refreshing...
                  </div>
                )}
              </div>
              <Link href="/rewards" className="mt-auto relative z-10">
                <button className="w-full bg-[#FFFDF5] text-[#FF7675] font-black py-3 rounded-xl neo-border-thick neo-shadow text-xs tracking-[0.2em] uppercase hover:bg-black hover:text-white transition-all">
                  Browse Catalog
                </button>
              </Link>
            </motion.div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-32 relative z-10">
            <Link href={user ? '/play' : '/auth/signup'}>
              <motion.button
                whileHover={{ scale: 1.05, rotate: -1 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#00B894] text-black px-8 py-4 md:px-16 md:py-8 rounded-[20px] md:rounded-[30px] font-header font-black text-2xl md:text-5xl uppercase tracking-tighter neo-border-thick neo-shadow-lg hover:bg-white transition-all group"
              >
                {user ? (
                  <span>Start <span className="group-hover:text-[#6C5CE7] transition-colors">Earning</span></span>
                ) : (
                  <span>Inaugurate <span className="group-hover:text-[#6C5CE7] transition-colors">Vessel</span></span>
                )}
              </motion.button>
            </Link>
            {!user && (
              <p className="mt-8 text-white/20 font-black text-[10px] uppercase tracking-[0.4em] italic">*Membership initiation protocol required for credits</p>
            )}
          </div>
        </div>
      </section>
    </motion.div>
  );
}
