"use client";
import React, { useState, useEffect } from 'react';
import { generateDailyPuzzle } from '@/lib/geminiService';
import { useAuth } from '@/app/context/AuthContext';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile } from '@/lib/types';
import { LoadingScreen } from '@/components/ui/loading-screen';

const Community: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [puzzle, setPuzzle] = useState<{ riddle: string, answer: string } | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [puzzleData, leaderboardSnapshot] = await Promise.all([
          generateDailyPuzzle(),
          getDocs(query(collection(db, 'users'), orderBy('xp', 'desc'), limit(5)))
        ]);

        setPuzzle(puzzleData);

        const leaderboardData = leaderboardSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as UserProfile[];
        setLeaderboard(leaderboardData);

      } catch (e) {
        console.error("Failed to fetch community data", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = () => {
    if (puzzle && userAnswer.toLowerCase().trim().includes(puzzle.answer.toLowerCase().trim())) {
      setMessage("✅ ACCESS GRANTED! +250 TOKENS ADDED.");
      // TODO: Call API to add tokens
    } else {
      setMessage("❌ ERROR: INCORRECT DATA. TRY AGAIN.");
    }
  };

  if (loading) return <LoadingScreen message="CONNECTING_TO_HUB..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-20 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Left: Stats & Profile */}
        <div className="lg:col-span-1 space-y-12">
          <div className="relative group">
            <div className="arcade-panel-header bg-[#FF8C00]">PILOT.STATS</div>
            <div className="arcade-card-3d p-10 bg-gradient-to-br from-[#111] to-black">
              {user && userProfile ? (
                <>
                  <div className="flex items-center gap-8 mb-10">
                    <div className="w-24 h-24 arcade-card-3d border-[#FF8C00] flex items-center justify-center overflow-hidden shadow-[6px_6px_0px_#FF8C00]">
                      {userProfile.photoURL ? (
                        <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-arcade text-5xl text-white">{userProfile.name?.charAt(0) || 'P'}</span>
                      )}
                    </div>
                    <div>
                      <h2 className="font-arcade text-3xl text-white truncate max-w-[150px]">{userProfile.name || 'PILOT'}</h2>
                      <div className="text-[#FF8C00] font-arcade text-xs mt-1 animate-pulse">STATUS: {userProfile.role === 'admin' ? 'ADMIN_CMD' : 'ACTIVE_PILOT'}</div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between font-arcade text-[10px] tracking-widest text-gray-500">
                      <span>XP_BAR_PROGRESS</span>
                      <span className="text-[#FFD400]">{(userProfile.xp || 0) % 1000} / 1000</span>
                    </div>
                    <div className="w-full bg-black h-6 border-2 border-[#1A1A1A] p-1">
                      <div className="bg-[#FFD400] h-full shadow-[0_0_10px_#FFD400]" style={{ width: `${((userProfile.xp || 0) % 1000) / 10}%` }}></div>
                    </div>
                  </div>

                  <div className="mt-12 grid grid-cols-2 gap-6">
                    <div className="bg-black p-6 border-2 border-[#1A1A1A] text-center shadow-inner group-hover:border-[#FF8C00] transition-colors">
                      <div className="font-arcade text-2xl text-[#FF8C00] truncate">{userProfile.balance || 0}</div>
                      <div className="text-[10px] font-arcade text-gray-500 mt-2">TOKENS</div>
                    </div>
                    <div className="bg-black p-6 border-2 border-[#1A1A1A] text-center shadow-inner group-hover:border-[#FFD400] transition-colors">
                      <div className="font-arcade text-2xl text-[#FFD400]">{Math.floor((userProfile.xp || 0) / 1000)}</div>
                      <div className="text-[10px] font-arcade text-gray-500 mt-2">LEVEL</div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500 font-arcade mb-4">NO_PILOT_DETECTED</p>
                  <a href="/auth/login" className="text-[#FF8C00] border-b border-[#FF8C00] pb-1 font-arcade text-xs hover:text-white hover:border-white uppercase">Initialize Login Sequence</a>
                </div>
              )}
            </div>
          </div>

          <div className="relative group">
            <div className="arcade-panel-header bg-white text-black">MISSIONS.LOG</div>
            <div className="arcade-card-3d p-10 bg-[#050505]">
              <h3 className="font-arcade text-xl mb-8 text-[#FFD400] uppercase tracking-tighter">ACTIVE_DIRECTIVES</h3>
              <ul className="space-y-6 text-sm">
                <li className="flex items-center gap-4 text-gray-600">
                  <div className="w-5 h-5 border-2 border-gray-800 flex items-center justify-center text-xs">✓</div>
                  <span className="line-through font-bold">Join your first event</span>
                </li>
                <li className="flex items-center gap-4 text-white">
                  <div className="w-5 h-5 border-2 border-[#FF8C00] animate-pulse"></div>
                  <span className="font-bold">Solve the daily riddle</span>
                </li>
                <li className="flex items-center gap-4 text-white">
                  <div className="w-5 h-5 border-2 border-[#FFD400]"></div>
                  <span className="font-bold">Purchase a strategy game</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Center/Right: Feed & Daily Puzzle */}
        <div className="lg:col-span-2 space-y-16">
          {/* Daily Puzzle Section */}
          <div className="relative group">
            <div className="arcade-panel-header bg-[#FFD400] text-black">PUZZLE.SYSTEM</div>
            <div className="arcade-card-3d p-12 bg-black relative overflow-hidden scanlines">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#FFD400] opacity-30 animate-pulse"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-12">
                  <h2 className="font-arcade text-5xl text-3d-yellow leading-none">DAILY ENIGMA</h2>
                  <div className="bg-red-600 text-white font-arcade text-xs px-4 py-2 animate-pulse shadow-[4px_4px_0px_black]">LIVE_SIGNAL</div>
                </div>

                <>
                  <div className="p-10 border-4 border-dashed border-[#1A1A1A] group-hover:border-[#FF8C00] transition-colors mb-12 bg-[#050505]">
                    <p className="text-2xl italic text-gray-200 leading-relaxed font-medium">
                      "{puzzle?.riddle}"
                    </p>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 mb-8">
                    <input
                      type="text"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="DECODE_HERE_"
                      className="flex-grow bg-[#111] border-4 border-[#1A1A1A] p-6 font-arcade text-white focus:border-[#FFD400] outline-none transition-all placeholder:text-gray-800"
                    />
                    <button
                      onClick={handleSubmit}
                      className="bg-[#FFD400] text-black font-arcade text-xl px-12 py-6 border-b-8 border-[#B8860B] active:border-b-0 active:translate-y-2 transition-all hover:bg-white"
                    >
                      TRANSMIT
                    </button>
                  </div>

                  {message && (
                    <div className={`font-arcade text-lg p-6 border-4 shadow-[8px_8px_0px_black] ${message.startsWith('✅') ? 'text-green-400 border-green-400 bg-green-400/5' : 'text-red-500 border-red-500 bg-red-500/5'}`}>
                      {message}
                    </div>
                  )}
                </>

                <div className="mt-12 pt-8 border-t border-[#1A1A1A] flex justify-between items-center text-[10px] font-arcade text-gray-600 tracking-[0.3em]">
                  <span>NODE_ID: #042</span>
                  <span className="text-[#FF8C00]">PRIZE: 250_TOKENS</span>
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="relative group">
            <div className="arcade-panel-header bg-[#FF8C00]">GLOBAL.RANKINGS</div>
            <div className="arcade-card-3d p-12 bg-[#050505]">
              <h3 className="font-arcade text-4xl mb-12 text-3d-orange">THE HALL OF FAME</h3>
              <div className="space-y-4">
                {leaderboard.map((user, i) => (
                  <div key={user.id} className="flex items-center justify-between p-6 bg-black border-2 border-[#111] hover:border-[#FF8C00] transition-all transform hover:-translate-x-2 group">
                    <div className="flex items-center gap-10">
                      <span className="font-arcade text-4xl opacity-20 group-hover:opacity-100 transition-opacity" style={{ color: i === 0 ? '#FFD400' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'white' }}>0{i + 1}</span>
                      <span className="font-arcade text-xl text-white tracking-widest uppercase">{user.name}</span>
                    </div>
                    <div className="flex items-center gap-12">
                      <span className="font-arcade text-[#FF8C00] text-lg">{user.xp || 0} XP</span>
                      <span className="text-2xl filter group-hover:drop-shadow-[0_0_8px_white] transition-all">
                        {i < 2 ? '↗️' : '➖'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
