'use client';

import { useState, useEffect } from 'react';
import { CommunityService } from '@/lib/db/community-service';
import { Shield, Check, Ban, AlertTriangle, User, History, Trash2, Filter } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function ModerationPage() {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const data = await CommunityService.getActiveReports();
            setReports(data || []);
        } catch (error) {
            console.error('Error fetching reports:', error);
            setReports([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (reportId: string, action: 'dismiss' | 'ban_user') => {
        if (!confirm(action === 'dismiss' ? 'Dismiss this report?' : 'Ban this user?')) return;

        await CommunityService.resolveReport(reportId, action);
        fetchReports(); // Refresh list
    };

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-8">
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6"
            >
                <div className="flex items-center gap-6">
                    <div className="p-5 bg-[#FFD93D] rounded-3xl border-4 border-black neo-shadow rotate-2">
                        <Shield size={40} className="text-black" />
                    </div>
                    <div>
                        <h1 className="font-header text-5xl font-black text-black tracking-tight uppercase">Security Vault</h1>
                        <p className="text-black/50 font-bold uppercase tracking-[0.2em] text-xs">Community Moderation & Safety Queue</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={fetchReports}
                        className="p-4 bg-white border-4 border-black rounded-2xl neo-shadow-sm hover:translate-y-[-2px] transition-all"
                    >
                        <History size={20} />
                    </button>
                    <button className="flex items-center gap-2 px-6 py-4 bg-white border-4 border-black rounded-2xl font-black uppercase tracking-widest text-sm neo-shadow-sm hover:translate-y-[-2px] transition-all">
                        <Filter size={18} />
                        Filter
                    </button>
                </div>
            </motion.div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <div className="w-16 h-16 border-8 border-black border-t-[#FFD93D] rounded-full animate-spin"></div>
                    <p className="mt-6 font-black uppercase tracking-widest text-black/40">Scanning community...</p>
                </div>
            ) : reports.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-24 bg-white border-4 border-black rounded-[40px] neo-shadow relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#00B894] opacity-10 rounded-bl-[100px]" />
                    <div className="mb-8 p-8 bg-[#00B894]/20 rounded-full text-[#00B894] border-4 border-[#00B894]/30">
                        <Check size={64} strokeWidth={3} />
                    </div>
                    <h3 className="font-header text-4xl font-black text-black mb-2 tracking-tight uppercase">Safe & Sound!</h3>
                    <p className="text-black/50 font-bold uppercase tracking-widest text-sm">No active reports found in the database.</p>
                </motion.div>
            ) : (
                <div className="grid gap-8">
                    <AnimatePresence mode="popLayout">
                        {reports.map((report, index) => (
                            <motion.div
                                key={report.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white border-4 border-black rounded-[32px] overflow-hidden neo-shadow-hover flex flex-col lg:flex-row"
                            >
                                {/* Reporter/User Sidebar */}
                                <div className="lg:w-1/4 p-6 bg-[#FFFDF5] border-b-4 lg:border-b-0 lg:border-r-4 border-black">
                                    <div className="flex lg:flex-col items-center lg:items-center gap-4">
                                        <div className="w-20 h-20 rounded-2xl border-4 border-black bg-white overflow-hidden relative flex-shrink-0 neo-shadow-sm">
                                            {report.userAvatar ? (
                                                <Image src={report.userAvatar} alt="User" fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center font-black text-2xl bg-gradient-to-br from-[#FFD93D] to-[#FF903D]">{report.userEmail?.[0]?.toUpperCase()}</div>
                                            )}
                                        </div>
                                        <div className="lg:text-center overflow-hidden w-full">
                                            <p className="font-black text-sm truncate uppercase tracking-tight">{report.userEmail}</p>
                                            <p className="text-[10px] text-black/40 font-black mt-1 uppercase tracking-widest truncate">{report.userId}</p>

                                            <div className="mt-4 flex flex-wrap lg:justify-center gap-2">
                                                <span className="px-3 py-1 bg-red-100 text-red-600 text-[9px] font-black uppercase tracking-[0.2em] rounded-full border-2 border-red-200">
                                                    FLAGGED
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Content Area */}
                                <div className="flex-1 p-8 bg-white flex flex-col gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30">REPORT SOURCE: {report.containerType || 'COMMUNITY'}</h4>
                                        </div>

                                        <div className="relative p-6 bg-red-50/50 border-4 border-dashed border-red-200 rounded-3xl group">
                                            <div className="absolute -top-4 -left-4 w-10 h-10 bg-white border-4 border-black rounded-xl flex items-center justify-center">
                                                <AlertTriangle size={18} className="text-red-500" />
                                            </div>
                                            <p className="text-xl font-bold italic text-black/80 leading-relaxed break-words">
                                                &quot;{report.originalContent || report.content}&quot;
                                            </p>
                                        </div>

                                        {/* Reason / Flagged Words */}
                                        {report.reason && (
                                            <div className="flex items-start gap-3 p-4 bg-red-100 border-2 border-red-300 rounded-xl">
                                                <div className="mt-1">
                                                    <Ban size={16} className="text-red-600" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-xs uppercase tracking-widest text-red-600 mb-1">Detection Logic</p>
                                                    <p className="text-sm font-bold text-red-800">{report.reason}</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-6 mt-6">
                                            <div className="flex items-center gap-2">
                                                <History size={14} className="text-black/40" />
                                                <span className="text-[10px] font-black text-black/40 uppercase tracking-widest">
                                                    {new Date(report.timestamp?.seconds * 1000).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <User size={14} className="text-black/40" />
                                                <span className="text-[10px] font-black text-black/40 uppercase tracking-widest">
                                                    Reported By: Admin
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Pane */}
                                <div className="p-8 bg-[#FFFDF5] border-t-4 lg:border-t-0 lg:border-l-4 border-black lg:w-1/4 flex lg:flex-col justify-center gap-4">
                                    <button
                                        onClick={() => handleAction(report.id, 'dismiss')}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white hover:bg-black hover:text-white transition-all border-4 border-black rounded-2xl font-black text-xs uppercase tracking-widest neo-shadow-sm active:translate-y-1 active:shadow-none"
                                    >
                                        <Trash2 size={16} />
                                        Clear
                                    </button>
                                    <button
                                        onClick={() => handleAction(report.id, 'ban_user')}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-red-500 hover:bg-black text-white transition-all border-4 border-black rounded-2xl font-black text-xs uppercase tracking-widest neo-shadow-sm active:translate-y-1 active:shadow-none"
                                    >
                                        <Ban size={16} />
                                        Exile
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
