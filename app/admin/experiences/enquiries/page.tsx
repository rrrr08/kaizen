'use client';

import { useState, useEffect } from 'react';
import { ExperienceEnquiry, EnquiryStatus } from '@/lib/types';
import { Eye, MessageSquare, Phone, Mail, Calendar, DollarSign, Users, ChevronRight, MessageCircleReply, Trash2, Send, Sparkles, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import RoleProtected from '@/components/auth/RoleProtected';
import { USER_ROLES } from '@/lib/roles';
import { format } from 'date-fns';

// Helper to safely parse dates from any source (string, number, Firestore Timestamp)
const getValidDate = (date: any): Date | null => {
  if (!date) return null;
  try {
    const d = new Date(date);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
};

const STATUS_COLORS = {
  new: 'bg-blue-50 text-[#6366F1] border-[#6366F1]/20',
  contacted: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  in_discussion: 'bg-orange-50 text-orange-700 border-orange-200',
  confirmed: 'bg-purple-50 text-purple-700 border-purple-200',
  completed: 'bg-[#EEFDF9] text-[#00B894] border-[#00B894]/20',
  archived: 'bg-gray-50 text-gray-500 border-gray-200',
};

const STATUS_OPTIONS: EnquiryStatus[] = ['new', 'contacted', 'in_discussion', 'confirmed', 'completed', 'archived'];

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<ExperienceEnquiry[]>([]);
  const [finalPrice, setFinalPrice] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEnquiry, setSelectedEnquiry] = useState<ExperienceEnquiry | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [savingReply, setSavingReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = '/';
        return;
      }

      try {
        const snap = await getDoc(doc(db, 'users', user.uid));

        if (!snap.exists() || snap.data()?.role !== 'admin') {
          window.location.href = '/';
          return;
        }

        // ✅ admin confirmed
        setCheckingAdmin(false);
        fetchEnquiries();
      } catch (err) {
        console.error('Admin check failed', err);
        window.location.href = '/';
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedEnquiry) {
      setReplyText(selectedEnquiry.adminReply || '');
      setFinalPrice(selectedEnquiry.finalPrice ?? '');
    }
  }, [selectedEnquiry]);


  const fetchEnquiries = async () => {
    try {
      setLoading(true);

      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        setError('Authentication required');
        return;
      }

      const token = await user.getIdToken();

      const response = await fetch('/api/experiences/enquiries', {
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
      setError('Failed to load enquiries');
    } finally {
      setLoading(false);
    }
  };

  const updateFinalPrice = async (enquiryId: string, price: number) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();

      const response = await fetch(`/api/experiences/enquiries/${enquiryId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ finalPrice: price }),
      });

      if (!response.ok) throw new Error('Failed to update price');

      setEnquiries(prev =>
        prev.map(e =>
          e.id === enquiryId ? { ...e, finalPrice: price } : e
        )
      );

      setSelectedEnquiry(prev =>
        prev ? { ...prev, finalPrice: price } : null
      );
    } catch (err) {
      console.error('Price update failed', err);
    }
  };


  const updateEnquiryStatus = async (enquiryId: string, newStatus: EnquiryStatus) => {
    try {
      setUpdatingStatus(enquiryId);

      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        setError('Authentication required');
        return;
      }

      const token = await user.getIdToken();

      const response = await fetch(`/api/experiences/enquiries/${enquiryId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update enquiry status');
      }

      // Update local state
      setEnquiries(prev => prev.map(enquiry =>
        enquiry.id === enquiryId ? { ...enquiry, status: newStatus, updatedAt: new Date() } : enquiry
      ));

      if (selectedEnquiry?.id === enquiryId) {
        setSelectedEnquiry(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err) {
      console.error('Error updating enquiry status:', err);
      setError('Failed to update enquiry status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const updateInternalNotes = async (enquiryId: string, notes: string) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();

      const response = await fetch(`/api/experiences/enquiries/${enquiryId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ internalNotes: notes }),
      });

      if (response.ok) {
        setEnquiries(prev => prev.map(enquiry =>
          enquiry.id === enquiryId ? { ...enquiry, internalNotes: notes } : enquiry
        ));
      }
    } catch (err) {
      console.error('Error updating internal notes:', err);
    }
  };

  const saveReply = async (enquiryId: string) => {
    try {
      setSavingReply(true);
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();

      const response = await fetch(`/api/experiences/enquiries/${enquiryId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminReply: replyText,
          repliedAt: new Date()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save reply');
      }

      // Update local state
      setEnquiries(prev => prev.map(enquiry =>
        enquiry.id === enquiryId ? { ...enquiry, adminReply: replyText, repliedAt: new Date() } : enquiry
      ));

      if (selectedEnquiry?.id === enquiryId) {
        setSelectedEnquiry(prev => prev ? { ...prev, adminReply: replyText, repliedAt: new Date() } : null);
      }

      addToast({
        title: 'Success!',
        description: 'Reply saved successfully!',
        variant: 'success'
      });
    } catch (err) {
      console.error('Error saving reply:', err);
      setError('Failed to save reply');
    } finally {
      setSavingReply(false);
    }
  };

  if (checkingAdmin) {
    return (
      <div className="min-h-screen bg-[#FFFDF5] p-8 flex flex-col items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#FFD93D] border-t-black mb-4"></div>
        <p className="text-black/60 font-black text-xs tracking-[0.4em] uppercase">CHECKING ADMIN ACCESS...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF5] p-8 flex flex-col items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#FFD93D] border-t-black mb-4"></div>
        <p className="text-black/60 font-black text-xs tracking-[0.4em] uppercase">LOADING ENQUIRIES...</p>
      </div>
    );
  }

  return (
    <RoleProtected allowedRoles={[USER_ROLES.ADMIN]}>
      <div className="min-h-screen bg-[#FFFDF5] p-8 max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-black pb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-black rounded-2xl border-2 border-black neo-shadow -rotate-3">
              <MessageSquare className="text-[#FFD93D] w-8 h-8" />
            </div>
            <div>
              <h1 className="font-header text-5xl font-black text-[#2D3436] mb-1 uppercase tracking-tighter">Event Enquiries</h1>
              <p className="text-lg text-[#2D3436]/60 font-black uppercase tracking-widest">Experience & Celebration Requests</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white border-2 border-black px-4 py-2 rounded-xl neo-shadow font-bold uppercase text-xs tracking-widest text-[#2D3436]">
              Total: {enquiries.length}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border-2 border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Enquiries List */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-[#2D3436]/40 uppercase tracking-widest text-xs flex items-center gap-2">
                <Filter size={14} /> Intake Ledger
              </h2>
            </div>

            <div className="space-y-4 max-h-[85vh] overflow-y-auto pr-2 scrollbar-hide">
              {enquiries.map((enquiry) => (
                <div
                  key={enquiry.id}
                  className={`bg-white p-5 border-2 border-black rounded-2xl cursor-pointer transition-all hover:translate-y-[-2px] active:translate-y-0 ${selectedEnquiry?.id === enquiry.id ? 'neo-shadow-sm border-[#6C5CE7] bg-[#6C5CE7]/5' : 'neo-shadow-sm'
                    }`}
                  onClick={() => setSelectedEnquiry(enquiry)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-bold text-[#2D3436] text-lg uppercase tracking-tight">{enquiry.name}</h3>
                        {enquiry.adminReply ? (
                          <span className="bg-[#EEFDF9] text-[#00B894] px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-[#00B894]/20">
                            REPLIED
                          </span>
                        ) : (
                          <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-red-100">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-[#2D3436]/40 font-bold text-xs uppercase tracking-widest">{enquiry.categoryName}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <select
                        value={enquiry.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => updateEnquiryStatus(enquiry.id, e.target.value as EnquiryStatus)}
                        disabled={updatingStatus === enquiry.id}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase border-2 shadow-sm ${STATUS_COLORS[enquiry.status]
                          } ${updatingStatus === enquiry.id ? 'opacity-50' : ''} cursor-pointer focus:outline-none`}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-bold text-[#2D3436]/60">
                    <div className="flex items-center gap-2">
                      <Users size={12} className="text-[#6C5CE7]" />
                      <span>{enquiry.audienceSize} PPL</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign size={12} className="text-[#6C5CE7]" />
                      <span>{enquiry.budgetRange}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t-2 border-black/5 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-[#2D3436]/30">
                    <span>
                      {(() => {
                        const d = getValidDate(enquiry.createdAt);
                        return d ? format(d, 'MMM dd, yyyy') : 'N/A';
                      })()}
                    </span>
                    {selectedEnquiry?.id === enquiry.id && (
                      <ChevronRight size={14} className="text-[#6C5CE7]" />
                    )}
                  </div>
                </div>
              ))}

              {enquiries.length === 0 && (
                <div className="bg-white border-2 border-dashed border-black rounded-[20px] p-12 text-center">
                  <MessageSquare className="w-12 h-12 text-black/10 mx-auto mb-4" />
                  <p className="font-bold text-[#2D3436]/40 uppercase text-xs tracking-widest">No active enquiries</p>
                </div>
              )}
            </div>
          </div>

          {/* Enquiry Details & Reply */}
          <div className="lg:col-span-12 xl:col-span-7 space-y-8 lg:mt-6">
            {selectedEnquiry ? (
              <>
                {/* Info Card */}
                <div className="bg-white rounded-3xl border-2 border-black neo-shadow overflow-hidden">
                  <div className="p-6 sm:p-8 bg-[#FFFDF5] border-b-2 border-black flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-black rounded-xl">
                        <Eye size={20} className="text-[#FFD93D]" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter text-[#2D3436]">Enquiry Data</h2>
                        <p className="text-xs font-bold text-[#2D3436]/40 uppercase tracking-widest">LOG_REF_{selectedEnquiry.id.slice(0, 8)}</p>
                      </div>
                    </div>
                    <div className={`px-4 py-1.5 rounded-lg border-2 ${STATUS_COLORS[selectedEnquiry.status]} font-bold text-xs uppercase tracking-widest shadow-sm`}>
                      {selectedEnquiry.status.replace('_', ' ')}
                    </div>
                  </div>

                  <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div className="p-4 bg-[#FFFDF5] border-2 border-black rounded-xl">
                        <h3 className="text-xs font-bold text-[#2D3436]/40 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <Users size={12} className="text-[#6C5CE7]" /> Lead Identification
                        </h3>
                        <p className="font-bold text-xl text-[#2D3436]">{selectedEnquiry.name}</p>
                        <div className="flex items-center gap-2 text-sm font-bold text-[#6C5CE7] mt-1">
                          <Mail size={12} /> {selectedEnquiry.email}
                        </div>
                        {selectedEnquiry.phone && (
                          <div className="flex items-center gap-2 text-sm font-bold text-[#2D3436]/60 mt-1">
                            <Phone size={12} /> {selectedEnquiry.phone}
                          </div>
                        )}
                      </div>

                      <div className="p-4 bg-white border-2 border-black rounded-xl">
                        <h3 className="text-xs font-bold text-[#2D3436]/40 uppercase tracking-widest mb-2">Event Scope</h3>
                        <p className="font-bold text-base text-[#2D3436] leading-relaxed">{selectedEnquiry.occasionDetails}</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 border-2 border-black rounded-xl bg-white shadow-inner">
                          <p className="text-[10px] font-bold uppercase text-[#2D3436]/40 mb-1">AUDIENCE</p>
                          <p className="font-black text-xl text-[#2D3436]">{selectedEnquiry.audienceSize}</p>
                        </div>
                        <div className="p-4 border-2 border-black rounded-xl bg-white shadow-inner">
                          <p className="text-[10px] font-bold uppercase text-[#2D3436]/40 mb-1">BUDGET</p>
                          <p className="font-black text-sm md:text-xl text-[#2D3436] break-words">{selectedEnquiry.budgetRange}</p>
                        </div>

                      </div>

                      <div className="p-4 border-2 border-black rounded-xl bg-[#FFFDF5]">
                        <h3 className="text-xs font-bold uppercase text-[#2D3436]/40 mb-2 flex items-center gap-2">
                          <Calendar size={12} className="text-[#6C5CE7]" /> Preferred Timeline
                        </h3>
                        <p className="font-bold text-base text-[#2D3436]">{selectedEnquiry.preferredDateRange}</p>
                      </div>
                    </div>

                    {selectedEnquiry.status === 'confirmed' && (
                      <div className="p-4 border-4 border-[#00B894] rounded-xl bg-[#EEFDF9] shadow-md relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#00B894]/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
                        <p className="text-xs font-black uppercase text-[#00B894] mb-2 tracking-widest flex items-center gap-2">
                          <Sparkles size={14} /> FINAL PRICE (₹)
                        </p>
                        <input
                          type="number"
                          value={finalPrice}
                          onChange={(e) => setFinalPrice(e.target.value === '' ? '' : Number(e.target.value))}
                          onBlur={() => {
                            if (finalPrice !== '' && finalPrice !== selectedEnquiry.finalPrice) {
                              updateFinalPrice(selectedEnquiry.id, finalPrice);
                            }
                          }}
                          className="w-full px-3 py-2 border-2 border-[#00B894]/30 rounded-lg font-black text-lg text-[#2D3436] focus:outline-none focus:ring-4 focus:ring-[#00B894]/20 bg-white"
                          placeholder="Enter final amount"
                        />
                      </div>
                    )}

                    {selectedEnquiry.message && (
                      <div className="md:col-span-2 bg-[#FFFDF5] border-2 border-black p-5 rounded-xl relative shadow-[4px_4px_0px_#000] mt-4">
                        <div className="absolute top-0 right-4 -translate-y-1/2 px-2 py-0.5 bg-[#FFD93D] border-2 border-black rounded-lg text-[8px] font-bold uppercase tracking-widest text-[#2D3436]">
                          USER MESSAGE
                        </div>
                        <p className="font-medium text-[#2D3436] leading-relaxed italic text-sm">
                          "{selectedEnquiry.message}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Section */}
                <div className="bg-white rounded-3xl border-2 border-black neo-shadow overflow-hidden">
                  <div className="p-5 bg-black flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-[#6C5CE7] rounded-lg">
                        <MessageCircleReply size={16} className="text-white" />
                      </div>
                      <h3 className="font-black uppercase tracking-widest text-[10px] text-white">Transmission Protocol</h3>
                    </div>
                  </div>

                  <div className="p-8 space-y-8">
                    {/* Public Reply */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-end">
                        <h4 className="text-[10px] font-bold text-[#2D3436]/40 uppercase tracking-widest">Public Correspondence (Hub Transmission)</h4>
                        {selectedEnquiry.adminReply && (
                          <div className="flex items-center gap-1.5 text-[8px] font-bold text-[#00B894] uppercase tracking-widest bg-[#EEFDF9] px-2 py-0.5 rounded-lg border border-[#00B894]/20">
                            <Sparkles size={8} /> SYNCED RECORD
                          </div>
                        )}
                      </div>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your official response to the customer. This will be visible on their dashboard hub."
                        className="w-full px-4 py-4 border-2 border-black rounded-xl text-sm font-bold text-[#2D3436] focus:outline-none focus:bg-[#FFFDF5] focus:ring-4 focus:ring-[#FFD93D]/10 transition-all resize-none min-h-[160px] shadow-inner"
                      />
                      <button
                        onClick={() => saveReply(selectedEnquiry.id)}
                        disabled={savingReply}
                        className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${savingReply ? 'bg-gray-100 text-black/20' : 'bg-[#00B894] text-white border-2 border-black neo-shadow-sm hover:translate-y-[-2px] active:translate-y-0'
                          }`}
                      >
                        {savingReply ? 'TRANSMITTING...' : (
                          <>
                            <Send size={16} /> SEND & SAVE TRANSMISSION
                          </>
                        )}
                      </button>
                    </div>

                    {/* Internal Notes */}
                    <div className="pt-8 border-t-2 border-black/5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-[#6C5CE7]" />
                        <h4 className="text-[10px] font-bold text-[#2D3436]/40 uppercase tracking-widest">HQ Internal Commentary (Private)</h4>
                      </div>
                      <textarea
                        value={selectedEnquiry.internalNotes || ''}
                        onChange={(e) => updateInternalNotes(selectedEnquiry.id, e.target.value)}
                        placeholder="Enter tactical notes for internal review only..."
                        className="w-full px-4 py-3 border-2 border-black rounded-xl text-xs font-bold text-[#2D3436] focus:outline-none focus:bg-[#FFFDF5] resize-none bg-[#FFFDF5]/50"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-3xl border-4 border-black border-dashed neo-shadow p-12 text-center h-[500px] flex flex-col items-center justify-center bg-[#FFFDF5]/50">
                <div className="p-6 bg-black/5 rounded-full mb-6 relative">
                  <Sparkles size={48} className="text-[#6C5CE7] animate-pulse" />
                  <Eye size={24} className="text-black absolute -top-1 -right-1" />
                </div>
                <h3 className="text-3xl font-black uppercase text-[#2D3436]/40 tracking-tighter">Standby Mode</h3>
                <p className="font-bold text-[#2D3436]/20 text-xs uppercase tracking-widest mt-2 max-w-[240px]">Select an intake record from the ledger to begin analysis.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </RoleProtected>
  );
}