'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: '',
    datetime: '',
    location: '',
    price: '',
    description: '',
    image: '',
    capacity: '',
    registered: '',
    highlights: '',
    gallery: '',
    testimonials: '',
  });

  // ✅ Derived state: past/upcoming decided by datetime
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
      datetime: new Date(form.datetime),
      location: form.location,
      description: form.description,
      capacity: Number(form.capacity),
      registered: 0,
    };

    if (form.price) payload.price = Number(form.price);
    if (form.image) payload.image = form.image;

    // ✅ Add past-only fields automatically
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

    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (res.ok) router.push('/admin/events');
    else alert('Failed to create event');
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      {/* HEADER */}
      <div className="mb-14">
        <h1 className="text-4xl font-display gradient-gold">
          Create Event
        </h1>
        <p className="text-muted-foreground mt-3 max-w-xl">
          Design a premium experience for the Joy Juncture community.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-16">

        {/* BASIC INFO */}
        <Section title="Basic Information">
          <Field label="Event Title" name="title" onChange={handleChange} />
          <Field
            label="Description"
            name="description"
            textarea
            onChange={handleChange}
          />
          <Field
            label="Cover Image URL"
            name="image"
            onChange={handleChange}
          />
        </Section>

        {/* TIME & LOCATION */}
        <Section title="Time & Location">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field
              label="Date & Time"
              name="datetime"
              type="datetime-local"
              onChange={handleChange}
            />
            <Field
              label="Location"
              name="location"
              onChange={handleChange}
            />
          </div>
        </Section>

        {/* PRICING */}
        <Section title="Pricing & Capacity">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Field
              label="Price (₹)"
              name="price"
              type="number"
              onChange={handleChange}
            />
            <Field
              label="Capacity"
              name="capacity"
              type="number"
              onChange={handleChange}
            />
            <Field
              label="Already Registered"
              name="registered"
              type="number"
              onChange={handleChange}
            />
          </div>
        </Section>

        {/* PAST EVENT ONLY */}
        {isPast && (
          <Section title="Past Event Enhancements" accent>
            <Field
              label="Highlights (one per line)"
              name="highlights"
              textarea
              onChange={handleChange}
            />
            <Field
              label="Gallery Image URLs"
              name="gallery"
              textarea
              onChange={handleChange}
            />
            <Field
              label="Testimonials"
              name="testimonials"
              textarea
              onChange={handleChange}
            />
          </Section>
        )}

        {/* SUBMIT */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={loading}
            className="px-12 py-3 rounded-full font-header-bold
              bg-[#fe9a00] text-black
              hover:scale-[1.02] transition-all glow-gold"
          >
            {loading ? 'Publishing…' : 'Publish Event'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ================= UI BUILDING BLOCKS ================= */

function Section({
  title,
  children,
  accent,
}: {
  title: string;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={`glass-card p-8 rounded-xl space-y-6
        ${accent ? 'border-[#fe9a00]/40' : ''}`}
    >
      <h2 className="text-xl font-header tracking-wide uppercase">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({
  label,
  name,
  type = 'text',
  textarea,
  onChange,
}: {
  label: string;
  name: string;
  type?: string;
  textarea?: boolean;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}) {
  return (
    <div className="lux-input">
      {textarea ? (
        <textarea
          name={name}
          placeholder=" "
          onChange={onChange}
        />
      ) : (
        <input
          type={type}
          name={name}
          placeholder=" "
          onChange={onChange}
        />
      )}
      <label>{label}</label>
    </div>
  );
}
