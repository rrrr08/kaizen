'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { GameEvent } from '@/lib/types';
import { splitDateTime } from '@/lib/utils';
import { usePopup } from '@/app/context/PopupContext';

export const dynamic = 'force-dynamic';

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const { showAlert } = usePopup();
  const [user, setUser] = useState<any>(null);
  const [event, setEvent] = useState<GameEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myTestimonial, setMyTestimonial] = useState<any>(null);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
    if (!user || !event || !event.testimonials) return;

    const existing = event.testimonials.find(t => t.userId === user.uid);

    if (existing) {
      setMyTestimonial(existing);
      setRating(existing.rating || 0);
      setComment(existing.comment || '');
    } else {
      setMyTestimonial(null);
    }
  }, [user, event])

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
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function submitTestimonial() {
    if (!event || !user) return;
    if (rating === 0 || comment.trim() === '') {
      await showAlert('Please add rating and comment', 'warning');
      return;
    }

    try {
      setSubmitting(true);

      const method = myTestimonial?.comment ? 'PUT' : 'POST';

      const res = await fetch(`/api/events/${event.id}/testimonial`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          comment,
        }),
      });

      if (!res.ok) throw new Error('Failed to save testimonial');

      const data = await res.json();

      // backend should return updated testimonials
      setEvent(prev =>
        prev
          ? { ...prev, testimonials: data.testimonials }
          : prev
      );
    } catch (err) {
      console.error(err);
      await showAlert('Could not save testimonial', 'error');
    } finally {
      setSubmitting(false);
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
          <Link
            href="/events/past"
            className="text-amber-500 font-header text-[10px] tracking-[0.4em]"
          >
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

        <Link
          href="/events/past"
          className="font-header text-[10px] tracking-[0.4em] text-charcoal/50 hover:text-amber-500 mb-12 inline-block"
        >
          ← BACK TO EVENTS
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">

          {/* LEFT */}
          <div className="md:col-span-2">

            <div className="aspect-video overflow-hidden rounded-sm border border-black/10 bg-black/5 mb-8">
              <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
            </div>

            <Section title="Event Details">
              <p className="text-charcoal/70 font-serif italic text-lg leading-relaxed">
                {event.description}
              </p>
            </Section>

            {event.highlights && event.highlights.length > 0 && (
              <Section title="Event Highlights">
                <ul className="space-y-3 list-disc list-inside text-charcoal/70 font-serif italic">
                  {event.highlights.map((h, i) => (
                    <li key={i}>{h.text}</li>
                  ))}
                </ul>
              </Section>
            )}

            {event.gallery && event.gallery.length > 0 && (
              <Section title="Moments from the Event">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {event.gallery.map((img, i) => (
                    <div
                      key={i}
                      className="aspect-video overflow-hidden rounded-sm border border-black/10 bg-black/5"
                    >
                      <img src={img} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Testimonials */}
            {user && myTestimonial && (
              <Section title="Your Experience">
                <div className="space-y-4 max-w-xl">

                  {/* Rating */}
                  <div>
                    <p className="text-white/40 text-xs mb-2">RATING</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(n => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setRating(n)}
                          className={`text-2xl transition ${n <= rating ? 'text-amber-500' : 'text-white/20'
                            }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Share your experience..."
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 p-4 text-white text-sm rounded-sm focus:outline-none focus:border-amber-500"
                  />

                  <button
                    onClick={submitTestimonial}
                    disabled={submitting}
                    className="px-6 py-2 bg-amber-500 text-black text-xs font-header tracking-widest hover:bg-amber-400 disabled:opacity-50"
                  >
                    {myTestimonial?.comment ? 'UPDATE TESTIMONIAL' : 'SUBMIT TESTIMONIAL'}
                  </button>
                </div>
              </Section>
            )}

            {event.testimonials && event.testimonials?.length > 0 && (
              <Section title="What People Said">
                <div className="space-y-6">
                  {event.testimonials.map((t, i) => (
                    <blockquote key={i} className="border-l-2 border-amber-500 pl-6 text-white/70 font-serif italic">
                      "{t.comment}"
                      <footer className="mt-2 text-white/40 text-sm not-italic">
                        — {t.name}
                        {t.edited && (
                          <span className="ml-2 text-[10px] uppercase tracking-widest text-amber-500">
                            Edited
                          </span>
                        )}
                      </footer>
                    </blockquote>
                  ))}
                </div>
              </Section>
            )}

            <div className="grid grid-cols-2 gap-8 mb-12">
              <Info label="DATE & TIME">
                <p>{date}</p>
                <p className="text-charcoal/60">{time}</p>
              </Info>
              <Info label="LOCATION">{event.location}</Info>
              <Info label="CAPACITY">{event.registered} / {event.capacity}</Info>
              <Info label="PRICE">{event.price === 0 ? 'FREE' : `₹${event.price}`}</Info>
            </div>

            <div className="mb-12">
              <p className="font-header text-[8px] tracking-widest text-charcoal/50 mb-3">
                AVAILABILITY
              </p>
              <div className="w-full bg-black/10 rounded-full h-2">
                <div
                  className={`h-full rounded-full ${isFull ? 'bg-red-500' : 'bg-amber-500'}`}
                  style={{ width: `${(event.registered / event.capacity) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="md:col-span-1">
            <div className="border border-black/10 bg-white p-8 rounded-sm sticky top-32 neo-shadow">
              <h3 className="font-header text-[10px] tracking-[0.4em] text-amber-500 mb-6 uppercase">
                EVENT SUMMARY
              </h3>

              <div className="space-y-6 mb-8 pb-8 border-b border-black/10">
                <Stat label="REGISTERED" value={event.registered} />
                <Stat label="PRICE" value={event.price === 0 ? 'FREE' : `₹${event.price}`} />
              </div>

              <p className="text-charcoal/50 font-serif italic text-xs">
                This is a past event. Registration is closed.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ---------------- HELPERS ---------------- */

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
    <div className="border-b border-black/10 pb-6">
      <div className="font-header text-[8px] tracking-widest text-charcoal/50 mb-3">
        {label}
      </div>
      <div className="font-serif text-charcoal">{children}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <p className="font-header text-[8px] tracking-widest text-charcoal/50 mb-2">
        {label}
      </p>
      <p className="font-serif italic text-2xl text-amber-500">{value}</p>
    </div>
  );
}
