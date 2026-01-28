'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Save, X } from 'lucide-react';
import Link from 'next/link';
import ImageUpload from '@/components/ui/ImageUpload';
import { ExperienceCategory } from '@/lib/types';

interface FormData {
  name: string;
  slug: string;
  shortDescription: string;
  image: string[];
  whoFor: string;
  problemsSolved: string[];
  gamesFormats: string[];
  imageGallery: string[];
  published: boolean;
}

export default function EditExperienceCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    slug: '',
    shortDescription: '',
    image: [],
    whoFor: '',
    problemsSolved: [''],
    gamesFormats: [''],
    imageGallery: [],
    published: false,
  });

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);

        // Get auth token
        const { getAuth } = await import('firebase/auth');
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          setError('Authentication required');
          return;
        }

        const token = await user.getIdToken();

        const response = await fetch(`/api/experiences/${categoryId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch category');
        }

        const category = data.category;

        setFormData({
          name: category.name,
          slug: category.slug,
          shortDescription: category.shortDescription,
          image: category.image ? [category.image] : [],
          whoFor: category.whoFor,
          problemsSolved: category.problemsSolved.length > 0 ? category.problemsSolved : [''],
          gamesFormats: category.gamesFormats.length > 0 ? category.gamesFormats : [''],
          imageGallery: category.imageGallery.length > 0 ? category.imageGallery : [],
          published: category.published,
        });
      } catch (err) {
        console.error('Error fetching category:', err);
        setError('Failed to load category');
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayChange = (field: 'problemsSolved' | 'gamesFormats' | 'imageGallery', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: 'problemsSolved' | 'gamesFormats' | 'imageGallery') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'problemsSolved' | 'gamesFormats' | 'imageGallery', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const name = e.target.value;
    const slug = generateSlug(name);
    setFormData(prev => ({
      ...prev,
      name,
      slug
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.slug.trim()) {
      setError('Name and slug are required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Filter out empty array items
      const cleanedData = {
        ...formData,
        image: formData.image.length > 0 ? formData.image[0] : '',
        problemsSolved: formData.problemsSolved.filter(item => item.trim()),
        gamesFormats: formData.gamesFormats.filter(item => item.trim()),
        imageGallery: formData.imageGallery.filter(item => item.trim()),
      };

      // Get auth token
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        setError('Authentication required');
        return;
      }

      const token = await user.getIdToken();

      const response = await fetch(`/api/experiences/${categoryId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update category');
      }

      router.push('/admin/experiences');
    } catch (err) {
      console.error('Error updating category:', err);
      setError('Failed to update category. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#FFD93D] border-t-black mb-4"></div>
          <p className="text-black/60 font-black text-xs tracking-[0.4em]">LOADING CATEGORY...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p className="text-red-500 font-black text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-16 bg-[#FFFDF5]">
      <div className="max-w-5xl mx-auto px-6">
        <Link
          href="/admin/experiences"
          className="font-black text-xs tracking-widest text-black/50 hover:text-[#6C5CE7] mb-8 inline-flex items-center gap-2 transition-colors uppercase"
        >
          <ArrowLeft size={16} /> Back to Experiences
        </Link>

        <div className="mb-12">
          <div className="bg-[#FFD93D] text-black px-4 py-1.5 rounded-lg border-2 border-black inline-block font-black text-[10px] tracking-[0.2em] mb-4 uppercase shadow-[2px_2px_0px_#000]">
            Edit Mode
          </div>
          <h1 className="font-header text-4xl md:text-6xl text-black mb-4 tracking-tight leading-none">
            EXPERIENCE
          </h1>
          <p className="text-black/70 font-medium text-lg leading-relaxed max-w-2xl">
            Update the experience category details.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          {error && (
            <div className="bg-[#FF7675] border-2 border-black rounded-xl p-6 shadow-[4px_4px_0px_#000]">
              <p className="text-white font-bold text-sm">{error}</p>
            </div>
          )}

          <Section title="Basic Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field
                label="Category Name"
                type="text"
                value={formData.name}
                onChange={handleNameChange}
                maxLength={100}
                placeholder="e.g., Corporate Engagement"
                required
              />
              <Field
                label="Slug"
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                maxLength={100}
                placeholder="corporate-engagement"
                required
              />
            </div>
            <Field
              label="Short Description"
              textarea
              rows={3}
              value={formData.shortDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
              maxLength={500}
              placeholder="Brief description of the experience category..."
              required
              showCounter
            />
            <div className="bg-white border-2 border-black rounded-xl p-6">
              <label className="font-black text-xs tracking-widest text-black/40 mb-3 uppercase block">Main Image</label>
              <ImageUpload
                value={formData.image}
                onChange={(url) => setFormData(prev => ({ ...prev, image: [url] }))}
                onRemove={() => setFormData(prev => ({ ...prev, image: [] }))}
              />
            </div>
          </Section>

          <Section title="Target Audience">
            <Field
              label="Who is this for?"
              textarea
              rows={3}
              value={formData.whoFor}
              onChange={(e) => setFormData(prev => ({ ...prev, whoFor: e.target.value }))}
              maxLength={500}
              placeholder="Describe the target audience..."
              required
              showCounter
            />
          </Section>

          <Section title="Problems Solved">
            <div className="space-y-4">
              {formData.problemsSolved.map((problem, index) => (
                <div key={index} className="flex gap-4 items-center">
                  <input
                    type="text"
                    value={problem}
                    onChange={(e) => handleArrayChange('problemsSolved', index, e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-black rounded-xl font-medium focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-all"
                    placeholder="Problem this experience solves..."
                    maxLength={200}
                  />
                  {formData.problemsSolved.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('problemsSolved', index)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors font-bold text-lg"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('problemsSolved')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFD93D] text-black font-bold border-2 border-black rounded-lg text-xs tracking-widest uppercase hover:translate-y-0.5 hover:shadow-none transition-all shadow-[2px_2px_0px_#000]"
              >
                <Plus size={16} />
                Add Problem
              </button>
            </div>
          </Section>

          <Section title="Games & Formats">
            <div className="space-y-4">
              {formData.gamesFormats.map((format, index) => (
                <div key={index} className="flex gap-4 items-center">
                  <input
                    type="text"
                    value={format}
                    onChange={(e) => handleArrayChange('gamesFormats', index, e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-black rounded-xl font-medium focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-all"
                    placeholder="Type of game or format offered..."
                    maxLength={200}
                  />
                  {formData.gamesFormats.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('gamesFormats', index)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors font-bold text-lg"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('gamesFormats')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFD93D] text-black font-bold border-2 border-black rounded-lg text-xs tracking-widest uppercase hover:translate-y-0.5 hover:shadow-none transition-all shadow-[2px_2px_0px_#000]"
              >
                <Plus size={16} />
                Add Format
              </button>
            </div>
          </Section>

          <Section title="Gallery">
            <div className="bg-white border-2 border-black rounded-xl p-6">
              <label className="font-black text-xs tracking-widest text-black/40 mb-3 uppercase block">Gallery Images</label>
              <ImageUpload
                value={formData.imageGallery}
                onChange={(url) => setFormData(prev => ({ ...prev, imageGallery: [...prev.imageGallery, url] }))}
                onRemove={(url) => setFormData(prev => ({ ...prev, imageGallery: prev.imageGallery.filter(u => u !== url) }))}
              />
            </div>
          </Section>

          <Section title="Publishing">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.published}
                onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
                className="w-5 h-5 border-2 border-black rounded accent-[#6C5CE7]"
              />
              <span className="text-black font-bold text-sm tracking-[0.2em] uppercase">
                Publish Category
              </span>
            </label>
          </Section>

          <div className="pt-6 flex items-center justify-end gap-4">
            <Link
              href="/admin/experiences"
              className="px-8 py-4 bg-white text-black border-2 border-black rounded-xl font-black text-xs tracking-widest hover:bg-gray-50 transition-all uppercase"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-4 px-8 py-4 bg-[#6C5CE7] text-white border-2 border-black rounded-xl neo-shadow font-black text-xs tracking-widest hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all uppercase disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  UPDATING...
                </>
              ) : (
                <>
                  <Save size={16} />
                  UPDATE CATEGORY
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border-2 border-black rounded-[30px] p-8 neo-shadow">
      <h2 className="font-black text-xs tracking-widest mb-8 uppercase border-b-2 border-black/10 pb-4 text-black/50">
        {title}
      </h2>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  maxLength?: number;
  placeholder?: string;
  required?: boolean;
  textarea?: boolean;
  rows?: number;
  showCounter?: boolean;
}

function Field({
  label,
  type = 'text',
  value,
  onChange,
  maxLength,
  placeholder,
  required,
  textarea,
  rows,
  showCounter,
}: FieldProps) {
  return (
    <div className="space-y-2">
      <label className="font-black text-xs tracking-widest text-black/40 uppercase pl-1">
        {label} {required && '*'}
      </label>
      {textarea ? (
        <>
          <textarea
            value={value}
            onChange={onChange}
            maxLength={maxLength}
            placeholder={placeholder}
            rows={rows}
            className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-black placeholder:text-black/30 focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-all font-medium resize-y"
          />
          {showCounter && maxLength && (
            <p className="text-[10px] text-black/40 font-bold mt-1 uppercase tracking-wider text-right">
              {value.length}/{maxLength}
            </p>
          )}
        </>
      ) : (
        <>
          <input
            type={type}
            value={value}
            onChange={onChange}
            maxLength={maxLength}
            placeholder={placeholder}
            required={required}
            className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-black placeholder:text-black/30 focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-all font-medium"
          />
          {maxLength && (
            <p className="text-[10px] text-black/40 font-bold mt-1 uppercase tracking-wider text-right">
              {value.length}/{maxLength}
            </p>
          )}
        </>
      )}
    </div>
  );
}