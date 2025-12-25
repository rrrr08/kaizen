'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export const dynamic = 'force-dynamic';

export default function Events() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const { getEvents } = await import('@/lib/firebase');
        const data = await getEvents();
        setEvents(data);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = filter === 'All' 
    ? events
    : events.filter(e => e.price === 0 ? filter === 'Free' : filter === 'Paid');

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="mb-20 flex flex-col md:flex-row items-end justify-between gap-8 border-b border-white/5 pb-12">
          <div>
            <div className="text-amber-500 font-header text-[10px] tracking-[0.6em] mb-4 uppercase">Social & Hosted Experiences</div>
            <h1 className="font-header text-5xl md:text-7xl lg:text-8xl tracking-tighter">
              SOIREE & <br/><span className="text-amber-400">WORKSHOPS</span>
            </h1>
          </div>
          
          {/* Filters */}
          <div className="flex gap-4 md:gap-8">
            {['All', 'Free', 'Paid'].map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`font-header text-[9px] tracking-[0.4em] transition-all relative pb-2 ${
                  filter === cat ? 'text-amber-500 border-b border-amber-500' : 'text-white/40 hover:text-white'
                }`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mb-4"></div>
              <p className="text-white/60 font-header text-[10px] tracking-[0.4em]">LOADING EVENTS...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-24">
            <p className="text-red-500 font-header text-[10px] tracking-[0.4em]">{error}</p>
          </div>
        )}

        {/* Events Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {filteredEvents.map(event => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <div className="group cursor-pointer">
                  {/* Event Image */}
                  <div className="aspect-video overflow-hidden rounded-sm mb-6 border border-white/5 group-hover:border-amber-500/40 transition-all bg-white/5">
                    <img 
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Event Info */}
                  <div className="space-y-4">
                    <div>
                      <div className="text-amber-500 font-header text-[9px] tracking-[0.4em] mb-2">
                        {event.date} • {event.time}
                      </div>
                      <h3 className="font-header text-2xl md:text-3xl group-hover:text-amber-400 transition-colors tracking-tight mb-3">
                        {event.title}
                      </h3>
                      <p className="text-white/60 font-serif italic mb-4 line-clamp-2">
                        {event.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="flex items-center gap-6">
                        <div>
                          <p className="font-header text-[8px] tracking-widest text-white/40">LOCATION</p>
                          <p className="font-serif text-sm text-white/80">{event.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {event.price === 0 ? (
                          <p className="text-amber-500 font-header text-[10px] tracking-widest">FREE</p>
                        ) : (
                          <p className="text-amber-500 font-serif italic text-lg">₹{event.price}</p>
                        )}
                      </div>
                    </div>

                    <div className="w-full text-center pt-4">
                      <button className="w-full px-6 py-3 border border-amber-500 text-amber-500 font-header text-[9px] tracking-[0.3em] hover:bg-amber-500/10 transition-all rounded-sm">
                        {event.registered >= event.capacity ? 'WAITLIST' : 'REGISTER'}
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && !error && filteredEvents.length === 0 && (
          <div className="text-center py-24">
            <p className="text-white/60 font-header text-[10px] tracking-[0.4em]">NO EVENTS FOUND</p>
          </div>
        )}
      </div>
    </div>
  );
}