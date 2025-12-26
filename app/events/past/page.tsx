'use client';

import { useState, useEffect } from 'react';
import { GameEvent } from '@/lib/types';
import { splitDateTime } from '@/lib/utils';
import Link from 'next/link';

export default function PastEvents() {
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/events?status=past');

      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setEvents(data.events);
      } else {
        setError(data.error || 'Failed to load past events');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load past events');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-[#FFFDF5]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#FFD93D] border-t-black mb-4"></div>
          <p className="text-black/60 font-black text-xs tracking-[0.4em]">LOADING PAST EVENTS...</p>
        </div>
      </div>
    );
  }

  /* ---------------- ERROR ---------------- */
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

  /* ---------------- MAIN ---------------- */
  return (
    <div className="min-h-screen pt-28 pb-16 bg-[#FFFDF5]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">

        {/* Header */}
        <div className="mb-20 border-b-2 border-black pb-12">
          <div className="text-[#6C5CE7] font-black text-sm tracking-[0.2em] mb-4 uppercase font-display">
            Previous Experiences
          </div>

          <h1 className="font-header text-6xl md:text-8xl tracking-tighter text-[#2D3436]">
            PAST <br />
            <span className="text-[#FFD93D] drop-shadow-[2px_2px_0px_#000] italic font-serif">EVENTS</span>
          </h1>

          <div className="mt-6 text-black/60 font-medium font-serif italic text-xl">
            {events.length} events concluded
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {events.map(event => (
            <Link key={event.id} href={`/events/past/${event.id}`}>
              <div key={event.id} className="group cursor-pointer">

                {/* Event Image */}
                <div className="aspect-video overflow-hidden rounded-[30px] mb-6 border-2 border-black neo-shadow bg-white grayscale group-hover:grayscale-0 transition-all duration-500">
                  {event.image !== "" && <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />}
                </div>

                {/* Event Info */}
                <div className="space-y-4 px-2">
                  <div>
                    <div className="bg-[#E5E7EB] text-black/60 px-3 py-1 rounded-lg border-2 border-black inline-block font-black text-[10px] tracking-[0.2em] mb-4 uppercase">
                      {splitDateTime(event.datetime).date} • {splitDateTime(event.datetime).time}
                    </div>

                    <h3 className="font-header text-4xl md:text-5xl text-black group-hover:text-[#6C5CE7] transition-colors tracking-tight mb-3">
                      {event.title}
                    </h3>

                    <p className="text-black/70 font-medium text-lg mb-4 line-clamp-2">
                      {event.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t-2 border-black/10">
                    <div className="flex items-center gap-8">
                      <div>
                        <p className="font-black text-[9px] tracking-widest text-black/40 uppercase mb-1">
                          LOCATION
                        </p>
                        <p className="font-bold text-sm text-black">
                          {event.location}
                        </p>
                      </div>

                      <div>
                        <p className="font-black text-[9px] tracking-widest text-black/40 uppercase mb-1">
                          ATTENDED
                        </p>
                        <p className="font-bold text-sm text-black">
                          {event.registered}/{event.capacity}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      {event.price === 0 ? (
                        <p className="text-[#00B894] font-black text-xl tracking-widest">
                          FREE
                        </p>
                      ) : (
                        <p className="text-black font-serif italic text-2xl font-bold">
                          ₹{event.price}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Past Event Label */}
                  <div className="w-full text-center pt-4">
                    <div className="px-6 py-3 border-2 border-black/10 text-black/40 font-black text-xs tracking-[0.3em] rounded-xl uppercase">
                      EVENT CONCLUDED
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {events.length === 0 && (
          <div className="text-center py-24">
            <p className="text-black/60 font-black text-lg uppercase">
              NO PREVIOUS EVENTS
            </p>
            <p className="text-black/40 font-serif italic mt-4">
              Our journey is just beginning.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
