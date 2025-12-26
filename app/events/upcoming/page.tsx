'use client';

import { useState, useEffect } from 'react';
import { GameEvent } from '@/lib/types';
import { splitDateTime } from '@/lib/utils';
import Link from 'next/link';
import EventRegistrationForm from '@/components/EventRegistrationForm';
import ArcadeNavbar from '@/components/ui/ArcadeNavbar';
import Footer from '@/components/ui/Footer';

export const dynamic = 'force-dynamic';

export default function UpcomingEvents() {
  const [user, setUser] = useState<any>(null);
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEventForRegistration, setSelectedEventForRegistration] = useState<GameEvent | null>(null);

  useEffect(() => {
    (async () => {
      const { auth } = await import('@/lib/firebase');
      const { onAuthStateChanged } = await import('firebase/auth');

      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
      });

      return () => unsubscribe();
    })();
  }, []);

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
      <>
        <ArcadeNavbar />
        <div className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-[#050505] bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:20px_20px]">
          <div className="text-[#FFD400] font-arcade tracking-[0.3em] animate-pulse text-2xl">
            INITIALIZING_GAME_NIGHT_PROTOCOLS...
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <ArcadeNavbar />
        <div className="min-h-screen pt-28 pb-16 flex flex-col items-center justify-center gap-4 bg-[#050505] bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:20px_20px]">
          <div className="text-red-500 font-arcade tracking-widest text-center text-4xl mb-4">
            SYSTEM_FAILURE: {error}
          </div>
          <button
            onClick={fetchEvents}
            className="px-8 py-4 bg-red-900/20 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all font-arcade text-xl"
          >
            REBOOT_SYSTEM
          </button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <ArcadeNavbar />
      <div className="min-h-screen bg-[#050505] bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:20px_20px] text-white overflow-hidden relative selection:bg-[#FFD400] selection:text-black">
        {/* Glow Effects */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
          <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-[#6C5CE7]/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-1/3 left-1/4 w-[500px] h-[500px] bg-[#FFD400]/5 rounded-full blur-[120px] animate-pulse delay-700"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 py-20 relative z-10">
          {/* Header */}
          <div className="mb-20">
            <div className="arcade-panel-header bg-[#FFD400] mx-auto mb-6 inline-block text-black">FUTURE_MISSIONS</div>
            <h1 className="font-arcade text-6xl md:text-8xl leading-none text-white transition-all mb-6">
              UPCOMING <span className="text-3d-yellow">EVENTS</span>
            </h1>
            <p className="text-gray-400 font-sans text-xl max-w-2xl leading-relaxed border-l-4 border-[#FFD400] pl-6">
              Prepare for deployment. {events.length} active missions scheduled for engagement.
            </p>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {events.map(event => (
              <Link key={event.id} href={`/events/upcoming/${event.id}`}>
                <div key={event.id} className="group relative cursor-pointer h-full">
                  <div className="arcade-card-3d bg-[#111] border-l-4 border-[#333] group-hover:border-[#FFD400] transition-all p-0 overflow-hidden flex flex-col h-full shadow-[0_0_20px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_30px_rgba(255,212,0,0.1)]">

                    {/* Event Image */}
                    <div className="relative h-72 overflow-hidden border-b-2 border-[#333]">
                      <div className="absolute top-4 right-4 z-10 bg-[#FFD400] text-black font-arcade px-3 py-1 text-sm shadow-[4px_4px_0px_black] border border-black code-font font-bold">
                        STATUS: ACTIVE
                      </div>
                      {event.image !== "" && <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110"
                      />}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent"></div>

                      {/* Date Badge Overlay */}
                      <div className="absolute bottom-0 left-0 bg-black/90 p-4 border-t border-r border-[#333] group-hover:border-[#FFD400] transition-colors">
                        <div className="text-[#FFD400] font-arcade text-xs mb-1">LAUNCH DATE</div>
                        <div className="text-white font-sans font-bold">
                          {splitDateTime(event.datetime).date} <span className="text-gray-500 mx-1">|</span> {splitDateTime(event.datetime).time}
                        </div>
                      </div>
                    </div>

                    {/* Event Info */}
                    <div className="p-8 flex flex-col flex-grow">
                      <h3 className="font-arcade text-3xl md:text-4xl text-white group-hover:text-[#FFD400] transition-colors leading-none mb-4">
                        {event.title}
                      </h3>
                      <p className="text-gray-400 font-sans text-lg mb-8 line-clamp-2 leading-relaxed flex-grow">
                        {event.description}
                      </p>

                      <div className="flex items-center justify-between pt-6 border-t border-white/10 mb-6">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-arcade text-gray-500 uppercase tracking-widest">COORDINATES</span>
                          <span className="text-sm font-sans text-gray-300 font-bold">{event.location}</span>
                        </div>
                        <div className="flex flex-col gap-1 text-right">
                          <span className="text-[10px] font-arcade text-gray-500 uppercase tracking-widest">ENTRY FEE</span>
                          {event.price === 0 ? (
                            <span className="text-[#00B894] font-arcade text-xl tracking-widest">FREE</span>
                          ) : (
                            <span className="text-[#FFD400] font-arcade text-xl">₹{event.price}</span>
                          )}
                        </div>
                      </div>

                      <div className="w-full text-center mt-auto">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRegister(event);
                          }}
                          className={`w-full px-6 py-4 font-arcade text-lg transition-all relative overflow-hidden group/btn ${event.registered >= event.capacity
                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed border-2 border-gray-700'
                            : 'bg-[#FFD400] text-black hover:bg-white border-b-4 border-[#B8860B] hover:border-black active:border-b-0 active:translate-y-1'
                            }`}
                          disabled={event.registered >= event.capacity}
                        >
                          {event.registered >= event.capacity ? 'MISSION_FULL' : 'ENGAGE_PROTOCOL'}
                        </button>
                        <div className="text-center mt-2 text-[10px] font-arcade text-gray-500">
                          SLOTS: {event.registered}/{event.capacity}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {events.length === 0 && (
            <div className="text-center py-32 border-2 border-dashed border-[#333] rounded-lg">
              <p className="text-[#FFD400] font-arcade text-xl uppercase mb-4">NO_ACTIVE_MISSIONS</p>
              <p className="text-gray-500 font-sans italic mt-4">Standby for new objectives.</p>
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
      <Footer />
    </>
  );
}
