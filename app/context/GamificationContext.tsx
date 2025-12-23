'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { GamificationConfig, BonusRule, LevelThreshold, CustomerGamificationData } from '@/lib/types';

interface GamificationContextType {
  config: GamificationConfig;
  updateConfig: (newConfig: GamificationConfig) => void;
  addBonusRule: (rule: BonusRule) => void;
  removeBonusRule: (ruleId: string) => void;
  updateBonusRule: (ruleId: string, rule: BonusRule) => void;
  calculatePoints: (amount: number, isFirstTime: boolean, ruleApplicable?: BonusRule) => number;
  calculatePointWorth: (points: number) => number;
  getMaxRedeemableAmount: (totalOrderAmount: number, availablePoints: number) => number;
  getCustomerLevel: (totalPoints: number) => number;
  isLoading: boolean;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

const DEFAULT_CONFIG: GamificationConfig = {
  pointsPerRupee: 1, // 1 point per rupee
  firstTimeBonusPoints: 500, // 500 bonus points for first purchase
  firstTimeThreshold: 1000, // Minimum 1000 rupees to get bonus
  bonusRules: [
    {
      id: '1',
      name: 'Weekend Bonus',
      type: 'percentage',
      active: true,
      description: 'Get 50% extra points on weekends',
      bonusPoints: 50,
      minPurchaseAmount: 500,
      applicableCategories: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: 'Milestone Bonus',
      type: 'milestone',
      active: true,
      description: 'Get 1000 points after every 5th purchase',
      purchaseCount: 5,
      bonusPoints: 1000,
      applicableCategories: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  redeemRate: 0.5, // 1 point = 0.5 rupees
  maxRedeemPercent: 50, // Max 50% of order can be paid with points
  referralBonus: 300,
  birthdayBonus: 200,
  levelThresholds: [
    { level: 1, minPoints: 0, multiplier: 1, benefits: ['Basic rewards'], badgeColor: '#666' },
    { level: 2, minPoints: 1000, multiplier: 1.1, benefits: ['10% bonus points', 'Early access'], badgeColor: '#d4af37' },
    { level: 3, minPoints: 5000, multiplier: 1.25, benefits: ['25% bonus points', 'VIP support', 'Exclusive items'], badgeColor: '#0d7377' },
    { level: 4, minPoints: 10000, multiplier: 1.5, benefits: ['50% bonus points', 'Concierge', 'Priority shipping'], badgeColor: '#ffd700' },
  ],
};

export function GamificationProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<GamificationConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Load from Firebase on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsLoading(true);
        // Lazy load Firebase function
        const { getGamificationConfig } = await import('@/lib/firebase');
        const firebaseConfig = await getGamificationConfig();
        if (firebaseConfig) {
          // Merge with default to ensure levelThresholds are present
          setConfig({
            ...DEFAULT_CONFIG,
            ...firebaseConfig,
          });
        }
      } catch (error) {
        console.error('Failed to load gamification config from Firebase:', error);
        // Use default config on error
        setConfig(DEFAULT_CONFIG);
      } finally {
        setIsLoading(false);
        setMounted(true);
      }
    };

    loadConfig();
  }, []);

  // Save to Firebase when config changes
  useEffect(() => {
    if (!mounted) return;

    const saveConfig = async () => {
      try {
        // Lazy load Firebase function
        const { updateGamificationConfig } = await import('@/lib/firebase');
        await updateGamificationConfig(config);
      } catch (error) {
        console.error('Failed to save gamification config to Firebase:', error);
      }
    };

    // Debounce save by 1 second
    const timer = setTimeout(saveConfig, 1000);
    return () => clearTimeout(timer);
  }, [config, mounted]);

  const updateConfig = (newConfig: GamificationConfig) => {
    setConfig(newConfig);
  };

  const addBonusRule = (rule: BonusRule) => {
    setConfig({
      ...config,
      bonusRules: [...config.bonusRules, { ...rule, id: Date.now().toString() }],
    });
  };

  const removeBonusRule = (ruleId: string) => {
    setConfig({
      ...config,
      bonusRules: config.bonusRules.filter((r) => r.id !== ruleId),
    });
  };

  const updateBonusRule = (ruleId: string, rule: BonusRule) => {
    setConfig({
      ...config,
      bonusRules: config.bonusRules.map((r) => (r.id === ruleId ? rule : r)),
    });
  };

  const calculatePoints = (
    amount: number,
    isFirstTime: boolean,
    ruleApplicable?: BonusRule
  ): number => {
    let points = amount * config.pointsPerRupee;

    // Apply first-time bonus
    if (isFirstTime && amount >= config.firstTimeThreshold) {
      points += config.firstTimeBonusPoints;
    }

    // Apply bonus rule
    if (ruleApplicable?.active) {
      if (ruleApplicable.type === 'percentage' && ruleApplicable.bonusPoints) {
        points += (points * ruleApplicable.bonusPoints) / 100;
      } else if (ruleApplicable.type === 'fixed' && ruleApplicable.bonusPoints) {
        points += ruleApplicable.bonusPoints;
      }
    }

    return Math.floor(points);
  };

  const calculatePointWorth = (points: number): number => {
    return points * config.redeemRate;
  };

  const getMaxRedeemableAmount = (totalOrderAmount: number, availablePoints: number): number => {
    const maxFromPercentage = (totalOrderAmount * config.maxRedeemPercent) / 100;
    const maxFromPoints = calculatePointWorth(availablePoints);
    return Math.min(maxFromPercentage, maxFromPoints);
  };

  const getCustomerLevel = (totalPoints: number): number => {
    const applicableLevel = config.levelThresholds
      .reverse()
      .find((level) => totalPoints >= level.minPoints);
    return applicableLevel?.level || 1;
  };

  return (
    <GamificationContext.Provider
      value={{
        config,
        updateConfig,
        addBonusRule,
        removeBonusRule,
        updateBonusRule,
        calculatePoints,
        calculatePointWorth,
        getMaxRedeemableAmount,
        getCustomerLevel,
        isLoading,
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within GamificationProvider');
  }
  return context;
}
