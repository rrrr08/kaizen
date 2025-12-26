"use client";

import React, { useState, useEffect } from 'react';
import { getDocs, collection, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { GameEvent } from '@/lib/types';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { ErrorScreen } from '@/components/ui/error-screen';
import { Calendar } from 'lucide-react';

const Events: React.FC = () => {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                // Using a simple query first, can add status filter later
                const q = query(collection(db, 'events'), orderBy('datetime', 'asc'));
                const querySnapshot = await getDocs(q);

                const eventsData = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    const dateObj = data.datetime instanceof Timestamp ? data.datetime.toDate() : new Date(data.datetime);

                    return {
                        id: doc.id,
                        ...data,
                        title: data.title || 'UNNAMED_OPERATION',
                        date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                        time: dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                        location: data.location || 'UNKNOWN_SECTOR',
                        price: data.price || 0,
                        image: data.image || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop'
                    };
                });

                setEvents(eventsData);
            } catch (err: any) {
                console.error("Error fetching events:", err);
                setError(err.message || "FAILED_TO_RETRIEVE_MISSION_DATA");
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    if (loading) return <LoadingScreen message="SCANNING_MISSION_LOGS..." />;
    if (error) return <ErrorScreen error={new Error(error)} reset={() => window.location.reload()} title="MISSION_DATA_CORRUPT" message="UNABLE_TO_LOAD_EVENTS" />;

    return (
        <div className="max-w-7xl mx-auto px-4 py-20 min-h-screen">
            <div className="text-center mb-24">
                <div className="arcade-panel-header bg-[#FFD400] mx-auto mb-2">LIVE.CONNECTION</div>
                <h1 className="font-arcade text-7xl text-white text-3d-orange leading-none uppercase">LIVE ARENA</h1>
                <p className="text-gray-500 font-bold uppercase tracking-[0.4em] text-xs mt-4">Physical collective meets for high-stakes play</p>
            </div>

            {events.length === 0 ? (
                <div className="text-center py-24 border-2 border-dashed border-[#333] rounded-[4px]">
                    <Calendar className="w-16 h-16 text-[#333] mx-auto mb-6" />
                    <p className="text-gray-500 font-arcade tracking-widest text-xl">NO_ACTIVE_OPERATIONS</p>
                    <p className="text-gray-600 font-mono text-sm mt-2 uppercase">Standby for new mission directives</p>
                </div>
            ) : (
                <div className="space-y-24">
                    {events.map((event) => (
                        <div key={event.id} className="relative group">
                            <div className="arcade-panel-header bg-[#FF8C00]">MISSION_LOG_{event.id.substring(0, 8)}</div>
                            <div className="arcade-card-3d flex flex-col lg:flex-row overflow-hidden min-h-[500px] pixel-grid">
                                {/* Corner Accents */}
                                <div className="corner-bracket top-4 left-4 border-t-2 border-l-2"></div>
                                <div className="corner-bracket bottom-4 right-4 border-b-2 border-r-2"></div>

                                <div className="lg:w-2/5 relative h-80 lg:h-auto overflow-hidden border-b-4 lg:border-b-0 lg:border-r-4 border-[#1A1A1A] group-hover:border-[#FFD400] transition-colors bg-black">
                                    <img src={event.image} className="w-full h-full object-cover opacity-20 group-hover:opacity-80 transition-all duration-1000 group-hover:scale-110" alt={event.title} />
                                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent"></div>
                                    <div className="absolute top-10 left-10 flex flex-col gap-4">
                                        <div className="bg-[#FF8C00] text-black font-arcade px-6 py-3 shadow-[6px_6px_0px_black] text-sm italic">
                                            STATUS: ACTIVE
                                        </div>
                                        <div className="bg-black/80 border border-white/20 text-white font-arcade text-[10px] p-2 tracking-widest">
                                            ZONE: HUB_ALPHA
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:w-3/5 p-10 lg:p-16 flex flex-col bg-gradient-to-br from-[#0D0D0D] to-black">
                                    <div className="flex justify-between items-start mb-10">
                                        <div>
                                            <h2 className="font-arcade text-4xl md:text-6xl mb-6 text-white text-3d-orange transition-all uppercase leading-none">{event.title}</h2>
                                            <div className="text-gray-400 font-bold uppercase text-xs tracking-[0.2em] flex flex-col gap-3">
                                                <span className="flex items-center gap-3"><span className="text-[#FF8C00]">TIMESTAMP:</span> {event.date} // {event.time}</span>
                                                <span className="flex items-center gap-3"><span className="text-[#FF8C00]">COORDINATES:</span> {event.location}</span>
                                            </div>
                                        </div>
                                        <div className="font-arcade text-4xl text-white bg-[#1A1A1A] p-6 border-2 border-[#333] shadow-[8px_8px_0px_#FF8C00] transition-all group-hover:border-[#FF8C00]">
                                            ${event.price}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-8 mb-14">
                                        <div className="bg-black/50 p-8 text-center border-2 border-[#1A1A1A] group-hover:border-[#FF8C00] transition-all shadow-inner relative overflow-hidden">
                                            <div className="font-arcade text-4xl text-[#FF8C00]">42</div>
                                            <div className="text-[10px] font-arcade text-gray-600 mt-2">HOURS_LEFT</div>
                                            <div className="absolute top-0 left-0 w-full h-1 bg-[#FF8C00]/20"></div>
                                        </div>
                                        <div className="bg-black/50 p-8 text-center border-2 border-[#1A1A1A] group-hover:border-[#FFD400] transition-all shadow-inner relative overflow-hidden">
                                            <div className="font-arcade text-4xl text-[#FFD400]">12</div>
                                            <div className="text-[10px] font-arcade text-gray-600 mt-2">MINUTES_LEFT</div>
                                            <div className="absolute top-0 left-0 w-full h-1 bg-[#FFD400]/20"></div>
                                        </div>
                                        <div className="bg-black/50 p-8 text-center border-2 border-[#1A1A1A] group-hover:border-white transition-all shadow-inner relative overflow-hidden">
                                            <div className="font-arcade text-4xl text-white">05</div>
                                            <div className="text-[10px] font-arcade text-gray-600 mt-2">SECONDS_LEFT</div>
                                            <div className="absolute top-0 left-0 w-full h-1 bg-white/10"></div>
                                        </div>
                                    </div>

                                    <p className="text-gray-500 mb-14 leading-relaxed text-lg italic border-l-4 border-[#1A1A1A] pl-8 group-hover:border-[#FF8C00] transition-all line-clamp-3">
                                        "{event.description || 'No briefing available.'}"
                                    </p>

                                    <div className="mt-auto">
                                        <button className="w-full bg-[#FFD400] text-black font-arcade text-2xl py-8 border-b-8 border-[#B8860B] active:border-b-0 active:translate-y-2 transition-all hover:bg-white shadow-[0_0_40px_rgba(255,212,0,0.15)] uppercase">
                                            INITIALIZE JOIN SEQUENCE
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-32 relative group">
                <div className="arcade-panel-header bg-white text-black">CUSTOM.QUERY</div>
                <div className="p-16 bg-[url('https://picsum.photos/seed/custom/1200/400')] bg-cover bg-center arcade-card-3d relative overflow-hidden pixel-grid">
                    <div className="absolute inset-0 bg-black/90 group-hover:bg-black/80 transition-colors"></div>
                    <div className="relative z-10 text-center max-w-3xl mx-auto">
                        <h2 className="font-arcade text-5xl mb-8 text-white text-3d-orange-deep uppercase leading-tight">HOST YOUR OWN SHOWDOWN</h2>
                        <p className="text-gray-400 text-xl mb-12 italic leading-relaxed">Corporate takeovers, wedding showdowns, or private tournaments. We bring the gear, the energy, and the rules. Fuel your vibe with a Joy Juncture takeover.</p>
                        <button className="bg-white text-black font-arcade text-lg px-16 py-6 border-b-8 border-gray-400 active:border-b-0 active:translate-y-2 transition-all hover:bg-[#FF8C00] uppercase">
                            RESERVE_SYSTEM
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Events;
