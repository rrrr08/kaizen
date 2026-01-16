'use client';

import { useState, useEffect, useRef } from 'react';
import { CommunityMessage } from '@/lib/types';
import { CommunityService } from '@/lib/db/community-service';
import { useAuth } from '@/app/context/AuthContext';
import { useGamification } from '@/app/context/GamificationContext';
import { Send, User, Shield } from 'lucide-react';
import Image from 'next/image';

interface Props {
    containerId: string;
    containerType: 'thread' | 'event';
    isLocked?: boolean;
}

export default function ChatInterface({ containerId, containerType, isLocked = false }: Props) {
    const { user, userProfile } = useAuth();
    const { tier, allTiers } = useGamification(); // Get current user tier and all configs
    const [messages, setMessages] = useState<CommunityMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const hasScrolledRef = useRef(false);

    // Initial load and real-time subscription
    useEffect(() => {
        // Validation check for containerId
        if (!containerId) return;

        const unsubscribe = CommunityService.subscribeToMessages(containerId, containerType, (msgs) => {
            setMessages(prev => {
                // If this is the initial load (prev is empty), replacing is fine
                if (prev.length === 0) {
                    // Force scroll to bottom on initial load
                    requestAnimationFrame(() => {
                        if (containerRef.current) {
                            containerRef.current.scrollTop = containerRef.current.scrollHeight;
                        }
                    });
                    return msgs;
                }

                // If we have history, we need to intelligently merge
                // Get IDs of new chunk
                const newIds = new Set(msgs.map(m => m.id));
                // Keep existing messages that are NOT in the new chunk (i.e., older history)
                const olderHistory = prev.filter(m => !newIds.has(m.id));

                // Check if we should auto-scroll (user is near bottom)
                // We check this BEFORE updating state/DOM, but applying it AFTER render
                let shouldAutoScroll = false;
                if (containerRef.current) {
                    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
                    const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
                    shouldAutoScroll = isNearBottom;
                }

                if (shouldAutoScroll) {
                    requestAnimationFrame(() => {
                        if (containerRef.current) {
                            containerRef.current.scrollTop = containerRef.current.scrollHeight;
                        }
                    });
                }

                // Combine: olderHistory + newChunk (msgs is already ordered Old -> New by service callback)
                return [...olderHistory, ...msgs];
            });
        });
        return () => unsubscribe();
    }, [containerId, containerType]);

    const handleScroll = async () => {
        if (!containerRef.current || loadingMore) return;

        // Track that user has scrolled
        hasScrolledRef.current = true;

        const { scrollTop, scrollHeight } = containerRef.current;
        if (scrollTop === 0 && messages.length >= 50) {
            setLoadingMore(true);
            // Save current scroll height to maintain position after loading
            const oldScrollHeight = scrollHeight;

            // Fetch older messages
            const oldestMsg = messages[0];
            if (oldestMsg?.timestamp) {
                const olderMsgs = await CommunityService.getOlderMessages(
                    containerId,
                    containerType,
                    oldestMsg.timestamp
                );

                if (olderMsgs.length > 0) {
                    // Prepend older messages. 
                    // olderMsgs are fetched Descending (Newest -> Oldest). 
                    // We need them Ascending (Oldest -> Newest) to prepend them correctly [Oldest...Newer, Current...]
                    const sortedOlder = olderMsgs.reverse();

                    setMessages(prev => [...sortedOlder, ...prev]);

                    // Maintain scroll position
                    requestAnimationFrame(() => {
                        if (containerRef.current) {
                            const newScrollHeight = containerRef.current.scrollHeight;
                            containerRef.current.scrollTop = newScrollHeight - oldScrollHeight;
                        }
                    });
                }
            }
            setLoadingMore(false);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newMessage.trim() || sending) return;

        setSending(true);
        await CommunityService.sendMessage(
            containerId,
            containerType,
            {
                id: user.uid,
                name: userProfile?.name || 'Anonymous',
                email: user.email || '',
                avatar: userProfile?.photoURL || userProfile?.avatar_url || '',
                role: userProfile?.role,
                tierName: tier.name // Pass current tier name
            },
            newMessage
        );
        setNewMessage('');
        setSending(false);
        // Scroll to bottom after sending
        requestAnimationFrame(() => {
            if (containerRef.current) {
                containerRef.current.scrollTop = containerRef.current.scrollHeight;
            }
        });
    };

    const getRoleBadge = (role?: string) => {
        if (role === 'admin') {
            return (
                <span className="bg-red-100 text-red-800 text-[10px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider flex items-center gap-1 border border-red-200">
                    <Shield size={10} /> Admin
                </span>
            );
        }
        return null;
    };

    const getTierBadge = (tierName?: string) => {
        if (!tierName || !allTiers.length) return null;
        const tierConfig = allTiers.find(t => t.name === tierName);
        if (!tierConfig) return null;

        const color = tierConfig.color || 'text-gray-400';

        return (
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1 border ${color.replace('text-', 'bg-').replace('400', '100')} ${color.replace('text-', 'text-').replace('400', '800')} border-${color.replace('text-', '').replace('400', '200')}`}>
                <span className="text-[10px]">{tierConfig.icon}</span> {tierConfig.name}
            </span>
        );
    };

    return (
        <div className="flex flex-col h-[600px] border-2 border-black rounded-[20px] bg-white overflow-hidden neo-shadow relative">
            {/* Messages Area */}
            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50"
            >
                {loadingMore && (
                    <div className="text-center py-2 text-xs text-black/40 font-bold uppercase tracking-widest">
                        Loading history...
                    </div>
                )}

                {messages.length === 0 && !loadingMore && (
                    <div className="h-full flex flex-col items-center justify-center text-black/30">
                        <User size={48} className="mb-2 opacity-20" />
                        <p className="font-bold uppercase tracking-widest text-xs">No messages yet</p>
                        <p className="text-xs">Be the first to say hello!</p>
                    </div>
                )}

                {messages.map((msg) => {
                    const isMe = msg.senderId === user?.uid;
                    return (
                        <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                                <div className={`w-8 h-8 rounded-full overflow-hidden border border-black/20 ${isMe ? 'bg-[#FFD93D]' : 'bg-[#6C5CE7]'}`}>
                                    {msg.senderAvatar && msg.senderAvatar.startsWith('http') ? (
                                        <Image src={msg.senderAvatar} alt={msg.senderName} width={32} height={32} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">
                                            {msg.senderName ? msg.senderName[0].toUpperCase() : '?'}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Bubble */}
                            <div className={`flex flex-col max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className="flex flex-wrap items-center gap-2 mb-1 px-1">
                                    <span className="text-[10px] font-bold text-black/60 uppercase tracking-widest">
                                        {msg.senderName}
                                    </span>
                                    {getRoleBadge(msg.senderRole)}
                                    {getTierBadge(msg.senderTier)}
                                    <span className="text-[10px] text-black/30">
                                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                                    </span>
                                </div>

                                <div className={`px-4 py-2 rounded-2xl border-2 text-sm font-medium ${isMe
                                    ? 'bg-black text-white border-black rounded-tr-none'
                                    : 'bg-white text-black border-black/10 rounded-tl-none neo-shadow-sm'
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t-2 border-black/10">
                {isLocked ? (
                    <div className="text-center py-2 text-black/40 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                        <Shield size={14} /> Only admins can post here
                    </div>
                ) : !user ? (
                    <div className="text-center py-2">
                        <p className="text-black/40 font-bold text-sm mb-2">Please log in to chat</p>
                    </div>
                ) : userProfile?.isBanned ? (
                    <div className="text-center py-3 bg-red-50 border-2 border-red-100 rounded-xl">
                        <p className="text-red-500 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                            <Shield size={14} /> You have been banned from chatting
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSend} className="flex gap-2">
                        <input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="flex-1 bg-gray-100 border-2 border-transparent focus:border-black focus:bg-white rounded-xl px-4 py-3 font-medium text-sm transition-all focus:outline-none"
                            placeholder="Type your message..."
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim() || sending}
                            className="bg-[#FFD93D] text-black border-2 border-black p-3 rounded-xl hover:translate-y-[-2px] hover:shadow-[2px_2px_0px_#000] transition-all disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
                        >
                            <Send size={20} />
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
