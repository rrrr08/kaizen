'use client';

import { useState, useEffect } from 'react';
import { GameEvent } from '@/lib/types';
import { splitDateTime } from '@/lib/utils';
import Link from 'next/link';
import { Calendar, MapPin, Users } from 'lucide-react';

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
        <div className="space-y-6">
          {events.map(event => (
            <Link key={event.id} href={`/events/past/${event.id}`}>
              <div className="bg-white border-2 border-black rounded-[25px] overflow-hidden hover:translate-x-1 hover:-translate-y-1 transition-transform duration-300 neo-shadow group flex flex-col md:flex-row cursor-pointer mb-3">
              {/* Image */}
              <div className="w-full md:w-80 h-64 md:h-auto bg-gray-100 flex-shrink-0 overflow-hidden border-b-2 md:border-b-0 md:border-r-2 border-black relative">
                {event.image !== "" ? (
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <Calendar className="w-12 h-12 text-black/20" />
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 text-black text-xs font-black uppercase tracking-wider rounded-lg border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] bg-gray-300">
                    Past
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-8 flex flex-col justify-between">
                <div>
                  <div className="mb-6">
                    <h3 className="font-header text-3xl font-black text-black mb-2 uppercase tracking-tight">{event.title}</h3>
                    <p className="text-black/60 text-sm font-medium leading-relaxed">{event.description}</p>
                  </div>

                  {/* Event Details */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-[#FFFDF5] p-3 rounded-xl border-2 border-black">
                      <p className="text-black/40 text-xs font-black uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Date
                      </p>
                      <p className="text-black font-black">{splitDateTime(event.datetime).date}</p>
                      <p className="text-black/60 text-xs font-bold">{splitDateTime(event.datetime).time}</p>
                    </div>
                    <div className="bg-[#FFFDF5] p-3 rounded-xl border-2 border-black">
                      <p className="text-black/40 text-xs font-black uppercase tracking-wider mb-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Location
                      </p>
                      <p className="text-black font-black text-sm truncate" title={event.location}>{event.location}</p>
                    </div>
                    <div className="bg-[#FFFDF5] p-3 rounded-xl border-2 border-black">
                      <p className="text-black/40 text-xs font-black uppercase tracking-wider mb-1">Capacity</p>
                      <p className="text-black font-black">{event.capacity}</p>
                    </div>
                    <div className="bg-[#FFFDF5] p-3 rounded-xl border-2 border-black">
                      <p className="text-black/40 text-xs font-black uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Users className="w-3 h-3" /> Attended
                      </p>
                      <p className="text-[#00B894] font-black">{event.registered}</p>
                      <p className="text-black/40 text-xs font-bold">{Math.round((event.registered / event.capacity) * 100)}% full</p>
                    </div>
                  </div>

                  {/* Registration Bar */}
                  <div className="mb-6">
                    <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden border-2 border-black">
                      <div
                        className="h-full bg-[#FFD93D] border-r-2 border-black"
                        style={{ width: `${Math.min((event.registered / event.capacity) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Past Event Label */}
                <div className="pt-6 border-t-2 border-black/5">
                  <div className="w-full px-6 py-4 border-2 border-black/10 text-black/40 font-black text-xs tracking-[0.3em] rounded-xl uppercase text-center">
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
          <div className="text-center py-20 bg-white border-2 border-black rounded-[30px] border-dashed">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-black">
              <Calendar className="w-10 h-10 text-black/20" />
            </div>
            <p className="text-black font-black uppercase tracking-widest text-lg">No past events</p>
            <p className="text-black/40 font-bold mt-2">Our journey is just beginning.</p>
          </div>
        )}
      </div>
    </div>
  );
}
