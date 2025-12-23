'use client';

import { useState, useEffect } from 'react';
import { GameEvent } from '@/lib/types';
import { splitDateTime } from '@/lib/utils';
import Link from 'next/link';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import EventRegistrationForm from '@/components/EventRegistrationForm';

export default function UpcomingEvents() {
  const [user, setUser] = useState<any>(null);
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEventForRegistration, setSelectedEventForRegistration] = useState<GameEvent | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/events/upcoming');

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
      setError(err.message || 'Failed to load upcoming events');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = (event: GameEvent) => {
    setSelectedEventForRegistration(event);
  };

  const handleRegistrationSuccess = () => {
    setSelectedEventForRegistration(null);
    // Update events list to reflect registration
    setEvents(prev => prev.map(e => 
      e.id === selectedEventForRegistration?.id ? { ...e, registered: e.registered + 1 } : e
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center">
        <div className="text-amber-500 font-header tracking-[0.3em] animate-pulse">
          LOADING UPCOMING EVENTS...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex flex-col items-center justify-center gap-4">
        <div className="text-red-500 font-header tracking-widest text-center">
          {error}
        </div>
        <button 
          onClick={fetchEvents}
          className="px-6 py-2 border border-amber-500 text-amber-500 hover:bg-amber-500/10 transition-all"
        >
          TRY AGAIN
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="mb-20 border-b border-white/5 pb-12">
          <div className="text-amber-500 font-header text-[10px] tracking-[0.6em] mb-4 uppercase">
            Upcoming Game Nights
          </div>
          <h1 className="font-header text-5xl md:text-7xl lg:text-8xl tracking-tighter">
            UPCOMING <br/><span className="text-amber-400">EVENTS</span>
          </h1>
          <div className="mt-6 text-white/60 font-serif italic">
            {events.length} events scheduled
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {events.map(event => (
          <Link key={event.id} href={`/events/upcoming/${event.id}`}>
            <div key={event.id} className="group">
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
                    {splitDateTime(event.datetime).date} • {splitDateTime(event.datetime).time}
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
                    <div>
                      <p className="font-header text-[8px] tracking-widest text-white/40">REGISTERED</p>
                      <p className="font-serif text-sm text-white/80">
                        {event.registered}/{event.capacity}
                      </p>
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
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRegister(event);
                    }}
                    className="w-full px-6 py-3 border border-amber-500 text-amber-500 font-header text-[9px] tracking-[0.3em] hover:bg-amber-500/10 transition-all rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={event.registered >= event.capacity}
                  >
                    {event.registered >= event.capacity ? 'WAITLIST' : 'REGISTER'}
                  </button>
                </div>
              </div>
            </div>
          </Link>
          ))}
        </div>

        {events.length === 0 && (
          <div className="text-center py-24">
            <p className="text-white/60 font-header text-[10px] tracking-[0.4em]">NO UPCOMING EVENTS</p>
            <p className="text-white/40 font-serif italic mt-4">Check back soon for new events!</p>
          </div>
        )}
      </div>

      {/* Registration Form Modal */}
      {selectedEventForRegistration && (
        <EventRegistrationForm
          event={selectedEventForRegistration}
          user={user}
          onSuccess={handleRegistrationSuccess}
          onClose={() => setSelectedEventForRegistration(null)}
        />
      )}
    </div>
  );
}
