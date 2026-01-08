'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Star, Trophy, Lightbulb } from 'lucide-react';
import confetti from 'canvas-confetti';
import { awardGamePoints } from '@/lib/gameApi';
import Scratcher from '../gamification/Scratcher';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

const CHESS_GAME_ID = 'chess';
const WRONG_MOVE_PENALTY = 20;
const HINT_PENALTY = 50;

import { CHESS_PUZZLES, ChessPuzzle } from '@/lib/chessPuzzles';


const ChessGame: React.FC = () => {
  const [showRules, setShowRules] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Pick random puzzle on mount
  const [puzzle, setPuzzle] = useState<ChessPuzzle | null>(null);
  const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white');

  const [game, setGame] = useState(new Chess());
  const [moveIndex, setMoveIndex] = useState(0);
  const [userMoves, setUserMoves] = useState<string[]>([]);
  const [currentMoveInput, setCurrentMoveInput] = useState('');
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
    setMounted(true);
    // Init puzzle
    const randomPuzzle = CHESS_PUZZLES[Math.floor(Math.random() * CHESS_PUZZLES.length)];
    setPuzzle(randomPuzzle);

    // Load game from FEN
    // Note: chess.js might throw if FEN is incomplete, ensure FENs are valid
    try {
      const newGame = new Chess();
      newGame.load(randomPuzzle.fen);
      setGame(newGame);
      setPlayerColor(newGame.turn() === 'w' ? 'white' : 'black');
    } catch (e) {
      console.error("Invalid FEN:", randomPuzzle.fen);
      const fallback = new Chess();
      setGame(fallback);
      setPlayerColor('white');
    }

    // API calls
    fetch('/api/games/game-of-the-day')
      .then(r => r.json())
      .then(d => {
        if (d.gameId === CHESS_GAME_ID) setIsGameOfDay(true);
      })
      .catch(console.error);

    fetch('/api/games/settings')
      .then(r => r.json())
      .then(d => {
        const cfg = d.settings?.[CHESS_GAME_ID];
        if (cfg?.scratcher?.enabled) setScratcherDrops(cfg.scratcher.drops || null);
      })
      .catch(console.error);
  }, []);

  // Safe game mutator
  const makeMove = useCallback(async (moveStr: string | { from: string, to: string, promotion?: string }): Promise<boolean> => {
    if (!puzzle || isWon || alreadyPlayed) return false;

    const gameCopy = new Chess(game.fen());
    let moveResult;
    try {
      moveResult = gameCopy.move(moveStr);
    } catch (e) {
      return false;
    }

    if (!moveResult) return false;

    // Check if move matches solution (User's move)
    const expectedMoveSAN = puzzle.solution[moveIndex];

    // Compare SAN
    if (moveResult.san === expectedMoveSAN) {
      // Correct move
      setGame(gameCopy);
      const newUserMoves = [...userMoves, moveResult.san];
      setUserMoves(newUserMoves);
      setCurrentMoveInput('');

      // Check if puzzle completed
      // Logic: If (moveIndex + 1) covers the whole solution, then we are done.
      // E.g. Solution len 1 (mate in 1). Index 0. 0+1 = 1. Done.
      // E.g. Solution len 3 (mate in 2: User, Opponent, User).
      // Index 0 (User correct). 0+1 != 3. Not done.
      // Next index logic:

      const nextMoveIndex = moveIndex + 1;

      if (nextMoveIndex >= puzzle.solution.length) {
        // Solved immediately
        handleWin(gameCopy, newUserMoves);
        return true;
      }

      // If not done, it means there is an opponent move (and maybe more).
      setMoveIndex(nextMoveIndex);
      setMessage(`Correct! Opponent is thinking...`);

      // Auto-play opponent move
      setTimeout(() => {
        const opponentMoveSAN = puzzle.solution[nextMoveIndex];
        const gameAfterOpponent = new Chess(gameCopy.fen());

        try {
          const oppMove = gameAfterOpponent.move(opponentMoveSAN);
          if (oppMove) {
            setGame(gameAfterOpponent);
            const movesAfterOpponent = [...newUserMoves, oppMove.san];
            setUserMoves(movesAfterOpponent);

            // Advance index again for USER's next turn
            const userNextIndex = nextMoveIndex + 1;

            // If that was the last move (unlikely for "mate in X" unless it ends on opponent failure?) 
            // Typically mate puzzle ends with User mating opponent.
            // So opponent move shouldn't validly be the last one unless puzzle is defensive.
            // Our structure: Sol: [M1, Opp1, M2#] -> Length 3.
            // User plays M1 (idx 0). Next idx 1.
            // Opponent plays Opp1 (idx 1). 
            // Next user idx 2.
            // User plays M2 (idx 2).
            // Done.

            setMoveIndex(userNextIndex);
            setMessage("Your turn...");
          }
        } catch (err) {
          console.error("Auto-play error", err);
        }
      }, 600);

      return true;
    } else {
      // Valid chess move, but WRONG solution
      setMessage('Incorrect move for this puzzle. Try again!');
      setWrongAttempts(prev => prev + 1);
      setTimeout(() => setMessage(''), 2000);
      return false;
    }
  }, [game, puzzle, moveIndex, userMoves, isWon, alreadyPlayed]);

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    if (!targetSquare) return false;
    // Attempt move
    const success = makeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q' // always promote to queen for simplicity in this UI
    });
    // makeMove assumes async for state updates, but returns promise.
    // react-chessboard expects boolean to allow/disallow drop.
    // However, makeMove is async due to state updates potentially? No, logic is sync.
    // But I made it return Promise<boolean> actually... wait.
    // The `makeMove` function defined above is async because I marked it `async` (force of habit).
    // Let's look at `makeMove` again. It calls `handleWin` which is async.
    // We can just execute it.

    // We need to return true/false to react-chessboard synchronously if possible, or update state.
    // If we update state (setGame), the board updates.
    // If we return false, pieces snap back.
    // But `makeMove` is complex.

    // Let's refactor `onDrop` to be clean.
    // We can't await inside onDrop easily if we want to return boolean for snapback.
    // Actually react-chessboard `onPieceDrop` -> `(source, target, piece) => boolean`.
    // Valid move -> return true.

    const gameCopy = new Chess(game.fen());
    let move;
    try {
      move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q'
      });
    } catch (e) { return false; }

    if (!move) return false;

    // Check against solution
    if (puzzle && move.san === puzzle.solution[moveIndex]) {
      // Good move
      // Trigger state update
      makeMove({ from: sourceSquare, to: targetSquare, promotion: 'q' });
      return true;
    } else {
      // Wrong move logic
      setMessage('Incorrect move!');
      setWrongAttempts(w => w + 1);
      setTimeout(() => setMessage(''), 2000);
      return false;
    }
  };

  const handleWin = async (finalGame: Chess, finalMoves: string[]) => {
    setIsWon(true);
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    setMessage('Puzzle Solved! Verifying...');

    const result = await awardGamePoints({
      gameId: CHESS_GAME_ID,
      retry: wrongAttempts,
      level: puzzle?.difficulty
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
  };

  const manualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    makeMove(currentMoveInput);
  };

  if (!mounted || !puzzle) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#FFD93D] border-t-black mb-4"></div>
          <p className="text-black/60 font-black text-xs tracking-[0.4em]">LOADING PUZZLE...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Rules Modal - Kept same as before but simplified for brevity in this edit if needed, or preserved */}
      {/* ... (Keeping Rules Modal Logic if desired, but for now assuming user knows rules or just hiding it to save space in replace, 
           ACTUALLY I should keep it. I'll paste the existing modal code back in) */}
      {showRules && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowRules(false)}
        >
          <div className="bg-white border-4 border-black rounded-[20px] p-6 max-w-lg">
            <h2 className="text-2xl font-black mb-4">Chess Rules</h2>
            <p className="mb-4">Solve the puzzle by making the correct moves. Mate in {puzzle.solution.length} moves.</p>
            <button onClick={() => setShowRules(false)} className="bg-[#FFD93D] px-4 py-2 border-2 border-black font-bold rounded-lg shadow-[2px_2px_0px_#000]">Close</button>
          </div>
        </div>
      )}

      {/* Game Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

        {/* Left: Board */}
        <div className="order-2 lg:order-1">
          <div className="bg-[#2D3436] p-4 rounded-xl border-4 border-black shadow-[8px_8px_0px_#000]">
            <div className="aspect-square w-full">
              <Chessboard
                position={game.fen()}
                onPieceDrop={onDrop}
                boardOrientation={playerColor}
                customBoardStyle={{
                  borderRadius: '8px',
                  boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2)'
                }}
              />
            </div>
          </div>
          <p className="text-center mt-4 text-black/60 font-bold text-sm tracking-widest uppercase">
            {game.turn() === 'w' ? "White to Move" : "Black to Move"}
          </p>
        </div>

        {/* Right: Controls & Info */}
        <div className="order-1 lg:order-2 space-y-6">

          {/* Header Info */}
          <div className="bg-white border-2 border-black p-6 rounded-2xl neo-shadow">
            <div className="flex justify-between items-start mb-4">
              <button onClick={() => setShowRules(true)} className="text-xs font-black tracking-widest bg-[#FFD93D] px-3 py-1 rounded border-2 border-black hover:translate-y-1 transition-transform">RULES</button>
              <span className="text-xs font-black tracking-widest bg-[#6C5CE7] text-white px-3 py-1 rounded border-2 border-black">{puzzle.difficulty}</span>
            </div>
            <h2 className="text-3xl font-black text-black uppercase mb-1">{puzzle.description}</h2>
            <div className="text-black/60 font-medium text-sm">Target: Checkmate in {puzzle.solution.length} moves from now.</div>

            {isGameOfDay && (
              <div className="mt-4 flex items-center gap-2 text-xs font-black bg-[#FFD93D] p-2 rounded border-2 border-black w-fit">
                <Star size={14} /> 2X POINTS ACTIVE
              </div>
            )}
          </div>

          {/* Move History */}
          <div className="bg-white border-2 border-black p-6 rounded-2xl neo-shadow min-h-[100px]">
            <h3 className="text-xs font-black tracking-widest text-[#6C5CE7] mb-3 uppercase">Moves</h3>
            <div className="flex flex-wrap gap-2">
              {userMoves.length === 0 && <span className="text-black/30 italic text-sm">Make your first move...</span>}
              {userMoves.map((m, i) => (
                <span key={i} className="bg-black text-white px-3 py-1 rounded font-bold text-sm border border-black">{i + 1}. {m}</span>
              ))}
            </div>
          </div>

          {/* Text Input / Status */}
          {!isWon && !alreadyPlayed && (
            <div className="bg-white border-2 border-black p-6 rounded-2xl neo-shadow">
              <form onSubmit={manualSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={currentMoveInput}
                  onChange={e => setCurrentMoveInput(e.target.value)}
                  placeholder="SAN Move (e.g. Nf3)"
                  maxLength={10}
                  className="flex-1 bg-[#FFFDF5] border-2 border-black rounded-lg px-4 py-3 font-bold focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-all"
                />
                <button type="submit" className="bg-[#00B894] text-white px-6 py-3 rounded-lg border-2 border-black font-black hover:translate-y-1 transition-transform shadow-[4px_4px_0px_#000]">GO</button>
              </form>
              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={() => setShowHint(true)}
                  className="text-xs font-black tracking-widest text-black/50 hover:text-[#E17055] flex items-center gap-1"
                >
                  <Lightbulb size={14} /> GET HINT
                </button>
                {showHint && <span className="text-xs font-bold text-[#E17055]">Try: {puzzle.solution[moveIndex]}</span>}
              </div>
              {message && <div className="mt-3 text-center font-black text-[#E17055] animate-pulse">{message}</div>}
            </div>
          )}

          {/* Win State */}
          {isWon && (
            <div className="bg-[#00B894] border-2 border-black p-6 rounded-2xl neo-shadow text-center">
              <Trophy className="mx-auto text-white w-12 h-12 mb-2 drop-shadow-md" />
              <h2 className="text-2xl font-black text-white uppercase">VICTORY!</h2>
              <p className="text-white font-bold">{message}</p>
              {points && <div className="text-4xl font-black text-white mt-2">+{points} JP</div>}

              {showScratcher && scratcherDrops && (
                <div className="mt-4 bg-white p-4 rounded-xl border-2 border-black">
                  <Scratcher drops={scratcherDrops} onScratch={() => { }} />
                </div>
              )}

              <button onClick={() => window.location.reload()} className="mt-6 bg-black text-white px-6 py-3 rounded-xl font-black border-2 border-white hover:scale-105 transition-transform">NEXT PUZZLE</button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ChessGame;
