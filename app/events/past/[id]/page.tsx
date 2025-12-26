'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { GameEvent } from '@/lib/types';
import { splitDateTime } from '@/lib/utils';

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();

  const [event, setEvent] = useState<GameEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchEvent();
  }, [id]);

  async function fetchEvent() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/events/${id}`);
      if (!res.ok) throw new Error(`Failed to fetch event (${res.status})`);

      const data = await res.json();
      if (!data.success || !data.event) throw new Error('Event not found');

      setEvent(data.event);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center">
        <div className="text-amber-500 font-header tracking-[0.3em] animate-pulse">
          LOADING EVENT...
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-header text-4xl mb-4">EVENT NOT FOUND</h1>
          <Link href="/events/past" className="text-amber-500 font-header text-[10px] tracking-[0.4em]">
            RETURN TO EVENTS
          </Link>
        </div>
      </div>
    );
  }

  const isFull = event.registered >= event.capacity;
  const { date, time } = splitDateTime(event.datetime);

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-6 md:px-12">

        <Link href="/events/past" className="font-header text-[10px] tracking-[0.4em] text-white/40 hover:text-amber-500 mb-12 inline-block">
          ← BACK TO EVENTS
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">

          {/* LEFT */}
          <div className="md:col-span-2">

            {/* Image */}
            <div className="aspect-video overflow-hidden rounded-sm border border-white/10 bg-white/5 mb-8">
              <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
            </div>

            {/* Description */}
            <Section title="Event Details">
              <p className="text-white/70 font-serif italic text-lg leading-relaxed">
                {event.description}
              </p>
            </Section>

            {/* Highlights */}
            {event.highlights && event.highlights?.length > 0 && (
              <Section title="Event Highlights">
                <ul className="space-y-3 list-disc list-inside text-white/70 font-serif italic">
                  {event.highlights.map((h, i) => (
                    <li key={i}>{h.text}</li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Gallery */}
            {event.gallery && event.gallery?.length > 0 && (
              <Section title="Moments from the Event">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {event.gallery.map((img, i) => (
                    <div key={i} className="aspect-video overflow-hidden rounded-sm border border-white/10 bg-white/5">
                      <img src={img} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Testimonials */}
            {event.testimonials && event.testimonials?.length > 0 && (
              <Section title="What People Said">
                <div className="space-y-6">
                  {event.testimonials.map((t, i) => (
                    <blockquote key={i} className="border-l-2 border-amber-500 pl-6 text-white/70 font-serif italic">
                      "{t.quote}"
                      <footer className="mt-2 text-white/40 text-sm not-italic">
                        — {t.name}{t.role ? `, ${t.role}` : ''}
                      </footer>
                    </blockquote>
                  ))}
                </div>
              </Section>
            )}

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-8 mb-12">
              <Info label="DATE & TIME">
                <p>{date}</p>
                <p className="text-white/60">{time}</p>
              </Info>
              <Info label="LOCATION">{event.location}</Info>
              <Info label="CAPACITY">{event.registered} / {event.capacity}</Info>
              <Info label="PRICE">{event.price === 0 ? 'FREE' : `₹${event.price}`}</Info>
            </div>

            {/* Availability */}
            <div className="mb-12">
              <p className="font-header text-[8px] tracking-widest text-white/40 mb-3">AVAILABILITY</p>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className={`h-full rounded-full ${isFull ? 'bg-red-500' : 'bg-amber-500'}`}
                  style={{ width: `${(event.registered / event.capacity) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="md:col-span-1">
            <div className="border border-white/10 p-8 rounded-sm sticky top-32">
              <h3 className="font-header text-[10px] tracking-[0.4em] text-amber-500 mb-6 uppercase">
                EVENT SUMMARY
              </h3>

              <div className="space-y-6 mb-8 pb-8 border-b border-white/10">
                <Stat label="REGISTERED" value={event.registered} />
                <Stat label="PRICE" value={event.price === 0 ? 'FREE' : `₹${event.price}`} />
              </div>

              <p className="text-white/40 font-serif italic text-xs">
                This is a past event. Registration is closed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------- HELPERS -------------------- */

function Section({ title, children }: { title: string; children: any }) {
  return (
    <div className="mb-12">
      <h2 className="font-header text-[10px] tracking-[0.4em] text-amber-500 mb-4 uppercase">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Info({ label, children }: { label: string; children: any }) {
  return (
    <div className="border-b border-white/10 pb-6">
      <div className="font-header text-[8px] tracking-widest text-white/40 mb-3">{label}</div>
      <div className="font-serif text-white">{children}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <p className="font-header text-[8px] tracking-widest text-white/40 mb-2">{label}</p>
      <p className="font-serif italic text-2xl text-amber-500">{value}</p>
    </div>
  );
}