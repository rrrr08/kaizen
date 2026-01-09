'use client';

import React, { useEffect, useState } from 'react';
import { collection, getDocs, getDoc, doc, orderBy, query, limit, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Gamepad2, ShoppingCart, Clock, Trophy, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AnalyticMetric {
    title: string;
    value: string | number;
    subValue: string;
    icon: any;
    color: string;
    bg: string;
}

interface TopItem {
    name: string;
    count: number;
}

export default function DeepAnalytics() {
    const [metrics, setMetrics] = useState<AnalyticMetric[]>([]);
    const [topGames, setTopGames] = useState<TopItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDeepAnalytics();
    }, []);

    const fetchDeepAnalytics = async () => {
        try {
            setLoading(true);

            // 1. Most Played Game (Aggregate from gamePlays or use Settings fallback)
            // Strategy: 
            // 1. Fetch `settings/gamePoints` to get all available games (definitions).
            // 2. Fetch `games` collection for stats (if it exists).
            // 3. Merge. If no stats, show 0 plays but list the games.

            const [gamesConfigSnap, gamesCollectionSnap] = await Promise.all([
                getDoc(doc(db, 'settings', 'gamePoints')),
                getDocs(collection(db, 'games'))
            ]);

            const gameStats: TopItem[] = [];
            const gamesMap = new Map<string, { name: string, plays: number }>();

            // Load definitions from settings
            if (gamesConfigSnap.exists()) {
                const config = gamesConfigSnap.data();
                Object.entries(config).forEach(([key, value]: [string, any]) => {
                    gamesMap.set(key, { name: value.name || key, plays: 0 });
                });
            } else {
                // Fallback hardcoded list if settings missing
                const defaults = {
                    chess: "Chess Puzzle", sudoku: "Sudoku", wordle: "Wordle",
                    "2048": "2048", trivia: "Trivia", minesweeper: "Minesweeper"
                };
                Object.entries(defaults).forEach(([key, name]) => gamesMap.set(key, { name, plays: 0 }));
            }

            // Load play counts from 'games' collection if available
            if (!gamesCollectionSnap.empty) {
                gamesCollectionSnap.docs.forEach(doc => {
                    const data = doc.data();
                    const key = doc.id;
                    const plays = data.playCount || data.plays || 0;
                    if (gamesMap.has(key)) {
                        const entry = gamesMap.get(key)!;
                        entry.plays = plays;
                    } else {
                        gamesMap.set(key, { name: data.title || data.name || key, plays });
                    }
                });
            }

            // Convert map to array and sort
            gameStats.push(...Array.from(gamesMap.values()).map(g => ({ name: g.name, count: g.plays })));

            gameStats.sort((a, b) => b.count - a.count);
            setTopGames(gameStats.slice(0, 5));

            let mostPlayedGame = 'No Data';
            let maxPlays = 0;
            // Set Most Played Game text
            if (gameStats.length > 0) {
                // If all zero, default to "Chess Puzzle" or first item but show "No plays yet"
                if (gameStats[0].count === 0) {
                    mostPlayedGame = gameStats[0].name; // Just show the top game name
                } else {
                    mostPlayedGame = gameStats[0].name;
                    maxPlays = gameStats[0].count;
                }
            }


            // 2. Best Selling Product
            const [ordersSnapshot, productsSnapshot] = await Promise.all([
                getDocs(collection(db, 'orders')),
                getDocs(collection(db, 'products'))
            ]);

            const productMap = new Map<string, string>();
            productsSnapshot.docs.forEach(doc => {
                productMap.set(doc.id, doc.data().name || doc.data().title || 'Unknown Product');
            });

            const productSales: Record<string, number> = {};

            ordersSnapshot.docs.forEach(doc => {
                const order = doc.data();
                if (order.items && Array.isArray(order.items)) {
                    order.items.forEach((item: any) => {
                        // Use item title, or lookup by ID, or fallback
                        let title = item.title || item.name;
                        // Try lookup by productId if title is missing
                        if (!title && item.productId) {
                            title = productMap.get(item.productId);
                        }
                        // Default fallback
                        title = title || 'Unknown Product';

                        productSales[title] = (productSales[title] || 0) + (item.quantity || 1);
                    });
                }
            });

            let bestSeller = 'N/A';
            let maxSales = 0;
            // Find max
            const sortedProducts = Object.entries(productSales).sort(([, a], [, b]) => b - a);
            if (sortedProducts.length > 0) {
                bestSeller = sortedProducts[0][0];
                maxSales = sortedProducts[0][1];
            } else if (!ordersSnapshot.empty) {
                // If orders exist but processing failed somehow
                bestSeller = "Analyzing...";
            } else {
                bestSeller = "No Sales Yet";
            }


            // 3. Average Active Time (Real Calculation with Fallback)
            // Query 50 recent users
            const usersSnapshot = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(50)));
            let totalMinutes = 0;
            let usersWithStats = 0;

            if (!usersSnapshot.empty) {
                const statsPromises = usersSnapshot.docs.map(u =>
                    getDoc(doc(db, 'users', u.id, 'stats', 'timeOnline'))
                );

                const statsSnapshots = await Promise.all(statsPromises);

                statsSnapshots.forEach(snap => {
                    if (snap.exists()) {
                        const data = snap.data();
                        if (data.totalMinutes) {
                            totalMinutes += data.totalMinutes;
                            usersWithStats++;
                        }
                    }
                });
            }

            let avgTime = "0m";
            if (usersWithStats > 0) {
                const avgMins = Math.floor(totalMinutes / usersWithStats);
                const hrs = Math.floor(avgMins / 60);
                const mins = avgMins % 60;
                avgTime = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
            } else {
                // Fallback if no specific stats found. Show a default or "0m" is fine if true.
                // To avoid looking "broken", we can say "0m (No activity)"
                avgTime = "0m";
            }


            // 4. Top Event
            const eventsSnapshot = await getDocs(query(collection(db, 'events'), orderBy('registered', 'desc'), limit(1)));
            let topEvent = 'No Events';
            let topEventCount = 0;
            if (!eventsSnapshot.empty) {
                const evt = eventsSnapshot.docs[0].data();
                topEvent = evt.title;
                topEventCount = evt.registered || 0;
            }


            setMetrics([
                {
                    title: 'Most Played Game',
                    value: mostPlayedGame,
                    subValue: `${maxPlays} plays all-time`,
                    icon: Gamepad2,
                    color: '#6C5CE7',
                    bg: '#EFEEFC'
                },
                {
                    title: 'Best Selling Product',
                    value: bestSeller,
                    subValue: `${maxSales} units sold`,
                    icon: ShoppingCart,
                    color: '#00B894',
                    bg: '#E6FFFA'
                },
                {
                    title: 'Avg. Session Time',
                    value: avgTime,
                    subValue: `Based on active users`,
                    icon: Clock,
                    color: '#FFD93D',
                    bg: '#FFFBF0'
                },
                {
                    title: 'Top Event',
                    value: topEvent,
                    subValue: `${topEventCount} attendees`,
                    icon: Trophy,
                    color: '#FF7675',
                    bg: '#FFF0F0'
                }
            ]);

        } catch (error) {
            console.error("Error fetching deep analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full p-8 flex justify-center">
                <Loader2 className="animate-spin text-gray-400" />
            </div>
        )
    }

    return (
        <div className="mb-8">
            <h3 className="font-header text-2xl font-black text-black uppercase tracking-tighter mb-6 flex items-center gap-2">
                <Trophy className="text-[#FDCB6E]" />
                Deep Dive Analytics
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {metrics.map((m, i) => (
                    <div key={i} className="bg-white border-2 border-black rounded-2xl p-6 neo-shadow hover:translate-y-[-2px] transition-transform">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-xl border-2 border-black" style={{ backgroundColor: m.bg }}>
                                <m.icon style={{ color: m.color }} size={24} />
                            </div>
                        </div>
                        <h4 className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-1">{m.title}</h4>
                        <p className="font-black text-lg text-black leading-tight mb-2 line-clamp-2 min-h-[3.5rem] flex items-end">
                            {m.value}
                        </p>
                        <div className="text-xs font-bold text-black/40 bg-gray-50 rounded-lg px-2 py-1 inline-block border border-black/5">
                            {m.subValue}
                        </div>
                    </div>
                ))}
            </div>

            {/* Bonus: Game Popularity Chart */}
            <div className="bg-white border-2 border-black rounded-[25px] p-8 neo-shadow">
                <h4 className="font-black text-lg uppercase mb-6">Game Popularity Trends</h4>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topGames}>
                            <XAxis dataKey="name" fontSize={12} tickMargin={10} />
                            <YAxis allowDecimals={false} fontSize={12} />
                            <Tooltip
                                cursor={{ fill: '#f4f4f5' }}
                                contentStyle={{ borderRadius: '12px', border: '2px solid black', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                            />
                            <Bar dataKey="count" fill="#6C5CE7" radius={[4, 4, 0, 0]}>
                                {topGames.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={['#6C5CE7', '#00B894', '#FF7675', '#FDCB6E'][index % 4]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
