'use client';

import React, { useState } from 'react';
import { WHEEL_PRIZES, STREAK_REWARDS, REWARDS } from '@/lib/gamification';

export default function AdminGamificationPage() {
  const [prizes, setPrizes] = useState(WHEEL_PRIZES);
  const [rewards, setRewards] = useState(REWARDS);

  // Mock save function
  const handleSave = () => {
    alert("Settings Saved (Mock) - In production this would update Firestore 'gamification_config' collection.");
  };

  return (
    <div className="min-h-screen pt-28 pb-16 bg-black text-white px-8">
      <h1 className="font-display text-4xl mb-8">Gamification Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Wheel Probabilities */}
        <div className="glass-card p-8 rounded border border-white/10">
          <h2 className="font-header text-amber-500 mb-6 tracking-widest">WHEEL ODDS</h2>
          <div className="space-y-4">
            {prizes.map((prize, idx) => (
              <div key={prize.id} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full" style={{ backgroundColor: prize.color }}></div>
                <div className="flex-1">
                  <div className="text-sm font-bold">{prize.label}</div>
                  <div className="text-xs text-white/40">{prize.type}</div>
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
                  className="bg-black/50 border border-white/20 rounded px-2 py-1 w-20 text-right"
                />
              </div>
            ))}
            <div className="pt-4 border-t border-white/10 flex justify-between text-sm">
              <span>Total Probability:</span>
              <span className={prizes.reduce((a, b) => a + b.probability, 0).toFixed(2) === '1.00' ? 'text-emerald-400' : 'text-red-500'}>
                {prizes.reduce((a, b) => a + b.probability, 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Econ Rewards */}
        <div className="glass-card p-8 rounded border border-white/10">
          <h2 className="font-header text-amber-500 mb-6 tracking-widest">ECONOMY RULES</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-xs text-white/60 mb-2 font-header">SUDOKU REWARD (EASY)</label>
              <input
                type="number"
                value={rewards.SUDOKU.EASY}
                onChange={(e) => setRewards({ ...rewards, SUDOKU: { ...rewards.SUDOKU, EASY: parseInt(e.target.value) } })}
                className="w-full bg-black/50 border border-white/20 rounded px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-xs text-white/60 mb-2 font-header">RIDDLE REWARD</label>
              <input
                type="number"
                value={rewards.RIDDLE.SOLVE}
                onChange={(e) => setRewards({ ...rewards, RIDDLE: { ...rewards.RIDDLE, SOLVE: parseInt(e.target.value) } })}
                className="w-full bg-black/50 border border-white/20 rounded px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-xs text-white/60 mb-2 font-header">TREASURE HUNT CHANCE (0-1)</label>
              <input
                type="number"
                step="0.01"
                value={rewards.TREASURE_HUNT.SPAWN_CHANCE}
                onChange={(e) => setRewards({ ...rewards, TREASURE_HUNT: { ...rewards.TREASURE_HUNT, SPAWN_CHANCE: parseFloat(e.target.value) } })}
                className="w-full bg-black/50 border border-white/20 rounded px-4 py-2"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          className="px-8 py-3 bg-white text-black font-header tracking-widest hover:bg-amber-500 transition-colors"
        >
          SAVE CHANGES
        </button>
      </div>
    </div>
  );
}
