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
    <div className="min-h-screen pt-28 pb-16 bg-[#FFFDF5]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="mb-20 border-b-2 border-black pb-12">
          <div className="text-[#6C5CE7] font-black text-sm tracking-[0.2em] mb-4 uppercase font-display">Points-Based Games</div>
          <h1 className="font-header text-6xl md:text-8xl tracking-tighter mb-8 text-[#2D3436]">
            PLAY & <span className="text-[#FFD93D] drop-shadow-[2px_2px_0px_#000] italic font-serif">EARN</span>
          </h1>
          <p className="text-black/80 font-bold text-xl max-w-3xl leading-relaxed">
            Challenge yourself with our collection of free online games and puzzles. Earn points for every win and climb the leaderboard.
          </p>
        </div>

        {/* Game Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {/* Sudoku */}
          <div className="bg-white border-2 border-black p-8 rounded-[30px] neo-shadow hover:scale-[1.02] transition-transform group">
            <h3 className="font-black text-sm tracking-[0.2em] text-[#6C5CE7] mb-4 uppercase">Sudoku</h3>
            <p className="text-black font-black text-2xl mb-4">25+ Variations</p>
            <p className="text-black/70 font-medium text-sm mb-6 leading-relaxed">
              Challenge your logic and number-solving skills with multiple difficulty levels. Compete with others and earn points.
            </p>
            <div className="space-y-3 mb-8 pt-6 border-t-2 border-black/10">
              <p className="text-black/40 font-black text-[10px] tracking-widest">FEATURES:</p>
              <ul className="space-y-2 text-black/80 font-bold text-xs">
                <li>→ Admin can add/edit puzzles</li>
                <li>→ Answer key via backend</li>
                <li>→ Correct answers = points</li>
              </ul>
            </div>
            <Link href="/play/sudoku" className="block w-full text-center px-6 py-4 bg-[#FFD93D] text-black font-black text-xs tracking-[0.3em] border-2 border-black shadow-[4px_4px_0px_#000] hover:translate-y-1 hover:shadow-none transition-all rounded-xl">
              PLAY NOW
            </Link>
          </div>

          {/* Riddles */}
          <div className="bg-white border-2 border-black p-8 rounded-[30px] neo-shadow hover:scale-[1.02] transition-transform group relative">
            <h3 className="font-black text-sm tracking-[0.2em] text-[#00B894] mb-4 uppercase">Riddles</h3>
            <p className="text-black font-black text-2xl mb-4">Answer & Reveal</p>
            <p className="text-black/70 font-medium text-sm mb-6 leading-relaxed">
              Think outside the box and solve clever riddles. Get feedback on your answers and earn points for correct solutions.
            </p>
            <div className="space-y-3 mb-8 pt-6 border-t-2 border-black/10">
              <p className="text-black/40 font-black text-[10px] tracking-widest">FEATURES:</p>
              <ul className="space-y-2 text-black/80 font-bold text-xs">
                <li>→ Curated riddle collection</li>
                <li>→ Answer reveal mechanic</li>
                <li>→ Points for correct guesses</li>
              </ul>
            </div>
            <Link href="/play/riddles" className="block w-full text-center px-6 py-4 bg-[#00B894] text-black font-black text-xs tracking-[0.3em] border-2 border-black shadow-[4px_4px_0px_#000] hover:translate-y-1 hover:shadow-none transition-all rounded-xl">
              PLAY NOW
            </Link>
          </div>

          {/* Puzzles */}
          <div className="bg-white border-2 border-black p-8 rounded-[30px] neo-shadow hover:scale-[1.02] transition-transform group">
            <h3 className="font-black text-sm tracking-[0.2em] text-[#FF7675] mb-4 uppercase">Puzzles</h3>
            <p className="text-black font-black text-2xl mb-4">Brain Games</p>
            <p className="text-black/70 font-medium text-sm mb-6 leading-relaxed">
              Test your mental agility with our rotating collection of brain-teasing puzzles and challenges.
            </p>
            <div className="space-y-3 mb-8 pt-6 border-t-2 border-black/10">
              <p className="text-black/40 font-black text-[10px] tracking-widest">FEATURES:</p>
              <ul className="space-y-2 text-black/80 font-bold text-xs">
                <li>→ Daily puzzle rotation</li>
                <li>→ Increasing difficulty</li>
                <li>→ Leaderboard rankings</li>
              </ul>
            </div>
            <button className="w-full px-6 py-4 bg-[#FF7675] text-black font-black text-xs tracking-[0.3em] border-2 border-black shadow-[4px_4px_0px_#000] hover:translate-y-1 hover:shadow-none transition-all rounded-xl">
              PLAY NOW
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#FFD93D] border-t-black mb-4"></div>
              <p className="text-black/60 font-black text-xs tracking-[0.4em]">LOADING GAMES...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-24">
            <p className="text-red-500 font-black text-lg">{error}</p>
          </div>
        )}

        {/* Game List */}
        {!loading && !error && (
          <div className="mb-24">
            <h2 className="font-header text-4xl md:text-5xl mb-8 text-black">Available Games</h2>
            <div className="space-y-4">
              {games.map(game => (
                <div key={game.id} className="bg-white border-2 border-black p-6 rounded-2xl shadow-[4px_4px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex justify-between items-center cursor-pointer group">
                  <div>
                    <p className="font-black text-[10px] tracking-[0.3em] text-[#6C5CE7] mb-2 uppercase">{(game.category || 'GAME')}</p>
                    <h3 className="font-header text-2xl text-black group-hover:text-[#6C5CE7] transition-colors">{game.title || game.name}</h3>
                    <p className="text-black/60 font-bold text-sm mt-2">{game.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#00B894] font-black text-3xl">+{game.points || 10}</p>
                    <p className="text-black/40 font-black text-[10px] tracking-widest mt-1">PTS</p>
                  </div>
                </div>
              ))}
            </div>
            {games.length === 0 && (
              <div className="text-center py-12">
                <p className="text-black/60 font-black text-lg uppercase">NO GAMES AVAILABLE</p>
              </div>
            )}
          </div>
        )}

        {/* Leaderboard Section */}
        <div className="mb-24">
          <h2 className="font-header text-4xl md:text-5xl mb-8 text-black">Top Players</h2>
          <div className="bg-white border-2 border-black rounded-[30px] overflow-hidden neo-shadow">
            <table className="w-full">
              <thead className="border-b-2 border-black bg-[#FFD93D]">
                <tr>
                  <th className="text-left p-6 font-black text-[10px] tracking-widest text-black">RANK</th>
                  <th className="text-left p-6 font-black text-[10px] tracking-widest text-black">PLAYER</th>
                  <th className="text-left p-6 font-black text-[10px] tracking-widest text-black">POINTS</th>
                  <th className="text-left p-6 font-black text-[10px] tracking-widest text-black">GAMES PLAYED</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { rank: 1, name: 'ShadowGamer', points: 5420, games: 34 },
                  { rank: 2, name: 'PuzzleMaster', points: 4980, games: 29 },
                  { rank: 3, name: 'RiddleSolver', points: 4650, games: 27 },
                  { rank: 4, name: 'BrainTease', points: 4120, games: 24 },
                  { rank: 5, name: 'LogicLord', points: 3890, games: 22 },
                ].map((player, i) => (
                  <tr key={player.rank} className={`border-b border-black/10 hover:bg-[#FFFDF5] transition-colors ${i === 4 ? 'border-b-0' : ''}`}>
                    <td className="p-6 font-black text-xl text-[#00B894]">#{player.rank}</td>
                    <td className="p-6 font-bold text-sm tracking-wide text-black">{player.name}</td>
                    <td className="p-6 font-black text-xl text-black">{player.points.toLocaleString()}</td>
                    <td className="p-6 font-bold text-black/60">{player.games}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Section */}
        <div className="text-center py-16 border-t-2 border-black/10">
          <h2 className="font-header text-4xl md:text-5xl mb-6 text-black">Rules & Rewards</h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-black/70 font-medium text-lg mb-12 leading-relaxed">
              Play, earn points, and redeem them for exclusive rewards. The more you play, the more you earn. Climb the leaderboard and compete with players worldwide.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white border-2 border-black p-6 rounded-2xl neo-shadow">
                <p className="font-black text-[10px] tracking-widest text-[#6C5CE7] mb-2 uppercase">DAILY BONUS</p>
                <p className="font-black text-2xl text-black">+100 pts</p>
              </div>
              <div className="bg-white border-2 border-black p-6 rounded-2xl neo-shadow">
                <p className="font-black text-[10px] tracking-widest text-[#00B894] mb-2 uppercase">STREAK BONUS</p>
                <p className="font-black text-2xl text-black">2x pts</p>
              </div>
              <div className="bg-white border-2 border-black p-6 rounded-2xl neo-shadow">
                <p className="font-black text-[10px] tracking-widest text-[#FF7675] mb-2 uppercase">LEADERBOARD</p>
                <p className="font-black text-2xl text-black">Monthly</p>
              </div>
              <div className="bg-white border-2 border-black p-6 rounded-2xl neo-shadow">
                <p className="font-black text-[10px] tracking-widest text-[#FFD93D] mb-2 uppercase">REDEEM</p>
                <p className="font-black text-2xl text-black">Rewards</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
