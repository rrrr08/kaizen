'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CommunityThread } from '@/lib/types';
import ChatInterface from '@/app/components/community/ChatInterface';
import { ArrowLeft, MessageSquare, Shield, Lock } from 'lucide-react';
import Link from 'next/link';

export default function ThreadPage() {
    const { threadId } = useParams();
    const router = useRouter();
    const [thread, setThread] = useState<CommunityThread | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (threadId) fetchThread();
    }, [threadId]);

    const fetchThread = async () => {
        try {
            const docRef = doc(db, 'community_threads', threadId as string);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                setThread({ id: snap.id, ...snap.data() } as CommunityThread);
            } else {
                router.push('/community'); // fallback if not found
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen pt-32 pb-16 flex items-center justify-center bg-[#FFFDF5]">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#FFD93D] border-t-black"></div>
        </div>
    );

    if (!thread) return null;

    return (
        <div className="min-h-screen pt-32 pb-16 bg-[#FFFDF5]">
            <div className="max-w-4xl mx-auto px-6">

                {/* Header */}
                <div className="mb-8">
                    <Link href="/community" className="inline-flex items-center gap-2 text-black/50 hover:text-black font-black text-xs uppercase tracking-widest mb-6 transition-colors">
                        <ArrowLeft size={14} /> Back to Community
                    </Link>

                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="bg-[#6C5CE7] text-white text-[10px] font-black uppercase px-2 py-1 rounded tracking-widest">
                                    {thread.category}
                                </span>
                                {thread.isLocked && (
                                    <span className="bg-red-100 text-red-800 text-[10px] font-black uppercase px-2 py-1 rounded tracking-widest flex items-center gap-1">
                                        <Lock size={10} /> Locked
                                    </span>
                                )}
                            </div>
                            <h1 className="font-header text-4xl mb-4 text-black">{thread.title}</h1>
                            <p className="text-black/70 font-medium text-lg leading-relaxed max-w-2xl">
                                {thread.description}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Chat Area */}
                <ChatInterface
                    containerId={thread.id}
                    containerType="thread"
                    isLocked={thread.isLocked}
                />
            </div>
        </div>
    );
}
