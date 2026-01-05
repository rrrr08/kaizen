'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Save } from 'lucide-react';
import Link from 'next/link';
import { ExperienceCategory } from '@/lib/types';

interface FormData {
  name: string;
  slug: string;
  shortDescription: string;
  image: string;
  whoFor: string;
  problemsSolved: string[];
  gamesFormats: string[];
  imageGallery: string[];
  published: boolean;
}

export default function NewExperienceCategoryPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    slug: '',
    shortDescription: '',
    image: '',
    whoFor: '',
    problemsSolved: [''],
    gamesFormats: [''],
    imageGallery: [''],
    published: false,
  });

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

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        problemsSolved: formData.problemsSolved.filter(item => item.trim()),
        gamesFormats: formData.gamesFormats.filter(item => item.trim()),
        imageGallery: formData.imageGallery.filter(item => item.trim()),
        testimonials: [] // Empty testimonials for new categories
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

      const response = await fetch('/api/experiences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create category');
      }

      router.push('/admin/experiences');
    } catch (err) {
      console.error('Error creating category:', err);
      setError('Failed to create category. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link
          href="/admin/experiences"
          className="inline-flex items-center gap-2 text-[#6C5CE7] font-black text-sm tracking-[0.2em] uppercase mb-6 hover:gap-4 transition-all"
        >
          <ArrowLeft size={16} />
          BACK TO EXPERIENCES
        </Link>
        <h1 className="text-3xl font-bold text-black mb-2">Add New Experience Category</h1>
        <p className="text-black/60">Create a new experience category for your offerings</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        {error && (
          <div className="bg-red-100 border-2 border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg border-2 border-black neo-shadow p-8 space-y-8">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-bold text-black mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-black font-bold text-sm tracking-[0.2em] uppercase mb-3">
                  Category Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  className="w-full px-4 py-3 border-2 border-black rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] focus:border-transparent"
                  placeholder="e.g., Corporate Engagement"
                />
              </div>

              <div>
                <label htmlFor="slug" className="block text-black font-bold text-sm tracking-[0.2em] uppercase mb-3">
                  Slug *
                </label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  required
                  value={formData.slug}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-black rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] focus:border-transparent"
                  placeholder="corporate-engagement"
                />
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="shortDescription" className="block text-black font-bold text-sm tracking-[0.2em] uppercase mb-3">
                Short Description *
              </label>
              <textarea
                id="shortDescription"
                name="shortDescription"
                required
                rows={3}
                value={formData.shortDescription}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-black rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] focus:border-transparent resize-none"
                placeholder="Brief description of the experience category..."
              />
            </div>

            <div className="mt-6">
              <label htmlFor="image" className="block text-black font-bold text-sm tracking-[0.2em] uppercase mb-3">
                Main Image URL *
              </label>
              <input
                type="url"
                id="image"
                name="image"
                required
                value={formData.image}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-black rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          {/* Target Audience */}
          <div>
            <h2 className="text-xl font-bold text-black mb-6">Target Audience</h2>
            <div>
              <label htmlFor="whoFor" className="block text-black font-bold text-sm tracking-[0.2em] uppercase mb-3">
                Who is this for? *
              </label>
              <textarea
                id="whoFor"
                name="whoFor"
                required
                rows={3}
                value={formData.whoFor}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-black rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] focus:border-transparent resize-none"
                placeholder="Describe the target audience for this experience category..."
              />
            </div>
          </div>

          {/* Problems Solved */}
          <div>
            <h2 className="text-xl font-bold text-black mb-6">Problems Solved</h2>
            <div className="space-y-4">
              {formData.problemsSolved.map((problem, index) => (
                <div key={index} className="flex gap-4 items-center">
                  <input
                    type="text"
                    value={problem}
                    onChange={(e) => handleArrayChange('problemsSolved', index, e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-black rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] focus:border-transparent"
                    placeholder="Problem that this experience solves..."
                  />
                  {formData.problemsSolved.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('problemsSolved', index)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('problemsSolved')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFD93D] text-black font-bold neo-border neo-shadow hover:scale-105 transition-all rounded-lg"
              >
                <Plus size={16} />
                Add Problem
              </button>
            </div>
          </div>

          {/* Games & Formats */}
          <div>
            <h2 className="text-xl font-bold text-black mb-6">Games & Formats</h2>
            <div className="space-y-4">
              {formData.gamesFormats.map((format, index) => (
                <div key={index} className="flex gap-4 items-center">
                  <input
                    type="text"
                    value={format}
                    onChange={(e) => handleArrayChange('gamesFormats', index, e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-black rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] focus:border-transparent"
                    placeholder="Type of game or format offered..."
                  />
                  {formData.gamesFormats.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('gamesFormats', index)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('gamesFormats')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFD93D] text-black font-bold neo-border neo-shadow hover:scale-105 transition-all rounded-lg"
              >
                <Plus size={16} />
                Add Format
              </button>
            </div>
          </div>

          {/* Image Gallery */}
          <div>
            <h2 className="text-xl font-bold text-black mb-6">Image Gallery</h2>
            <div className="space-y-4">
              {formData.imageGallery.map((image, index) => (
                <div key={index} className="flex gap-4 items-center">
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => handleArrayChange('imageGallery', index, e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-black rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] focus:border-transparent"
                    placeholder="https://example.com/gallery-image.jpg"
                  />
                  {formData.imageGallery.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('imageGallery', index)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('imageGallery')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFD93D] text-black font-bold neo-border neo-shadow hover:scale-105 transition-all rounded-lg"
              >
                <Plus size={16} />
                Add Image
              </button>
            </div>
          </div>

          {/* Publishing */}
          <div>
            <h2 className="text-xl font-bold text-black mb-6">Publishing</h2>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
                  className="w-5 h-5 text-[#6C5CE7] focus:ring-[#6C5CE7] border-2 border-black rounded"
                />
                <span className="text-black font-bold text-sm tracking-[0.2em] uppercase">
                  Publish Category
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 text-center">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-4 px-12 py-5 bg-[#6C5CE7] text-white font-black text-sm tracking-[0.2em] neo-border neo-shadow hover:scale-105 transition-all rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                CREATING...
              </>
            ) : (
              <>
                <Save size={20} />
                CREATE CATEGORY
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}