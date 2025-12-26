"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useGamification } from '@/app/context/GamificationContext';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { signInWithGoogle, logOut } from '@/lib/firebase';
import { NotificationCenter } from '@/app/components/NotificationCenter';

const ArcadeNavbar: React.FC = () => {
    const pathname = usePathname();
    const { user } = useAuth();
    const { balance } = useGamification();

    const handleLogin = async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error("Login failed", error);
        }
    };

    const handleLogout = async () => {
        try {
            await logOut();
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <nav className="sticky top-0 z-50 bg-black border-b-4 border-[#FF8C00] shadow-[0_4px_10px_rgba(255,140,0,0.3)]">
            <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-[#FF8C00] rotate-45 flex items-center justify-center">
                        <div className="-rotate-45 font-arcade text-black text-xl">S</div>
                    </div>
                    <span className="font-arcade text-2xl tracking-tighter arcade-glow text-white">JOY JUNCTURE</span>
                </Link>

                {/* Mobile Menu Button - simplified for now */}
                <div className="md:hidden">
                    {/* Mobile menu implementation would go here */}
                </div>

                <div className="hidden md:flex space-x-8 font-arcade text-sm">
                    <Link href="/shop" className={`hover:text-[#FF8C00] transition-colors ${pathname === '/shop' ? 'text-[#FF8C00]' : 'text-white'}`}>SHOP</Link>
                    <Link href="/events" className={`hover:text-[#FF8C00] transition-colors ${pathname === '/events' ? 'text-[#FF8C00]' : 'text-white'}`}>EVENTS</Link>
                    <Link href="/experiences" className={`hover:text-[#FF8C00] transition-colors ${pathname === '/experiences' ? 'text-[#FF8C00]' : 'text-white'}`}>EXPERIENCES</Link>
                    <Link href="/blog" className={`hover:text-[#FF8C00] transition-colors ${pathname === '/blog' ? 'text-[#FF8C00]' : 'text-white'}`}>BLOG</Link>
                    <Link href="/play" className={`hover:text-[#FF8C00] transition-colors ${pathname === '/play' ? 'text-[#FF8C00]' : 'text-white'}`}>PLAY</Link>
                    <Link href="/community" className={`hover:text-[#FF8C00] transition-colors ${pathname === '/community' ? 'text-[#FF8C00]' : 'text-white'}`}>COMMUNITY</Link>
                    <Link href="/about" className={`hover:text-[#FF8C00] transition-colors ${pathname === '/about' ? 'text-[#FF8C00]' : 'text-white'}`}>ABOUT</Link>
                </div>

                <div className="flex items-center space-x-4">
                    {user && (
                        <div className="hidden lg:flex items-center space-x-2 bg-[#1A1A1A] px-4 py-2 rounded-full border border-[#FFD400]">
                            <span className="text-[#FFD400]">🪙</span>
                            <span className="font-arcade text-xs text-[#FFD400]">{balance !== undefined ? balance.toLocaleString() : '0'} TOKENS</span>
                        </div>
                    )}

                    {user && <NotificationCenter />}

                    {user ? (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#FFD400] cursor-pointer">
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt={user.displayName || "User"} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-[#1A1A1A] flex items-center justify-center">
                                        <User className="w-4 h-4 text-[#FFD400]" />
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="bg-[#1A1A1A] text-white font-arcade px-4 py-2 rounded-sm hover:bg-[#333] border border-[#333] hover:border-[#FF8C00] transition-all text-xs"
                            >
                                LOGOUT
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleLogin}
                            className="bg-[#FF8C00] text-black font-arcade px-6 py-2 rounded-sm hover:scale-105 transition-transform active:scale-95"
                        >
                            LOGIN
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default ArcadeNavbar;
