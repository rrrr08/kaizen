'use client';

import { useState, useEffect } from 'react';
import { CommunityThread } from '@/lib/types';
import { CommunityService } from '@/lib/db/community-service';
import { useAuth } from '@/app/context/AuthContext';
import { isAdmin } from '@/lib/roles';
import { MessageSquare, Calendar, Shield, Lock, Plus } from 'lucide-react';
import CreateThreadModal from './CreateThreadModal';
import Link from 'next/link';

export default function ThreadList() {
    const { user, userProfile } = useAuth();
    const [threads, setThreads] = useState<CommunityThread[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [filter, setFilter] = useState<'all' | 'general' | 'announcement' | 'qna'>('all');

    useEffect(() => {
        setLoading(true);
        const unsubscribe = CommunityService.subscribeToThreads((updatedThreads) => {
            setThreads(updatedThreads);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filteredThreads = filter === 'all'
        ? threads
        : threads.filter(t => t.category === filter);

    const getCategoryColor = (cat: string) => {
        switch (cat) {
            case 'announcement': return 'bg-red-100 text-red-800 border-red-200';
            case 'qna': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                <div>
                    <h3 className="font-header text-3xl text-black mb-2">Discussions</h3>
                    <p className="text-black/60 font-medium">Join the conversation with fellow community members.</p>
                </div>

                {isAdmin(userProfile) && (
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#6C5CE7] transition-all"
                    >
                        <Plus size={16} />
                        New Thread
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {['all', 'general', 'announcement', 'qna'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider border-2 transition-all ${filter === f
                            ? 'bg-[#FFD93D] text-black border-black'
                            : 'bg-white text-black/50 border-transparent hover:bg-gray-100'
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-10">Loading threads...</div>
                ) : filteredThreads.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-black/10 rounded-xl">
                        <p className="text-black/40 font-bold">No threads found in this category.</p>
                    </div>
                ) : (
                    filteredThreads.map(thread => (
                        <Link key={thread.id} href={`/community/${thread.id}`}>
                            <div className="group bg-white border-2 border-black p-6 rounded-[20px] neo-shadow hover:translate-y-[-2px] transition-all cursor-pointer relative overflow-hidden">
                                {thread.category === 'announcement' && (
                                    <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-widest">
                                        Official
                                    </div>
                                )}

                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg border-2 ${getCategoryColor(thread.category)}`}>
                                            {thread.category === 'announcement' ? <Shield size={18} /> :
                                                thread.category === 'qna' ? <MessageSquare size={18} /> :
                                                    <MessageSquare size={18} />}
                                        </div>
                                        <div>
                                            <h4 className="font-header text-xl text-black group-hover:text-[#6C5CE7] transition-colors">
                                                {thread.title}
                                            </h4>
                                            <p className="text-xs text-black/40 font-bold uppercase tracking-wider">
                                                {new Date(thread.createdAt?.seconds * 1000).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-black/40">
                                        <div className="flex items-center gap-1">
                                            <MessageSquare size={14} />
                                            <span className="text-xs font-black">{thread.messageCount || 0}</span>
                                        </div>
                                        {thread.isLocked && <Lock size={14} />}
                                    </div>
                                </div>

                                <p className="text-black/70 font-medium text-sm line-clamp-2 pl-[52px]">
                                    {thread.description}
                                </p>
                            </div>
                        </Link>
                    ))
                )}
            </div>

            <CreateThreadModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    setIsCreateModalOpen(false);
                }}
            />
        </div>
    );
}
