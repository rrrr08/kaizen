'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ImageUpload from '@/components/ui/ImageUpload';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { usePopup } from '@/app/context/PopupContext';


export default function EditEventPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { showAlert } = usePopup();
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<{
    title: string;
    datetime: string;
    location: string;
    price: string;
    description: string;
    image: string;
    capacity: string;
    highlights: string[];
    gallery: string[];
  }>({
    title: '',
    datetime: '',
    location: '',
    price: '',
    description: '',
    image: '',
    capacity: '',
    highlights: [''],
    gallery: [],
  });

  const isPast =
    form.datetime &&
    new Date(form.datetime).getTime() < Date.now();

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace('/');
        return;
      }

      try {
        const snap = await getDoc(doc(db, 'users', user.uid));

        if (!snap.exists() || snap.data()?.role !== 'admin') {
          router.replace('/');
          return;
        }

        setCheckingAdmin(false); // ✅ admin confirmed
      } catch (err) {
        console.error('Admin check failed', err);
        router.replace('/');
      }
    });

    return () => unsubscribe();
  }, [router]);


  useEffect(() => {
    if (!id || checkingAdmin) return;

    (async () => {
      try {
        const res = await fetch(`/api/events/${id}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to load event');
        }

        const e = data.event;

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
          highlights: e.highlights?.map((h: any) => h.text) ?? [''],
          gallery: e.gallery ?? [],
        });
      } catch (err) {
        console.error(err);
        showAlert('Failed to load event', 'error');
        router.push('/admin/events');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, checkingAdmin, router]);


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleArrayChange = (field: 'highlights', index: number, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: 'highlights') => {
    setForm(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'highlights', index: number) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleGalleryChange = (urls: string[]) => {
    setForm(prev => ({ ...prev, gallery: urls }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Validate that the event datetime is not in the past
    if (form.datetime && new Date(form.datetime).getTime() < Date.now()) {
      await showAlert('Cannot set event date and time to a past date/time', 'error');
      setSaving(false);
      return;
    }

    const payload: any = {
      title: form.title,
      description: form.description,
      datetime: new Date(form.datetime),
      location: form.location,
      capacity: Number(form.capacity),
    };

    if (form.image) payload.image = form.image;
    if (form.price) payload.price = Number(form.price);

    // Only add highlights and gallery for past events
    const eventIsPast = new Date(form.datetime).getTime() < Date.now();
    if (eventIsPast) {
      payload.highlights = form.highlights
        .filter((text: string) => text.trim().length > 0)
        .map((text: string) => ({ text }));

      payload.gallery = form.gallery.filter((url: string) => url.trim().length > 0);
    }

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        await showAlert('Not authenticated', 'error');
        return;
      }

      const token = await user.getIdToken();

      const res = await fetch(`/api/events/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to update event');
      }

      router.push('/admin/events');
    } catch (err) {
      console.error(err);
      await showAlert('Failed to update event', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFDF5]">
        <p className="font-black text-xs tracking-widest text-black/60">
          CHECKING ACCESS…
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-16 flex items-center justify-center bg-[#FFFDF5]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#FFD93D] border-t-black mb-4"></div>
          <p className="text-black/60 font-black text-xs tracking-[0.4em]">LOADING EVENT...</p>
        </div>
      </div>
    );
  }

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
            Edit Mode
          </div>
          <h1 className="font-header text-4xl md:text-6xl text-black mb-4 tracking-tight leading-none">
            EDIT EVENT
          </h1>
          <p className="text-black/70 font-medium text-lg leading-relaxed max-w-2xl">
            Update the details for <span className="font-bold text-black">{form.title}</span>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">

          <Section title="Basic Information">
            <Field label="Event Title" name="title" value={form.title} onChange={handleChange} />
            <Field
              label="Description"
              name="description"
              textarea
              rows={4}
              value={form.description}
              onChange={handleChange}
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
                min={new Date().toISOString().slice(0, 16)}
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
              <div className="p-4 bg-[#6C5CE7]/10 border-2 border-[#6C5CE7] rounded-xl mb-6">
                <p className="text-[#6C5CE7] font-bold text-sm">
                  This event has passed. You can add highlights and gallery images below.
                </p>
              </div>

              <div>
                <label className="font-black text-xs tracking-widest text-black/40 mb-3 uppercase pl-1 block">Highlights</label>
                <div className="space-y-4">
                  {form.highlights.map((highlight, index) => (
                    <div key={index} className="flex gap-4 items-start">
                      <textarea
                        value={highlight}
                        onChange={(e) => handleArrayChange('highlights', index, e.target.value)}
                        className="flex-1 px-4 py-3 bg-white border-2 border-black rounded-xl text-black placeholder:text-black/30 focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-all font-medium min-h-20 resize-y"
                        placeholder="Event highlight..."
                      />
                      {form.highlights.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('highlights', index)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors font-bold text-lg mt-2"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('highlights')}
                    className="px-4 py-2 bg-[#FFD93D] text-black font-bold border-2 border-black rounded-lg text-xs tracking-widest uppercase hover:translate-y-0.5 hover:shadow-none transition-all shadow-[2px_2px_0px_#000]"
                  >
                    + Add Highlight
                  </button>
                </div>
              </div>

              <div>
                <label className="font-black text-xs tracking-widest text-black/40 mb-3 uppercase pl-1 block">Gallery Images</label>
                <ImageUpload
                  value={form.gallery}
                  onChange={(url) => handleGalleryChange([...form.gallery, url])}
                  onRemove={(url) => handleGalleryChange(form.gallery.filter(u => u !== url))}
                  uploadId="event-gallery-edit"
                />
              </div>
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
              disabled={saving}
              className="px-8 py-4 bg-[#00B894] text-white border-2 border-black rounded-xl neo-shadow font-black text-xs tracking-widest hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase disabled:opacity-50"
            >
              {saving ? 'Saving Changes...' : 'Save Changes'}
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

function Field({ label, textarea, ...props }: any) {
  return (
    <div className="space-y-2">
      <label className="font-black text-xs tracking-widest text-black/40 uppercase pl-1">{label}</label>
      {textarea ? (
        <textarea
          {...props}
          className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-black placeholder:text-black/30 focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-all font-medium resize-y min-h-[100px]"
        />
      ) : (
        <input
          {...props}
          className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-black placeholder:text-black/30 focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-all font-medium"
        />
      )}
    </div>
  );
}
