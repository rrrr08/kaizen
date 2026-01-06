'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { GameEvent } from '@/lib/types';
import { splitDateTime } from '@/lib/utils';
import { usePopup } from '@/app/context/PopupContext';
import { ArrowLeft } from 'lucide-react';

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
            href="/events/past"
            className="px-6 py-3 bg-[#FFD93D] text-black border-2 border-black rounded-xl neo-shadow font-black text-xs tracking-widest hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} /> RETURN TO EVENTS
          </Link>
        </div>
      </div>
    );
  }

  const isFull = event.registered >= event.capacity;
  const { date, time } = splitDateTime(event.datetime);

  return (
    <div className="min-h-screen pt-28 pb-16 bg-[#FFFDF5]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">

        <Link
          href="/events/past"
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
              <div className="bg-gray-300 text-black/60 px-4 py-1.5 rounded-lg neo-border shadow-[2px_2px_0px_#000] inline-block font-black text-[10px] tracking-[0.2em] mb-6 uppercase">
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

            {event.highlights && event.highlights.length > 0 && (
              <Section title="Event Highlights">
                <ul className="space-y-3 list-disc list-inside text-black/70 font-medium">
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
                      className="aspect-video overflow-hidden rounded-[20px] border-2 border-black neo-shadow bg-white"
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
                <div className="space-y-4 max-w-xl bg-white border-2 border-black rounded-xl p-6 neo-shadow">

                  {/* Rating */}
                  <div>
                    <p className="text-black/40 text-xs font-black uppercase tracking-widest mb-2">RATING</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(n => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setRating(n)}
                          className={`text-2xl transition ${n <= rating ? 'text-[#FFD93D]' : 'text-black/20'
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
                    className="w-full bg-[#FFFDF5] border-2 border-black rounded-xl px-4 py-3 text-black placeholder-black/30 focus:outline-none focus:ring-0 font-bold transition-all"
                  />

                  <button
                    onClick={submitTestimonial}
                    disabled={submitting}
                    className="px-6 py-3 bg-[#FFD93D] text-black font-black uppercase tracking-wide rounded-xl border-2 border-black neo-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50"
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
                    <blockquote key={i} className="bg-[#FFFDF5] border-2 border-black rounded-xl p-6 neo-shadow text-black/70 font-medium italic">
                      "{t.comment}"
                      <footer className="mt-4 text-black/40 text-sm not-italic font-black uppercase tracking-widest">
                        — {t.name}
                        {t.edited && (
                          <span className="ml-2 text-[10px] text-[#6C5CE7]">
                            Edited
                          </span>
                        )}
                      </footer>
                    </blockquote>
                  ))}
                </div>
              </Section>
            )}

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
              <Info label="DATE & TIME">
                <p>{date}</p>
                <p className="text-black/60 text-sm">{time}</p>
              </Info>

              <Info label="LOCATION">{event.location}</Info>
              <Info label="ATTENDED">
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
                    width: `${Math.min(100, (event.registered / event.capacity) * 100)}%`,
                  }}
                />
              </div>
              <p className="text-black/60 font-bold text-sm mt-2">
                {event.registered} spots filled
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-1">
            <div className="bg-white border-3 border-black p-8 rounded-[30px] neo-shadow sticky top-32">
              <h3 className="font-black text-xs tracking-widest text-[#6C5CE7] mb-8 uppercase">
                EVENT SUMMARY
              </h3>

              <div className="space-y-8 mb-8 pb-8 border-b-2 border-black/10">
                <Stat label="ATTENDED" value={event.registered} />
                <Stat
                  label="PRICE"
                  value={event.price === 0 ? 'FREE' : `₹${event.price}`}
                />
              </div>

              <p className="text-black/40 font-bold text-xs">
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
