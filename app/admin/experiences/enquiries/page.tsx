'use client';

import { useState, useEffect } from 'react';
import { ExperienceEnquiry, EnquiryStatus } from '@/lib/types';
import { Eye, MessageSquare, Phone, Mail, Calendar, DollarSign, Users, ChevronRight, MessageCircleReply, Trash2, Send } from 'lucide-react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const STATUS_COLORS = {
  new: 'bg-blue-100 text-blue-800 border-blue-500',
  contacted: 'bg-yellow-100 text-yellow-800 border-yellow-500',
  in_discussion: 'bg-orange-100 text-orange-800 border-orange-500',
  confirmed: 'bg-purple-100 text-purple-800 border-purple-500',
  completed: 'bg-green-100 text-green-800 border-green-500',
  archived: 'bg-gray-100 text-gray-800 border-gray-500',
};

const STATUS_OPTIONS: EnquiryStatus[] = ['new', 'contacted', 'in_discussion', 'confirmed', 'completed', 'archived'];

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<ExperienceEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEnquiry, setSelectedEnquiry] = useState<ExperienceEnquiry | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [savingReply, setSavingReply] = useState(false);
  const [replyText, setReplyText] = useState('');

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

      alert('Reply saved successfully!');
    } catch (err) {
      console.error('Error saving reply:', err);
      setError('Failed to save reply');
    } finally {
      setSavingReply(false);
    }
  };

  if (checkingAdmin) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#FFD93D] border-t-black mb-4"></div>
          <p className="text-black/60 font-black text-xs tracking-[0.4em]">CHECKING ADMIN ACCESS...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#FFD93D] border-t-black mb-4"></div>
          <p className="text-black/60 font-black text-xs tracking-[0.4em]">LOADING ENQUIRIES...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Experience Enquiries</h1>
        <p className="text-black/60">Manage incoming experience enquiries and reply to users</p>
      </div>

      {error && (
        <div className="bg-red-100 border-2 border-red-500 rounded-lg p-4 mb-6">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Enquiries List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border-2 border-black neo-shadow overflow-hidden">
            <div className="p-6 border-b border-black/10 flex justify-between items-center">
              <h2 className="text-xl font-bold text-black">All Enquiries ({enquiries.length})</h2>
            </div>

            <div className="max-h-[800px] overflow-y-auto">
              {enquiries.map((enquiry) => (
                <div
                  key={enquiry.id}
                  className={`p-6 border-b border-black/10 cursor-pointer hover:bg-black/5 transition-colors ${selectedEnquiry?.id === enquiry.id ? 'bg-[#FFD93D]/10' : ''
                    }`}
                  onClick={() => setSelectedEnquiry(enquiry)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-black text-lg">{enquiry.name}</h3>
                        {enquiry.adminReply ? (
                          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tight border border-green-200">
                            Replied
                          </span>
                        ) : (
                          <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tight border border-red-200">
                            Pending
                          </span>
                        )}
                      </div>
                      <p className="text-black/60 text-sm">{enquiry.categoryName}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <select
                        value={enquiry.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => updateEnquiryStatus(enquiry.id, e.target.value as EnquiryStatus)}
                        disabled={updatingStatus === enquiry.id}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-[0.1em] uppercase border-2 ${STATUS_COLORS[enquiry.status]
                          } ${updatingStatus === enquiry.id ? 'opacity-50' : ''} cursor-pointer`}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedEnquiry(enquiry); }}
                        className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline"
                      >
                        <MessageCircleReply size={14} /> Reply
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-black/60" />
                      <span className="text-black/80 truncate">{enquiry.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-black/60" />
                      <span className="text-black/80">{enquiry.audienceSize}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-black/60" />
                      <span className="text-black/80">{enquiry.preferredDateRange}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign size={14} className="text-black/60" />
                      <span className="text-black/80">{enquiry.budgetRange}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-black/40">
                    <span>
                      {enquiry.createdAt ? new Date(enquiry.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                    {enquiry.repliedAt && (
                      <span className="text-green-600">
                        Replied: {new Date(enquiry.repliedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {enquiries.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-black/60 font-bold text-lg">No enquiries found</p>
                  <p className="text-black/40 text-sm mt-2">Enquiries will appear here when submitted</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enquiry Details & Reply */}
        <div className="lg:col-span-2 space-y-8">
          {selectedEnquiry ? (
            <>
              {/* Info Card */}
              <div className="bg-white rounded-lg border-2 border-black neo-shadow p-6">
                <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-black/5">
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-black">Enquiry Data</h2>
                    <p className="text-xs font-bold text-black/40 uppercase tracking-widest">ID: {selectedEnquiry.id}</p>
                  </div>
                  <div className={`px-4 py-2 rounded-xl border-2 ${STATUS_COLORS[selectedEnquiry.status]} font-black text-xs uppercase tracking-widest`}>
                    {selectedEnquiry.status.replace('_', ' ')}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xs font-black text-black/40 uppercase tracking-widest mb-1">Customer</h3>
                      <p className="font-bold">{selectedEnquiry.name}</p>
                      <p className="text-sm font-medium">{selectedEnquiry.email}</p>
                      {selectedEnquiry.phone && <p className="text-sm font-medium">{selectedEnquiry.phone}</p>}
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-black/40 uppercase tracking-widest mb-1">Occasion</h3>
                      <p className="font-bold">{selectedEnquiry.occasionDetails}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xs font-black text-black/40 uppercase tracking-widest mb-1">Specs</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-[10px] font-black uppercase text-black/30">Audience</p>
                          <p className="font-bold">{selectedEnquiry.audienceSize}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-black/30">Budget</p>
                          <p className="font-bold">{selectedEnquiry.budgetRange}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[10px] font-black uppercase text-black/30">Date Preference</p>
                          <p className="font-bold">{selectedEnquiry.preferredDateRange}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedEnquiry.message && (
                  <div className="mt-8 pt-6 border-t-2 border-black/5">
                    <h3 className="text-xs font-black text-black/40 uppercase tracking-widest mb-2">User Message</h3>
                    <div className="bg-[#F8F9FA] p-4 rounded-xl border-2 border-black/5 text-sm font-medium italic">
                      "{selectedEnquiry.message}"
                    </div>
                  </div>
                )}
              </div>

              {/* Action Section */}
              <div className="bg-white rounded-lg border-2 border-black neo-shadow overflow-hidden">
                <div className="p-6 bg-black text-white flex items-center gap-3">
                  <MessageCircleReply size={20} />
                  <h3 className="font-black uppercase tracking-widest text-sm">Admin Response Protocol</h3>
                </div>

                <div className="p-6 space-y-6">
                  {/* Public Reply */}
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <h4 className="text-xs font-black text-black/40 uppercase tracking-widest">Public Reply (Visible to User)</h4>
                      {selectedEnquiry.adminReply && (
                        <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">
                          Last Saved: {selectedEnquiry.repliedAt ? new Date(selectedEnquiry.repliedAt).toLocaleString() : 'Recently'}
                        </span>
                      )}
                    </div>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply to the user here. This will be visible on their profile hub."
                      className="w-full px-4 py-3 border-2 border-black rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#FFD93D]/20 transition-all resize-none min-h-[150px] shadow-inner"
                    />
                    <button
                      onClick={() => saveReply(selectedEnquiry.id)}
                      disabled={savingReply}
                      id="save-reply-experience"
                      className={`mt-4 w-full py-5 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${savingReply ? 'bg-gray-200 text-gray-500' : 'bg-[#FFD93D] text-black border-2 border-black neo-shadow hover:translate-y-[-2px]'
                        }`}
                    >
                      {savingReply ? 'TRANSMITTING...' : (
                        <>
                          <Send size={18} /> SEND & SAVE OFFICIAL REPLY
                        </>
                      )}
                    </button>
                  </div>

                  {/* Internal Notes */}
                  <div className="pt-6 border-t-2 border-black/5">
                    <h4 className="text-xs font-black text-black/40 uppercase tracking-widest mb-2">Internal HQ Notes (Private)</h4>
                    <textarea
                      value={selectedEnquiry.internalNotes || ''}
                      onChange={(e) => updateInternalNotes(selectedEnquiry.id, e.target.value)}
                      placeholder="Add internal notes for other admins..."
                      className="w-full px-3 py-2 border-2 border-black/5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] focus:border-transparent resize-none bg-[#F8F9FA]"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg border-4 border-black neo-shadow p-12 text-center h-[400px] flex flex-col items-center justify-center border-dashed">
              <Eye size={64} className="text-black/10 mb-4" />
              <h3 className="text-2xl font-black uppercase text-black/40 tracking-tighter">No Access Point Selected</h3>
              <p className="font-bold text-black/20 text-sm">Select an enquiry from the list to begin transmission.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}