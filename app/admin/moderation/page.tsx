'use client';

import { useState, useEffect } from 'react';
import { CommunityService } from '@/lib/db/community-service';
import { Shield, Check, Ban, AlertTriangle } from 'lucide-react';
import Image from 'next/image';

export default function ModerationPage() {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        const data = await CommunityService.getActiveReports();
        setReports(data);
        setLoading(false);
    };

    const handleAction = async (reportId: string, action: 'dismiss' | 'ban_user') => {
        if (!confirm(action === 'dismiss' ? 'Dismiss this report?' : 'Ban this user?')) return;

        await CommunityService.resolveReport(reportId, action);
        fetchReports(); // Refresh list
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 border-b-2 border-black/10 pb-6">
                <div className="p-3 bg-[#FFD93D] rounded-xl border-2 border-black neo-shadow-sm">
                    <Shield size={32} strokeWidth={2.5} />
                </div>
                <div>
                    <h1 className="font-header text-4xl text-black">Moderation Queue</h1>
                    <p className="text-black/60 font-medium">Review reported content and manage community safety.</p>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-black border-t-[#FFD93D]"></div>
                </div>
            ) : reports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-black/20 rounded-[30px] bg-white">
                    <div className="mb-4 p-4 bg-green-100 rounded-full text-green-600">
                        <Check size={48} />
                    </div>
                    <h3 className="font-header text-2xl text-black mb-2">All Clear!</h3>
                    <p className="text-black/50 font-medium">No active reports to review.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {reports.map((report) => (
                        <div key={report.id} className="bg-white border-2 border-black rounded-[20px] p-6 neo-shadow flex flex-col md:flex-row gap-6">
                            {/* User Info */}
                            <div className="flex items-start gap-4 md:w-1/4 min-w-[200px]">
                                <div className="w-12 h-12 rounded-full border-2 border-black bg-gray-100 overflow-hidden relative flex-shrink-0">
                                    {report.userAvatar ? (
                                        <Image src={report.userAvatar} alt="User" fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-bold text-lg">{report.userEmail?.[0]}</div>
                                    )}
                                </div>
                                <div>
                                    <p className="font-black text-sm">{report.userEmail}</p>
                                    <p className="text-xs text-black/50 font-mono">{report.userId}</p>
                                    <span className="inline-block mt-2 px-2 py-0.5 bg-red-100 text-red-800 text-[10px] uppercase font-black tracking-wider rounded">
                                        Reported
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 bg-red-50 border-2 border-red-100 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2 text-red-800/60 font-bold uppercase tracking-widest text-xs">
                                    <AlertTriangle size={14} />
                                    Flagged Content
                                </div>
                                <p className="font-medium text-lg text-black">"{report.content}"</p>
                                <p className="text-xs text-black/40 mt-4 capitalize">
                                    Source: {report.containerType} • {new Date(report.timestamp?.seconds * 1000).toLocaleString()}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-row md:flex-col gap-3 justify-center md:border-l-2 border-black/10 md:pl-6">
                                <button
                                    onClick={() => handleAction(report.id, 'dismiss')}
                                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-black font-bold text-xs uppercase tracking-widest hover:bg-gray-100 transition-colors"
                                >
                                    Dismiss
                                </button>
                                <button
                                    onClick={() => handleAction(report.id, 'ban_user')}
                                    className="flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-600 transition-colors shadow-[4px_4px_0px_rgba(0,0,0,0.2)]"
                                >
                                    <Ban size={16} /> Ban User
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
