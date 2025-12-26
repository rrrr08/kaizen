'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, DollarSign, Image as ImageIcon, FileText, Star, Film, MessageSquare, Plus } from 'lucide-react';

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
    <div className="min-h-screen bg-[#050505] text-white pt-12 pb-24 px-8">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="mb-12 border-b-2 border-[#333] pb-8">
          <h1 className="text-4xl font-arcade text-[#FFD400] text-shadow-glow mb-2">
            INITIATE_EVENT_PROTOCOL
          </h1>
          <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">
            Define parameters for new engagement opportunity.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* BASIC INFO */}
          <Section title="MISSION_DATA" icon={<FileText className="w-4 h-4 text-[#FFD400]" />}>
            <Field label="OPERATION_CODENAME (Title)" name="title" icon={<FileText className="w-3 h-3" />} onChange={handleChange} />
            <Field
              label="MISSION_BRIEF (Description)"
              name="description"
              icon={<MessageSquare className="w-3 h-3" />}
              textarea
              onChange={handleChange}
            />
            <Field
              label="VISUAL_ASSET_URL (Image)"
              name="image"
              icon={<ImageIcon className="w-3 h-3" />}
              onChange={handleChange}
            />
          </Section>

          {/* TIME & LOCATION */}
          <Section title="COORDINATES & TIMING" icon={<MapPin className="w-4 h-4 text-[#00B894]" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field
                label="T-MINUS (Date & Time)"
                name="datetime"
                type="datetime-local"
                icon={<Calendar className="w-3 h-3" />}
                onChange={handleChange}
              />
              <Field
                label="SECTOR_LOCATION"
                name="location"
                icon={<MapPin className="w-3 h-3" />}
                onChange={handleChange}
              />
            </div>
          </Section>

          {/* PRICING */}
          <Section title="RESOURCE_ALLOCATION" icon={<DollarSign className="w-4 h-4 text-blue-400" />}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Field
                label="ENTRY_COST (₹)"
                name="price"
                type="number"
                icon={<DollarSign className="w-3 h-3" />}
                onChange={handleChange}
              />
              <Field
                label="MAX_UNIT_CAPACITY"
                name="capacity"
                type="number"
                icon={<Star className="w-3 h-3" />}
                onChange={handleChange}
              />
              <Field
                label="DEPLOYED_UNITS (Registered)"
                name="registered"
                type="number"
                icon={<Star className="w-3 h-3" />}
                onChange={handleChange}
              />
            </div>
          </Section>

          {/* PAST EVENT ONLY */}
          {isPast && (
            <Section title="ARCHIVE_ENHANCEMENTS" accent icon={<Film className="w-4 h-4 text-purple-400" />}>
              <Field
                label="MISSION_HIGHLIGHTS (One per line)"
                name="highlights"
                textarea
                icon={<Star className="w-3 h-3" />}
                onChange={handleChange}
              />
              <Field
                label="GALLERY_DATA_LINKS (One per line)"
                name="gallery"
                textarea
                icon={<ImageIcon className="w-3 h-3" />}
                onChange={handleChange}
              />
              <Field
                label="OPERATIVE_DEBRIEFS (Testimonials)"
                name="testimonials"
                textarea
                icon={<MessageSquare className="w-3 h-3" />}
                onChange={handleChange}
              />
            </Section>
          )}

          {/* SUBMIT */}
          <div className="pt-8 border-t border-[#333] flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-12 py-4 bg-[#FFD400] text-black font-arcade text-sm uppercase tracking-widest hover:bg-[#FFE066] transition-all flex items-center gap-3 group border border-[#FFD400]"
            >
              {loading ? 'EXECUTING...' : 'INITIATE_LAUNCH'}
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ================= UI BUILDING BLOCKS ================= */

function Section({
  title,
  children,
  accent,
  icon
}: {
  title: string;
  children: React.ReactNode;
  accent?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div
      className={`bg-[#080808] border-2 ${accent ? 'border-purple-500/30' : 'border-[#333]'} rounded-[4px] p-8 space-y-6 hover:border-[#FFD400]/20 transition-colors`}
    >
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

function Field({
  label,
  name,
  type = 'text',
  textarea,
  onChange,
  icon
}: {
  label: string;
  name: string;
  type?: string;
  textarea?: boolean;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  icon?: React.ReactNode;
}) {
  return (
    <div className="group">
      <label className="block text-[#00B894] font-mono text-[10px] uppercase tracking-widest mb-2 group-hover:text-[#FFD400] transition-colors flex items-center gap-2">
        {icon}
        {label}
      </label>
      {textarea ? (
        <textarea
          name={name}
          rows={4}
          className="w-full bg-[#111] border border-[#333] rounded-sm px-4 py-3 text-white font-mono focus:border-[#FFD400] focus:outline-none transition-colors text-sm"
          onChange={onChange}
        />
      ) : (
        <input
          type={type}
          name={name}
          className="w-full bg-[#111] border border-[#333] rounded-sm px-4 py-3 text-white font-mono focus:border-[#FFD400] focus:outline-none transition-colors text-sm"
          onChange={onChange}
        />
      )}
    </div>
  );
}
