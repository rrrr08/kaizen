'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Hero from '@/components/ui/Hero';
import BentoGrid from '@/components/ui/BentoGrid';
import ProductCard from '@/components/ui/ProductCard';
import { Product } from '@/lib/types';
import { GameEvent } from '@/lib/types';

// Dummy data for featured products
const featuredProducts: Product[] = [
  {
    id: '1',
    name: 'Catan: Starfarers',
    price: 99,
    image: 'https://images.unsplash.com/photo-1611195974226-a6a9be9dd763?auto=format&fit=crop&q=80&w=800',
    players: '3-4',
    time: '120m',
    mood: 'Strategic',
    badges: ['Staff Pick', 'Collector Edition'],
    description: 'Explore the vast galaxy in this simplified Catan variant designed for space exploration enthusiasts.',
    story: 'The year is 2700. Humanity has taken to the stars. You are the leader of a faction seeking to establish a foothold in the galaxy.',
    howToPlay: 'Roll dice to gather resources, trade with other players, and build your starships to explore new plan',
    occasion: ['Game Night', 'Strategy Session']
  },
  {
    id: '2',
    name: 'Exploding Kittens',
    price: 25,
    image: 'https://images.unsplash.com/photo-1626027063853-9d22080a97c4?auto=format&fit=crop&q=80&w=800',
    players: '2-5',
    time: '15m',
    mood: 'Chaotic Fun',
    badges: ['Bestseller', 'First-time Friendly'],
    description: 'A kitty-powered version of Russian Roulette. Players draw cards until someone draws an Exploding Kitten.',
    story: 'In a world where kittens explore grenades, only one can survive.',
    howToPlay: 'Draw cards. Don\'t explode. Use defuse cards and other actions to avoid the kittens.',
    occasion: ['Party', 'Ice Breaker']
  },
  {
    id: '3',
    name: 'Dixit',
    price: 35,
    image: 'https://images.unsplash.com/photo-1606821165181-42cb06d0ba41?auto=format&fit=crop&q=80&w=800',
    players: '3-6',
    time: '30m',
    mood: 'Creative',
    badges: ['Family Favorite'],
    description: 'An illustrated game of creative guesswork, where your imagination unlocks the tale.',
    story: 'A picture is worth a thousand words. Can you guess which picture matches the storyteller\'s phrase?',
    howToPlay: 'One player acts as the storyteller and gives a clue. Others choose a card that best matches. Vote for the correct card.',
    occasion: ['Family Night', 'Creative Workshop']
  }
];

export default function Home() {
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
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
    fetchEvents();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pb-20 pt-24"
    >
      <Hero />
      <BentoGrid />

      <section className="px-6 py-20 bg-white">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-4xl font-black mb-4">Trending Games</h2>
              <p className="text-xl font-medium text-charcoal/60">The hottest drops this week.</p>
            </div>
            <Link href="/shop">
              <button className="bg-black text-white px-8 py-4 rounded-full font-bold neo-shadow hover:translate-y-[-2px] transition-transform">
                View All Shop
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events Section using fetched data */}
      <section className="px-6 py-20 bg-[#6C5CE7] text-white">
        <div className="container mx-auto">
          <h2 className="text-4xl font-black mb-8">Upcoming Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loadingEvents ? (
              <div className="col-span-3 text-center text-xl font-bold">Loading Events...</div>
            ) : (
              events.slice(0, 3).map((event) => (
                <div key={event.id} className="bg-white text-black p-6 rounded-[20px] neo-border-thick neo-shadow">
                  <h3 className="text-2xl font-black mb-2">{event.title}</h3>
                  <p className="font-bold opacity-70 mb-4">{new Date(event.datetime).toLocaleDateString()} @ {event.location}</p>
                  <Link href={`/events/${event.id}`}>
                    <button className="w-full bg-[#FFD93D] text-black font-black py-3 rounded-xl neo-border hover:bg-yellow-400 transition-colors">
                      Join - ₹{event.price}
                    </button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="px-6 py-32 bg-[#FFD93D] overflow-hidden relative">
        <div className="absolute top-1/2 left-0 w-full whitespace-nowrap overflow-hidden pointer-events-none opacity-10">
          <div className="flex animate-marquee text-[20vw] font-black uppercase tracking-tighter">
            <span>Play Join Explore Play Join Explore</span>
          </div>
        </div>

        <div className="container mx-auto relative z-10 text-center space-y-8">
          <h2 className="text-6xl lg:text-8xl font-black">Ready to roll the dice?</h2>
          <p className="text-2xl font-bold max-w-2xl mx-auto">Join 10,000+ happy gamers in our weekly community meetups and digital tournaments.</p>
          <div className="flex justify-center gap-6">
            <Link href="/auth/signup">
              <button className="bg-black text-white px-12 py-6 rounded-2xl font-black text-2xl neo-shadow-hover">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
