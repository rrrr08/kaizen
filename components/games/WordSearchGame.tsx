'use client';

import React, { useState, useEffect } from 'react';
import { Star, Trophy, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
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

    return items.map((item: any) => item.words);
  } catch (error) {
    console.error('Error fetching word lists:', error);
    return [['REACT', 'NEXT', 'CODE', 'DEBUG', 'ARRAY']];
  }
};

const WordSearchGame: React.FC = () => {
  const [grid, setGrid] = useState<string[][]>([]);
  const [words, setWords] = useState<string[]>([]);
  const [found, setFound] = useState<string[]>([]);
  const [selected, setSelected] = useState<[number, number][]>([]);
  const [isWon, setIsWon] = useState(false);
  const [isGameOfDay, setIsGameOfDay] = useState(false);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const [points, setPoints] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [showScratcher, setShowScratcher] = useState(false);
  const [scratcherDrops, setScratcherDrops] = useState<{ prob: number, points: number }[] | null>(null);
  const [attempts, setAttempts] = useState(0);

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

  const initGameWithWords = (wordLists: string[][]) => {
    const size = 10;
    const newGrid: string[][] = Array(size).fill(0).map(() => Array(size).fill(''));
    const wordList = wordLists[Math.floor(Math.random() * wordLists.length)];

    // Place words
    wordList.forEach(word => {
      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 100) {
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
        attempts++;
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
    setFound([]);
    setSelected([]);
    setIsWon(false);
    setAttempts(0);
  };

  const handleCellClick = (row: number, col: number) => {
    if (isWon || alreadyPlayed) return;

    const newSelected = [...selected, [row, col]];
    setSelected(newSelected as [number, number][]);

    if (newSelected.length >= 2) {
      checkWord(newSelected as [number, number][]);
    }
  };

  const checkWord = (cells: [number, number][]) => {
    const word = cells.map(([r, c]) => grid[r][c]).join('');
    const reverseWord = word.split('').reverse().join('');

    if (words.includes(word) && !found.includes(word)) {
      setFound([...found, word]);
      setSelected([]);
      if (found.length + 1 === words.length) {
        handleWin();
      }
    } else if (words.includes(reverseWord) && !found.includes(reverseWord)) {
      setFound([...found, reverseWord]);
      setSelected([]);
      if (found.length + 1 === words.length) {
        handleWin();
      }
    } else {
      setAttempts(attempts + 1);
      setTimeout(() => setSelected([]), 500);
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
    <div className="max-w-3xl mx-auto">
      {isGameOfDay && (
        <div className="mb-6 flex justify-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FFD93D] to-[#FF7675] text-black rounded-full font-header tracking-widest text-sm border-2 border-black shadow-[4px_4px_0px_#000]">
            <Star size={16} className="fill-current" /> GAME OF THE DAY - 2X POINTS!
          </div>
        </div>
      )}

      <div className="bg-black/40 border-2 border-white/20 p-8 rounded-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">WORD SEARCH</h2>
          <button
            onClick={async () => {
              const wordLists = await fetchWordLists();
              initGameWithWords(wordLists);
            }}
            className="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <RotateCcw size={16} /> New Game
          </button>
        </div>

        {isWon && (
          <div className="text-center mb-6">
            <Trophy className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <p className={`font-header tracking-widest text-sm ${alreadyPlayed ? 'text-amber-500' : 'text-emerald-400'}`}>
              {message}
            </p>
            {points !== null && !alreadyPlayed && (
              <div className="mt-4 text-4xl font-black text-[#FFD93D]">+{points} POINTS</div>
            )}
            {showScratcher && scratcherDrops && !alreadyPlayed && (
              <div className="mt-6"><Scratcher drops={scratcherDrops} onScratch={() => { }} /></div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-8 mb-6">
          {/* Grid */}
          <div className="bg-white/5 p-4 rounded-xl">
            <div className="grid grid-cols-10 gap-1">
              {grid.map((row, i) =>
                row.map((cell, j) => {
                  const isSelected = selected.some(([r, c]) => r === i && c === j);
                  return (
                    <button
                      key={`${i}-${j}`}
                      onClick={() => handleCellClick(i, j)}
                      className={`w-8 h-8 text-xs font-bold rounded transition-colors ${isSelected ? 'bg-blue-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                    >
                      {cell}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Word List */}
          <div className="bg-white/5 p-4 rounded-xl">
            <h3 className="text-white font-bold mb-4">Find these words:</h3>
            <ul className="space-y-2">
              {words.map(word => (
                <li
                  key={word}
                  className={`text-sm font-bold ${found.includes(word) ? 'text-green-400 line-through' : 'text-white'
                    }`}
                >
                  {word}
                </li>
              ))}
            </ul>
            <p className="text-white/60 text-xs mt-4">Found: {found.length} / {words.length}</p>
          </div>
        </div>

        <p className="text-white/60 text-xs text-center">Click cells to select • Wrong attempts: {attempts}</p>
      </div>
    </div>
  );
};

export default WordSearchGame;
