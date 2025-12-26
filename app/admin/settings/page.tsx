'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Save, RefreshCw, Settings as SettingsIcon, CreditCard, ShoppingBag, Globe } from 'lucide-react';

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
        title: 'CONFIGURATION_SAVED',
        description: 'System parameters updated successfully.',
      });
    } catch (error) {
      addToast({
        title: 'SYSTEM_ERROR',
        description: 'Failed to save configuration parameters.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-6 bg-[#050505] flex items-center justify-center">
        <div className="text-[#FFD400] font-arcade tracking-[0.3em] animate-pulse text-xl">
          LOADING_CONFIG...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white bg-[#050505]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 border-b-2 border-[#333] pb-8 flex justify-between items-end">
          <div>
            <h1 className="font-arcade text-5xl text-white mb-2 text-3d-orange">SYSTEM_CONFIG</h1>
            <p className="text-gray-500 font-sans text-lg tracking-wide uppercase">Global platform parameters</p>
          </div>
          <div className="bg-[#111] border border-[#333] px-4 py-2 rounded text-xs font-mono text-gray-400 flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-[#FFD400] animate-spin-slow" />
            CONFIG_MODE_ACTIVE
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gamification Settings */}
          <div className="bg-[#080808] border-2 border-[#333] rounded-[4px] p-8 shadow-lg hover:border-[#FFD400]/50 transition-colors group">
            <div className="flex items-center gap-3 mb-8 border-b border-[#333] pb-4">
              <div className="p-2 bg-[#111] border border-[#333] rounded">
                <SettingsIcon className="w-5 h-5 text-[#FFD400]" />
              </div>
              <h2 className="font-arcade text-xl text-white tracking-widest text-shadow-glow">GAMIFICATION_ENGINE</h2>
            </div>

            <div className="space-y-6">
              <div className="group/input">
                <label className="block text-[#00B894] font-mono text-xs uppercase tracking-wider mb-2 group-hover/input:text-[#FFD400] transition-colors">
                  Points Per Rupee Spent
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={settings.pointsPerRupee}
                    onChange={(e) => handleChange('pointsPerRupee', e.target.value)}
                    className="w-full bg-[#111] border-2 border-[#333] rounded-sm px-4 py-3 text-white font-mono focus:outline-none focus:border-[#FFD400] transition-colors"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-mono">PTS/INR</div>
                </div>
                <p className="text-gray-600 text-[10px] font-mono mt-1 uppercase">Rate: 1 PT = ₹{(1 / settings.pointsPerRupee).toFixed(2)} SPENT</p>
              </div>

              <div className="group/input">
                <label className="block text-[#00B894] font-mono text-xs uppercase tracking-wider mb-2 group-hover/input:text-[#FFD400] transition-colors">
                  First Time Bonus Points
                </label>
                <input
                  type="number"
                  value={settings.firstTimeBonusPoints}
                  onChange={(e) => handleChange('firstTimeBonusPoints', e.target.value)}
                  className="w-full bg-[#111] border-2 border-[#333] rounded-sm px-4 py-3 text-white font-mono focus:outline-none focus:border-[#FFD400] transition-colors"
                />
              </div>

              <div className="group/input">
                <label className="block text-[#00B894] font-mono text-xs uppercase tracking-wider mb-2 group-hover/input:text-[#FFD400] transition-colors">
                  First Time Purchase Threshold (₹)
                </label>
                <input
                  type="number"
                  value={settings.firstTimeThreshold}
                  onChange={(e) => handleChange('firstTimeThreshold', e.target.value)}
                  className="w-full bg-[#111] border-2 border-[#333] rounded-sm px-4 py-3 text-white font-mono focus:outline-none focus:border-[#FFD400] transition-colors"
                />
              </div>

              <div className="group/input">
                <label className="block text-[#00B894] font-mono text-xs uppercase tracking-wider mb-2 group-hover/input:text-[#FFD400] transition-colors">
                  Redeem Rate (₹ per point)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.redeemRate}
                  onChange={(e) => handleChange('redeemRate', e.target.value)}
                  className="w-full bg-[#111] border-2 border-[#333] rounded-sm px-4 py-3 text-white font-mono focus:outline-none focus:border-[#FFD400] transition-colors"
                />
                <p className="text-gray-600 text-[10px] font-mono mt-1 uppercase">CONVERSION: 1 PT = ₹{settings.redeemRate}</p>
              </div>

              <div className="group/input">
                <label className="block text-[#00B894] font-mono text-xs uppercase tracking-wider mb-2 group-hover/input:text-[#FFD400] transition-colors">
                  Max Redeem Percentage (%)
                </label>
                <input
                  type="number"
                  value={settings.maxRedeemPercent}
                  onChange={(e) => handleChange('maxRedeemPercent', e.target.value)}
                  className="w-full bg-[#111] border-2 border-[#333] rounded-sm px-4 py-3 text-white font-mono focus:outline-none focus:border-[#FFD400] transition-colors"
                />
                <p className="text-gray-600 text-[10px] font-mono mt-1 uppercase">CAP: {settings.maxRedeemPercent}% OF TOTAL ORDER</p>
              </div>

              <div className="group/input">
                <label className="block text-[#00B894] font-mono text-xs uppercase tracking-wider mb-2 group-hover/input:text-[#FFD400] transition-colors">
                  Referral Bonus Points
                </label>
                <input
                  type="number"
                  value={settings.referralBonus}
                  onChange={(e) => handleChange('referralBonus', e.target.value)}
                  className="w-full bg-[#111] border-2 border-[#333] rounded-sm px-4 py-3 text-white font-mono focus:outline-none focus:border-[#FFD400] transition-colors"
                />
              </div>

              <div className="group/input">
                <label className="block text-[#00B894] font-mono text-xs uppercase tracking-wider mb-2 group-hover/input:text-[#FFD400] transition-colors">
                  Birthday Bonus Points
                </label>
                <input
                  type="number"
                  value={settings.birthdayBonus}
                  onChange={(e) => handleChange('birthdayBonus', e.target.value)}
                  className="w-full bg-[#111] border-2 border-[#333] rounded-sm px-4 py-3 text-white font-mono focus:outline-none focus:border-[#FFD400] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Payment Settings */}
          <div className="bg-[#080808] border-2 border-[#333] rounded-[4px] p-8 shadow-lg hover:border-[#FFD400]/50 transition-colors">
            <div className="flex items-center gap-3 mb-8 border-b border-[#333] pb-4">
              <div className="p-2 bg-[#111] border border-[#333] rounded">
                <CreditCard className="w-5 h-5 text-[#FFD400]" />
              </div>
              <h2 className="font-arcade text-xl text-white tracking-widest text-shadow-glow">FINANCIAL_PROTOCOLS</h2>
            </div>

            <div className="space-y-6">
              <div className="group/input">
                <label className="block text-[#00B894] font-mono text-xs uppercase tracking-wider mb-2 group-hover/input:text-[#FFD400] transition-colors">
                  GST Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.gstRate}
                  onChange={(e) => handleChange('gstRate', e.target.value)}
                  className="w-full bg-[#111] border-2 border-[#333] rounded-sm px-4 py-3 text-white font-mono focus:outline-none focus:border-[#FFD400] transition-colors"
                />
                <p className="text-gray-600 text-[10px] font-mono mt-1 uppercase">CURRENT TAX: {settings.gstRate}%</p>
              </div>

              <div className="group/input">
                <label className="block text-[#00B894] font-mono text-xs uppercase tracking-wider mb-2 group-hover/input:text-[#FFD400] transition-colors">
                  Standard Shipping Cost (₹)
                </label>
                <input
                  type="number"
                  value={settings.shippingCost}
                  onChange={(e) => handleChange('shippingCost', e.target.value)}
                  className="w-full bg-[#111] border-2 border-[#333] rounded-sm px-4 py-3 text-white font-mono focus:outline-none focus:border-[#FFD400] transition-colors"
                />
              </div>

              <div className="group/input">
                <label className="block text-[#00B894] font-mono text-xs uppercase tracking-wider mb-2 group-hover/input:text-[#FFD400] transition-colors">
                  Free Shipping Threshold (₹)
                </label>
                <input
                  type="number"
                  value={settings.freeShippingThreshold}
                  onChange={(e) => handleChange('freeShippingThreshold', e.target.value)}
                  className="w-full bg-[#111] border-2 border-[#333] rounded-sm px-4 py-3 text-white font-mono focus:outline-none focus:border-[#FFD400] transition-colors"
                />
                <p className="text-gray-600 text-[10px] font-mono mt-1 uppercase">IF ORDER &gt; ₹{settings.freeShippingThreshold} THEN SHIPPING = 0</p>
              </div>
            </div>
          </div>

          {/* General Settings */}
          <div className="bg-[#080808] border-2 border-[#333] rounded-[4px] p-8 shadow-lg hover:border-[#FFD400]/50 transition-colors lg:col-span-2">
            <div className="flex items-center gap-3 mb-8 border-b border-[#333] pb-4">
              <div className="p-2 bg-[#111] border border-[#333] rounded">
                <Globe className="w-5 h-5 text-[#FFD400]" />
              </div>
              <h2 className="font-arcade text-xl text-white tracking-widest text-shadow-glow">GENERAL_SETTINGS</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group/input">
                <label className="block text-[#00B894] font-mono text-xs uppercase tracking-wider mb-2 group-hover/input:text-[#FFD400] transition-colors">
                  Store Name
                </label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={(e) => handleChange('storeName', e.target.value)}
                  className="w-full bg-[#111] border-2 border-[#333] rounded-sm px-4 py-3 text-white font-mono focus:outline-none focus:border-[#FFD400] transition-colors"
                />
              </div>

              <div className="group/input">
                <label className="block text-[#00B894] font-mono text-xs uppercase tracking-wider mb-2 group-hover/input:text-[#FFD400] transition-colors">
                  Store Email
                </label>
                <input
                  type="email"
                  value={settings.storeEmail}
                  onChange={(e) => handleChange('storeEmail', e.target.value)}
                  className="w-full bg-[#111] border-2 border-[#333] rounded-sm px-4 py-3 text-white font-mono focus:outline-none focus:border-[#FFD400] transition-colors"
                />
              </div>

              <div className="group/input">
                <label className="block text-[#00B894] font-mono text-xs uppercase tracking-wider mb-2 group-hover/input:text-[#FFD400] transition-colors">
                  Store Phone
                </label>
                <input
                  type="tel"
                  value={settings.storePhone}
                  onChange={(e) => handleChange('storePhone', e.target.value)}
                  className="w-full bg-[#111] border-2 border-[#333] rounded-sm px-4 py-3 text-white font-mono focus:outline-none focus:border-[#FFD400] transition-colors"
                />
              </div>

              <div className="group/input">
                <label className="block text-[#00B894] font-mono text-xs uppercase tracking-wider mb-2 group-hover/input:text-[#FFD400] transition-colors">
                  Currency
                </label>
                <input
                  type="text"
                  value={settings.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                  className="w-full bg-[#111] border-2 border-[#333] rounded-sm px-4 py-3 text-white font-mono focus:outline-none focus:border-[#FFD400] transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-12 flex gap-4 border-t-2 border-[#333] pt-8">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 py-3 bg-[#FFD400] text-black font-arcade text-sm uppercase tracking-widest hover:bg-[#FFE066] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 group border border-[#FFD400]"
          >
            {isSaving ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
            )}
            {isSaving ? 'EXECUTING...' : 'SAVE_CONFIGURATION'}
          </button>

          <button
            onClick={() => setSettings(defaultSettings)}
            className="px-8 py-3 bg-transparent border-2 border-[#333] text-gray-400 font-arcade text-sm uppercase tracking-widest hover:border-gray-500 hover:text-white transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            RESET_DEFAULTS
          </button>
        </div>
      </div>
    </div>
  );
}
