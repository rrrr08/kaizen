"use client";

import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black border-t-4 border-[#1A1A1A] py-16">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-12">
        <div>
          <div className="font-arcade text-4xl mb-4 arcade-glow text-white">JOY JUNCTURE</div>
          <p className="text-gray-500 max-w-sm">The digital playground for board game enthusiasts and event seekers. Play hard. Belong together.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-12 text-sm">
          <div className="space-y-4">
            <h4 className="font-arcade text-[#FF8C00]">NAVIGATION</h4>
            <ul className="space-y-2 text-gray-400 font-bold uppercase tracking-tighter">
              <li><Link href="/shop" className="hover:text-white transition-colors">THE SHOP</Link></li>
              <li><Link href="/events" className="hover:text-white transition-colors">LIVE EVENTS</Link></li>
              <li><Link href="/community" className="hover:text-white transition-colors">COMMUNITY</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-arcade text-[#FFD400]">SUPPORT</h4>
            <ul className="space-y-2 text-gray-400 font-bold uppercase tracking-tighter">
              <li><Link href="#" className="hover:text-white transition-colors">TICKET HELP</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">GAME GUIDES</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">CONTACT</Link></li>
            </ul>
          </div>
          <div className="space-y-4 col-span-2 md:col-span-1">
            <h4 className="font-arcade text-white">SOCIAL</h4>
            <div className="flex space-x-4">
              <div className="w-10 h-10 border border-gray-800 flex items-center justify-center hover:border-[#FF8C00] transition-colors cursor-pointer text-gray-500 hover:text-[#FF8C00]">IG</div>
              <div className="w-10 h-10 border border-gray-800 flex items-center justify-center hover:border-[#FF8C00] transition-colors cursor-pointer text-gray-500 hover:text-[#FF8C00]">TW</div>
              <div className="w-10 h-10 border border-gray-800 flex items-center justify-center hover:border-[#FF8C00] transition-colors cursor-pointer text-gray-500 hover:text-[#FF8C00]">DS</div>
            </div>
          </div>
        </div>
      </div>
      <div className="text-center mt-16 text-[10px] font-arcade text-gray-800 tracking-widest">
        © 2024 JOY JUNCTURE ARCADE — ALL NODES SECURED — SYSTEM STATUS: OPTIMAL
      </div>
    </footer>
  );
};

export default Footer;
