'use client';

import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-black border-t border-white/10 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div>
            <div className="font-header text-xl tracking-[0.2em] mb-6">
              <span className="text-amber-500">JOY</span>
              <span className="text-white/40 ml-2">JUNCTURE</span>
            </div>
            <p className="text-white/50 font-serif italic text-sm">
              The digital playground for games, events, and community engagement.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-header text-[10px] tracking-[0.4em] text-amber-500 mb-6 uppercase">Explore</h4>
            <ul className="space-y-3 text-white/60 font-serif text-sm">
              <li><Link href="/shop" className="hover:text-amber-500 transition-colors">Games & Shop</Link></li>
              <li><Link href="/experiences" className="hover:text-amber-500 transition-colors">Experiences</Link></li>
              <li><Link href="/events" className="hover:text-amber-500 transition-colors">Events</Link></li>
              <li><Link href="/community" className="hover:text-amber-500 transition-colors">Community</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-header text-[10px] tracking-[0.4em] text-amber-500 mb-6 uppercase">Resources</h4>
            <ul className="space-y-3 text-white/60 font-serif text-sm">
              <li><Link href="#" className="hover:text-amber-500 transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-amber-500 transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-amber-500 transition-colors">FAQ</Link></li>
              <li><Link href="#" className="hover:text-amber-500 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-header text-[10px] tracking-[0.4em] text-amber-500 mb-6 uppercase">Legal</h4>
            <ul className="space-y-3 text-white/60 font-serif text-sm">
              <li><Link href="#" className="hover:text-amber-500 transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-amber-500 transition-colors">Terms & Conditions</Link></li>
              <li><Link href="#" className="hover:text-amber-500 transition-colors">Refund Policy</Link></li>
              <li><Link href="#" className="hover:text-amber-500 transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-white/40 font-serif text-xs text-center md:text-left">
            © 2024 Joy Juncture. All rights reserved. | Design joy. Build play. Create belonging.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-white/40 hover:text-amber-500 transition-colors font-header text-[9px] tracking-widest">TWITTER</a>
            <a href="#" className="text-white/40 hover:text-amber-500 transition-colors font-header text-[9px] tracking-widest">INSTAGRAM</a>
            <a href="#" className="text-white/40 hover:text-amber-500 transition-colors font-header text-[9px] tracking-widest">DISCORD</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
