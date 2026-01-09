'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { usePopup } from '@/app/context/PopupContext';
import { ExperienceEnquiry } from '@/lib/types';
import { Calendar, Eye, CheckCircle, Clock, AlertCircle, XCircle, ArrowLeft, Zap, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import ExperiencePaymentForm from '@/components/ExperiencePaymentForm';

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
    description: "We've reached out to discuss your requirements."
  },
  in_discussion: {
    icon: AlertCircle,
    color: 'bg-orange-100 text-orange-800 border-orange-500',
    label: 'In Discussion',
    description: "We're working on a customized proposal for you."
  },
  confirmed: {
    icon: CheckCircle,
    color: 'bg-[#00B894]/10 text-[#00B894] border-[#00B894]',
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
  const { showAlert } = usePopup();
  const router = useRouter();
  const [enquiries, setEnquiries] = useState<ExperienceEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<ExperienceEnquiry | null>(null);

  useEffect(() => {
    if (authLoading) return;
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
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch enquiries');
      setEnquiries(data.enquiries);
    } catch (err) {
      console.error('Error fetching enquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-32 pb-16 bg-[#FFFDF5] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-black border-t-[#FFD93D] mb-4"></div>
          <p className="text-black font-black text-xs tracking-[0.4em]">RETRIEVING ENVOYS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 bg-[#FFFDF5] text-black">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-black/40 hover:text-black font-black text-[10px] uppercase tracking-[0.3em] mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Base
          </Link>
          <h1 className="font-header text-6xl font-black tracking-tighter uppercase leading-none mb-4">
            Experience <br />Enquiries
          </h1>
          <p className="text-xl font-bold text-black/60 max-w-md">Track and manage your incoming custom event requests.</p>
        </div>

        <div className="space-y-8">
          {enquiries.length === 0 ? (
            <div className="text-center py-24 bg-white border-4 border-black rounded-[40px] neo-shadow border-dashed">
              <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-black/10">
                <Calendar size={32} className="text-black/20" />
              </div>
              <h3 className="font-header text-3xl font-black uppercase mb-2">No Requests Found</h3>
              <p className="font-bold text-black/40 mb-8">Initiate a custom experience enquiry to see logs here.</p>
              <Link href="/experiences" className="inline-flex items-center gap-2 px-10 py-5 bg-[#6C5CE7] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] neo-shadow hover:translate-y-[-2px] transition-all">
                EXPLORE EXPERIENCES <ArrowRight size={18} />
              </Link>
            </div>
          ) : (
            enquiries.map((enquiry, i) => {
              const status = STATUS_CONFIG[enquiry.status] || STATUS_CONFIG.new;
              const StatusIcon = status.icon;

              return (
                <motion.div
                  key={enquiry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white border-4 border-black rounded-[35px] neo-shadow p-8 group relative overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-header text-3xl font-black uppercase tracking-tight group-hover:text-[#6C5CE7] transition-colors">{enquiry.categoryName}</h3>
                        {enquiry.status === 'confirmed' && <Zap size={20} className="text-[#FFD93D] fill-[#FFD93D]" />}
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-black/40">
                        Received: {enquiry.createdAt ? new Date(enquiry.createdAt).toLocaleDateString() : 'N/A'} // Log ID: {enquiry.id.slice(0, 8)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className={`px-5 py-2 rounded-full border-2 ${status.color} flex items-center gap-2 font-black text-[10px] uppercase tracking-widest shadow-[3px_3px_0px_#000]`}>
                        <StatusIcon size={14} /> {status.label}
                      </div>
                      {enquiry.adminReply ? (
                        <button
                          onClick={() => {
                            setSelectedEnquiry(enquiry);
                            setShowPaymentForm(true);
                          }}
                          className="px-10 py-4 bg-[#00B894] text-white border-2 border-black rounded-xl font-black text-xs uppercase tracking-widest neo-shadow hover:scale-105 transition-all"
                        >
                          Complete Registration
                        </button>
                      ) : (
                        <div className="bg-black/5 text-black/40 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border-2 border-black/10">
                          Waiting for HQ
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-black/5 p-4 rounded-xl mb-8 border-l-4 border-black font-bold text-sm italic">
                    "{status.description}"
                  </div>

                  {/* Info Chips */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                      { label: 'Occasion', val: enquiry.occasionDetails, color: 'bg-[#FFD93D]' },
                      { label: 'Audience', val: enquiry.audienceSize, color: 'bg-[#6C5CE7]', text: 'text-white' },
                      { label: 'Budget', val: enquiry.budgetRange, color: 'bg-[#00B894]', text: 'text-white' },
                      { label: 'Date', val: enquiry.preferredDateRange, color: 'bg-[#FF7675]', text: 'text-white' }
                    ].map((chip, idx) => (
                      <div key={idx} className={`${chip.color} border-2 border-black p-4 rounded-2xl shadow-[3px_3px_0px_#000]`}>
                        <p className={`text-[8px] font-black uppercase tracking-widest ${chip.text ? 'text-white/60' : 'text-black/40'} mb-1`}>{chip.label}</p>
                        <p className={`font-black text-xs uppercase leading-tight ${chip.text || 'text-black'}`}>{chip.val}</p>
                      </div>
                    ))}
                  </div>

                  {/* Messages Section */}
                  <div className="space-y-4">
                    {enquiry.message && (
                      <div>
                        <p className="text-[9px] font-black uppercase text-black/40 tracking-widest mb-2">My Requirement Protocol</p>
                        <div className="bg-gray-50 border-2 border-black/5 rounded-2xl p-4 text-sm font-bold text-black/70 italic">
                          "{enquiry.message}"
                        </div>
                      </div>
                    )}
                    {enquiry.adminReply && (
                      <div className="relative pt-4">
                        <div className="absolute top-0 left-6 px-3 py-1 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-full border-2 border-black -translate-y-1/2">
                          HQ RESPONSE
                        </div>
                        <div className="bg-[#FFD93D] text-black border-4 border-black rounded-[25px] p-6 neo-shadow">
                          <p className="text-sm font-black leading-relaxed">{enquiry.adminReply}</p>
                          {enquiry.repliedAt && (
                            <p className="text-[8px] font-black uppercase mt-4 text-black/40 text-right tracking-[0.2em]">
                              Transmitted: {new Date(enquiry.repliedAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {enquiry.status === 'confirmed' && (
                    <div className="mt-10 pt-8 border-t-2 border-black/10 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div>
                        <h4 className="font-black text-xl uppercase tracking-tight">Mission Confirmed</h4>
                        <p className="text-xs font-bold text-black/40">Proceed to final registration to lock in your slot.</p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedEnquiry(enquiry);
                          setShowPaymentForm(true);
                        }}
                        className="px-10 py-4 bg-[#00B894] text-white border-2 border-black rounded-xl font-black text-xs uppercase tracking-widest neo-shadow hover:scale-105 transition-all"
                      >
                        Complete Registration
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>

        {/* Payment Form Modal */}
        {showPaymentForm && selectedEnquiry && (
          <ExperiencePaymentForm
            enquiry={selectedEnquiry}
            user={user}
            onSuccess={() => {
              setShowPaymentForm(false);
              fetchUserEnquiries(); // Refresh list to show updated status
            }}
            onClose={() => setShowPaymentForm(false)}
          />
        )}

        <div className="mt-20 text-center opacity-20">
          <p className="text-[8px] font-black tracking-[0.8em] uppercase">ENQUIRY_STREAM_LOGS_v2.1</p>
        </div>
      </div>
    </div>
  );
}