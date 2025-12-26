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
      <div className="min-h-screen pt-24 pb-16 px-6 bg-[#FFFDF5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#FFD93D] border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black font-black uppercase tracking-widest">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 md:px-12 bg-[#FFFDF5]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 border-b-2 border-black pb-8">
          <h1 className="font-header text-6xl font-black text-black mb-2 uppercase tracking-tighter">Admin Settings</h1>
          <p className="text-xl text-black/60 font-bold">Customize all platform configurations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gamification Settings */}
          <div className="bg-white border-2 border-black rounded-[25px] p-8 neo-shadow">
            <h2 className="font-header text-2xl mb-8 text-black font-black uppercase tracking-tight flex items-center gap-3">
              <span className="w-3 h-8 bg-[#FFD93D] border-2 border-black rounded-full"></span>
              Gamification
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">
                  Points Per Rupee Spent
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 font-black">₹ 1 =</div>
                  <input
                    type="number"
                    step="0.1"
                    value={settings.pointsPerRupee}
                    onChange={(e) => handleChange('pointsPerRupee', e.target.value)}
                    className="w-full bg-[#FFFDF5] border-2 border-black rounded-xl pl-16 pr-4 py-3 text-black font-black focus:outline-none focus:neo-shadow-sm transition-all"
                  />
                </div>
                <p className="text-black/40 font-bold text-xs mt-2 uppercase tracking-wide">User gets 1 point for every ₹{(1 / settings.pointsPerRupee).toFixed(2)} spent</p>
              </div>

              <div>
                <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">
                  First Time Bonus Points
                </label>
                <input
                  type="number"
                  value={settings.firstTimeBonusPoints}
                  onChange={(e) => handleChange('firstTimeBonusPoints', e.target.value)}
                  className="w-full bg-[#FFFDF5] border-2 border-black rounded-xl px-4 py-3 text-black font-black focus:outline-none focus:neo-shadow-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">
                  First Time Purchase Threshold (₹)
                </label>
                <input
                  type="number"
                  value={settings.firstTimeThreshold}
                  onChange={(e) => handleChange('firstTimeThreshold', e.target.value)}
                  className="w-full bg-[#FFFDF5] border-2 border-black rounded-xl px-4 py-3 text-black font-black focus:outline-none focus:neo-shadow-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">
                  Redeem Rate (₹ per point)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.redeemRate}
                  onChange={(e) => handleChange('redeemRate', e.target.value)}
                  className="w-full bg-[#FFFDF5] border-2 border-black rounded-xl px-4 py-3 text-black font-black focus:outline-none focus:neo-shadow-sm transition-all"
                />
                <p className="text-black/40 font-bold text-xs mt-2 uppercase tracking-wide">1 point = ₹{settings.redeemRate}</p>
              </div>

              <div>
                <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">
                  Max Redeem Percentage (%)
                </label>
                <input
                  type="number"
                  value={settings.maxRedeemPercent}
                  onChange={(e) => handleChange('maxRedeemPercent', e.target.value)}
                  className="w-full bg-[#FFFDF5] border-2 border-black rounded-xl px-4 py-3 text-black font-black focus:outline-none focus:neo-shadow-sm transition-all"
                />
                <p className="text-black/40 font-bold text-xs mt-2 uppercase tracking-wide">Max {settings.maxRedeemPercent}% of order can be paid with points</p>
              </div>

              <div>
                <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">
                  Referral Bonus Points
                </label>
                <input
                  type="number"
                  value={settings.referralBonus}
                  onChange={(e) => handleChange('referralBonus', e.target.value)}
                  className="w-full bg-[#FFFDF5] border-2 border-black rounded-xl px-4 py-3 text-black font-black focus:outline-none focus:neo-shadow-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">
                  Birthday Bonus Points
                </label>
                <input
                  type="number"
                  value={settings.birthdayBonus}
                  onChange={(e) => handleChange('birthdayBonus', e.target.value)}
                  className="w-full bg-[#FFFDF5] border-2 border-black rounded-xl px-4 py-3 text-black font-black focus:outline-none focus:neo-shadow-sm transition-all"
                />
              </div>
            </div>
          </div>

          {/* Payment Settings */}
          <div className="bg-white border-2 border-black rounded-[25px] p-8 neo-shadow">
            <h2 className="font-header text-2xl mb-8 text-black font-black uppercase tracking-tight flex items-center gap-3">
              <span className="w-3 h-8 bg-[#00B894] border-2 border-black rounded-full"></span>
              Payment & Shipping
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">
                  GST Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.gstRate}
                  onChange={(e) => handleChange('gstRate', e.target.value)}
                  className="w-full bg-[#FFFDF5] border-2 border-black rounded-xl px-4 py-3 text-black font-black focus:outline-none focus:neo-shadow-sm transition-all"
                />
                <p className="text-black/40 font-bold text-xs mt-2 uppercase tracking-wide">Current GST: {settings.gstRate}%</p>
              </div>

              <div>
                <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">
                  Standard Shipping Cost (₹)
                </label>
                <input
                  type="number"
                  value={settings.shippingCost}
                  onChange={(e) => handleChange('shippingCost', e.target.value)}
                  className="w-full bg-[#FFFDF5] border-2 border-black rounded-xl px-4 py-3 text-black font-black focus:outline-none focus:neo-shadow-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">
                  Free Shipping Threshold (₹)
                </label>
                <input
                  type="number"
                  value={settings.freeShippingThreshold}
                  onChange={(e) => handleChange('freeShippingThreshold', e.target.value)}
                  className="w-full bg-[#FFFDF5] border-2 border-black rounded-xl px-4 py-3 text-black font-black focus:outline-none focus:neo-shadow-sm transition-all"
                />
                <p className="text-black/40 font-bold text-xs mt-2 uppercase tracking-wide">Orders above ₹{settings.freeShippingThreshold} get free shipping</p>
              </div>
            </div>
          </div>

          {/* General Settings */}
          <div className="bg-white border-2 border-black rounded-[25px] p-8 lg:col-span-2 neo-shadow">
            <h2 className="font-header text-2xl mb-8 text-black font-black uppercase tracking-tight flex items-center gap-3">
              <span className="w-3 h-8 bg-[#6C5CE7] border-2 border-black rounded-full"></span>
              General Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">
                  Store Name
                </label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={(e) => handleChange('storeName', e.target.value)}
                  className="w-full bg-[#FFFDF5] border-2 border-black rounded-xl px-4 py-3 text-black font-black focus:outline-none focus:neo-shadow-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">
                  Store Email
                </label>
                <input
                  type="email"
                  value={settings.storeEmail}
                  onChange={(e) => handleChange('storeEmail', e.target.value)}
                  className="w-full bg-[#FFFDF5] border-2 border-black rounded-xl px-4 py-3 text-black font-black focus:outline-none focus:neo-shadow-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">
                  Store Phone
                </label>
                <input
                  type="tel"
                  value={settings.storePhone}
                  onChange={(e) => handleChange('storePhone', e.target.value)}
                  className="w-full bg-[#FFFDF5] border-2 border-black rounded-xl px-4 py-3 text-black font-black focus:outline-none focus:neo-shadow-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">
                  Currency
                </label>
                <input
                  type="text"
                  value={settings.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                  className="w-full bg-[#FFFDF5] border-2 border-black rounded-xl px-4 py-3 text-black font-black focus:outline-none focus:neo-shadow-sm transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-12 flex gap-6 justify-end">
          <button
            onClick={() => setSettings(defaultSettings)}
            className="px-8 py-4 bg-white border-2 border-black text-black font-black uppercase tracking-widest rounded-xl hover:bg-gray-100 transition-all text-sm"
          >
            Reset to Default
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-10 py-4 bg-[#00B894] text-black font-black text-lg uppercase tracking-widest rounded-xl border-2 border-black neo-shadow hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSaving ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
