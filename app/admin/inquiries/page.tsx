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
            <div className="min-h-screen pt-8 pb-16">
                <div className="mb-12 border-b-2 border-black pb-8 flex justify-between items-end">
                    <div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 rounded-xl bg-[#6C5CE7] border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_#000]">
                                <MessageSquare className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="font-header text-5xl font-black text-black uppercase tracking-tighter">Inquiries</h1>
                                <p className="text-black/60 font-bold text-lg">Manage user submissions from the contact form</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border-2 border-black px-6 py-3 rounded-xl neo-shadow font-black uppercase text-sm">
                        Total Inquiries: {inquiries.length}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* List Section */}
                    <div className="lg:col-span-12">
                        <div className="bg-white border-2 border-black rounded-[25px] overflow-hidden shadow-[8px_8px_0px_#000]">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-black text-white">
                                            <th className="p-4 font-black uppercase tracking-wider text-xs">Date</th>
                                            <th className="p-4 font-black uppercase tracking-wider text-xs">Sender</th>
                                            <th className="p-4 font-black uppercase tracking-wider text-xs">Subject</th>
                                            <th className="p-4 font-black uppercase tracking-wider text-xs">Status</th>
                                            <th className="p-4 font-black uppercase tracking-wider text-xs text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
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
                                                            <span className="font-black text-sm uppercase">{iq.name}</span>
                                                            <span className="text-xs text-black/50 font-bold">{iq.email}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="font-bold text-sm line-clamp-1">{iq.subject}</span>
                                                    </td>
                                                    <td className="p-4 text-xs">
                                                        {iq.reply ? (
                                                            <span className="px-3 py-1 bg-green-100 text-green-700 border-2 border-green-200 rounded-full font-black uppercase flex items-center gap-1 w-fit">
                                                                <CheckCircle2 size={10} /> Replied
                                                            </span>
                                                        ) : (
                                                            <span className="px-3 py-1 bg-blue-50 text-[#6366F1] border-2 border-[#6366F1]/20 rounded-full font-black uppercase flex items-center gap-1 w-fit">
                                                                New
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setSelectedInquiry(iq); }}
                                                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors border-2 border-transparent hover:border-blue-100 flex items-center gap-2 font-black text-[10px] uppercase"
                                                            >
                                                                <MessageCircleReply size={18} />
                                                                Reply
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleDelete(iq.id, e)}
                                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border-2 border-transparent hover:border-red-100"
                                                            >
                                                                <Trash2 size={18} />
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
                            className="bg-white border-[3px] border-black rounded-[30px] w-full max-w-4xl overflow-hidden shadow-[12px_12px_0px_#000] relative"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="bg-[#6C5CE7] p-6 border-b-[3px] border-black flex justify-between items-center">
                                <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                    <MessageCircleReply className="w-6 h-6" /> Inquiry Response Hub
                                </h3>
                                <button
                                    onClick={() => setSelectedInquiry(null)}
                                    className="w-10 h-10 bg-white border-2 border-black rounded-full flex items-center justify-center font-black hover:bg-gray-100 transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[80vh] overflow-y-auto">
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-black/40">Sender</p>
                                            <div className="flex items-center gap-2 font-black text-sm">
                                                <User size={16} className="text-[#6C5CE7]" />
                                                {selectedInquiry.name}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-black/40">Email</p>
                                            <div className="flex items-center gap-2 font-black text-sm">
                                                <Mail size={16} className="text-[#6C5CE7]" />
                                                {selectedInquiry.email}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-black/40">Subject</p>
                                        <p className="font-black text-lg">{selectedInquiry.subject}</p>
                                    </div>

                                    <div className="bg-[#FFFDF5] border-2 border-black p-6 rounded-2xl relative shadow-[4px_4px_0px_rgba(0,0,0,0.05)]">
                                        <div className="absolute top-0 right-6 -translate-y-1/2 px-3 py-1 bg-[#FFD93D] border-2 border-black rounded-lg text-[10px] font-black uppercase tracking-widest">
                                            Message
                                        </div>
                                        <p className="font-medium text-black/80 leading-relaxed whitespace-pre-wrap">
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

                                <div className="space-y-6 border-l-2 border-black/5 pl-8">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[#6C5CE7]">Dispatch Admin Protocol</p>
                                            {selectedInquiry.repliedAt && (() => {
                                                const d = getValidDate(selectedInquiry.repliedAt);
                                                return d ? (
                                                    <span className="text-[8px] font-black text-black/40 uppercase">
                                                        Replied: {format(d, 'MMM dd, HH:mm')}
                                                    </span>
                                                ) : null;
                                            })()}
                                        </div>
                                        <textarea
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder="Write your internal record of the reply here..."
                                            className="w-full h-[250px] p-4 bg-gray-50 border-2 border-black rounded-2xl font-bold text-sm focus:outline-none focus:ring-4 focus:ring-[#6C5CE7]/10 transition-all resize-none shadow-inner"
                                        />
                                        <button
                                            onClick={handleSaveReply}
                                            disabled={saving}
                                            id="send-reply-button"
                                            className={`w-full py-5 rounded-xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 transition-all ${saving
                                                ? 'bg-gray-100 text-black/20'
                                                : 'bg-[#FFD93D] text-black border-2 border-black neo-shadow hover:translate-y-[-2px]'
                                                }`}
                                        >
                                            {saving ? 'TRANSMITTING...' : (
                                                <>
                                                    <Send size={18} /> SEND & SYNC REPLY RECORD
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    <div className="p-4 bg-blue-50 border-2 border-[#6366F1]/20 rounded-xl">
                                        <p className="text-[10px] font-black text-[#6366F1] uppercase tracking-widest mb-1">Status Protocol</p>
                                        <p className="text-xs font-bold text-[#6366F1]/70 leading-relaxed">
                                            Saving a reply will automatically mark this inquiry as "Replied" in the master logs. This acts as a confirmation for the team.
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
