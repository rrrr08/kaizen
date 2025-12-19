'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface NavbarProps {
  points?: number;
  isObsidian?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ points = 0, isObsidian = false }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: 'HOME', href: '/' },
    { label: 'SHOP', href: '/shop' },
    { label: 'EXPERIENCES', href: '/experiences' },
    { label: 'PLAY', href: '/play' },
    { label: 'EVENTS', href: '/events' },
    { label: 'COMMUNITY', href: '/community' },
    { label: 'ABOUT', href: '/about' },
  ];

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
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
