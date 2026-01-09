'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { Trash2, ExternalLink, Calendar, User, Mail, MessageSquare, AlertCircle, CheckCircle2, Send, MessageCircleReply } from 'lucide-react';
import RoleProtected from '@/components/auth/RoleProtected';
import { USER_ROLES } from '@/lib/roles';
import { format } from 'date-fns';
import { usePopup } from '@/app/context/PopupContext';

// Helper to safely parse dates
const getValidDate = (date: any): Date | null => {
    if (!date) return null;
    try {
        const d = new Date(date);
        return isNaN(d.getTime()) ? null : d;
    } catch {
        return null;
    }
};

interface Inquiry {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    createdAt: any;
    status: string;
    reply?: string;
    repliedAt?: any;
}

export default function AdminInquiriesPage() {
    const { showConfirm, showAlert } = usePopup();
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
    const [replyText, setReplyText] = useState('');
    const [saving, setSaving] = useState(false);

    const fetchInquiries = async () => {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) return;

            const token = await currentUser.getIdToken();
            const response = await fetch('/api/admin/inquiries', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setInquiries(data.inquiries || []);
        } catch (error) {
            console.error('Error fetching inquiries:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInquiries();
    }, []);

    useEffect(() => {
        if (selectedInquiry) {
            setReplyText(selectedInquiry.reply || '');
        }
    }, [selectedInquiry]);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const confirmed = await showConfirm('Are you sure you want to delete this inquiry?', 'Delete Inquiry');
        if (!confirmed) return;

        try {
            const currentUser = auth.currentUser;
            if (!currentUser) return;

            const token = await currentUser.getIdToken();
            await fetch(`/api/admin/inquiries/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setInquiries(inquiries.filter(iq => iq.id !== id));
            if (selectedInquiry?.id === id) setSelectedInquiry(null);
            showAlert('Inquiry deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting inquiry:', error);
            showAlert('Failed to delete inquiry', 'error');
        }
    };

    const handleSaveReply = async () => {
        if (!selectedInquiry) return;

        try {
            setSaving(true);
            const currentUser = auth.currentUser;
            if (!currentUser) return;

            const token = await currentUser.getIdToken();
            const response = await fetch(`/api/admin/inquiries/${selectedInquiry.id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    reply: replyText,
                    status: 'replied'
                })
            });

            if (response.ok) {
                setInquiries(inquiries.map(iq =>
                    iq.id === selectedInquiry.id
                        ? { ...iq, reply: replyText, status: 'replied', repliedAt: new Date() }
                        : iq
                ));
                setSelectedInquiry(prev => prev ? { ...prev, reply: replyText, status: 'replied', repliedAt: new Date() } : null);
                showAlert('Reply saved and status updated!', 'success');
            } else {
                throw new Error('Failed to save');
            }
        } catch (error) {
            console.error('Error saving reply:', error);
            showAlert('Failed to save reply', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <RoleProtected allowedRoles={[USER_ROLES.ADMIN]}>
            <div className="min-h-screen bg-[#FFFDF5] p-8 max-w-7xl mx-auto space-y-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-black pb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-black rounded-2xl border-2 border-black neo-shadow -rotate-3">
                            <MessageSquare className="text-[#FFD93D] w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="font-header text-5xl font-black text-[#2D3436] mb-1 uppercase tracking-tighter">Inquiries</h1>
                            <p className="text-lg text-[#2D3436]/60 font-black uppercase tracking-widest">Master User Transmission Logs</p>
                        </div>
                    </div>
                    <div className="bg-white border-2 border-black px-4 py-2 rounded-xl neo-shadow font-bold uppercase text-[10px] tracking-widest text-[#2D3436]">
                        Total Inquiries: {inquiries.length}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* List Section */}
                    <div className="lg:col-span-12">
                        <div className="overflow-hidden border-2 border-black rounded-[20px] bg-white neo-shadow relative">
                            <div className="overflow-x-auto scrollbar-hide">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#FFFDF5] border-b-2 border-black">
                                            <th className="p-4 font-bold uppercase tracking-widest text-[10px] text-[#2D3436]/40">Received</th>
                                            <th className="p-4 font-bold uppercase tracking-widest text-[10px] text-[#2D3436]/40">Sender</th>
                                            <th className="p-4 font-bold uppercase tracking-widest text-[10px] text-[#2D3436]/40">Subject</th>
                                            <th className="p-4 font-bold uppercase tracking-widest text-[10px] text-[#2D3436]/40">Status</th>
                                            <th className="p-4 font-bold uppercase tracking-widest text-[10px] text-[#2D3436]/40 text-right pr-6">Management</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y-2 divide-black/10">
                                        {loading ? (
                                            <tr>
                                                <td colSpan={5} className="p-12 text-center text-black/40 font-black uppercase animate-pulse">
                                                    Loading Inquiries...
                                                </td>
                                            </tr>
                                        ) : inquiries.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="p-12 text-center">
                                                    <AlertCircle className="w-12 h-12 text-black/20 mx-auto mb-4" />
                                                    <p className="font-black text-black/40 uppercase">No inquiries found yet!</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            inquiries.map((iq) => (
                                                <tr
                                                    key={iq.id}
                                                    onClick={() => setSelectedInquiry(iq)}
                                                    className={`border-b-2 border-black/5 hover:bg-gray-50 cursor-pointer transition-colors ${selectedInquiry?.id === iq.id ? 'bg-[#FFD93D]/10' : ''}`}
                                                >
                                                    <td className="p-4 font-bold text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar size={14} className="text-black/40" />
                                                            {(() => {
                                                                const d = getValidDate(iq.createdAt);
                                                                return d ? format(d, 'MMM dd, HH:mm') : 'N/A';
                                                            })()}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-sm uppercase text-[#2D3436]">{iq.name}</span>
                                                            <span className="text-[10px] text-[#2D3436]/40 font-bold uppercase tracking-wider">{iq.email}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="font-bold text-sm line-clamp-1 text-[#2D3436]">{iq.subject}</span>
                                                    </td>
                                                    <td className="p-4">
                                                        {iq.reply ? (
                                                            <span className="px-2 py-1 bg-[#EEFDF9] text-[#00B894] border border-[#00B894] rounded-lg font-bold text-[10px] uppercase tracking-widest flex items-center gap-1 w-fit">
                                                                <CheckCircle2 size={10} /> REPLIED
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 py-1 bg-blue-50 text-[#6366F1] border border-[#6366F1]/20 rounded-lg font-bold text-[10px] uppercase tracking-widest flex items-center gap-1 w-fit">
                                                                NEW
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-right pr-6">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setSelectedInquiry(iq); }}
                                                                className="p-2 border-2 border-black rounded-lg bg-white neo-shadow-sm hover:translate-y-[-2px] hover:shadow-none active:translate-y-0 transition-all text-[#6C5CE7]"
                                                            >
                                                                <MessageCircleReply size={14} />
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleDelete(iq.id, e)}
                                                                className="p-2 border-2 border-black rounded-lg bg-white neo-shadow-sm hover:translate-y-[-2px] hover:shadow-none active:translate-y-0 transition-all text-red-500"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal/Detail View */}
                {selectedInquiry && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
                        <div
                            className="bg-white border-4 border-black rounded-3xl w-full max-w-4xl overflow-hidden shadow-[12px_12px_0px_#000] relative flex flex-col max-h-[90vh]"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Decorative Background */}
                            <div className="absolute top-0 right-0 w-48 h-48 bg-[#6C5CE7] opacity-10 rounded-bl-full pointer-events-none" />

                            <div className="bg-[#FFFDF5] p-6 border-b-4 border-black flex justify-between items-center relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-black rounded-xl rotate-6 neo-shadow">
                                        <MessageCircleReply size={24} className="text-[#FFD93D]" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-black uppercase tracking-tight">Response Hub</h3>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40">Inquiry Communication Protocol</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedInquiry(null)}
                                    className="w-10 h-10 bg-white border-2 border-black rounded-xl flex items-center justify-center hover:bg-black hover:text-white transition-all neo-shadow-sm"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto relative z-10 scrollbar-hide">
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="p-4 bg-[#FFFDF5] border-2 border-black rounded-xl">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#2D3436]/40 mb-1">Sender Identification</p>
                                            <div className="flex items-center gap-2 font-bold text-sm text-[#2D3436]">
                                                <User size={14} className="text-[#6C5CE7]" />
                                                {selectedInquiry.name}
                                            </div>
                                            <div className="flex items-center gap-2 font-bold text-xs text-[#2D3436]/60 mt-2">
                                                <Mail size={12} className="text-[#6C5CE7]" />
                                                {selectedInquiry.email}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#2D3436]/40 mb-1">Subject Matter</p>
                                        <p className="font-bold text-lg text-[#2D3436] tracking-tight">{selectedInquiry.subject}</p>
                                    </div>

                                    <div className="bg-white border-2 border-black p-5 rounded-xl relative shadow-[4px_4px_0px_#000]">
                                        <div className="absolute top-0 right-4 -translate-y-1/2 px-2 py-0.5 bg-[#FFD93D] border-2 border-black rounded-lg text-[8px] font-bold uppercase tracking-widest">
                                            MESSAGE CONTENT
                                        </div>
                                        <p className="font-medium text-[#2D3436] leading-relaxed whitespace-pre-wrap text-sm">
                                            {selectedInquiry.message}
                                        </p>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <a
                                            href={`mailto:${selectedInquiry.email}?subject=Re: ${selectedInquiry.subject}`}
                                            className="flex-1 py-4 bg-white text-black border-2 border-black rounded-xl font-black uppercase tracking-widest text-xs neo-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2"
                                        >
                                            <ExternalLink size={18} />
                                            Open External Mail Client
                                        </a>
                                    </div>
                                </div>

                                <div className="space-y-6 lg:border-l-2 lg:border-black/5 lg:pl-8">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#6C5CE7]">Dispatch Admin Protocol</p>
                                            {selectedInquiry.repliedAt && (() => {
                                                const d = getValidDate(selectedInquiry.repliedAt);
                                                return d ? (
                                                    <span className="text-[8px] font-bold text-[#2D3436]/40 uppercase">
                                                        Synced: {format(d, 'MMM dd, HH:mm')}
                                                    </span>
                                                ) : null;
                                            })()}
                                        </div>
                                        <textarea
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder="Write your internal record of the reply here..."
                                            className="w-full h-[200px] p-4 bg-gray-50 border-2 border-black rounded-xl font-bold text-sm focus:outline-none focus:bg-white focus:ring-4 focus:ring-[#6C5CE7]/10 transition-all resize-none"
                                        />
                                        <button
                                            onClick={handleSaveReply}
                                            disabled={saving}
                                            className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all ${saving
                                                ? 'bg-gray-100 text-black/20'
                                                : 'bg-[#00B894] text-white border-2 border-black neo-shadow-sm hover:translate-y-[-2px] active:translate-y-0'
                                                }`}
                                        >
                                            {saving ? 'TRANSMITTING...' : (
                                                <>
                                                    <Send size={16} /> SYNC REPLY RECORD
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    <div className="p-4 bg-blue-50 border-2 border-[#6366F1]/20 rounded-xl">
                                        <p className="text-[10px] font-bold text-[#6366F1] uppercase tracking-widest mb-1">Status Protocol</p>
                                        <p className="text-[10px] font-semibold text-[#6366F1]/70 leading-relaxed">
                                            Saving a reply will automatically mark this inquiry as "Replied". This record is for internal tracking.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </RoleProtected>
    );
}
