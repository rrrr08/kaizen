'use client';

import { useGamification } from '@/app/context/GamificationContext';
import { useAuth } from '@/app/context/AuthContext';
import { usePopup } from '@/app/context/PopupContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { TrendingUp, Zap, Trophy, Star, Lock, Unlock } from 'lucide-react';

interface Tier {
  name: string;
  minXP: number;
  multiplier: number;
  badge: string;
  perk: string;
  color: string;
  icon: string;
  unlockPrice?: number;
}

export default function ProgressPage() {
  const { user } = useAuth();
  const { xp, balance, tier, nextTier, loading } = useGamification();
  const { showAlert, showConfirm } = usePopup();
  const router = useRouter();
  const [allTiers, setAllTiers] = useState<Tier[]>([]);
  const [loadingTiers, setLoadingTiers] = useState(true);
  const db = getFirestore(app);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
  }, [user, loading, router]);

  useEffect(() => {
    loadTiers();
  }, []);

  const loadTiers = async () => {
    try {
      const settingsRef = doc(db, 'settings', 'xpSystem');
      const snap = await getDoc(settingsRef);
      
      if (snap.exists()) {
        setAllTiers(snap.data().tiers || getDefaultTiers());
      } else {
        setAllTiers(getDefaultTiers());
      }
    } catch (error) {
      console.error('Error loading tiers:', error);
      setAllTiers(getDefaultTiers());
    } finally {
      setLoadingTiers(false);
    }
  };

  const getDefaultTiers = (): Tier[] => [
    { name: 'Newbie', minXP: 0, multiplier: 1.0, badge: 'Grey Meeple', perk: 'None', color: '#94a3b8', icon: '♟️', unlockPrice: 0 },
    { name: 'Player', minXP: 500, multiplier: 1.1, badge: 'Green Pawn', perk: 'Early access to Event Tickets', color: '#34d399', icon: '♟️', unlockPrice: 2000 },
    { name: 'Strategist', minXP: 2000, multiplier: 1.25, badge: 'Blue Rook', perk: '5% off all Workshops', color: '#60a5fa', icon: '♜', unlockPrice: 5000 },
    { name: 'Grandmaster', minXP: 5000, multiplier: 1.5, badge: 'Gold Crown', perk: 'VIP Seating at Game Nights', color: '#fbbf24', icon: '👑', unlockPrice: 10000 }
  ];

  const handleUnlockTier = async (tierToUnlock: Tier) => {
    if (!tierToUnlock.unlockPrice || tierToUnlock.unlockPrice === 0) {
      await showAlert('This tier cannot be purchased. Earn XP to unlock it!', 'info');
      return;
    }

    if (balance < tierToUnlock.unlockPrice) {
      await showAlert(`You need ${tierToUnlock.unlockPrice.toLocaleString()} JP to unlock this tier. You have ${balance.toLocaleString()} JP.`, 'warning');
      return;
    }

    const confirmed = await showConfirm(`Unlock ${tierToUnlock.name} tier for ${tierToUnlock.unlockPrice.toLocaleString()} JP? This will instantly grant you ${tierToUnlock.minXP} XP.`, 'Unlock Tier');
    if (!confirmed) {
      return;
    }

    try {
      const auth = await import('firebase/auth').then(m => m.getAuth(app));
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const response = await fetch('/api/user/unlock-tier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tierName: tierToUnlock.name,
          price: tierToUnlock.unlockPrice,
          xpGrant: tierToUnlock.minXP
        })
      });

      const data = await response.json();
      
      if (data.success) {
        await showAlert(`🎉 ${tierToUnlock.name} tier unlocked! You now have ${tierToUnlock.minXP} XP!`, 'success');
        window.location.reload();
      } else {
        await showAlert(`Failed to unlock tier: ${data.error}`, 'error');
      }
    } catch (error) {
      console.error('Error unlocking tier:', error);
      await showAlert('Failed to unlock tier. Please try again.', 'error');
    }
  };

  if (loading || loadingTiers) {
    return (
      <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-[#FFD93D] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black font-black text-xl uppercase tracking-wider">Loading Progress...</p>
        </div>
      </div>
    );
  }

  const currentTierIndex = allTiers.findIndex(t => t.name === tier.name);
  const xpToNext = nextTier ? nextTier.minXP - xp : 0;
  const progressPercent = nextTier 
    ? ((xp - tier.minXP) / (nextTier.minXP - tier.minXP)) * 100 
    : 100;

  return (
    <div className="min-h-screen bg-[#FFFDF5] pt-28 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-header text-6xl md:text-7xl font-black text-black mb-4 tracking-tight">
            YOUR JOURNEY
          </h1>
          <p className="text-xl text-black/60 font-bold uppercase tracking-wider">Track Progress • Unlock Rewards</p>
        </motion.div>

        {/* Current Status Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#FFD93D] border-4 border-black rounded-3xl p-8 mb-8 neo-shadow-lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Current Tier */}
            <div className="text-center">
              <div className="text-7xl mb-3">{tier.icon}</div>
              <div className="font-header text-4xl font-black text-black mb-2">{tier.name}</div>
              <div className="text-sm font-bold text-black/70 mb-3">{tier.badge}</div>
              <div className="inline-block px-4 py-2 bg-black text-[#FFD93D] font-black text-sm rounded-xl border-2 border-black">
                {tier.multiplier}x MULTIPLIER
              </div>
            </div>
            
            {/* XP Stats */}
            <div className="text-center border-l-4 border-r-4 border-black/20 px-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-black uppercase tracking-wider text-black/60">Experience</span>
              </div>
              <div className="font-header text-6xl font-black text-black mb-2">{xp.toLocaleString()}</div>
              <div className="text-sm font-bold text-black/70">XP</div>
            </div>
            
            {/* JP Balance */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-[#6C5CE7]" />
                <span className="text-sm font-black uppercase tracking-wider text-black/60">Joy Points</span>
              </div>
              <div className="font-header text-6xl font-black text-[#6C5CE7] mb-2">{balance.toLocaleString()}</div>
              <div className="text-sm font-bold text-black/70">JP</div>
            </div>
          </div>

          {/* Progress to Next Tier */}
          {nextTier && (
            <div className="mt-8 pt-8 border-t-4 border-black/20">
              <div className="flex justify-between items-center mb-3">
                <span className="font-black text-black uppercase tracking-wider">Next: {nextTier.name}</span>
                <span className="font-bold text-black/70">{xpToNext.toLocaleString()} XP to go</span>
              </div>
              <div className="w-full h-6 bg-white border-4 border-black rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progressPercent, 100)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-[#6C5CE7] relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                </motion.div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Tier Roadmap */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border-4 border-black rounded-3xl p-8 mb-8 neo-shadow"
        >
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-8 h-8" />
            <h2 className="font-header text-4xl font-black text-black">TIER ROADMAP</h2>
          </div>
          
          <div className="space-y-4">
            {allTiers.map((t, index) => {
              const isUnlocked = xp >= t.minXP;
              const isCurrent = t.name === tier.name;
              
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`relative rounded-2xl p-6 border-4 border-black transition-all ${
                    isCurrent 
                      ? 'bg-[#FFD93D] neo-shadow scale-105' 
                      : isUnlocked
                      ? 'bg-[#00B894]/20'
                      : 'bg-gray-100 opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-6">
                    {/* Icon */}
                    <div className="text-6xl">{t.icon}</div>
                    
                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-header text-3xl font-black text-black">{t.name}</h3>
                        {isCurrent && (
                          <span className="px-3 py-1 bg-black text-[#FFD93D] text-xs font-black rounded-full uppercase">
                            CURRENT
                          </span>
                        )}
                        {isUnlocked && !isCurrent && (
                          <span className="px-3 py-1 bg-[#00B894] text-white text-xs font-black rounded-full uppercase flex items-center gap-1">
                            <Unlock className="w-3 h-3" /> UNLOCKED
                          </span>
                        )}
                        {!isUnlocked && (
                          <span className="px-3 py-1 bg-gray-400 text-white text-xs font-black rounded-full uppercase flex items-center gap-1">
                            <Lock className="w-3 h-3" /> LOCKED
                          </span>
                        )}
                      </div>
                      <div className="text-black/70 font-bold mb-2">{t.badge}</div>
                      <div className="flex items-center gap-4 text-sm font-bold">
                        <span className="px-3 py-1 bg-[#6C5CE7] text-white rounded-lg">{t.multiplier}x Multiplier</span>
                        <span className="text-black/60">{t.minXP.toLocaleString()} XP Required</span>
                      </div>
                    </div>
                    
                    {/* Perk & Action */}
                    <div className="text-right min-w-[200px]">
                      <div className="text-xs font-black uppercase tracking-wider text-black/40 mb-1">Perk</div>
                      <div className="text-black font-bold mb-3">{t.perk}</div>
                      
                      {!isUnlocked && t.unlockPrice && t.unlockPrice > 0 && (
                        <button
                          onClick={() => handleUnlockTier(t)}
                          className="px-4 py-2 bg-[#6C5CE7] hover:bg-[#5f4fd1] text-white font-black rounded-xl border-2 border-black neo-shadow-hover transition-all uppercase text-sm"
                        >
                          Unlock {t.unlockPrice.toLocaleString()} JP
                        </button>
                      )}
                      
                      {!isUnlocked && (!t.unlockPrice || t.unlockPrice === 0) && (
                        <div className="text-sm text-black/40 italic font-bold">Earn XP to unlock</div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* How to Earn XP */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white border-4 border-black rounded-3xl p-8 neo-shadow"
        >
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-8 h-8 text-[#FFD93D]" />
            <h2 className="font-header text-4xl font-black text-black">HOW TO EARN XP & JP</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: '🎮', title: 'Play Games', desc: 'Complete daily games to earn XP and JP with your tier multiplier', color: '#6C5CE7' },
              { icon: '🛍️', title: 'Shop Purchases', desc: 'Earn XP for every purchase you make in the shop', color: '#FFD93D' },
              { icon: '🎪', title: 'Event Registration', desc: 'Register for events and workshops to gain bonus XP', color: '#00B894' },
              { icon: '🎡', title: 'Wheel of Joy', desc: 'Spin the wheel daily for chances to win XP and JP', color: '#FF6B6B' }
            ].map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + (0.1 * index) }}
                className="bg-[#FFFDF5] border-4 border-black rounded-2xl p-6 neo-shadow-hover transition-all"
              >
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-header text-2xl font-black text-black mb-2">{item.title}</h3>
                <p className="text-black/70 font-bold">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
