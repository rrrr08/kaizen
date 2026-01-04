'use client';

import { TESTIMONIALS, GAMES } from '@/lib/constants';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { X, ArrowRight, Upload, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { CldUploadWidget } from 'next-cloudinary';

export default function Community() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventFilter, setEventFilter] = useState('All');

  // Testimonials State
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [submitForm, setSubmitForm] = useState({ name: '', role: '', quote: '', image: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await fetch('/api/testimonials');
      const data = await res.json();
      if (data.success) {
        setTestimonials(data.testimonials);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoadingTestimonials(false);
    }
  };

  const handlePhotoUpload = (result: any) => {
    if (result.event !== 'success') return;
    
    if (result.info && result.info.secure_url) {
      const imageUrl = result.info.secure_url;
      setSubmitForm({ ...submitForm, image: imageUrl });
      setPhotoPreview(imageUrl);
    }
  };

  const handleSubmitTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitForm),
      });
      const data = await res.json();
      if (data.success) {
        // Reset and close
        setSubmitForm({ name: '', role: '', quote: '', image: '' });
        setPhotoPreview(null);
        setIsSubmitOpen(false);
        alert('Thank you! Your story has been submitted for review.');
      } else {
        alert(data.error || 'Failed to submit');
      }
    } catch (error) {
      alert('Error submitting testimonial');
    } finally {
      setIsSubmitting(false);
    }
  };

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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = eventFilter === 'All'
    ? events
    : events.filter(e => e.price === 0 ? eventFilter === 'Free' : eventFilter === 'Paid');

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-[#FFFDF5]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#FFD93D] border-t-black mb-4"></div>
          <p className="text-black/60 font-black text-xs tracking-[0.4em]">LOADING COMMUNITY...</p>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen pt-32 pb-16 bg-[#FFFDF5] text-[#2D3436] selection:bg-[#FFD93D]/50">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="mb-20 border-b-2 border-black pb-12">
          <div className="text-[#6C5CE7] font-black text-sm tracking-[0.2em] mb-4 uppercase font-display">Events & Community Hub</div>
          <h1 className="font-header text-6xl md:text-8xl tracking-tighter mb-8 text-[#2D3436]">
            PLAY, GATHER & <br /><span className="text-[#FFD93D] drop-shadow-[2px_2px_0px_#000] italic font-serif">BELONG</span>
          </h1>
          <p className="text-black/70 font-bold text-xl max-w-3xl leading-relaxed">
            The heart of Joy Juncture. Discover local meets, join our digital tribe, and earn rewards for simply having fun.
          </p>
        </div>

        {/* --- EVENTS SECTION (Merged) --- */}
        <section className="mb-32">
          <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-12">
            <div>
              <h2 className="font-header text-4xl md:text-5xl mb-2 text-black">Upcoming Events</h2>
              <p className="text-black/60 font-bold text-lg">Soirees, workshops, and tournaments near you.</p>
            </div>
            <div className="flex gap-4 md:gap-4">
              {['All', 'Free', 'Paid'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setEventFilter(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all neo-border neo-shadow ${eventFilter === cat
                    ? 'bg-[#FFD93D] text-black scale-105'
                    : 'bg-white text-black hover:bg-gray-50'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {filteredEvents.map(event => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <div className="group cursor-pointer bg-white border-2 border-black p-4 rounded-[20px] neo-shadow hover:scale-[1.02] transition-transform transform-gpu isolation-isolate">
                  {/* Event Image */}
                  <div className="aspect-video overflow-hidden rounded-[15px] mb-6 border-2 border-black bg-gray-100 relative">
                    {event.image ? (
                      <Image
                        src={event.image}
                        alt={event.title}
                        fill
                        className="object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-black/20 font-black text-sm uppercase tracking-widest">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="space-y-4 px-2">
                    <div>
                      <div className="bg-[#6C5CE7] text-white px-2 py-1 rounded inline-block font-black text-[8px] tracking-[0.2em] mb-3 uppercase">
                        {event.date} • {event.time}
                      </div>
                      <h3 className="font-header text-2xl md:text-3xl text-black group-hover:text-[#6C5CE7] transition-colors tracking-tight mb-2">
                        {event.title}
                      </h3>
                      <p className="text-black/60 font-bold text-sm line-clamp-2">
                        {event.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t-2 border-black/10">
                      <div className="text-black/50 text-xs font-black uppercase tracking-widest">{event.location}</div>
                      <div>
                        {event.price === 0 ? (
                          <span className="text-[#00B894] font-black text-xs tracking-widest">FREE</span>
                        ) : (
                          <span className="text-black font-serif italic font-bold">₹{event.price}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-black/40 font-black text-lg uppercase">NO EVENTS MATCHING FILTER</p>
            </div>
          )}
        </section>

        {/* --- DIGITAL COMMUNITY SECTION --- */}
        <section className="mb-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Wallet & Points */}
            <div className="border-2 border-black p-8 rounded-[30px] bg-white neo-shadow hover:translate-y-[-4px] transition-transform">
              <h3 className="font-header text-sm tracking-[0.2em] text-[#6C5CE7] mb-6 uppercase border-b-2 border-black pb-2 font-black">Game Points & Wallet</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-black font-black text-lg mb-3">Earn points through:</p>
                  <ul className="space-y-2 text-black/70 font-medium text-sm">
                    <li className="flex items-center gap-2"><ArrowRight size={14} /> Purchasing games</li>
                    <li className="flex items-center gap-2"><ArrowRight size={14} /> Attending events</li>
                    <li className="flex items-center gap-2"><ArrowRight size={14} /> Playing online games</li>
                    <li className="flex items-center gap-2"><ArrowRight size={14} /> Community engagement</li>
                  </ul>
                </div>
                <div className="pt-4 border-t-2 border-black/10">
                  <p className="text-black font-black text-lg mb-3">Redeem for:</p>
                  <ul className="space-y-2 text-black/70 font-medium text-sm">
                    <li className="flex items-center gap-2"><ArrowRight size={14} /> Store discounts</li>
                    <li className="flex items-center gap-2"><ArrowRight size={14} /> Event tickets</li>
                    <li className="flex items-center gap-2"><ArrowRight size={14} /> Exclusive merchandise</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Blogs & Stories */}
            <div className="border-2 border-black p-8 rounded-[30px] bg-white neo-shadow hover:translate-y-[-4px] transition-transform">
              <h3 className="font-header text-sm tracking-[0.2em] text-[#FFD93D] mb-6 uppercase border-b-2 border-black pb-2 font-black drop-shadow-sm text-shadow-black">Community Stories</h3>
              <div className="space-y-4">
                <p className="text-black/70 font-medium text-sm leading-relaxed">
                  Join the conversation. Share your game nights, read strategy guides, and get featured in our editorial blog.
                </p>
                <div className="pt-6">
                  <Link href="/blog" className="text-black font-black text-xs tracking-[0.3em] hover:text-[#6C5CE7] hover:underline transition-all">VISIT THE BLOG →</Link>
                </div>
              </div>
            </div>

            {/* Puzzles & Challenges */}
            <div className="border-2 border-black p-8 rounded-[30px] bg-white neo-shadow hover:translate-y-[-4px] transition-transform">
              <h3 className="font-header text-sm tracking-[0.2em] text-[#00B894] mb-6 uppercase border-b-2 border-black pb-2 font-black">Daily Challenges</h3>
              <div className="space-y-4">
                <p className="text-black/70 font-medium text-sm leading-relaxed">
                  Test your wit with our rotating selection of puzzles and brain teasers.
                </p>
                <div className="space-y-3 pt-4 border-t-2 border-black/10">
                  {GAMES.slice(0, 2).map(game => (
                    <div key={game.id} className="border-b border-black/10 pb-3 last:border-0 flex justify-between items-center">
                      <p className="text-black font-bold text-xs">{game.title}</p>
                      <p className="text-[#00B894] font-black text-xs">+{game.points} pts</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <div className="mb-24 relative">
          <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-12">
            <div className="flex-1">
              <h2 className="font-header text-4xl md:text-5xl mb-2 tracking-tight text-black">Proof of Joy</h2>
              <p className="text-black/60 font-bold text-lg">Hear from our community of players and gatherers.</p>
            </div>
            <button
              onClick={() => setIsSubmitOpen(true)}
              className="px-6 py-3 bg-black text-white font-black text-xs tracking-[0.2em] hover:bg-[#6C5CE7] hover:scale-105 transition-all rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,0.2)]"
            >
              SHARE YOUR STORY +
            </button>
          </div>

          {loadingTestimonials ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#FFD93D] border-t-black"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map(testimonial => (
                <div key={testimonial.id} className="border-2 border-black p-8 rounded-[20px] bg-white neo-shadow hover:scale-[1.02] transition-transform flex flex-col justify-between">
                  <p className="text-black/80 font-medium italic mb-6 leading-relaxed">&quot;{testimonial.quote}&quot;</p>
                  <div className="flex items-center gap-4 mt-auto">
                    <div className="relative w-12 h-12 rounded-full border-2 border-black bg-gray-100 overflow-hidden">
                      <Image
                        src={testimonial.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${testimonial.name}`}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-black text-sm text-black">{testimonial.name}</p>
                      <p className="text-black/50 text-xs font-bold uppercase tracking-wider">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
              {testimonials.length === 0 && (
                <div className="col-span-3 text-center py-12 border-2 border-dashed border-black/20 rounded-[20px]">
                  <p className="text-black/40 font-black uppercase">No stories yet. Be the first!</p>
                </div>
              )}
            </div>
          )}

          {/* Submission Modal (Simple Overlay for now, or use Dialog if imported) */}
          {isSubmitOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white border-4 border-black p-8 rounded-[30px] max-w-md w-full shadow-[8px_8px_0px_#000] relative animate-in fade-in zoom-in duration-200">
                <button
                  onClick={() => setIsSubmitOpen(false)}
                  className="absolute top-4 right-4 text-black hover:rotate-90 transition-transform"
                >
                  <X size={24} />
                </button>

                <h3 className="font-header text-2xl mb-6 text-black">Share Your Story</h3>

                <form onSubmit={handleSubmitTestimonial} className="space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest mb-2 text-black/70">Name</label>
                    <input
                      required
                      value={submitForm.name}
                      onChange={e => setSubmitForm({ ...submitForm, name: e.target.value })}
                      className="w-full border-2 border-black rounded-xl p-3 font-bold focus:outline-none focus:ring-4 focus:ring-[#FFD93D]/50 transition-all placeholder:font-medium placeholder:text-black/20"
                      placeholder="Your Name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest mb-2 text-black/70">Role / Occasion</label>
                    <input
                      value={submitForm.role}
                      onChange={e => setSubmitForm({ ...submitForm, role: e.target.value })}
                      className="w-full border-2 border-black rounded-xl p-3 font-bold focus:outline-none focus:ring-4 focus:ring-[#FFD93D]/50 transition-all placeholder:font-medium placeholder:text-black/20"
                      placeholder="e.g. Wedding, Game Night"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest mb-2 text-black/70">Your Story</label>
                    <textarea
                      required
                      value={submitForm.quote}
                      onChange={e => setSubmitForm({ ...submitForm, quote: e.target.value })}
                      className="w-full border-2 border-black rounded-xl p-3 font-bold focus:outline-none focus:ring-4 focus:ring-[#FFD93D]/50 transition-all min-h-[100px] placeholder:font-medium placeholder:text-black/20 resize-none"
                      placeholder="Tell us about your experience..."
                    />
                  </div>

                  {/* Photo Upload */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest mb-2 text-black/70">
                      Add Photo (Optional)
                    </label>
                    <div className="border-2 border-dashed border-black rounded-xl p-6 hover:bg-gray-50 transition-colors">
                      {photoPreview ? (
                        <div className="relative">
                          <img
                            src={photoPreview}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-lg border-2 border-black"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setPhotoPreview(null);
                              setSubmitForm({ ...submitForm, image: '' });
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <CldUploadWidget
                          onSuccess={handlePhotoUpload}
                          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "kaizen_uploads"}
                        >
                          {({ open }) => (
                            <button
                              type="button"
                              onClick={() => open()}
                              className="w-full flex flex-col items-center justify-center cursor-pointer py-4"
                            >
                              <Upload className="w-8 h-8 text-black/40 mb-2" />
                              <p className="text-sm font-bold text-black/60 mb-1">Click to upload photo</p>
                              <p className="text-xs text-black/40">JPG, PNG up to 10MB</p>
                            </button>
                          )}
                        </CldUploadWidget>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-[#FFD93D] text-black font-black text-xs tracking-[0.2em] border-2 border-black hover:scale-[1.02] transition-all rounded-xl mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'SENDING...' : 'SUBMIT STORY'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Final CTA */}
        <div className="text-center py-16 border-t-2 border-black/10">
          <h2 className="font-header text-4xl md:text-5xl mb-6 text-black">Ready to Join?</h2>
          <p className="text-black/70 font-bold text-lg mb-8 max-w-2xl mx-auto">
            Create your account and start earning points, engaging with the community, and discovering endless joy.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/auth/signup"
              className="px-8 py-4 bg-black text-white font-black text-xs tracking-[0.4em] hover:bg-[#6C5CE7] hover:scale-105 transition-all rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,0.2)]"
            >
              CREATE ACCOUNT
            </Link>
            <Link
              href="/play"
              className="px-8 py-4 bg-[#FFD93D] text-black font-black text-xs tracking-[0.4em] border-2 border-black neo-shadow hover:scale-105 transition-all rounded-xl"
            >
              PLAY NOW
            </Link>
          </div>
        </div>
      </div>
    </div >
  );
}
