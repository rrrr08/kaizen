'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditEventPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
  });

  const isPast =
  form.datetime &&
  new Date(form.datetime).getTime() < Date.now();


  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const res = await fetch(`/api/events/${id}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to load event');
        }

        const e = data.event;
        const eventDate = new Date(e.datetime);

        setForm({
          title: e.title ?? '',
          description: e.description ?? '',
          image: e.image ?? '',
          location: e.location ?? '',
          datetime: e.datetime
            ? new Date(e.datetime).toISOString().slice(0, 16)
            : '',
          price: e.price?.toString() ?? '',
          capacity: e.capacity?.toString() ?? '',
          highlights: e.highlights?.map((h: any) => h.text).join('\n') ?? '',
          gallery: e.gallery?.join('\n') ?? '',
          testimonials:
            e.testimonials?.map((t: any) => t.text).join('\n') ?? '',
        });
      } catch (err) {
        console.error(err);
        alert('Failed to load event');
        router.push('/admin/events');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const nonEmpty = (v: string) => v.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload: any = {
      title: form.title,
      description: form.description,
      datetime: new Date(form.datetime),
      location: form.location,
      capacity: Number(form.capacity),
    };

    if (form.image) payload.image = form.image;
    if (form.price) payload.price = Number(form.price);

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

    const res = await fetch(`/api/events/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (res.ok) router.push('/admin/events');
    else alert('Failed to update event');
  };

  if (loading) {
    return <div className="p-12 text-white/60">Loading event…</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="mb-14">
        <h1 className="text-4xl font-display gradient-gold">
          Edit Event
        </h1>
        <p className="text-muted-foreground mt-3">
          Update details of your event.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-16">

        <Section title="Basic Information">
          <Field label="Event Title" name="title" value={form.title} onChange={handleChange} />
          <Field
            label="Description"
            name="description"
            textarea
            value={form.description}
            onChange={handleChange}
          />
          <Field
            label="Cover Image URL"
            name="image"
            value={form.image}
            onChange={handleChange}
          />
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
          </div>
        </Section>

        {isPast && (
          <Section title="Past Event Enhancements" accent>
            <Field
              label="Highlights (one per line)"
              name="highlights"
              textarea
              value={form.highlights}
              onChange={handleChange}
            />
            <Field
              label="Gallery Image URLs"
              name="gallery"
              textarea
              value={form.gallery}
              onChange={handleChange}
            />
            <Field
              label="Testimonials"
              name="testimonials"
              textarea
              value={form.testimonials}
              onChange={handleChange}
            />
          </Section>
        )}

        <div className="pt-6">
          <button
            type="submit"
            disabled={saving}
            className="px-12 py-3 rounded-full bg-[#fe9a00] text-black glow-gold"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children, accent }: any) {
  return (
    <div className={`glass-card p-8 rounded-xl space-y-6 ${accent ? 'border-[#fe9a00]/40' : ''}`}>
      <h2 className="text-xl font-header uppercase">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, textarea, ...props }: any) {
  return (
    <div className="lux-input">
      {textarea ? <textarea {...props} placeholder=" " /> : <input {...props} placeholder=" " />}
      <label>{label}</label>
    </div>
  );
}
