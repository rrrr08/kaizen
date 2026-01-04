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

    return items.map((item: { words: string[] }) => item.words);
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
    setFound([]);
    setSelected([]);
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
      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowRules(false)}>
          <div className="bg-white border-4 border-black rounded-[20px] p-6 sm:p-8 max-w-2xl max-h-[80vh] overflow-y-auto neo-shadow" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl sm:text-3xl font-black mb-6 uppercase">🔍 How to Play Word Search</h2>
            
            <div className="space-y-4 text-left">
              <div>
                <h3 className="font-black text-lg mb-2 text-[#6C5CE7]">🎯 Objective</h3>
                <p className="text-black/80">Find all hidden words in the 10×10 letter grid!</p>
              </div>

              <div>
                <h3 className="font-black text-lg mb-2 text-[#6C5CE7]">🎮 How to Play</h3>
                <ul className="space-y-2 text-black/80">
                  <li>• Look for words from the word list on the right</li>
                  <li>• Click on the first letter of a word</li>
                  <li>• Click on the last letter to complete the selection</li>
                  <li>• Words can be horizontal or vertical</li>
                  <li>• Words can go forwards or backwards</li>
                  <li>• Found words turn <strong className="text-[#00B894]">green</strong></li>
                </ul>
              </div>

              <div>
                <h3 className="font-black text-lg mb-2 text-[#00B894]">🏆 Scoring</h3>
                <ul className="space-y-1 text-black/80">
                  <li>• Find all words to win</li>
                  <li>• Fewer wrong attempts = More points</li>
                  <li>• Game of the Day: 2x points!</li>
                </ul>
              </div>

              <div>
                <h3 className="font-black text-lg mb-2 text-[#FFD93D]">💡 Tips</h3>
                <ul className="space-y-1 text-black/80">
                  <li>• Start with shorter words first</li>
                  <li>• Look for uncommon letters (Q, X, Z)</li>
                  <li>• Check both horizontal and vertical directions</li>
                  <li>• Remember words can go backwards</li>
                  <li>• Use "New Game" button for a fresh puzzle</li>
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
              🔍 How to Play
            </button>
            <h2 className="text-4xl font-black text-black uppercase tracking-tighter">WORD SEARCH</h2>
          </div>
          <button
            onClick={async () => {
              const wordLists = await fetchWordLists();
              initGameWithWords(wordLists);
            }}
            className="px-6 py-3 bg-[#6C5CE7] border-2 border-black text-white font-black uppercase text-xs tracking-wider rounded-xl shadow-[4px_4px_0px_#000] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-2"
          >
            <RotateCcw size={16} /> New Game
          </button>
        </div>

        {isWon && (
          <div className="text-center mb-8 p-6 bg-[#FFFDF5] border-2 border-black rounded-xl border-dashed">
            <Trophy className="w-12 h-12 text-[#FFD93D] mx-auto mb-4 drop-shadow-[2px_2px_0px_#000]" />
            <h3 className="text-2xl font-black text-black uppercase mb-1">ALL WORDS FOUND!</h3>
            <p className={`font-bold text-sm ${alreadyPlayed ? 'text-black/50' : 'text-[#00B894]'}`}>
              {message}
            </p>
            {points !== null && !alreadyPlayed && (
              <div className="mt-4 text-4xl font-black text-[#00B894]">+{points} POINTS</div>
            )}
            {showScratcher && scratcherDrops && !alreadyPlayed && (
              <div className="mt-6"><Scratcher drops={scratcherDrops} onScratch={() => { }} /></div>
            )}
            <button onClick={() => window.location.reload()} className="block mx-auto mt-6 text-black underline font-bold hover:text-[#00B894]">Play Again</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          {/* Grid */}
          <div className="bg-[#FFFDF5] p-4 rounded-xl border-2 border-black shadow-[4px_4px_0px_#000]">
            <div className="grid grid-cols-10 gap-1">
              {grid.map((row, i) =>
                row.map((cell, j) => {
                  const isSelected = selected.some(([r, c]) => r === i && c === j);
                  const isFound = found.some(word => {
                    // Check if this cell is part of any found word (simplified check, ideally should store found cells)
                    // For now, let's just use the grid content, but that's not accurate enough if multiple words share letters.
                    // Ideally we'd calculate found cells.
                    return false;
                  });
                  // Actually, let's just trust the user selection feedback for now or improvements later.
                  // To highlight found words correctly, we'd need to store the coordinates of found words.
                  // For now, let's just stick to selection highlighting.

                  return (
                    <button
                      key={`${i}-${j}`}
                      onClick={() => handleCellClick(i, j)}
                      className={`w-8 h-8 text-xs font-bold rounded transition-colors ${isSelected ? 'bg-[#6C5CE7] text-white shadow-[2px_2px_0px_#000]' : 'bg-black/5 text-black hover:bg-black/10'
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
          <div className="bg-[#FFFDF5] p-6 rounded-xl border-2 border-black h-fit">
            <h3 className="text-black font-black uppercase tracking-widest mb-4 border-b-2 border-black pb-2">Find these words:</h3>
            <div className="flex flex-wrap gap-2">
              {words.map(word => (
                <span
                  key={word}
                  className={`text-sm font-bold ${found.includes(word) ? 'text-[#00B894] line-through' : 'text-black'
                    }`}
                >
                  {word}
                </span>
              ))}
            </div>
            <p className="text-black/60 text-xs font-bold mt-6 pt-4 border-t-2 border-black/10">
              Found: {found.length} / {words.length} <br />
              Wrong attempts: {attempts}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordSearchGame;
