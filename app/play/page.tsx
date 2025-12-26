"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getGames, db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { UserProfile } from '@/lib/types';

export const dynamic = 'force-dynamic';

const Play: React.FC = () => {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);

  // Hardcoded Arcade Games (The actual functional games in the app)
  const ARCADE_MODULES = [
    {
      id: 'sudoku',
      title: 'NEON NUMBERS', // Sudoku
      type: 'LOGIC_CORE',
      description: 'The classic grid puzzle re-imagined for the digital age.',
      link: '/play/sudoku',
      color: '#FFD400',
      icon: '🔢',
      status: 'ONLINE',
      players: 'SOLO'
    },
    {
      id: 'riddles',
      title: 'CRYPTIC CIPHER', // Riddles
      type: 'BRAIN_DATA',
      description: 'Crack the code. Solve the riddle. Unlock the truth.',
      link: '/play/riddles',
      color: '#FF8C00',
      icon: '🧩',
      status: 'ONLINE',
      players: 'SOLO'
    },
    {
      id: 'featured',
      title: 'DAILY GLITCH', // Featured/Random
      type: 'SYSTEM_EVENT',
      description: 'A rotating challenge from the mainframe.',
      link: '/play/sudoku', // Fallback for now
      color: '#FFFFFF',
      icon: '🎲',
      status: 'LOCKED',
      players: 'UNKNOWN'
    }
  ];

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const [gamesData, leaderboardSnapshot] = await Promise.all([
          getGames(),
          getDocs(query(collection(db, 'users'), orderBy('xp', 'desc'), limit(5)))
        ]);

        setGames(gamesData);

        const leaderboardData = leaderboardSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as UserProfile[];
        setLeaderboard(leaderboardData);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      {/* Hero Header */}
      <div className="text-center mb-24 relative">
        <div className="arcade-panel-header bg-[#FF8C00] mx-auto mb-4 w-max px-4">SYSTEM.GAMES</div>
        <h1 className="font-arcade text-7xl md:text-9xl text-white text-3d-orange leading-none tracking-tight mb-6">
          ARCADE<br />ZONE
        </h1>
        <p className="text-gray-500 font-bold uppercase tracking-[0.4em] text-xs md:text-sm max-w-2xl mx-auto">
          Initialize play sequence. Earn tokens. Dominate the grid.
        </p>
        {/* Decorative Grid Background (Local to header) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[linear-gradient(rgba(255,140,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,140,0,0.1)_1px,transparent_1px)] bg-[size:40px_40px] -z-10 opacity-30 pointer-events-none"></div>
      </div>

      {/* Main Game Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-32">
        {ARCADE_MODULES.map((game, idx) => (
          <div key={game.id} className="relative group">
            <div className="arcade-panel-header flex justify-between items-center" style={{ backgroundColor: game.color, color: 'black' }}>
              <span>MODULE_0{idx + 1}</span>
              <span className="text-[8px] animate-pulse">{game.status}</span>
            </div>
            <Link href={game.link} className="block relative">
              <div className="arcade-card-3d h-[500px] bg-black p-8 flex flex-col items-center text-center group-hover:bg-[#0A0A0A] transition-colors relative overflow-hidden pixel-grid">

                {/* Status Indicator */}
                <div className="absolute top-4 right-4 flex flex-col gap-1 items-end">
                  <span className="text-[8px] font-arcade text-gray-500">{game.type}</span>
                  <div className={`w-2 h-2 rounded-full ${game.status === 'ONLINE' ? 'bg-green-500 shadow-[0_0_8px_green]' : 'bg-red-500'}`}></div>
                </div>

                {/* Icon/Visual */}
                <div className="mt-12 mb-12 transform group-hover:scale-110 transition-transform duration-500">
                  <div className="w-40 h-40 border-4 rounded-full flex items-center justify-center text-8xl relative" style={{ borderColor: game.color, color: game.color, textShadow: `0 0 20px ${game.color}` }}>
                    {game.icon}
                    <div className="absolute inset-0 border-2 border-white/20 rounded-full animate-ping opacity-20"></div>
                  </div>
                </div>

                {/* Content */}
                <h3 className="font-arcade text-3xl text-white mb-4 uppercase tracking-widest">{game.title}</h3>
                <p className="text-gray-500 font-medium text-sm leading-relaxed max-w-xs mx-auto mb-8">
                  {game.description}
                </p>

                {/* Action Button */}
                <div className="mt-auto w-full">
                  <span className="inline-block bg-white text-black font-arcade text-lg px-8 py-3 border-b-4 border-gray-400 group-hover:bg-[#FF8C00] group-hover:border-[#A0522D] transition-all uppercase">
                    START_GAME
                  </span>
                </div>

                {/* Hover Effect: Scanline overlay */}
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity scanlines"></div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Dynamic/Firebase Games List (if any additional ones exist) */}
      {!loading && games.length > 0 && (
        <div className="mb-20">
          <div className="arcade-panel-header bg-[#1A1A1A] text-gray-400 mb-8">ADDITIONAL_SESSIONS</div>
          <div className="space-y-4">
            {games.map((game, i) => (
              <div key={i} className="bg-black border border-[#333] p-6 flex justify-between items-center hover:border-[#FFD400] transition-colors group">
                <div>
                  <h4 className="font-arcade text-xl text-white group-hover:text-[#FFD400]">{game.title}</h4>
                  <p className="text-gray-600 text-xs mt-1 font-arcade uppercase">{game.description}</p>
                </div>
                <button className="text-[#FF8C00] font-arcade text-xs border border-[#FF8C00] px-4 py-2 hover:bg-[#FF8C00] hover:text-black transition-colors">
                  LOAD
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard Section */}
      <section className="relative">
        <div className="flex items-end justify-between mb-10 border-b border-[#333] pb-4">
          <div>
            <div className="text-[#FF8C00] font-arcade text-xs mb-2">NETWORK.TOP_PERFORMERS</div>
            <h2 className="font-arcade text-5xl text-white">HIGH SCORES</h2>
          </div>
          <div className="font-arcade text-xs text-gray-500">RESET_IN: 14:02:55</div>
        </div>

        <div className="bg-[#050505] border-2 border-[#1A1A1A] p-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-[#1A1A1A] text-gray-500 font-arcade text-xs uppercase tracking-widest">
                <th className="p-4">Rank</th>
                <th className="p-4">Pilot_ID</th>
                <th className="p-4 hidden md:table-cell">Module</th>
                <th className="p-4 text-right">Score</th>
              </tr>
            </thead>
            <tbody className="font-arcade text-sm">
              {leaderboard.length > 0 ? (
                leaderboard.map((row, i) => (
                  <tr key={i} className="border-b border-[#111] hover:bg-[#111] transition-colors group">
                    <td className="p-4" style={{ color: i === 0 ? '#FFD400' : i === 1 ? '#FF8C00' : 'white' }}>0{i + 1}</td>
                    <td className="p-4 text-white group-hover:text-[#FFD400] transition-colors uppercase">{row.name}</td>
                    <td className="p-4 text-gray-600 hidden md:table-cell">GLOBAL_XP</td>
                    <td className="p-4 text-right text-[#FF8C00]">{row.xp ? row.xp.toLocaleString() : 0} XP</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-600 font-arcade">SCANNING_NETWORK...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
};

export default Play;
