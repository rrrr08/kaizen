'use client';

import React, { useState, useEffect } from 'react';
import { WHEEL_PRIZES, STREAK_REWARDS, REWARDS, fetchWheelPrizesFromFirebase, fetchRewardsConfigFromFirebase } from '@/lib/gamification';
import { doc, setDoc, getFirestore } from 'firebase/firestore';
import { app } from '@/lib/firebase';

const db = getFirestore(app);

export default function AdminGamificationPage() {
  const [prizes, setPrizes] = useState(WHEEL_PRIZES);
  const [rewards, setRewards] = useState(REWARDS);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [fetchedPrizes, fetchedRewards] = await Promise.all([
          fetchWheelPrizesFromFirebase(),
          fetchRewardsConfigFromFirebase()
        ]);

        if (fetchedPrizes) setPrizes(fetchedPrizes);
        if (fetchedRewards) setRewards(fetchedRewards);
      } catch (error) {
        console.error("Failed to load gamification settings", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      // Save Wheel Prizes
      await setDoc(doc(db, 'settings', 'wheelPrizes'), {
        prizes: prizes.map(p => ({
          ...p,
          probability: Number(p.probability),
          value: (p.type === 'JP' || p.type === 'XP' || p.type === 'JACKPOT') ? (Number(p.value) || 0) : p.value
        }))
      });

      // Save Rewards Config
      await setDoc(doc(db, 'settings', 'gamificationRewards'), rewards);

      setMessage("Settings Saved Successfully!");
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage("Error saving settings");
    } finally {
      setLoading(false);
    }
  };

  const totalProbability = prizes.reduce((a, b) => a + Number(b.probability), 0).toFixed(2);

  if (loading && !prizes) return <div className="min-h-screen pt-28 flex justify-center text-4xl">Loading...</div>;

  return (
    <div className="min-h-screen pt-28 pb-16 bg-[#FFFDF5]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="mb-12 border-b-2 border-black pb-8">
          <h1 className="font-header text-5xl md:text-7xl tracking-tighter mb-4 text-[#2D3436]">
            GAMIFICATION <span className="text-[#6C5CE7]">SETTINGS</span>
          </h1>
          <p className="text-black/70 font-bold text-lg">
            Configure wheel probabilities and economy rewards
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl border-2 font-bold ${message.includes('Error') ? 'bg-red-100 border-red-500 text-red-800' : 'bg-green-100 border-green-500 text-green-800'}`}>
            <p>{message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Wheel Probabilities */}
          <div className="bg-white border-2 border-black p-8 rounded-[30px] neo-shadow col-span-1 lg:col-span-2 xl:col-span-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-header text-2xl text-black">🎡 WHEEL PRIZES</h2>
              <button
                onClick={() => {
                  const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
                  setPrizes([...prizes, { id: `new_${Date.now()}_${randomSuffix}`, type: 'JP', value: 10, label: '10 JP', probability: 0, color: '#000000' }]);
                }}
                className="px-4 py-2 bg-green-400 border-2 border-black rounded-lg font-bold text-xs uppercase hover:bg-green-500 transition-colors"
              >
                + Add Prize
              </button>
            </div>

            <div className="space-y-4">
              {prizes.map((prize, idx) => (
                <div key={prize.id} className="flex flex-col gap-3 p-4 bg-[#FFFDF5] border-2 border-black/10 rounded-xl relative group">
                  <button
                    onClick={() => {
                      const newPrizes = prizes.filter((_, i) => i !== idx);
                      setPrizes(newPrizes);
                    }}
                    className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    title="Remove Prize"
                  >
                    ×
                  </button>

                  <div className="flex items-start gap-4">
                    {/* Color Picker */}
                    <div className="flex flex-col gap-1 items-center">
                      <input
                        type="color"
                        value={prize.color}
                        onChange={(e) => {
                          const newPrizes = [...prizes];
                          newPrizes[idx].color = e.target.value;
                          setPrizes(newPrizes);
                        }}
                        className="w-10 h-10 rounded-full border-2 border-black overflow-hidden cursor-pointer p-0"
                      />
                      <span className="text-[10px] uppercase font-bold text-black/40">Color</span>
                    </div>

                    <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-2">
                      {/* Label */}
                      <div className="col-span-2">
                        <label className="text-[10px] font-bold text-black/40 uppercase">Label</label>
                        <input
                          type="text"
                          value={prize.label}
                          onChange={(e) => {
                            const newPrizes = [...prizes];
                            newPrizes[idx].label = e.target.value;
                            setPrizes(newPrizes);
                          }}
                          className="w-full px-2 py-1 border-2 border-black/10 rounded-md text-sm font-bold bg-white focus:border-[#6C5CE7] focus:outline-none"
                          placeholder="Display Name"
                        />
                      </div>

                      {/* Type */}
                      <div>
                        <label className="text-[10px] font-bold text-black/40 uppercase">Type</label>
                        <select
                          value={prize.type}
                          onChange={(e) => {
                            const newPrizes = [...prizes];
                            newPrizes[idx].type = e.target.value as any;
                            setPrizes(newPrizes);
                          }}
                          className="w-full px-2 py-1 border-2 border-black/10 rounded-md text-xs font-bold bg-white focus:border-[#6C5CE7] focus:outline-none"
                        >
                          <option value="JP">JP</option>
                          <option value="XP">XP</option>
                          <option value="ITEM">Item</option>
                          <option value="COUPON">Coupon</option>
                          <option value="JACKPOT">Jackpot</option>
                        </select>
                      </div>

                      {/* Value */}
                      <div>
                        <label className="text-[10px] font-bold text-black/40 uppercase">Value</label>
                        <input
                          type="text"
                          value={(typeof prize.value === 'number' && isNaN(prize.value)) ? '' : prize.value}
                          onChange={(e) => {
                            const newPrizes = [...prizes];
                            newPrizes[idx].value = e.target.value;
                            setPrizes(newPrizes);
                          }}
                          className="w-full px-2 py-1 border-2 border-black/10 rounded-md text-sm font-bold bg-white focus:border-[#6C5CE7] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Probability */}
                    <div className="flex flex-col items-end">
                      <label className="text-[10px] font-bold text-black/40 uppercase">Odds (0-1)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={prize.probability}
                        onChange={(e) => {
                          const newPrizes = [...prizes];
                          newPrizes[idx] = { ...newPrizes[idx], probability: parseFloat(e.target.value) };
                          setPrizes(newPrizes);
                        }}
                        className="w-20 px-2 py-1 border-2 border-black/20 rounded-lg focus:border-[#6C5CE7] focus:outline-none text-right font-bold bg-white"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-4 mt-4 border-t-2 border-black/20 flex justify-between items-center">
                <span className="font-black text-black/60 text-sm uppercase tracking-wide">Total Probability:</span>
                <span className={`font-black text-lg ${totalProbability === '1.00' ? 'text-green-600' : 'text-red-600'}`}>
                  {totalProbability}
                </span>
              </div>
              {totalProbability !== '1.00' && (
                <div className="p-3 bg-red-100 border-2 border-red-500 rounded-xl">
                  <p className="text-red-800 text-xs font-bold">Total must equal 1.00</p>
                </div>
              )}
            </div>
          </div>

          {/* Economy Rewards */}
          <div className="bg-white border-2 border-black p-8 rounded-[30px] neo-shadow">
            <h2 className="font-header text-2xl mb-6 text-black">💰 ECONOMY RULES</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-black/60 font-bold text-xs tracking-widest mb-2 uppercase">Sudoku Reward (Easy)</label>
                <input
                  type="number"
                  value={rewards.SUDOKU.EASY}
                  onChange={(e) => setRewards({ ...rewards, SUDOKU: { ...rewards.SUDOKU, EASY: parseInt(e.target.value) || 0 } })}
                  className="w-full px-4 py-3 border-2 border-black/20 rounded-lg focus:border-[#6C5CE7] focus:outline-none font-bold"
                />
              </div>
              <div>
                <label className="block text-black/60 font-bold text-xs tracking-widest mb-2 uppercase">Sudoku Reward (Medium)</label>
                <input
                  type="number"
                  value={rewards.SUDOKU.MEDIUM}
                  onChange={(e) => setRewards({ ...rewards, SUDOKU: { ...rewards.SUDOKU, MEDIUM: parseInt(e.target.value) || 0 } })}
                  className="w-full px-4 py-3 border-2 border-black/20 rounded-lg focus:border-[#6C5CE7] focus:outline-none font-bold"
                />
              </div>
              <div>
                <label className="block text-black/60 font-bold text-xs tracking-widest mb-2 uppercase">Sudoku Reward (Hard)</label>
                <input
                  type="number"
                  value={rewards.SUDOKU.HARD}
                  onChange={(e) => setRewards({ ...rewards, SUDOKU: { ...rewards.SUDOKU, HARD: parseInt(e.target.value) || 0 } })}
                  className="w-full px-4 py-3 border-2 border-black/20 rounded-lg focus:border-[#6C5CE7] focus:outline-none font-bold"
                />
              </div>
              <div className="h-px bg-black/10 my-4"></div>
              <div>
                <label className="block text-black/60 font-bold text-xs tracking-widest mb-2 uppercase">Riddle Reward</label>
                <input
                  type="number"
                  value={rewards.RIDDLE.SOLVE}
                  onChange={(e) => setRewards({ ...rewards, RIDDLE: { ...rewards.RIDDLE, SOLVE: parseInt(e.target.value) || 0 } })}
                  className="w-full px-4 py-3 border-2 border-black/20 rounded-lg focus:border-[#6C5CE7] focus:outline-none font-bold"
                />
              </div>
              <div className="h-px bg-black/10 my-4"></div>
              <div>
                <label className="block text-black/60 font-bold text-xs tracking-widest mb-2 uppercase">Treasure Hunt Chance (0-1)</label>
                <input
                  type="number"
                  step="0.01"
                  value={rewards.TREASURE_HUNT.SPAWN_CHANCE}
                  onChange={(e) => setRewards({ ...rewards, TREASURE_HUNT: { ...rewards.TREASURE_HUNT, SPAWN_CHANCE: parseFloat(e.target.value) || 0 } })}
                  className="w-full px-4 py-3 border-2 border-black/20 rounded-lg focus:border-[#6C5CE7] focus:outline-none font-bold"
                />
              </div>
              <div>
                <label className="block text-black/60 font-bold text-xs tracking-widest mb-2 uppercase">Treasure Hunt Reward Max</label>
                <input
                  type="number"
                  value={rewards.TREASURE_HUNT.MAX}
                  onChange={(e) => setRewards({ ...rewards, TREASURE_HUNT: { ...rewards.TREASURE_HUNT, MAX: parseInt(e.target.value) || 0 } })}
                  className="w-full px-4 py-3 border-2 border-black/20 rounded-lg focus:border-[#6C5CE7] focus:outline-none font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-8 py-4 bg-[#6C5CE7] text-white font-black text-lg uppercase tracking-widest rounded-xl border-2 border-black neo-shadow hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all disabled:opacity-50"
          >
            {loading ? 'SAVING...' : 'SAVE CHANGES'}
          </button>
        </div>
      </div>
    </div>
  );
}
