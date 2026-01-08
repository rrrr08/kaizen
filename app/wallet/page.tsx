'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useGamification } from '@/app/context/GamificationContext';
import Link from 'next/link';
import { Wallet as WalletIcon, TrendingUp, Gift, Zap, Crown } from 'lucide-react';
import LevelBadge from '@/components/gamification/LevelBadge';
import WheelOfJoy from '@/components/gamification/WheelOfJoy';

export const dynamic = 'force-dynamic';

export default function WalletPage() {
  const { user } = useAuth();
  const { xp, balance, tier, nextTier, loading, streak, buyStreakFreeze } = useGamification();

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-black">
        <p className="text-white font-header tracking-widest text-lg animate-pulse">LOADING PROFILE...</p>
      </div>
    );
  }

  const progress = nextTier
    ? Math.min(100, Math.max(0, ((xp - tier.minXP) / (nextTier.minXP - tier.minXP)) * 100))
    : 100;

  return (
    <div className="min-h-screen pt-28 pb-16 bg-black text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-amber-900/10 to-transparent pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-6 md:px-12 relative z-10">
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <Link href="/shop" className="font-header text-[10px] tracking-[0.2em] text-white/40 hover:text-gold mb-6 inline-block transition-colors">
              ← BACK TO SHOP
            </Link>
            <h1 className="font-display text-5xl md:text-6xl font-bold mb-2">MY DASHBOARD</h1>
            <p className="text-lg text-white/60 font-serif italic">Your journey through the playground.</p>
          </div>

          {/* Global Streak Display */}
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-3 rounded-full backdrop-blur-sm">
            <div className="flex flex-col items-center">
              <div className="font-header text-[10px] tracking-widest text-white/40">STREAK</div>
              <div className="text-2xl font-bold text-amber-500 flex items-center gap-2">
                🔥 {streak.count} <span className="text-xs text-white/40">DAYS</span>
              </div>
            </div>
            <div className="h-8 w-[1px] bg-white/10"></div>
            {streak.freezeCount > 0 ? (
              <div className="text-blue-400 text-xs font-header">❄️ ACTIVE</div>
            ) : (
              <button
                onClick={buyStreakFreeze}
                className="text-[10px] font-header text-white/60 hover:text-blue-400 transition-colors"
              >
                + BUY FREEZE
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Main Wallet Card (Balance) */}
          <div className="lg:col-span-2 space-y-8">
            {/* 1. Currencies Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Joy Points (Spendable) */}
              <div className="glass-card p-8 rounded-sm bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 relative overflow-hidden group hover:border-amber-500/40 transition-all">
                <div className="absolute top-0 right-0 p-16 bg-amber-500/10 blur-[50px] rounded-full group-hover:bg-amber-500/20 transition-all"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <WalletIcon className="w-5 h-5 text-amber-500" />
                    <span className="font-header text-xs tracking-widest text-amber-500">JOY POINTS (JP)</span>
                  </div>
                  <div className="font-sans text-5xl font-bold text-white mb-2">{balance.toLocaleString()}</div>
                  <p className="text-white/40 text-sm font-serif italic">Spendable currency for discounts & rewards</p>

                  <div className="mt-6 flex gap-3">
                    <Link href="/shop" className="px-4 py-2 bg-amber-500 text-black font-header text-[10px] tracking-widest hover:bg-white transition-colors">
                      SPEND POINTS
                    </Link>
                  </div>
                </div>
              </div>

              {/* XP (Status) */}
              <div className="glass-card p-8 rounded-sm bg-white/5 border border-white/10 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-4">
                  <Crown className="w-5 h-5 text-emerald-400" />
                  <span className="font-header text-xs tracking-widest text-emerald-400">EXPERIENCE (XP)</span>
                </div>
                <div className="font-sans text-5xl font-bold text-white mb-2">{xp.toLocaleString()}</div>
                <div className="flex items-center gap-2 mb-6">
                  <LevelBadge size="sm" />
                  <span className="text-white/40 text-sm font-serif italic">Lifetime earned</span>
                </div>

                {nextTier ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] uppercase font-header text-white/40">
                      <span>Progress to {nextTier.name}</span>
                      <span>{Math.floor(nextTier.minXP - xp)} XP LEFT</span>
                    </div>
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                ) : (
                  <div className="text-emerald-400 font-header text-xs tracking-widest">MAX TIER REACHED</div>
                )}
              </div>
            </div>

            {/* 2. Wheel of Joy Widget */}
            <div className="glass-card p-1 rounded-sm border border-white/10 bg-black/40">
              <div className="flex flex-col md:flex-row items-center gap-8 p-8 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
                <div className="flex-1 text-center md:text-left">
                  <h2 className="font-display text-3xl font-bold text-white mb-2">The Wheel of Joy</h2>
                  <p className="text-white/60 mb-6 font-serif">Spin daily for a chance to win Joy Points, XP Boosts, or exclusive coupons.</p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-3 rounded border border-white/10 text-center">
                      <div className="text-2xl font-bold text-amber-500">1%</div>
                      <div className="text-[9px] text-white/40 tracking-widest uppercase">Jackpot Odds</div>
                    </div>
                    <div className="bg-white/5 p-3 rounded border border-white/10 text-center">
                      <div className="text-2xl font-bold text-emerald-400">100%</div>
                      <div className="text-[9px] text-white/40 tracking-widest uppercase">Fun</div>
                    </div>
                  </div>
                </div>
                <div>
                  <WheelOfJoy />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Tier Benefits & Info */}
          <div className="space-y-6">
            {/* Current Tier Perk */}
            <div className={`p-8 rounded-sm border ${tier.name === 'Newbie' ? 'border-white/10 bg-white/5' : tier.name === 'Grandmaster' ? 'border-amber-500/50 bg-amber-500/10' : 'border-white/10 bg-white/5'}`}>
              <div className="flex items-center justify-between mb-6">
                <span className="font-header text-xs tracking-widest text-white/40">CURRENT STATUS</span>
                <LevelBadge size="sm" />
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-white/5 rounded-full"><TrendingUp size={16} /></div>
                  <div>
                    <div className="font-bold text-white text-lg">{tier.multiplier}x</div>
                    <div className="text-xs text-white/50 uppercase tracking-wider">Earning Multiplier</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-white/5 rounded-full"><Gift size={16} /></div>
                  <div>
                    <div className="font-bold text-white text-sm">{tier.perk}</div>
                    <div className="text-xs text-white/50 uppercase tracking-wider">Tier Perk</div>
                  </div>
                </div>
              </div>
            </div>

            {/* How it Works */}
            <div className="glass-card p-6 rounded-sm border border-white/10">
              <h3 className="font-header text-sm tracking-widest mb-4 text-white/70">HOW THE ECONOMY WORKS</h3>
              <ul className="space-y-4">
                <li className="flex gap-3 text-sm text-white/60">
                  <span className="text-amber-500 font-bold">•</span>
                  <span><strong>Joy Points (JP)</strong> are spent on rewards, coupons, and spins.</span>
                </li>
                <li className="flex gap-3 text-sm text-white/60">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong>Experience (XP)</strong> is permanent and determines your Tier Status.</span>
                </li>
                <li className="flex gap-3 text-sm text-white/60">
                  <span className="text-blue-400 font-bold">•</span>
                  <span>Earn <strong>1 JP & 1 XP</strong> for every ₹10 spent in the shop.</span>
                </li>
              </ul>
            </div>

            <div className="text-center">
              <p className="text-[10px] text-white/20 font-header tracking-[0.2em] uppercase">Joy Juncture Gamification</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
