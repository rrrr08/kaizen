'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sparkles, Plus, Flame, ChevronRight } from 'lucide-react';
// Hero is replaced by ContextAwareLayout
// import Hero from '@/components/ui/Hero';
import GameDiscoveryCarousel from '@/components/ui/GameDiscoveryCarousel';
import SocialPulseTicker from '@/components/home/SocialPulseTicker';
import ContextAwareLayout from '@/components/home/ContextAwareLayout';
import DailyDropCard from '@/components/home/DailyDropCard';
import GameRow from '@/components/home/GameRow';
import ProductCard from '@/components/ui/ProductCard';
import { Product } from '@/lib/types';
import { GameEvent } from '@/lib/types';
import { useAuth } from '@/app/context/AuthContext';

import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db, getUserWallet } from '@/lib/firebase';

// Product interface is already imported from @/lib/types

interface Testimonial {
  image?: string;
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  status: 'pending' | 'approved' | 'rejected';
}


interface PuzzleItem {
  id: string;
  title: string;
  xp: number;
  url: string;
  isLive: boolean;
  description?: string;
}

interface HomepageContent {
  hero: {
    title: string;
    subtitle: string;
    ctaTextShops: string;
    ctaTextJoin: string;
    backgroundImage: string;
  };
  playStyle?: {
    playAtHome: { title: string; description: string; emoji: string; };
    playTogether: { title: string; description: string; emoji: string; };
    playOccasions: { title: string; description: string; emoji: string; };
    playEarn: { title: string; description: string; emoji: string; };
  };
  proofOfJoy?: {
    photos?: Array<{ title: string; subtitle: string; emoji: string; }>;
    testimonials?: Array<{ title: string; subtitle: string; emoji: string; }>;
  };
  gamification?: {
    sampleBalance: number;
    activities: Array<{ name: string; xp: number; }>;
    rewards: Array<{ xp: number; reward: string; }>;
  };
  activePuzzles?: PuzzleItem[];
}

export default function Home() {
  const { user } = useAuth();
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [content, setContent] = useState<HomepageContent | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);
  const [userBalance, setUserBalance] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      // Fetch Page Content
      try {
        const docRef = doc(db, 'content', 'homepage');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setContent(docSnap.data() as HomepageContent);
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

      // Fetch Testimonials
      try {
        setLoadingTestimonials(true);
        const testimonialsRef = collection(db, 'testimonials');
        const snapshot = await getDocs(testimonialsRef);
        const testimonialsList = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as any))
          .filter(t => t.status === 'approved')
          .slice(0, 6); // Get 6 testimonials: 3 with photos for gallery, 3 for testimonial cards
        setTestimonials(testimonialsList);
      } catch (err) {
        console.error('Error fetching testimonials:', err);
      } finally {
        setLoadingTestimonials(false);
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
      <SocialPulseTicker />

      <div className="container mx-auto px-6 mt-8">
        <ContextAwareLayout />

        {/* Daily Drop & Active Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          <div className="lg:col-span-1">
            <DailyDropCard />
          </div>
          <div className="lg:col-span-2">
            <GameRow
              title="Jump Back In"
              items={[
                { title: "Chess", category: "Strategy", color: "bg-[#0984e3]" },
                { title: "2048", category: "Puzzle", color: "bg-[#00b894]" },
                { title: "Sudoku", category: "Brain", color: "bg-[#e17055]" }
              ]}
            />
          </div>
        </div>
      </div>

      {/* Section 2: Choose Your Play Style */}


      {/* Section 2: Choose Your Play Style */}
      <section className="px-6 py-20 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4">Choose Your Play Style</h2>
            <p className="text-xl font-medium text-charcoal/60">Find your perfect way to play</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Play at Home Card */}
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-gradient-to-br from-[#6C5CE7] to-[#8B7FE8] text-white p-8 rounded-[24px] neo-border-thick neo-shadow cursor-pointer"
            >
              <div className="text-5xl mb-4">{content?.playStyle?.playAtHome?.emoji || '🏠'}</div>
              <h3 className="text-2xl font-black mb-3">{content?.playStyle?.playAtHome?.title || 'Play at Home'}</h3>
              <p className="text-white/90 font-medium mb-6">
                {content?.playStyle?.playAtHome?.description || 'Shop premium board games and puzzles for your home collection'}
              </p>
              <Link href="/shop">
                <button className="w-full bg-white text-[#6C5CE7] font-black py-3 rounded-xl neo-border hover:bg-gray-50 transition-colors">
                  Browse Shop
                </button>
              </Link>
            </motion.div>

            {/* Play Together (Live) Card */}
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-gradient-to-br from-[#FF6B6B] to-[#FF8E8E] text-white p-8 rounded-[24px] neo-border-thick neo-shadow cursor-pointer"
            >
              <div className="text-5xl mb-4">{content?.playStyle?.playTogether?.emoji || '👥'}</div>
              <h3 className="text-2xl font-black mb-3">{content?.playStyle?.playTogether?.title || 'Play Together'}</h3>
              <p className="text-white/90 font-medium mb-6">
                {content?.playStyle?.playTogether?.description || 'Join live game nights and community events in your city'}
              </p>
              <Link href="/events">
                <button className="w-full bg-white text-[#FF6B6B] font-black py-3 rounded-xl neo-border hover:bg-gray-50 transition-colors">
                  View Events
                </button>
              </Link>
            </motion.div>

            {/* Play for Occasions Card */}
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-gradient-to-br from-[#FFD93D] to-[#FFE066] text-black p-8 rounded-[24px] neo-border-thick neo-shadow cursor-pointer"
            >
              <div className="text-5xl mb-4">{content?.playStyle?.playOccasions?.emoji || '🎉'}</div>
              <h3 className="text-2xl font-black mb-3">{content?.playStyle?.playOccasions?.title || 'Play for Occasions'}</h3>
              <p className="text-black/80 font-medium mb-6">
                {content?.playStyle?.playOccasions?.description || 'Book custom game experiences for weddings, parties & corporate events'}
              </p>
              <Link href="/experiences">
                <button className="w-full bg-black text-[#FFD93D] font-black py-3 rounded-xl neo-border hover:bg-gray-900 transition-colors">
                  Explore Experiences
                </button>
              </Link>
            </motion.div>

            {/* Play & Earn Points Card */}
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-gradient-to-br from-[#00D9A3] to-[#00F5B8] text-black p-8 rounded-[24px] neo-border-thick neo-shadow cursor-pointer"
            >
              <div className="text-5xl mb-4">{content?.playStyle?.playEarn?.emoji || '🎮'}</div>
              <h3 className="text-2xl font-black mb-3">{content?.playStyle?.playEarn?.title || 'Play & Earn Points'}</h3>
              <p className="text-black/80 font-medium mb-6">
                {content?.playStyle?.playEarn?.description || 'Play free puzzles daily and earn rewards you can redeem'}
              </p>
              <Link href="/play">
                <button className="w-full bg-black text-[#00D9A3] font-black py-3 rounded-xl neo-border hover:bg-gray-900 transition-colors">
                  Play Now Free
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 3: What's Happening Now */}
      <section className="px-6 py-20 bg-gradient-to-br from-[#6C5CE7] to-[#8B7FE8] text-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4">What's Happening Now</h2>
            <p className="text-xl font-medium text-white/80">Stay updated with live activities</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upcoming Events */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white text-black p-8 rounded-[24px] neo-border-thick neo-shadow"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">📅</span>
                <h3 className="text-2xl font-black">Upcoming Events</h3>
              </div>
              {loadingEvents ? (
                <div className="text-center py-8 font-bold">Loading...</div>
              ) : events.length > 0 ? (
                <div className="space-y-4">
                  {events.slice(0, 2).map((event) => (
                    <div key={event.id} className="border-2 border-black rounded-xl p-4 hover:bg-gray-50 transition-colors">
                      <h4 className="font-black text-lg mb-1">{event.title}</h4>
                      <p className="text-sm font-bold text-black/60 mb-2">
                        {new Date(event.datetime).toLocaleDateString()} @ {event.location}
                      </p>
                      <Link href={`/events/${event.id}`}>
                        <button className="text-[#6C5CE7] font-black text-sm hover:underline">
                          Register Now →
                        </button>
                      </Link>
                    </div>
                  ))}
                  <Link href="/events">
                    <button className="w-full bg-[#6C5CE7] text-white font-black py-3 rounded-xl neo-border hover:bg-[#5B4CD6] transition-colors">
                      View All Events
                    </button>
                  </Link>
                </div>
              ) : (
                <p className="text-center py-8 text-black/60 font-medium">No upcoming events</p>
              )}
            </motion.div>

            {/* Active Puzzles (Dynamic) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white text-black p-8 rounded-[24px] neo-border-thick neo-shadow"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">🧩</span>
                <h3 className="text-2xl font-black">Active Puzzles</h3>
              </div>
              <div className="space-y-4">
                {content?.activePuzzles && content.activePuzzles.length > 0 ? (
                  content.activePuzzles.map((puzzle) => (
                    <div key={puzzle.id} className="border-2 border-black rounded-xl p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-black text-lg">{puzzle.title}</h4>
                        {puzzle.isLive && (
                          <span className="bg-green-400 text-black text-xs font-black px-3 py-1 rounded-full">LIVE</span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-black/60 mb-2">+{puzzle.xp} XP</p>
                      <Link href={puzzle.url}>
                        <button className="text-[#6C5CE7] font-black text-sm hover:underline">
                          Play Now →
                        </button>
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-black/60 font-medium">
                    More puzzles coming soon!
                  </div>
                )}

                <Link href="/play">
                  <button className="w-full bg-[#FFD93D] text-black font-black py-3 rounded-xl neo-border hover:bg-[#FFE066] transition-colors">
                    All Games
                  </button>
                </Link>
              </div>
            </motion.div>

            {/* New Games & Experiences */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#6C5CE7] text-white p-10 md:p-14 rounded-[50px] neo-border-thick neo-shadow-lg relative overflow-hidden group"
            >
              <div className="absolute -left-8 -bottom-8 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                <Sparkles size={200} strokeWidth={1} />
              </div>

              <div className="flex items-center gap-4 mb-10 relative z-10">
                <div className="w-14 h-14 bg-black rounded-2xl neo-border flex items-center justify-center text-2xl shadow-[4px_4px_0px_#FFFDF5]">📦</div>
                <h3 className="text-3xl md:text-4xl font-header font-black tracking-tighter uppercase">Recent Stock</h3>
              </div>

              {loadingProducts ? (
                <div className="text-center py-10 font-black tracking-widest animate-pulse uppercase">Synchronizing Catalog...</div>
              ) : products.length > 0 ? (
                <div className="space-y-6 relative z-10">
                  {products.slice(0, 2).map((product) => (
                    <div key={product.id} className="bg-white/10 neo-border-thick rounded-2xl p-6 hover:bg-white hover:text-black transition-all group/item flex items-center justify-between cursor-pointer">
                      <div>
                        <h4 className="font-header text-xl md:text-2xl font-black uppercase tracking-tight mb-1">{product.name}</h4>
                        <p className="text-sm font-black opacity-60 italic group-hover/item:opacity-40 transition-opacity">Asset Valuation: ₹{product.price}</p>
                      </div>
                      <Link href={`/shop/${product.id}`}>
                        <button className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center group-hover/item:bg-black group-hover/item:text-white transition-all neo-border">
                          <Plus size={24} strokeWidth={4} />
                        </button>
                      </Link>
                    </div>
                  ))}
                  <Link href="/shop" className="block pt-4">
                    <button className="w-full bg-white text-black font-black py-5 rounded-2xl neo-border-thick neo-shadow text-sm tracking-[0.2em] uppercase hover:bg-black hover:text-white transition-all">
                      Browse Full Catalog
                    </button>
                  </Link>
                </div>
              ) : (
                <p className="text-center py-10 text-white/40 font-black uppercase tracking-widest italic">Inventory currently undergoing audit...</p>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 4: Proof of Joy */}
      <section className="px-6 py-32 bg-[#FFD93D] overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-black/10" />
        <div className="container mx-auto">
          {/* Section Header */}
          <div className="text-center mb-24 max-w-4xl mx-auto">
            <div className="text-black font-black text-[10px] md:text-xs tracking-[0.4em] mb-4 uppercase font-display italic">Consensus Metadata</div>
            <h2 className="font-header text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9]">Proof of <br /><span className="italic font-serif text-[#6C5CE7] drop-shadow-[2px_2px_0px_#000]">Joy</span></h2>
            <p className="text-black/60 font-medium text-lg md:text-xl mt-8 italic">Verified testimonials from authenticated entities within the Joy Juncture ecosystem.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-20">
            {loadingTestimonials ? (
              <div className="col-span-3 text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent mb-6"></div>
                <p className="font-black text-xs tracking-[0.4em] uppercase">COLLECTING ENTITY FEEDBACK...</p>
              </div>
            ) : (() => {
              const photosFromTestimonials = testimonials.filter(t => t.image).slice(0, 3);
              return photosFromTestimonials.length > 0 ? (
                photosFromTestimonials.map((testimonial, i) => {
                  return (
                    <motion.div
                      key={testimonial.id}
                      whileHover={{ scale: 1.02, rotate: i % 2 === 0 ? 1 : -1 }}
                      className="relative overflow-hidden rounded-[40px] neo-border-thick neo-shadow-lg bg-white aspect-[4/5] group"
                    >
                      <Image
                        src={testimonial.image!}
                        alt={testimonial.name}
                        fill
                        className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-black text-white p-8 translate-y-full group-hover:translate-y-0 transition-transform duration-500 neo-border-thick flex flex-col items-center">
                        <h4 className="text-2xl font-header font-black tracking-tighter uppercase mb-2">{testimonial.name}</h4>
                        <p className="font-black text-[10px] tracking-widest uppercase opacity-60 italic">{testimonial.role}</p>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="col-span-3 text-center py-20 bg-white/40 neo-border-thick rounded-[40px] px-12">
                  <p className="text-2xl md:text-3xl font-header font-black uppercase tracking-tighter text-black/20">Archive scanning in progress... metadata unavailable.</p>
                </div>
              );
            })()}
          </div>

          {/* Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loadingTestimonials ? (
              <div className="col-span-3 text-center py-10 font-bold">Synchronizing Entity Voice Box...</div>
            ) : (
              testimonials.slice(0, 3).map((testimonial, i) => {
                const colors = ['bg-white', 'bg-white', 'bg-white'];

                return (
                  <motion.div
                    key={testimonial.id}
                    whileHover={{ y: -8 }}
                    className={`${colors[i % colors.length]} p-10 rounded-[35px] neo-border-thick neo-shadow-lg relative overflow-hidden group h-full flex flex-col`}
                  >
                    <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                      <Sparkles size={120} strokeWidth={1} />
                    </div>

                    <div className="flex gap-2 mb-8 items-center bg-[#F7F7F7] w-fit px-4 py-2 rounded-xl neo-border italic">
                      {[...Array(testimonial.rating || 5)].map((_, idx) => (
                        <span key={idx} className="text-black text-xs font-black">★</span>
                      ))}
                      <span className="text-[10px] font-black uppercase tracking-widest ml-2">Verified</span>
                    </div>

                    <p className="font-header text-xl md:text-2xl font-black text-black mb-10 leading-tight italic flex-grow">
                      &quot;{testimonial.quote}&quot;
                    </p>

                    <div className="flex items-center gap-4 pt-6 border-t-2 border-black/5 mt-auto">
                      <div className="w-14 h-14 rounded-2xl neo-border bg-black text-[#FFD93D] flex items-center justify-center font-header text-2xl font-black shadow-[4px_4px_0px_#FFD93D]">
                        {testimonial.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-header text-xl font-black uppercase tracking-tighter leading-none mb-1">{testimonial.name}</p>
                        <p className="text-[10px] text-black/40 font-black uppercase tracking-[0.2em]">{testimonial.role}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Section 5: Gamification Teaser */}
      <section className="px-6 py-32 bg-black text-[#FFFDF5] overflow-hidden relative">
        <div className="absolute top-0 right-0 w-full h-[1px] bg-white/10" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#FF6B6B]/10 rounded-full blur-[150px] pointer-events-none" />

        <div className="container mx-auto relative z-10">
          <div className="text-center mb-24 max-w-4xl mx-auto">
            <div className="text-[#00B894] font-black text-[10px] md:text-xs tracking-[0.4em] mb-4 uppercase font-display">Economic Protocol</div>
            <h2 className="font-header text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9]">Play <br /> <span className="italic font-serif text-[#FFD93D]">Earn</span> <br /> Redeem</h2>
            <p className="text-white/40 font-medium text-lg md:text-xl mt-8 italic">Every interaction within the grid generates value. Accumulate assets, unlock experiences.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Wallet Preview */}
            <motion.div
              whileHover={{ y: -10 }}
              className="bg-[#6C5CE7] p-10 rounded-[50px] neo-border-thick neo-shadow-lg flex flex-col group relative overflow-hidden"
            >
              <div className="absolute -right-8 -top-8 opacity-20 rotate-[-15deg] group-hover:rotate-0 transition-transform duration-700">
                <div className="w-40 h-40 border-[20px] border-white rounded-full" />
              </div>

              <div className="flex items-center gap-4 mb-10 relative z-10">
                <div className="w-14 h-14 bg-white rounded-2xl neo-border flex items-center justify-center text-2xl shadow-[4px_4px_0px_#000] text-black italic">W</div>
                <h3 className="text-3xl font-header font-black tracking-tighter uppercase text-white">Grid Wallet</h3>
              </div>

              <div className="bg-white neo-border-thick rounded-2xl p-8 mb-8 relative z-10">
                <p className="text-[10px] font-black text-black/30 mb-4 uppercase tracking-[0.2em] italic">Consolidated XP Balance</p>
                <p className="text-5xl font-header font-black text-black tracking-tighter leading-none">
                  {userBalance !== null
                    ? `${userBalance.toLocaleString()}`
                    : (content?.gamification?.sampleBalance ? `${content.gamification.sampleBalance.toLocaleString()}` : '0')}
                  <span className="text-lg ml-2 opacity-40">Credits</span>
                </p>
              </div>

              <Link href="/wallet" className="mt-auto relative z-10">
                <button className="w-full bg-white text-[#6C5CE7] font-black py-5 rounded-2xl neo-border-thick neo-shadow text-sm tracking-[0.2em] uppercase hover:bg-black hover:text-white transition-all">
                  Access Wallet
                </button>
              </Link>
            </motion.div>

            {/* Sample Points Earned */}
            <motion.div
              whileHover={{ y: -10 }}
              className="bg-[#FFD93D] text-black p-10 rounded-[50px] neo-border-thick neo-shadow-lg flex flex-col group relative overflow-hidden"
            >
              <div className="absolute -left-10 -bottom-10 opacity-10 rotate-[25deg] group-hover:rotate-0 transition-transform duration-700">
                <Flame size={200} strokeWidth={1} />
              </div>

              <div className="flex items-center gap-4 mb-10 relative z-10">
                <div className="w-14 h-14 bg-black text-white rounded-2xl neo-border flex items-center justify-center text-2xl shadow-[4px_4px_0px_#FFFDF5]">⚡</div>
                <h3 className="text-3xl font-header font-black tracking-tighter uppercase">Yield Streams</h3>
              </div>

              <div className="space-y-4 mb-10 relative z-10">
                {content?.gamification?.activities && content.gamification.activities.length > 0 ? (
                  content.gamification.activities.map((activity, i) => (
                    <div key={i} className="bg-white/80 neo-border-thick rounded-xl p-5 flex justify-between items-center group/item hover:bg-white transition-colors">
                      <span className="font-header font-black text-lg uppercase tracking-tight">{activity.name}</span>
                      <span className="font-black text-lg bg-[#00B894] text-white px-3 py-1 rounded-lg neo-border shadow-[2px_2px_0px_#000]">+{activity.xp}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-black/30 font-black uppercase tracking-[0.2em] italic">
                    Discovery protocol active...
                  </div>
                )}
              </div>

              <Link href="/progress" className="mt-auto relative z-10">
                <button className="w-full bg-black text-[#FFD93D] font-black py-5 rounded-2xl neo-border-thick neo-shadow text-sm tracking-[0.2em] uppercase hover:bg-[#6C5CE7] hover:text-white transition-all">
                  Track Yield
                </button>
              </Link>
            </motion.div>

            {/* Rewards Explanation */}
            <motion.div
              whileHover={{ y: -10 }}
              className="bg-[#FF7675] p-10 rounded-[50px] neo-border-thick neo-shadow-lg flex flex-col group relative overflow-hidden"
            >
              <div className="absolute -right-8 -bottom-8 opacity-10 rotate-12 transition-transform duration-1000">
                <Sparkles size={200} strokeWidth={1} />
              </div>

              <div className="flex items-center gap-4 mb-10 relative z-10">
                <div className="w-14 h-14 bg-white rounded-2xl neo-border flex items-center justify-center text-2xl shadow-[4px_4px_0px_#000] text-black italic">R</div>
                <h3 className="text-3xl font-header font-black tracking-tighter uppercase text-white">Asset Rewards</h3>
              </div>

              <div className="space-y-4 mb-10 relative z-10">
                {content?.gamification?.rewards && content.gamification.rewards.length > 0 ? (
                  content.gamification.rewards.map((reward, i) => (
                    <div key={i} className="bg-white/10 neo-border-thick rounded-xl p-5 group/item hover:bg-white/20 transition-all border-dashed border-white/20">
                      <p className="font-header font-black text-2xl text-white tracking-tighter leading-none mb-2 italic">{reward.xp} Credits</p>
                      <p className="font-medium text-xs text-white/60 uppercase tracking-widest">{reward.reward}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-white/30 font-black uppercase tracking-[0.2em] italic">
                    Asset pool refreshing...
                  </div>
                )}
              </div>
              <Link href="/rewards" className="mt-auto relative z-10">
                <button className="w-full bg-[#FFFDF5] text-[#FF7675] font-black py-5 rounded-2xl neo-border-thick neo-shadow text-sm tracking-[0.2em] uppercase hover:bg-black hover:text-white transition-all">
                  Browse Catalog
                </button>
              </Link>
            </motion.div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-32 relative z-10">
            <Link href="/auth/signup">
              <motion.button
                whileHover={{ scale: 1.05, rotate: -1 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#00B894] text-black px-16 py-8 rounded-[30px] font-header font-black text-3xl md:text-5xl uppercase tracking-tighter neo-border-thick neo-shadow-lg hover:bg-white transition-all group"
              >
                Inaugurate <span className="group-hover:text-[#6C5CE7] transition-colors">Vessel</span>
              </motion.button>
            </Link>
            <p className="mt-8 text-white/20 font-black text-[10px] uppercase tracking-[0.4em] italic">*Membership initiation protocol required for credits</p>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
