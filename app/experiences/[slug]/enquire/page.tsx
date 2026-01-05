'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ExperienceCategory } from '@/lib/types';
import { ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';

interface EnquiryFormData {
  name: string;
  email: string;
  phone: string;
  occasionDetails: string;
  audienceSize: string;
  preferredDateRange: string;
  budgetRange: string;
  specialRequirements: string;
  message: string;
}

export default function ExperienceEnquiryPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user, loading: authLoading } = useAuth();

  const [category, setCategory] = useState<ExperienceCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<EnquiryFormData>({
    name: '',
    email: '',
    phone: '',
    occasionDetails: '',
    audienceSize: '',
    preferredDateRange: '',
    budgetRange: '',
    specialRequirements: '',
    message: '',
  });

  useEffect(() => {
    if (authLoading) return; // Wait for auth to load

    if (!user) {
      router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    const fetchCategory = async () => {
      try {
        setLoading(true);
        const { getExperienceCategoryBySlug } = await import('@/lib/firebase');
        const data = await getExperienceCategoryBySlug(slug);
        setCategory(data);
      } catch (err) {
        console.error('Error fetching experience category:', err);
        setError('Failed to load experience category');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCategory();
    }
  }, [slug, user, authLoading, router]);

  // Pre-fill form with user data when user is loaded
  useEffect(() => {
    if (user && !authLoading) {
      setFormData(prev => ({
        ...prev,
        name: user.displayName || prev.name,
        email: user.email || prev.email,
      }));
    }
  }, [user, authLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!category) return;

    try {
      setSubmitting(true);
      setError(null);

      const enquiryData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        categoryId: category.id,
        categoryName: category.name,
        occasionDetails: formData.occasionDetails,
        audienceSize: formData.audienceSize,
        preferredDateRange: formData.preferredDateRange,
        budgetRange: formData.budgetRange,
        specialRequirements: formData.specialRequirements,
        message: formData.message,
        userId: user?.uid || null, // Include userId if authenticated
      };

      const response = await fetch('/api/experiences/enquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(enquiryData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit enquiry');
      }

      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting enquiry:', err);
      setError('Failed to submit enquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-16 bg-[#FFFDF5] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#FFD93D] border-t-black mb-4"></div>
          <p className="text-black/60 font-black text-xs tracking-[0.4em]">LOADING...</p>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen pt-28 pb-16 bg-[#FFFDF5] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-black text-lg">{error || 'Experience category not found'}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen pt-28 pb-16 bg-[#FFFDF5]">
        <div className="max-w-2xl mx-auto px-6 md:px-12 text-center">
          <div className="bg-green-100 border-3 border-green-500 rounded-[20px] p-12 neo-shadow">
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="font-header text-4xl md:text-5xl mb-6 text-black">
              Enquiry Submitted Successfully!
            </h1>
            <p className="text-black/80 font-medium text-lg mb-8">
              Thank you for your interest in our {category.name} experience. We've received your enquiry and will get back to you within 24 hours with a personalized proposal.
            </p>
            <Link
              href="/experiences"
              className="inline-flex items-center gap-4 px-8 py-4 bg-black text-white font-black text-sm tracking-[0.2em] neo-border neo-shadow hover:scale-105 transition-all rounded-xl"
            >
              <ArrowLeft size={20} />
              BACK TO EXPERIENCES
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-16 bg-[#FFFDF5]">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="mb-12">
          <Link
            href={`/experiences/${category.slug}`}
            className="inline-flex items-center gap-2 text-[#6C5CE7] font-black text-sm tracking-[0.2em] uppercase mb-6 hover:gap-4 transition-all"
          >
            <ArrowLeft size={16} />
            BACK TO {category.name.toUpperCase()}
          </Link>
          <h1 className="font-header text-4xl md:text-6xl tracking-tight mb-4 text-black">
            Plan Your Experience
          </h1>
          <p className="text-black/80 font-bold text-lg">
            Tell us about your vision and we'll create something magical together.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-[30px] border-3 border-black neo-shadow p-8 md:p-12">
          {error && (
            <div className="bg-red-100 border-2 border-red-500 rounded-lg p-4 mb-8">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-black font-bold text-sm tracking-[0.2em] uppercase mb-3">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-black rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] focus:border-transparent"
                placeholder="Your full name"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-black font-bold text-sm tracking-[0.2em] uppercase mb-3">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-black rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] focus:border-transparent"
                placeholder="your.email@example.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-black font-bold text-sm tracking-[0.2em] uppercase mb-3">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-black rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] focus:border-transparent"
                placeholder="+91 98765 43210"
              />
            </div>

            {/* Occasion Details */}
            <div>
              <label htmlFor="occasionDetails" className="block text-black font-bold text-sm tracking-[0.2em] uppercase mb-3">
                Occasion Details *
              </label>
              <input
                type="text"
                id="occasionDetails"
                name="occasionDetails"
                required
                value={formData.occasionDetails}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-black rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] focus:border-transparent"
                placeholder="Birthday, Corporate Event, Wedding, etc."
              />
            </div>

            {/* Audience Size */}
            <div>
              <label htmlFor="audienceSize" className="block text-black font-bold text-sm tracking-[0.2em] uppercase mb-3">
                Expected Audience Size *
              </label>
              <select
                id="audienceSize"
                name="audienceSize"
                required
                value={formData.audienceSize}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-black rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] focus:border-transparent"
              >
                <option value="">Select audience size</option>
                <option value="10-25">10-25 people</option>
                <option value="25-50">25-50 people</option>
                <option value="50-100">50-100 people</option>
                <option value="100-200">100-200 people</option>
                <option value="200+">200+ people</option>
              </select>
            </div>

            {/* Preferred Date Range */}
            <div>
              <label htmlFor="preferredDateRange" className="block text-black font-bold text-sm tracking-[0.2em] uppercase mb-3">
                Preferred Date Range *
              </label>
              <input
                type="text"
                id="preferredDateRange"
                name="preferredDateRange"
                required
                value={formData.preferredDateRange}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-black rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] focus:border-transparent"
                placeholder="e.g., Next month, December 2024, Flexible"
              />
            </div>

            {/* Budget Range */}
            <div>
              <label htmlFor="budgetRange" className="block text-black font-bold text-sm tracking-[0.2em] uppercase mb-3">
                Budget Range *
              </label>
              <select
                id="budgetRange"
                name="budgetRange"
                required
                value={formData.budgetRange}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-black rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] focus:border-transparent"
              >
                <option value="">Select budget range</option>
                <option value="₹25,000 - ₹50,000">₹25,000 - ₹50,000</option>
                <option value="₹50,000 - ₹1,00,000">₹50,000 - ₹1,00,000</option>
                <option value="₹1,00,000 - ₹2,00,000">₹1,00,000 - ₹2,00,000</option>
                <option value="₹2,00,000 - ₹5,00,000">₹2,00,000 - ₹5,00,000</option>
                <option value="₹5,00,000+">₹5,00,000+</option>
              </select>
            </div>

            {/* Special Requirements */}
            <div className="md:col-span-2">
              <label htmlFor="specialRequirements" className="block text-black font-bold text-sm tracking-[0.2em] uppercase mb-3">
                Special Requirements
              </label>
              <input
                type="text"
                id="specialRequirements"
                name="specialRequirements"
                value={formData.specialRequirements}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-black rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] focus:border-transparent"
                placeholder="Dietary restrictions, accessibility needs, etc."
              />
            </div>

            {/* Message */}
            <div className="md:col-span-2">
              <label htmlFor="message" className="block text-black font-bold text-sm tracking-[0.2em] uppercase mb-3">
                Additional Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-black rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] focus:border-transparent resize-none"
                placeholder="Tell us more about your vision, any specific themes, or questions you have..."
              />
            </div>
          </div>

          {/* Category Info */}
          <div className="mt-8 p-6 bg-[#FFD93D] rounded-lg border-2 border-black">
            <p className="text-black font-bold text-sm tracking-[0.2em] uppercase mb-2">SELECTED EXPERIENCE</p>
            <p className="text-black font-medium">{category.name}</p>
          </div>

          {/* Submit Button */}
          <div className="mt-8 text-center">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-4 px-12 py-5 bg-[#6C5CE7] text-white font-black text-sm tracking-[0.2em] neo-border neo-shadow hover:scale-105 transition-all rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  SUBMITTING...
                </>
              ) : (
                <>
                  SEND ENQUIRY
                  <Send size={20} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}