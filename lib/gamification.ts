import { BonusRule, LevelThreshold } from './types';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { app } from './firebase';

// ------------------------------------------------------------------
// 1. THE JOY LADDER (TIER SYSTEM) - Now loaded from Firebase
// ------------------------------------------------------------------
// Default fallback tiers (only used if Firebase fetch fails)
const DEFAULT_TIERS = [
  {
    name: 'Newbie',
    minXP: 0,
    multiplier: 1.0,
    badge: 'Grey Meeple',
    perk: 'None',
    color: 'text-slate-400',
    icon: '♙',
    unlockPrice: 0
  },
  {
    name: 'Player',
    minXP: 500,
    multiplier: 1.1,
    badge: 'Green Pawn',
    perk: 'Early access to Event Tickets',
    color: 'text-emerald-400',
    icon: '♟',
    unlockPrice: 2000
  },
  {
    name: 'Strategist',
    minXP: 2000,
    multiplier: 1.25,
    badge: 'Blue Rook',
    perk: '5% off all Workshops',
    color: 'text-blue-400',
    icon: '♜',
    unlockPrice: 5000
  },
  {
    name: 'Grandmaster',
    minXP: 5000,
    multiplier: 1.5,
    badge: 'Gold Crown',
    perk: 'VIP Seating at Game Nights',
    color: 'text-amber-400',
    icon: '♚',
    unlockPrice: 10000
  }
];

// Fetch tiers and XP settings from Firebase
export const fetchXPSettings = async () => {
  try {
    const db = getFirestore(app);
    const settingsRef = doc(db, 'settings', 'xpSystem');
    const snap = await getDoc(settingsRef);

    if (snap.exists()) {
      return snap.data();
    }
    return { tiers: DEFAULT_TIERS, xpSources: [] };
  } catch (error) {
    console.error('Error fetching XP settings:', error);
    return { tiers: DEFAULT_TIERS, xpSources: [] };
  }
};

export const fetchTiersFromFirebase = async () => {
  const settings = await fetchXPSettings();
  return settings?.tiers || DEFAULT_TIERS;
};

export const fetchWheelPrizesFromFirebase = async () => {
  try {
    const db = getFirestore(app);
    const settingsRef = doc(db, 'settings', 'wheelPrizes');
    const snap = await getDoc(settingsRef);

    if (snap.exists() && snap.data()?.prizes) {
      return snap.data()!.prizes;
    }
    return WHEEL_PRIZES; // Fallback
  } catch (error) {
    console.error('Error fetching wheel prizes from Firebase:', error);
    return WHEEL_PRIZES;
  }
}

// Get tier based on XP (requires tiers array)
export const getTier = (xp: number, tiers: any[]) => {
  return [...tiers].reverse().find(tier => xp >= tier.minXP) || tiers[0];
};

// Check if user has specific tier perk
export const hasTierPerk = (xp: number, perkType: 'earlyAccess' | 'workshopDiscount' | 'vipSeating', tiers: any[]): boolean => {
  const tier = getTier(xp, tiers);

  switch (perkType) {
    case 'earlyAccess':
      return tier.minXP >= 500; // Player tier and above
    case 'workshopDiscount':
      return tier.minXP >= 2000; // Strategist tier and above
    case 'vipSeating':
      return tier.minXP >= 5000; // Grandmaster tier only
    default:
      return false;
  }
};

// Get discount percentage based on tier
export const getTierDiscount = (xp: number, tiers: any[]): number => {
  const tier = getTier(xp, tiers);

  if (tier.minXP >= 5000) return 10; // Grandmaster: 10% off
  if (tier.minXP >= 2000) return 5;  // Strategist: 5% off
  return 0; // No discount for lower tiers
};

// ------------------------------------------------------------------
// 2. ECONOMY & REWARDS
// ------------------------------------------------------------------
export const DEFAULT_REWARDS = {
  SUDOKU: {
    EASY: 20,
    MEDIUM: 50,
    HARD: 100
  },
  RIDDLE: {
    SOLVE: 20,
    HINT_COST: 5
  },
  TREASURE_HUNT: {
    MIN: 5,
    MAX: 15,
    DAILY_CAP: 3,
    SPAWN_CHANCE: 0.1 // 10%
  },
  SHOP: {
    POINTS_PER_RUPEE: 0.1 // 1 JP per 10 Rupees spent
  }
};

export const REWARDS = DEFAULT_REWARDS;

export const fetchRewardsConfigFromFirebase = async () => {
  try {
    const db = getFirestore(app);
    const settingsRef = doc(db, 'settings', 'gamificationRewards');
    const snap = await getDoc(settingsRef);

    if (snap.exists() && snap.data()) {
      // merge with defaults to ensure structure
      return {
        ...DEFAULT_REWARDS,
        ...snap.data()
      };
    }
    return DEFAULT_REWARDS;
  } catch (error) {
    console.error('Error fetching rewards config:', error);
    return DEFAULT_REWARDS;
  }
};

export const fetchStoreSettingsFromFirebase = async () => {
  try {
    const db = getFirestore(app);
    const settingsRef = doc(db, 'settings', 'store');
    const snap = await getDoc(settingsRef);

    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (error) {
    console.error('Error fetching store settings:', error);
    return null;
  }
};

// ------------------------------------------------------------------
// 3. WHEEL OF JOY (ODDS)
// ------------------------------------------------------------------
export interface WheelPrize {
  id: string;
  type: 'JP' | 'XP' | 'ITEM' | 'COUPON' | 'JACKPOT';
  value: number | string;
  label: string;
  probability: number; // 0-1
  color: string;
}

export const WHEEL_PRIZES: WheelPrize[] = [
  { id: 'jp_small', type: 'JP', value: 30, label: '30 JP', probability: 0.50, color: '#3b82f6' }, // 50%
  { id: 'xp_boost', type: 'XP', value: 75, label: '75 XP', probability: 0.30, color: '#10b981' }, // 30%
  { id: 'item_reroll', type: 'ITEM', value: 'Sudoku Reroll', label: 'Reroll', probability: 0.15, color: '#8b5cf6' }, // 15%
  { id: 'coupon_20', type: 'COUPON', value: '20% OFF', label: '20% Off', probability: 0.04, color: '#f59e0b' }, // 4%
  { id: 'jackpot', type: 'JACKPOT', value: 1000, label: '1000 JP', probability: 0.01, color: '#ef4444' } // 1%
];

export const SPIN_COST = 100; // JP

// ------------------------------------------------------------------
// 4. DAY STREAK SYSTEM
// ------------------------------------------------------------------
export const STREAK_REWARDS = [
  { days: [1, 2, 3, 4], reward: 20, visual: 'Sparks' },
  { days: [5, 6], reward: 50, visual: 'Torch' },
  { days: [7], reward: 150, visual: 'Supernova' }, // Weekly milestone
];

export const STREAK_FREEZE_COST = 200; // JP

// ------------------------------------------------------------------
// 5. CHECKOUT & REDEMPTION HELPERS
// ------------------------------------------------------------------
export const CONFIG = {
  redeemRate: 0.5, // 1 JP = ₹0.50
  maxRedeemPercent: 50, // Can only pay 50% of total by points
};

export const calculatePoints = (price: number, isFirstTime: boolean = false, baseJP: number = 10, multiplier: number = 1.0) => {
  const basePoints = Math.floor((price / 100) * baseJP);
  let points = Math.floor(basePoints * multiplier);
  if (isFirstTime) {
    points += 100; // Bonus
  }
  return points;
};

export const calculatePointWorth = (points: number) => {
  return points * CONFIG.redeemRate;
};

export const getMaxRedeemableAmount = (totalPrice: number, userPoints: number) => {
  const maxAllowedByPolicy = totalPrice * (CONFIG.maxRedeemPercent / 100);
  const maxUserCanPay = userPoints * CONFIG.redeemRate;

  // The value in RUPEES that can be redeemed
  return Math.min(maxAllowedByPolicy, maxUserCanPay);
};

// ------------------------------------------------------------------
// 6. TRANSACTION LOGGING
// ------------------------------------------------------------------
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export const logTransaction = async (
  userId: string,
  type: 'EARN' | 'SPEND',
  amount: number,
  source: string,
  description: string,
  metadata: any = {}
) => {
  try {
    const db = getFirestore(app);
    const transactionsRef = collection(db, 'users', userId, 'transactions');

    await addDoc(transactionsRef, {
      type,
      amount,
      source,
      description,
      metadata,
      timestamp: serverTimestamp() // Server timestamp for accurate ordering
    });

    console.log(`[Transaction] ${type} ${amount} JP logged for ${userId}`);
    return true;
  } catch (error) {
    console.error('Error logging transaction:', error);
    return false;
  }
};
