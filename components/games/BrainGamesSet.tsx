'use client';

import React, { useState, useEffect } from 'react';
import { Star, Trophy, Brain, Grid3x3, Shuffle, Gamepad2, Target, Dice5, Tent } from 'lucide-react';
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
      <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleClick(index)}
            disabled={gameOver || !isPlayerTurn}
            className={`aspect-square border-2 border-black rounded-lg text-4xl font-black transition-all ${cell === 'X' ? 'bg-[#00B894] text-white' :
              cell === 'O' ? 'bg-[#FF7675] text-white' :
                'bg-white hover:bg-[#FFFDF5] hover:shadow-[2px_2px_0px_#000]'
              } disabled:cursor-not-allowed`}
          >
            {cell}
          </button>
        ))}
      </div>
      <p className="text-black/60 font-bold text-xs text-center mt-4 uppercase tracking-widest">
        {gameOver ? 'GAME OVER' : isPlayerTurn ? 'YOUR TURN (X)' : 'AI TURN (O)'}
      </p>
    </div>
  );
};

// Game 2: Memory Match
const MemoryMatch: React.FC<{ onWin: () => void }> = ({ onWin }) => {
  const [cards, setCards] = useState<string[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  const icons: { [key: string]: React.ReactNode } = {
    gamepad: <Gamepad2 size={32} />,
    target: <Target size={32} />,
    dice: <Dice5 size={32} />,
    tent: <Tent size={32} />
  };

  useEffect(() => {
    const symbols = ['gamepad', 'target', 'dice', 'tent'];
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
      <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto">
        {cards.map((cardKey, index) => (
          <button
            key={index}
            onClick={() => handleCardClick(index)}
            className={`aspect-square border-2 border-black rounded-lg text-4xl flex items-center justify-center transition-all ${flipped.includes(index) || matched.includes(index)
              ? 'bg-white shadow-[2px_2px_0px_#000]'
              : 'bg-[#6C5CE7] hover:bg-[#5849BE] hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000] active:translate-y-0 active:shadow-none'
              }`}
          >
            {flipped.includes(index) || matched.includes(index) ? icons[cardKey] : ''}
          </button>
        ))}
      </div>
      <p className="text-black/60 font-bold text-xs uppercase tracking-widest text-center mt-6">Moves: {moves}</p>
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
      <div className="text-center mb-8">
        <p className="text-black/60 text-xs font-black tracking-widest uppercase mb-2">Target: {target}</p>
        <p className="text-6xl font-black text-black">{current}</p>
      </div>
      <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
        <button onClick={() => handleOperation('+', 5)} className="px-6 py-4 bg-[#00B894] border-2 border-black rounded-xl text-black font-black text-xl hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_#000] active:translate-y-[2px] active:shadow-none transition-all">+5</button>
        <button onClick={() => handleOperation('-', 3)} className="px-6 py-4 bg-[#FF7675] border-2 border-black rounded-xl text-black font-black text-xl hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_#000] active:translate-y-[2px] active:shadow-none transition-all">-3</button>
        <button onClick={() => handleOperation('×', 2)} className="px-6 py-4 bg-[#74B9FF] border-2 border-black rounded-xl text-black font-black text-xl hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_#000] active:translate-y-[2px] active:shadow-none transition-all">×2</button>
        <button onClick={() => handleOperation('÷', 2)} className="px-6 py-4 bg-[#A29BFE] border-2 border-black rounded-xl text-black font-black text-xl hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_#000] active:translate-y-[2px] active:shadow-none transition-all">÷2</button>
      </div>
      <div className="mt-8 text-center bg-[#FFFDF5] border-2 border-black rounded-lg p-2 max-w-xs mx-auto overflow-hidden">
        <p className="text-black/60 text-xs font-mono font-bold truncate">Ops: {operations.join(' ')}</p>
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
  const [scratcherDrops, setScratcherDrops] = useState<{ prob: number, points: number }[] | null>(null);
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
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFD93D] text-black rounded-full font-black tracking-widest text-sm border-2 border-black shadow-[4px_4px_0px_#000]">
            <Star size={16} className="fill-black" /> GAME OF THE DAY - 2X POINTS!
          </div>
        </div>
      )}

      <div className="bg-white border-2 border-black p-8 rounded-[25px] neo-shadow">
        {/* Progress */}
        <div className="flex justify-center gap-4 mb-12">
          {gamesWon.map((won, index) => (
            <div
              key={index}
              className={`w-12 h-12 rounded-xl border-2 border-black flex items-center justify-center font-black text-lg transition-all shadow-[2px_2px_0px_#000] ${won ? 'bg-[#00B894] text-white' :
                index === currentGame ? 'bg-[#FFD93D] text-black scale-110 shadow-[4px_4px_0px_#000]' :
                  'bg-[#FFFDF5] text-black/20'
                }`}
            >
              {index + 1}
            </div>
          ))}
        </div>

        {!allComplete ? (
          <div className="space-y-8">
            <div className="text-center mb-6">
              <p className="text-black/60 text-sm font-bold uppercase tracking-widest">Complete all 3 games to earn points!</p>
            </div>

            {currentGame === 0 && (
              <div className="bg-[#FFFDF5] p-6 rounded-xl border-2 border-black shadow-[4px_4px_0px_#000]">
                <h3 className="text-xl font-black text-black mb-6 flex items-center gap-2 uppercase tracking-tight">
                  <Grid3x3 size={24} /> Tic-Tac-Toe
                </h3>
                <div className="bg-white p-4 rounded-xl border-2 border-black inline-block">
                  <TicTacToe onWin={handleGameWin} onLose={handleGameLose} />
                </div>
              </div>
            )}
            {currentGame === 1 && (
              <div className="bg-[#FFFDF5] p-6 rounded-xl border-2 border-black shadow-[4px_4px_0px_#000]">
                <h3 className="text-xl font-black text-black mb-6 flex items-center gap-2 uppercase tracking-tight">
                  <Shuffle size={24} /> Memory Match
                </h3>
                <MemoryMatch onWin={handleGameWin} />
              </div>
            )}
            {currentGame === 2 && (
              <div className="bg-[#FFFDF5] p-6 rounded-xl border-2 border-black shadow-[4px_4px_0px_#000]">
                <h3 className="text-xl font-black text-black mb-6 flex items-center gap-2 uppercase tracking-tight">
                  <Brain size={24} /> Number Puzzle
                </h3>
                <NumberPuzzle onWin={handleGameWin} />
              </div>
            )}
          </div>
        ) : (
          <div className="text-center p-6 bg-[#FFFDF5] border-2 border-black rounded-xl border-dashed">
            <Trophy className="w-16 h-16 text-[#FFD93D] mx-auto mb-6 drop-shadow-[2px_2px_0px_#000]" />
            <h2 className="text-4xl font-black text-black uppercase mb-4 tracking-tighter">All Games Complete!</h2>
            <p className={`font-bold text-sm mb-4 ${alreadyPlayed ? 'text-black/50' : 'text-[#00B894]'}`}>
              {message}
            </p>
            {points !== null && !alreadyPlayed && (
              <div className="text-5xl font-black text-[#00B894] mb-6">
                +{points} POINTS
              </div>
            )}
            {showScratcher && scratcherDrops && !alreadyPlayed && (
              <div className="mt-8 mb-8">
                <Scratcher drops={scratcherDrops} onScratch={() => { }} />
              </div>
            )}
            <button onClick={() => window.location.reload()} className="px-8 py-4 bg-[#6C5CE7] border-2 border-black text-white font-black uppercase tracking-widest rounded-xl shadow-[4px_4px_0px_#000] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] transition-all">
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrainGamesSet;
