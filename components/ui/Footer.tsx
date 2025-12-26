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
    <footer className="bg-[#FFFDF5] border-t-2 border-black py-20 px-6">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-6">
          <h2 className="text-3xl font-black font-display">Joy Juncture</h2>
          <p className="font-medium text-[#2D3436]/60">
            Making the world a more playful place, one game night at a time.
          </p>
          <div className="flex gap-4">
            {[Twitter, Instagram, Youtube, Github].map((Icon, i) => (
              <a key={i} href="#" className="p-3 bg-white neo-border neo-shadow hover:translate-y-[-2px] transition-transform text-black">
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-black text-xl font-display">Quick Links</h4>
          <ul className="space-y-2 font-bold text-[#2D3436]/60">
            <li><Link href="/shop" className="hover:text-black">Shop All</Link></li>
            <li><Link href="/play" className="hover:text-black">Game Rentals</Link></li>
            <li><Link href="/experiences" className="hover:text-black">How to Play</Link></li>
            <li><Link href="/events" className="hover:text-black">Events</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="font-black text-xl font-display">Support</h4>
          <ul className="space-y-2 font-bold text-[#2D3436]/60">
            <li><Link href="#" className="hover:text-black">Shipping</Link></li>
            <li><Link href="#" className="hover:text-black">Returns</Link></li>
            <li><Link href="#" className="hover:text-black">FAQ</Link></li>
            <li><Link href="/community" className="hover:text-black">Contact</Link></li>
          </ul>
        </div>

        <div className="space-y-6">
          <h4 className="font-black text-xl font-display">Newsletter</h4>
          <p className="font-bold text-[#2D3436]/60">Get 10% off your first order!</p>
          <div className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="Your email..."
              className="px-4 py-3 rounded-xl neo-border font-bold bg-white text-black"
            />
            <button className="bg-[#FFD93D] py-3 rounded-xl font-black neo-border neo-shadow hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-black">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto mt-20 pt-8 border-t border-black/10 flex flex-col md:flex-row justify-between items-center gap-6 font-bold text-[#2D3436]/40 text-sm">
        <p>© 2024 Joy Juncture Inc. Play Responsibly.</p>
        <div className="flex gap-8">
          <a href="#" className="hover:text-black">Privacy Policy</a>
          <a href="#" className="hover:text-black">Terms of Play</a>
          <a href="#" className="hover:text-black">Accessibility</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
