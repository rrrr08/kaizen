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
  const [showRules, setShowRules] = useState(false);
  const [puzzle] = useState<ChessPuzzle | null>(() =>
    PUZZLES[Math.floor(Math.random() * PUZZLES.length)]
  );
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
  const [scratcherDrops, setScratcherDrops] = useState<{ prob: number, points: number }[] | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);

  useEffect(() => {
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
      {/* Rules Modal */}
      {showRules && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowRules(false)}
        >
          <div 
            className="bg-white border-4 border-black rounded-[20px] p-6 sm:p-8 max-w-2xl max-h-[80vh] overflow-y-auto neo-shadow"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-3xl font-black text-black uppercase tracking-tighter mb-6">
              ♟️ How to Play Chess Puzzle
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-black text-black mb-2 flex items-center gap-2">
                  <span>🎯</span> Objective
                </h3>
                <p className="text-black/70 font-medium">
                  Solve chess puzzles by finding the winning sequence of moves that lead to checkmate. Each puzzle has a specific solution.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-black text-black mb-2 flex items-center gap-2">
                  <span>🎮</span> How to Play
                </h3>
                <ul className="list-disc list-inside space-y-2 text-black/70 font-medium">
                  <li>Study the chess position shown (FEN notation)</li>
                  <li>Enter moves in standard chess notation (e.g., Qh5, Nf6, Bxf7+)</li>
                  <li>Submit each move in sequence to solve the puzzle</li>
                  <li>Use hints if you're stuck (reduces final points)</li>
                  <li>Complete all moves in the correct order to win</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-black text-black mb-2 flex items-center gap-2">
                  <span>♟️</span> Chess Notation Guide
                </h3>
                <ul className="list-disc list-inside space-y-2 text-black/70 font-medium">
                  <li><strong>K</strong> = King, <strong>Q</strong> = Queen, <strong>R</strong> = Rook</li>
                  <li><strong>B</strong> = Bishop, <strong>N</strong> = Knight</li>
                  <li>Pawns have no letter (e.g., e4)</li>
                  <li><strong>+</strong> = Check, <strong>#</strong> = Checkmate</li>
                  <li><strong>x</strong> = Captures (e.g., Bxf7)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-black text-black mb-2 flex items-center gap-2">
                  <span>🏆</span> Scoring
                </h3>
                <ul className="list-disc list-inside space-y-2 text-black/70 font-medium">
                  <li>Complete the puzzle correctly: +300 points</li>
                  <li>Game of the Day: 2X points (600 points)</li>
                  <li>Each hint used: -50 points</li>
                  <li>Wrong attempts: -20 points each</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-black text-black mb-2 flex items-center gap-2">
                  <span>💡</span> Tips
                </h3>
                <ul className="list-disc list-inside space-y-2 text-black/70 font-medium">
                  <li>Look for checks, captures, and threats first</li>
                  <li>Easy puzzles are usually 1-2 move mates</li>
                  <li>Medium puzzles require 3-4 move combinations</li>
                  <li>Pay attention to piece coordination</li>
                  <li>Use hints strategically to maintain high scores</li>
                </ul>
              </div>
            </div>

            <button 
              onClick={() => setShowRules(false)}
              className="mt-8 w-full px-6 py-3 bg-[#FFD93D] text-black font-black rounded-xl border-2 border-black neo-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
            >
              Got It!
            </button>
          </div>
        </div>
      )}

      {/* Game of the Day Badge */}
      {isGameOfDay && (
        <div className="mb-6 flex justify-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFD93D] text-black rounded-full font-black tracking-widest text-sm border-2 border-black shadow-[4px_4px_0px_#000]">
            <Star size={16} className="fill-black" /> GAME OF THE DAY - 2X POINTS!
          </div>
        </div>
      )}

      <div className="bg-white border-2 border-black p-8 rounded-[25px] neo-shadow">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setShowRules(true)}
            className="px-6 py-3 bg-[#FFD93D] text-black font-black rounded-xl border-2 border-black neo-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-sm uppercase tracking-wider"
          >
            ♟️ How to Play
          </button>
          <div className="text-center flex-1">
            <span className="inline-block px-4 py-1 bg-[#6C5CE7] text-white border-2 border-black rounded-lg text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#000]">
              {puzzle.difficulty}
            </span>
          </div>
        </div>
        <div className="text-center mb-8">
          <h2 className="text-4xl font-black text-black uppercase tracking-tighter mb-2">Chess Puzzle</h2>
          <p className="text-black/60 font-medium text-lg">{puzzle.description}</p>
        </div>

        {/* Chess Board Visualization (Simplified) */}
        <div className="bg-[#FFFDF5] p-6 rounded-xl mb-8 border-2 border-black shadow-[4px_4px_0px_#000]">
          <div className="aspect-square bg-white border-2 border-black rounded-lg flex items-center justify-center relative overflow-hidden">
            {/* Simple visual placeholder for the board */}
            <div className="w-full h-full opacity-10" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '12.5% 12.5%' }}></div>
            <div className="text-center absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-8xl mb-4 text-black drop-shadow-md">♔♕♖♗♘♙</div>
              <div className="bg-[#FFD93D] border-2 border-black p-4 rounded-xl transform rotate-1 max-w-sm">
                <p className="text-black text-xs font-mono font-bold break-all">{puzzle.fen}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Moves Display */}
        <div className="mb-8">
          <h3 className="text-black font-black uppercase text-sm mb-3 tracking-widest">Your Moves:</h3>
          <div className="flex flex-wrap gap-2">
            {userMoves.length === 0 && <p className="text-black/40 text-sm font-medium italic">No moves yet...</p>}
            {userMoves.map((move, index) => (
              <span key={index} className="px-4 py-2 bg-[#00B894] border-2 border-black text-black rounded-xl text-sm font-black shadow-[2px_2px_0px_#000]">
                {index + 1}. {move}
              </span>
            ))}
          </div>
        </div>

        {/* Win State */}
        {isWon && (
          <div className="text-center mb-8 animate-in zoom-in duration-300 p-6 bg-[#FFFDF5] border-2 border-black rounded-xl border-dashed">
            <Trophy className="w-12 h-12 text-[#FFD93D] mx-auto mb-4 drop-shadow-[2px_2px_0px_#000]" />
            <h3 className="text-2xl font-black text-black uppercase mb-1">MATE DELIVERED!</h3>
            <p className={`font-bold text-sm ${alreadyPlayed ? 'text-black/50' : 'text-[#00B894]'}`}>
              {message}
            </p>
            {points !== null && !alreadyPlayed && (
              <div className="mt-4 text-4xl font-black text-[#00B894]">
                +{points} POINTS
              </div>
            )}
            {showScratcher && scratcherDrops && !alreadyPlayed && (
              <div className="mt-6">
                <Scratcher drops={scratcherDrops} onScratch={() => { }} />
              </div>
            )}
            <button onClick={() => window.location.reload()} className="mt-4 text-black underline font-bold hover:text-[#6C5CE7]">Next Puzzle</button>
          </div>
        )}

        {/* Input Form */}
        {!isWon && !alreadyPlayed && (
          <>
            <form onSubmit={handleSubmitMove} className="space-y-4">
              <div>
                <label className="text-black font-black text-xs uppercase tracking-widest mb-2 block">
                  Enter move {moveIndex + 1} of {puzzle.solution.length}
                </label>
                <input
                  type="text"
                  value={currentMove}
                  onChange={(e) => setCurrentMove(e.target.value)}
                  placeholder="e.g. Qh5"
                  className="w-full bg-[#FFFDF5] border-2 border-black rounded-xl px-4 py-4 text-black font-bold text-xl placeholder:text-black/30 focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-all"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={!currentMove}
                className="w-full px-8 py-4 bg-[#6C5CE7] border-2 border-black rounded-xl text-white font-black tracking-[0.2em] text-sm uppercase shadow-[4px_4px_0px_#000] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
              >
                SUBMIT MOVE
              </button>
            </form>

            {/* Hint Button */}
            <div className="mt-6 text-center">
              {!showHint ? (
                <button
                  onClick={() => setShowHint(true)}
                  className="text-black/50 text-xs font-black tracking-widest hover:text-[#E17055] flex items-center justify-center gap-2 mx-auto transition-colors uppercase border-b-2 border-transparent hover:border-[#E17055] pb-1"
                >
                  <Lightbulb size={14} /> SHOW HINT
                </button>
              ) : (
                <div className="inline-block px-4 py-2 bg-[#FFFDF5] border-2 border-black rounded-lg text-black text-sm font-bold animate-in fade-in shadow-[2px_2px_0px_#000]">
                  Hint: Next move is {puzzle.solution[moveIndex]}
                </div>
              )}
            </div>

            {/* Message */}
            {message && !isWon && (
              <div className="mt-4 text-center">
                <span className="inline-block px-4 py-2 bg-[#FF7675] border-2 border-black text-white font-black rounded-lg shadow-[2px_2px_0px_#000]">
                  {message}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};


export default ChessGame;
