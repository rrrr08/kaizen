'use client';

import React, { useState, useEffect } from 'react';
import { Star, Trophy, RotateCcw, HelpCircle, Target, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { awardGamePoints } from '@/lib/gameApi';
import Scratcher from '../gamification/Scratcher';

const WORD_SEARCH_ID = 'wordsearch';

// Fetch word lists from Firebase
const fetchWordLists = async (): Promise<string[][]> => {
  try {
    const res = await fetch('/api/games/content?gameId=wordsearch');
    const data = await res.json();
    const items = data.content?.items || [];

    if (items.length === 0) {
      // Fallback word lists
      return [
        ['REACT', 'NEXT', 'CODE', 'DEBUG', 'ARRAY'],
        ['PYTHON', 'JAVA', 'RUBY', 'SWIFT', 'RUST'],
        ['CLOUD', 'SERVER', 'API', 'DATA', 'CACHE']
      ];
    }

    return items.map((item: { words: string[] }) => item.words);
  } catch (error) {
    console.error('Error fetching word lists:', error);
    return [['REACT', 'NEXT', 'CODE', 'DEBUG', 'ARRAY']];
  }
};

const WordSearchGame: React.FC = () => {
  const [grid, setGrid] = useState<string[][]>([]);
  const [words, setWords] = useState<string[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [foundCoords, setFoundCoords] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [highlighted, setHighlighted] = useState<[number, number][]>([]);
  const [isWon, setIsWon] = useState(false);
  const [isGameOfDay, setIsGameOfDay] = useState(false);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const [points, setPoints] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [showScratcher, setShowScratcher] = useState(false);
  const [scratcherDrops, setScratcherDrops] = useState<{ prob: number, points: number }[] | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [showRules, setShowRules] = useState(false);

  const initGameWithWords = (wordLists: string[][]) => {
    const size = 10;
    const newGrid: string[][] = Array(size).fill(0).map(() => Array(size).fill(''));
    const wordList = wordLists[Math.floor(Math.random() * wordLists.length)];

    // Place words
    wordList.forEach(word => {
      let placed = false;
      let placeAttempts = 0;
      while (!placed && placeAttempts < 100) {
        const dir = Math.random() < 0.5 ? 'h' : 'v';
        const row = Math.floor(Math.random() * size);
        const col = Math.floor(Math.random() * size);

        if (dir === 'h' && col + word.length <= size) {
          let canPlace = true;
          for (let i = 0; i < word.length; i++) {
            if (newGrid[row][col + i] !== '' && newGrid[row][col + i] !== word[i]) {
              canPlace = false;
              break;
            }
          }
          if (canPlace) {
            for (let i = 0; i < word.length; i++) {
              newGrid[row][col + i] = word[i];
            }
            placed = true;
          }
        } else if (dir === 'v' && row + word.length <= size) {
          let canPlace = true;
          for (let i = 0; i < word.length; i++) {
            if (newGrid[row + i][col] !== '' && newGrid[row + i][col] !== word[i]) {
              canPlace = false;
              break;
            }
          }
          if (canPlace) {
            for (let i = 0; i < word.length; i++) {
              newGrid[row + i][col] = word[i];
            }
            placed = true;
          }
        }
        placeAttempts++;
      }
    });

    // Fill empty cells
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (newGrid[i][j] === '') {
          newGrid[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        }
      }
    }

    setGrid(newGrid);
    setWords(wordList);
    setFoundWords([]);
    setFoundCoords(new Set());
    setSelected(null);
    setHighlighted([]);
    setIsWon(false);
    setAttempts(0);
  };

  useEffect(() => {
    const loadGame = async () => {
      const wordLists = await fetchWordLists();
      initGameWithWords(wordLists);
    };

    loadGame();

    fetch('/api/games/game-of-the-day')
      .then(r => r.json())
      .then(d => { if (d.gameId === WORD_SEARCH_ID) setIsGameOfDay(true); });

    fetch('/api/games/settings')
      .then(r => r.json())
      .then(d => {
        const cfg = d.settings?.[WORD_SEARCH_ID];
        if (cfg?.scratcher?.enabled) setScratcherDrops(cfg.scratcher.drops || null);
      });
  }, []);

  const getPath = (start: [number, number], end: [number, number]): [number, number][] | null => {
    const [r1, c1] = start;
    const [r2, c2] = end;

    if (r1 === r2) {
      // Horizontal
      const path: [number, number][] = [];
      const min = Math.min(c1, c2);
      const max = Math.max(c1, c2);
      for (let c = min; c <= max; c++) path.push([r1, c]);
      return c1 < c2 ? path : path.reverse();
    } else if (c1 === c2) {
      // Vertical
      const path: [number, number][] = [];
      const min = Math.min(r1, r2);
      const max = Math.max(r1, r2);
      for (let r = min; r <= max; r++) path.push([r, c1]);
      return r1 < r2 ? path : path.reverse();
    }
    return null; // For now, only h/v
  };

  const handleCellClick = (row: number, col: number) => {
    if (isWon || alreadyPlayed) return;

    if (!selected) {
      setSelected([row, col]);
      setHighlighted([[row, col]]);
    } else {
      const path = getPath(selected, [row, col]);
      if (path) {
        checkWord(path);
      } else {
        setAttempts(attempts + 1);
        setSelected(null);
        setHighlighted([]);
      }
    }
  };

  const checkWord = (cells: [number, number][]) => {
    const word = cells.map(([r, c]) => grid[r][c]).join('');

    if (words.includes(word) && !foundWords.includes(word)) {
      const newFound = [...foundWords, word];
      setFoundWords(newFound);
      const newCoords = new Set(foundCoords);
      cells.forEach(([r, c]) => newCoords.add(`${r}-${c}`));
      setFoundCoords(newCoords);
      setSelected(null);
      setHighlighted([]);
      if (newFound.length === words.length) {
        handleWin();
      }
    } else {
      setAttempts(attempts + 1);
      setHighlighted(cells);
      setTimeout(() => {
        setSelected(null);
        setHighlighted([]);
      }, 500);
    }
  };

  const handleWin = async () => {
    setIsWon(true);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    setMessage('Awarding points...');

    try {
      const result = await awardGamePoints({
        gameId: WORD_SEARCH_ID,
        retry: attempts
      });
      if (result.success) {
        setPoints(result.awardedPoints || 0);
        setMessage(result.message || `You earned ${result.awardedPoints} points!`);
        if (scratcherDrops) setShowScratcher(true);
      } else if (result.error === 'Already played today') {
        setAlreadyPlayed(true);
        setMessage(result.message || 'You already played today!');
      }
    } catch (e) {
      setMessage('Error awarding points');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* Rules Modal */}
      <AnimatePresence>
        {showRules && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowRules(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white border-4 border-black rounded-[30px] p-8 max-w-2xl w-full neo-shadow relative overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#FFD93D] rounded-full opacity-20" />

              <h2 className="text-3xl font-black mb-8 uppercase flex items-center gap-3">
                <HelpCircle size={32} className="text-[#6C5CE7]" /> How to Play
              </h2>

              <div className="space-y-6 text-left">
                <div className="bg-[#FFFDF5] p-5 rounded-2xl border-2 border-black">
                  <h3 className="font-black text-lg mb-3 text-[#6C5CE7] flex items-center gap-2">
                    <Target size={20} /> Objective
                  </h3>
                  <p className="text-black/80 font-bold leading-relaxed">
                    Find and select all the hidden words in the 10×10 letter grid. Words can be horizontal or vertical!
                  </p>
                </div>

                <div className="bg-[#E8F5E9] p-5 rounded-2xl border-2 border-black">
                  <h3 className="font-black text-lg mb-3 text-[#00B894] flex items-center gap-2">
                    <CheckCircle2 size={20} /> Controls
                  </h3>
                  <ul className="space-y-3 text-black/80 font-bold">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                      Click the FIRST letter of a word.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                      Click the LAST letter to select the path.
                    </li>
                    <li className="flex items-start gap-2 text-[#6C5CE7]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6C5CE7] mt-2 shrink-0" />
                      Correct words will be permanently highlighted!
                    </li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => setShowRules(false)}
                className="mt-8 w-full px-6 py-4 bg-[#6C5CE7] text-white rounded-2xl border-4 border-black font-black uppercase text-lg shadow-[6px_6px_0px_#000] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_#000] active:translate-y-[2px] active:shadow-none transition-all"
              >
                Let's Puzzle!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isGameOfDay && (
        <div className="mb-6 flex justify-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFD93D] text-black rounded-full font-black tracking-widest text-sm border-2 border-black shadow-[4px_4px_0px_#000]">
            <Star size={16} className="fill-black" /> GAME OF THE DAY - 2X POINTS!
          </div>
        </div>
      )}

      <div className="bg-white border-4 border-black p-6 sm:p-10 rounded-[40px] shadow-[12px_12px_0px_#000]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          <div>
            <button
              onClick={() => setShowRules(true)}
              className="mb-4 inline-flex items-center gap-2 px-5 py-2.5 bg-[#FFD93D] text-black rounded-2xl border-2 border-black font-black uppercase text-xs shadow-[4px_4px_0px_#000] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] transition-all"
            >
              <HelpCircle size={16} /> How to Play
            </button>
            <h2 className="text-4xl sm:text-5xl font-black text-black uppercase tracking-tighter leading-none">
              WORD <span className="text-[#6C5CE7]">SEARCH</span>
            </h2>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={async () => {
              const wordLists = await fetchWordLists();
              initGameWithWords(wordLists);
            }}
            className="px-8 py-4 bg-[#6C5CE7] border-4 border-black text-white font-black uppercase text-sm tracking-wider rounded-2xl shadow-[6px_6px_0px_#000] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_#000] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-3 w-full sm:w-auto justify-center"
          >
            <RotateCcw size={20} /> New Game
          </motion.button>
        </div>

        {isWon && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center mb-10 p-8 bg-[#FFFDF5] border-4 border-black rounded-[30px] border-dashed relative overflow-hidden"
          >
            <div className="absolute top-4 left-4 w-4 h-4 rounded-full bg-[#FFD93D]" />
            <div className="absolute bottom-4 right-4 w-4 h-4 rounded-full bg-[#00B894]" />

            <Trophy className="w-16 h-16 text-[#FFD93D] mx-auto mb-4 drop-shadow-[4px_4px_0px_#000]" />
            <h3 className="text-3xl font-black text-black uppercase mb-2">PUZZLE COMPLETE!</h3>
            <p className={`font-black text-sm mb-4 uppercase tracking-widest ${alreadyPlayed ? 'text-black/30' : 'text-[#00B894]'}`}>
              {message}
            </p>
            {points !== null && !alreadyPlayed && (
              <div className="mb-6 flex justify-center">
                <div className="bg-black text-[#FFD93D] px-8 py-4 rounded-2xl text-4xl font-black shadow-[6px_6px_0px_#00B894]">
                  +{points} PTS
                </div>
              </div>
            )}
            {showScratcher && scratcherDrops && !alreadyPlayed && (
              <div className="mt-8 mb-6 max-w-sm mx-auto bg-white p-6 border-4 border-black rounded-2xl shadow-[6px_6px_0px_#000]">
                <p className="font-black text-sm uppercase mb-4">Bonus Scratcher Revealed!</p>
                <Scratcher drops={scratcherDrops} onScratch={() => { }} />
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-black text-white font-black rounded-xl uppercase tracking-widest text-xs hover:bg-black/90"
            >
              Play Again
            </motion.button>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-4">
          {/* Grid Container */}
          <div className="lg:col-span-8">
            <div className="bg-[#FFFDF5] p-3 sm:p-5 rounded-[30px] border-4 border-black shadow-[8px_8px_0px_#000] relative">
              {/* Corner decorative dots */}
              <div className="absolute top-3 left-3 w-1.5 h-1.5 rounded-full bg-black/20" />
              <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-black/20" />
              <div className="absolute bottom-3 left-3 w-1.5 h-1.5 rounded-full bg-black/20" />
              <div className="absolute bottom-3 right-3 w-1.5 h-1.5 rounded-full bg-black/20" />

              <div className="grid grid-cols-10 gap-1.5 sm:gap-2">
                {grid.map((row, i) =>
                  row.map((cell, j) => {
                    const isSelected = selected?.[0] === i && selected?.[1] === j;
                    const isHighlighted = highlighted.some(([r, c]) => r === i && c === j);
                    const isFound = foundCoords.has(`${i}-${j}`);

                    return (
                      <motion.button
                        key={`${i}-${j}`}
                        whileHover={!isWon && !alreadyPlayed ? { scale: 1.1 } : {}}
                        whileTap={!isWon && !alreadyPlayed ? { scale: 0.9 } : {}}
                        onClick={() => handleCellClick(i, j)}
                        className={`
                          aspect-square sm:w-10 sm:h-10 w-full flex items-center justify-center text-sm sm:text-lg font-black rounded-lg transition-all duration-200
                          ${isSelected ? 'bg-[#FFD93D] text-black border-2 border-black translate-y-[-2px] shadow-[2px_2px_0px_#000]' :
                            isHighlighted ? 'bg-[#6C5CE7] text-white border-2 border-black' :
                              isFound ? 'bg-[#00B894] text-white border-2 border-black' :
                                'bg-white text-black/90 border-2 border-black/5 hover:border-black hover:bg-[#FFFDF5] hover:shadow-[2px_2px_0px_#000]'
                          }
                        `}
                      >
                        {cell}
                      </motion.button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Word List Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-[#FFFDF5] p-6 rounded-[30px] border-4 border-black shadow-[6px_6px_0px_#000] flex-1">
              <h3 className="text-black font-black uppercase text-sm tracking-widest mb-6 flex items-center gap-2">
                <Target size={18} /> Word List
              </h3>
              <div className="space-y-3">
                {words.map(word => (
                  <motion.div
                    key={word}
                    initial={false}
                    animate={{ x: foundWords.includes(word) ? 10 : 0, opacity: foundWords.includes(word) ? 0.6 : 1 }}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${foundWords.includes(word)
                        ? 'bg-[#E8F5E9] border-[#00B894] text-[#00B894]'
                        : 'bg-white border-black/10 text-black'
                      }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${foundWords.includes(word) ? 'bg-[#00B894] border-[#00B894]' : 'bg-transparent border-black/20'
                      }`}>
                      {foundWords.includes(word) && <CheckCircle2 size={12} className="text-white" strokeWidth={4} />}
                    </div>
                    <span className="font-black text-sm uppercase tracking-wider">
                      {word}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="bg-black text-white p-6 rounded-[30px] shadow-[6px_6px_0px_#6C5CE7]">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[#FFD93D] text-[10px] font-black uppercase tracking-[0.2em] mb-1">Found</p>
                  <p className="text-3xl font-black leading-none">{foundWords.length}<span className="text-xl text-white/30 ml-1">/ {words.length}</span></p>
                </div>
                <div className="text-right">
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Retries</p>
                  <p className="text-xl font-black leading-none">{attempts}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordSearchGame;
