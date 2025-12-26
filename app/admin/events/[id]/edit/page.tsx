'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Calendar, MapPin, DollarSign, Image as ImageIcon, FileText, Star, Film, MessageSquare, Save, RotateCcw } from 'lucide-react';

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
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-[#FFD400] font-arcade tracking-[0.3em] animate-pulse text-xl">
          RETRIEVING_DATA
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-12 pb-24 px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 border-b-2 border-[#333] pb-8">
          <h1 className="text-4xl font-arcade text-[#FFD400] text-shadow-glow mb-2">
            MODIFY_EVENT_PARAMETERS
          </h1>
          <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">
            Adjust coordinates and operational details.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          <Section title="MISSION_DATA" icon={<FileText className="w-4 h-4 text-[#FFD400]" />}>
            <Field label="OPERATION_CODENAME (Title)" name="title" value={form.title} icon={<FileText className="w-3 h-3" />} onChange={handleChange} />
            <Field
              label="MISSION_BRIEF (Description)"
              name="description"
              textarea
              value={form.description}
              icon={<MessageSquare className="w-3 h-3" />}
              onChange={handleChange}
            />
            <Field
              label="VISUAL_ASSET_URL (Image)"
              name="image"
              value={form.image}
              icon={<ImageIcon className="w-3 h-3" />}
              onChange={handleChange}
            />
          </Section>

          <Section title="COORDINATES & TIMING" icon={<MapPin className="w-4 h-4 text-[#00B894]" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field
                label="T-MINUS (Date & Time)"
                name="datetime"
                type="datetime-local"
                value={form.datetime}
                icon={<Calendar className="w-3 h-3" />}
                onChange={handleChange}
              />
              <Field
                label="SECTOR_LOCATION"
                name="location"
                value={form.location}
                icon={<MapPin className="w-3 h-3" />}
                onChange={handleChange}
              />
            </div>
          </Section>

          <Section title="RESOURCE_ALLOCATION" icon={<DollarSign className="w-4 h-4 text-blue-400" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field
                label="ENTRY_COST (₹)"
                name="price"
                type="number"
                value={form.price}
                icon={<DollarSign className="w-3 h-3" />}
                onChange={handleChange}
              />
              <Field
                label="MAX_UNIT_CAPACITY"
                name="capacity"
                type="number"
                value={form.capacity}
                icon={<Star className="w-3 h-3" />}
                onChange={handleChange}
              />
            </div>
          </Section>

          {isPast && (
            <Section title="ARCHIVE_ENHANCEMENTS" accent icon={<Film className="w-4 h-4 text-purple-400" />}>
              <Field
                label="MISSION_HIGHLIGHTS (One per line)"
                name="highlights"
                textarea
                value={form.highlights}
                icon={<Star className="w-3 h-3" />}
                onChange={handleChange}
              />
              <Field
                label="GALLERY_DATA_LINKS (One per line)"
                name="gallery"
                textarea
                value={form.gallery}
                icon={<ImageIcon className="w-3 h-3" />}
                onChange={handleChange}
              />
              <Field
                label="OPERATIVE_DEBRIEFS (Testimonials)"
                name="testimonials"
                textarea
                value={form.testimonials}
                icon={<MessageSquare className="w-3 h-3" />}
                onChange={handleChange}
              />
            </Section>
          )}

          <div className="pt-8 border-t border-[#333] flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-8 py-4 bg-transparent border border-[#333] text-gray-400 font-arcade text-sm uppercase tracking-widest hover:text-white hover:border-gray-500 transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              ABORT
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-12 py-4 bg-[#FFD400] text-black font-arcade text-sm uppercase tracking-widest hover:bg-[#FFE066] transition-all flex items-center gap-3 group border border-[#FFD400]"
            >
              {saving ? 'UPDATING...' : 'CONFIRM_CHANGES'}
              <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Section({ title, children, accent, icon }: any) {
  return (
    <div className={`bg-[#080808] border-2 ${accent ? 'border-purple-500/30' : 'border-[#333]'} rounded-[4px] p-8 space-y-6 hover:border-[#FFD400]/20 transition-colors`}>
      <div className="flex items-center gap-3 border-b border-[#222] pb-4 mb-2">
        {icon && <div className="p-1.5 bg-[#111] rounded-sm border border-[#333]">{icon}</div>}
        <h2 className={`text-lg font-arcade tracking-widest uppercase ${accent ? 'text-purple-400' : 'text-gray-300'}`}>
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

function Field({ label, textarea, icon, ...props }: any) {
  return (
    <div className="group">
      <label className="block text-[#00B894] font-mono text-[10px] uppercase tracking-widest mb-2 group-hover:text-[#FFD400] transition-colors flex items-center gap-2">
        {icon}
        {label}
      </label>
      {textarea ? (
        <textarea
          {...props}
          rows={4}
          className="w-full bg-[#111] border border-[#333] rounded-sm px-4 py-3 text-white font-mono focus:border-[#FFD400] focus:outline-none transition-colors text-sm"
          placeholder=" "
        />
      ) : (
        <input
          {...props}
          className="w-full bg-[#111] border border-[#333] rounded-sm px-4 py-3 text-white font-mono focus:border-[#FFD400] focus:outline-none transition-colors text-sm"
          placeholder=" "
        />
      )}
    </div>
  );
}
