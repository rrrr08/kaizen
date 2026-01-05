'use client';

import { useState, useEffect } from 'react';
import { ExperienceEnquiry, EnquiryStatus } from '@/lib/types';
import { Eye, MessageSquare, Phone, Mail, Calendar, DollarSign, Users } from 'lucide-react';
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
        fetchEnquiries(user);
      } catch (err) {
        console.error('Admin check failed', err);
        window.location.href = '/';
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchEnquiries = async (user: any) => {
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

      // Get auth token
      const { getAuth } = await import('firebase/auth');
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
        enquiry.id === enquiryId ? data.enquiry : enquiry
      ));
    } catch (err) {
      console.error('Error updating enquiry status:', err);
      setError('Failed to update enquiry status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const updateInternalNotes = async (enquiryId: string, notes: string) => {
    try {
      // Get auth token
      const { getAuth } = await import('firebase/auth');
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
        body: JSON.stringify({ internalNotes: notes }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update internal notes');
      }

      // Update local state
      setEnquiries(prev => prev.map(enquiry =>
        enquiry.id === enquiryId ? data.enquiry : enquiry
      ));
    } catch (err) {
      console.error('Error updating internal notes:', err);
      setError('Failed to update internal notes');
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
        <p className="text-black/60">Manage incoming experience enquiries</p>
      </div>

      {error && (
        <div className="bg-red-100 border-2 border-red-500 rounded-lg p-4 mb-6">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Enquiries List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border-2 border-black neo-shadow overflow-hidden">
            <div className="p-6 border-b border-black/10">
              <h2 className="text-xl font-bold text-black">All Enquiries ({enquiries.length})</h2>
            </div>

            <div className="max-h-[600px] overflow-y-auto">
              {enquiries.map((enquiry) => (
                <div
                  key={enquiry.id}
                  className={`p-6 border-b border-black/10 cursor-pointer hover:bg-black/5 transition-colors ${
                    selectedEnquiry?.id === enquiry.id ? 'bg-[#FFD93D]/10' : ''
                  }`}
                  onClick={() => setSelectedEnquiry(enquiry)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-black text-lg">{enquiry.name}</h3>
                      <p className="text-black/60">{enquiry.categoryName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={enquiry.status}
                        onChange={(e) => updateEnquiryStatus(enquiry.id, e.target.value as EnquiryStatus)}
                        disabled={updatingStatus === enquiry.id}
                        className={`px-3 py-1 rounded-full text-xs font-bold tracking-[0.1em] uppercase border-2 ${
                          STATUS_COLORS[enquiry.status]
                        } ${updatingStatus === enquiry.id ? 'opacity-50' : ''}`}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-[0.1em] uppercase border-2 ${
                        STATUS_COLORS[enquiry.status]
                      }`}>
                        {enquiry.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-black/60" />
                      <span className="text-black/80">{enquiry.email}</span>
                    </div>
                    {enquiry.phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-black/60" />
                        <span className="text-black/80">{enquiry.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-black/60" />
                      <span className="text-black/80">{enquiry.audienceSize}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-black/60" />
                      <span className="text-black/80">{enquiry.preferredDateRange}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign size={14} className="text-black/60" />
                      <span className="text-black/80">{enquiry.budgetRange}</span>
                    </div>
                    <span className="text-black/40">
                      {enquiry.createdAt ? new Date(enquiry.createdAt).toLocaleDateString() : 'N/A'} at {enquiry.createdAt ? new Date(enquiry.createdAt).toLocaleTimeString() : ''}
                    </span>
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

        {/* Enquiry Details */}
        <div className="lg:col-span-1">
          {selectedEnquiry ? (
            <div className="bg-white rounded-lg border-2 border-black neo-shadow p-6 sticky top-8">
              <h2 className="text-xl font-bold text-black mb-6">Enquiry Details</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-black mb-2">Contact Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {selectedEnquiry.name}</p>
                    <p><strong>Email:</strong> {selectedEnquiry.email}</p>
                    {selectedEnquiry.phone && <p><strong>Phone:</strong> {selectedEnquiry.phone}</p>}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-black mb-2">Experience Details</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Category:</strong> {selectedEnquiry.categoryName}</p>
                    <p><strong>Occasion:</strong> {selectedEnquiry.occasionDetails}</p>
                    <p><strong>Audience Size:</strong> {selectedEnquiry.audienceSize}</p>
                    <p><strong>Date Range:</strong> {selectedEnquiry.preferredDateRange}</p>
                    <p><strong>Budget:</strong> {selectedEnquiry.budgetRange}</p>
                  </div>
                </div>

                {selectedEnquiry.specialRequirements && (
                  <div>
                    <h3 className="font-bold text-black mb-2">Special Requirements</h3>
                    <p className="text-sm text-black/80">{selectedEnquiry.specialRequirements}</p>
                  </div>
                )}

                {selectedEnquiry.message && (
                  <div>
                    <h3 className="font-bold text-black mb-2">Message</h3>
                    <p className="text-sm text-black/80">{selectedEnquiry.message}</p>
                  </div>
                )}

                <div>
                  <h3 className="font-bold text-black mb-2">Internal Notes</h3>
                  <textarea
                    value={selectedEnquiry.internalNotes || ''}
                    onChange={(e) => updateInternalNotes(selectedEnquiry.id, e.target.value)}
                    placeholder="Add internal notes..."
                    className="w-full px-3 py-2 border-2 border-black rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <h3 className="font-bold text-black mb-2">Status History</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Created:</strong> {selectedEnquiry.createdAt ? new Date(selectedEnquiry.createdAt).toLocaleString() : 'N/A'}</p>
                    <p><strong>Last Updated:</strong> {selectedEnquiry.updatedAt ? new Date(selectedEnquiry.updatedAt).toLocaleString() : 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border-2 border-black neo-shadow p-6 text-center">
              <Eye size={48} className="text-black/20 mx-auto mb-4" />
              <p className="text-black/60 font-bold">Select an enquiry to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}