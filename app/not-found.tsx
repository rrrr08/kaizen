'use client';

import Link from 'next/link';
import { Home, Ghost } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6 selection:bg-[#FFD400] selection:text-black font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#FFD400]/5 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-2/3 bg-[#FF7675]/5 blur-[100px] pointer-events-none"></div>
      </div>

      <div className="max-w-xl w-full text-center relative z-10">
        {/* Icon */}
        <div className="mb-12 flex justify-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-[#FFD400]/20 blur-xl rounded-full group-hover:bg-[#FFD400]/40 transition-all duration-500"></div>
            <div className="relative bg-[#111] border-2 border-[#FFD400] rounded-full p-8 shadow-[0_0_30px_rgba(255,212,0,0.2)]">
              <Ghost size={64} className="text-[#FFD400]" />
            </div>

            {/* Glitch elements */}
            <div className="absolute top-0 left-0 text-[#00B894] font-arcade text-xs animate-pulse opacity-50">- ERR -</div>
            <div className="absolute bottom-0 right-0 text-[#FF7675] font-arcade text-xs animate-pulse opacity-50">- 404 -</div>
          </div>
        </div>

        {/* Content */}
        <div className="mb-12">
          <h1 className="font-arcade text-8xl font-black mb-4 text-white text-3d-orange tracking-widest leading-none">
            4<span className="text-[#FFD400] animate-pulse">0</span>4
          </h1>
          <div className="h-1 w-24 bg-[#FFD400] mx-auto mb-6 shadow-[0_0_10px_#FFD400]"></div>
          <p className="text-2xl font-arcade tracking-[0.2em] mb-4 text-[#00B894] uppercase">
            SECTOR_NOT_FOUND
          </p>
          <p className="text-gray-400 font-mono text-sm max-w-md mx-auto leading-relaxed border border-[#333] p-4 bg-[#111] rounded-sm">
            &gt; GRID COORDINATES INVALID. <br />
            &gt; THE REQUESTED DATA CLUSTER HAS BEEN DELETED OR MOVED TO A SECURE VAULT.
          </p>
        </div>

        {/* Suggestions */}
        <div className="mb-12 p-1 bg-gradient-to-r from-transparent via-[#333] to-transparent">
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            {[
              { href: '/shop', label: 'WARP_TO_SHOP' },
              { href: '/play', label: 'ENTER_ARCADE' },
              { href: '/events', label: 'VIEW_MISSIONS' },
              { href: '/community', label: 'JOIN_GUILD' },
            ].map((link) => (
              <Link key={link.href} href={link.href} className="text-xs font-arcade text-gray-500 hover:text-[#FFD400] hover:bg-[#111] py-2 transition-all uppercase tracking-wider text-center border border-transparent hover:border-[#333]">
                [{link.label}]
              </Link>
            ))}
          </div>
        </div>

        {/* Action */}
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#FFD400] text-black font-arcade text-xs tracking-[0.2em] uppercase rounded-sm hover:bg-white hover:shadow-[0_0_20px_white] transition-all hover:-translate-y-1 active:translate-y-0"
        >
          <Home size={16} />
          RETURN_TO_BASE
        </Link>
      </div>
    </div>
  );
}
