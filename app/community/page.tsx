'use client';

import { TESTIMONIALS, GAMES } from '@/lib/constants';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Community() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventFilter, setEventFilter] = useState('All');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/events?status=upcoming');

      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setEvents(data.events);
      } else {
        setError(data.error || 'Failed to load events');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load events');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = eventFilter === 'All'
    ? events
    : events.filter(e => e.price === 0 ? eventFilter === 'Free' : eventFilter === 'Paid');

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-[#FFFDF5]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#FFD93D] border-t-black mb-4"></div>
          <p className="text-black/60 font-black text-xs tracking-[0.4em]">LOADING COMMUNITY...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex flex-col items-center justify-center gap-4 bg-[#FFFDF5]">
        <div className="text-red-500 font-black tracking-widest text-center">
          {error}
        </div>
        <button
          onClick={fetchEvents}
          className="px-6 py-2 border-2 border-black text-black hover:bg-black hover:text-white transition-all font-black text-xs tracking-widest rounded-lg"
        >
          TRY AGAIN
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-16 bg-[#FFFDF5] text-[#2D3436] selection:bg-[#FFD93D]/50">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="mb-20 border-b-2 border-black pb-12">
          <div className="text-[#6C5CE7] font-black text-sm tracking-[0.2em] mb-4 uppercase font-display">Events & Community Hub</div>
          <h1 className="font-header text-6xl md:text-8xl tracking-tighter mb-8 text-[#2D3436]">
            PLAY, GATHER & <br /><span className="text-[#FFD93D] drop-shadow-[2px_2px_0px_#000] italic font-serif">BELONG</span>
          </h1>
          <p className="text-black/70 font-bold text-xl max-w-3xl leading-relaxed">
            The heart of Joy Juncture. Discover local meets, join our digital tribe, and earn rewards for simply having fun.
          </p>
        </div>

        {/* --- EVENTS SECTION (Merged) --- */}
        <section className="mb-32">
          <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-12">
            <div>
              <h2 className="font-header text-4xl md:text-5xl mb-2 text-black">Upcoming Events</h2>
              <p className="text-black/60 font-bold text-lg">Soirees, workshops, and tournaments near you.</p>
            </div>
            <div className="flex gap-4 md:gap-4">
              {['All', 'Free', 'Paid'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setEventFilter(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all neo-border neo-shadow ${eventFilter === cat
                    ? 'bg-[#FFD93D] text-black scale-105'
                    : 'bg-white text-black hover:bg-gray-50'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {filteredEvents.map(event => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <div className="group cursor-pointer bg-white border-2 border-black p-4 rounded-[20px] neo-shadow hover:scale-[1.02] transition-transform">
                  {/* Event Image */}
                  <div className="aspect-video overflow-hidden rounded-[15px] mb-6 border-2 border-black bg-gray-100 relative">
                    {event.image ? (
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-black/20 font-black text-sm uppercase tracking-widest">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="space-y-4 px-2">
                    <div>
                      <div className="bg-[#6C5CE7] text-white px-2 py-1 rounded inline-block font-black text-[8px] tracking-[0.2em] mb-3 uppercase">
                        {event.date} • {event.time}
                      </div>
                      <h3 className="font-header text-2xl md:text-3xl text-black group-hover:text-[#6C5CE7] transition-colors tracking-tight mb-2">
                        {event.title}
                      </h3>
                      <p className="text-black/60 font-bold text-sm line-clamp-2">
                        {event.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t-2 border-black/10">
                      <div className="text-black/50 text-xs font-black uppercase tracking-widest">{event.location}</div>
                      <div>
                        {event.price === 0 ? (
                          <span className="text-[#00B894] font-black text-xs tracking-widest">FREE</span>
                        ) : (
                          <span className="text-black font-serif italic font-bold">₹{event.price}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-black/40 font-black text-lg uppercase">NO EVENTS MATCHING FILTER</p>
            </div>
          )}
        </section>

        {/* --- DIGITAL COMMUNITY SECTION --- */}
        <section className="mb-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Wallet & Points */}
            <div className="border-2 border-black p-8 rounded-[30px] bg-white neo-shadow hover:translate-y-[-4px] transition-transform">
              <h3 className="font-header text-sm tracking-[0.2em] text-[#6C5CE7] mb-6 uppercase border-b-2 border-black pb-2 font-black">Game Points & Wallet</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-black font-black text-lg mb-3">Earn points through:</p>
                  <ul className="space-y-2 text-black/70 font-medium text-sm">
                    <li>→ Purchasing games</li>
                    <li>→ Attending events</li>
                    <li>→ Playing online games</li>
                    <li>→ Community engagement</li>
                  </ul>
                </div>
                <div className="pt-4 border-t-2 border-black/10">
                  <p className="text-black font-black text-lg mb-3">Redeem for:</p>
                  <ul className="space-y-2 text-black/70 font-medium text-sm">
                    <li>→ Store discounts</li>
                    <li>→ Event tickets</li>
                    <li>→ Exclusive merchandise</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Blogs & Stories */}
            <div className="border-2 border-black p-8 rounded-[30px] bg-white neo-shadow hover:translate-y-[-4px] transition-transform">
              <h3 className="font-header text-sm tracking-[0.2em] text-[#FFD93D] mb-6 uppercase border-b-2 border-black pb-2 font-black drop-shadow-sm text-shadow-black">Community Stories</h3>
              <div className="space-y-4">
                <p className="text-black/70 font-medium text-sm leading-relaxed">
                  Join the conversation. Share your game nights, read strategy guides, and get featured in our editorial blog.
                </p>
                <div className="pt-6">
                  <Link href="/blog" className="text-black font-black text-xs tracking-[0.3em] hover:text-[#6C5CE7] hover:underline transition-all">VISIT THE BLOG →</Link>
                </div>
              </div>
            </div>

            {/* Puzzles & Challenges */}
            <div className="border-2 border-black p-8 rounded-[30px] bg-white neo-shadow hover:translate-y-[-4px] transition-transform">
              <h3 className="font-header text-sm tracking-[0.2em] text-[#00B894] mb-6 uppercase border-b-2 border-black pb-2 font-black">Daily Challenges</h3>
              <div className="space-y-4">
                <p className="text-black/70 font-medium text-sm leading-relaxed">
                  Test your wit with our rotating selection of puzzles and brain teasers.
                </p>
                <div className="space-y-3 pt-4 border-t-2 border-black/10">
                  {GAMES.slice(0, 2).map(game => (
                    <div key={game.id} className="border-b border-black/10 pb-3 last:border-0 flex justify-between items-center">
                      <p className="text-black font-bold text-xs">{game.title}</p>
                      <p className="text-[#00B894] font-black text-xs">+{game.points} pts</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <div className="mb-24">
          <h2 className="font-header text-4xl md:text-5xl mb-12 tracking-tight text-center text-black">Proof of Joy</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map(testimonial => (
              <div key={testimonial.id} className="border-2 border-black p-8 rounded-[20px] bg-white neo-shadow hover:scale-[1.02] transition-transform">
                <p className="text-black/80 font-medium italic mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.author}
                    className="w-12 h-12 rounded-full border-2 border-black"
                  />
                  <div>
                    <p className="font-black text-sm text-black">{testimonial.author}</p>
                    <p className="text-black/50 text-xs font-bold uppercase tracking-wider">{testimonial.occasion}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center py-16 border-t-2 border-black/10">
          <h2 className="font-header text-4xl md:text-5xl mb-6 text-black">Ready to Join?</h2>
          <p className="text-black/70 font-bold text-lg mb-8 max-w-2xl mx-auto">
            Create your account and start earning points, engaging with the community, and discovering endless joy.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/auth/signup"
              className="px-8 py-4 bg-black text-white font-black text-xs tracking-[0.4em] hover:bg-[#6C5CE7] hover:scale-105 transition-all rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,0.2)]"
            >
              CREATE ACCOUNT
            </Link>
            <Link
              href="/play"
              className="px-8 py-4 bg-[#FFD93D] text-black font-black text-xs tracking-[0.4em] border-2 border-black neo-shadow hover:scale-105 transition-all rounded-xl"
            >
              PLAY NOW
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
