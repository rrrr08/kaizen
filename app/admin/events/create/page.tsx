'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/ui/ImageUpload';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getAuth } from 'firebase/auth';

export const dynamic = 'force-dynamic';

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({
    title: '',
    datetime: '',
    location: '',
    price: '',
    description: '',
    image: '',
    capacity: '',
    highlights: '',
    gallery: '',
    testimonials: '',
    registered: ''
  });



  // Derived state: past/upcoming decided by datetime
  const isPast =
    form.datetime &&
    new Date(form.datetime).getTime() < Date.now();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const nonEmpty = (v: string): v is string => v.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload: any = {
      title: form.title,
      datetime: form.datetime,
      location: form.location,
      description: form.description,
      capacity: Number(form.capacity),
      registered: Number(form.registered) || 0,
      status: isPast ? 'past' : 'upcoming'
    };

    if (form.price) payload.price = Number(form.price);
    if (form.image) payload.image = form.image;

    if (isPast) {
      payload.highlights = form.highlights
        .split('\n')
        .filter(nonEmpty)
        .map(text => ({ text }));

      payload.gallery = form.gallery
        .split('\n')
        .filter(nonEmpty);

      payload.testimonials = form.testimonials
        .split('\n')
        .filter(nonEmpty)
        .map(text => ({ text }));
    }

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert('Not authenticated');
      return;
    }

    const token = await user.getIdToken();

    const res = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (res.ok) router.push('/admin/events');
    else alert('Failed to create event');
  };

  return (
    <div className="min-h-screen pt-32 pb-16 bg-[#FFFDF5]">
      <div className="max-w-4xl mx-auto px-6">

        <Link
          href="/admin/events"
          className="font-black text-xs tracking-widest text-black/50 hover:text-[#6C5CE7] mb-8 inline-flex items-center gap-2 transition-colors uppercase"
        >
          <ArrowLeft size={16} /> Back to Events
        </Link>

        <div className="mb-12">
          <div className="bg-[#FFD93D] text-black px-4 py-1.5 rounded-lg border-2 border-black inline-block font-black text-[10px] tracking-[0.2em] mb-4 uppercase shadow-[2px_2px_0px_#000]">
            Create Mode
          </div>
          <h1 className="font-header text-4xl md:text-6xl text-black mb-4 tracking-tight leading-none">
            NEW EVENT
          </h1>
          <p className="text-black/70 font-medium text-lg leading-relaxed max-w-2xl">
            Design a premium experience for the Joy Juncture community.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">

          <Section title="Basic Information">
            <Field label="Event Title" name="title" value={form.title} onChange={handleChange} maxLength={100} />
            <Field
              label="Description"
              name="description"
              textarea
              rows={4}
              value={form.description}
              onChange={handleChange}
              maxLength={2000}
              showCounter
            />
            <div className="bg-white border-2 border-black rounded-xl p-6">
              <label className="font-black text-xs tracking-widest text-black/40 mb-3 uppercase block">Cover Image</label>
              <ImageUpload
                value={form.image ? [form.image] : []}
                onChange={(url) => setForm(prev => ({ ...prev, image: url }))}
                onRemove={() => setForm(prev => ({ ...prev, image: '' }))}
              />
            </div>
          </Section>

          <Section title="Time & Location">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field
                label="Date & Time"
                name="datetime"
                type="datetime-local"
                value={form.datetime}
                onChange={handleChange}
              />
              <Field
                label="Location"
                name="location"
                value={form.location}
                onChange={handleChange}
                maxLength={200}
              />
            </div>
          </Section>

          <Section title="Pricing & Capacity">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field
                label="Price (₹)"
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
              />
              <Field
                label="Capacity"
                name="capacity"
                type="number"
                value={form.capacity}
                onChange={handleChange}
              />
              <Field
                label="Registered"
                name="registered"
                type="number"
                value={form.registered}
                onChange={handleChange}
              />
            </div>
          </Section>

          {isPast && (
            <Section title="Past Event Enhancements" accent>
              <div className="p-4 bg-[#6C5CE7]/10 border-2 border-[#6C5CE7] rounded-xl mb-6">
                <p className="text-[#6C5CE7] font-bold text-sm">
                  This event is in the past. You can add highlights, gallery images, and testimonials below.
                </p>
              </div>

              <Field
                label="Highlights (one per line)"
                name="highlights"
                textarea
                rows={4}
                value={form.highlights}
                onChange={handleChange}
              />
              <Field
                label="Gallery Image URLs (one per line)"
                name="gallery"
                textarea
                rows={4}
                value={form.gallery}
                onChange={handleChange}
              />
              <Field
                label="Testimonials (one per line)"
                name="testimonials"
                textarea
                rows={4}
                value={form.testimonials}
                onChange={handleChange}
              />
            </Section>
          )}

          <div className="pt-6 flex items-center justify-end gap-4">
            <Link
              href="/admin/events"
              className="px-8 py-4 bg-white text-black border-2 border-black rounded-xl font-black text-xs tracking-widest hover:bg-gray-50 transition-all uppercase"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-[#00B894] text-white border-2 border-black rounded-xl neo-shadow font-black text-xs tracking-widest hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase disabled:opacity-50"
            >
              {loading ? 'Publishing...' : 'Publish Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Section({ title, children, accent }: any) {
  return (
    <div className={`bg-white border-2 border-black rounded-[30px] p-8 neo-shadow relative overflow-hidden ${accent ? 'border-[#6C5CE7]' : ''}`}>
      {accent && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#6C5CE7]/10 rounded-bl-[100px] -mr-8 -mt-8 pointer-events-none" />
      )}
      <h2 className={`font-black text-xs tracking-widest mb-8 uppercase border-b-2 border-black/10 pb-4 ${accent ? 'text-[#6C5CE7]' : 'text-black/50'}`}>
        {title}
      </h2>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}

function Field({ label, textarea, showCounter, ...props }: any) {
  return (
    <div className="space-y-2">
      <label className="font-black text-xs tracking-widest text-black/40 uppercase pl-1">{label}</label>
      {textarea ? (
        <>
          <textarea
            {...props}
            className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-black placeholder:text-black/30 focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-all font-medium resize-y min-h-[100px]"
          />
          {showCounter && props.maxLength && (
            <p className="text-[10px] text-black/40 font-bold mt-1 uppercase tracking-wider text-right">
              {props.value?.length || 0}/{props.maxLength}
            </p>
          )}
        </>
      ) : (
        <>
          <input
            {...props}
            className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-black placeholder:text-black/30 focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-all font-medium"
          />
          {props.maxLength && (
            <p className="text-[10px] text-black/40 font-bold mt-1 uppercase tracking-wider text-right">
              {props.value?.length || 0}/{props.maxLength}
            </p>
          )}
        </>
      )}
    </div>
  );
}
