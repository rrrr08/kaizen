'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Dice5, Disc, ArrowRight, RotateCw, Trophy, Sparkles, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const Wheel = () => (
  <div className="relative w-32 h-32 md:w-40 md:h-40">
    <motion.svg
      viewBox="0 0 100 100"
      className="w-full h-full drop-shadow-[4px_4px_0px_#000]"
      animate={{ rotate: 360 }}
      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
    >
      <circle cx="50" cy="50" r="48" fill="#FFF" stroke="#000" strokeWidth="2" />
      <path d="M50 50 L50 2 A48 48 0 0 1 98 50 Z" fill="#FF7675" stroke="#000" strokeWidth="1" />
      <path d="M50 50 L98 50 A48 48 0 0 1 50 98 Z" fill="#6C5CE7" stroke="#000" strokeWidth="1" />
      <path d="M50 50 L50 98 A48 48 0 0 1 2 50 Z" fill="#00B894" stroke="#000" strokeWidth="1" />
      <path d="M50 50 L2 50 A48 48 0 0 1 50 2 Z" fill="#FFD93D" stroke="#000" strokeWidth="1" />
      <circle cx="50" cy="50" r="8" fill="#000" />
      <circle cx="50" cy="50" r="4" fill="#FFF" />
    </motion.svg>
    {/* Pointer */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[16px] border-t-black z-10 filter drop-shadow-sm"></div>
  </div>
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100
    }
  }
};

export const dynamic = 'force-dynamic';

export default function Play() {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rotationPolicy, setRotationPolicy] = useState<any>(null);
  const [todaysGames, setTodaysGames] = useState<string[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);

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

    const fetchLeaderboard = async () => {
      try {
        setLeaderboardLoading(true);
        const res = await fetch('/api/leaderboard');
        const data = await res.json();
        if (data.success) {
          setLeaderboard(data.leaderboard);
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLeaderboardLoading(false);
      }
    };

    fetchGames();
    fetchLeaderboard();
  }, []);

  return (
    <div className="min-h-screen pt-28 pb-16 bg-[#FFFDF5]">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto px-6 md:px-12"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-20 border-b-4 border-black pb-12">
          <div className="flex flex-col items-start">
            <div className="text-[#6C5CE7] font-black text-xs md:text-sm tracking-[0.3em] mb-6 uppercase font-display bg-white px-3 py-1 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000]">
              Points-Based Games
            </div>
            <h1 className="font-header tracking-tighter text-[#2D3436] flex flex-col items-start leading-none mb-8">
              <span className="text-3xl md:text-4xl font-black uppercase mb-1">PLAY &</span>
              <span className="text-6xl md:text-9xl italic font-serif text-black drop-shadow-[4px_4px_0px_#FFD93D] relative z-10">
                EARN
              </span>
            </h1>
            <p className="text-black/80 font-bold text-lg md:text-2xl max-w-3xl leading-relaxed">
              Challenge yourself with our collection of free online games and puzzles. Earn points for every win and climb the leaderboard.
            </p>
          </div>

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
        </motion.div>

        {/* Daily Spin Feature */}
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          className="mb-24 bg-gradient-to-r from-[#FFD93D] via-[#FF7675] to-[#6C5CE7] border-2 border-black p-1 rounded-[40px] shadow-[8px_8px_0px_#000] overflow-hidden"
        >
          <div className="bg-white/10 backdrop-blur-sm p-8 md:p-12 rounded-[36px] border-2 border-white/20 h-full">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-1 rounded-full font-black text-xs uppercase tracking-widest mb-4 shadow-[4px_4px_0px_rgba(255,255,255,0.4)]">
                  <Sparkles size={14} className="text-[#FFD93D]" />
                  Daily Bonus
                </div>
                <h2 className="font-header text-4xl md:text-6xl mb-4 text-white drop-shadow-[4px_4px_0px_#000] leading-none">
                  SPIN & WIN
                </h2>
                <p className="text-white font-bold text-xl mb-8 max-w-lg leading-relaxed drop-shadow-md">
                  Get your daily dose of luck! Spin the wheel to win up to <span className="text-[#FFD93D] underline decoration-wavy">500 XP</span> and exclusive power-ups.
                </p>
                <Link href="/play/daily-spin" className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-black text-sm tracking-[0.3em] border-2 border-black shadow-[6px_6px_0px_#000] hover:translate-y-1 hover:shadow-none transition-all rounded-xl">
                  SPIN NOW
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-white/20 blur-[50px] rounded-full"></div>
                <Wheel />
                {/* Floating Elements */}
                <motion.div
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-6 -right-6 text-[#FFD93D] drop-shadow-[2px_2px_0px_#000]"
                >
                  <Star size={32} fill="currentColor" />
                </motion.div>
                <motion.div
                  animate={{ y: [10, -10, 10] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-4 -left-8 text-[#00B894] drop-shadow-[2px_2px_0px_#000]"
                >
                  <Dice5 size={40} fill="currentColor" className="text-white" />
                </motion.div>
              </div>
            </div>

            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/5 rounded-full blur-[80px] pointer-events-none"></div>
          </div>
        </motion.div>

        {/* Game Categories - Strictly Filtered to 3 Games */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {/* Sudoku */}
          {(!rotationPolicy?.enabled || todaysGames.includes('sudoku')) && (
            <motion.div variants={itemVariants} className="bg-white border-2 border-black p-8 rounded-[30px] neo-shadow hover:scale-[1.02] transition-transform group relative overflow-hidden">
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
            </motion.div>
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
          {/* Math Quiz */}
          {(!rotationPolicy?.enabled || todaysGames.includes('mathquiz')) && (
            <motion.div variants={itemVariants} className="bg-white border-2 border-black p-8 rounded-[30px] neo-shadow hover:scale-[1.02] transition-transform group relative overflow-hidden">
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
            </motion.div>
          )}

          {/* Snake */}
          {(!rotationPolicy?.enabled || todaysGames.includes('snake')) && (
            <div className="bg-white border-2 border-black p-8 rounded-[30px] neo-shadow hover:scale-[1.02] transition-transform group relative overflow-hidden">
              {rotationPolicy?.gameOfTheDay === 'snake' && (
                <div className="absolute top-0 right-0 bg-[#FFD93D] text-black text-xs font-black px-4 py-2 border-b-2 border-l-2 border-black rounded-bl-xl z-10 shadow-sm">
                  GAME OF THE DAY
                </div>
              )}
              <h3 className="font-black text-sm tracking-[0.2em] text-[#00B894] mb-4 uppercase">Snake</h3>
              <p className="text-black font-black text-2xl mb-4">Retro Arcade</p>
              <p className="text-black/70 font-medium text-sm mb-6 leading-relaxed">
                Classic snake game with modern rewards.
              </p>
              <Link href="/play/snake" className="block w-full text-center px-6 py-4 bg-[#00B894] text-black font-black text-xs tracking-[0.2em] border-2 border-black shadow-[4px_4px_0px_#000] hover:translate-y-1 hover:shadow-none transition-all rounded-xl">
                PLAY NOW
              </Link>
            </div>
          )}

          {/* Minesweeper */}
          {(!rotationPolicy?.enabled || todaysGames.includes('minesweeper')) && (
            <div className="bg-white border-2 border-black p-8 rounded-[30px] neo-shadow hover:scale-[1.02] transition-transform group relative overflow-hidden">
              {rotationPolicy?.gameOfTheDay === 'minesweeper' && (
                <div className="absolute top-0 right-0 bg-[#FFD93D] text-black text-xs font-black px-4 py-2 border-b-2 border-l-2 border-black rounded-bl-xl z-10 shadow-sm">
                  GAME OF THE DAY
                </div>
              )}
              <h3 className="font-black text-sm tracking-[0.2em] text-[#6C5CE7] mb-4 uppercase">Minesweeper</h3>
              <p className="text-black font-black text-2xl mb-4">Masterclass</p>
              <p className="text-black/70 font-medium text-sm mb-6 leading-relaxed">
                Clear the grid and sweep the rewards.
              </p>
              <Link href="/play/minesweeper" className="block w-full text-center px-6 py-4 bg-[#6C5CE7] text-black font-black text-xs tracking-[0.2em] border-2 border-black shadow-[4px_4px_0px_#000] hover:translate-y-1 hover:shadow-none transition-all rounded-xl">
                PLAY NOW
              </Link>
            </div>
          )}

          {/* Tango */}
          {(!rotationPolicy?.enabled || todaysGames.includes('tango')) && (
            <div className="bg-white border-2 border-black p-8 rounded-[30px] neo-shadow hover:scale-[1.02] transition-transform group relative overflow-hidden">
              {rotationPolicy?.gameOfTheDay === 'tango' && (
                <div className="absolute top-0 right-0 bg-[#FFD93D] text-black text-xs font-black px-4 py-2 border-b-2 border-l-2 border-black rounded-bl-xl z-10 shadow-sm">
                  GAME OF THE DAY
                </div>
              )}
              <h3 className="font-black text-sm tracking-[0.2em] text-[#FF7675] mb-4 uppercase">Tango</h3>
              <p className="text-black font-black text-2xl mb-4">Breakout Battle</p>
              <p className="text-black/70 font-medium text-sm mb-6 leading-relaxed">
                Classic brick-breaking action for JP points.
              </p>
              <Link href="/play/tango" className="block w-full text-center px-6 py-4 bg-[#FF7675] text-black font-black text-xs tracking-[0.2em] border-2 border-black shadow-[4px_4px_0px_#000] hover:translate-y-1 hover:shadow-none transition-all rounded-xl">
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
          <h2 className="font-header text-3xl md:text-5xl mb-8 text-black">Top Players</h2>
          <div className="bg-white border-2 border-black rounded-[30px] overflow-hidden neo-shadow">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead className="border-b-2 border-black bg-[#FFD93D]">
                  <tr>
                    <th className="text-left p-6 font-black text-[10px] tracking-widest text-black">RANK</th>
                    <th className="text-left p-6 font-black text-[10px] tracking-widest text-black">PLAYER</th>
                    <th className="text-left p-6 font-black text-[10px] tracking-widest text-black">GAME XP</th>

                  </tr>
                </thead>
                <tbody>
                  {leaderboardLoading ? (
                    // Loading Skeleton
                    [1, 2, 3, 4, 5].map((i) => (
                      <tr key={i} className="border-b border-black/10">
                        <td colSpan={3} className="p-6">
                          <div className="h-4 bg-black/5 rounded animate-pulse"></div>
                        </td>
                      </tr>
                    ))
                  ) : leaderboard.length > 0 ? (
                    leaderboard.map((player, i) => (
                      <tr key={player.id} className={`border-b border-black/10 hover:bg-[#FFFDF5] transition-colors ${i === leaderboard.length - 1 ? 'border-b-0' : ''}`}>
                        <td className="p-6 font-black text-xl text-[#00B894]">#{i + 1}</td>
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-black/10 overflow-hidden border border-black/20">
                              {player.avatar_url ? (
                                <img src={player.avatar_url} alt={player.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-black/30">
                                  {player.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <span className="font-bold text-sm tracking-wide text-black">{player.name}</span>
                          </div>
                        </td>
                        <td className="p-6 font-black text-xl text-black">{(player.game_xp || 0).toLocaleString()} XP</td>

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="p-12 text-center text-black/40 font-bold italic">
                        No players found yet. Be the first to verify!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
      </motion.div>
    </div>
  );
}
