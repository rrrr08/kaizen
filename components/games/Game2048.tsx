'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Star, Trophy, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { awardGamePoints } from '@/lib/gameApi';
import Scratcher from '../gamification/Scratcher';

const GAME_2048_ID = '2048';

const Game2048: React.FC = () => {
  const [board, setBoard] = useState<number[][]>([]);
  const [score, setScore] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [moves, setMoves] = useState(0);
  const [isGameOfDay, setIsGameOfDay] = useState(false);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const [points, setPoints] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [showScratcher, setShowScratcher] = useState(false);
  const [scratcherDrops, setScratcherDrops] = useState<{ prob: number, points: number }[] | null>(null);
  const [showRules, setShowRules] = useState(false);

  const addRandomTile = (grid: number[][]) => {
    const emptyCells: [number, number][] = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (grid[i][j] === 0) emptyCells.push([i, j]);
      }
    }
    if (emptyCells.length > 0) {
      const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      grid[row][col] = Math.random() < 0.9 ? 2 : 4;
    }
  };

  const initBoard = useCallback(() => {
    const newBoard = Array(4).fill(null).map(() => Array(4).fill(0));
    addRandomTile(newBoard);
    addRandomTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setMoves(0);
    setIsWon(false);
    setIsGameOver(false);
    setAlreadyPlayed(false);
    setPoints(null);
    setMessage('');
    setShowScratcher(false);
  }, []);

  useEffect(() => {
    initBoard();

    // Check Game of the Day
    fetch('/api/games/game-of-the-day')
      .then(r => r.json())
      .then(d => {
        if (d.gameId === GAME_2048_ID) setIsGameOfDay(true);
      })
      .catch(console.error);

    // Fetch scratcher config
    fetch('/api/games/settings')
      .then(r => r.json())
      .then(d => {
        const cfg = d.settings?.[GAME_2048_ID];
        if (cfg?.scratcher?.enabled) setScratcherDrops(cfg.scratcher.drops || null);
      })
      .catch(console.error);
  }, [initBoard]);



  const move = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (isWon || isGameOver || alreadyPlayed) return;

    let newBoard = board.map(row => [...row]);
    let moved = false;
    let newScore = score;

    const rotate = (grid: number[][]) => {
      return grid[0].map((_, i) => grid.map(row => row[i]).reverse());
    };

    // Rotate board to make all moves work like "left"
    if (direction === 'up') {
      newBoard = rotate(rotate(rotate(newBoard)));
    } else if (direction === 'right') {
      newBoard = rotate(rotate(newBoard));
    } else if (direction === 'down') {
      newBoard = rotate(newBoard);
    }

    // Move left
    for (let i = 0; i < 4; i++) {
      let row = newBoard[i].filter(x => x !== 0);
      for (let j = 0; j < row.length - 1; j++) {
        if (row[j] === row[j + 1]) {
          row[j] *= 2;
          newScore += row[j];
          row.splice(j + 1, 1);
          moved = true;
        }
      }
      while (row.length < 4) row.push(0);
      if (JSON.stringify(row) !== JSON.stringify(newBoard[i])) moved = true;
      newBoard[i] = row;
    }

    // Rotate back
    if (direction === 'up') {
      newBoard = rotate(newBoard);
    } else if (direction === 'right') {
      newBoard = rotate(rotate(newBoard));
    } else if (direction === 'down') {
      newBoard = rotate(rotate(rotate(newBoard)));
    }

    if (moved) {
      addRandomTile(newBoard);
      setBoard(newBoard);
      setScore(newScore);
      setMoves(moves + 1);

      // Check for 2048 tile
      if (newBoard.some(row => row.includes(2048)) && !isWon) {
        handleWin();
      } else if (!canMove(newBoard)) {
        setIsGameOver(true);
      }
    }
  };

  const canMove = (grid: number[][]) => {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (grid[i][j] === 0) return true;
        if (j < 3 && grid[i][j] === grid[i][j + 1]) return true;
        if (i < 3 && grid[i][j] === grid[i + 1][j]) return true;
      }
    }
    return false;
  };

  const handleWin = async () => {
    setIsWon(true);
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    setMessage('Awarding points...');

    try {
      const result = await awardGamePoints({
        gameId: GAME_2048_ID,
        retry: Math.floor(moves / 10),
        level: `${score}`
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
    } catch (e) {
      setMessage('Error awarding points');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const direction = e.key.replace('Arrow', '').toLowerCase() as 'up' | 'down' | 'left' | 'right';
        move(direction);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [board, isWon, isGameOver, alreadyPlayed]);

  const getTileColor = (value: number) => {
    const colors: { [key: number]: string } = {
      2: 'bg-[#FFFDF5] text-black border-2 border-black',
      4: 'bg-[#FFD93D] text-black border-2 border-black',
      8: 'bg-[#FF7675] text-black border-2 border-black',
      16: 'bg-[#6C5CE7] text-white border-2 border-black',
      32: 'bg-[#00B894] text-black border-2 border-black',
      64: 'bg-[#0984E3] text-white border-2 border-black',
      128: 'bg-[#FD79A8] text-black border-2 border-black',
      256: 'bg-[#E17055] text-black border-2 border-black',
      512: 'bg-[#A29BFE] text-black border-2 border-black',
      1024: 'bg-[#FAB1A0] text-black border-2 border-black',
      2048: 'bg-[#55EFC4] text-black border-2 border-black',
    };
    return colors[value] || 'bg-[#2D3436] text-white border-2 border-black';
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowRules(false)}>
          <div className="bg-white border-4 border-black rounded-[20px] p-6 sm:p-8 max-w-2xl max-h-[80vh] overflow-y-auto neo-shadow" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl sm:text-3xl font-black mb-6 uppercase">🎮 How to Play 2048</h2>
            
            <div className="space-y-4 text-left">
              <div>
                <h3 className="font-black text-lg mb-2 text-[#6C5CE7]">🎯 Objective</h3>
                <p className="text-black/80">Combine tiles with the same number to create bigger tiles and reach 2048!</p>
              </div>

              <div>
                <h3 className="font-black text-lg mb-2 text-[#6C5CE7]">🎮 Controls</h3>
                <ul className="space-y-2 text-black/80">
                  <li>• <strong>Arrow Keys</strong>: Move tiles in any direction (↑ ↓ ← →)</li>
                  <li>• <strong>On-screen buttons</strong>: Tap direction arrows on mobile</li>
                  <li>• When tiles with the same number touch, they merge into one!</li>
                  <li>• A new tile (2 or 4) appears after each move</li>
                </ul>
              </div>

              <div>
                <h3 className="font-black text-lg mb-2 text-[#FF7675]">✖ Game Over</h3>
                <p className="text-black/80">Game ends when the board is full and no more moves are possible.</p>
              </div>

              <div>
                <h3 className="font-black text-lg mb-2 text-[#00B894]">🏆 Scoring</h3>
                <ul className="space-y-1 text-black/80">
                  <li>• Points = Your final score</li>
                  <li>• Bonus for reaching 2048 tile</li>
                  <li>• Fewer moves = Better efficiency</li>
                </ul>
              </div>

              <div>
                <h3 className="font-black text-lg mb-2 text-[#FFD93D]">💡 Tips</h3>
                <ul className="space-y-1 text-black/80">
                  <li>• Keep your highest tile in a corner</li>
                  <li>• Build tiles in one direction (don't scatter)</li>
                  <li>• Don't rush - plan your moves</li>
                  <li>• Focus on merging smaller tiles first</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowRules(false)}
              className="mt-6 w-full px-6 py-3 bg-[#6C5CE7] text-white rounded-xl border-2 border-black font-black uppercase hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_#000] transition-all"
            >
              Got It!
            </button>
          </div>
        </div>
      )}

      {isGameOfDay && (
        <div className="mb-6 flex justify-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFD93D] text-black rounded-full font-black tracking-widest text-sm border-2 border-black shadow-[4px_4px_0px_#000]">
            <Star size={16} className="fill-black" /> GAME OF THE DAY - 2X POINTS!
          </div>
        </div>
      )}

      <div className="bg-white border-2 border-black p-8 rounded-[25px] neo-shadow">
        <div className="flex justify-between items-center mb-8">
          <div>
            <button
              onClick={() => setShowRules(true)}
              className="mb-3 px-4 py-2 bg-[#FFD93D] text-black rounded-xl border-2 border-black font-black uppercase text-xs hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_#000] transition-all"
            >
              🎮 How to Play
            </button>
            <h2 className="text-4xl font-black text-black uppercase tracking-tighter">2048</h2>
            <div className="bg-[#FFFDF5] px-3 py-1 rounded-lg border-2 border-black mt-2 inline-block">
              <p className="text-black font-bold text-sm">SCORE: {score}</p>
            </div>
          </div>
          <button
            onClick={initBoard}
            className="px-4 py-2 bg-[#6C5CE7] text-white border-2 border-black rounded-xl font-black uppercase tracking-wide hover:translate-y-[-2px] hover:shadow-[2px_2px_0px_#000] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-2"
          >
            <RotateCcw size={16} /> New Game
          </button>
        </div>

        {(isWon || isGameOver) && (
          <div className="text-center mb-8 animate-in zoom-in duration-300 p-6 bg-[#FFFDF5] border-2 border-black rounded-xl border-dashed">
            {isWon ? (
              <>
                <Trophy className="w-12 h-12 text-[#FFD93D] mx-auto mb-4 drop-shadow-[2px_2px_0px_#000]" />
                <h3 className="text-2xl font-black text-black uppercase mb-1">YOU WON!</h3>
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
              </>
            ) : (
              <div>
                <h3 className="text-2xl font-black text-black uppercase mb-1">GAME OVER</h3>
                <p className="text-[#FF7675] font-black text-lg">Final Score: {score}</p>
              </div>
            )}
            <button onClick={initBoard} className="mt-4 text-black underline font-bold hover:text-[#6C5CE7]">Try Again</button>
          </div>
        )}

        <div className="bg-[#2D3436] p-4 rounded-xl mb-8 border-2 border-black shadow-[4px_4px_0px_#000]">
          <div className="grid grid-cols-4 gap-3">
            {board.map((row, i) =>
              row.map((cell, j) => (
                <div
                  key={`${i}-${j}`}
                  className={`aspect-square rounded-lg flex items-center justify-center text-2xl font-bold transition-all ${cell === 0 ? 'bg-amber-900/30' : getTileColor(cell)
                    }`}
                >
                  {cell !== 0 && cell}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto mb-6">
          <div></div>
          <button
            onClick={() => move('up')}
            className="px-4 py-3 bg-white border-2 border-black rounded-xl text-black font-black hover:bg-[#FFFDF5] hover:shadow-[2px_2px_0px_#000] active:translate-y-[2px] transition-all flex items-center justify-center"
          >
            <ArrowUp size={24} />
          </button>
          <div></div>
          <button
            onClick={() => move('left')}
            className="px-4 py-3 bg-white border-2 border-black rounded-xl text-black font-black hover:bg-[#FFFDF5] hover:shadow-[2px_2px_0px_#000] active:translate-y-[2px] transition-all flex items-center justify-center"
          >
            <ArrowLeft size={24} />
          </button>
          <button
            onClick={() => move('down')}
            className="px-4 py-3 bg-white border-2 border-black rounded-xl text-black font-black hover:bg-[#FFFDF5] hover:shadow-[2px_2px_0px_#000] active:translate-y-[2px] transition-all flex items-center justify-center"
          >
            <ArrowDown size={24} />
          </button>
          <button
            onClick={() => move('right')}
            className="px-4 py-3 bg-white border-2 border-black rounded-xl text-black font-black hover:bg-[#FFFDF5] hover:shadow-[2px_2px_0px_#000] active:translate-y-[2px] transition-all flex items-center justify-center"
          >
            <ArrowRight size={24} />
          </button>
        </div>

        <p className="text-black/50 text-xs font-bold uppercase tracking-widest text-center">
          Use arrow keys or buttons • Moves: {moves}
        </p>
      </div>
    </div>
  );
};

export default Game2048;
