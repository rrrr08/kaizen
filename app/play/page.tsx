'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Dice5, Disc, ArrowRight, RotateCw } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function Play() {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rotationPolicy, setRotationPolicy] = useState<any>(null);
  const [todaysGames, setTodaysGames] = useState<string[]>([]);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);

        // Fetch rotation policy
        const rotationRes = await fetch('/api/games/rotation-policy');
        const rotationData = await rotationRes.json();
        setRotationPolicy(rotationData);

        // Get today's games if rotation is enabled
        if (rotationData.enabled) {
          const today = new Date().toISOString().slice(0, 10);
          const todaysGameIds = rotationData.rotationSchedule?.[today] || [];
          setTodaysGames(todaysGameIds);
        }

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

          {rotationPolicy?.enabled && (
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#6C5CE7] text-white rounded-full font-bold text-sm border-2 border-black shadow-[4px_4px_0px_#000]">
                <RotateCw size={16} /> Today&apos;s 3 Featured Games
              </div>
              {rotationPolicy?.gameOfTheDay && (
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFD93D] text-black rounded-full font-black text-sm border-2 border-black shadow-[4px_4px_0px_#000] uppercase tracking-wider">
                  ⭐ Game of the Day: {rotationPolicy.gameOfTheDay.replace(/^\w/, (c: string) => c.toUpperCase())}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Daily Spin Feature */}
        <div className="mb-24 bg-gradient-to-r from-[#FFD93D] via-[#FF7675] to-[#6C5CE7] border-2 border-black p-8 rounded-[30px] neo-shadow">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="font-header text-4xl mb-3 text-white drop-shadow-[2px_2px_0px_#000] flex items-center gap-3">
                <Dice5 size={40} className="text-white" /> DAILY SPIN
              </h2>
              <p className="text-white/90 font-bold text-lg mb-4">
                Spin the wheel once per day for FREE! Win bonus points and prizes.
              </p>
              <Link href="/play/daily-spin" className="inline-block px-8 py-4 bg-white text-black font-black text-sm tracking-[0.3em] border-2 border-black shadow-[4px_4px_0px_#000] hover:translate-y-1 hover:shadow-none transition-all rounded-xl">
                SPIN NOW
              </Link>
            </div>
            <div className="text-white">
              <Disc size={120} strokeWidth={1} className="drop-shadow-[4px_4px_0px_#000]" />
            </div>
          </div>
        </div>

        {/* Game Categories - Strictly Filtered to 3 Games */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {/* Sudoku */}
          {(!rotationPolicy?.enabled || todaysGames.includes('sudoku')) && (
            <div className="bg-white border-2 border-black p-8 rounded-[30px] neo-shadow hover:scale-[1.02] transition-transform group relative overflow-hidden">
              {rotationPolicy?.gameOfTheDay === 'sudoku' && (
                <div className="absolute top-0 right-0 bg-[#FFD93D] text-black text-xs font-black px-4 py-2 border-b-2 border-l-2 border-black rounded-bl-xl z-10 shadow-sm">
                  GAME OF THE DAY
                </div>
              )}
              <h3 className="font-black text-sm tracking-[0.2em] text-[#6C5CE7] mb-4 uppercase">Sudoku</h3>
              <p className="text-black font-black text-2xl mb-4">25+ Variations</p>
              <p className="text-black/70 font-medium text-sm mb-6 leading-relaxed">
                Challenge your logic and number-solving skills.
              </p>
              <Link href="/play/sudoku" className="block w-full text-center px-6 py-4 bg-[#FFD93D] text-black font-black text-xs tracking-[0.3em] border-2 border-black shadow-[4px_4px_0px_#000] hover:translate-y-1 hover:shadow-none transition-all rounded-xl">
                PLAY NOW
              </Link>
            </div>
          )}

          {/* Riddles */}
          {(!rotationPolicy?.enabled || todaysGames.includes('riddle')) && (
            <div className="bg-white border-2 border-black p-8 rounded-[30px] neo-shadow hover:scale-[1.02] transition-transform group relative overflow-hidden">
              {rotationPolicy?.gameOfTheDay === 'riddle' && (
                <div className="absolute top-0 right-0 bg-[#FFD93D] text-black text-xs font-black px-4 py-2 border-b-2 border-l-2 border-black rounded-bl-xl z-10 shadow-sm">
                  GAME OF THE DAY
                </div>
              )}
              <h3 className="font-black text-sm tracking-[0.2em] text-[#00B894] mb-4 uppercase">Riddles</h3>
              <p className="text-black font-black text-2xl mb-4">Answer & Reveal</p>
              <p className="text-black/70 font-medium text-sm mb-6 leading-relaxed">
                Think outside the box and solve clever riddles.
              </p>
              <Link href="/play/riddles" className="block w-full text-center px-6 py-4 bg-[#00B894] text-black font-black text-xs tracking-[0.3em] border-2 border-black shadow-[4px_4px_0px_#000] hover:translate-y-1 hover:shadow-none transition-all rounded-xl">
                PLAY NOW
              </Link>
            </div>
          )}

          {/* Puzzles */}
          {(!rotationPolicy?.enabled || todaysGames.includes('puzzles')) && (
            <div className="bg-white border-2 border-black p-8 rounded-[30px] neo-shadow hover:scale-[1.02] transition-transform group relative overflow-hidden">
              {rotationPolicy?.gameOfTheDay === 'puzzles' && (
                <div className="absolute top-0 right-0 bg-[#FFD93D] text-black text-xs font-black px-4 py-2 border-b-2 border-l-2 border-black rounded-bl-xl z-10 shadow-sm">
                  GAME OF THE DAY
                </div>
              )}
              <h3 className="font-black text-sm tracking-[0.2em] text-[#FF7675] mb-4 uppercase">Brain Games</h3>
              <p className="text-black font-black text-2xl mb-4">3-in-1 Challenge</p>
              <p className="text-black/70 font-medium text-sm mb-6 leading-relaxed">
                Tic-Tac-Toe, Memory Match, Number Puzzle.
              </p>
              <Link href="/play/puzzles" className="block w-full text-center px-6 py-4 bg-[#FF7675] text-black font-black text-xs tracking-[0.3em] border-2 border-black shadow-[4px_4px_0px_#000] hover:translate-y-1 hover:shadow-none transition-all rounded-xl">
                PLAY NOW
              </Link>
            </div>
          )}

          {/* Wordle */}
          {(!rotationPolicy?.enabled || todaysGames.includes('wordle')) && (
            <div className="bg-white border-2 border-black p-8 rounded-[30px] neo-shadow hover:scale-[1.02] transition-transform group relative overflow-hidden">
              {rotationPolicy?.gameOfTheDay === 'wordle' && (
                <div className="absolute top-0 right-0 bg-[#FFD93D] text-black text-xs font-black px-4 py-2 border-b-2 border-l-2 border-black rounded-bl-xl z-10 shadow-sm">
                  GAME OF THE DAY
                </div>
              )}
              <h3 className="font-black text-sm tracking-[0.2em] text-[#A29BFE] mb-4 uppercase">Wordle</h3>
              <p className="text-black font-black text-2xl mb-4">Word Guessing</p>
              <p className="text-black/70 font-medium text-sm mb-6 leading-relaxed">
                Guess the 5-letter word in 6 tries.
              </p>
              <Link href="/play/wordle" className="block w-full text-center px-6 py-4 bg-[#A29BFE] text-black font-black text-xs tracking-[0.3em] border-2 border-black shadow-[4px_4px_0px_#000] hover:translate-y-1 hover:shadow-none transition-all rounded-xl">
                PLAY NOW
              </Link>
            </div>
          )}

          {/* Chess Puzzle */}
          {(!rotationPolicy?.enabled || todaysGames.includes('chess')) && (
            <div className="bg-white border-2 border-black p-8 rounded-[30px] neo-shadow hover:scale-[1.02] transition-transform group relative overflow-hidden">
              {rotationPolicy?.gameOfTheDay === 'chess' && (
                <div className="absolute top-0 right-0 bg-[#FFD93D] text-black text-xs font-black px-4 py-2 border-b-2 border-l-2 border-black rounded-bl-xl z-10 shadow-sm">
                  GAME OF THE DAY
                </div>
              )}
              <h3 className="font-black text-sm tracking-[0.2em] text-[#FD79A8] mb-4 uppercase">Chess Puzzle</h3>
              <p className="text-black font-black text-2xl mb-4">Mate in 2-3</p>
              <p className="text-black/70 font-medium text-sm mb-6 leading-relaxed">
                Solve chess puzzles.
              </p>
              <Link href="/play/chess" className="block w-full text-center px-6 py-4 bg-[#FD79A8] text-black font-black text-xs tracking-[0.3em] border-2 border-black shadow-[4px_4px_0px_#000] hover:translate-y-1 hover:shadow-none transition-all rounded-xl">
                PLAY NOW
              </Link>
            </div>
          )}

          {/* Trivia */}
          {(!rotationPolicy?.enabled || todaysGames.includes('trivia')) && (
            <div className="bg-white border-2 border-black p-8 rounded-[30px] neo-shadow hover:scale-[1.02] transition-transform group relative overflow-hidden">
              {rotationPolicy?.gameOfTheDay === 'trivia' && (
                <div className="absolute top-0 right-0 bg-[#FFD93D] text-black text-xs font-black px-4 py-2 border-b-2 border-l-2 border-black rounded-bl-xl z-10 shadow-sm">
                  GAME OF THE DAY
                </div>
              )}
              <h3 className="font-black text-sm tracking-[0.2em] text-[#74B9FF] mb-4 uppercase">Trivia Quiz</h3>
              <p className="text-black font-black text-2xl mb-4">5 Questions</p>
              <p className="text-black/70 font-medium text-sm mb-6 leading-relaxed">
                Answer trivia questions.
              </p>
              <Link href="/play/trivia" className="block w-full text-center px-6 py-4 bg-[#74B9FF] text-black font-black text-xs tracking-[0.3em] border-2 border-black shadow-[4px_4px_0px_#000] hover:translate-y-1 hover:shadow-none transition-all rounded-xl">
                PLAY NOW
              </Link>
            </div>
          )}

          {/* 2048 */}
          {(!rotationPolicy?.enabled || todaysGames.includes('2048')) && (
            <div className="bg-white border-2 border-black p-8 rounded-[30px] neo-shadow hover:scale-[1.02] transition-transform group relative overflow-hidden">
              {rotationPolicy?.gameOfTheDay === '2048' && (
                <div className="absolute top-0 right-0 bg-[#FFD93D] text-black text-xs font-black px-4 py-2 border-b-2 border-l-2 border-black rounded-bl-xl z-10 shadow-sm">
                  GAME OF THE DAY
                </div>
              )}
              <h3 className="font-black text-sm tracking-[0.2em] text-[#FDCB6E] mb-4 uppercase">2048</h3>
              <p className="text-black font-black text-2xl mb-4">Slide & Merge</p>
              <p className="text-black/70 font-medium text-sm mb-6 leading-relaxed">
                Combine tiles to reach 2048.
              </p>
              <Link href="/play/2048" className="block w-full text-center px-6 py-4 bg-[#FDCB6E] text-black font-black text-xs tracking-[0.2em] border-2 border-black shadow-[4px_4px_0px_#000] hover:translate-y-1 hover:shadow-none transition-all rounded-xl">
                PLAY NOW
              </Link>
            </div>
          )}

          {/* Hangman */}
          {(!rotationPolicy?.enabled || todaysGames.includes('hangman')) && (
            <div className="bg-white border-2 border-black p-8 rounded-[30px] neo-shadow hover:scale-[1.02] transition-transform group relative overflow-hidden">
              {rotationPolicy?.gameOfTheDay === 'hangman' && (
                <div className="absolute top-0 right-0 bg-[#FFD93D] text-black text-xs font-black px-4 py-2 border-b-2 border-l-2 border-black rounded-bl-xl z-10 shadow-sm">
                  GAME OF THE DAY
                </div>
              )}
              <h3 className="font-black text-sm tracking-[0.2em] text-[#E17055] mb-4 uppercase">Hangman</h3>
              <p className="text-black font-black text-2xl mb-4">Guess Letters</p>
              <p className="text-black/70 font-medium text-sm mb-6 leading-relaxed">
                Find the word before 6 wrong guesses.
              </p>
              <Link href="/play/hangman" className="block w-full text-center px-6 py-4 bg-[#E17055] text-black font-black text-xs tracking-[0.2em] border-2 border-black shadow-[4px_4px_0px_#000] hover:translate-y-1 hover:shadow-none transition-all rounded-xl">
                PLAY NOW
              </Link>
            </div>
          )}

          {/* Word Search */}
          {(!rotationPolicy?.enabled || todaysGames.includes('wordsearch')) && (
            <div className="bg-white border-2 border-black p-8 rounded-[30px] neo-shadow hover:scale-[1.02] transition-transform group relative overflow-hidden">
              {rotationPolicy?.gameOfTheDay === 'wordsearch' && (
                <div className="absolute top-0 right-0 bg-[#FFD93D] text-black text-xs font-black px-4 py-2 border-b-2 border-l-2 border-black rounded-bl-xl z-10 shadow-sm">
                  GAME OF THE DAY
                </div>
              )}
              <h3 className="font-black text-sm tracking-[0.2em] text-[#00B894] mb-4 uppercase">Word Search</h3>
              <p className="text-black font-black text-2xl mb-4">Find Words</p>
              <p className="text-black/70 font-medium text-sm mb-6 leading-relaxed">
                Locate hidden words in the grid.
              </p>
              <Link href="/play/wordsearch" className="block w-full text-center px-6 py-4 bg-[#00B894] text-black font-black text-xs tracking-[0.2em] border-2 border-black shadow-[4px_4px_0px_#000] hover:translate-y-1 hover:shadow-none transition-all rounded-xl">
                PLAY NOW
              </Link>
            </div>
          )}

          {/* Math Quiz */}
          {(!rotationPolicy?.enabled || todaysGames.includes('mathquiz')) && (
            <div className="bg-white border-2 border-black p-8 rounded-[30px] neo-shadow hover:scale-[1.02] transition-transform group relative overflow-hidden">
              {rotationPolicy?.gameOfTheDay === 'mathquiz' && (
                <div className="absolute top-0 right-0 bg-[#FFD93D] text-black text-xs font-black px-4 py-2 border-b-2 border-l-2 border-black rounded-bl-xl z-10 shadow-sm">
                  GAME OF THE DAY
                </div>
              )}
              <h3 className="font-black text-sm tracking-[0.2em] text-[#0984E3] mb-4 uppercase">Math Quiz</h3>
              <p className="text-black font-black text-2xl mb-4">Solve Problems</p>
              <p className="text-black/70 font-medium text-sm mb-6 leading-relaxed">
                10 math questions, 20s each.
              </p>
              <Link href="/play/mathquiz" className="block w-full text-center px-6 py-4 bg-[#0984E3] text-black font-black text-xs tracking-[0.2em] border-2 border-black shadow-[4px_4px_0px_#000] hover:translate-y-1 hover:shadow-none transition-all rounded-xl">
                PLAY NOW
              </Link>
            </div>
          )}
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

        {/* Game List - Only show if current user isn't logged in, as a teaser? Or hide completely as above cards cover it. User asked for ONLY 3 games at a time. So I will HIDE this list to be compliant. */}
        {/* HIDING AVAILABLE GAMES LIST TO ENFORCE 3-GAME POLICY STRICTNESS */}
        {/* {!loading && !error && (
          <div className="mb-24">
             ...
          </div>
        )} */}

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
