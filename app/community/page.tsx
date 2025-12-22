'use client';

import { getTestimonials, getGames } from '@/lib/firebase';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Community() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [testimonialsData, gamesData] = await Promise.all([
          getTestimonials(),
          getGames()
        ]);
        setTestimonials(testimonialsData);
        setGames(gamesData);
      } catch (err) {
        console.error('Error fetching community data:', err);
        setError('Failed to load community data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="mb-20 border-b border-white/5 pb-12">
          <div className="text-amber-500 font-header text-[10px] tracking-[0.6em] mb-4 uppercase">Long-term Engagement & Community</div>
          <h1 className="font-header text-5xl md:text-7xl lg:text-8xl tracking-tighter mb-8">
            PLAY & <br/><span className="text-amber-400">BELONG</span>
          </h1>
          <p className="text-white/60 font-serif italic text-lg max-w-3xl">
            Join a thriving community of game enthusiasts, earn rewards, and share your gaming journey.
          </p>
        </div>

        {/* Three Column Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-24">
          {/* Wallet & Points */}
          <div className="border border-white/10 p-8 rounded-sm hover:border-amber-500/40 transition-all">
            <h3 className="font-header text-[10px] tracking-[0.6em] text-amber-500 mb-6 uppercase">Game Points & Wallet</h3>
            <div className="space-y-6">
              <div>
                <p className="text-white/60 font-serif italic mb-3">Earn points through:</p>
                <ul className="space-y-2 text-white/70 font-serif text-sm">
                  <li>→ Purchasing games</li>
                  <li>→ Attending events</li>
                  <li>→ Playing online games</li>
                  <li>→ Community engagement</li>
                </ul>
              </div>
              <div className="pt-4 border-t border-white/10">
                <p className="text-white/60 font-serif italic mb-3">Redeem for:</p>
                <ul className="space-y-2 text-white/70 font-serif text-sm">
                  <li>→ Store discounts</li>
                  <li>→ Event tickets</li>
                  <li>→ Exclusive merchandise</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Blogs & Stories */}
          <div className="border border-white/10 p-8 rounded-sm hover:border-amber-500/40 transition-all">
            <h3 className="font-header text-[10px] tracking-[0.6em] text-amber-500 mb-6 uppercase">Blogs & Stories</h3>
            <div className="space-y-4">
              <p className="text-white/70 font-serif text-sm leading-relaxed">
                Read stories from the community about game nights, tournaments, and unforgettable moments.
              </p>
              <div className="space-y-3 pt-4 border-t border-white/10">
                <p className="text-white/60 font-serif italic text-sm">Categories:</p>
                <div className="space-y-2 text-white/70 font-serif text-sm">
                  <p>• Game reviews & guides</p>
                  <p>• Event highlights</p>
                  <p>• Community features</p>
                  <p>• Strategy insights</p>
                </div>
              </div>
            </div>
          </div>

          {/* Puzzles & Challenges */}
          <div className="border border-white/10 p-8 rounded-sm hover:border-amber-500/40 transition-all">
            <h3 className="font-header text-[10px] tracking-[0.6em] text-amber-500 mb-6 uppercase">Puzzles & Challenges</h3>
            <div className="space-y-4">
              <p className="text-white/70 font-serif text-sm leading-relaxed">
                Test your wit with our rotating selection of puzzles and brain teasers.
              </p>
              {!loading && !error && games.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-white/10">
                  {games.slice(0, 2).map(game => (
                    <div key={game.id} className="border-b border-white/5 pb-3 last:border-0">
                      <p className="text-amber-400 font-header text-[9px] tracking-widest mb-1">{game.title || game.name}</p>
                      <p className="text-white/50 font-serif text-xs">+{game.points || 10} points</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mb-4"></div>
              <p className="text-white/60 font-header text-[10px] tracking-[0.4em]">LOADING COMMUNITY...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-24">
            <p className="text-red-500 font-header text-[10px] tracking-[0.4em]">{error}</p>
          </div>
        )}

        {/* Testimonials Section */}
        {!loading && !error && testimonials.length > 0 && (
          <div className="mb-24">
            <h2 className="font-header text-4xl md:text-5xl mb-12 tracking-tight">Proof of Joy</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map(testimonial => (
                <div key={testimonial.id} className="border border-white/10 p-8 rounded-sm hover:border-amber-500/40 transition-all">
                  <p className="text-white/70 font-serif italic mb-6 leading-relaxed">"{testimonial.text || testimonial.quote}"</p>
                  <div className="flex items-center gap-4">
                    <img 
                      src={testimonial.image}
                      alt={testimonial.author || testimonial.name}
                      className="w-12 h-12 rounded-full grayscale"
                    />
                    <div>
                      <p className="font-header text-[9px] tracking-[0.3em] text-amber-500">{(testimonial.author || testimonial.name)?.toUpperCase()}</p>
                      <p className="text-white/40 font-serif text-xs">{testimonial.occasion}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="text-center py-16 border-t border-white/10">
          <h2 className="font-header text-4xl md:text-5xl mb-6">Ready to Join?</h2>
          <p className="text-white/60 font-serif italic text-lg mb-8 max-w-2xl mx-auto">
            Create your account and start earning points, engaging with the community, and discovering endless joy.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link 
              href="/auth/signup"
              className="px-8 py-4 bg-amber-500 text-black font-header text-[10px] tracking-[0.4em] hover:bg-amber-400 transition-all rounded-sm"
            >
              CREATE ACCOUNT
            </Link>
            <Link 
              href="/play"
              className="px-8 py-4 border border-amber-500 text-amber-500 font-header text-[10px] tracking-[0.4em] hover:bg-amber-500/10 transition-all rounded-sm"
            >
              EXPLORE GAMES
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
