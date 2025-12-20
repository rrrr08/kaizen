'use client';

import Link from 'next/link';
import { Mail, ArrowRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black border-t border-white/10 py-16 md:py-24 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/5 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20 border-b border-white/10 pb-16">
          {/* Brand Philosophy - Spans 4 columns */}
          <div className="md:col-span-4 space-y-6">
            <div className="font-header text-2xl tracking-[0.1em]">
              <span className="text-white">JOY</span>
              <span className="text-amber-500">JUNCTURE</span>
            </div>
            <p className="text-white/60 font-serif italic text-base leading-relaxed">
              "Games are moments, memories, and shared joy."
            </p>
            <p className="text-white/40 text-sm max-w-xs">
              We are building a digital playground for board games, live experiences, and community engagement.
            </p>
          </div>

          {/* Spacer/Navigation - Spans 4 columns */}
          <div className="md:col-span-4 grid grid-cols-2 gap-8">
            <div>
              <h4 className="font-header text-[10px] tracking-[0.4em] text-amber-500 mb-6 uppercase">Play</h4>
              <ul className="space-y-4 text-white/60 font-header text-xs tracking-wider">
                <li><Link href="/shop" className="hover:text-white transition-colors">GAMES</Link></li>
                <li><Link href="/experiences" className="hover:text-white transition-colors">EXPERIENCES</Link></li>
                <li><Link href="/events" className="hover:text-white transition-colors">EVENTS</Link></li>
                <li><Link href="/community" className="hover:text-white transition-colors">COMMUNITY</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-header text-[10px] tracking-[0.4em] text-amber-500 mb-6 uppercase">Support</h4>
              <ul className="space-y-4 text-white/60 font-header text-xs tracking-wider">
                <li><Link href="#" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">SHIPPING</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">REFUNDS</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">CONTACT</Link></li>
              </ul>
            </div>
          </div>

          {/* Newsletter - Spans 4 columns */}
          <div className="md:col-span-4 space-y-6">
            <h4 className="font-header text-[10px] tracking-[0.4em] text-amber-500 uppercase">Stay Connected</h4>
            <p className="text-white/80 font-serif italic text-sm">
              Join 2,000+ players — get invites, puzzles & rewards.
            </p>
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors font-sans"
                />
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
              </div>
              <button className="bg-amber-500 text-black px-4 py-3 hover:bg-white transition-colors">
                <ArrowRight size={18} />
              </button>
            </div>
            <p className="text-white/30 text-[10px] uppercase tracking-widest">
              No spam. Just joy.
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-6 text-white/40 font-header text-[10px]">
            <a href="#" className="hover:text-white transition-colors">PRIVACY POLICY</a>
            <a href="#" className="hover:text-white transition-colors">TERMS OF SERVICE</a>
          </div>

          <div className="flex gap-8">
            <a href="#" className="text-white/40 hover:text-amber-500 transition-colors font-header text-[10px] tracking-widest">INSTAGRAM</a>
            <a href="#" className="text-white/40 hover:text-amber-500 transition-colors font-header text-[10px] tracking-widest">DISCORD</a>
            <a href="#" className="text-white/40 hover:text-amber-500 transition-colors font-header text-[10px] tracking-widest">WHATSAPP</a>
          </div>

          <p className="text-white/30 font-header text-[10px] text-center md:text-right">
            © 2024 JOY JUNCTURE
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
