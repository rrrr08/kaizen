'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function Play() {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const { getGames } = await import('@/lib/firebase');
        const data = await getGames();
        setGames(data);
      } catch (err) {
        console.error('Error fetching games:', err);
        setError('Failed to load games');
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="mb-20 border-b border-white/5 pb-12">
          <div className="text-amber-500 font-header text-[10px] tracking-[0.6em] mb-4 uppercase">Points-Based Games</div>
          <h1 className="font-header text-5xl md:text-7xl lg:text-8xl tracking-tighter mb-8">
            PLAY & EARN
          </h1>
          <p className="text-white/60 font-serif italic text-lg max-w-3xl">
            Challenge yourself with our collection of free online games and puzzles. Earn points for every win and climb the leaderboard.
          </p>
        </div>

        {/* Game Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-24">
          {/* Sudoku */}
          <div className="border border-white/10 p-8 rounded-sm hover:border-amber-500/40 transition-all group cursor-pointer">
            <h3 className="font-header text-[10px] tracking-[0.6em] text-amber-500 mb-4 uppercase">Sudoku</h3>
            <p className="text-white/60 font-serif italic mb-6">25+ Variations</p>
            <p className="text-white/70 font-serif text-sm mb-6 leading-relaxed">
              Challenge your logic and number-solving skills with multiple difficulty levels. Compete with others and earn points.
            </p>
            <div className="space-y-2 mb-8 pt-6 border-t border-white/10">
              <p className="text-white/60 font-header text-[8px] tracking-widest">FEATURES:</p>
              <ul className="space-y-2 text-white/50 font-serif text-xs">
                <li>→ Admin can add/edit puzzles</li>
                <li>→ Answer key via backend</li>
                <li>→ Correct answers = points</li>
              </ul>
            </div>
            <Link href="/play/sudoku" className="block w-full text-center px-6 py-3 bg-amber-500/10 text-amber-500 font-header text-[9px] tracking-[0.3em] hover:bg-amber-500/20 transition-all rounded-sm">
              PLAY NOW
            </Link>
          </div>

          {/* Riddles */}
          <div className="border border-white/10 p-8 rounded-sm hover:border-amber-500/40 transition-all group cursor-pointer relative">
            <h3 className="font-header text-[10px] tracking-[0.6em] text-amber-500 mb-4 uppercase">Riddles</h3>
            <p className="text-white/60 font-serif italic mb-6">Answer & Reveal</p>
            <p className="text-white/70 font-serif text-sm mb-6 leading-relaxed">
              Think outside the box and solve clever riddles. Get feedback on your answers and earn points for correct solutions.
            </p>
            <div className="space-y-2 mb-8 pt-6 border-t border-white/10">
              <p className="text-white/60 font-header text-[8px] tracking-widest">FEATURES:</p>
              <ul className="space-y-2 text-white/50 font-serif text-xs">
                <li>→ Curated riddle collection</li>
                <li>→ Answer reveal mechanic</li>
                <li>→ Points for correct guesses</li>
              </ul>
            </div>
            <Link href="/play/riddles" className="block w-full text-center px-6 py-3 bg-amber-500/10 text-amber-500 font-header text-[9px] tracking-[0.3em] hover:bg-amber-500/20 transition-all rounded-sm">
              PLAY NOW
            </Link>
          </div>

          {/* Puzzles */}
          <div className="border border-white/10 p-8 rounded-sm hover:border-amber-500/40 transition-all group cursor-pointer">
            <h3 className="font-header text-[10px] tracking-[0.6em] text-amber-500 mb-4 uppercase">Puzzles</h3>
            <p className="text-white/60 font-serif italic mb-6">Brain Games</p>
            <p className="text-white/70 font-serif text-sm mb-6 leading-relaxed">
              Test your mental agility with our rotating collection of brain-teasing puzzles and challenges.
            </p>
            <div className="space-y-2 mb-8 pt-6 border-t border-white/10">
              <p className="text-white/60 font-header text-[8px] tracking-widest">FEATURES:</p>
              <ul className="space-y-2 text-white/50 font-serif text-xs">
                <li>→ Daily puzzle rotation</li>
                <li>→ Increasing difficulty</li>
                <li>→ Leaderboard rankings</li>
              </ul>
            </div>
            <button className="w-full px-6 py-3 bg-amber-500/10 text-amber-500 font-header text-[9px] tracking-[0.3em] hover:bg-amber-500/20 transition-all rounded-sm">
              PLAY NOW
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mb-4"></div>
              <p className="text-white/60 font-header text-[10px] tracking-[0.4em]">LOADING GAMES...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-24">
            <p className="text-red-500 font-header text-[10px] tracking-[0.4em]">{error}</p>
          </div>
        )}

        {/* Game List */}
        {!loading && !error && (
          <div className="mb-24">
            <h2 className="font-header text-3xl md:text-4xl mb-8">Available Games</h2>
            <div className="space-y-4">
              {games.map(game => (
                <div key={game.id} className="border border-white/10 p-6 rounded-sm hover:border-amber-500/40 transition-all flex justify-between items-center cursor-pointer group">
                  <div>
                    <p className="font-header text-[10px] tracking-[0.3em] text-amber-500 mb-2">{(game.category || 'GAME').toUpperCase()}</p>
                    <h3 className="font-header text-lg group-hover:text-amber-400 transition-colors">{game.title || game.name}</h3>
                    <p className="text-white/50 font-serif italic text-sm mt-2">{game.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-amber-500 font-serif italic text-2xl">+{game.points || 10}</p>
                    <p className="text-white/40 font-header text-[8px] tracking-widest mt-2">PTS</p>
                  </div>
                </div>
              ))}
            </div>
            {games.length === 0 && (
              <div className="text-center py-12">
                <p className="text-white/60 font-header text-[10px] tracking-[0.4em]">NO GAMES AVAILABLE</p>
              </div>
            )}
          </div>
        )}

        {/* Leaderboard Section */}
        <div className="mb-24">
          <h2 className="font-header text-3xl md:text-4xl mb-8">Top Players</h2>
          <div className="border border-white/10 rounded-sm overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-white/10 bg-white/5">
                <tr>
                  <th className="text-left p-6 font-header text-[9px] tracking-widest text-amber-500">RANK</th>
                  <th className="text-left p-6 font-header text-[9px] tracking-widest text-amber-500">PLAYER</th>
                  <th className="text-left p-6 font-header text-[9px] tracking-widest text-amber-500">POINTS</th>
                  <th className="text-left p-6 font-header text-[9px] tracking-widest text-amber-500">GAMES PLAYED</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { rank: 1, name: 'ShadowGamer', points: 5420, games: 34 },
                  { rank: 2, name: 'PuzzleMaster', points: 4980, games: 29 },
                  { rank: 3, name: 'RiddleSolver', points: 4650, games: 27 },
                  { rank: 4, name: 'BrainTease', points: 4120, games: 24 },
                  { rank: 5, name: 'LogicLord', points: 3890, games: 22 },
                ].map(player => (
                  <tr key={player.rank} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-6 font-header text-lg text-amber-500">{player.rank}</td>
                    <td className="p-6 font-header text-[10px] tracking-widest">{player.name}</td>
                    <td className="p-6 font-serif italic text-lg text-amber-500">{player.points}</td>
                    <td className="p-6 font-serif text-white/60">{player.games}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Section */}
        <div className="text-center py-16 border-t border-white/10">
          <h2 className="font-header text-3xl md:text-4xl mb-6">Rules & Rewards</h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-white/60 font-serif italic mb-8">
              Play, earn points, and redeem them for exclusive rewards. The more you play, the more you earn. Climb the leaderboard and compete with players worldwide.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="border border-white/10 p-6 rounded-sm">
                <p className="font-header text-[8px] tracking-widest text-amber-500 mb-2">DAILY BONUS</p>
                <p className="font-serif italic text-lg text-white">+100 pts</p>
              </div>
              <div className="border border-white/10 p-6 rounded-sm">
                <p className="font-header text-[8px] tracking-widest text-amber-500 mb-2">STREAK BONUS</p>
                <p className="font-serif italic text-lg text-white">2x pts</p>
              </div>
              <div className="border border-white/10 p-6 rounded-sm">
                <p className="font-header text-[8px] tracking-widest text-amber-500 mb-2">LEADERBOARD</p>
                <p className="font-serif italic text-lg text-white">Monthly</p>
              </div>
              <div className="border border-white/10 p-6 rounded-sm">
                <p className="font-header text-[8px] tracking-widest text-amber-500 mb-2">REDEEM</p>
                <p className="font-serif italic text-lg text-white">Rewards</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
