'use client';

import React, { useState, useEffect } from 'react';
import { Star, Trophy, Brain, Grid3x3, Shuffle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { awardGamePoints } from '@/lib/gameApi';
import Scratcher from '../gamification/Scratcher';

const BRAIN_GAME_ID = 'puzzles';

// Game 1: Tic-Tac-Toe vs AI
const TicTacToe: React.FC<{ onWin: () => void; onLose: () => void }> = ({ onWin, onLose }) => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);

  const checkWinner = (squares: any[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const makeAIMove = (currentBoard: any[]) => {
    const available = currentBoard.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
    if (available.length > 0) {
      const randomIndex = available[Math.floor(Math.random() * available.length)];
      const newBoard = [...currentBoard];
      newBoard[randomIndex!] = 'O';
      return newBoard;
    }
    return currentBoard;
  };

  const handleClick = (index: number) => {
    if (board[index] || !isPlayerTurn || gameOver) return;

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);

    const winner = checkWinner(newBoard);
    if (winner === 'X') {
      setGameOver(true);
      onWin();
      return;
    }

    if (!newBoard.includes(null)) {
      setGameOver(true);
      onLose();
      return;
    }

    setIsPlayerTurn(false);
    setTimeout(() => {
      const aiBoard = makeAIMove(newBoard);
      setBoard(aiBoard);
      const aiWinner = checkWinner(aiBoard);
      if (aiWinner === 'O') {
        setGameOver(true);
        onLose();
      } else if (!aiBoard.includes(null)) {
        setGameOver(true);
        onLose();
      } else {
        setIsPlayerTurn(true);
      }
    }, 500);
  };

  return (
    <div>
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Grid3x3 size={20} /> Tic-Tac-Toe
      </h3>
      <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleClick(index)}
            disabled={gameOver || !isPlayerTurn}
            className="aspect-square bg-white/10 border-2 border-white/20 rounded-lg text-3xl font-bold text-white hover:bg-white/20 transition-colors disabled:cursor-not-allowed"
          >
            {cell}
          </button>
        ))}
      </div>
    </div>
  );
};

// Game 2: Memory Match
const MemoryMatch: React.FC<{ onWin: () => void }> = ({ onWin }) => {
  const [cards, setCards] = useState<string[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    const symbols = ['🎮', '🎯', '🎲', '🎪'];
    const deck = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
    setCards(deck);
  }, []);

  const handleCardClick = (index: number) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      if (cards[newFlipped[0]] === cards[newFlipped[1]]) {
        setMatched([...matched, ...newFlipped]);
        setFlipped([]);
        if (matched.length + 2 === cards.length) {
          setTimeout(() => onWin(), 500);
        }
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Shuffle size={20} /> Memory Match
      </h3>
      <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto">
        {cards.map((card, index) => (
          <button
            key={index}
            onClick={() => handleCardClick(index)}
            className="aspect-square bg-white/10 border-2 border-white/20 rounded-lg text-4xl hover:bg-white/20 transition-colors"
          >
            {flipped.includes(index) || matched.includes(index) ? card : '?'}
          </button>
        ))}
      </div>
      <p className="text-white/60 text-sm mt-4 text-center">Moves: {moves}</p>
    </div>
  );
};

// Game 3: Number Puzzle (2048 mini)
const NumberPuzzle: React.FC<{ onWin: () => void }> = ({ onWin }) => {
  const [target] = useState(Math.floor(Math.random() * 50) + 50);
  const [current, setCurrent] = useState(0);
  const [operations, setOperations] = useState<string[]>([]);

  const handleOperation = (op: string, value: number) => {
    let newValue = current;
    if (op === '+') newValue += value;
    else if (op === '-') newValue -= value;
    else if (op === '×') newValue *= value;
    else if (op === '÷') newValue = Math.floor(newValue / value);

    setCurrent(newValue);
    setOperations([...operations, `${op}${value}`]);

    if (newValue === target) {
      setTimeout(() => onWin(), 500);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Brain size={20} /> Number Puzzle
      </h3>
      <div className="text-center mb-6">
        <p className="text-white/60 text-sm mb-2">Target: {target}</p>
        <p className="text-4xl font-bold text-amber-500">{current}</p>
      </div>
      <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
        <button onClick={() => handleOperation('+', 5)} className="px-4 py-3 bg-green-500/20 border-2 border-green-500 rounded-lg text-white font-bold hover:bg-green-500/30">+5</button>
        <button onClick={() => handleOperation('-', 3)} className="px-4 py-3 bg-red-500/20 border-2 border-red-500 rounded-lg text-white font-bold hover:bg-red-500/30">-3</button>
        <button onClick={() => handleOperation('×', 2)} className="px-4 py-3 bg-blue-500/20 border-2 border-blue-500 rounded-lg text-white font-bold hover:bg-blue-500/30">×2</button>
        <button onClick={() => handleOperation('÷', 2)} className="px-4 py-3 bg-purple-500/20 border-2 border-purple-500 rounded-lg text-white font-bold hover:bg-purple-500/30">÷2</button>
      </div>
      <div className="mt-4 text-center">
        <p className="text-white/60 text-xs">Operations: {operations.join(' ')}</p>
      </div>
    </div>
  );
};

// Main Component
const BrainGamesSet: React.FC = () => {
  const [currentGame, setCurrentGame] = useState(0);
  const [gamesWon, setGamesWon] = useState<boolean[]>([false, false, false]);
  const [allComplete, setAllComplete] = useState(false);
  const [isGameOfDay, setIsGameOfDay] = useState(false);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const [points, setPoints] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [showScratcher, setShowScratcher] = useState(false);
  const [scratcherDrops, setScratcherDrops] = useState<{prob:number,points:number}[]|null>(null);
  const [totalRetries, setTotalRetries] = useState(0);

  useEffect(() => {
    // Check Game of the Day
    fetch('/api/games/game-of-the-day')
      .then(r => r.json())
      .then(d => {
        if (d.gameId === BRAIN_GAME_ID) setIsGameOfDay(true);
      })
      .catch(console.error);

    // Fetch scratcher config
    fetch('/api/games/settings')
      .then(r => r.json())
      .then(d => {
        const cfg = d.settings?.[BRAIN_GAME_ID];
        if (cfg?.scratcher?.enabled) setScratcherDrops(cfg.scratcher.drops || null);
      })
      .catch(console.error);
  }, []);

  const handleGameWin = () => {
    const newGamesWon = [...gamesWon];
    newGamesWon[currentGame] = true;
    setGamesWon(newGamesWon);

    if (currentGame < 2) {
      setTimeout(() => setCurrentGame(currentGame + 1), 1500);
    } else {
      // All games complete!
      setAllComplete(true);
      confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } });
      awardPoints();
    }
  };

  const handleGameLose = () => {
    setTotalRetries(r => r + 1);
  };

  const awardPoints = async () => {
    setMessage('Awarding points...');

    const result = await awardGamePoints({
      gameId: BRAIN_GAME_ID,
      retry: totalRetries,
      level: 'complete'
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
        {/* Progress */}
        <div className="flex justify-center gap-4 mb-8">
          {gamesWon.map((won, index) => (
            <div
              key={index}
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold ${
                won ? 'bg-green-500 border-green-600 text-white' :
                index === currentGame ? 'bg-amber-500 border-amber-600 text-black' :
                'bg-white/10 border-white/20 text-white/40'
              }`}
            >
              {index + 1}
            </div>
          ))}
        </div>

        {!allComplete ? (
          <div className="space-y-8">
            <div className="text-center mb-6">
              <p className="text-white/60 text-sm">Complete all 3 games to earn points!</p>
            </div>

            {currentGame === 0 && <TicTacToe onWin={handleGameWin} onLose={handleGameLose} />}
            {currentGame === 1 && <MemoryMatch onWin={handleGameWin} />}
            {currentGame === 2 && <NumberPuzzle onWin={handleGameWin} />}
          </div>
        ) : (
          <div className="text-center">
            <Trophy className="w-16 h-16 text-amber-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">All Games Complete!</h2>
            <p className={`font-header tracking-widest text-sm mb-4 ${alreadyPlayed ? 'text-amber-500' : 'text-emerald-400'}`}>
              {message}
            </p>
            {points !== null && !alreadyPlayed && (
              <div className="text-4xl font-black text-[#FFD93D] mb-6">
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
      </div>
    </div>
  );
};

export default BrainGamesSet;
