'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, getFirestore } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { Trophy, Zap, Settings, AlertCircle, Save, CheckCircle } from 'lucide-react';
import { usePopup } from '@/app/context/PopupContext';

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

interface XPSource {
  name: string;
  baseXP: number;
  baseJP: number;
  enabled: boolean;
}

export default function XPTiersAdmin() {
  const { showAlert } = usePopup();
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [xpSources, setXPSources] = useState<XPSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const db = getFirestore(app);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsRef = doc(db, 'settings', 'xpSystem');
      const snap = await getDoc(settingsRef);

      if (snap.exists()) {
        const data = snap.data();
        setTiers(data.tiers || getDefaultTiers());
        setXPSources(data.xpSources || getDefaultXPSources());
        setIsInitialized(true);
      } else {
        setTiers(getDefaultTiers());
        setXPSources(getDefaultXPSources());
        setIsInitialized(false);
      }
    } catch (error) {
      console.error('Error loading XP settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultTiers = (): Tier[] => [
    { name: 'Newbie', minXP: 0, multiplier: 1.0, badge: 'Grey Meeple', perk: 'None', color: '#94a3b8', icon: '♟️', unlockPrice: 0 },
    { name: 'Player', minXP: 500, multiplier: 1.1, badge: 'Green Pawn', perk: 'Early access to Event Tickets', color: '#34d399', icon: '♟️', unlockPrice: 2000 },
    { name: 'Strategist', minXP: 2000, multiplier: 1.25, badge: 'Blue Rook', perk: '5% off all Workshops', color: '#60a5fa', icon: '♜', unlockPrice: 5000 },
    { name: 'Grandmaster', minXP: 5000, multiplier: 1.5, badge: 'Gold Crown', perk: 'VIP Seating at Game Nights', color: '#fbbf24', icon: '👑', unlockPrice: 10000 }
  ];

  const getDefaultXPSources = (): XPSource[] => [
    { name: 'Shop Purchase (per ₹100)', baseXP: 10, baseJP: 10, enabled: true },
    { name: 'Event Registration', baseXP: 50, baseJP: 50, enabled: true },
    { name: 'Workshop Registration', baseXP: 75, baseJP: 75, enabled: true },
    { name: 'Game Night Attendance', baseXP: 100, baseJP: 100, enabled: true }
  ];

  const saveSettings = async () => {
    setSaving(true);
    try {
      const settingsRef = doc(db, 'settings', 'xpSystem');
      await setDoc(settingsRef, {
        tiers,
        xpSources,
        updatedAt: new Date().toISOString()
      });
      await showAlert('XP System settings saved successfully!', 'success');
      setIsInitialized(true);
    } catch (error) {
      console.error('Error saving settings:', error);
      await showAlert('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateTier = (index: number, field: keyof Tier, value: string | number | undefined) => {
    const updated = [...tiers];
    updated[index] = { ...updated[index], [field]: value };
    setTiers(updated);
  };

  const updateXPSource = (index: number, field: keyof XPSource, value: string | number | boolean) => {
    const updated = [...xpSources];
    updated[index] = { ...updated[index], [field]: value };
    setXPSources(updated);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-[#FFD93D] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black font-black text-xl uppercase tracking-wider">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-[#FFD93D] border-4 border-black rounded-2xl neo-shadow">
            <Trophy className="w-8 h-8 text-black" />
          </div>
          <div>
            <h1 className="font-header text-5xl font-black text-black tracking-tight">XP & TIER SYSTEM</h1>
            <p className="text-black/60 font-bold uppercase tracking-wider text-sm">Customize Experience Points & Progression</p>
          </div>
        </div>

        {!isInitialized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 p-4 bg-[#FFD93D] border-4 border-black rounded-2xl neo-shadow flex items-start gap-3"
          >
            <AlertCircle className="w-6 h-6 text-black flex-shrink-0 mt-1" />
            <div>
              <p className="text-black font-black mb-1">⚠️ NOT INITIALIZED</p>
              <p className="text-black/70 font-bold text-sm">
                XP System not found in Firebase. Click &quot;SAVE CHANGES&quot; below to initialize with these default settings.
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Tiers Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white border-4 border-black rounded-[40px] p-8 sm:p-12 mb-12 neo-shadow relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#6C5CE7] opacity-5 rounded-full -mr-32 -mt-32" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-[#6C5CE7] border-4 border-black rounded-2xl neo-shadow rotate-3">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="font-header text-4xl font-black text-black tracking-tight">TIER HIERARCHY</h2>
              <p className="text-black/50 font-bold uppercase tracking-[0.2em] text-xs">Define Progression Levels</p>
            </div>
          </div>
        </div>

        <div className="space-y-12">
          {tiers.map((tier, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="group relative"
            >
              {/* Vertical line between tiers except last */}
              {index !== tiers.length - 1 && (
                <div className="absolute left-8 top-full h-12 w-1 bg-black/10 -ml-0.5" />
              )}

              <div className="bg-[#FFFDF5] border-4 border-black rounded-[32px] p-8 neo-shadow-hover transition-all relative overflow-hidden">
                <div
                  className="absolute top-0 right-0 w-24 h-24 opacity-10 rounded-bl-[100px] border-l-4 border-b-4 border-black transition-all group-hover:scale-110"
                  style={{ backgroundColor: tier.color }}
                />

                <div className="flex flex-col lg:flex-row gap-10">
                  {/* Left Column: Visual Identity */}
                  <div className="lg:w-1/4 flex flex-col items-center justify-center p-6 bg-white border-4 border-black rounded-3xl neo-shadow relative">
                    <div className="text-7xl mb-4 transition-transform group-hover:scale-110 transform duration-300">
                      {tier.icon}
                    </div>
                    <div className="text-center">
                      <h3 className="font-header text-3xl font-black text-black mb-1 leading-none uppercase tracking-tighter">
                        {tier.name || 'New Tier'}
                      </h3>
                      <div
                        className="inline-block px-3 py-1 rounded-full border-2 border-black text-[10px] font-black uppercase tracking-widest mt-2"
                        style={{ backgroundColor: tier.color + '33', color: tier.color }}
                      >
                        {tier.badge}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Configuration Grid */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Basic Info Group */}
                    <div className="space-y-4 md:col-span-2 lg:col-span-3 pb-4 border-b-2 border-dashed border-black/10 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-1">
                        <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-black/40 mb-2 ml-1">Tier Name</label>
                        <input
                          type="text"
                          value={tier.name}
                          onChange={(e) => updateTier(index, 'name', e.target.value)}
                          className="w-full px-5 py-3 bg-white border-3 border-black rounded-xl font-bold focus:outline-none focus:ring-4 focus:ring-[#FFD93D] transition-all"
                        />
                      </div>
                      <div className="md:col-span-1">
                        <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-black/40 mb-2 ml-1">Icon Emoji</label>
                        <input
                          type="text"
                          value={tier.icon}
                          onChange={(e) => updateTier(index, 'icon', e.target.value)}
                          className="w-full px-5 py-3 bg-white border-3 border-black rounded-xl font-bold text-2xl text-center focus:outline-none focus:ring-4 focus:ring-[#FFD93D] transition-all"
                        />
                      </div>
                      <div className="md:col-span-1">
                        <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-black/40 mb-2 ml-1">Min XP Requirement</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={tier.minXP}
                            onChange={(e) => updateTier(index, 'minXP', parseInt(e.target.value))}
                            className="w-full px-5 py-3 bg-white border-3 border-black rounded-xl font-bold focus:outline-none focus:ring-4 focus:ring-[#FFD93D] transition-all pr-12"
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-black/30">XP</div>
                        </div>
                      </div>
                    </div>

                    {/* Progression & Rewards Group */}
                    <div className="space-y-4">
                      <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-black/40 mb-2 ml-1">JP Multiplier</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          value={tier.multiplier}
                          onChange={(e) => updateTier(index, 'multiplier', parseFloat(e.target.value))}
                          className="w-full px-5 py-3 bg-white border-3 border-black rounded-xl font-bold focus:outline-none focus:ring-4 focus:ring-[#60a5fa]/40 transition-all pr-12"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-[#60a5fa]">x</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-black/40 mb-2 ml-1">Unlock Price</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={tier.unlockPrice || 0}
                          onChange={(e) => updateTier(index, 'unlockPrice', parseInt(e.target.value))}
                          className="w-full px-5 py-3 bg-white border-3 border-black rounded-xl font-bold focus:outline-none focus:ring-4 focus:ring-[#fbbf24]/40 transition-all pr-12"
                          placeholder="0 = Earn only"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#fbbf24]">JP</div>
                      </div>
                      <p className="text-[9px] text-black/30 font-black uppercase tracking-widest ml-1">{tier.unlockPrice === 0 ? 'EARNABLE ONLY' : 'PURCHASABLE'}</p>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-black/40 mb-2 ml-1">Visual Theme</label>
                      <div className="flex gap-3">
                        <div className="relative w-14 h-12 flex-shrink-0">
                          <input
                            type="color"
                            value={tier.color}
                            onChange={(e) => updateTier(index, 'color', e.target.value)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <div
                            className="w-full h-full border-3 border-black rounded-xl neo-shadow-sm"
                            style={{ backgroundColor: tier.color }}
                          />
                        </div>
                        <input
                          type="text"
                          value={tier.color}
                          onChange={(e) => updateTier(index, 'color', e.target.value)}
                          className="flex-1 px-4 py-3 bg-white border-3 border-black rounded-xl font-bold text-xs uppercase focus:outline-none focus:ring-4 focus:ring-black/5"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-1 lg:col-span-2">
                      <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-black/40 mb-2 ml-1">Exclusive Perk</label>
                      <input
                        type="text"
                        value={tier.perk}
                        onChange={(e) => updateTier(index, 'perk', e.target.value)}
                        className="w-full px-5 py-3 bg-white border-3 border-black rounded-xl font-bold focus:outline-none focus:ring-4 focus:ring-[#34d399]/40 transition-all"
                        placeholder="No specific perks defined"
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-black/40 mb-2 ml-1">Badge Title</label>
                      <input
                        type="text"
                        value={tier.badge}
                        onChange={(e) => updateTier(index, 'badge', e.target.value)}
                        className="w-full px-5 py-3 bg-white border-3 border-black rounded-xl font-bold focus:outline-none focus:ring-4 focus:ring-black/5 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* XP Sources Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white border-4 border-black rounded-[40px] p-8 sm:p-12 mb-12 neo-shadow relative"
      >
        <div className="flex items-center gap-4 mb-10">
          <div className="p-4 bg-[#FFD93D] border-4 border-black rounded-2xl neo-shadow -rotate-3">
            <Zap className="w-8 h-8 text-black" />
          </div>
          <div>
            <h2 className="font-header text-4xl font-black text-black tracking-tight uppercase">XP GENERATORS</h2>
            <p className="text-black/50 font-bold uppercase tracking-[0.2em] text-xs">Configure Point Earning Rates</p>
          </div>
        </div>

        <div className="space-y-4">
          {xpSources.map((source, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + (0.05 * index) }}
              className={`group transition-all rounded-3xl border-4 border-black p-5 flex flex-col md:flex-row items-center gap-6 ${source.enabled ? 'bg-[#FFFDF5] neo-shadow-sm' : 'bg-gray-100 opacity-60'}`}
            >
              <div className="flex items-center gap-4 w-full md:w-auto">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={source.enabled}
                    onChange={(e) => updateXPSource(index, 'enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-16 h-9 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#FFD93D] rounded-full peer border-3 border-black peer-checked:after:translate-x-7 peer-checked:after:border-black after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-black after:border-3 after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-[#00B894]"></div>
                </label>
                <div className="md:hidden font-black uppercase text-xs tracking-widest">{source.enabled ? 'ENABLED' : 'DISABLED'}</div>
              </div>

              <div className="flex-1 w-full">
                <input
                  type="text"
                  value={source.name}
                  onChange={(e) => updateXPSource(index, 'name', e.target.value)}
                  className="w-full px-5 py-3 bg-white border-3 border-black rounded-xl font-bold focus:outline-none focus:ring-4 focus:ring-[#FFD93D] transition-all"
                  placeholder="Source Name"
                />
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-32">
                  <input
                    type="number"
                    value={source.baseXP}
                    onChange={(e) => updateXPSource(index, 'baseXP', parseInt(e.target.value))}
                    className="w-full px-5 py-3 bg-white border-3 border-black rounded-xl font-black text-center focus:outline-none focus:ring-4 focus:ring-[#FFD93D] transition-all"
                  />
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">BASE XP</div>
                </div>

                <div className="relative flex-1 md:w-32">
                  <input
                    type="number"
                    value={source.baseJP || 0}
                    onChange={(e) => updateXPSource(index, 'baseJP', parseInt(e.target.value))}
                    className="w-full px-5 py-3 bg-white border-3 border-black rounded-xl font-black text-center focus:outline-none focus:ring-4 focus:ring-[#6C5CE7] transition-all"
                  />
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#6C5CE7] text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">BASE JP</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex justify-end"
      >
        <button
          onClick={saveSettings}
          disabled={saving}
          className="px-8 py-4 bg-[#6C5CE7] hover:bg-[#5f4fd1] text-white font-black text-lg rounded-2xl border-4 border-black neo-shadow-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider flex items-center gap-3"
        >
          {saving ? (
            <>
              <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              SAVING...
            </>
          ) : (
            <>
              <Save className="w-6 h-6" />
              SAVE CHANGES
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}
