'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

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
        return (
            <div className="min-h-screen pt-28 pb-16 flex items-center justify-center">
                <div className="text-amber-500 font-header tracking-[0.3em] animate-pulse">
                    LOADING BLOG POSTS...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen pt-28 pb-16 flex flex-col items-center justify-center gap-4">
                <div className="text-red-500 font-header tracking-widest text-center">
                    {error}
                </div>
                <button 
                    onClick={fetchBlogPosts}
                    className="px-6 py-2 border border-amber-500 text-amber-500 hover:bg-amber-500/10 transition-all"
                >
                    TRY AGAIN
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-16 bg-black text-white font-sans selection:bg-amber-500/30">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                {/* SECTION 1 — HERO */}
                <div className="text-center mb-24 max-w-4xl mx-auto">
                    <p className="text-amber-500 font-header text-xs tracking-[0.4em] mb-6 uppercase">The Joy Juncture</p>
                    <h1 className="font-header text-6xl md:text-8xl mb-8 text-white leading-none">
                        Blog Journal
                    </h1>
                    <p className="font-serif italic text-2xl text-white/60">
                        Stories from the table — games, people, strategies, and shared joy.
                    </p>
                </div>

                {/* SECTION 2 — FEATURED STORY */}
                <section className="mb-32">
                    <div className="relative group cursor-pointer border border-white/10 rounded-sm overflow-hidden">
                        <div className="aspect-[21/9] w-full bg-neutral-900">
                            <img
                                src="https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop"
                                alt="Featured Story"
                                className="w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105 group-hover:opacity-100"
                            />
                        </div>
                        <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 bg-gradient-to-t from-black via-black/60 to-transparent text-white flex flex-col items-start justify-end h-full">
                            <span className="bg-amber-500 text-black text-[10px] font-header tracking-[0.2em] px-3 py-1 rounded-full mb-4 uppercase">
                                Featured Story
                            </span>
                            <h2 className="font-header text-4xl md:text-6xl mb-4 leading-tight group-hover:text-amber-400 transition-colors">
                                The Art of the Game Night
                            </h2>
                            <p className="font-serif italic text-lg md:text-xl text-white/80 max-w-2xl mb-6">
                                How a simple gathering turned into a weekly tradition of rivalry, laughter, and unbreakable bonds.
                            </p>
                            <button className="flex items-center gap-2 text-[10px] font-header tracking-[0.3em] hover:gap-4 transition-all text-amber-500">
                                READ STORY <span>→</span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* SECTION 3 — FILTERS */}
                <div className="mb-20 sticky top-24 z-40 bg-black/95 backdrop-blur py-4 border-b border-white/10 overflow-x-auto">
                    <div className="flex items-center gap-8 min-w-max">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`font-header text-[10px] tracking-[0.2em] uppercase transition-all pb-1 ${activeCategory === cat
                                    ? 'text-amber-500 border-b-2 border-amber-500'
                                    : 'text-white/40 hover:text-white'
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
                        <article key={post.id} className="group cursor-pointer flex flex-col h-full">
                            <div className="aspect-[4/3] overflow-hidden rounded-sm bg-neutral-900 mb-6 border border-white/5">
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-110 group-hover:opacity-100"
                                />
                            </div>
                            <div className="flex items-center gap-4 mb-3">
                                <span className="text-amber-500 font-header text-[9px] tracking-[0.2em] uppercase">{post.category}</span>
                                <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                                <span className="text-white/40 font-serif italic text-xs">{post.readTime}</span>
                            </div>
                            <h3 className="font-header text-2xl md:text-3xl mb-3 leading-tight text-white group-hover:text-amber-500 transition-colors">
                                {post.title}
                            </h3>
                            <p className="text-white/60 font-serif leading-relaxed mb-4 flex-grow">
                                {post.excerpt}
                            </p>
                        </article>
                    ))}
                </section>

                {/* SECTION 5 — LEARNING & GAMEPLAY HIGHLIGHT */}
                <section className="mb-32 bg-white/5 border border-white/10 p-12 md:p-16 rounded-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none"></div>
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        <div className="lg:col-span-5">
                            <h2 className="font-header text-4xl md:text-5xl mb-6 text-white">Learn the Game. <br /><span className="text-amber-500 italic font-serif">Play Better.</span></h2>
                            <p className="text-white/70 font-serif text-lg leading-relaxed mb-8">
                                New to Joy Juncture? Or looking to master deep strategies?
                                Explore our comprehensive guides designed to make every game night seamless.
                            </p>
                            <button className="px-8 py-4 bg-white text-black font-header text-[10px] tracking-[0.3em] hover:bg-neutral-200 transition-all rounded-sm">
                                EXPLORE GUIDES
                            </button>
                        </div>
                        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {['How-to-Play Videos', 'Rulebooks & FAQs', 'Strategy Breakdowns', 'House Rules'].map((item, idx) => (
                                <div key={idx} className="p-6 bg-black/40 border border-white/10 hover:border-amber-500/40 transition-all rounded-sm group">
                                    <div className="w-8 h-8 flex items-center justify-center bg-amber-500/20 text-amber-500 rounded-full mb-4 group-hover:scale-110 transition-transform">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                    </div>
                                    <h3 className="font-header text-lg text-white mb-1">{item}</h3>
                                    <p className="text-white/40 font-serif italic text-xs">Master the mechanics</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* SECTION 6 — COMMUNITY STORIES */}
                <section className="mb-32">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <div>
                            <h2 className="font-header text-4xl md:text-5xl text-white mb-4">Community Moments</h2>
                            <p className="text-white/60 font-serif italic text-xl">Real people. Real joy. Real memories.</p>
                        </div>
                        <Link href="/community" className="font-header text-[10px] tracking-[0.3em] text-amber-500 border-b border-amber-500 pb-1 hover:text-amber-400 hover:border-amber-400 transition-all">
                            VIEW FULL GALLERY
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2032&auto=format&fit=crop',
                            'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=2069&auto=format&fit=crop',
                            'https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2070&auto=format&fit=crop',
                            'https://images.unsplash.com/photo-1558008258-3256797b43f3?q=80&w=2070&auto=format&fit=crop'
                        ].map((img, idx) => (
                            <div key={idx} className={`rounded-sm overflow-hidden group relative border border-white/5 ${idx === 0 || idx === 3 ? 'md:col-span-2 aspect-[16/9]' : 'aspect-square'}`}>
                                <img src={img} alt="Community" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100" />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-white font-header text-xs tracking-[0.2em]">@JOY_JUNCTURE</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* SECTION 7 — GAMIFICATION TEASER */}
                <section className="mb-32 bg-neutral-900 text-white rounded-sm p-12 text-center relative overflow-hidden border border-white/5">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 blur-[150px] rounded-full pointer-events-none"></div>
                    <div className="relative z-10 max-w-3xl mx-auto">
                        <span className="text-amber-500 font-header text-[10px] tracking-[0.4em] mb-4 block animate-pulse">Earn while you learn</span>
                        <h2 className="font-header text-3xl md:text-5xl mb-8 leading-tight">
                            "Reading, learning, and playing <br /> earns you points."
                        </h2>
                        <div className="flex justify-center gap-8 mb-12 flex-wrap">
                            {[
                                { action: 'Read a Guide', points: '+5 PTS' },
                                { action: 'Play a Game', points: '+10 PTS' },
                                { action: 'Attend Event', points: '+50 PTS' },
                            ].map((item, idx) => (
                                <div key={idx} className="bg-white/5 backdrop-blur px-6 py-4 rounded-sm border border-white/10 hover:border-amber-500/30 transition-all">
                                    <p className="font-serif italic text-white/60 text-sm mb-1">{item.action}</p>
                                    <p className="font-header text-amber-500 text-xl">{item.points}</p>
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <Link
                                href="/auth/signup"
                                className="px-8 py-4 bg-amber-500 text-black font-header text-[10px] tracking-[0.4em] hover:bg-amber-400 transition-all rounded-sm"
                            >
                                CREATE FREE ACCOUNT
                            </Link>
                            <Link
                                href="/play"
                                className="px-8 py-4 border border-amber-500 text-amber-500 font-header text-[10px] tracking-[0.4em] hover:bg-amber-500/10 transition-all rounded-sm"
                            >
                                PLAY & EARN
                            </Link>
                        </div>
                    </div>
                </section>

                {/* SECTION 8 — FINAL CTA */}
                <div className="text-center py-16 border-t border-white/10">
                    <h2 className="font-header text-4xl md:text-5xl mb-6 text-white">Still curious?</h2>
                    <p className="text-white/60 font-serif italic text-xl mb-10 max-w-2xl mx-auto">
                        "There's always another game, story, or moment waiting."
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link
                            href="/shop"
                            className="px-8 py-4 bg-white text-black font-header text-[10px] tracking-[0.4em] hover:bg-neutral-200 transition-all rounded-sm"
                        >
                            EXPLORE GAMES
                        </Link>
                        <Link
                            href="/community"
                            className="px-8 py-4 border border-white text-white font-header text-[10px] tracking-[0.4em] hover:bg-white/10 transition-all rounded-sm"
                        >
                            JOIN AN EVENT
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}