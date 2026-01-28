'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, ShoppingBag, Menu, X, User, LogOut, Settings, LayoutDashboard, ChevronDown, ArrowRight } from 'lucide-react';
import { useCart } from '@/app/context/CartContext';
import { useGamification } from '@/app/context/GamificationContext';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import Logo from '@/components/ui/Logo';
import NotificationCenter from '@/app/components/NotificationCenter';
import { useAuth } from '@/app/context/AuthContext';
import Image from 'next/image';

const navItems = [
  { name: 'Shop', path: '/shop' },
  { name: 'Experiences', path: '/experiences' },
  { name: 'Play', path: '/play' },
  { name: 'Events', path: '/events' },
  // { name: 'Event Testimonials', path: '/eventestimonial' },
  { name: 'Community', path: '/community' },
  { name: 'Blog', path: '/blog' },
  { name: 'About', path: '/about' },
];

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileEventsOpen, setIsMobileEventsOpen] = useState(false);
  const { items } = useCart();
  const { balance } = useGamification();
  const { user, userProfile, isAdmin } = useAuth();

  const handleLogout = async () => {
    const auth = getAuth(app);
    await signOut(auth);
    window.location.href = '/';
  };

  const totalItems = items.reduce((acc: number, item: any) => acc + item.quantity, 0);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between bg-[#FFFDF5] border-b-4 border-black transition-all">
        {/* Logo */}
        <Logo size="medium" linkTo="/" showText={true} />

        {/* Desktop Menu */}
        <div className="relative hidden lg:flex bg-white/50 p-1 rounded-full border-2 border-black items-center shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">
          {navItems.map((item, idx) => {
            const isActive = pathname.startsWith(item.path);
            if (item.name === 'Events') {
              return (
                <DropdownMenu.Root key={item.path}>
                  <DropdownMenu.Trigger asChild>
                    <button
                      className={`relative px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wide transition-colors duration-300 z-10 flex items-center gap-1 outline-none ${isActive ? 'text-white' : 'text-black hover:bg-black/5'}`}
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeNav"
                          className="absolute inset-0 bg-black rounded-full -z-10"
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      {item.name}
                      <ChevronDown size={12} strokeWidth={3} className={isActive ? "text-white" : "text-black"} />
                    </button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      className="w-48 bg-white border-2 border-black rounded-xl p-2 neo-shadow z-[60] data-[side=bottom]:animate-slideUpAndFade"
                      sideOffset={10}
                    >
                      <DropdownMenu.Item className="outline-none">
                        <Link
                          href="/events/upcoming"
                          className="flex items-center gap-2 px-3 py-2 text-sm font-black text-black rounded-lg hover:bg-[#FFD93D] hover:text-black hover:border-black transition-colors border-2 border-transparent uppercase tracking-wide"
                        >
                          Upcoming
                        </Link>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item className="outline-none mt-1">
                        <Link
                          href="/events/past"
                          className="flex items-center gap-2 px-3 py-2 text-sm font-black text-black rounded-lg hover:bg-[#6C5CE7] hover:text-white transition-colors border-2 border-transparent uppercase tracking-wide"
                        >
                          Past Events
                        </Link>
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              );
            }

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`relative px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wide transition-colors duration-300 z-10 ${isActive ? 'text-white' : 'text-black hover:bg-black/5'
                  }`}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-black rounded-full -z-10"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-2 z-50">
          {/* Wallet Capsule */}
          <div className="hidden sm:flex items-center gap-2">
            <Link href="/rewards">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 bg-[#00B894] px-3 py-1.5 rounded-full border-2 border-black neo-shadow cursor-pointer"
              >
                <motion.div
                  animate={{ rotateY: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
                  className="flex items-center justify-center"
                >
                  <Coins className="text-black w-4 h-4" />
                </motion.div>
                <div className="flex flex-col">
                  <span className="text-[7px] text-black font-black uppercase leading-none tracking-widest">Balance</span>
                  <span className="text-black font-black whitespace-nowrap text-xs leading-none">{balance.toLocaleString()}</span>
                </div>
              </motion.div>
            </Link>
          </div>

          {/* Cart Button */}
          <Link href="/cart">
            <motion.button
              whileHover={{ scale: 1.1, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
              aria-label={`Shopping cart with ${totalItems} item${totalItems !== 1 ? 's' : ''}`}
              className="w-10 h-10 bg-white flex items-center justify-center rounded-full border-2 border-black neo-shadow relative"
            >
              <ShoppingBag className="w-4 h-4 text-black" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FF7675] text-black text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-black">
                  {totalItems}
                </span>
              )}
            </motion.button>
          </Link>

          {/* Notification Bell */}
          {user && (
            <div className="relative">
              <NotificationCenter />
            </div>
          )}

          {/* Profile / Auth Button (Dropdown) */}
          {user ? (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="User menu"
                  className="w-10 h-10 bg-[#6C5CE7] flex items-center justify-center rounded-full border-2 border-black neo-shadow cursor-pointer outline-none"
                >
                  <div className="w-full h-full flex items-center justify-center text-white font-black text-sm relative">
                    {userProfile?.image || user?.photoURL ? (
                      <Image
                        src={userProfile?.image || user?.photoURL || ''}
                        alt="Profile"
                        fill
                        className="object-cover rounded-full"
                      />
                    ) : (
                      user.email?.[0].toUpperCase()
                    )}
                  </div>
                </motion.button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="w-56 bg-white border-2 border-black rounded-xl p-2 neo-shadow z-[60] data-[side=bottom]:animate-slideUpAndFade data-[side=right]:animate-slideLeftAndFade data-[side=left]:animate-slideRightAndFade data-[side=top]:animate-slideDownAndFade"
                  sideOffset={10}
                >
                  <div className="px-2 py-2 mb-2 bg-gray-100 rounded-lg border border-black/10">
                    <p className="text-xs font-bold text-black/50 uppercase tracking-wider mb-1">Signed in as</p>
                    <p className="text-sm font-black text-black truncate">{user.email}</p>
                  </div>

                  {isAdmin && (
                    <DropdownMenu.Item className="outline-none">
                      <Link href="/admin" className="group flex items-center gap-3 px-3 py-2 text-sm font-bold text-black rounded-lg hover:bg-[#FF7675] hover:text-white hover:border-black transition-colors border border-transparent">
                        <LayoutDashboard size={16} strokeWidth={2.5} />
                        Admin Panel
                      </Link>
                    </DropdownMenu.Item>
                  )}

                  <DropdownMenu.Item className="outline-none">
                    <Link href="/profile" className="group flex items-center gap-3 px-3 py-2 text-sm font-bold text-black rounded-lg hover:bg-[#FFD93D] hover:text-black hover:border-black transition-colors border border-transparent">
                      <User size={16} strokeWidth={2.5} />
                      My Profile
                    </Link>
                  </DropdownMenu.Item>

                  <DropdownMenu.Item className="outline-none">
                    <Link href="/profile/settings" className="group flex items-center gap-3 px-3 py-2 text-sm font-bold text-black rounded-lg hover:bg-[#FFD93D] hover:text-black hover:border-black transition-colors border border-transparent">
                      <Settings size={16} strokeWidth={2.5} />
                      Settings
                    </Link>
                  </DropdownMenu.Item>

                  <div className="h-[2px] bg-black my-2" />

                  <DropdownMenu.Item
                    className="group flex items-center gap-3 px-3 py-2 text-sm font-bold text-red-500 rounded-lg outline-none cursor-pointer hover:bg-black hover:text-white transition-colors border border-transparent"
                    onSelect={handleLogout}
                  >
                    <LogOut size={16} strokeWidth={2.5} />
                    Log Out
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          ) : (
            <Link href="/auth/login">
              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Login"
                className="w-10 h-10 bg-[#6C5CE7] flex items-center justify-center rounded-full border-2 border-black neo-shadow"
              >
                <User className="w-4 h-4 text-white" />
              </motion.button>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            className="lg:hidden w-10 h-10 bg-black flex items-center justify-center rounded-full text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 top-[80px] z-40 bg-[#FFFDF5] p-6 lg:hidden overflow-y-auto"
          >
            <div className="flex flex-col gap-4">
              {navItems.map((item) => {
                if (item.name === 'Events') {
                  return (
                    <div key={item.path} className="flex flex-col">
                      <button
                        onClick={() => setIsMobileEventsOpen(!isMobileEventsOpen)}
                        className="flex items-center justify-between text-3xl sm:text-4xl font-black text-black hover:text-[#6C5CE7] uppercase tracking-tighter w-full text-left"
                      >
                        {item.name}
                        <ChevronDown
                          size={24}
                          className={`transition-transform duration-300 ${isMobileEventsOpen ? 'rotate-180' : ''
                            }`}
                        />
                      </button>
                      <AnimatePresence>
                        {isMobileEventsOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="overflow-hidden flex flex-col gap-3 pl-6 mt-2 border-l-4 border-black/10 ml-2"
                          >
                            <Link
                              href="/events/upcoming"
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="text-xl sm:text-2xl font-black text-black/80 hover:text-[#FFD93D] uppercase tracking-tighter flex items-center gap-2 py-1"
                            >
                              <ArrowRight size={16} /> Upcoming
                            </Link>
                            <Link
                              href="/events/past"
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="text-xl sm:text-2xl font-black text-black/80 hover:text-[#6C5CE7] uppercase tracking-tighter flex items-center gap-2 py-1"
                            >
                              <ArrowRight size={16} /> Past
                            </Link>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-3xl sm:text-4xl font-black text-black hover:text-[#6C5CE7] uppercase tracking-tighter"
                  >
                    {item.name}
                  </Link>
                );
              })}
              <div className="h-px bg-black/10 my-4" />
              <Link
                href={user ? "/profile" : "/auth/login"}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-xl font-bold text-black/60 uppercase tracking-widest"
              >
                {user ? "My Profile" : "Login / Sign Up"}
              </Link>
              <div className="mt-8 p-6 bg-[#00B894] rounded-2xl border-4 border-black neo-shadow">
                <p className="font-black text-black uppercase tracking-widest mb-2">My Balance</p>
                <p className="text-4xl font-black text-black">{balance.toLocaleString()} JP</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;