'use client';

import React, { useState } from 'react';
import { WHEEL_PRIZES, STREAK_REWARDS, REWARDS } from '@/lib/gamification';

export default function AdminGamificationPage() {
  const [prizes, setPrizes] = useState(WHEEL_PRIZES);
  const [rewards, setRewards] = useState(REWARDS);
  const [message, setMessage] = useState('');

  const handleSave = () => {
    setMessage("✅ Settings Saved (Mock) - In production this would update Firestore 'gamification_config' collection.");
    setTimeout(() => setMessage(''), 3000);
  };

  const totalProbability = prizes.reduce((a, b) => a + b.probability, 0).toFixed(2);

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
          <div className="mb-6 p-4 rounded-xl border-2 bg-green-100 border-green-500 text-green-800">
            <p className="font-bold">{message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Wheel Probabilities */}
          <div className="bg-white border-2 border-black p-8 rounded-[30px] neo-shadow">
            <h2 className="font-header text-2xl mb-6 text-black">🎡 WHEEL ODDS</h2>
            <div className="space-y-4">
              {prizes.map((prize, idx) => (
                <div key={prize.id} className="flex items-center gap-4 p-3 bg-[#FFFDF5] border-2 border-black/10 rounded-xl">
                  <div className="w-10 h-10 rounded-full border-2 border-black" style={{ backgroundColor: prize.color }}></div>
                  <div className="flex-1">
                    <div className="text-sm font-black text-black">{prize.label}</div>
                    <div className="text-xs text-black/40 font-bold uppercase tracking-wide">{prize.type}</div>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={prize.probability}
                    onChange={(e) => {
                      const newPrizes = [...prizes];
                      newPrizes[idx].probability = parseFloat(e.target.value);
                      setPrizes(newPrizes);
                    }}
                    className="w-24 px-3 py-2 border-2 border-black/20 rounded-lg focus:border-[#6C5CE7] focus:outline-none text-right font-bold"
                  />
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
                  <p className="text-red-800 text-xs font-bold">⚠️ Total must equal 1.00</p>
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
                  onChange={(e) => setRewards({ ...rewards, SUDOKU: { ...rewards.SUDOKU, EASY: parseInt(e.target.value) } })}
                  className="w-full px-4 py-3 border-2 border-black/20 rounded-lg focus:border-[#6C5CE7] focus:outline-none font-bold"
                />
              </div>
              <div>
                <label className="block text-black/60 font-bold text-xs tracking-widest mb-2 uppercase">Riddle Reward</label>
                <input
                  type="number"
                  value={rewards.RIDDLE.SOLVE}
                  onChange={(e) => setRewards({ ...rewards, RIDDLE: { ...rewards.RIDDLE, SOLVE: parseInt(e.target.value) } })}
                  className="w-full px-4 py-3 border-2 border-black/20 rounded-lg focus:border-[#6C5CE7] focus:outline-none font-bold"
                />
              </div>
              <div>
                <label className="block text-black/60 font-bold text-xs tracking-widest mb-2 uppercase">Treasure Hunt Chance (0-1)</label>
                <input
                  type="number"
                  step="0.01"
                  value={rewards.TREASURE_HUNT.SPAWN_CHANCE}
                  onChange={(e) => setRewards({ ...rewards, TREASURE_HUNT: { ...rewards.TREASURE_HUNT, SPAWN_CHANCE: parseFloat(e.target.value) } })}
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
            className="px-8 py-4 bg-[#6C5CE7] text-white font-black text-lg uppercase tracking-widest rounded-xl border-2 border-black neo-shadow hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all"
          >
            SAVE CHANGES
          </button>
        </div>
      </div>
    </div>
  );
}
