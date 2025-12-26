'use client';

import React, { useState } from 'react';
import { WHEEL_PRIZES, STREAK_REWARDS, REWARDS } from '@/lib/gamification';
import { Save, Gamepad2, Coins, Trophy, Percent } from 'lucide-react';

export default function AdminGamificationPage() {
  const [prizes, setPrizes] = useState(WHEEL_PRIZES);
  const [rewards, setRewards] = useState(REWARDS);

  // Mock save function
  const handleSave = () => {
    alert("Settings Saved (Mock) - In production this would update Firestore 'gamification_config' collection.");
  };

  return (
    <div className="min-h-screen text-white bg-[#050505] p-8 pb-16">
      {/* Header */}
      <div className="mb-12 border-b-2 border-[#333] pb-8 flex justify-between items-end">
        <div>
          <h1 className="font-arcade text-5xl text-white mb-2 text-3d-orange">GAMIFICATION_ENGINE</h1>
          <p className="text-gray-500 font-sans text-lg tracking-wide uppercase">Configure rewards and probability vectors</p>
        </div>
        <div className="bg-[#111] border border-[#333] px-4 py-2 rounded text-xs font-mono text-gray-400 flex items-center gap-2">
          <Gamepad2 className="w-4 h-4 text-[#FFD400] animate-pulse" />
          SYSTEM_ACTIVE
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Wheel Probabilities */}
        <div className="bg-[#080808] border-2 border-[#333] rounded-[4px] p-8 hover:border-[#FFD400]/30 transition-colors">
          <div className="flex items-center gap-3 mb-8 border-b border-[#333] pb-4">
            <div className="p-2 bg-[#111] border border-[#333] rounded">
              <Percent className="w-5 h-5 text-[#FFD400]" />
            </div>
            <h2 className="font-arcade text-xl text-white tracking-widest text-shadow-glow">WHEEL_ODDS</h2>
          </div>

          <div className="space-y-4">
            {prizes.map((prize, idx) => (
              <div key={prize.id} className="flex items-center gap-4 bg-[#111] p-3 rounded-sm border border-[#222]">
                <div className="w-3 h-3 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: prize.color, color: prize.color }}></div>
                <div className="flex-1">
                  <div className="text-sm font-mono font-bold uppercase tracking-wider">{prize.label}</div>
                  <div className="text-[10px] text-gray-500 font-mono uppercase">{prize.type}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-600 font-mono uppercase">PROB</span>
                  <input
                    type="number"
                    step="0.01"
                    value={prize.probability}
                    onChange={(e) => {
                      const newPrizes = [...prizes];
                      newPrizes[idx].probability = parseFloat(e.target.value);
                      setPrizes(newPrizes);
                    }}
                    className="bg-black border border-[#333] rounded-sm px-3 py-1 w-24 text-right font-mono text-[#FFD400] focus:border-[#FFD400] outline-none transition-colors"
                  />
                </div>
              </div>
            ))}
            <div className="pt-6 border-t border-[#333] flex justify-between text-sm font-mono">
              <span className="text-gray-500 uppercase tracking-widest">TOTAL_PROBABILITY_SUM:</span>
              <span className={`font-bold ${prizes.reduce((a, b) => a + b.probability, 0).toFixed(2) === '1.00' ? 'text-[#00B894]' : 'text-red-500'}`}>
                {prizes.reduce((a, b) => a + b.probability, 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Econ Rewards */}
        <div className="bg-[#080808] border-2 border-[#333] rounded-[4px] p-8 hover:border-blue-500/30 transition-colors">
          <div className="flex items-center gap-3 mb-8 border-b border-[#333] pb-4">
            <div className="p-2 bg-[#111] border border-[#333] rounded">
              <Coins className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="font-arcade text-xl text-white tracking-widest text-shadow-glow">ECONOMY_PROTOCOLS</h2>
          </div>

          <div className="space-y-8">
            <div>
              <label className="block text-[#00B894] font-mono text-[10px] uppercase tracking-widest mb-2 flex items-center gap-2">
                <Trophy className="w-3 h-3" />
                SUDOKU_REWARD_VALUE (EASY)
              </label>
              <input
                type="number"
                value={rewards.SUDOKU.EASY}
                onChange={(e) => setRewards({ ...rewards, SUDOKU: { ...rewards.SUDOKU, EASY: parseInt(e.target.value) } })}
                className="w-full bg-[#111] border border-[#333] rounded-sm px-4 py-3 font-mono text-white focus:border-blue-400 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-[#00B894] font-mono text-[10px] uppercase tracking-widest mb-2 flex items-center gap-2">
                <Trophy className="w-3 h-3" />
                RIDDLE_REWARD_VALUE
              </label>
              <input
                type="number"
                value={rewards.RIDDLE.SOLVE}
                onChange={(e) => setRewards({ ...rewards, RIDDLE: { ...rewards.RIDDLE, SOLVE: parseInt(e.target.value) } })}
                className="w-full bg-[#111] border border-[#333] rounded-sm px-4 py-3 font-mono text-white focus:border-blue-400 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-[#00B894] font-mono text-[10px] uppercase tracking-widest mb-2 flex items-center gap-2">
                <Trophy className="w-3 h-3" />
                TREASURE_HUNT_SPAWN_rate (0-1)
              </label>
              <input
                type="number"
                step="0.01"
                value={rewards.TREASURE_HUNT.SPAWN_CHANCE}
                onChange={(e) => setRewards({ ...rewards, TREASURE_HUNT: { ...rewards.TREASURE_HUNT, SPAWN_CHANCE: parseFloat(e.target.value) } })}
                className="w-full bg-[#111] border border-[#333] rounded-sm px-4 py-3 font-mono text-white focus:border-blue-400 outline-none transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 flex justify-end border-t border-[#333] pt-8">
        <button
          onClick={handleSave}
          className="px-12 py-4 bg-[#FFD400] text-black font-arcade text-sm uppercase tracking-widest hover:bg-[#FFE066] transition-all flex items-center gap-3 group border border-[#FFD400]"
        >
          SAVE_CONFIGURATION
          <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </div>
  );
}
