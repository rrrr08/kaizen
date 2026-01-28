'use client';

import React, { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface PulseEvent {
    id: string;
    time: string;
    msg: string;
    type: 'info' | 'success' | 'warning';
    timestamp: number;
}

export default function LivePulse() {
    const [events, setEvents] = useState<PulseEvent[]>([]);

    useEffect(() => {
        const fetchLiveEvents = async () => {
            try {
                const newEvents: PulseEvent[] = [];

                // 1. Recent Orders
                const ordersQ = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(5));
                const ordersSnap = await getDocs(ordersQ);
                ordersSnap.forEach(doc => {
                    const data = doc.data();
                    const date = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
                    newEvents.push({
                        id: doc.id,
                        time: getTimeAgo(date),
                        msg: `New Order #...${doc.id.slice(-6).toUpperCase()} confirmed (₹${(data.totalPrice || 0).toLocaleString()})`,
                        type: 'success',
                        timestamp: date.getTime()
                    });
                });

                // 2. New Users
                const usersQ = query(collection(db, 'users'), orderBy('created_at', 'desc'), limit(5));
                const usersSnap = await getDocs(usersQ);
                usersSnap.forEach(doc => {
                    const data = doc.data();
                    const date = data.created_at?.toDate ? data.created_at.toDate() : new Date(data.created_at || Date.now());
                    newEvents.push({
                        id: doc.id,
                        time: getTimeAgo(date),
                        msg: `User ${data.displayName || 'Guest'} joined`,
                        type: 'info',
                        timestamp: date.getTime()
                    });
                });

                // Sort by newest first
                setEvents(newEvents.sort((a, b) => b.timestamp - a.timestamp).slice(0, 6));

            } catch (error) {
                console.error("Error fetching live pulse:", error);
            }
        };

        fetchLiveEvents();
        // Poll every 30s
        const interval = setInterval(fetchLiveEvents, 30000);
        return () => clearInterval(interval);
    }, []);

    const getTimeAgo = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m ago";
        return Math.floor(seconds) + "s ago";
    };

    return (
        <div className="bg-white p-4 md:p-6 rounded-2xl neo-border shadow-sm h-full">
            <div className="flex items-center gap-2 mb-4 md:mb-6 border-b-2 border-black/5 pb-4">
                <Activity className="text-[#6C5CE7]" size={20} />
                <h3 className="text-lg md:text-xl font-black uppercase italic">Live Pulse</h3>
                <span className="ml-auto flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
            </div>

            <div className="space-y-4">
                {events.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">Listening for events...</p>
                ) : (
                    events.map((evt) => (
                        <div key={evt.id} className="flex gap-4 items-start text-sm">
                            <span className="font-mono text-xs text-gray-400 min-w-[60px]">{evt.time}</span>
                            <span className={`font-medium ${evt.type === 'warning' ? 'text-red-500' : evt.type === 'success' ? 'text-green-600' : 'text-gray-700'}`}>
                                {evt.msg}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
