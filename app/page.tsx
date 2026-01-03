'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Hero from '@/components/ui/Hero';
import BentoGrid from '@/components/ui/BentoGrid';
import ProductCard from '@/components/ui/ProductCard';
import { Product } from '@/lib/types';
import { GameEvent } from '@/lib/types';

import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Product interface is already imported from @/lib/types

interface HomepageContent {
  hero: {
    title: string;
    subtitle: string;
    ctaTextShops: string;
    ctaTextJoin: string;
    backgroundImage: string;
  };
  trending: {
    title: string;
    subtitle: string;
  };
  ctaSection: {
    title: string;
    description: string;
    buttonText: string;
  };
  bentoGrid: {
    title: string;
    description: string;
    image: string;
  }[];
}

export default function Home() {
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [content, setContent] = useState<HomepageContent | null>(null);

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
    }
    fetchData();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pb-20 pt-24"
    >
      <Hero
        backgroundImage={content?.hero.backgroundImage}
      />
      <BentoGrid items={content?.bentoGrid} />

      <section className="px-6 py-20 bg-white">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-4xl font-black mb-4">{content?.trending?.title || 'Trending Games'}</h2>
              <p className="text-xl font-medium text-charcoal/60">{content?.trending?.subtitle || 'The hottest drops this week.'}</p>
            </div>
            <Link href="/shop">
              <button className="bg-black text-white px-8 py-4 rounded-full font-bold neo-shadow hover:translate-y-[-2px] transition-transform">
                View All Shop
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {loadingProducts ? (
              <div className="col-span-3 text-center text-xl font-bold py-12">Loading Trending Games...</div>
            ) : products.length > 0 ? (
              products.slice(0, 3).map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-3 text-center text-xl font-bold py-12 text-black/40">No games found in the repository yet.</div>
            )}
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
