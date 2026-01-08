'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { UserProfile } from '@/lib/types';
import { getTier, fetchTiersFromFirebase, fetchRewardsConfigFromFirebase, REWARDS as DEFAULT_REWARDS, STREAK_REWARDS, STREAK_FREEZE_COST, CONFIG, calculatePoints, calculatePointWorth, getMaxRedeemableAmount, logTransaction } from '@/lib/gamification';
import { doc, onSnapshot, updateDoc, increment, setDoc, getFirestore, getDoc, collection, query, orderBy, limit, startAfter, getDocs, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { app } from '@/lib/firebase';

export interface Transaction {
  id: string;
  type: 'EARN' | 'SPEND';
  amount: number;
  source: string;
  description: string;
  timestamp: any;
  metadata?: any;
}

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
  game_xp: number;
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
  awardPoints: (amount: number, reason: string, isGameXP?: boolean) => Promise<void>;
  spendPoints: (amount: number, reason: string) => Promise<boolean>;
  spinWheel: (prize: any) => Promise<void>;
  updateStreak: () => Promise<void>;
  buyStreakFreeze: () => Promise<boolean>;
  foundEasterEgg: () => Promise<boolean>;
  config: typeof CONFIG;
  calculatePoints: (price: number, isFirstTime?: boolean) => number;
  calculatePointWorth: (points: number) => number;
  getMaxRedeemableAmount: (totalPrice: number, userPoints: number) => number;
  awardEventAttendancePoints: (eventId: string, eventName: string) => Promise<void>;
  hasEarlyEventAccess: boolean;
  workshopDiscountPercent: number;
  hasVIPSeating: boolean;
  history: Transaction[];
  fetchHistory: (lastDoc?: QueryDocumentSnapshot<DocumentData>) => Promise<void>;
  hasMoreHistory: boolean;
  historyLoading: boolean;
  refreshConfigs: () => Promise<void>;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export function GamificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // State
  const [xp, setXp] = useState(0);
  const [game_xp, setGameXp] = useState(0);
  const [balance, setBalance] = useState(0);
  const [allTiers, setAllTiers] = useState<Tier[]>([]);
  const [rewardsConfig, setRewardsConfig] = useState(DEFAULT_REWARDS);
  const [streak, setStreak] = useState({ count: 0, lastActiveDate: null as string | null, freezeCount: 0 });
  const [dailyStats, setDailyStats] = useState({ lastSpinDate: null as string | null, eggsFound: 0 });
  const [storeConfig, setStoreConfig] = useState(CONFIG);

  // History State
  const [history, setHistory] = useState<Transaction[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const [lastHistoryDoc, setLastHistoryDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);

  const db = getFirestore(app);

  // Load tiers and rewards from Firebase on mount
  useEffect(() => {
    const loadConfigs = async () => {
      const { fetchStoreSettingsFromFirebase, fetchTiersFromFirebase, fetchRewardsConfigFromFirebase } = await import('@/lib/gamification');
      const [tiers, fetchedRewards, storeSettings] = await Promise.all([
        fetchTiersFromFirebase(),
        fetchRewardsConfigFromFirebase(),
        fetchStoreSettingsFromFirebase()
      ]);
      setAllTiers(tiers);
      if (fetchedRewards) setRewardsConfig(fetchedRewards);

      if (storeSettings) {
        // Apply store settings to local config/rewards if they match
        if (storeSettings.pointsPerRupee !== undefined) {
          setRewardsConfig(prev => ({
            ...prev,
            SHOP: {
              ...prev.SHOP,
              POINTS_PER_RUPEE: storeSettings.pointsPerRupee
            }
          }));
        }

        if (storeSettings.redeemRate !== undefined || storeSettings.maxRedeemPercent !== undefined) {
          setStoreConfig(prev => ({
            ...prev,
            redeemRate: storeSettings.redeemRate ?? prev.redeemRate,
            maxRedeemPercent: storeSettings.maxRedeemPercent ?? prev.maxRedeemPercent
          }));
        }
      }
    };

    loadConfigs();
  }, []);

  const refreshConfigs = async () => {
    const { fetchStoreSettingsFromFirebase, fetchTiersFromFirebase, fetchRewardsConfigFromFirebase } = await import('@/lib/gamification');
    const [tiers, fetchedRewards, storeSettings] = await Promise.all([
      fetchTiersFromFirebase(),
      fetchRewardsConfigFromFirebase(),
      fetchStoreSettingsFromFirebase()
    ]);
    setAllTiers(tiers);
    if (fetchedRewards) setRewardsConfig(fetchedRewards);

    if (storeSettings) {
      if (storeSettings.pointsPerRupee !== undefined) {
        setRewardsConfig(prev => ({
          ...prev,
          SHOP: {
            ...prev.SHOP,
            POINTS_PER_RUPEE: storeSettings.pointsPerRupee
          }
        }));
      }

      if (storeSettings.redeemRate !== undefined || storeSettings.maxRedeemPercent !== undefined) {
        setStoreConfig(prev => ({
          ...prev,
          redeemRate: storeSettings.redeemRate ?? prev.redeemRate,
          maxRedeemPercent: storeSettings.maxRedeemPercent ?? prev.maxRedeemPercent
        }));
      }
    }
  };

  useEffect(() => {
    if (!user) {
      setXp(0);
      setGameXp(0);
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
        setGameXp(data.game_xp || 0);
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
          game_xp: 0,
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
            setGameXp(data.game_xp || 0);
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
  const awardPoints = async (amount: number, reason: string, isGameXP: boolean = false) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);

    // Apply Tier Multiplier to JP only (Logic: XP is raw, JP gets multiplied)
    // "Rule: Every action awards both JP and XP equally" - but modified by multiplier for JP
    const jpEarned = Math.round(amount * tier.multiplier);

    const updates: any = {
      xp: increment(amount),
      points: increment(jpEarned),
    };

    if (isGameXP) {
      updates.game_xp = increment(amount);
    }

    await updateDoc(userRef, updates);

    logTransaction(user.uid, 'EARN', jpEarned, 'Award', reason, { xpEarned: amount, isGameXP });
  };

  const spendPoints = async (amount: number, reason: string) => {
    if (!user || balance < amount) return false;
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      points: increment(-amount)
    });
    logTransaction(user.uid, 'SPEND', amount, 'Spend', reason);
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

    // Log the transaction
    if (prize.type === 'JP' || prize.type === 'JACKPOT') {
      logTransaction(user.uid, 'EARN', Number(prize.value), 'Daily Spin', `Won ${prize.label}`, { prize });
    } else if (prize.type === 'XP') {
      // For XP only awards, we might still want to log it if we show XP in history, 
      // but current history UI focuses on JP (points). 
      // The logTransaction function is designed for JP (amount arg).
      // We can log 0 JP but include metadata or update logTransaction to handle XP.
      // For now, let's log it with 0 JP amount but detailed description.
      logTransaction(user.uid, 'EARN', 0, 'Daily Spin', `Won ${prize.value} XP`, { prize, xpEarned: Number(prize.value) });
    }
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

    logTransaction(user.uid, 'EARN', reward, 'Easter Egg', 'Found a hidden egg!', { eggsFound: dailyStats.eggsFound + 1 });

    return true;
  }

  const fetchHistory = async (startAfterDoc?: QueryDocumentSnapshot<DocumentData>) => {
    if (!user) return;

    // If it's a fresh load (no cursor), start loading state
    if (!startAfterDoc) {
      setHistoryLoading(true);
      setHistory([]);
    }

    try {
      const q = query(
        collection(db, 'users', user.uid, 'transactions'),
        orderBy('timestamp', 'desc'),
        limit(20),
        ...(startAfterDoc ? [startAfter(startAfterDoc)] : [])
      );

      const snapshot = await getDocs(q);
      const newTransactions: Transaction[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Transaction));

      if (startAfterDoc) {
        setHistory(prev => [...prev, ...newTransactions]);
      } else {
        setHistory(newTransactions);
      }

      setLastHistoryDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMoreHistory(snapshot.docs.length === 20);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const awardEventAttendancePoints = async (eventId: string, eventName: string) => {
    if (!user) return;
    // TODO: verification logic (e.g. check if already attended)
    const points = 50;
    await awardPoints(points, `Attended: ${eventName}`);
  };

  // Dynamic calculation functions
  const calculatePointsLocal = (price: number, isFirstTime: boolean = false) => {
    let points = Math.floor(price * rewardsConfig.SHOP.POINTS_PER_RUPEE);
    if (isFirstTime) {
      points += 100; // Bonus
    }
    return points;
  };

  const calculatePointWorthLocal = (points: number) => {
    return points * storeConfig.redeemRate;
  };

  const getMaxRedeemableAmountLocal = (totalPrice: number, userPoints: number) => {
    const maxAllowedByPolicy = totalPrice * (storeConfig.maxRedeemPercent / 100);
    const maxUserCanPay = userPoints * storeConfig.redeemRate;
    return Math.min(maxAllowedByPolicy, maxUserCanPay);
  };

  return (
    <GamificationContext.Provider value={{
      xp, game_xp, balance, tier, nextTier, allTiers, rewardsConfig, streak, dailyStats, loading,
      awardPoints, spendPoints, spinWheel, updateStreak, buyStreakFreeze, foundEasterEgg,
      config: storeConfig,
      calculatePoints: calculatePointsLocal,
      calculatePointWorth: calculatePointWorthLocal,
      getMaxRedeemableAmount: getMaxRedeemableAmountLocal,
      awardEventAttendancePoints,
      hasEarlyEventAccess, workshopDiscountPercent, hasVIPSeating,
      history, fetchHistory, hasMoreHistory, historyLoading,
      refreshConfigs
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
