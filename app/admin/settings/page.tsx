'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface Settings {
  // Gamification
  pointsPerRupee: number;
  firstTimeBonusPoints: number;
  firstTimeThreshold: number;
  redeemRate: number;
  maxRedeemPercent: number;
  referralBonus: number;
  birthdayBonus: number;

  // Payment
  gstRate: number;
  shippingCost: number;
  freeShippingThreshold: number;

  // General
  storeName: string;
  storeEmail: string;
  storePhone: string;
  currency: string;
}

const defaultSettings: Settings = {
  pointsPerRupee: 1,
  firstTimeBonusPoints: 100,
  firstTimeThreshold: 500,
  redeemRate: 0.5,
  maxRedeemPercent: 50,
  referralBonus: 50,
  birthdayBonus: 100,
  gstRate: 18,
  shippingCost: 50,
  freeShippingThreshold: 500,
  storeName: 'Joy Juncture',
  storeEmail: 'support@joyjuncture.com',
  storePhone: '+91-XXXXXXXXXX',
  currency: 'INR',
};

export default function AdminSettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const idToken = await user?.getIdToken();
        if (!idToken) return;

        const response = await fetch('/api/admin/settings/get', {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSettings({ ...defaultSettings, ...data });
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchSettings();
    }
  }, [user]);

  const handleChange = (key: keyof Settings, value: string | number) => {
    setSettings((prev) => ({
      ...prev,
      [key]: typeof defaultSettings[key] === 'number' ? parseFloat(String(value)) : value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const idToken = await user?.getIdToken();
      if (!idToken) throw new Error('No auth token');

      const response = await fetch('/api/admin/settings/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error('Failed to save');

      addToast({
        title: 'Success',
        description: 'Settings updated successfully!',
      });
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to save settings',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <p className="text-white/60">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-header text-5xl mb-2 tracking-wider">ADMIN SETTINGS</h1>
          <p className="text-white/60 font-serif italic">Customize all platform configurations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gamification Settings */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-8">
            <h2 className="font-header text-xl mb-6 text-amber-500 tracking-wider">GAMIFICATION</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-white/70 font-serif text-sm mb-2">
                  Points Per Rupee Spent
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.pointsPerRupee}
                  onChange={(e) => handleChange('pointsPerRupee', e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded px-4 py-2 text-white"
                />
                <p className="text-white/40 text-xs mt-1">User gets 1 point for every ₹{(1 / settings.pointsPerRupee).toFixed(2)} spent</p>
              </div>

              <div>
                <label className="block text-white/70 font-serif text-sm mb-2">
                  First Time Bonus Points
                </label>
                <input
                  type="number"
                  value={settings.firstTimeBonusPoints}
                  onChange={(e) => handleChange('firstTimeBonusPoints', e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-white/70 font-serif text-sm mb-2">
                  First Time Purchase Threshold (₹)
                </label>
                <input
                  type="number"
                  value={settings.firstTimeThreshold}
                  onChange={(e) => handleChange('firstTimeThreshold', e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-white/70 font-serif text-sm mb-2">
                  Redeem Rate (₹ per point)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.redeemRate}
                  onChange={(e) => handleChange('redeemRate', e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded px-4 py-2 text-white"
                />
                <p className="text-white/40 text-xs mt-1">1 point = ₹{settings.redeemRate}</p>
              </div>

              <div>
                <label className="block text-white/70 font-serif text-sm mb-2">
                  Max Redeem Percentage (%)
                </label>
                <input
                  type="number"
                  value={settings.maxRedeemPercent}
                  onChange={(e) => handleChange('maxRedeemPercent', e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded px-4 py-2 text-white"
                />
                <p className="text-white/40 text-xs mt-1">Max {settings.maxRedeemPercent}% of order can be paid with points</p>
              </div>

              <div>
                <label className="block text-white/70 font-serif text-sm mb-2">
                  Referral Bonus Points
                </label>
                <input
                  type="number"
                  value={settings.referralBonus}
                  onChange={(e) => handleChange('referralBonus', e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-white/70 font-serif text-sm mb-2">
                  Birthday Bonus Points
                </label>
                <input
                  type="number"
                  value={settings.birthdayBonus}
                  onChange={(e) => handleChange('birthdayBonus', e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded px-4 py-2 text-white"
                />
              </div>
            </div>
          </div>

          {/* Payment Settings */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-8">
            <h2 className="font-header text-xl mb-6 text-amber-500 tracking-wider">PAYMENT & SHIPPING</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-white/70 font-serif text-sm mb-2">
                  GST Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.gstRate}
                  onChange={(e) => handleChange('gstRate', e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded px-4 py-2 text-white"
                />
                <p className="text-white/40 text-xs mt-1">Current GST: {settings.gstRate}%</p>
              </div>

              <div>
                <label className="block text-white/70 font-serif text-sm mb-2">
                  Standard Shipping Cost (₹)
                </label>
                <input
                  type="number"
                  value={settings.shippingCost}
                  onChange={(e) => handleChange('shippingCost', e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-white/70 font-serif text-sm mb-2">
                  Free Shipping Threshold (₹)
                </label>
                <input
                  type="number"
                  value={settings.freeShippingThreshold}
                  onChange={(e) => handleChange('freeShippingThreshold', e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded px-4 py-2 text-white"
                />
                <p className="text-white/40 text-xs mt-1">Orders above ₹{settings.freeShippingThreshold} get free shipping</p>
              </div>
            </div>
          </div>

          {/* General Settings */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-8 lg:col-span-2">
            <h2 className="font-header text-xl mb-6 text-amber-500 tracking-wider">GENERAL SETTINGS</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/70 font-serif text-sm mb-2">
                  Store Name
                </label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={(e) => handleChange('storeName', e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-white/70 font-serif text-sm mb-2">
                  Store Email
                </label>
                <input
                  type="email"
                  value={settings.storeEmail}
                  onChange={(e) => handleChange('storeEmail', e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-white/70 font-serif text-sm mb-2">
                  Store Phone
                </label>
                <input
                  type="tel"
                  value={settings.storePhone}
                  onChange={(e) => handleChange('storePhone', e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-white/70 font-serif text-sm mb-2">
                  Currency
                </label>
                <input
                  type="text"
                  value={settings.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded px-4 py-2 text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-12 flex gap-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 py-3 bg-amber-500 text-black font-header text-sm tracking-widest hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded"
          >
            {isSaving ? 'SAVING...' : 'SAVE ALL SETTINGS'}
          </button>
          <button
            onClick={() => setSettings(defaultSettings)}
            className="px-8 py-3 border border-amber-500 text-amber-500 font-header text-sm tracking-widest hover:bg-amber-500/10 transition-all rounded"
          >
            RESET TO DEFAULT
          </button>
        </div>
      </div>
    </div>
  );
}
