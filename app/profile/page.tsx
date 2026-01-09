'use client';

import { useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useGamification } from '@/app/context/GamificationContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Wallet,
  Gift,
  TrendingUp,
  ShoppingBag,
  Calendar,
  Settings,
  Award,
  Target,
  Zap,
  ArrowUpRight,
  Flame,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  Mail,
  History,
  ChevronRight,
  Star
} from 'lucide-react';
import LevelBadge from '@/components/gamification/LevelBadge';

export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { xp, balance, tier, nextTier, loading: gamificationLoading, history, streak, fetchHistory } = useGamification();
  const router = useRouter();

  useEffect(() => {
    fetchHistory();
  }, []);

  if (authLoading || gamificationLoading) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-[#FFFDF5]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-black border-t-[#FFD93D] mb-4"></div>
          <p className="text-black font-black text-xs tracking-[0.4em]">LOADING PROFILE...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  const currentTierMin = tier?.minXP || 0;
  const nextTierMin = nextTier?.minXP || (xp + 1000);
  const progress = ((xp - currentTierMin) / (nextTierMin - currentTierMin)) * 100;

  return (
    <div className="min-h-screen pt-28 pb-20 bg-[#FFFDF5] text-black">
      <div className="max-w-6xl mx-auto px-6 md:px-12">

        {/* Profile Hero Section */}
        <section className="mb-12">
          <div className="bg-white border-4 border-black rounded-[40px] p-8 md:p-12 neo-shadow flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD93D]/10 rounded-full blur-3xl -z-0 translate-x-1/2 -translate-y-1/2"></div>

            {/* Avatar Block */}
            <div className="relative z-10">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-black bg-[#6C5CE7] flex items-center justify-center overflow-hidden neo-shadow bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl md:text-6xl font-black text-white">
                    {user.email?.[0].toUpperCase()}
                  </span>
                )}
              </div>
              <div className="absolute bottom-2 right-2 bg-[#FFD93D] border-2 border-black p-2 rounded-xl shadow-[2px_2px_0px_#000]">
                <Zap size={20} fill="black" />
              </div>
            </div>

            {/* Identity Block */}
            <div className="text-center md:text-left flex-1 z-10 mt-10 md:mt-0">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                <span className="px-3 py-1 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                  Status: Active
                </span>
                <span className="px-3 py-1 bg-[#00B894] text-white text-[10px] font-black uppercase tracking-widest rounded-full border-2 border-black">
                  Verified Member
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black font-header tracking-tighter mb-2 uppercase leading-none">
                {user.displayName || user.email?.split('@')[0]}
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-4 text-black/60 font-bold">
                <div className="flex items-center gap-1.5">
                  <Mail size={16} />
                  <span>{user.email}</span>
                </div>
                <div className="hidden sm:flex items-center gap-1.5">
                  <Star size={16} className="text-[#FFD93D]" fill="#FFD93D" />
                  <span>Joined {new Date(user.metadata.creationTime!).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            </div>

            {/* Quick Streak Stats */}
            <div className="hidden lg:flex flex-col items-center justify-center bg-[#F8F9FA] border-2 border-black p-6 rounded-[30px] shadow-[4px_4px_0px_rgba(0,0,0,0.05)]">
              <div className="w-12 h-12 bg-[#FF7675] border-2 border-black rounded-2xl flex items-center justify-center mb-2 shadow-[2px_2px_0px_#000]">
                <Flame size={24} className="text-white" fill="white" />
              </div>
              <p className="text-[10px] font-black text-black/40 uppercase tracking-widest">Streak</p>
              <p className="text-3xl font-black text-black leading-none">{streak.count} DAYS</p>
            </div>
          </div>
        </section>

        {/* Primary Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Level Progress Card */}
          <div className="bg-white border-4 border-black rounded-[35px] p-8 neo-shadow relative overflow-hidden group">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <LevelBadge size="lg" />
                <div>
                  <h3 className="text-2xl font-black font-header uppercase tracking-tight leading-none mb-1">{tier.name}</h3>
                  <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest leading-none">Your Current Rank</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-black leading-none">{xp.toLocaleString()}</p>
                <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">Total XP</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="h-6 bg-black/5 border-2 border-black rounded-full overflow-hidden p-1 shadow-[inner_2px_2px_4px_rgba(0,0,0,0.05)]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-[#6C5CE7] to-[#8B7FE8] rounded-full border-r-2 border-black shadow-[2px_0_10px_rgba(108,92,231,0.3)]"
                />
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-black/40">
                <span>{tier.minXP} XP</span>
                <span>Next Rank: {nextTier?.name || 'MAX'} ({nextTier?.minXP || '---'})</span>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3 bg-[#6C5CE7]/5 p-3 rounded-2xl border-2 border-dashed border-[#6C5CE7]/20">
              <span className="p-1.5 bg-[#6C5CE7] rounded-lg text-white">
                <Star size={14} fill="white" />
              </span>
              <p className="text-xs font-bold text-[#6C5CE7]">{tier.perk}</p>
            </div>
          </div>

          {/* Joy Points Card */}
          <div className="bg-[#FFD93D] border-4 border-black rounded-[35px] p-8 neo-shadow flex flex-col group">
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_rgba(255,255,255,0.2)]">
                <Wallet className="w-8 h-8 text-[#FFD93D]" />
              </div>
              <Link href="/wallet" className="p-2 bg-black/10 hover:bg-black/20 rounded-xl transition-colors">
                <ArrowUpRight size={24} />
              </Link>
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black text-black/60 uppercase tracking-widest mb-1">Joy Points Capital</p>
              <h3 className="text-6xl font-black text-black font-header tracking-tighter mb-4">{balance.toLocaleString()}</h3>
              <p className="text-sm font-bold text-black/70 mb-8 max-w-[240px]">Redeem these points for discounts, games, and exclusive items in our store.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/rewards" className="flex-1 text-center py-4 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-[4px_4px_0px_rgba(0,0,0,0.3)] hover:scale-[1.02] transition-all">
                Spend Points
              </Link>
              <Link href="/wallet" className="flex-1 text-center py-4 bg-white border-2 border-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all">
                History
              </Link>
            </div>
          </div>
        </div>

        {/* Profile Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Main Navigation Column */}
          <div className="lg:col-span-2">
            <h2 className="font-header text-3xl font-black uppercase tracking-tighter mb-8 flex items-center gap-4">
              My Stuff <div className="flex-1 h-1 bg-black"></div>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { title: 'My Wallet', icon: Wallet, desc: 'Transaction ledger & earnings', color: 'bg-white', href: '/wallet' },
                { title: 'My Rewards', icon: Gift, desc: 'Claimed vouchers & prizes', color: 'bg-[#6C5CE7]', text: 'text-white', href: '/rewards' },
                { title: 'Orders', icon: ShoppingBag, desc: 'Purchase status & history', color: 'bg-[#FF7675]', href: '/orders' },
                { title: 'Experience Logs', icon: Calendar, desc: 'Custom workshop enquiries', color: 'bg-[#A29BFE]', href: '/profile/enquiries' },
                { title: 'Achievements', icon: Target, desc: 'Completed quests & medals', color: 'bg-[#00B894]', text: 'text-white', href: '/progress' },
                { title: 'Security', icon: ShieldCheck, desc: 'Account & privacy settings', color: 'bg-white', href: '/profile/settings' },
              ].map((item, i) => (
                <Link key={i} href={item.href}>
                  <motion.div
                    whileHover={{ y: -4, x: 4 }}
                    className={`${item.color} border-4 border-black p-6 rounded-[25px] neo-shadow group flex items-start gap-4 cursor-pointer`}
                  >
                    <div className={`p-3 rounded-2xl ${item.text === 'text-white' ? 'bg-white/20' : 'bg-black/5'} border-2 ${item.text === 'text-white' ? 'border-white/20' : 'border-black/10'}`}>
                      <item.icon className={item.text || 'text-black'} size={24} strokeWidth={3} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`text-xl font-black uppercase tracking-tight ${item.text || 'text-black'}`}>{item.title}</h4>
                        <ChevronRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-all ${item.text || 'text-black'}`} />
                      </div>
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${item.text ? 'text-white/60' : 'text-black/40'}`}>{item.desc}</p>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>

          {/* Activity Sidebar */}
          <div className="lg:col-span-1">
            <h2 className="font-header text-3xl font-black uppercase tracking-tighter mb-8">Activity</h2>

            <div className="bg-white border-4 border-black rounded-[35px] p-8 neo-shadow flex flex-col min-h-[400px]">
              <div className="flex items-center gap-3 mb-8 border-b-2 border-black pb-4">
                <History className="text-[#6C5CE7]" size={20} />
                <span className="font-black text-lg uppercase">Recent Feed</span>
              </div>

              <div className="space-y-6 flex-1">
                {history && history.slice(0, 5).map((log, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="relative">
                      <div className={`w-3 h-3 rounded-full border-2 ${log.type === 'EARN' ? 'bg-[#00B894] border-black' : 'bg-[#FF7675] border-black'}`}></div>
                      {i !== 4 && <div className="absolute top-3 left-[5px] w-0.5 h-full bg-black/10"></div>}
                    </div>
                    <div>
                      <div className="flex justify-between gap-4 mb-1">
                        <p className="text-xs font-black uppercase tracking-tight leading-tight">{log.description}</p>
                        <span className={`text-xs font-black whitespace-nowrap ${log.type === 'EARN' ? 'text-[#00B894]' : 'text-[#FF7675]'}`}>
                          {log.type === 'EARN' ? '+' : '-'}{log.amount}
                        </span>
                      </div>
                      <p className="text-[9px] font-bold text-black/40 uppercase tracking-widest">
                        {log.timestamp?.seconds ? new Date(log.timestamp.seconds * 1000).toLocaleDateString() : 'Just Now'}
                      </p>
                    </div>
                  </div>
                ))}

                {(!history || history.length === 0) && (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <History size={40} className="text-black/10 mb-4" />
                    <p className="text-xs font-black text-black/20 uppercase tracking-[0.2em]">No Recent Activity Recorded</p>
                  </div>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => {
                  const { getAuth, signOut } = require('firebase/auth');
                  const { app } = require('@/lib/firebase');
                  signOut(getAuth(app)).then(() => router.push('/'));
                }}
                className="mt-12 w-full py-4 bg-red-500 text-white border-2 border-black rounded-2xl font-black text-xs uppercase tracking-widest shadow-[4px_4px_0px_#000] hover:bg-black transition-all flex items-center justify-center gap-2"
              >
                <LogOut size={16} /> Log Out Account
              </motion.button>
            </div>
          </div>

        </div>

        {/* Account Integrity Footer */}
        <div className="mt-16 pt-16 border-t-2 border-black/10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-[#00B894]/10 border-2 border-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_rgba(0,184,148,0.2)]">
              <ShieldCheck className="text-[#00B894]" size={32} />
            </div>
            <div>
              <p className="font-header text-2xl font-black uppercase leading-none mb-1">Account Secure</p>
              <p className="text-xs font-bold text-black/40 uppercase tracking-widest">256-Bit Encryption Active // ID: {user.uid.slice(0, 10)}...[OK]</p>
            </div>
          </div>
          <div className="text-center md:text-right">
            <p className="text-[9px] font-black text-black/20 uppercase tracking-[0.6em]">JOY JUNCTURE OPERATING SYSTEM v3.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
