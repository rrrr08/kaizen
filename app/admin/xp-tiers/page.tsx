'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, getFirestore } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { Trophy, Zap, Settings, AlertCircle, Save, CheckCircle } from 'lucide-react';

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
      alert('✅ XP System settings saved successfully!');
      setIsInitialized(true);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('❌ Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateTier = (index: number, field: keyof Tier, value: any) => {
    const updated = [...tiers];
    updated[index] = { ...updated[index], [field]: value };
    setTiers(updated);
  };

  const updateXPSource = (index: number, field: keyof XPSource, value: any) => {
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
                XP System not found in Firebase. Click "SAVE CHANGES" below to initialize with these default settings.
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
        className="bg-white border-4 border-black rounded-3xl p-8 mb-8 neo-shadow"
      >
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-7 h-7 text-[#6C5CE7]" />
          <h2 className="font-header text-3xl font-black text-black">TIER CONFIGURATION</h2>
        </div>
        
        <div className="space-y-6">
          {tiers.map((tier, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-[#FFFDF5] border-4 border-black rounded-2xl p-6 neo-shadow-hover transition-all"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="text-5xl">{tier.icon}</div>
                <div>
                  <h3 className="font-header text-2xl font-black text-black">{tier.name}</h3>
                  <p className="text-sm font-bold text-black/60">{tier.badge}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-black/60 mb-2">Tier Name</label>
                  <input
                    type="text"
                    value={tier.name}
                    onChange={(e) => updateTier(index, 'name', e.target.value)}
                    className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-bold focus:outline-none focus:ring-4 focus:ring-[#FFD93D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-black/60 mb-2">Min XP Required</label>
                  <input
                    type="number"
                    value={tier.minXP}
                    onChange={(e) => updateTier(index, 'minXP', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-bold focus:outline-none focus:ring-4 focus:ring-[#FFD93D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-black/60 mb-2">JP Multiplier</label>
                  <input
                    type="number"
                    step="0.1"
                    value={tier.multiplier}
                    onChange={(e) => updateTier(index, 'multiplier', parseFloat(e.target.value))}
                    className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-bold focus:outline-none focus:ring-4 focus:ring-[#FFD93D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-black/60 mb-2">Icon Emoji</label>
                  <input
                    type="text"
                    value={tier.icon}
                    onChange={(e) => updateTier(index, 'icon', e.target.value)}
                    className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-bold text-2xl text-center focus:outline-none focus:ring-4 focus:ring-[#FFD93D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-black/60 mb-2">Badge Name</label>
                  <input
                    type="text"
                    value={tier.badge}
                    onChange={(e) => updateTier(index, 'badge', e.target.value)}
                    className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-bold focus:outline-none focus:ring-4 focus:ring-[#FFD93D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-black/60 mb-2">Color (Hex)</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={tier.color}
                      onChange={(e) => updateTier(index, 'color', e.target.value)}
                      className="w-16 h-12 border-3 border-black rounded-xl cursor-pointer"
                    />
                    <input
                      type="text"
                      value={tier.color}
                      onChange={(e) => updateTier(index, 'color', e.target.value)}
                      className="flex-1 px-4 py-3 bg-white border-3 border-black rounded-xl font-bold focus:outline-none focus:ring-4 focus:ring-[#FFD93D]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-black/60 mb-2">Unlock Price (JP)</label>
                  <input
                    type="number"
                    value={tier.unlockPrice || 0}
                    onChange={(e) => updateTier(index, 'unlockPrice', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-bold focus:outline-none focus:ring-4 focus:ring-[#FFD93D]"
                    placeholder="0 = Free"
                  />
                  <p className="text-xs text-black/50 font-bold mt-1">0 = Earn only, &gt;0 = Can buy</p>
                </div>
                <div className="md:col-span-2 lg:col-span-1">
                  <label className="block text-xs font-black uppercase tracking-wider text-black/60 mb-2">Tier Perk</label>
                  <input
                    type="text"
                    value={tier.perk}
                    onChange={(e) => updateTier(index, 'perk', e.target.value)}
                    className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-bold focus:outline-none focus:ring-4 focus:ring-[#FFD93D]"
                  />
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
        className="bg-white border-4 border-black rounded-3xl p-8 mb-8 neo-shadow"
      >
        <div className="flex items-center gap-3 mb-6">
          <Zap className="w-7 h-7 text-[#FFD93D]" />
          <h2 className="font-header text-3xl font-black text-black">XP SOURCES</h2>
        </div>
        
        <div className="space-y-3">
          {xpSources.map((source, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + (0.05 * index) }}
              className="bg-[#FFFDF5] border-3 border-black rounded-xl p-4 flex items-center gap-4"
            >
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={source.enabled}
                  onChange={(e) => updateXPSource(index, 'enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#FFD93D] rounded-full peer border-3 border-black peer-checked:after:translate-x-6 peer-checked:after:border-black after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-black after:border-3 after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#00B894]"></div>
              </label>
              
              <div className="flex-1">
                <input
                  type="text"
                  value={source.name}
                  onChange={(e) => updateXPSource(index, 'name', e.target.value)}
                  className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-bold focus:outline-none focus:ring-4 focus:ring-[#FFD93D]"
                />
              </div>
              
              <div className="w-32">
                <input
                  type="number"
                  value={source.baseXP}
                  onChange={(e) => updateXPSource(index, 'baseXP', parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-bold text-center focus:outline-none focus:ring-4 focus:ring-[#FFD93D]"
                  placeholder="XP"
                />
              </div>
              <span className="text-sm font-black text-black/60 uppercase">XP</span>
              
              <div className="w-32">
                <input
                  type="number"
                  value={source.baseJP || 0}
                  onChange={(e) => updateXPSource(index, 'baseJP', parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-bold text-center focus:outline-none focus:ring-4 focus:ring-[#FFD93D]"
                  placeholder="JP"
                />
              </div>
              <span className="text-sm font-black text-[#6C5CE7]/80 uppercase">JP</span>
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
