'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { auth, signOut, getUserProfile, checkUserIsAdmin } from '@/lib/firebase';
import { useAuth } from '@/app/context/AuthContext';
import { ChevronDown, LogOut, User as UserIcon, Home, Settings } from 'lucide-react';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user, loading } = useAuth();

  // Fetch user profile when user changes
  useEffect(() => {
    console.log('[Navbar] User changed:', {
      user: user?.email || 'null',
      uid: user?.uid || 'null',
      loading,
      timestamp: new Date().toLocaleTimeString()
    });
    
    if (user) {
      console.log('[Navbar] Fetching user profile for:', user.uid);
      getUserProfile(user.uid)
        .then(profile => {
          console.log('[Navbar] User profile fetched:', {
            name: profile?.firstName,
            role: profile?.role,
            email: profile?.email
          });
          setUserProfile(profile);
        })
        .catch(error => console.error('[Navbar] Error fetching user profile:', error));

      // Check if user is admin
      checkUserIsAdmin(user.uid)
        .then(admin => {
          console.log('[Navbar] Admin check result for', user.uid, ':', admin);
          console.log('[Navbar] Setting isAdmin state to:', admin);
          setIsAdmin(admin);
        })
        .catch(error => console.error('[Navbar] Error checking admin status:', error));
    } else {
      console.log('[Navbar] Clearing user profile and admin status');
      setUserProfile(null);
      setIsAdmin(false);
    }
  }, [user]);

  const handleSignOut = async () => {
    try {
      console.log('[Navbar] Signing out...');
      await signOut();
      setUserProfile(null);
      setIsProfileMenuOpen(false);
      console.log('[Navbar] Signed out successfully');
    } catch (error) {
      console.error('[Navbar] Error signing out:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'JJ';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-gradient-to-b from-black/80 to-transparent fixed top-0 left-0 w-full z-50 h-24 flex items-center">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="md:flex md:items-center md:gap-12">
            <Link href="/" className="block font-header text-2xl tracking-[0.2em] hover:opacity-80 transition-opacity group">
              <span className="text-amber-500 transition-all duration-500 group-hover:tracking-[0.4em]">JOY</span>
              <span className="text-white/40 ml-2">JUNCTURE</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <nav aria-label="Global">
              <ul className="flex items-center gap-8 text-sm">
                <li>
                  <Link
                    className="font-header text-[10px] tracking-[0.3em] transition-all text-white/60 hover:text-amber-400"
                    href="/shop"
                  >
                    THE REPOSITORY
                  </Link>
                </li>
                <li>
                  <Link
                    className="font-header text-[10px] tracking-[0.3em] transition-all text-white/60 hover:text-amber-400"
                    href="/events"
                  >
                    SOIREE
                  </Link>
                </li>
                <li>
                  <Link
                    className="font-header text-[10px] tracking-[0.3em] transition-all text-white/60 hover:text-amber-400"
                    href="/community"
                  >
                    THE GUILD
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Right Side - Auth & User Menu */}
          <div className="flex items-center gap-8">
            {loading ? (
              // Loading state - show skeleton
              <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-full border border-amber-500/20 bg-amber-500/5 animate-pulse">
                <div className="w-8 h-8 bg-amber-500/20 rounded-full"></div>
                <div className="h-4 w-20 bg-amber-500/20 rounded"></div>
              </div>
            ) : user ? (
              <div className="relative">
                {/* User Profile Button */}
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-3 px-4 py-2 rounded-full border border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10 transition-all group"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                    {getInitials(userProfile?.firstName || user.email)}
                  </div>
                  <div className="flex flex-col items-start hidden sm:flex">
                    <span className="font-header text-[9px] tracking-[0.2em] text-amber-500">
                      {userProfile?.firstName || 'USER'}
                    </span>
                    <span className="font-header text-[7px] tracking-[0.1em] text-white/40">
                      {userProfile?.points || 0} PTS
                    </span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-amber-500 transition-transform ${
                      isProfileMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-950 border border-amber-500/30 rounded-sm shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 z-50">
                    <Link
                      href="/wallet"
                      className="flex items-center gap-3 px-4 py-3 text-white/70 hover:bg-amber-500/10 hover:text-amber-500 transition-colors border-b border-white/5 font-serif text-sm"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <UserIcon size={16} />
                      My Wallet
                    </Link>
                    <Link
                      href="/orders"
                      className="flex items-center gap-3 px-4 py-3 text-white/70 hover:bg-amber-500/10 hover:text-amber-500 transition-colors border-b border-white/5 font-serif text-sm"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <Home size={16} />
                      My Orders
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-3 text-white/70 hover:bg-amber-500/10 hover:text-amber-500 transition-colors border-b border-white/5 font-serif text-sm"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Settings size={16} />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-3 text-white/70 hover:bg-red-500/10 hover:text-red-400 transition-colors font-serif text-sm"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Auth Links */
              <div className="sm:flex sm:gap-3 hidden">
                <Link
                  className="font-header text-[9px] tracking-[0.2em] px-4 py-2 rounded-full border border-amber-500/40 text-amber-500 hover:bg-amber-500/10 transition-all"
                  href="/auth/login"
                >
                  SIGN IN
                </Link>
                <Link
                  className="font-header text-[9px] tracking-[0.2em] px-4 py-2 rounded-full border border-amber-500 bg-amber-500 text-black hover:bg-amber-400 transition-all"
                  href="/auth/signup"
                >
                  JOIN US
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <div className="block md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="p-2 text-white/60 hover:text-amber-500 transition-colors"
                aria-label="Toggle mobile menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-slate-950/95 border-t border-amber-500/20">
              <Link
                href="/shop"
                className="block px-3 py-2 font-header text-[9px] tracking-[0.2em] text-white/60 hover:text-amber-500 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                THE REPOSITORY
              </Link>
              <Link
                href="/events"
                className="block px-3 py-2 font-header text-[9px] tracking-[0.2em] text-white/60 hover:text-amber-500 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                SOIREE
              </Link>
              <Link
                href="/community"
                className="block px-3 py-2 font-header text-[9px] tracking-[0.2em] text-white/60 hover:text-amber-500 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                THE GUILD
              </Link>
              <div className="pt-4 pb-3 border-t border-amber-500/20">
                <div className="flex flex-col space-y-2">
                  {user ? (
                    <>
                      <Link
                        href="/wallet"
                        className="block px-3 py-2 font-header text-[9px] tracking-[0.2em] text-amber-500 hover:text-amber-400 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        My Wallet
                      </Link>
                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsMobileMenuOpen(false);
                        }}
                        className="block w-full px-3 py-2 font-header text-[9px] tracking-[0.2em] text-red-400 hover:text-red-300 transition-colors"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/auth/login"
                        className="block px-3 py-2 rounded-sm bg-amber-500/10 border border-amber-500/40 text-center font-header text-[9px] tracking-[0.2em] text-amber-500 hover:bg-amber-500/20 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        SIGN IN
                      </Link>
                      <Link
                        href="/auth/signup"
                        className="block px-3 py-2 rounded-sm bg-amber-500 text-center font-header text-[9px] tracking-[0.2em] text-black hover:bg-amber-400 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        JOIN US
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

