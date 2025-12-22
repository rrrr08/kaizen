'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface NavbarProps {
  points?: number;
  isObsidian?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ points = 0, isObsidian = false }) => {
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [eventsDropdownOpen, setEventsDropdownOpen] = useState<boolean>(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const eventsDropdownRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { label: 'HOME', href: '/' },
    { label: 'SHOP', href: '/shop' },
    { label: 'EXPERIENCES', href: '/experiences' },
    { label: 'PLAY', href: '/play' },
    { label: 'COMMUNITY', href: '/community' },
    { label: 'ABOUT', href: '/about' },
  ];

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

  return (
    <nav className={`fixed top-0 left-0 w-full z-[100] h-24 flex items-center px-8 md:px-12 transition-all duration-500 ${
      isObsidian ? 'brightness-[0.85]' : ''
    }`}>
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-transparent pointer-events-none"></div>
      
      <div className="relative w-full flex items-center justify-between">
        {/* Logo */}
        <Link 
          href="/"
          className="font-header text-2xl cursor-pointer tracking-[0.2em] group"
        >
          <span className="text-amber-500 transition-all duration-500 group-hover:tracking-[0.4em]">JOY</span>
          <span className="text-white/40 ml-2">JUNCTURE</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 lg:gap-12">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-header text-[10px] tracking-[0.3em] transition-all hover:text-amber-400 text-white/60 hover:text-amber-500"
            >
              {item.label}
            </Link>
          ))}
          
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
              }, 200); // Small delay to allow moving cursor to dropdown
              setHoverTimeout(timeout);
            }}
          >
            <button
              onClick={() => setEventsDropdownOpen(!eventsDropdownOpen)}
              className="font-header text-[10px] tracking-[0.3em] transition-all hover:text-amber-400 text-white/60 hover:text-amber-500 flex items-center gap-1"
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
                  {/* <Link
                    href="/events/create"
                    className="block px-4 py-3 font-header text-[10px] tracking-[0.2em] text-amber-500 hover:text-amber-400 hover:bg-amber-500/5 transition-all"
                    onClick={() => setEventsDropdownOpen(false)}
                  >
                    + CREATE EVENT
                  </Link> */}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Points & Toggle */}
        <div className="flex items-center gap-4 md:gap-8">
          <Link
            href="/auth/login"
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:border-white/30 transition-all"
          >
            <span className="font-header text-[8px] tracking-[0.2em] text-white/70">SIGN IN</span>
          </Link>
          
          {points > 0 && (
            <div className="flex items-center gap-3">
              <div className="font-serif italic text-lg text-amber-500">{points}</div>
              <div className="font-header text-[9px] tracking-widest text-white/40">PTS</div>
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
                {/* <Link
                  href="/events/create"
                  className="font-header text-[9px] tracking-[0.2em] text-amber-500 hover:text-amber-400"
                  onClick={() => setMobileOpen(false)}
                >
                  + CREATE EVENT
                </Link> */}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;