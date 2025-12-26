'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { ErrorScreen } from '@/components/ui/error-screen';

const categories = [
    'All',
    'Gameplay Guides',
    'Strategy & Tips',
    'Event Stories',
    'Community & Trips',
    'Behind the Scenes'
];

export default function Blog() {
    const [blogPosts, setBlogPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState('All');

    useEffect(() => {
        fetchBlogPosts();
    }, []);

    const fetchBlogPosts = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/blog?status=all`);

            if (!response.ok) {
                throw new Error(`Failed to fetch blog posts: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setBlogPosts(data.posts || []);
            } else {
                setError(data.error || 'Failed to load blog posts');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load blog posts');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredPosts = activeCategory === 'All'
        ? blogPosts
        : blogPosts.filter(post => post.category === activeCategory);

    if (loading) {
        return <LoadingScreen message="LOADING_DATA_STREAM..." />;
    }

    if (error) {
        return <ErrorScreen message={error} reset={fetchBlogPosts} title="TRANSMISSION_ERROR" />;
    }

    return (
        <div className="min-h-screen pt-32 pb-16 bg-black text-white font-sans selection:bg-[#FF8C00]/50 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 pixel-grid opacity-20 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#6C5CE7]/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
                {/* SECTION 1 — HERO */}
                <div className="text-center mb-24 max-w-4xl mx-auto">
                    <p className="text-[#FF8C00] font-arcade text-sm tracking-[0.4em] mb-6 uppercase inline-block px-4 py-1 border border-[#FF8C00] shadow-[0_0_10px_#FF8C00]">The Joy Juncture</p>
                    <h1 className="font-arcade text-6xl md:text-8xl mb-8 text-white leading-none tracking-tight text-3d-orange">
                        TRANSMISSIONS
                    </h1>
                    <p className="font-arcade text-lg text-gray-400 max-w-2xl mx-auto">
                        Stories from the neon grid — games, pilots, strategies, and shared joy.
                    </p>
                </div>

                {/* SECTION 2 — FEATURED STORY */}
                <section className="mb-32">
                    <div className="relative group cursor-pointer arcade-card-3d bg-[#111] overflow-hidden">
                        <div className="aspect-[21/9] w-full bg-[#111] relative opacity-80 group-hover:opacity-100 transition-opacity">
                            <div className="absolute inset-0 bg-[#FF8C00] mix-blend-overlay opacity-20 z-10"></div>
                            <img
                                src="https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop"
                                alt="Featured Story"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                        </div>
                        <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 bg-gradient-to-t from-black via-black/90 to-transparent text-white flex flex-col items-start justify-end h-full z-20">
                            <span className="bg-[#00B894] text-black text-[10px] font-arcade tracking-[0.2em] px-3 py-1 mb-4 uppercase shadow-[0_0_10px_#00B894]">
                                Featured Protocol
                            </span>
                            <h2 className="font-arcade text-4xl md:text-6xl mb-4 leading-tight group-hover:text-[#FF8C00] transition-colors text-white text-3d-purple">
                                The Art of the Game Night
                            </h2>
                            <p className="font-sans font-medium text-lg md:text-xl text-gray-300 max-w-2xl mb-6 leading-relaxed">
                                How a simple gathering turned into a weekly tradition of rivalry, laughter, and unbreakable bonds in the neon city.
                            </p>
                            <button className="flex items-center gap-2 text-xs font-arcade tracking-[0.3em] hover:gap-4 transition-all text-black uppercase bg-[#FF8C00] px-6 py-3 border-b-4 border-[#A0522D] active:border-b-0 active:translate-y-1">
                                ACCESS_FILE <span>&gt;</span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* SECTION 3 — FILTERS */}
                <div className="mb-20 sticky top-24 z-40 bg-black/95 backdrop-blur py-4 border-b border-[#333] overflow-x-auto">
                    <div className="flex items-center gap-4 min-w-max pb-2">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 text-[10px] font-arcade tracking-[0.2em] uppercase transition-all border ${activeCategory === cat
                                    ? 'bg-[#FF8C00] text-black border-[#FF8C00] shadow-[0_0_10px_#FF8C00]'
                                    : 'bg-black text-[#FF8C00] border-[#FF8C00]/50 hover:border-[#FF8C00]'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* SECTION 4 — BLOG GRID */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 mb-32">
                    {filteredPosts.map((post) => (
                        <article key={post.id} className="group cursor-pointer flex flex-col h-full bg-[#111] border border-[#333] p-4 arcade-card-3d hover:scale-[1.02] transition-transform">
                            <div className="aspect-[4/3] overflow-hidden mb-6 border border-[#333] relative">
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                                />
                            </div>
                            <div className="flex items-center gap-4 mb-3">
                                <span className="text-[#00B894] border border-[#00B894] px-2 py-0.5 font-arcade text-[9px] tracking-[0.2em] uppercase">{post.category}</span>
                                <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                                <span className="text-gray-500 font-arcade text-[10px] uppercase tracking-wider">{post.readTime}</span>
                            </div>
                            <h3 className="font-arcade text-xl md:text-2xl mb-3 leading-tight text-white group-hover:text-[#FF8C00] transition-colors uppercase">
                                {post.title}
                            </h3>
                            <p className="text-gray-400 font-sans text-sm leading-relaxed mb-4 flex-grow line-clamp-3">
                                {post.excerpt}
                            </p>
                        </article>
                    ))}
                </section>

                {/* SECTION 5 — LEARNING & GAMEPLAY HIGHLIGHT */}
                <section className="mb-32 bg-[#111] text-white border border-[#333] p-12 md:p-16 relative overflow-hidden shadow-[0_0_20px_rgba(255,140,0,0.1)]">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF8C00]/10 blur-[100px] rounded-full pointer-events-none"></div>
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        <div className="lg:col-span-5">
                            <h2 className="font-arcade text-4xl md:text-5xl mb-6 text-white text-3d-orange">MASTER THE GRID</h2>
                            <p className="text-gray-400 font-medium text-lg leading-relaxed mb-8 font-sans">
                                New to the Arcade? Or looking to master deep strategies?
                                Explore our comprehensive guides designed to make every session seamless.
                            </p>
                            <button className="px-8 py-4 bg-white text-black font-arcade text-xs tracking-[0.3em] hover:bg-[#FF8C00] transition-all border-b-4 border-gray-400 active:border-b-0 active:translate-y-1 uppercase">
                                EXPLORE GUIDES
                            </button>
                        </div>
                        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {['How-to-Play Videos', 'Rulebooks & FAQs', 'Strategy Breakdowns', 'House Rules'].map((item, idx) => (
                                <div key={idx} className="p-6 bg-black border border-[#333] hover:border-[#FF8C00] transition-all group cursor-pointer hover:shadow-[0_0_10px_rgba(255,140,0,0.3)]">
                                    <div className="w-10 h-10 flex items-center justify-center bg-[#FF8C00] text-black mb-4 group-hover:scale-110 transition-transform">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                    </div>
                                    <h3 className="font-arcade text-sm text-white mb-1 uppercase">{item}</h3>
                                    <p className="text-gray-500 text-[10px] uppercase tracking-wider font-arcade">Master the mechanics</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* SECTION 6 — COMMUNITY STORIES */}
                <section className="mb-32">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <div>
                            <h2 className="font-arcade text-4xl md:text-5xl text-white mb-4 text-3d-green">COMMUNITY LOGS</h2>
                            <p className="text-gray-400 font-bold font-sans italic text-xl">Real pilots. Real joy. Real memories.</p>
                        </div>
                        <Link href="/community" className="font-arcade text-xs tracking-[0.3em] text-[#6C5CE7] border-b border-[#6C5CE7] pb-1 hover:text-white hover:border-white transition-all">
                            VIEW FULL DATABASE
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2032&auto=format&fit=crop',
                            'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=2069&auto=format&fit=crop',
                            'https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2070&auto=format&fit=crop',
                            'https://images.unsplash.com/photo-1558008258-3256797b43f3?q=80&w=2070&auto=format&fit=crop'
                        ].map((img, idx) => (
                            <div key={idx} className={`overflow-hidden group relative border border-[#333] ${idx === 0 || idx === 3 ? 'md:col-span-2 aspect-[16/9]' : 'aspect-square'}`}>
                                <img src={img} alt="Community" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0 opacity-70 group-hover:opacity-100" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-[#FF8C00] font-arcade text-xs tracking-[0.2em] border border-[#FF8C00] px-3 py-1 bg-black">@JOY_JUNCTURE</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* SECTION 7 — GAMIFICATION TEASER */}
                <section className="mb-32 bg-[#111] text-white rounded-none p-12 text-center relative overflow-hidden border border-[#333] shadow-[0_0_30px_rgba(108,92,231,0.1)]">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#6C5CE7]/10 blur-[150px] rounded-full pointer-events-none"></div>
                    <div className="relative z-10 max-w-3xl mx-auto">
                        <span className="text-[#6C5CE7] font-arcade text-xs tracking-[0.4em] mb-4 block animate-pulse uppercase">Earn while you learn</span>
                        <h2 className="font-arcade text-3xl md:text-5xl mb-8 leading-tight uppercase text-3d-purple">
                            "Reading, learning, and playing <br /> earns you credits."
                        </h2>
                        <div className="flex justify-center gap-8 mb-12 flex-wrap">
                            {[
                                { action: 'Read a Guide', points: '+5 PTS' },
                                { action: 'Play a Game', points: '+10 PTS' },
                                { action: 'Attend Event', points: '+50 PTS' },
                            ].map((item, idx) => (
                                <div key={idx} className="bg-black px-6 py-4 border border-[#333] shadow-[0_4px_0px_#333] hover:-translate-y-1 transition-all">
                                    <p className="font-arcade text-gray-500 text-xs uppercase tracking-wider mb-1">{item.action}</p>
                                    <p className="font-arcade text-[#00B894] text-2xl">{item.points}</p>
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <Link
                                href="/auth/signup"
                                className="px-8 py-4 bg-[#FF8C00] text-black font-arcade text-xs tracking-[0.4em] hover:bg-white transition-all border-b-4 border-[#A0522D] active:border-b-0 active:translate-y-1 uppercase"
                            >
                                REGISTER_PILOT
                            </Link>
                            <Link
                                href="/play"
                                className="px-8 py-4 bg-transparent text-[#FF8C00] font-arcade text-xs tracking-[0.4em] border border-[#FF8C00] hover:bg-[#FF8C00] hover:text-black transition-all uppercase"
                            >
                                ENTER_ARCADE
                            </Link>
                        </div>
                    </div>
                </section>

                {/* SECTION 8 — FINAL CTA */}
                <div className="text-center py-16 border-t border-[#333]">
                    <h2 className="font-arcade text-4xl md:text-5xl mb-6 text-white text-3d-orange">Still curious?</h2>
                    <p className="text-gray-400 font-bold italic text-xl mb-10 max-w-2xl mx-auto font-sans">
                        "There's always another game, story, or moment waiting."
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link
                            href="/shop"
                            className="px-8 py-4 bg-white text-black font-arcade text-xs tracking-[0.4em] hover:bg-gray-200 transition-all border-b-4 border-gray-400 active:border-b-0 active:translate-y-1 uppercase"
                        >
                            EXPLORE_VAULT
                        </Link>
                        <Link
                            href="/community"
                            className="px-8 py-4 border border-white text-white font-arcade text-xs tracking-[0.4em] hover:bg-white hover:text-black transition-all uppercase"
                        >
                            JOIN_EVENT
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
