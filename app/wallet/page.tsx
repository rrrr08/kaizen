'use client';

import { useState, useEffect } from 'react';

import { useGamification } from '@/app/context/GamificationContext';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import {
  Wallet as WalletIcon,
  TrendingUp,
  Gift,
  Zap,
  Crown,
  ArrowLeft,
  Flame,
  Snowflake,
  Coins,
  ShoppingCart,
  Gamepad2,
  Target,
  Trophy,
  ArrowRight,
  Info,
  History,
  Loader2,
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import LevelBadge from '@/components/gamification/LevelBadge';

export const dynamic = 'force-dynamic';

export default function WalletPage() {
  const { xp, balance, tier, nextTier, loading, streak, buyStreakFreeze, config, history, fetchHistory, hasMoreHistory, historyLoading } = useGamification();
  const { user } = useAuth();
  const [showHistory, setShowHistory] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const handleSyncHistory = async () => {
    if (!user || syncing) return;
    setSyncing(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/debug/backfill-history', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        // Refresh history
        fetchHistory();
      }
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (showHistory && history.length === 0) {
      fetchHistory();
    }
  }, [showHistory]);

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-[#FFFDF5]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-black border-t-[#FFD93D] rounded-full animate-spin"></div>
          <p className="font-header tracking-widest text-lg text-charcoal">SYNCING VAULT...</p>
        </div>
      </div>
    );
  }

  const progress = nextTier
    ? Math.min(100, Math.max(0, ((xp - tier.minXP) / (nextTier.minXP - tier.minXP)) * 100))
    : 100;

  return (
    <div className="min-h-screen pt-28 pb-20 bg-[#FFFDF5] text-[#2D3436] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-40 -left-20 w-80 h-80 bg-[#FFD93D]/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-40 -right-20 w-80 h-80 bg-[#6C5CE7]/10 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-6xl mx-auto px-6 md:px-12 relative z-10">
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link href="/shop" className="font-header text-[10px] tracking-[0.2em] text-[#2D3436]/40 hover:text-[#6C5CE7] mb-6 inline-flex items-center gap-2 transition-colors uppercase font-black">
              <ArrowLeft size={14} /> Back to Repository
            </Link>
            <h1 className="font-display text-6xl md:text-7xl font-black mb-2 tracking-tighter uppercase leading-none">The Vault</h1>
            <p className="text-xl text-[#2D3436]/60 font-bold max-w-md">Track your progress, manage your currency, and master the playground economy.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-6 bg-white border-2 border-black p-4 rounded-[25px] neo-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#FF7675] border-2 border-black rounded-xl flex items-center justify-center shadow-[3px_3px_0px_#000]">
                <Flame size={24} className="text-white" fill="white" />
              </div>
              <div>
                <div className="font-black text-[10px] tracking-widest text-[#2D3436]/40 uppercase">Daily Streak</div>
                <div className="text-xl font-black text-black">
                  {streak.count} <span className="text-xs text-[#2D3436]/60">DAYS</span>
                </div>
              </div>
            </div>
            <div className="h-10 w-[2px] bg-black/10"></div>
            <div className="flex flex-col items-end">
              {streak.freezeCount > 0 ? (
                <div className="flex items-center gap-2 px-3 py-1 bg-[#6C5CE7]/10 text-[#6C5CE7] rounded-full text-[10px] font-black border-2 border-[#6C5CE7]">
                  <Snowflake size={12} /> {streak.freezeCount} FREEZE ACTIVE
                </div>
              ) : (
                <button
                  onClick={buyStreakFreeze}
                  className="flex items-center gap-2 px-3 py-1 bg-black text-white rounded-full text-[10px] font-black hover:bg-[#6C5CE7] transition-colors border-2 border-black"
                >
                  <Snowflake size={12} /> BUY FREEZE (200 JP)
                </button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Currency Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Joy Points Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="group relative"
          >
            <div className="absolute inset-0 bg-black rounded-[40px] translate-x-3 translate-y-3 -z-10 transition-transform group-hover:translate-x-4 group-hover:translate-y-4"></div>
            <div className="p-10 rounded-[40px] bg-[#FFD93D] border-3 border-black overflow-hidden relative">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-black/5 rounded-full blur-2xl"></div>

              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_rgba(255,255,255,0.2)]">
                    <Coins className="w-8 h-8 text-[#FFD93D]" />
                  </div>
                  <div>
                    <h2 className="font-black text-xs tracking-[0.3em] text-black/60 uppercase">Joy Points</h2>
                    <p className="font-display text-4xl font-black text-black uppercase">Capital</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-black text-black leading-none">{balance.toLocaleString()}</div>
                  <div className="text-xs font-black text-black/40 mt-1 uppercase tracking-widest">Available JP</div>
                </div>
              </div>

              <div className="space-y-4 mb-10 text-black/80 font-bold text-lg leading-snug">
                <p>Spendable currency for discounts, rewards, and exclusive items.</p>
                <div className="flex items-center gap-2 text-sm bg-black/5 p-3 rounded-xl border border-black/10">
                  <Zap size={16} className="text-[#6C5CE7]" />
                  <span>100 JP = ₹{config.redeemRate * 100} discount at checkout</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link href="/shop" className="px-8 py-4 bg-black text-white font-black text-sm tracking-widest uppercase rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[6px_6px_0px_rgba(0,0,0,0.2)]">
                  Visit Shop
                </Link>
                <Link href="/rewards" className="px-8 py-4 bg-white text-black border-2 border-black font-black text-sm tracking-widest uppercase rounded-2xl hover:bg-[#6C5CE7] hover:text-white transition-all">
                  Redeem Store
                </Link>
              </div>
            </div>
          </motion.div>

          {/* XP Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="group relative"
          >
            <div className="absolute inset-0 bg-[#6C5CE7] rounded-[40px] translate-x-3 translate-y-3 -z-10 transition-transform group-hover:translate-x-4 group-hover:translate-y-4"></div>
            <div className="p-10 rounded-[40px] bg-white border-3 border-black overflow-hidden relative h-full">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#6C5CE7] border-2 border-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_#000]">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="font-black text-xs tracking-[0.3em] text-[#6C5CE7] uppercase">Experience</h2>
                    <p className="font-display text-4xl font-black text-black uppercase">Status</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-black text-black leading-none">{xp.toLocaleString()}</div>
                  <div className="text-xs font-black text-black/40 mt-1 uppercase tracking-widest">Lifetime XP</div>
                </div>
              </div>

              {/* Progress Section */}
              <div className="mb-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <LevelBadge size="sm" />
                    <span className="font-black text-black font-display uppercase text-xl">{tier.name}</span>
                  </div>
                  {nextTier && (
                    <span className="text-xs font-black text-black/40 uppercase tracking-widest">
                      {Math.floor(nextTier.minXP - xp)} XP to {nextTier.name}
                    </span>
                  )}
                </div>

                {nextTier ? (
                  <div className="relative h-6 bg-[#F5F5F5] border-3 border-black rounded-full overflow-hidden shadow-[inner_0px_2px_4px_rgba(0,0,0,0.1)]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="absolute inset-y-0 left-0 bg-[#00B894] border-r-2 border-black"
                    ></motion.div>
                  </div>
                ) : (
                  <div className="py-2 px-4 bg-[#00B894] text-white font-black rounded-xl text-center border-2 border-black shadow-[4px_4px_0px_#000] uppercase tracking-widest text-sm">
                    Ultimate Rank Achieved
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[#F5F5F5] border-2 border-black rounded-2xl">
                  <div className="text-lg font-black text-black uppercase">{tier.multiplier}x</div>
                  <div className="text-[10px] uppercase font-bold text-black/40">JP Multiplier</div>
                </div>
                <div className="p-4 bg-[#F5F5F5] border-2 border-black rounded-2xl">
                  <div className="text-sm font-black text-black truncate">{tier.perk}</div>
                  <div className="text-[10px] uppercase font-bold text-black/40">Tier Benefit</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Transaction History Section */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8 cursor-pointer group" onClick={() => setShowHistory(!showHistory)}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,0.1)] group-hover:rotate-12 transition-transform">
                <History size={20} />
              </div>
              <h2 className="font-display text-4xl font-black uppercase tracking-tighter">Transaction Ledger</h2>
            </div>
            <motion.div
              animate={{ rotate: showHistory ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown size={32} />
            </motion.div>
          </div>

          <div className="flex justify-end mb-4 px-2">
            <button
              onClick={handleSyncHistory}
              disabled={syncing}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#2D3436]/40 hover:text-[#6C5CE7] transition-colors disabled:opacity-50"
            >
              <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
              {syncing ? 'Syncing...' : 'Sync Missing History'}
            </button>
          </div>

          <motion.div
            initial={false}
            animate={{ height: showHistory ? 'auto' : 0, opacity: showHistory ? 1 : 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white border-3 border-black rounded-[35px] neo-shadow p-6 md:p-8">
              {historyLoading && history.length === 0 ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="animate-spin text-black" size={32} />
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-12 text-black/40 font-bold uppercase tracking-widest">
                  No transactions recorded yet
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 bg-[#F9F9F9] border-2 border-black/5 rounded-2xl md:hover:scale-[1.01] transition-transform">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 border-black font-black text-lg ${tx.type === 'EARN' ? 'bg-[#55EFC4] text-[#00B894]' : 'bg-[#fab1a0] text-[#d63031]'
                          }`}>
                          {tx.type === 'EARN' ? '+' : '-'}
                        </div>
                        <div>
                          <p className="font-black text-black text-lg leading-none mb-1">{tx.description}</p>
                          <div className="flex items-center gap-2 text-xs font-bold text-black/40 uppercase tracking-wider">
                            <span>{tx.source}</span>
                            <span>•</span>
                            <span>{tx.timestamp?.seconds ? new Date(tx.timestamp.seconds * 1000).toLocaleDateString() : 'Just now'}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`font-display text-2xl font-black ${tx.type === 'EARN' ? 'text-[#00B894]' : 'text-[#d63031]'
                        }`}>
                        {tx.type === 'EARN' ? '+' : '-'}{tx.amount}
                      </div>
                    </div>
                  ))}

                  {hasMoreHistory && (
                    <button
                      onClick={() => fetchHistory(history[history.length - 1] as any)}
                      disabled={historyLoading}
                      className="w-full py-4 mt-4 bg-black text-white font-black uppercase tracking-widest rounded-xl hover:bg-black/80 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {historyLoading && <Loader2 className="animate-spin" size={20} />}
                      {historyLoading ? 'Loading...' : 'Load More Records'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Economy Guide Section */}
        <div className="mb-20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
            <h2 className="font-display text-4xl md:text-5xl font-black uppercase tracking-tighter">Economy Mastery</h2>
            <div className="h-[2px] flex-1 bg-black/5 mx-6 hidden md:block"></div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 border-2 border-black rounded-full neo-shadow text-xs font-black uppercase">
              <Info size={14} className="text-[#6C5CE7]" /> How it works
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Column 1: Earn */}
            <motion.div
              whileHover={{ y: -5 }}
              className="p-8 bg-white border-3 border-black rounded-[35px] neo-shadow group"
            >
              <div className="w-12 h-12 bg-[#55EFC4] border-2 border-black rounded-xl flex items-center justify-center mb-6 shadow-[4px_4px_0px_#000] rotate-[-5deg] group-hover:rotate-0 transition-transform">
                <Target size={24} className="text-black" />
              </div>
              <h3 className="font-display text-2xl font-black mb-4 uppercase">Ways to Earn</h3>
              <ul className="space-y-4 font-bold text-sm text-black/70">
                <li className="flex items-start gap-3">
                  <ShoppingCart size={18} className="text-[#00B894] mt-0.5 shrink-0" />
                  <span>Shop Purchase: Earn 1 JP & 1 XP for every ₹10 spent.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Gamepad2 size={18} className="text-[#00B894] mt-0.5 shrink-0" />
                  <span>Play Games: Win challenges to earn massive point bundles.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Flame size={18} className="text-[#00B894] mt-0.5 shrink-0" />
                  <span>Streaks: Daily visits multiply your earning potential.</span>
                </li>
              </ul>
            </motion.div>

            {/* Column 2: Status */}
            <motion.div
              whileHover={{ y: -5 }}
              className="p-8 bg-white border-3 border-black rounded-[35px] neo-shadow group"
            >
              <div className="w-12 h-12 bg-[#A29BFE] border-2 border-black rounded-xl flex items-center justify-center mb-6 shadow-[4px_4px_0px_#000] rotate-[5deg] group-hover:rotate-0 transition-transform">
                <Trophy size={24} className="text-black" />
              </div>
              <h3 className="font-display text-2xl font-black mb-4 uppercase">Unlock Perks</h3>
              <ul className="space-y-4 font-bold text-sm text-black/70">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-[#FFD93D] rounded-full flex items-center justify-center text-[10px] text-black shrink-0">1</span>
                  <span><strong>Player:</strong> Get early access to event ticket sales.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-[#FFD93D] rounded-full flex items-center justify-center text-[10px] text-black shrink-0">2</span>
                  <span><strong>Strategist:</strong> Automatic 5% discount on all workshops.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-[#FFD93D] rounded-full flex items-center justify-center text-[10px] text-black shrink-0">3</span>
                  <span><strong>Grandmaster:</strong> Exclusive VIP seating & 1.5x earnings.</span>
                </li>
              </ul>
            </motion.div>

            {/* Column 3: Spend */}
            <motion.div
              whileHover={{ y: -5 }}
              className="p-8 bg-white border-3 border-black rounded-[35px] neo-shadow group"
            >
              <div className="w-12 h-12 bg-[#FF7675] border-2 border-black rounded-xl flex items-center justify-center mb-6 shadow-[4px_4px_0px_#000] rotate-[-5deg] group-hover:rotate-0 transition-transform">
                <Gift size={24} className="text-black" />
              </div>
              <h3 className="font-display text-2xl font-black mb-4 uppercase">Ways to Spend</h3>
              <ul className="space-y-4 font-bold text-sm text-black/70">
                <li className="flex items-start gap-3">
                  <ArrowRight size={18} className="text-[#FF7675] mt-0.5 shrink-0" />
                  <span>Redeem JP at checkout for direct discounts on games and gear.</span>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight size={18} className="text-[#FF7675] mt-0.5 shrink-0" />
                  <span>Unlock exclusive physical badges and brand collectibles.</span>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight size={18} className="text-[#FF7675] mt-0.5 shrink-0" />
                  <span>Protect your streak by purchasing Streak Freezes from the vault.</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-black text-white p-12 rounded-[50px] flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#6C5CE7] blur-[100px] -z-10 opacity-30"></div>
          <div className="relative z-10 max-w-xl text-center md:text-left">
            <h2 className="font-display text-4xl md:text-5xl font-black mb-4 uppercase leading-none">Ready to upgrade your inventory?</h2>
            <p className="text-lg text-white/60 font-medium">Head to the shop to find the next challenge and earn status-defining XP.</p>
          </div>
          <Link href="/shop" className="group relative z-10">
            <div className="absolute inset-0 bg-[#FFD93D] rounded-2xl translate-x-1 translate-y-1"></div>
            <div className="px-10 py-5 bg-white text-black font-black uppercase tracking-widest text-sm rounded-2xl border-2 border-black group-hover:-translate-x-1 group-hover:-translate-y-1 transition-transform relative flex items-center gap-3">
              Browse Repository <ArrowRight size={18} />
            </div>
          </Link>
        </motion.div>



        <div className="mt-16 text-center">
          <p className="text-[10px] text-black/20 font-black tracking-[0.5em] uppercase">Joy Juncture Vault System v2.0</p>
        </div>
      </div>
    </div>
  );
}
