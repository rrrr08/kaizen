'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Github, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-[#FFFDF5] border-t-2 border-black py-12 px-6">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="space-y-6">
          <h2 className="text-3xl font-black font-display">Joy Juncture</h2>
          <p className="font-medium text-[#2D3436]/60">
            Making the world a more playful place, one game night at a time.
          </p>
          <div className="flex gap-4">
            <a href="https://twitter.com/joyjuncture" target="_blank" rel="noopener noreferrer" className="p-3 bg-white neo-border neo-shadow hover:translate-y-[-2px] transition-transform text-black">
              <Twitter size={20} />
            </a>
            <a href="https://www.instagram.com/joy_juncture/" target="_blank" rel="noopener noreferrer" className="p-3 bg-white neo-border neo-shadow hover:translate-y-[-2px] transition-transform text-black">
              <Instagram size={20} />
            </a>
            <a href="https://www.youtube.com/@Joy_Juncture" target="_blank" rel="noopener noreferrer" className="p-3 bg-white neo-border neo-shadow hover:translate-y-[-2px] transition-transform text-black">
              <Youtube size={20} />
            </a>

          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-black text-xl font-display">Quick Links</h4>
          <ul className="space-y-2 font-bold text-[#2D3436]/60">
            <li><Link href="/shop" className="hover:text-black">Shop All</Link></li>
            <li><Link href="/play" className="hover:text-black">Games</Link></li>
            <li><Link href="/events/upcoming" className="hover:text-black">Events</Link></li>
            <li><Link href="/about" className="hover:text-black">About Us</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="font-black text-xl font-display">Support</h4>
          <ul className="space-y-2 font-bold text-[#2D3436]/60">
            <li><Link href="/blog" className="hover:text-black">Blog</Link></li>
            <li><Link href="/community" className="hover:text-black">Community</Link></li>
            <li><Link href="/contact" className="hover:text-black">Contact</Link></li>
          </ul>
        </div>
      </div>

      <div className="container mx-auto mt-12 pt-8 border-t border-black/10 flex flex-col md:flex-row justify-between items-center gap-6 font-bold text-[#2D3436]/40 text-sm">
        <p>© 2026 Joy Juncture Inc. Play Responsibly.</p>
        <div className="flex gap-8">
          <Link href="/about" className="hover:text-black">Privacy Policy</Link>
          <Link href="/about" className="hover:text-black">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
