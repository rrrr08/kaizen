'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, ArrowRight } from 'lucide-react';
import Image from 'next/image';

import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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

    // Dynamic Content State
    const [featuredStory, setFeaturedStory] = useState({
        title: 'The Art of the Game Night',
        excerpt: 'How a simple gathering turned into a weekly tradition of rivalry, laughter, and unbreakable bonds.',
        image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop'
    });
    const [communityGallery, setCommunityGallery] = useState([
        'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2032&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=2069&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1558008258-3256797b43f3?q=80&w=2070&auto=format&fit=crop'
    ]);

    useEffect(() => {
        fetchBlogPosts();
        fetchPageContent();
    }, []);

    const fetchPageContent = async () => {
        try {
            const docRef = doc(db, 'content', 'blog');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.featuredStory?.image) {
                    setFeaturedStory(prev => ({ ...prev, image: data.featuredStory.image }));
                }
                if (data.communityGallery && Array.isArray(data.communityGallery)) setCommunityGallery(data.communityGallery);
            }
        } catch (_err) {
            console.error("Error fetching blog content:", _err);
        }
    };

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
            <div className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-[#FFFDF5]">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#FFD93D] border-t-black mb-4"></div>
                    <p className="text-black/60 font-black text-xs tracking-[0.4em]">LOADING BLOG POSTS...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen pt-28 pb-16 flex flex-col items-center justify-center gap-4 bg-[#FFFDF5]">
                <div className="text-red-500 font-black tracking-widest text-center">
                    {error}
                </div>
                <button
                    onClick={fetchBlogPosts}
                    className="px-6 py-2 border-2 border-black text-black hover:bg-black hover:text-white transition-all font-black text-xs tracking-widest rounded-lg"
                >
                    TRY AGAIN
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-16 bg-[#FFFDF5] text-[#2D3436] font-sans selection:bg-[#FFD93D]/50">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                {/* SECTION 1 — HERO */}
                <div className="text-center mb-24 max-w-4xl mx-auto">
                    <p className="text-[#6C5CE7] font-black text-sm tracking-[0.4em] mb-6 uppercase font-header bg-white inline-block px-4 py-1 border-2 border-black rounded-full shadow-[4px_4px_0px_#000]">The Joy Juncture</p>
                    <h1 className="font-header text-6xl md:text-8xl mb-8 text-black leading-none tracking-tight">
                        Blog Journal
                    </h1>
                    <p className="font-bold italic text-2xl text-black/70">
                        Stories from the table — games, people, strategies, and shared joy.
                    </p>
                </div>

                {/* SECTION 2 — FEATURED STORY */}
                <section className="mb-32">
                    <div className="relative group cursor-pointer border-3 border-black rounded-[30px] overflow-hidden neo-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                        <div className="aspect-[21/9] w-full bg-white relative">
                            <div className="absolute inset-0 bg-[#FFD93D] mix-blend-multiply opacity-20 z-10"></div>
                            <Image
                                src={featuredStory.image}
                                alt="Featured Story"
                                fill
                                priority
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                        </div>
                        <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 bg-gradient-to-t from-white via-white/90 to-transparent text-black flex flex-col items-start justify-end h-full z-20">
                            <span className="bg-[#00B894] text-black text-[10px] font-black tracking-[0.2em] px-3 py-1 rounded-lg border-2 border-black mb-4 uppercase shadow-[2px_2px_0px_#000]">
                                Featured Story
                            </span>
                            <h2 className="font-header text-4xl md:text-6xl mb-4 leading-tight group-hover:text-[#6C5CE7] transition-colors text-black drop-shadow-sm">
                                {featuredStory.title}
                            </h2>
                            <p className="font-medium text-lg md:text-xl text-black/80 max-w-2xl mb-6 leading-relaxed">
                                {featuredStory.excerpt}
                            </p>
                            <button className="flex items-center gap-2 text-xs font-black tracking-[0.3em] hover:gap-4 transition-all text-black uppercase bg-[#FFD93D] px-6 py-3 rounded-lg border-2 border-black shadow-[3px_3px_0px_#000]">
                                READ STORY <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                </section>

                {/* SECTION 3 — FILTERS */}
                <div className="mb-20 py-4">
                    <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase transition-all border-2 whitespace-nowrap ${activeCategory === cat
                                    ? 'bg-black text-white border-black shadow-[4px_4px_0px_rgba(0,0,0,0.2)]'
                                    : 'bg-white text-black border-black hover:bg-[#FFD93D] shadow-[2px_2px_0px_rgba(0,0,0,0.1)]'
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
                        <article key={post.id} className="group cursor-pointer flex flex-col h-full bg-white border-2 border-black p-4 rounded-[20px] neo-shadow hover:scale-[1.02] transition-transform">
                            <div className="aspect-[4/3] overflow-hidden rounded-[15px] mb-6 border-2 border-black relative">
                                {post.image ? (
                                    <Image
                                        src={post.image}
                                        alt={post.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                        <FileText size={64} className="text-black/20" />
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-4 mb-3">
                                <span className="bg-[#FF7675] text-black border border-black px-2 py-0.5 rounded font-black text-[9px] tracking-[0.2em] uppercase">{post.category}</span>
                                <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
                                <span className="text-black/60 font-bold text-xs uppercase tracking-wider">{post.readTime}</span>
                            </div>
                            <h3 className="font-header text-2xl md:text-3xl mb-3 leading-tight text-black group-hover:text-[#6C5CE7] transition-colors">
                                {post.title}
                            </h3>
                            <p className="text-black/70 font-medium leading-relaxed mb-4 flex-grow line-clamp-3">
                                {post.excerpt}
                            </p>
                        </article>
                    ))}
                </section>

                {/* SECTION 5 — LEARNING & GAMEPLAY HIGHLIGHT */}
                <section className="mb-32 bg-white text-black border-2 border-black p-12 md:p-16 rounded-[30px] relative overflow-hidden neo-shadow">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFD93D]/30 blur-[100px] rounded-full pointer-events-none"></div>
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        <div className="lg:col-span-5">
                            <h2 className="font-header text-4xl md:text-5xl mb-6 text-black">Learn the Game. <br /><span className="text-[#6C5CE7] italic font-serif">Play Better.</span></h2>
                            <p className="text-black/80 font-medium text-lg leading-relaxed mb-8">
                                New to Joy Juncture? Or looking to master deep strategies?
                                Explore our comprehensive guides designed to make every game night seamless.
                            </p>
                            <button className="px-8 py-4 bg-black text-white font-black text-xs tracking-[0.3em] hover:bg-[#FFD93D] hover:text-black hover:scale-105 transition-all rounded-xl border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
                                EXPLORE GUIDES
                            </button>
                        </div>
                        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {['How-to-Play Videos', 'Rulebooks & FAQs', 'Strategy Breakdowns', 'House Rules'].map((item, idx) => (
                                <div key={idx} className="p-6 bg-[#FFFDF5] border-2 border-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_#000] transition-all rounded-xl group cursor-pointer">
                                    <div className="w-10 h-10 flex items-center justify-center bg-[#FFD93D] text-black border-2 border-black rounded-full mb-4 group-hover:scale-110 transition-transform">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                    </div>
                                    <h3 className="font-header text-lg text-black mb-1">{item}</h3>
                                    <p className="text-black/60 font-bold text-xs uppercase tracking-wider">Master the mechanics</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* SECTION 6 — COMMUNITY STORIES */}
                <section className="mb-32">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <div>
                            <h2 className="font-header text-4xl md:text-5xl text-black mb-4">Community Moments</h2>
                            <p className="text-black/60 font-bold italic text-xl">Real people. Real joy. Real memories.</p>
                        </div>
                        <Link href="/community" className="font-black text-xs tracking-[0.3em] text-[#6C5CE7] border-b-2 border-[#6C5CE7] pb-1 hover:text-black hover:border-black transition-all">
                            VIEW FULL GALLERY
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {communityGallery.map((img, idx) => (
                            <div key={idx} className={`rounded-[20px] overflow-hidden group relative border-2 border-black neo-shadow ${idx === 0 || idx === 3 ? 'md:col-span-2 aspect-[16/9]' : 'aspect-square'}`}>
                                <Image
                                    src={img}
                                    alt="Community"
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                                />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-white font-black text-xs tracking-[0.2em] bg-black px-3 py-1 rounded-full border border-white">@JOY_JUNCTURE</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

              

                {/* SECTION 8 — FINAL CTA */}
                <div className="text-center py-16 border-t-2 border-black/10">
                    <h2 className="font-header text-4xl md:text-5xl mb-6 text-black">Still curious?</h2>
                    <p className="text-black/60 font-bold italic text-xl mb-10 max-w-2xl mx-auto">
                        &quot;There&apos;s always another game, story, or moment waiting.&quot;
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link
                            href="/play"
                            className="px-8 py-4 bg-black text-white font-black text-xs tracking-[0.4em] hover:bg-neutral-800 hover:scale-105 transition-all rounded-xl"
                        >
                            EXPLORE GAMES
                        </Link>
                        <Link
                            href="/events/upcoming"
                            className="px-8 py-4 border-2 border-black text-black font-black text-xs tracking-[0.4em] hover:bg-black/5 hover:scale-105 transition-all rounded-xl"
                        >
                            JOIN AN EVENT
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}