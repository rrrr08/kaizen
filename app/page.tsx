'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Hero from '@/components/ui/Hero';
import GameDiscoveryCarousel from '@/components/ui/GameDiscoveryCarousel';
import ProductCard from '@/components/ui/ProductCard';
import { Product } from '@/lib/types';
import { GameEvent } from '@/lib/types';
import { useAuth } from '@/app/context/AuthContext';

import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db, getUserWallet } from '@/lib/firebase';

// Product interface is already imported from @/lib/types

interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
  approved: boolean;
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
          .map(doc => ({ id: doc.id, ...doc.data() } as Testimonial))
          .filter(t => t.approved)
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
      className="pb-20 pt-24"
    >
      {/* Section 1: Hero Section - Kept Unchanged */}
      <Hero
        backgroundImage={content?.hero.backgroundImage}
      />

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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white text-black p-8 rounded-[24px] neo-border-thick neo-shadow"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">✨</span>
                <h3 className="text-2xl font-black">New Arrivals</h3>
              </div>
              {loadingProducts ? (
                <div className="text-center py-8 font-bold">Loading...</div>
              ) : products.length > 0 ? (
                <div className="space-y-4">
                  {products.slice(0, 2).map((product) => (
                    <div key={product.id} className="border-2 border-black rounded-xl p-4 hover:bg-gray-50 transition-colors">
                      <h4 className="font-black text-lg mb-1">{product.name}</h4>
                      <p className="text-sm font-bold text-black/60 mb-2">₹{product.price}</p>
                      <Link href={`/shop/${product.id}`}>
                        <button className="text-[#6C5CE7] font-black text-sm hover:underline">
                          View Details →
                        </button>
                      </Link>
                    </div>
                  ))}
                  <Link href="/shop">
                    <button className="w-full bg-[#FF6B6B] text-white font-black py-3 rounded-xl neo-border hover:bg-[#FF5252] transition-colors">
                      Browse Shop
                    </button>
                  </Link>
                </div>
              ) : (
                <p className="text-center py-8 text-black/60 font-medium">No new games yet</p>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 4: Proof of Joy */}
      <section className="px-6 py-20 bg-[#FFD93D]">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4">Proof of Joy</h2>
            <p className="text-xl font-medium text-black/70">Real moments, real happiness</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {loadingTestimonials ? (
              <div className="col-span-3 text-center py-12">
                <p className="text-xl font-bold text-black/60">Loading gallery...</p>
              </div>
            ) : (() => {
              const photosFromTestimonials = testimonials.filter(t => t.image).slice(0, 3);
              return photosFromTestimonials.length > 0 ? (
                photosFromTestimonials.map((testimonial, i) => {
                  const gradients = [
                    'from-[#6C5CE7] to-[#8B7FE8]',
                    'from-[#FF6B6B] to-[#FF8E8E]',
                    'from-[#00D9A3] to-[#00F5B8]'
                  ];

                  return (
                    <motion.div
                      key={testimonial.id}
                      whileHover={{ scale: 1.05 }}
                      className="relative overflow-hidden rounded-[24px] neo-border-thick neo-shadow bg-white aspect-square"
                    >
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end">
                        <div className="text-white p-8 w-full">
                          <h4 className="text-2xl font-black mb-2">{testimonial.name}</h4>
                          <p className="font-medium text-white/90">{testimonial.role}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="col-span-3 text-center py-12">
                  <p className="text-xl font-bold text-black/40 italic">Moments of joy coming soon...</p>
                </div>
              );
            })()}
          </div>

          {/* Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingTestimonials ? (
              <div className="col-span-3 text-center py-8 font-bold">Loading testimonials...</div>
            ) : (
              testimonials.length > 0 ? (
                testimonials.map((testimonial, i) => {
                  const colors = ['bg-[#6C5CE7]', 'bg-[#FF6B6B]', 'bg-[#00D9A3]'];
                  const textColors = [i === 2 ? 'text-black' : 'text-white'];

                  return (
                    <motion.div
                      key={testimonial.id}
                      whileHover={{ y: -4 }}
                      className="bg-white p-6 rounded-[20px] neo-border-thick neo-shadow"
                    >
                      <div className="flex gap-1 mb-3">
                        {[...Array(testimonial.rating || 5)].map((_, idx) => (
                          <span key={idx} className="text-yellow-400 text-xl">★</span>
                        ))}
                      </div>
                      <p className="font-bold text-black/80 mb-4">
                        &quot;{testimonial.text}&quot;
                      </p>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${colors[i % colors.length]} flex items-center justify-center ${textColors[0]} font-black`}>
                          {testimonial.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black">{testimonial.name}</p>
                          <p className="text-sm text-black/60 font-medium">{testimonial.role}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="col-span-3 text-center py-8 text-black/60 font-medium">
                  No testimonials yet.
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Section 5: Gamification Teaser */}
      <section className="px-6 py-20 bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] text-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4">Play. Earn. Redeem.</h2>
            <p className="text-xl font-medium text-white/70">Your every action is rewarded</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Wallet Preview */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-[#6C5CE7] to-[#8B7FE8] p-8 rounded-[24px] neo-border-thick neo-shadow"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="text-5xl">💰</span>
                <h3 className="text-3xl font-black">Your Wallet</h3>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-4">
                <p className="text-sm font-bold text-white/70 mb-2">Total Balance</p>
                <p className="text-5xl font-black">
                  {userBalance !== null
                    ? `${userBalance.toLocaleString()} XP`
                    : (content?.gamification?.sampleBalance ? `${content.gamification.sampleBalance.toLocaleString()} XP` : '0 XP')}
                </p>
              </div>
              <Link href="/wallet">
                <button className="w-full bg-white text-[#6C5CE7] font-black py-3 rounded-xl neo-border hover:bg-gray-50 transition-colors">
                  View Wallet
                </button>
              </Link>
            </motion.div>

            {/* Sample Points Earned */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-[#FFD93D] to-[#FFE066] text-black p-8 rounded-[24px] neo-border-thick neo-shadow"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="text-5xl">⚡</span>
                <h3 className="text-3xl font-black">Earn Points</h3>
              </div>
              <div className="space-y-3 mb-6">
                {content?.gamification?.activities && content.gamification.activities.length > 0 ? (
                  content.gamification.activities.map((activity, i) => (
                    <div key={i} className="bg-black/10 rounded-xl p-4 flex justify-between items-center">
                      <span className="font-bold">{activity.name}</span>
                      <span className="font-black text-lg">+{activity.xp} XP</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-black/60 font-medium">
                    Activities will appear here
                  </div>
                )}
              </div>
              <Link href="/progress">
                <button className="w-full bg-black text-[#FFD93D] font-black py-3 rounded-xl neo-border hover:bg-gray-900 transition-colors">
                  Track Progress
                </button>
              </Link>
            </motion.div>

            {/* Rewards Explanation */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-[#FF6B6B] to-[#FF8E8E] p-8 rounded-[24px] neo-border-thick neo-shadow"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="text-5xl">🎁</span>
                <h3 className="text-3xl font-black">Redeem Rewards</h3>
              </div>
              <div className="space-y-3 mb-6">
                {content?.gamification?.rewards && content.gamification.rewards.length > 0 ? (
                  content.gamification.rewards.map((reward, i) => (
                    <div key={i} className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                      <p className="font-black text-lg mb-1">{reward.xp} XP</p>
                      <p className="font-medium text-sm text-white/90">{reward.reward}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-white/60 font-medium">
                    Rewards will appear here
                  </div>
                )}
              </div>
              <Link href="/rewards">
                <button className="w-full bg-white text-[#FF6B6B] font-black py-3 rounded-xl neo-border hover:bg-gray-50 transition-colors">
                  Browse Rewards
                </button>
              </Link>
            </motion.div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12">
            <Link href="/auth/signup">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#00D9A3] text-black px-12 py-6 rounded-2xl font-black text-2xl neo-shadow-hover"
              >
                Start Earning Now
              </motion.button>
            </Link>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
