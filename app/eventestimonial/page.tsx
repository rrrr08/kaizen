'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GameEvent } from '@/lib/types';
import { splitDateTime } from '@/lib/utils';
import { Calendar, MapPin, Users, Star } from 'lucide-react';

interface EventWithRating extends GameEvent {
  averageRating: number;
  testimonialCount: number;
}

export default function EventTestimonials() {
  const [events, setEvents] = useState<EventWithRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTopRatedEvents();
  }, []);

  const fetchTopRatedEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/events?status=past');

      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Calculate average ratings and filter events with testimonials
        const eventsWithRatings = data.events
          .filter((event: GameEvent) => event.testimonials && event.testimonials.length > 0)
          .map((event: GameEvent) => {
            const testimonials = event.testimonials || [];
            const ratings = testimonials.map(t => t.rating || 0).filter(r => r > 0);
            const averageRating = ratings.length > 0
              ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
              : 0;

            return {
              ...event,
              averageRating,
              testimonialCount: testimonials.length,
            };
          })
          .sort((a: EventWithRating, b: EventWithRating) => b.averageRating - a.averageRating)
          .slice(0, 3); // Top 3

        setEvents(eventsWithRatings);
      } else {
        setError(data.error || 'Failed to load testimonials');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load testimonials');
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
          <p className="text-black/60 font-black text-xs tracking-[0.4em]">LOADING EVENT TESTIMONIALS...</p>
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
          onClick={fetchTopRatedEvents}
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
            Community Voices
          </div>

          <h1 className="font-header text-6xl md:text-8xl tracking-tighter text-[#2D3436]">
            TOP RATED <br />
            <span className="text-[#FFD93D] drop-shadow-[2px_2px_0px_#000] italic font-serif">EVENTS</span>
          </h1>

          <div className="mt-6 text-black/60 font-medium font-serif italic text-xl">
            Celebrating our community's favorite experiences
          </div>
        </div>

        {/* Events Grid */}
        <div className="space-y-8">
          {events.map((event, index) => (
            <div key={event.id} className="relative">
              {/* Rank Badge */}
              <div className="absolute -top-4 -left-4 z-10">
                <div className="w-12 h-12 bg-[#FFD93D] border-4 border-black rounded-full flex items-center justify-center neo-shadow">
                  <span className="font-black text-black text-lg">#{index + 1}</span>
                </div>
              </div>

              <Link href={`/events/past/${event.id}`}>
                <div className="bg-white border-2 border-black rounded-[25px] overflow-hidden hover:translate-x-1 hover:-translate-y-1 transition-transform duration-300 neo-shadow flex flex-col md:flex-row">
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
                      <span className="px-3 py-1 text-black text-xs font-black uppercase tracking-wider rounded-lg border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] bg-[#FFD93D]">
                        ⭐ {event.averageRating.toFixed(1)}
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
                          <p className="text-black/40 text-xs font-black uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Users className="w-3 h-3" /> Attended
                          </p>
                          <p className="text-[#00B894] font-black">{event.registered}</p>
                        </div>
                        <div className="bg-[#FFFDF5] p-3 rounded-xl border-2 border-black">
                          <p className="text-black/40 text-xs font-black uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Star className="w-3 h-3" /> Reviews
                          </p>
                          <p className="text-[#6C5CE7] font-black">{event.testimonialCount}</p>
                        </div>
                      </div>

                      {/* Top Testimonials */}
                      {event.testimonials && event.testimonials.length > 0 && (
                        <div className="mb-6">
                          <p className="text-black/40 text-xs font-black uppercase tracking-widest mb-3">WHAT PEOPLE SAID</p>
                          <div className="space-y-3">
                            {event.testimonials.slice(0, 2).map((t, i) => (
                              <blockquote key={i} className="bg-[#FFFDF5] border-2 border-black rounded-lg p-4 text-black/70 font-medium italic text-sm">
                                "{t.comment.length > 100 ? t.comment.substring(0, 100) + '...' : t.comment}"
                                <footer className="mt-2 text-black/40 text-xs not-italic font-black uppercase tracking-widest">
                                  — {t.name}
                                </footer>
                              </blockquote>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* View Event Button */}
                    <div className="pt-6 border-t-2 border-black/5">
                      <div className="w-full px-6 py-4 border-2 border-black/10 text-black font-black text-xs tracking-[0.3em] rounded-xl uppercase text-center hover:bg-black hover:text-white transition-colors cursor-pointer">
                        VIEW FULL TESTIMONIALS
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {events.length === 0 && (
          <div className="text-center py-20 bg-white border-2 border-black rounded-[30px] border-dashed">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-black">
              <Star className="w-10 h-10 text-black/20" />
            </div>
            <p className="text-black font-black uppercase tracking-widest text-lg">No testimonials yet</p>
            <p className="text-black/40 font-bold mt-2">Be the first to share your experience!</p>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-20 text-center">
          <Link
            href="/events/past"
            className="inline-block px-8 py-4 bg-[#FFD93D] text-black border-2 border-black rounded-xl neo-shadow font-black text-sm tracking-widest hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase"
          >
            Explore All Past Events
          </Link>
        </div>
      </div>
    </div>
  );
}