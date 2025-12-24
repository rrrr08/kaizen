'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import CartSidebar from './CartSidebar2';
import { NotificationCenter } from '@/app/components/NotificationCenter';
import { useAuth } from '@/app/context/AuthContext';
import { ChevronDown, LogOut, Home, Settings } from 'lucide-react';

interface NavbarProps {
  points?: number;
  isObsidian?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ points = 0, isObsidian = false }) => {
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [eventsDropdownOpen, setEventsDropdownOpen] = useState<boolean>(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const eventsDropdownRef = useRef<HTMLDivElement>(null);
  const { user, loading } = useAuth();

  // Fetch user profile when user changes
  useEffect(() => {
    console.log('[JoyNavbar] User changed:', {
      user: user?.email || 'null',
      uid: user?.uid || 'null',
      loading,
      timestamp: new Date().toLocaleTimeString()
    });
    
    if (user) {
      console.log('[JoyNavbar] Fetching user profile for:', user.uid);
      // Lazy load Firebase functions
      import('@/lib/firebase').then(({ getUserProfile, checkUserIsAdmin }) => {
        getUserProfile(user.uid)
          .then(profile => {
            console.log('[JoyNavbar] User profile fetched:', {
              name: profile?.first_name || profile?.name,
              role: profile?.role,
              email: profile?.email
            });
            setUserProfile(profile);
          })
          .catch(error => console.error('[JoyNavbar] Error fetching user profile:', error));

        // Check if user is admin
        checkUserIsAdmin(user.uid)
          .then(admin => {
            console.log('[JoyNavbar] Admin check result for', user.uid, ':', admin);
            setIsAdmin(admin);
          })
          .catch(error => console.error('[JoyNavbar] Error checking admin status:', error));
      });
    } else {
      console.log('[JoyNavbar] Clearing user profile and admin status');
      setUserProfile(null);
      setIsAdmin(false);
    }
  }, [user]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (eventsDropdownRef.current && !eventsDropdownRef.current.contains(event.target as Node)) {
        setEventsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (hoverTimeout) clearTimeout(hoverTimeout);
    };
  }, [hoverTimeout]);

  const handleSignOut = async () => {
    try {
      console.log('[JoyNavbar] Signing out...');
      // Lazy load Firebase function
      const { logOut } = await import('@/lib/firebase');
      await logOut();
      setUserProfile(null);
      setIsProfileMenuOpen(false);
      console.log('[JoyNavbar] Signed out successfully');
    } catch (error) {
      console.error('[JoyNavbar] Error signing out:', error);
    }
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

  const navItems = [
    { label: 'HOME', href: '/' },
    { label: 'SHOP', href: '/shop' },
    { label: 'EXPERIENCES', href: '/experiences' },
    { label: 'PLAY', href: '/play' },
    { label: 'COMMUNITY', href: '/community' },
    { label: 'BLOG', href: '/blog' },
    { label: 'ABOUT', href: '/about' },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-[100] h-24 flex items-center px-8 md:px-12 transition-all duration-500 ${
        isObsidian ? 'brightness-[0.85]' : ''
      }`}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-transparent pointer-events-none"></div>
        
        <div className="relative w-full flex items-center justify-between">
          {/* Logo - Premium Design */}
          <Link 
            href="/"
            className="flex items-center gap-3 cursor-pointer group"
          >
            {/* Decorative Icon */}
            <div className="relative w-10 h-10 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg opacity-20 group-hover:opacity-30 transition-all duration-300 glow-gold-hover"></div>
              <div className="text-2xl font-display font-bold text-amber-400 group-hover:text-amber-300 transition-all">✦</div>
            </div>
            
            {/* Logo Text */}
            <div className="flex flex-col">
              <span className="font-display text-xl font-bold tracking-[0.15em] text-white group-hover:text-amber-300 transition-all duration-300">JOY</span>
              <span className="font-header text-xs tracking-[0.12em] text-emerald-400 group-hover:text-emerald-300 transition-all duration-300">JUNCTURE</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 lg:gap-12">
            {navItems.map((item) => {
              // Skip EVENTS from main nav - it has its own dropdown
              if (item.label === 'EVENTS') return null;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="font-header text-xs font-medium tracking-[0.12em] transition-all duration-300 text-white/70 hover:text-amber-400 hover:drop-shadow-lg"
                >
                  {item.label}
                </Link>
              );
            })}

            {/* Events Dropdown */}
            <div 
              className="relative" 
              ref={eventsDropdownRef}
              onMouseEnter={() => {
                if (hoverTimeout) clearTimeout(hoverTimeout);
                setEventsDropdownOpen(true);
              }}
              onMouseLeave={() => {
                const timeout = setTimeout(() => {
                  setEventsDropdownOpen(false);
                }, 200);
                setHoverTimeout(timeout);
              }}
            >
              <button
                onClick={() => setEventsDropdownOpen(!eventsDropdownOpen)}
                className="font-header text-xs font-medium tracking-[0.12em] transition-all duration-300 text-white/70 hover:text-amber-400 hover:drop-shadow-lg flex items-center gap-1"
              >
                EVENTS
                <svg
                  className={`w-3 h-3 transition-transform duration-200 ${eventsDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {eventsDropdownOpen && (
                <div 
                  className="absolute left-1/2 transform -translate-x-1/2 mt-6 w-48 bg-black/95 backdrop-blur-lg border border-white/10 rounded-lg shadow-xl overflow-hidden z-50"
                  onMouseEnter={() => {
                    if (hoverTimeout) clearTimeout(hoverTimeout);
                    setEventsDropdownOpen(true);
                  }}
                  onMouseLeave={() => {
                    const timeout = setTimeout(() => {
                      setEventsDropdownOpen(false);
                    }, 100);
                    setHoverTimeout(timeout);
                  }}
                >
                  <div className="py-2">
                    <Link
                      href="/events/upcoming"
                      className="block px-4 py-3 font-header text-[10px] tracking-[0.2em] text-white/70 hover:text-amber-500 hover:bg-white/5 transition-all border-b border-white/5"
                      onClick={() => setEventsDropdownOpen(false)}
                    >
                      UPCOMING GAME NIGHTS
                    </Link>
                    <Link
                      href="/events/past"
                      className="block px-4 py-3 font-header text-[10px] tracking-[0.2em] text-white/70 hover:text-amber-500 hover:bg-white/5 transition-all border-b border-white/5"
                      onClick={() => setEventsDropdownOpen(false)}
                    >
                      PAST EVENTS
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Notifications, Points & Toggle */}
          <div className="flex items-center gap-4 md:gap-8">
            {/* Notification Center */}
            <div className="relative">
              <NotificationCenter />
            </div>

            {loading ? (
              // Loading state - show skeleton
              <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-full border border-amber-500/20 bg-amber-500/5 animate-pulse">
                <div className="w-8 h-8 bg-amber-500/20 rounded-full"></div>
                <div className="h-4 w-20 bg-amber-500/20 rounded"></div>
              </div>
            ) : user ? (
              // User logged in - show profile button
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-full border border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10 transition-all"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                    {getInitials(userProfile?.first_name || userProfile?.name || user.email)}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-header text-[9px] tracking-[0.2em] text-amber-500">
                      {userProfile?.first_name || userProfile?.name || 'USER'}
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
                      💰 My Wallet
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
              // User not logged in - show auth buttons
              <Link
                href="/auth/login"
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-400/40 hover:border-amber-400/80 hover:bg-amber-400/5 transition-all duration-300"
              >
                <span className="font-header text-xs font-medium tracking-[0.1em] text-amber-400 hover:text-amber-300">SIGN IN</span>
              </Link>
            )}
            
            {!user && points > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-400/30 glow-emerald">
                <div className="font-header text-lg font-bold text-emerald-400">{points}</div>
                <div className="font-header text-xs font-medium tracking-[0.1em] text-emerald-400">PTS</div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden ml-4"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle mobile menu"
          >
            <div className="space-y-1">
              <div className="w-6 h-0.5 bg-amber-500"></div>
              <div className="w-6 h-0.5 bg-amber-500"></div>
              <div className="w-6 h-0.5 bg-amber-500"></div>
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="absolute top-24 left-0 right-0 bg-black/95 backdrop-blur border-b border-white/10 md:hidden">
            <div className="flex flex-col p-8 gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="font-header text-[10px] tracking-[0.3em] text-white/60 hover:text-amber-500"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {/* Events Section in Mobile Menu */}
              <div className="pt-4 border-t border-white/10">
                <div className="font-header text-[10px] tracking-[0.3em] text-amber-500 mb-4">EVENTS</div>
                <div className="flex flex-col gap-4 ml-4">
                  <Link
                    href="/events/upcoming"
                    className="font-header text-[9px] tracking-[0.2em] text-white/60 hover:text-amber-500"
                    onClick={() => setMobileOpen(false)}
                  >
                    UPCOMING GAME NIGHTS
                  </Link>
                  <Link
                    href="/events/past"
                    className="font-header text-[9px] tracking-[0.2em] text-white/60 hover:text-amber-500"
                    onClick={() => setMobileOpen(false)}
                  >
                    PAST EVENTS
                  </Link>
                </div>
              </div>

              {/* Auth Section in Mobile Menu */}
              <div className="pt-4 border-t border-white/10">
                {user ? (
                  <>
                    <div className="font-header text-[10px] tracking-[0.3em] text-amber-500 mb-4">ACCOUNT</div>
                    <div className="flex flex-col gap-3 ml-4">
                      <Link
                        href="/wallet"
                        className="font-header text-[9px] tracking-[0.2em] text-white/60 hover:text-amber-500"
                        onClick={() => setMobileOpen(false)}
                      >
                        MY WALLET
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin/dashboard"
                          className="font-header text-[9px] tracking-[0.2em] text-amber-500"
                          onClick={() => setMobileOpen(false)}
                        >
                          ADMIN PANEL
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          handleSignOut();
                          setMobileOpen(false);
                        }}
                        className="text-left font-header text-[9px] tracking-[0.2em] text-red-400 hover:text-red-300"
                      >
                        SIGN OUT
                      </button>
                    </div>
                  </>
                ) : (
                  <Link
                    href="/auth/login"
                    className="font-header text-[10px] tracking-[0.3em] text-amber-500 hover:text-amber-400"
                    onClick={() => setMobileOpen(false)}
                  >
                    SIGN IN
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
      
      {/* Cart Sidebar */}
      <CartSidebar />
    </>
  );
};

export default Navbar;
