'use client';

import React, { useState, useEffect } from 'react';
import { Star, Trophy, Brain, Grid3x3, Shuffle, Gamepad2, Target, Dice5, Tent, X as LucideX, Circle as LucideCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { awardGamePoints } from '@/lib/gameApi';
import Scratcher, { ScratcherDrop } from '../gamification/Scratcher';

const BRAIN_GAME_ID = 'puzzles';

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
const TicTacToe: React.FC<{ onWin: () => void; onLose: () => void }> = ({ onWin, onLose }) => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  const handleClick = (index: number) => {
    if (board[index] || !isPlayerTurn || gameOver) return;

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);

    const win = checkWinner(newBoard);
    if (win) {
      setGameOver(true);
      setWinner(win);
      if (win === 'X') onWin();
      else onLose();
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
      const aiWin = checkWinner(aiBoard);
      if (aiWin) {
        setGameOver(true);
        setWinner(aiWin);
        onLose();
      } else if (!aiBoard.includes(null)) {
        setGameOver(true);
        onLose();
      } else {
        setIsPlayerTurn(true);
      }
    }, 600);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-3 gap-3 p-3 bg-black rounded-[20px] shadow-[8px_8px_0px_#000]">
        {board.map((cell, index) => (
          <motion.div
            key={index}
            whileHover={!gameOver && isPlayerTurn && !cell ? { scale: 1.05, backgroundColor: '#FFFDF5' } : {}}
            whileTap={!gameOver && isPlayerTurn && !cell ? { scale: 0.95 } : {}}
            onClick={() => handleClick(index)}
            className={`
              w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center rounded-xl border-4 border-black transition-all
              ${cell === 'X' ? 'bg-[#00B894]' : cell === 'O' ? 'bg-[#FF7675]' : 'bg-white'}
              ${!cell && !gameOver && isPlayerTurn ? 'cursor-pointer' : 'cursor-default opacity-100'}
            `}
          >
            <AnimatePresence mode="wait">
              {cell === 'X' && (
                <motion.div
                  key="cross"
                  initial={{ scale: 0, rotate: -45, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="w-full h-full text-black flex items-center justify-center p-4"
                >
                  <LucideX size={48} strokeWidth={5} />
                </motion.div>
              )}
              {cell === 'O' && (
                <motion.div
                  key="circle"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="w-full h-full text-black flex items-center justify-center p-4"
                >
                  <LucideCircle size={40} strokeWidth={5} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 px-6 py-3 bg-[#FFFDF5] border-2 border-black rounded-xl shadow-[4px_4px_0px_#000]">
        <p className="text-black font-black text-sm uppercase tracking-[0.2em] flex items-center gap-2">
          {gameOver ? (
            winner === 'X' ? (
              <span className="text-[#00B894] flex items-center gap-2">VICTORY <Trophy size={16} /></span>
            ) : winner === 'O' ? (
              <span className="text-[#FF7675]">CPU DEFEATED YOU</span>
            ) : (
              <span className="text-black/50">STALEMATE / DRAW</span>
            )
          ) : (
            isPlayerTurn ? (
              <span className="flex items-center gap-2">YOUR TURN <LucideX size={14} strokeWidth={3} /></span>
            ) : (
              <span className="flex items-center gap-2 text-black/40">CPU THINKING... <LucideCircle size={12} strokeWidth={3} className="animate-pulse" /></span>
            )
          )}
        </p>
      </div>
    </div>
  );
};

// Game 2: Memory Match
const MemoryMatch: React.FC<{ onWin: () => void }> = ({ onWin }) => {
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  const icons: { [key: string]: React.ReactNode } = {
    gamepad: <Gamepad2 size={32} strokeWidth={2.5} />,
    target: <Target size={32} strokeWidth={2.5} />,
    dice: <Dice5 size={32} strokeWidth={2.5} />,
    tent: <Tent size={32} strokeWidth={2.5} />
  };

  const [cards] = useState<string[]>(() => {
    const symbols = ['gamepad', 'target', 'dice', 'tent'];
    return [...symbols, ...symbols].sort(() => Math.random() - 0.5);
  });

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
          setTimeout(() => onWin(), 800);
        }
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-4 gap-3 max-w-[400px]">
        {cards.map((cardKey, index) => (
          <motion.button
            key={index}
            whileHover={!matched.includes(index) && flipped.length < 2 ? { y: -4, boxShadow: '4px 4px 0px #000' } : {}}
            whileTap={!matched.includes(index) && flipped.length < 2 ? { scale: 0.95, y: 0 } : {}}
            onClick={() => handleCardClick(index)}
            className={`
              w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-xl border-4 border-black transition-all duration-300
              ${flipped.includes(index) || matched.includes(index)
                ? 'bg-white rotate-0'
                : 'bg-[#6C5CE7] -rotate-3 hover:rotate-0'
              }
              shadow-[4px_4px_0px_#000]
            `}
          >
            <AnimatePresence mode="wait">
              {(flipped.includes(index) || matched.includes(index)) ? (
                <motion.div
                  key="front"
                  initial={{ rotateY: 180, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: 180, opacity: 0 }}
                  className={`${matched.includes(index) ? 'text-[#00B894]' : 'text-black'}`}
                >
                  {icons[cardKey]}
                </motion.div>
              ) : (
                <motion.div
                  key="back"
                  initial={{ rotateY: -180, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: -180, opacity: 0 }}
                  className="text-white font-black text-2xl"
                >
                  ?
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>
      <div className="mt-8 px-6 py-2 bg-[#FFFDF5] border-2 border-black rounded-lg shadow-[4px_4px_0px_#000]">
        <p className="text-black font-black text-xs uppercase tracking-widest">
          Moves: <span className="text-[#6C5CE7]">{moves}</span>
        </p>
      </div>
    </div>
  );
};

// Game 3: Number Puzzle
const NumberPuzzle: React.FC<{ onWin: () => void }> = ({ onWin }) => {
  const [target] = useState(() => Math.floor(Math.random() * 50) + 50);
  const [current, setCurrent] = useState(0);
  const [operations, setOperations] = useState<string[]>([]);

  const handleOperation = (op: string, value: number) => {
    let newValue = current;
    if (op === '+') newValue += value;
    else if (op === '-') newValue -= value;
    else if (op === '×') newValue *= value;
    else if (op === '÷') newValue = Math.floor(newValue / value);

    setCurrent(newValue);
    setOperations(prev => [...prev.slice(-10), `${op}${value}`]);

    if (newValue === target) {
      setTimeout(() => onWin(), 800);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full bg-white border-4 border-black p-8 rounded-[30px] shadow-[8px_8px_0px_#000] mb-8 relative overflow-hidden">
        {/* Decorative background circle */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#FFD93D] rounded-full opacity-20" />

        <div className="relative z-10 text-center">
          <div className="inline-block px-4 py-1 bg-black text-[#FFD93D] text-[10px] font-black uppercase tracking-[0.3em] rounded-full mb-4">
            Reach the Goal
          </div>
          <div className="flex items-center justify-center gap-4 mb-2">
            <motion.p
              key={current}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-7xl font-black text-black"
            >
              {current}
            </motion.p>
            <div className="h-12 w-[2px] bg-black/10" />
            <div className="text-left">
              <p className="text-black/40 text-[10px] font-black uppercase tracking-widest">Target</p>
              <p className="text-2xl font-black text-[#6C5CE7]">{target}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
        {[
          { op: '+', val: 5, color: '#00B894' },
          { op: '-', val: 3, color: '#FF7675' },
          { op: '×', val: 2, color: '#74B9FF' },
          { op: '÷', val: 2, color: '#A29BFE' }
        ].map((btn, i) => (
          <motion.button
            key={i}
            whileHover={{ y: -4, boxShadow: '6px 6px 0px #000' }}
            whileTap={{ scale: 0.95, y: 0 }}
            onClick={() => handleOperation(btn.op, btn.val)}
            className="group relative h-20 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0px_#000] overflow-hidden"
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ backgroundColor: btn.color }}
            />
            <span className="relative z-10 font-black text-3xl group-hover:text-white transition-colors duration-300">
              {btn.op}{btn.val}
            </span>
          </motion.button>
        ))}
      </div>

      <div className="mt-8 w-full">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-[2px] flex-1 bg-black/10" />
          <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">History</p>
          <div className="h-[2px] flex-1 bg-black/10" />
        </div>
        <div className="flex flex-wrap justify-center gap-2 min-h-[32px]">
          <AnimatePresence>
            {operations.map((op, idx) => (
              <motion.span
                key={`${idx}-${op}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="px-3 py-1 bg-[#FFFDF5] border-2 border-black rounded-lg text-xs font-black"
              >
                {op}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
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
  const [scratcherDrops, setScratcherDrops] = useState<ScratcherDrop[] | null>(null);
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
    <div className="max-w-3xl mx-auto px-4">
      {/* Game of the Day Badge */}
      <AnimatePresence>
        {isGameOfDay && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-8 flex justify-center"
          >
            <div className="inline-flex items-center gap-3 px-8 py-4 bg-[#FFD93D] text-black rounded-full font-black tracking-[0.1em] text-sm border-4 border-black shadow-[6px_6px_0px_#000]">
              <Star size={20} className="fill-black animate-spin-slow" />
              GAME OF THE DAY - 2X POINTS!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white border-4 border-black p-6 sm:p-12 rounded-[40px] shadow-[12px_12px_0px_#000] relative overflow-hidden">
        {/* Decorative corner element */}
        <div className="absolute -top-12 -left-12 w-24 h-24 bg-[#6C5CE7] rounded-full border-4 border-black" />

        {/* Header Section */}
        <div className="text-center mb-12 relative z-10">
          <h1 className="text-4xl sm:text-5xl font-black text-black uppercase tracking-tighter mb-4">
            BRAIN <span className="text-[#6C5CE7]">GAUNTLET</span>
          </h1>
          <div className="h-2 w-24 bg-black mx-auto rounded-full" />
        </div>

        {/* Improved Progress Indicator */}
        <div className="flex justify-center items-center gap-4 mb-16 relative z-10">
          {gamesWon.map((won, index) => (
            <React.Fragment key={index}>
              <motion.div
                initial={false}
                animate={{
                  scale: index === currentGame ? 1.15 : 1,
                  backgroundColor: won ? '#00B894' : index === currentGame ? '#FFD93D' : '#FFFDF5',
                  color: won || index === currentGame ? '#000' : 'rgba(0,0,0,0.2)'
                }}
                className={`w-14 h-14 rounded-2xl border-4 border-black flex items-center justify-center font-black text-xl shadow-[4px_4px_0px_#000] z-10`}
              >
                {won ? <Trophy size={24} /> : index + 1}
              </motion.div>
              {index < 2 && (
                <div className="h-1 w-8 sm:w-12 bg-black/10 rounded-full relative overflow-hidden">
                  <motion.div
                    initial={false}
                    animate={{ width: won ? '100%' : '0%' }}
                    className="absolute inset-0 bg-[#00B894]"
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {!allComplete ? (
            <motion.div
              key={currentGame}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-8 min-h-[400px] flex flex-col items-center justify-center"
            >
              <div className="w-full text-center">
                <p className="text-black/40 text-xs font-black uppercase tracking-[0.3em] mb-1">Current Challenge</p>
                <h3 className="text-2xl font-black text-black flex items-center justify-center gap-3 uppercase">
                  {currentGame === 0 && <><Grid3x3 size={28} strokeWidth={3} /> Tic-Tac-Toe</>}
                  {currentGame === 1 && <><Shuffle size={28} strokeWidth={3} /> Memory Match</>}
                  {currentGame === 2 && <><Brain size={28} strokeWidth={3} /> Number Puzzle</>}
                </h3>
              </div>

              <div className="w-full max-w-md">
                {currentGame === 0 && <TicTacToe onWin={handleGameWin} onLose={handleGameLose} />}
                {currentGame === 1 && <MemoryMatch onWin={handleGameWin} />}
                {currentGame === 2 && <NumberPuzzle onWin={handleGameWin} />}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-12 px-6 bg-[#FFFDF5] border-4 border-black rounded-[30px] border-dashed relative overflow-hidden"
            >
              {/* Confetti-like background particles */}
              <div className="absolute top-4 left-4 w-4 h-4 rounded-full bg-[#FFD93D]" />
              <div className="absolute bottom-10 right-10 w-6 h-6 rounded-full bg-[#00B894]" />
              <div className="absolute top-1/2 left-10 w-3 h-3 rounded-full bg-[#FF7675]" />

              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Trophy className="w-24 h-24 text-[#FFD93D] mx-auto mb-8 drop-shadow-[4px_4px_0px_#000]" strokeWidth={2.5} />
              </motion.div>

              <h2 className="text-5xl font-black text-black uppercase mb-4 tracking-tighter leading-none">
                GAUNTLET <span className="text-[#00B894]">CONQUERED!</span>
              </h2>

              <p className={`font-black text-sm mb-6 uppercase tracking-widest ${alreadyPlayed ? 'text-black/30' : 'text-[#6C5CE7]'}`}>
                {message || 'You completed all challenges!'}
              </p>

              {points !== null && !alreadyPlayed && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="bg-black text-white inline-block px-10 py-6 rounded-[20px] mb-10 shadow-[8px_8px_0px_#00B894]"
                >
                  <p className="text-xs font-black uppercase tracking-[0.4em] mb-1 opacity-60">Rewards Earned</p>
                  <div className="text-6xl font-black text-[#FFD93D]">
                    +{points}
                  </div>
                  <p className="text-sm font-black uppercase tracking-widest">Points</p>
                </motion.div>
              )}

              {showScratcher && scratcherDrops && !alreadyPlayed && (
                <div className="mt-4 mb-10 bg-white p-6 border-4 border-black rounded-3xl shadow-[6px_6px_0px_#000]">
                  <p className="text-sm font-black uppercase mb-4">Bonus Scratcher Revealed!</p>
                  <Scratcher drops={scratcherDrops} onScratch={() => { }} />
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <motion.button
                  whileHover={{ scale: 1.05, y: -4, boxShadow: '8px 8px 0px #000' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.reload()}
                  className="px-10 py-5 bg-[#6C5CE7] border-4 border-black text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-[6px_6px_0px_#000] transition-all"
                >
                  Go Again
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Info */}
      {!allComplete && (
        <p className="mt-8 text-center text-black/40 font-black text-[10px] uppercase tracking-[0.4em]">
          All stages must be completed to claim points
        </p>
      )}
    </div>
  );
};

export default BrainGamesSet;
