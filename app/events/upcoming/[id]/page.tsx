'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { GameEvent } from '@/lib/types';
import { splitDateTime } from '@/lib/utils';
import EventRegistrationForm from '@/components/EventRegistrationForm';
import { useGamification } from '@/app/context/GamificationContext';
import { ArrowLeft, Zap } from 'lucide-react';
import ChatInterface from '@/app/components/community/ChatInterface';

export const dynamic = 'force-dynamic';

export default function UpcomingEventDetail() {
  const { id } = useParams<{ id: string }>();
  const { hasEarlyEventAccess } = useGamification();

  const [event, setEvent] = useState<GameEvent | null>(null);
  const [availableSlots, setAvailableSlots] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

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
    if (!id) return;
    fetchEvent();
  }, [id]);

  useEffect(() => {
    if (user && id) {
      checkRegistration();
    }
  }, [user, id]);

  async function checkRegistration() {
    try {
      const { getFirestore, collection, query, where, getDocs } = await import('firebase/firestore');
      const { app } = await import('@/lib/firebase');
      const db = getFirestore(app);

      const q = query(
        collection(db, 'event_registrations'),
        where('eventId', '==', id),
        where('userId', '==', user.uid)
      );

      const snapshot = await getDocs(q);
      setIsRegistered(!snapshot.empty);
    } catch (err) {
      console.error('Error checking registration:', err);
    }
  }

  async function fetchEvent() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/events/${id}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Failed to fetch event (${res.status})`);

      const data = await res.json();
      if (!data.success || !data.event) throw new Error('Event not found');

      setEvent(data.event);
      if (typeof data.availableSlots === 'number') {
        setAvailableSlots(data.availableSlots);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-[#FFFDF5]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#FFD93D] border-t-black mb-4"></div>
          <p className="text-black/60 font-black text-xs tracking-[0.4em]">LOADING EVENT...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-[#FFFDF5]">
        <div className="text-center">
          <h1 className="font-header text-4xl md:text-6xl mb-6 text-black">EVENT NOT FOUND</h1>
          <Link
            href="/events/upcoming"
            className="px-6 py-3 bg-[#FFD93D] text-black border-2 border-black rounded-xl neo-shadow font-black text-xs tracking-widest hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} /> RETURN TO EVENTS
          </Link>
        </div>
      </div>
    );
  }

  const isFull = (availableSlots !== null ? availableSlots <= 0 : event.registered >= event.capacity);
  const { date, time } = splitDateTime(event.datetime);

  // Generate Event Schema for SEO
  const eventDate = new Date(event.datetime);
  const eventSchema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description,
    startDate: eventDate.toISOString(),
    location: {
      '@type': 'Place',
      name: event.location,
      address: event.location,
    },
    image: event.image ? [event.image] : [],
    offers: {
      '@type': 'Offer',
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://joy-juncture.vercel.app'}/events/upcoming/${id}`,
      price: event.price,
      priceCurrency: 'INR',
      availability: isFull
        ? 'https://schema.org/SoldOut'
        : 'https://schema.org/InStock',
      validFrom: new Date().toISOString(),
    },
    organizer: {
      '@type': 'Organization',
      name: 'Joy Juncture',
      url: process.env.NEXT_PUBLIC_BASE_URL || 'https://joy-juncture.vercel.app',
    },
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  };

  return (
    <div className="min-h-screen pt-28 pb-16 bg-[#FFFDF5]">
      {/* Event Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12">

        <Link
          href="/events/upcoming"
          className="font-black text-xs tracking-widest text-black/50 hover:text-[#6C5CE7] mb-12 inline-flex items-center gap-2 transition-colors uppercase"
        >
          <ArrowLeft size={16} /> BACK TO EVENTS
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 md:gap-16">

          {/* LEFT */}
          <div className="lg:col-span-2">

            {/* Image */}
            <div className="aspect-video overflow-hidden rounded-[30px] border-3 border-black neo-shadow bg-white mb-12 group">
              {event.image && <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />}
            </div>

            {/* Title */}
            <div className="mb-12">
              <div className="bg-[#FFD93D] text-black px-4 py-1.5 rounded-lg neo-border shadow-[2px_2px_0px_#000] inline-block font-black text-[10px] tracking-[0.2em] mb-6 uppercase">
                {date} • {time}
              </div>
              <h1 className="font-header text-5xl md:text-7xl text-black mb-6 tracking-tight leading-none">
                {event.title}
              </h1>
            </div>

            {/* Description */}
            <Section title="Event Details">
              <p className="text-black/70 font-medium text-lg leading-relaxed">
                {event.description}
              </p>
            </Section>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
              <Info label="DATE & TIME">
                <p>{date}</p>
                <p className="text-black/60 text-sm">{time}</p>
              </Info>

              <Info label="LOCATION">{event.location}</Info>
              <Info label="CAPACITY">
                {event.registered} / {event.capacity}
              </Info>
              <Info label="PRICE">
                {event.price === 0 ? 'FREE' : `₹${event.price}`}
              </Info>
            </div>

            {/* Availability */}
            <div className="mb-12">
              <p className="font-black text-xs tracking-widest text-black/60 mb-3 uppercase">
                AVAILABILITY
              </p>
              <div className="w-full bg-gray-200 rounded-full h-4 border-2 border-black overflow-hidden">
                <div
                  className={`h-full ${isFull ? 'bg-[#FF7675]' : 'bg-[#00B894]'
                    } transition-all`}
                  style={{
                    width: `${Math.min(100, ((event.capacity - (availableSlots ?? (event.capacity - event.registered))) / event.capacity) * 100)}%`,
                    // Calculate percentage based on used slots (registered + locks)
                    // Used = Capacity - Available
                  }}
                />
              </div>
              <p className="text-black/60 font-bold text-sm mt-2">
                {availableSlots !== null ? availableSlots : event.capacity - event.registered} spots remaining
              </p>
            </div>

            {/* Event Chat */}
            <div className="mt-16 pt-16 border-t-2 border-black/10">
              <div className="flex items-center gap-3 mb-8">
                <h2 className="font-header text-3xl text-black">Event Chatroom</h2>
                <div className="px-3 py-1 bg-[#6C5CE7] text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                  Members Only
                </div>
              </div>

              {isRegistered ? (
                <div className="h-[600px] border-2 border-black rounded-[30px] overflow-hidden neo-shadow bg-white">
                  <ChatInterface containerId={id} containerType="event" />
                </div>
              ) : (
                <div className="bg-gray-50 border-2 border-black border-dashed rounded-[30px] p-12 text-center">
                  <p className="font-bold text-black/40 text-lg mb-4">
                    Join this event to access the community chat!
                  </p>
                  <p className="text-xs font-black uppercase tracking-widest text-black/20">
                    Register above to unlock
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-1">
            <div className="bg-white border-3 border-black p-8 rounded-[30px] neo-shadow sticky top-32">
              <h3 className="font-black text-xs tracking-widest text-[#6C5CE7] mb-8 uppercase">
                EVENT SUMMARY
              </h3>

              <div className="space-y-8 mb-8 pb-8 border-b-2 border-black/10">
                <Stat label="REGISTERED" value={event.registered} />
                <Stat
                  label="PRICE"
                  value={event.price === 0 ? 'FREE' : `₹${event.price}`}
                />
              </div>

              {hasEarlyEventAccess && (
                <div className="mb-6 p-4 bg-[#FFD93D]/30 border-2 border-[#FFD93D] rounded-xl">
                  <div className="flex items-center gap-3 text-black font-black text-xs tracking-widest">
                    <Zap size={16} className="text-black" fill="black" />
                    <span>EARLY ACCESS</span>
                  </div>
                  <p className="text-black/60 font-bold text-xs mt-2">Player Tier Perk</p>
                </div>
              )}

              <button
                onClick={() => setShowRegistrationForm(true)}
                disabled={isFull || isRegistered}
                className={`w-full px-6 py-4 font-black text-xs tracking-widest rounded-xl border-2 border-black transition-all ${isFull || isRegistered
                  ? 'bg-[#FF7675]/30 text-[#D63031] cursor-not-allowed opacity-60'
                  : 'bg-[#6C5CE7] text-white neo-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none'
                  }`}
              >
                {isRegistered ? 'ALREADY REGISTERED' : isFull ? 'EVENT FULL' : 'REGISTER NOW'}
              </button>

              {!isFull && !isRegistered && (
                <p className="text-center text-black/40 font-bold text-xs mt-4">
                  Secure your spot today!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Registration Form Modal */}
      {showRegistrationForm && event && (
        <EventRegistrationForm
          event={event}
          user={user}
          onSuccess={() => {
            setShowRegistrationForm(false);
            setEvent({ ...event, registered: event.registered + 1 });
            // Lock logic handles available slots decrement, so we don't double count here
            // If the user somehow registered without a lock, we might be off by 1, 
            // but the flow forces lock acquisition.
            setIsRegistered(true);
          }}
          onLockAcquired={() => {
            // Lock acquired: Decrease spots, Increase registered count
            if (availableSlots !== null && availableSlots > 0) {
              setAvailableSlots(prev => (prev !== null ? prev - 1 : null));
            }
            // Optimistically update registered count as per user request
            setEvent(prev => prev ? ({ ...prev, registered: Number(prev.registered) + 1 }) : null);
          }}
          onLockReleased={() => {
            // Lock released: Increase spots, Decrease registered count
            if (availableSlots !== null) {
              setAvailableSlots(prev => (prev !== null ? prev + 1 : null));
            }
            // Revert optimistic registered count
            setEvent(prev => prev ? ({ ...prev, registered: Math.max(0, Number(prev.registered) - 1) }) : null);
          }}
          onClose={() => setShowRegistrationForm(false)}
        />
      )}
    </div>
  );
}

/* -------------------- HELPERS -------------------- */

function Section({ title, children }: { title: string; children: any }) {
  return (
    <div className="mb-12">
      <h2 className="font-black text-xs tracking-widest text-[#6C5CE7] mb-6 uppercase">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Info({ label, children }: { label: string; children: any }) {
  return (
    <div className="bg-[#FFFDF5] border-2 border-black rounded-xl p-3 neo-shadow hover:-translate-y-1 transition-transform">
      <div className="font-black text-[10px] tracking-widest text-black/40 mb-3 uppercase">
        {label}
      </div>
      <div className="font-bold text-black text-lg">{children}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <p className="font-black text-[10px] tracking-widest text-black/40 mb-2 uppercase">
        {label}
      </p>
      <p className="font-header text-4xl text-[#6C5CE7] font-black">{value}</p>
    </div>
  );
}