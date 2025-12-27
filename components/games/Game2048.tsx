'use client';

import React, { useState, useEffect } from 'react';
import { Star, Trophy, RotateCcw } from 'lucide-react';
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
  const [scratcherDrops, setScratcherDrops] = useState<{prob:number,points:number}[]|null>(null);

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
  }, []);

  const initBoard = () => {
    const newBoard = Array(4).fill(0).map(() => Array(4).fill(0));
    addRandomTile(newBoard);
    addRandomTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setMoves(0);
    setIsWon(false);
    setIsGameOver(false);
  };

  const addRandomTile = (grid: number[][]) => {
    const empty: [number, number][] = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (grid[i][j] === 0) empty.push([i, j]);
      }
    }
    if (empty.length > 0) {
      const [row, col] = empty[Math.floor(Math.random() * empty.length)];
      grid[row][col] = Math.random() < 0.9 ? 2 : 4;
    }
  };

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
      const res = await fetch('/api/games/award', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          gameId: GAME_2048_ID, 
          retry: Math.floor(moves / 10),
          level: `${score}`
        }),
      });
      const data = await res.json();

      if (data.success) {
        setPoints(data.awardedPoints);
        setMessage(data.message || `You earned ${data.awardedPoints} points!`);
        if (scratcherDrops) setShowScratcher(true);
      } else if (res.status === 409) {
        setAlreadyPlayed(true);
        setMessage(data.message || 'You already played today!');
      } else {
        setMessage(data.error || 'Error awarding points');
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
    const colors: {[key: number]: string} = {
      2: 'bg-amber-100 text-gray-800',
      4: 'bg-amber-200 text-gray-800',
      8: 'bg-orange-400 text-white',
      16: 'bg-orange-500 text-white',
      32: 'bg-red-400 text-white',
      64: 'bg-red-500 text-white',
      128: 'bg-yellow-400 text-white',
      256: 'bg-yellow-500 text-white',
      512: 'bg-yellow-600 text-white',
      1024: 'bg-green-500 text-white',
      2048: 'bg-green-600 text-white',
    };
    return colors[value] || 'bg-gray-700 text-white';
  };

  return (
    <div className="max-w-2xl mx-auto">
      {isGameOfDay && (
        <div className="mb-6 flex justify-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FFD93D] to-[#FF7675] text-black rounded-full font-header tracking-widest text-sm border-2 border-black shadow-[4px_4px_0px_#000]">
            <Star size={16} className="fill-current" /> GAME OF THE DAY - 2X POINTS!
          </div>
        </div>
      )}

      <div className="bg-black/40 border-2 border-white/20 p-8 rounded-2xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">2048</h2>
            <p className="text-white/60 text-sm">Score: {score}</p>
          </div>
          <button
            onClick={initBoard}
            className="px-4 py-2 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2"
          >
            <RotateCcw size={16} /> New Game
          </button>
        </div>

        {(isWon || isGameOver) && (
          <div className="text-center mb-6 animate-in zoom-in duration-300">
            {isWon ? (
              <>
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
              </>
            ) : (
              <p className="text-red-400 font-header tracking-widest text-sm">Game Over! Score: {score}</p>
            )}
          </div>
        )}

        <div className="bg-amber-900/50 p-4 rounded-xl mb-4">
          <div className="grid grid-cols-4 gap-2">
            {board.map((row, i) =>
              row.map((cell, j) => (
                <div
                  key={`${i}-${j}`}
                  className={`aspect-square rounded-lg flex items-center justify-center text-2xl font-bold transition-all ${
                    cell === 0 ? 'bg-amber-900/30' : getTileColor(cell)
                  }`}
                >
                  {cell !== 0 && cell}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
          <div></div>
          <button
            onClick={() => move('up')}
            className="px-4 py-3 bg-white/10 border-2 border-white/20 rounded-lg text-white font-bold hover:bg-white/20"
          >
            ↑
          </button>
          <div></div>
          <button
            onClick={() => move('left')}
            className="px-4 py-3 bg-white/10 border-2 border-white/20 rounded-lg text-white font-bold hover:bg-white/20"
          >
            ←
          </button>
          <button
            onClick={() => move('down')}
            className="px-4 py-3 bg-white/10 border-2 border-white/20 rounded-lg text-white font-bold hover:bg-white/20"
          >
            ↓
          </button>
          <button
            onClick={() => move('right')}
            className="px-4 py-3 bg-white/10 border-2 border-white/20 rounded-lg text-white font-bold hover:bg-white/20"
          >
            →
          </button>
        </div>

        <p className="text-white/60 text-xs text-center mt-4">
          Use arrow keys or buttons • Moves: {moves}
        </p>
      </div>
    </div>
  );
};

export default Game2048;
