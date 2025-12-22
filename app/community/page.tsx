'use client';

import { TESTIMONIALS, GAMES, EVENTS } from '@/lib/constants';
import Link from 'next/link';
import { useState } from 'react';

export default function Community() {
  const [eventFilter, setEventFilter] = useState('All');

  const filteredEvents = eventFilter === 'All'
    ? EVENTS
    : EVENTS.filter(e => e.price === 0 ? eventFilter === 'Free' : eventFilter === 'Paid');

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="mb-20 border-b border-white/5 pb-12">
          <div className="text-amber-500 font-header text-[10px] tracking-[0.6em] mb-4 uppercase">Events & Community Hub</div>
          <h1 className="font-header text-5xl md:text-7xl lg:text-8xl tracking-tighter mb-8">
            PLAY, GATHER & <br /><span className="text-amber-400">BELONG</span>
          </h1>
          <p className="text-white/60 font-serif italic text-lg max-w-3xl">
            The heart of Joy Juncture. Discover local meets, join our digital tribe, and earn rewards for simply having fun.
          </p>
        </div>

        {/* --- EVENTS SECTION (Merged) --- */}
        <section className="mb-32">
          <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-12">
            <div>
              <h2 className="font-header text-3xl md:text-5xl mb-2">Upcoming Events</h2>
              <p className="text-white/50 font-serif italic">Soirees, workshops, and tournaments near you.</p>
            </div>
            <div className="flex gap-4 md:gap-8">
              {['All', 'Free', 'Paid'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setEventFilter(cat)}
                  className={`font-header text-[9px] tracking-[0.4em] transition-all relative pb-2 ${eventFilter === cat ? 'text-amber-500 border-b border-amber-500' : 'text-white/40 hover:text-white'
                    }`}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {filteredEvents.map(event => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <div className="group cursor-pointer bg-neutral-900 border border-white/5 hover:border-amber-500/40 p-4 rounded-sm transition-all hover:-translate-y-1">
                  {/* Event Image */}
                  <div className="aspect-video overflow-hidden rounded-sm mb-6 bg-white/5">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                  </div>

                  {/* Event Info */}
                  <div className="space-y-4">
                    <div>
                      <div className="text-amber-500 font-header text-[8px] tracking-[0.3em] mb-2 uppercase">
                        {event.date} • {event.time}
                      </div>
                      <h3 className="font-header text-xl md:text-2xl group-hover:text-amber-400 transition-colors tracking-tight mb-2">
                        {event.title}
                      </h3>
                      <p className="text-white/50 font-serif text-sm italic line-clamp-2">
                        {event.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="text-white/40 text-xs font-serif">{event.location}</div>
                      <div>
                        {event.price === 0 ? (
                          <span className="text-amber-500 font-header text-[9px] tracking-widest">FREE</span>
                        ) : (
                          <span className="text-amber-500 font-serif italic">₹{event.price}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-12 border border-white/10 rounded-sm">
              <p className="text-white/40 font-header text-[10px] tracking-[0.3em]">NO EVENTS MATCHING FILTER</p>
            </div>
          )}
        </section>


        {/* --- DIGITAL COMMUNITY SECTION --- */}
        <section className="mb-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Wallet & Points */}
            <div className="border border-white/10 p-8 rounded-sm bg-gradient-to-br from-white/5 to-transparent">
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
            <div className="border border-white/10 p-8 rounded-sm bg-gradient-to-br from-white/5 to-transparent">
              <h3 className="font-header text-[10px] tracking-[0.6em] text-amber-500 mb-6 uppercase">Community Stories</h3>
              <div className="space-y-4">
                <p className="text-white/70 font-serif text-sm leading-relaxed">
                  Join the conversation. Share your game nights, read strategy guides, and get featured in our editorial blog.
                </p>
                <div className="pt-6">
                  <Link href="/blog" className="text-amber-500 font-header text-[10px] tracking-[0.3em] border-b border-amber-500 pb-1 hover:text-amber-400 transition-all">VISIT THE BLOG →</Link>
                </div>
              </div>
            </div>

            {/* Puzzles & Challenges */}
            <div className="border border-white/10 p-8 rounded-sm bg-gradient-to-br from-white/5 to-transparent">
              <h3 className="font-header text-[10px] tracking-[0.6em] text-amber-500 mb-6 uppercase">Daily Challenges</h3>
              <div className="space-y-4">
                <p className="text-white/70 font-serif text-sm leading-relaxed">
                  Test your wit with our rotating selection of puzzles and brain teasers.
                </p>
                <div className="space-y-3 pt-4 border-t border-white/10">
                  {GAMES.slice(0, 2).map(game => (
                    <div key={game.id} className="border-b border-white/5 pb-3 last:border-0">
                      <p className="text-amber-400 font-header text-[9px] tracking-widest mb-1">{game.title}</p>
                      <p className="text-white/50 font-serif text-xs">+{game.points} points</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <div className="mb-24">
          <h2 className="font-header text-4xl md:text-5xl mb-12 tracking-tight text-center">Proof of Joy</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map(testimonial => (
              <div key={testimonial.id} className="border border-white/10 p-8 rounded-sm hover:border-amber-500/40 transition-all">
                <p className="text-white/70 font-serif italic mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.author}
                    className="w-12 h-12 rounded-full grayscale"
                  />
                  <div>
                    <p className="font-header text-[9px] tracking-[0.3em] text-amber-500">{testimonial.author.toUpperCase()}</p>
                    <p className="text-white/40 font-serif text-xs">{testimonial.occasion}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

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
