'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { UserProfile } from '@/lib/types';
import { getTier, fetchTiersFromFirebase, fetchRewardsConfigFromFirebase, REWARDS as DEFAULT_REWARDS, STREAK_REWARDS, STREAK_FREEZE_COST, CONFIG, calculatePoints, calculatePointWorth, getMaxRedeemableAmount } from '@/lib/gamification';
import { doc, onSnapshot, updateDoc, increment, setDoc, getFirestore, getDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';

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

interface GamificationContextType {
  xp: number;
  balance: number;
  tier: Tier;
  nextTier: Tier | null;
  allTiers: Tier[];
  rewardsConfig: typeof DEFAULT_REWARDS;
  streak: {
    count: number;
    lastActiveDate: string | null;
    freezeCount: number;
    visual?: string;
  };
  dailyStats: {
    lastSpinDate: string | null;
    eggsFound: number;
  };
  loading: boolean;
  awardPoints: (amount: number, reason: string) => Promise<void>;
  spendPoints: (amount: number, reason: string) => Promise<boolean>;
  spinWheel: (prize: any) => Promise<void>;
  updateStreak: () => Promise<void>;
  buyStreakFreeze: () => Promise<boolean>;
  foundEasterEgg: () => Promise<boolean>;
  config: typeof CONFIG;
  calculatePoints: (price: number, isFirstTime?: boolean) => number;
  calculatePointWorth: (points: number) => number;
  getMaxRedeemableAmount: (totalPrice: number, userPoints: number) => number;
  hasEarlyEventAccess: boolean;
  workshopDiscountPercent: number;
  hasVIPSeating: boolean;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export function GamificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // State
  const [xp, setXp] = useState(0);
  const [balance, setBalance] = useState(0);
  const [allTiers, setAllTiers] = useState<Tier[]>([]);
  const [rewardsConfig, setRewardsConfig] = useState(DEFAULT_REWARDS);
  const [streak, setStreak] = useState({ count: 0, lastActiveDate: null as string | null, freezeCount: 0 });
  const [dailyStats, setDailyStats] = useState({ lastSpinDate: null as string | null, eggsFound: 0 });

  const db = getFirestore(app);

  // Load tiers and rewards from Firebase on mount
  useEffect(() => {
    const loadConfigs = async () => {
      const [tiers, fetchedRewards] = await Promise.all([
        fetchTiersFromFirebase(),
        fetchRewardsConfigFromFirebase()
      ]);
      setAllTiers(tiers);
      if (fetchedRewards) setRewardsConfig(fetchedRewards);
    };
    loadConfigs();
  }, []);

  useEffect(() => {
    if (!user) {
      setXp(0);
      setBalance(0);
      setStreak({ count: 0, lastActiveDate: null, freezeCount: 0 });
      setLoading(false);
      return;
    }

    const userRef = doc(db, 'users', user.uid);

    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;

        // Sync State from DB
        setXp(data.xp || 0);
        // Prioritize 'points' field as primary balance source
        setBalance(data.points || data.balance || data.wallet || 0);

        setStreak({
          count: data.streak?.count || 0,
          lastActiveDate: data.streak?.last_active_date || null,
          freezeCount: data.streak?.freeze_count || 0
        });

        // Reset daily stats if it's a new day (client-side check for UI consistency, real daily limits should be server enforced or strictly time-checked)
        const today = new Date().toISOString().split('T')[0];
        const lastEggDate = data.daily_stats?.last_egg_date;

        setDailyStats({
          lastSpinDate: data.daily_stats?.last_spin_date || null,
          eggsFound: lastEggDate === today ? (data.daily_stats?.eggs_found || 0) : 0
        });

      } else {
        // Init profile if missing
        setDoc(userRef, {
          xp: 0,
          points: 0,
          streak: { count: 0, last_active_date: null, freeze_count: 0 },
          daily_stats: { eggs_found: 0 }
        }, { merge: true }).catch(err => {
          console.error("Error initializing user profile:", err);
        });
      }
      setLoading(false);
    }, (error) => {
      console.error("Firestore listener error:", error);
      // Fallback: Try one-time fetch instead of real-time listener
      import('firebase/firestore').then(({ getDoc }) => {
        getDoc(userRef).then(docSnap => {
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            setXp(data.xp || 0);
            setBalance(data.points || data.balance || data.wallet || 0);
            setStreak({
              count: data.streak?.count || 0,
              lastActiveDate: data.streak?.last_active_date || null,
              freezeCount: data.streak?.freeze_count || 0
            });
            const today = new Date().toISOString().split('T')[0];
            const lastEggDate = data.daily_stats?.last_egg_date;
            setDailyStats({
              lastSpinDate: data.daily_stats?.last_spin_date || null,
              eggsFound: lastEggDate === today ? (data.daily_stats?.eggs_found || 0) : 0
            });
          }
          setLoading(false);
        }).catch(err => {
          console.error("Fallback fetch failed:", err);
          setLoading(false);
        });
      });
    });

    return () => unsubscribe();
  }, [user]);

  // Derived State - Use Firebase tiers
  const tier = allTiers.length > 0 ? getTier(xp, allTiers) : { name: 'Newbie', minXP: 0, multiplier: 1.0, badge: 'Grey Meeple', perk: 'None', color: 'text-slate-400', icon: '♟️' };
  const nextTierIndex = allTiers.findIndex(t => t.name === tier.name) + 1;
  const nextTier = nextTierIndex < allTiers.length ? allTiers[nextTierIndex] : null;

  // Tier Perks - Dynamic based on loaded tiers
  const hasEarlyEventAccess = allTiers.length > 1 ? xp >= allTiers[1].minXP : xp >= 500;
  const workshopDiscountPercent = allTiers.length > 2 && xp >= allTiers[2].minXP ? 5 : 0;
  const hasVIPSeating = allTiers.length > 3 && xp >= allTiers[3].minXP;

  /**
   * Automatic Streak Update
   * Check and update streak when user visits (loads context)
   */
  useEffect(() => {
    if (user && !loading) {
      const today = new Date().toISOString().split('T')[0];
      // Only attempt update if local state shows it's not updated yet
      // updateStreak() has internal checks strictly against DB/logic too
      if (streak.lastActiveDate !== today) {
        updateStreak().catch(err => console.error("Auto-streak update failed:", err));
      }
    }
  }, [user, loading, streak.lastActiveDate]);

  // Actions
  const awardPoints = async (amount: number, reason: string) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);

    // Apply Tier Multiplier to JP only (Logic: XP is raw, JP gets multiplied)
    // "Rule: Every action awards both JP and XP equally" - but modified by multiplier for JP
    const jpEarned = Math.round(amount * tier.multiplier);

    await updateDoc(userRef, {
      xp: increment(amount),
      points: increment(jpEarned),
      history: increment(1) // Just a placeholder, ideally push to array
    });

    // Log transaction (separate collection ideally)
  };

  const spendPoints = async (amount: number, reason: string) => {
    if (!user || balance < amount) return false;
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      points: increment(-amount)
    });
    return true;
  };

  const updateStreak = async () => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];

    if (streak.lastActiveDate === today) return; // Already acted today

    const userRef = doc(db, 'users', user.uid);

    // Check if yesterday was active
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newCount = 1;
    if (streak.lastActiveDate === yesterdayStr) {
      newCount = streak.count + 1;
    } else if (streak.lastActiveDate && streak.lastActiveDate !== yesterdayStr && streak.freezeCount > 0) {
      // Used a freeze
      await updateDoc(userRef, {
        'streak.freeze_count': increment(-1),
        'streak.last_active_date': today,
        // Count continues? Typically streak freezes keep the count.
        // But if we missed a day, and use a freeze now... 
        // Simplified: To save a streak, you must have a freeze when you MISS the day. 
        // Logic: If missed > 1 day, reset. If missed 1 day and have freeze, consume freeze and continue.
      });
      // Logic needs to be more robust for "auto-freeze" on login. 
      // For now, simple increment if consecutive.
      newCount = 1; // Reset if broken without auto-freeze logic implemented yet
    }

    // Simple Streak Logic for MVP: 
    // If last active was yesterday, increment. Else reset to 1.
    if (streak.lastActiveDate === yesterdayStr) {
      newCount = streak.count + 1;
    }

    await updateDoc(userRef, {
      'streak.count': newCount,
      'streak.last_active_date': today
    });
  };

  const buyStreakFreeze = async () => {
    if (await spendPoints(STREAK_FREEZE_COST, 'Streak Freeze')) {
      const userRef = doc(db, 'users', user!.uid);
      await updateDoc(userRef, {
        'streak.freeze_count': increment(1)
      });
      return true;
    }
    return false;
  }

  const spinWheel = async (prize: any) => {
    // Prize logic is handled by caller (deterministically or random), this just commits the result
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const userRef = doc(db, 'users', user.uid);

    const updates: any = {
      'daily_stats.last_spin_date': today
    };

    if (prize.type === 'JP' || prize.type === 'JACKPOT') {
      updates.points = increment(Number(prize.value));
    } else if (prize.type === 'XP') {
      updates.xp = increment(Number(prize.value));
    }

    await updateDoc(userRef, updates);
  }

  const foundEasterEgg = async () => {
    if (!user) return false;
    const today = new Date().toISOString().split('T')[0];

    if (dailyStats.eggsFound >= 3) return false;

    const reward = Math.floor(Math.random() * (15 - 5 + 1)) + 5; // 5-15 JP

    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      'daily_stats.eggs_found': increment(1),
      'daily_stats.last_egg_date': today,
      points: increment(reward)
    });

    return true;
  }

  return (
    <GamificationContext.Provider value={{
      xp, balance, tier, nextTier, allTiers, rewardsConfig, streak, dailyStats, loading,
      awardPoints, spendPoints, spinWheel, updateStreak, buyStreakFreeze, foundEasterEgg,
      config: CONFIG, calculatePoints, calculatePointWorth, getMaxRedeemableAmount,
      hasEarlyEventAccess, workshopDiscountPercent, hasVIPSeating
    }}>
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
}
