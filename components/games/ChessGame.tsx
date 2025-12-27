'use client';

import React, { useState, useEffect } from 'react';
import { Star, Trophy, Lightbulb } from 'lucide-react';
import confetti from 'canvas-confetti';
import { awardGamePoints } from '@/lib/gameApi';
import Scratcher from '../gamification/Scratcher';

const CHESS_GAME_ID = 'chess';

interface ChessPuzzle {
  id: string;
  fen: string; // Board position
  solution: string[]; // Sequence of moves
  difficulty: string;
  description: string;
}

const PUZZLES: ChessPuzzle[] = [
  {
    id: '1',
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R',
    solution: ['Qh5', 'Nf6', 'Qxf7#'],
    difficulty: 'Easy',
    description: 'Mate in 2 moves'
  },
  {
    id: '2',
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R',
    solution: ['Bxf7+', 'Kxf7', 'Ng5+'],
    difficulty: 'Medium',
    description: 'Mate in 3 moves'
  },
  {
    id: '3',
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR',
    solution: ['Qxf7#'],
    difficulty: 'Easy',
    description: 'Mate in 1 move'
  }
];

const ChessGame: React.FC = () => {
  const [puzzle, setPuzzle] = useState<ChessPuzzle | null>(null);
  const [moveIndex, setMoveIndex] = useState(0);
  const [userMoves, setUserMoves] = useState<string[]>([]);
  const [currentMove, setCurrentMove] = useState('');
  const [isWon, setIsWon] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [message, setMessage] = useState('');
  const [isGameOfDay, setIsGameOfDay] = useState(false);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const [points, setPoints] = useState<number | null>(null);
  const [showScratcher, setShowScratcher] = useState(false);
  const [scratcherDrops, setScratcherDrops] = useState<{prob:number,points:number}[]|null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);

  useEffect(() => {
    // Select random puzzle
    const randomPuzzle = PUZZLES[Math.floor(Math.random() * PUZZLES.length)];
    setPuzzle(randomPuzzle);

    // Check Game of the Day
    fetch('/api/games/game-of-the-day')
      .then(r => r.json())
      .then(d => {
        if (d.gameId === CHESS_GAME_ID) setIsGameOfDay(true);
      })
      .catch(console.error);

    // Fetch scratcher config
    fetch('/api/games/settings')
      .then(r => r.json())
      .then(d => {
        const cfg = d.settings?.[CHESS_GAME_ID];
        if (cfg?.scratcher?.enabled) setScratcherDrops(cfg.scratcher.drops || null);
      })
      .catch(console.error);
  }, []);

  const handleSubmitMove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!puzzle || !currentMove || isWon || alreadyPlayed) return;

    const expectedMove = puzzle.solution[moveIndex];
    const newUserMoves = [...userMoves, currentMove];
    setUserMoves(newUserMoves);

    if (currentMove.toLowerCase() === expectedMove.toLowerCase()) {
      // Correct move
      if (moveIndex === puzzle.solution.length - 1) {
        // Puzzle solved!
        setIsWon(true);
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        setMessage('Awarding points...');

        const result = await awardGamePoints({
          gameId: CHESS_GAME_ID,
          retry: wrongAttempts,
          level: puzzle.difficulty
        });

        if (result.success) {
          setPoints(result.awardedPoints || 0);
          setMessage(result.message || `You earned ${result.awardedPoints} points!`);
          if (scratcherDrops) setShowScratcher(true);
        } else if (result.error === 'Already played today') {
          setAlreadyPlayed(true);
          setMessage(result.message || 'You already played today!');
        } else {
          setMessage(result.error || 'Error awarding points');
        }
      } else {
        // Continue to next move
        setMoveIndex(moveIndex + 1);
        setCurrentMove('');
        setMessage(`Correct! Move ${moveIndex + 2} of ${puzzle.solution.length}`);
      }
    } else {
      // Wrong move
      setWrongAttempts(w => w + 1);
      setMessage('Incorrect move. Try again!');
      setCurrentMove('');
      setTimeout(() => setMessage(''), 2000);
    }
  };

  if (!puzzle) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#FFD93D] border-t-black mb-4"></div>
          <p className="text-white/60 font-black text-xs tracking-[0.4em]">LOADING...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Game of the Day Badge */}
      {isGameOfDay && (
        <div className="mb-6 flex justify-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FFD93D] to-[#FF7675] text-black rounded-full font-header tracking-widest text-sm border-2 border-black shadow-[4px_4px_0px_#000]">
            <Star size={16} className="fill-current" /> GAME OF THE DAY - 2X POINTS!
          </div>
        </div>
      )}

      <div className="bg-black/40 border-2 border-white/20 p-8 rounded-2xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Chess Puzzle</h2>
          <p className="text-white/60 text-sm">{puzzle.description}</p>
          <span className="inline-block mt-2 px-4 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-bold">
            {puzzle.difficulty}
          </span>
        </div>

        {/* Chess Board Visualization (Simplified) */}
        <div className="bg-gradient-to-br from-amber-100 to-amber-200 p-4 rounded-xl mb-6 border-4 border-amber-900">
          <div className="aspect-square bg-white/90 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">♔♕♖♗♘♙</div>
              <p className="text-gray-600 text-sm font-mono">{puzzle.fen.slice(0, 30)}...</p>
              <p className="text-gray-500 text-xs mt-2">Position: {puzzle.id}</p>
            </div>
          </div>
        </div>

        {/* Moves Display */}
        <div className="mb-6">
          <h3 className="text-white/80 text-sm font-bold mb-2">Your Moves:</h3>
          <div className="flex flex-wrap gap-2">
            {userMoves.map((move, index) => (
              <span key={index} className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-mono">
                {index + 1}. {move}
              </span>
            ))}
          </div>
        </div>

        {/* Win State */}
        {isWon && (
          <div className="text-center mb-6 animate-in zoom-in duration-300">
            <Trophy className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <p className={`font-header tracking-widest text-sm ${alreadyPlayed ? 'text-amber-500' : 'text-emerald-400'}`}>
              {message}
            </p>
            {points !== null && !alreadyPlayed && (
              <div className="mt-4 text-4xl font-black text-[#FFD93D]">
                +{points} POINTS
              </div>
            )}
            {showScratcher && scratcherDrops && !alreadyPlayed && (
              <div className="mt-6">
                <Scratcher drops={scratcherDrops} onScratch={() => {}} />
              </div>
            )}
          </div>
        )}

        {/* Input Form */}
        {!isWon && !alreadyPlayed && (
          <>
            <form onSubmit={handleSubmitMove} className="space-y-4">
              <div>
                <label className="text-white/60 text-sm mb-2 block">
                  Enter move {moveIndex + 1} of {puzzle.solution.length} (e.g., Qh5, Nf6, Qxf7#)
                </label>
                <input
                  type="text"
                  value={currentMove}
                  onChange={(e) => setCurrentMove(e.target.value)}
                  placeholder="Enter chess move..."
                  className="w-full bg-black/50 border border-white/20 rounded px-4 py-3 text-white font-mono focus:outline-none focus:border-amber-500 transition-colors"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={!currentMove}
                className="w-full px-8 py-3 bg-amber-500 text-black font-header tracking-widest text-sm hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                SUBMIT MOVE
              </button>
            </form>

            {/* Hint Button */}
            <div className="mt-4 text-center">
              {!showHint ? (
                <button
                  onClick={() => setShowHint(true)}
                  className="text-white/40 text-xs font-header tracking-widest hover:text-amber-500 flex items-center justify-center gap-2 mx-auto transition-colors"
                >
                  <Lightbulb size={14} /> SHOW HINT
                </button>
              ) : (
                <div className="text-amber-500 text-sm font-mono animate-in fade-in">
                  Hint: Next move is {puzzle.solution[moveIndex]}
                </div>
              )}
            </div>

            {/* Message */}
            {message && !isWon && (
              <div className="mt-4 text-center text-white/80 text-sm">
                {message}
              </div>
            )}

            {/* Wrong Attempts */}
            {wrongAttempts > 0 && (
              <div className="mt-4 text-center text-red-400 text-sm">
                Wrong attempts: {wrongAttempts}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChessGame;
