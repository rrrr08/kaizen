'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { ExperienceEnquiry, EnquiryStatus } from '@/lib/types';
import { Calendar, Eye, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const STATUS_CONFIG = {
  new: {
    icon: Clock,
    color: 'bg-blue-100 text-blue-800 border-blue-500',
    label: 'New Enquiry',
    description: 'Your enquiry has been received and is being reviewed.'
  },
  contacted: {
    icon: Eye,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-500',
    label: 'Contacted',
    description: 'We\'ve reached out to discuss your requirements.'
  },
  in_discussion: {
    icon: AlertCircle,
    color: 'bg-orange-100 text-orange-800 border-orange-500',
    label: 'In Discussion',
    description: 'We\'re working on a customized proposal for you.'
  },
  confirmed: {
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800 border-green-500',
    label: 'Confirmed',
    description: 'Your experience has been confirmed! Ready to register.'
  },
  completed: {
    icon: CheckCircle,
    color: 'bg-emerald-100 text-emerald-800 border-emerald-500',
    label: 'Completed',
    description: 'Experience successfully delivered. Thank you!'
  },
  archived: {
    icon: XCircle,
    color: 'bg-gray-100 text-gray-800 border-gray-500',
    label: 'Archived',
    description: 'This enquiry has been archived.'
  }
};

export default function ProfileEnquiriesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [enquiries, setEnquiries] = useState<ExperienceEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return; // Wait for auth to load

    if (!user) {
      router.push('/auth/login');
      return;
    }

    fetchUserEnquiries();
  }, [user, authLoading, router]);

  const fetchUserEnquiries = async () => {
    try {
      setLoading(true);
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) return;

      const token = await currentUser.getIdToken();

      const response = await fetch('/api/profile/enquiries', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch enquiries');
      }

      setEnquiries(data.enquiries);
    } catch (err) {
      console.error('Error fetching enquiries:', err);
      setError('Failed to load your enquiries');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = (enquiryId: string) => {
    // For now, just show an alert. In a real app, this would navigate to a registration/payment page
    alert(`Registration feature for enquiry ${enquiryId} would be implemented here!\n\nThis would typically:\n- Show final pricing\n- Collect payment details\n- Confirm participation\n- Send confirmation email`);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen pt-28 pb-16 bg-[#FFFDF5] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#FFD93D] border-t-black mb-4"></div>
          <p className="text-black/60 font-black text-xs tracking-[0.4em]">LOADING...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-16 bg-[#FFFDF5] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#FFD93D] border-t-black mb-4"></div>
          <p className="text-black/60 font-black text-xs tracking-[0.4em]">LOADING YOUR ENQUIRIES...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-28 pb-16 bg-[#FFFDF5] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-black text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-16 bg-[#FFFDF5]">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-header text-5xl md:text-6xl font-black tracking-tighter mb-4 text-black">
            MY EXPERIENCE ENQUIRIES
          </h1>
          <p className="text-xl text-black/60 font-bold">
            Track the status of your submitted experience enquiries
          </p>
        </div>

        {/* Enquiries List */}
        <div className="space-y-6">
          {enquiries.length === 0 ? (
            <div className="text-center py-16">
              <Calendar size={64} className="text-black/20 mx-auto mb-6" />
              <h2 className="font-header text-3xl font-black text-black mb-4">
                No Enquiries Yet
              </h2>
              <p className="text-black/60 font-bold text-lg mb-8 max-w-md mx-auto">
                You haven't submitted any experience enquiries yet. Browse our experiences and get started!
              </p>
              <button
                onClick={() => router.push('/experiences')}
                className="px-8 py-4 bg-[#6C5CE7] text-white font-black text-sm tracking-[0.2em] neo-border neo-shadow hover:scale-105 transition-all rounded-xl"
              >
                BROWSE EXPERIENCES
              </button>
            </div>
          ) : (
            enquiries.map((enquiry) => {
              const statusConfig = STATUS_CONFIG[enquiry.status];
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={enquiry.id}
                  className="bg-white rounded-[20px] border-2 border-black neo-shadow p-8"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="font-header text-2xl font-black text-black mb-2">
                        {enquiry.categoryName}
                      </h3>
                      <p className="text-black/60 font-bold">
                        Submitted {enquiry.createdAt ? new Date(enquiry.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold tracking-[0.1em] border-2 ${statusConfig.color}`}>
                      <StatusIcon size={16} />
                      {statusConfig.label}
                    </div>
                  </div>

                  {/* Status Description */}
                  <div className="bg-black/5 rounded-lg p-4 mb-6">
                    <p className="text-black/80 font-medium">
                      {statusConfig.description}
                    </p>
                  </div>

                  {/* Enquiry Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-[#FFD93D] p-4 rounded-lg">
                      <p className="text-xs font-black text-black tracking-[0.2em] uppercase mb-1">Occasion</p>
                      <p className="font-bold text-black">{enquiry.occasionDetails}</p>
                    </div>
                    <div className="bg-[#6C5CE7] p-4 rounded-lg">
                      <p className="text-xs font-black text-white tracking-[0.2em] uppercase mb-1">Audience</p>
                      <p className="font-bold text-white">{enquiry.audienceSize}</p>
                    </div>
                    <div className="bg-[#00B894] p-4 rounded-lg">
                      <p className="text-xs font-black text-white tracking-[0.2em] uppercase mb-1">Budget</p>
                      <p className="font-bold text-white">{enquiry.budgetRange}</p>
                    </div>
                    <div className="bg-[#FF7675] p-4 rounded-lg">
                      <p className="text-xs font-black text-white tracking-[0.2em] uppercase mb-1">Preferred Date</p>
                      <p className="font-bold text-white">{enquiry.preferredDateRange}</p>
                    </div>
                  </div>

                  {/* Special Requirements */}
                  {enquiry.specialRequirements && (
                    <div className="mb-6">
                      <h4 className="font-bold text-black mb-2">Special Requirements</h4>
                      <p className="text-black/80 bg-black/5 p-3 rounded-lg">
                        {enquiry.specialRequirements}
                      </p>
                    </div>
                  )}

                  {/* Message */}
                  {enquiry.message && (
                    <div className="mb-6">
                      <h4 className="font-bold text-black mb-2">Your Message</h4>
                      <p className="text-black/80 bg-black/5 p-3 rounded-lg italic">
                        "{enquiry.message}"
                      </p>
                    </div>
                  )}

                  {/* Register Button for Confirmed Status */}
                  {enquiry.status === 'confirmed' && (
                    <div className="pt-6 border-t-2 border-black/10">
                      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-4">
                        <p className="text-green-800 font-bold mb-2">🎉 Your experience has been confirmed!</p>
                        <p className="text-green-700 text-sm">
                          Complete your registration to secure your spot and receive all the details.
                        </p>
                      </div>
                      <button
                        onClick={() => handleRegister(enquiry.id)}
                        className="px-8 py-4 bg-green-600 text-white font-black text-sm tracking-[0.2em] neo-border neo-shadow hover:scale-105 transition-all rounded-xl"
                      >
                        REGISTER NOW
                      </button>
                    </div>
                  )}

                  {/* Internal Notes (if any) */}
                  {enquiry.internalNotes && (
                    <div className="mt-6 pt-6 border-t-2 border-black/10">
                      <h4 className="font-bold text-black mb-2">Latest Update from Our Team</h4>
                      <div className="bg-[#6C5CE7] text-white p-4 rounded-lg">
                        <p className="font-medium">{enquiry.internalNotes}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}