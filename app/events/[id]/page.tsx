'use client';

import { EVENTS } from '@/lib/constants';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function EventDetail() {
  const params = useParams();
  const event = EVENTS.find(e => e.id === params.id);

  if (!event) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-header text-4xl mb-4">EVENT NOT FOUND</h1>
          <Link href="/events" className="text-amber-500 font-header text-[10px] tracking-[0.4em]">
            RETURN TO EVENTS
          </Link>
        </div>
      </div>
    );
  }

  const isFull = event.registered >= event.capacity;

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Back Button */}
        <Link href="/events" className="font-header text-[10px] tracking-[0.4em] text-white/40 hover:text-amber-500 mb-12 inline-block transition-colors">
          ← BACK TO EVENTS
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
          {/* Event Image */}
          <div className="md:col-span-2">
            <div className="aspect-video overflow-hidden rounded-sm border border-white/10 bg-white/5 mb-8">
              <img 
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Description */}
            <div className="mb-12">
              <h2 className="font-header text-[10px] tracking-[0.4em] text-amber-500 mb-4 uppercase">Event Details</h2>
              <p className="text-white/70 font-serif italic text-lg leading-relaxed">
                {event.description}
              </p>
            </div>

            {/* Event Info Grid */}
            <div className="grid grid-cols-2 gap-8 mb-12">
              <div className="border-b border-white/10 pb-6">
                <p className="font-header text-[8px] tracking-widest text-white/40 mb-3">DATE & TIME</p>
                <p className="font-serif text-white">{event.date}</p>
                <p className="font-serif text-white/60">{event.time}</p>
              </div>
              <div className="border-b border-white/10 pb-6">
                <p className="font-header text-[8px] tracking-widest text-white/40 mb-3">LOCATION</p>
                <p className="font-serif text-white">{event.location}</p>
              </div>
              <div className="border-b border-white/10 pb-6">
                <p className="font-header text-[8px] tracking-widest text-white/40 mb-3">CAPACITY</p>
                <p className="font-serif text-white">{event.registered} / {event.capacity} attendees</p>
              </div>
              <div className="border-b border-white/10 pb-6">
                <p className="font-header text-[8px] tracking-widest text-white/40 mb-3">PRICE</p>
                <p className="font-serif text-white">
                  {event.price === 0 ? 'FREE' : `₹${event.price}`}
                </p>
              </div>
            </div>

            {/* Capacity Indicator */}
            <div className="mb-12">
              <p className="font-header text-[8px] tracking-widest text-white/40 mb-3">AVAILABILITY</p>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className={`h-full rounded-full transition-all ${isFull ? 'bg-red-500' : 'bg-amber-500'}`}
                  style={{ width: `${(event.registered / event.capacity) * 100}%` }}
                ></div>
              </div>
              <p className="text-white/50 font-serif text-sm mt-2">
                {isFull ? 'Event is full. Join the waitlist.' : `${event.capacity - event.registered} spots remaining`}
              </p>
            </div>
          </div>

          {/* Sidebar - Registration */}
          <div className="md:col-span-1">
            <div className="border border-white/10 p-8 rounded-sm sticky top-32">
              <h3 className="font-header text-[10px] tracking-[0.4em] text-amber-500 mb-6 uppercase">REGISTER NOW</h3>

              {/* Event Stats */}
              <div className="space-y-6 mb-8 pb-8 border-b border-white/10">
                <div>
                  <p className="font-header text-[8px] tracking-widest text-white/40 mb-2">REGISTERED</p>
                  <p className="font-serif italic text-2xl text-amber-500">{event.registered}</p>
                </div>
                <div>
                  <p className="font-header text-[8px] tracking-widest text-white/40 mb-2">PRICE</p>
                  <p className="font-serif italic text-2xl text-amber-500">
                    {event.price === 0 ? 'FREE' : `₹${event.price}`}
                  </p>
                </div>
              </div>

              {/* Registration Form */}
              <form className="space-y-4">
                <div>
                  <label className="block font-header text-[8px] tracking-widest text-white/40 mb-2">NAME</label>
                  <input 
                    type="text"
                    placeholder="Your Name"
                    className="w-full bg-white/5 border border-white/10 focus:border-amber-500 rounded-sm px-4 py-3 font-serif text-white placeholder-white/30 transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-header text-[8px] tracking-widest text-white/40 mb-2">EMAIL</label>
                  <input 
                    type="email"
                    placeholder="your@email.com"
                    className="w-full bg-white/5 border border-white/10 focus:border-amber-500 rounded-sm px-4 py-3 font-serif text-white placeholder-white/30 transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-header text-[8px] tracking-widest text-white/40 mb-2">GUESTS (Optional)</label>
                  <select className="w-full bg-white/5 border border-white/10 focus:border-amber-500 rounded-sm px-4 py-3 font-serif text-white transition-colors">
                    <option value="0">Just me</option>
                    <option value="1">+1 guest</option>
                    <option value="2">+2 guests</option>
                    <option value="3">+3 guests</option>
                  </select>
                </div>

                <button 
                  type="submit"
                  disabled={isFull}
                  className={`w-full px-6 py-4 font-header text-[10px] tracking-[0.4em] rounded-sm transition-all mt-6 ${
                    isFull 
                      ? 'bg-red-500/20 text-red-500/60 border border-red-500/20 cursor-not-allowed'
                      : 'bg-amber-500 text-black hover:bg-amber-400'
                  }`}
                >
                  {isFull ? 'JOIN WAITLIST' : 'REGISTER NOW'}
                </button>
              </form>

              {/* Info */}
              <p className="text-white/40 font-serif italic text-xs mt-6 pt-6 border-t border-white/10">
                You will receive a confirmation email with event details and payment instructions if applicable.
              </p>
            </div>
          </div>
        </div>

        {/* Related Events */}
        <div className="mt-24 pt-24 border-t border-white/10">
          <h2 className="font-header text-3xl md:text-4xl mb-12">OTHER UPCOMING EVENTS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {EVENTS.filter(e => e.id !== event.id).slice(0, 2).map(relEvent => (
              <Link key={relEvent.id} href={`/events/${relEvent.id}`} className="group">
                <div className="aspect-video overflow-hidden rounded-sm mb-4 border border-white/5 group-hover:border-amber-500/40 transition-all bg-white/5">
                  <img 
                    src={relEvent.image}
                    alt={relEvent.title}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                </div>
                <h3 className="font-header text-sm tracking-wider group-hover:text-amber-500 transition-colors">{relEvent.title}</h3>
                <p className="text-white/40 font-serif text-xs mt-2">{relEvent.date}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
