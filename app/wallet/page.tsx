'use client';

import { useGamification } from '@/app/context/GamificationContext';
import Link from 'next/link';
import { Wallet as WalletIcon, TrendingUp, Gift, Zap, Crown } from 'lucide-react';
import LevelBadge from '@/components/gamification/LevelBadge';
import WheelOfJoy from '@/components/gamification/WheelOfJoy';

export const dynamic = 'force-dynamic';

export default function WalletPage() {
  const { xp, balance, tier, nextTier, loading, streak, buyStreakFreeze } = useGamification();

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-[#FFFDF5]">
        <p className="font-header tracking-widest text-lg animate-pulse text-charcoal">LOADING PROFILE...</p>
      </div>
    );
  }

  const progress = nextTier
    ? Math.min(100, Math.max(0, ((xp - tier.minXP) / (nextTier.minXP - tier.minXP)) * 100))
    : 100;

  return (
    <div className="min-h-screen pt-28 pb-16 bg-[#FFFDF5] text-[#2D3436] relative overflow-hidden">

      <div className="max-w-6xl mx-auto px-6 md:px-12 relative z-10">
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <Link href="/shop" className="font-header text-[10px] tracking-[0.2em] text-[#2D3436]/60 hover:text-[#FFD93D] mb-6 inline-block transition-colors">
              ← BACK TO SHOP
            </Link>
            <h1 className="font-display text-5xl md:text-6xl font-black mb-2">MY DASHBOARD</h1>
            <p className="text-lg text-[#2D3436]/80 font-bold">Your journey through the playground.</p>
          </div>

          {/* Global Streak Display */}
          <div className="flex items-center gap-4 bg-white border-2 border-black px-6 py-3 rounded-full neo-shadow">
            <div className="flex flex-col items-center">
              <div className="font-header text-[10px] tracking-widest text-[#2D3436]/60">STREAK</div>
              <div className="text-2xl font-black text-[#FFD93D] flex items-center gap-2 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                🔥 {streak.count} <span className="text-xs text-[#2D3436]/60">DAYS</span>
              </div>
            </div>
            <div className="h-8 w-[2px] bg-black/10"></div>
            {streak.freezeCount > 0 ? (
              <div className="text-[#6C5CE7] text-xs font-black">❄️ ACTIVE</div>
            ) : (
              <button
                onClick={buyStreakFreeze}
                className="text-[10px] font-black text-[#2D3436]/60 hover:text-[#6C5CE7] transition-colors uppercase"
              >
                + Buy Freeze
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
              <div className="p-8 rounded-[20px] bg-[#FFD93D] border-3 border-black neo-shadow relative overflow-hidden group hover:translate-y-[-4px] transition-transform">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-black p-2 rounded-lg">
                      <WalletIcon className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-black text-xs tracking-widest text-black">JOY POINTS (JP)</span>
                  </div>
                  <div className="font-sans text-5xl font-black text-black mb-2">{balance.toLocaleString()}</div>
                  <p className="text-black/80 text-sm font-bold">Spendable currency for discounts & rewards</p>

                  <div className="mt-6 flex gap-3">
                    <Link href="/shop" className="px-6 py-3 bg-black text-white font-black text-xs tracking-widest hover:scale-105 transition-transform rounded-xl border-2 border-transparent">
                      SPEND POINTS
                    </Link>
                  </div>
                </div>
              </div>

              {/* XP (Status) */}
              <div className="p-8 rounded-[20px] bg-white border-3 border-black neo-shadow relative overflow-hidden">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-[#6C5CE7] p-2 rounded-lg border-2 border-black">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-black text-xs tracking-widest text-[#6C5CE7]">EXPERIENCE (XP)</span>
                </div>
                <div className="font-sans text-5xl font-black text-black mb-2">{xp.toLocaleString()}</div>
                <div className="flex items-center gap-2 mb-6">
                  <LevelBadge size="sm" />
                  <span className="text-black/60 text-sm font-bold">Lifetime earned</span>
                </div>

                {nextTier ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] uppercase font-black text-black/60">
                      <span>Progress to {nextTier.name}</span>
                      <span>{Math.floor(nextTier.minXP - xp)} XP LEFT</span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden border-2 border-black">
                      <div className="h-full bg-[#00B894] transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                ) : (
                  <div className="text-[#00B894] font-black text-xs tracking-widest">MAX TIER REACHED</div>
                )}
              </div>
            </div>

            {/* 2. Wheel of Joy Widget */}
            <div className="p-1 rounded-[20px] border-3 border-black bg-[#6C5CE7] neo-shadow">
              <div className="flex flex-col md:flex-row items-center gap-8 p-8">
                <div className="flex-1 text-center md:text-left text-white">
                  <h2 className="font-display text-4xl font-black mb-2 text-white drop-shadow-[2px_2px_0px_#000]">The Wheel of Joy</h2>
                  <p className="text-white/90 mb-6 font-bold text-lg">Spin daily for a chance to win Joy Points, XP Boosts, or exclusive coupons.</p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white text-black p-3 rounded-xl border-2 border-black text-center neo-shadow">
                      <div className="text-2xl font-black text-[#FFD93D] drop-shadow-[1px_1px_0px_#000]">1%</div>
                      <div className="text-[10px] font-bold tracking-widest uppercase">Jackpot Odds</div>
                    </div>
                    <div className="bg-white text-black p-3 rounded-xl border-2 border-black text-center neo-shadow">
                      <div className="text-2xl font-black text-[#00B894] drop-shadow-[1px_1px_0px_#000]">100%</div>
                      <div className="text-[10px] font-bold tracking-widest uppercase">Fun</div>
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
            <div className={`p-8 rounded-[20px] border-3 border-black neo-shadow ${tier.name === 'Newbie' ? 'bg-white' : tier.name === 'Grandmaster' ? 'bg-[#FFD93D]' : 'bg-white'}`}>
              <div className="flex items-center justify-between mb-6">
                <span className="font-black text-xs tracking-widest text-black/60">CURRENT STATUS</span>
                <LevelBadge size="sm" />
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-black text-white rounded-lg"><TrendingUp size={16} /></div>
                  <div>
                    <div className="font-black text-black text-lg">{tier.multiplier}x</div>
                    <div className="text-xs text-black/60 uppercase font-bold tracking-wider">Earning Multiplier</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-black text-white rounded-lg"><Gift size={16} /></div>
                  <div>
                    <div className="font-black text-black text-sm">{tier.perk}</div>
                    <div className="text-xs text-black/60 uppercase font-bold tracking-wider">Tier Perk</div>
                  </div>
                </div>
              </div>
            </div>

            {/* How it Works */}
            <div className="p-6 rounded-[20px] border-3 border-black bg-[#EFEFEF] neo-shadow">
              <h3 className="font-black text-sm tracking-widest mb-4 text-black/70">HOW THE ECONOMY WORKS</h3>
              <ul className="space-y-4">
                <li className="flex gap-3 text-sm text-black/80 font-bold">
                  <span className="text-[#FFD93D] text-lg leading-none drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">•</span>
                  <span><strong>Joy Points (JP)</strong> are spent on rewards, coupons, and spins.</span>
                </li>
                <li className="flex gap-3 text-sm text-black/80 font-bold">
                  <span className="text-[#6C5CE7] text-lg leading-none drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">•</span>
                  <span><strong>Experience (XP)</strong> is permanent and determines your Tier Status.</span>
                </li>
                <li className="flex gap-3 text-sm text-black/80 font-bold">
                  <span className="text-[#00B894] text-lg leading-none drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">•</span>
                  <span>Earn <strong>1 JP & 1 XP</strong> for every ₹10 spent in the shop.</span>
                </li>
              </ul>
            </div>

            <div className="text-center">
              <p className="text-[10px] text-black/40 font-black tracking-[0.2em] uppercase">Joy Juncture Gamification</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
