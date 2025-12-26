'use client';

import { useGamification } from '@/app/context/GamificationContext';
import Link from 'next/link';
import { Wallet as WalletIcon, TrendingUp, Gift, Crown, User, Terminal } from 'lucide-react';
import LevelBadge from '@/components/gamification/LevelBadge';
import WheelOfJoy from '@/components/gamification/WheelOfJoy';

export const dynamic = 'force-dynamic';

export default function WalletPage() {
  const { xp, balance, tier, nextTier, loading, streak, buyStreakFreeze } = useGamification();

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-black text-white">
        <p className="font-arcade tracking-widest text-lg animate-pulse text-[#FF8C00]">LOADING_SYSTEM_PROFILE...</p>
      </div>
    );
  }

  const progress = nextTier
    ? Math.min(100, Math.max(0, ((xp - tier.minXP) / (nextTier.minXP - tier.minXP)) * 100))
    : 100;

  return (
    <div className="min-h-screen pt-28 pb-16 bg-black text-white relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute inset-0 pixel-grid opacity-20 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FF8C00]/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-6 md:px-12 relative z-10">
        {/* Header - Pilot ID */}
        <div className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6 border-b border-[#333] pb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-[#111] border-2 border-[#FFD400] overflow-hidden flex items-center justify-center shadow-[0_0_15px_rgba(255,212,0,0.3)]">
              <User className="w-10 h-10 text-[#FFD400]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="font-arcade text-3xl md:text-5xl text-white text-3d-orange uppercase">PILOT_DASHBOARD</h1>
                <LevelBadge size="md" />
              </div>
              <p className="text-gray-400 font-arcade text-xs tracking-widest">ID: KAIZEN-OPERATIVE // ACCESS LEVEL: {tier.name.toUpperCase()}</p>
            </div>
          </div>

          {/* Global Streak Display */}
          <div className="flex items-center gap-4 bg-[#111] border border-[#333] px-6 py-3 shadow-lg">
            <div className="flex flex-col items-center">
              <div className="font-arcade text-[10px] tracking-widest text-gray-500 mb-1">STREAK_STATUS</div>
              <div className="text-2xl font-black text-[#FF4500] flex items-center gap-2 drop-shadow-[0_0_10px_rgba(255,69,0,0.8)] font-arcade">
                🔥 {streak.count} <span className="text-xs text-gray-500">CYCLES</span>
              </div>
            </div>
            <div className="h-8 w-[1px] bg-[#333]"></div>
            {streak.freezeCount > 0 ? (
              <div className="text-cyan-400 text-xs font-arcade animate-pulse">❄️ CRYOSLEEP_ACTIVE</div>
            ) : (
              <button
                onClick={buyStreakFreeze}
                className="text-[10px] font-arcade text-gray-500 hover:text-cyan-400 transition-colors uppercase border border-gray-800 hover:border-cyan-400 px-3 py-1"
              >
                + ACTIVATE_FREEZE
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Main Wallet Card (Balance) */}
          <div className="lg:col-span-2 space-y-8">
            {/* 1. Currencies Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Joy Points (Spendable) */}
              <div className="p-8 arcade-card-3d bg-[#111] relative group overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <WalletIcon className="w-24 h-24 text-[#FF8C00]" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-[#FF8C00]/20 p-2 border border-[#FF8C00]">
                      <Terminal className="w-4 h-4 text-[#FF8C00]" />
                    </div>
                    <span className="font-arcade text-xs tracking-widest text-[#FF8C00]">CREDITS (JP)</span>
                  </div>
                  <div className="font-arcade text-4xl md:text-5xl text-white mb-2 tracking-wider">{balance.toLocaleString()}</div>
                  <p className="text-gray-500 text-xs font-arcade tracking-wide mb-6">AVAILABLE FOR REQUSITION</p>

                  <div className="flex gap-3">
                    <Link href="/shop" className="px-6 py-3 bg-[#FF8C00] text-black font-arcade text-xs tracking-widest hover:bg-white transition-colors border-b-4 border-[#A0522D] active:border-b-0 active:translate-y-1">
                      OPEN_VAULT
                    </Link>
                  </div>
                </div>
              </div>

              {/* XP (Status) */}
              <div className="p-8 arcade-card-3d bg-[#111] relative overflow-hidden border-t-2 border-[#00B894]/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-[#00B894]/20 p-2 border border-[#00B894]">
                    <Crown className="w-4 h-4 text-[#00B894]" />
                  </div>
                  <span className="font-arcade text-xs tracking-widest text-[#00B894]">EXPERIENCE (XP)</span>
                </div>
                <div className="font-arcade text-4xl md:text-5xl text-white mb-2 tracking-wider">{xp.toLocaleString()}</div>

                <div className="mb-6">
                  <div className="flex justify-between text-[10px] uppercase font-arcade text-gray-500 mb-2">
                    <span>PROGRESS_TO_NEXT_RANK</span>
                    {nextTier ? <span>{Math.floor(nextTier.minXP - xp)} XP REQ</span> : <span>MAX_RANK</span>}
                  </div>
                  <div className="w-full h-2 bg-[#222] border border-[#333]">
                    <div className="h-full bg-[#00B894] shadow-[0_0_10px_#00B894]" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-[10px] font-arcade">LIFETIME ACCUMULATION</span>
                </div>
              </div>
            </div>

            {/* 2. Wheel of Joy Widget */}
            <div className="relative p-1 arcade-card-3d bg-black border border-[#333]">
              {/* Decorative arcade bezel */}
              <div className="absolute inset-0 pointer-events-none border-4 border-[#111] z-20 shadow-inner"></div>

              <div className="flex flex-col md:flex-row items-center gap-8 p-8 relative z-10">
                <div className="flex-1 text-center md:text-left">
                  <h2 className="font-arcade text-2xl md:text-3xl text-white mb-2 text-3d-purple uppercase">Wheel of_Fortune</h2>
                  <p className="text-gray-400 mb-6 font-arcade text-xs leading-relaxed max-w-md">
                    Spin daily to acquire bonus credits, XP boosts, or rare artifacts.
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#111] p-3 border border-[#333] text-center">
                      <div className="text-xl font-arcade text-[#FFD400]">1%</div>
                      <div className="text-[8px] text-gray-500 font-arcade tracking-widest uppercase">CRITICAL_HIT</div>
                    </div>
                    <div className="bg-[#111] p-3 border border-[#333] text-center">
                      <div className="text-xl font-arcade text-[#00B894]">100%</div>
                      <div className="text-[8px] text-gray-500 font-arcade tracking-widest uppercase">ENTERTAINMENT</div>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  {/* Glow behind wheel */}
                  <div className="absolute inset-0 bg-[#6C5CE7]/20 blur-3xl rounded-full pointer-events-none"></div>
                  <WheelOfJoy />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Tier Benefits & Info */}
          <div className="space-y-6">
            {/* Current Tier Perk */}
            <div className={`p-8 arcade-card-3d bg-[#111] relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                <span className="font-arcade text-xs tracking-widest text-[#FFD400]">CURRENT_STATUS</span>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-[#222] text-[#FFD400] border border-[#FFD400]/30"><TrendingUp size={16} /></div>
                  <div>
                    <div className="font-arcade text-white text-xl">{tier.multiplier}x</div>
                    <div className="text-[10px] text-gray-500 uppercase font-arcade tracking-wider">REWARD_MULTIPLIER</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-[#222] text-[#FFD400] border border-[#FFD400]/30"><Gift size={16} /></div>
                  <div>
                    <div className="font-arcade text-white text-sm">{tier.perk}</div>
                    <div className="text-[10px] text-gray-500 uppercase font-arcade tracking-wider">ACTIVE_PERK</div>
                  </div>
                </div>
              </div>
            </div>

            {/* How it Works */}
            <div className="p-6 border border-[#333] bg-black">
              <h3 className="font-arcade text-xs tracking-widest mb-4 text-gray-400 border-b border-[#333] pb-2">ECONOMY_PROTOCOLS</h3>
              <ul className="space-y-4">
                <li className="flex gap-3 text-xs text-gray-300 font-sans">
                  <span className="text-[#FF8C00] font-arcade">&gt;&gt;</span>
                  <span><strong>CREDITS (JP)</strong> are spent on items and modules.</span>
                </li>
                <li className="flex gap-3 text-xs text-gray-300 font-sans">
                  <span className="text-[#00B894] font-arcade">&gt;&gt;</span>
                  <span><strong>XP</strong> determines your Clearance Level.</span>
                </li>
                <li className="flex gap-3 text-xs text-gray-300 font-sans">
                  <span className="text-[#FFD400] font-arcade">&gt;&gt;</span>
                  <span>Every ₹10 spend yields <strong>1 JP + 1 XP</strong>.</span>
                </li>
              </ul>
            </div>

            <div className="text-center mt-8">
              <p className="text-[10px] text-[#333] font-arcade tracking-[0.2em] uppercase">SYSTEM_ID: KAIZEN_V4</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
