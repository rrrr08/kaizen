'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ExperienceCategory } from '@/lib/types';
import { ArrowLeft, Send, User, AtSign, Phone, MessageSquare, Calendar, Users, DollarSign, Star } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { motion } from 'framer-motion';

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

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  occasionDetails?: string;
  audienceSize?: string;
  preferredDateRange?: string;
  budgetRange?: string;
  specialRequirements?: string;
  message?: string;
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
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [hasValidationErrors, setHasValidationErrors] = useState(false);

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

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Phone validation
    const phoneRegex = /^\d{10}$/;
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (cleanPhone.length < 10) {
      errors.phone = 'Phone number must be at least 10 digits';
    } else if (!phoneRegex.test(cleanPhone)) {
      errors.phone = 'Please enter a valid Indian phone number';
    }

    // Occasion details validation
    if (!formData.occasionDetails.trim()) {
      errors.occasionDetails = 'Occasion details are required';
    }

    // Audience size validation
    if (!formData.audienceSize) {
      errors.audienceSize = 'Please select audience size';
    }

    // Preferred date range validation
    if (!formData.preferredDateRange.trim()) {
      errors.preferredDateRange = 'Preferred date range is required';
    }

    // Budget range validation
    if (!formData.budgetRange) {
      errors.budgetRange = 'Please select budget range';
    }

    setFormErrors(errors);
    setHasValidationErrors(Object.keys(errors).length > 0);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Character limits
    const limits: Record<string, number> = {
      name: 100,
      email: 100,
      phone: 15,
      occasionDetails: 200,
      preferredDateRange: 100,
      specialRequirements: 300,
      message: 2000
    };

    if (limits[name] && value.length > limits[name]) return;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user starts typing
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!category) return;

    // Validate form
    if (!validateForm()) {
      // Scroll to the first error field
      const firstErrorField = Object.keys(formErrors)[0];
      if (firstErrorField) {
        const element = document.querySelector(
          `[name="${firstErrorField}"]`
        ) as HTMLElement | null;
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
      }
      return;
    }

    // Clear validation errors state
    setHasValidationErrors(false);

    try {
      setSubmitting(true);
      setError(null);

      const enquiryData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.replace(/\D/g, ''), // Clean phone number
        categoryId: category.id,
        categoryName: category.name,
        occasionDetails: formData.occasionDetails.trim(),
        audienceSize: formData.audienceSize,
        preferredDateRange: formData.preferredDateRange.trim(),
        budgetRange: formData.budgetRange,
        specialRequirements: formData.specialRequirements.trim(),
        message: formData.message.trim(),
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
      <div className="min-h-screen pt-32 pb-16 bg-[#FFFDF5] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#FFD93D] border-t-black mb-4"></div>
          <p className="text-black/60 font-black text-xs tracking-[0.4em]">LOADING EXPERIENCE...</p>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen pt-32 pb-16 bg-[#FFFDF5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-[#FF7675] border-2 border-black rounded-full flex items-center justify-center mx-auto mb-8 shadow-[6px_6px_0px_#000]">
            <MessageSquare className="text-white w-10 h-10" />
          </div>
          <h2 className="text-4xl font-black font-display mb-4 uppercase tracking-tight">Oops!</h2>
          <p className="text-lg font-bold text-black/60 mb-8">
            {error || 'Experience category not found'}
          </p>
          <Link
            href="/experiences"
            className="inline-flex items-center gap-4 px-8 py-4 bg-[#FFD93D] border-2 border-black rounded-2xl font-black uppercase tracking-widest shadow-[4px_4px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
          >
            <ArrowLeft size={16} />
            BACK TO EXPERIENCES
          </Link>
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
    <div className="min-h-screen pt-32 pb-20 bg-[#FFFDF5]">
      <div className="container mx-auto px-6 max-w-5xl">
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1.5 bg-[#FFD93D] border-2 border-black rounded-full font-black text-xs uppercase tracking-widest mb-6 shadow-[2px_2px_0px_rgba(0,0,0,1)]"
          >
            Plan Your Experience
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black font-display text-black uppercase tracking-tighter mb-6 leading-none"
          >
            Let's Create <span className="text-[#6C5CE7]">Magic!</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl font-bold text-black/60 max-w-2xl mx-auto"
          >
            Tell us about your vision and we'll craft an unforgettable experience just for you.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Info Side */}
          <div className="lg:col-span-5 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white border-2 border-black p-8 rounded-[30px] neo-shadow group"
            >
              <div className="w-14 h-14 bg-[#6C5CE7] border-2 border-black rounded-2xl flex items-center justify-center mb-6 shadow-[4px_4px_0px_#000] rotate-[-5deg] group-hover:rotate-0 transition-transform">
                <Star className="text-white w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black font-display mb-2 uppercase tracking-tight">Selected Experience</h3>
              <p className="font-bold text-black/50 mb-4 text-sm">We're excited to work with you on:</p>
              <p className="text-lg font-black text-[#6C5CE7]">{category?.name}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-[#00B894] border-2 border-black p-8 rounded-[30px] neo-shadow"
            >
              <h3 className="text-2xl font-black font-display mb-6 uppercase tracking-tight text-white">What happens next?</h3>
              <div className="space-y-4 text-white">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white text-black rounded-full flex items-center justify-center text-xs font-black mt-0.5">1</div>
                  <p className="font-bold text-sm">We review your requirements within 24 hours</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white text-black rounded-full flex items-center justify-center text-xs font-black mt-0.5">2</div>
                  <p className="font-bold text-sm">Get a personalized proposal with timeline & pricing</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white text-black rounded-full flex items-center justify-center text-xs font-black mt-0.5">3</div>
                  <p className="font-bold text-sm">Book your magical experience!</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Form Side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-7 bg-white border-2 border-black p-8 md:p-12 rounded-[40px] neo-shadow-lg"
          >
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-[#00B894] border-2 border-black rounded-full flex items-center justify-center mx-auto mb-8 shadow-[6px_6px_0px_#000]">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 10 }}
                  >
                    <Send className="text-white w-10 h-10" />
                  </motion.div>
                </div>
                <h2 className="text-4xl font-black font-display mb-4 uppercase tracking-tight">Enquiry Sent!</h2>
                <p className="text-lg font-bold text-black/60 mb-8">
                  Thank you for your interest! We'll get back to you within 24 hours with a personalized proposal.
                </p>
                <Link
                  href="/experiences"
                  className="inline-flex items-center gap-4 px-8 py-4 bg-[#FFD93D] border-2 border-black rounded-2xl font-black uppercase tracking-widest shadow-[4px_4px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                >
                  <ArrowLeft size={16} />
                  BACK TO EXPERIENCES
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {hasValidationErrors && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-[#FF7675]/10 border-2 border-[#FF7675] rounded-xl text-[#FF7675] font-black text-sm uppercase tracking-tight"
                  >
                    Please fix the validation errors below and try again.
                  </motion.div>
                )}

                {error && !hasValidationErrors && (
                  <div className="p-4 bg-[#FF7675]/10 border-2 border-[#FF7675] rounded-xl text-[#FF7675] font-black text-sm uppercase tracking-tight">
                    Error: {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-black/40 ml-2">Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/20" />
                      <input
                        required
                        type="text"
                        name="name"
                        disabled
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        maxLength={100}
                        className={`w-full pl-12 pr-4 py-4 bg-[#FFFDF5] border-2 rounded-2xl focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-all font-bold placeholder:text-black/20 ${formErrors.name ? 'border-[#FF7675]' : 'border-black'
                          }`}
                      />
                    </div>
                    {formErrors.name && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-[#FF7675] font-black uppercase tracking-wider ml-2 flex items-center gap-1"
                      >
                        <span className="w-1 h-1 bg-[#FF7675] rounded-full"></span>
                        {formErrors.name}
                      </motion.p>
                    )}
                    <p className="text-[10px] text-black/40 font-bold mt-1 uppercase tracking-wider text-right">{formData.name.length}/100</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-black/40 ml-2">Email Address *</label>
                    <div className="relative">
                      <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/20" />
                      <input
                        required
                        type="email"
                        name="email"
                        disabled
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                        maxLength={100}
                        className={`w-full pl-12 pr-4 py-4 bg-[#FFFDF5] border-2 rounded-2xl focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-all font-bold placeholder:text-black/20 ${formErrors.email ? 'border-[#FF7675]' : 'border-black'
                          }`}
                      />
                    </div>
                    {formErrors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-[#FF7675] font-black uppercase tracking-wider ml-2 flex items-center gap-1"
                      >
                        <span className="w-1 h-1 bg-[#FF7675] rounded-full"></span>
                        {formErrors.email}
                      </motion.p>
                    )}
                    <p className="text-[10px] text-black/40 font-bold mt-1 uppercase tracking-wider text-right">{formData.email.length}/100</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-black/40 ml-2">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/20" />
                    <input
                      required
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 98765 43210"
                      maxLength={15}
                      className={`w-full pl-12 pr-4 py-4 bg-[#FFFDF5] border-2 rounded-2xl focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-all font-bold placeholder:text-black/20 ${formErrors.phone ? 'border-[#FF7675]' : 'border-black'
                        }`}
                    />
                  </div>
                  {formErrors.phone && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-[#FF7675] font-black uppercase tracking-wider ml-2 flex items-center gap-1"
                    >
                      <span className="w-1 h-1 bg-[#FF7675] rounded-full"></span>
                      {formErrors.phone}
                    </motion.p>
                  )}
                  <p className="text-[10px] text-black/40 font-bold mt-1 uppercase tracking-wider text-right">{formData.phone.length}/15</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-black/40 ml-2">Occasion Details *</label>
                    <div className="relative">
                      <Star className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/20" />
                      <input
                        required
                        type="text"
                        name="occasionDetails"
                        value={formData.occasionDetails}
                        onChange={handleInputChange}
                        placeholder="Birthday, Corporate Event, Wedding..."
                        maxLength={200}
                        className={`w-full pl-12 pr-4 py-4 bg-[#FFFDF5] border-2 rounded-2xl focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-all font-bold placeholder:text-black/20 ${formErrors.occasionDetails ? 'border-[#FF7675]' : 'border-black'
                          }`}
                      />
                    </div>
                    {formErrors.occasionDetails && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-[#FF7675] font-black uppercase tracking-wider ml-2 flex items-center gap-1"
                      >
                        <span className="w-1 h-1 bg-[#FF7675] rounded-full"></span>
                        {formErrors.occasionDetails}
                      </motion.p>
                    )}
                    <p className="text-[10px] text-black/40 font-bold mt-1 uppercase tracking-wider text-right">{formData.occasionDetails.length}/200</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-black/40 ml-2">Audience Size *</label>
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/20 z-10" />
                      <select
                        required
                        name="audienceSize"
                        value={formData.audienceSize}
                        onChange={handleInputChange}
                        className={`w-full pl-12 pr-4 py-4 bg-[#FFFDF5] border-2 rounded-2xl focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-all font-bold appearance-none ${formErrors.audienceSize ? 'border-[#FF7675]' : 'border-black'
                          }`}
                      >
                        <option value="">Select audience size</option>
                        <option value="10-25">10-25 people</option>
                        <option value="25-50">25-50 people</option>
                        <option value="50-100">50-100 people</option>
                        <option value="100-200">100-200 people</option>
                        <option value="200+">200+ people</option>
                      </select>
                    </div>
                    {formErrors.audienceSize && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-[#FF7675] font-black uppercase tracking-wider ml-2 flex items-center gap-1"
                      >
                        <span className="w-1 h-1 bg-[#FF7675] rounded-full"></span>
                        {formErrors.audienceSize}
                      </motion.p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-black/40 ml-2">Preferred Date Range *</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/20" />
                      <input
                        required
                        type="text"
                        name="preferredDateRange"
                        value={formData.preferredDateRange}
                        onChange={handleInputChange}
                        placeholder="Next month, December 2024, Flexible..."
                        maxLength={100}
                        className={`w-full pl-12 pr-4 py-4 bg-[#FFFDF5] border-2 rounded-2xl focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-all font-bold placeholder:text-black/20 ${formErrors.preferredDateRange ? 'border-[#FF7675]' : 'border-black'
                          }`}
                      />
                    </div>
                    {formErrors.preferredDateRange && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-[#FF7675] font-black uppercase tracking-wider ml-2 flex items-center gap-1"
                      >
                        <span className="w-1 h-1 bg-[#FF7675] rounded-full"></span>
                        {formErrors.preferredDateRange}
                      </motion.p>
                    )}
                    <p className="text-[10px] text-black/40 font-bold mt-1 uppercase tracking-wider text-right">{formData.preferredDateRange.length}/100</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-black/40 ml-2">Budget Range *</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/20 z-10" />
                      <select
                        required
                        name="budgetRange"
                        value={formData.budgetRange}
                        onChange={handleInputChange}
                        className={`w-full pl-12 pr-4 py-4 bg-[#FFFDF5] border-2 rounded-2xl focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-all font-bold appearance-none ${formErrors.budgetRange ? 'border-[#FF7675]' : 'border-black'
                          }`}
                      >
                        <option value="">Select budget range</option>
                        <option value="₹25,000 - ₹50,000">₹25,000 - ₹50,000</option>
                        <option value="₹50,000 - ₹1,00,000">₹50,000 - ₹1,00,000</option>
                        <option value="₹1,00,000 - ₹2,00,000">₹1,00,000 - ₹2,00,000</option>
                        <option value="₹2,00,000 - ₹5,00,000">₹2,00,000 - ₹5,00,000</option>
                        <option value="₹5,00,000+">₹5,00,000+</option>
                      </select>
                    </div>
                    {formErrors.budgetRange && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-[#FF7675] font-black uppercase tracking-wider ml-2 flex items-center gap-1"
                      >
                        <span className="w-1 h-1 bg-[#FF7675] rounded-full"></span>
                        {formErrors.budgetRange}
                      </motion.p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-black/40 ml-2">Special Requirements</label>
                  <input
                    type="text"
                    name="specialRequirements"
                    value={formData.specialRequirements}
                    onChange={handleInputChange}
                    placeholder="Dietary restrictions, accessibility needs, themes..."
                    maxLength={300}
                    className="w-full px-6 py-4 bg-[#FFFDF5] border-2 border-black rounded-2xl focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-all font-bold placeholder:text-black/20"
                  />
                  <p className="text-[10px] text-black/40 font-bold mt-1 uppercase tracking-wider text-right">{formData.specialRequirements.length}/300</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-black/40 ml-2">Additional Message</label>
                  <textarea
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us more about your vision, any specific themes, or questions you have..."
                    maxLength={2000}
                    className="w-full px-6 py-4 bg-[#FFFDF5] border-2 border-black rounded-2xl focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-all font-bold placeholder:text-black/20 resize-none"
                  />
                  <p className="text-[10px] text-black/40 font-bold mt-1 uppercase tracking-wider text-right">{formData.message.length}/2000</p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-5 bg-[#6C5CE7] text-white font-black uppercase tracking-[0.2em] rounded-2xl border-2 border-black shadow-[6px_6px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {submitting ? (
                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Send Enquiry
                      <Send className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}