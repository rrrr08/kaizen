'use client';

import React, { useState, useEffect } from 'react';
import { Star, Trophy, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { awardGamePoints } from '@/lib/gameApi';
import Scratcher from '../gamification/Scratcher';

const WORDLE_GAME_ID = 'wordle';

// Fetch word list from Firebase
const fetchWordList = async (): Promise<string[]> => {
  try {
    const res = await fetch('/api/games/content?gameId=wordle');
    const data = await res.json();
    const items = data.content?.items || [];

    if (items.length === 0) {
      // Fallback words
      return ['REACT', 'CHESS', 'BRAIN', 'LOGIC', 'SMART', 'QUICK', 'FLASH', 'POWER'];
    }

    return items.map((item: any) => item.word.toUpperCase());
  } catch (error) {
    console.error('Error fetching word list:', error);
    return ['REACT', 'CHESS', 'BRAIN', 'LOGIC', 'SMART'];
  }
};

const WordleGame: React.FC = () => {
  const [targetWord, setTargetWord] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [isWon, setIsWon] = useState(false);
  const [isLost, setIsLost] = useState(false);
  const [message, setMessage] = useState('');
  const [isGameOfDay, setIsGameOfDay] = useState(false);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const [points, setPoints] = useState<number | null>(null);
  const [showScratcher, setShowScratcher] = useState(false);
  const [scratcherDrops, setScratcherDrops] = useState<{ prob: number, points: number }[] | null>(null);
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    // Fetch and select random word from Firebase
    const loadWord = async () => {
      const wordList = await fetchWordList();
      const word = wordList[Math.floor(Math.random() * wordList.length)];
      setTargetWord(word);
    };

    loadWord();

    // Check Game of the Day
    fetch('/api/games/game-of-the-day')
      .then(r => r.json())
      .then(d => {
        if (d.gameId === WORDLE_GAME_ID) setIsGameOfDay(true);
      })
      .catch(console.error);

    // Fetch scratcher config
    fetch('/api/games/settings')
      .then(r => r.json())
      .then(d => {
        const cfg = d.settings?.[WORDLE_GAME_ID];
        if (cfg?.scratcher?.enabled) setScratcherDrops(cfg.scratcher.drops || null);
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentGuess.length !== 5 || isWon || isLost || alreadyPlayed) return;

    const newGuesses = [...guesses, currentGuess.toUpperCase()];
    setGuesses(newGuesses);
    setCurrentGuess('');

    if (currentGuess.toUpperCase() === targetWord) {
      // Won!
      setIsWon(true);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setMessage('Awarding points...');

      try {
        const result = await awardGamePoints({
          gameId: WORDLE_GAME_ID,
          retry: newGuesses.length - 1
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
    } else if (newGuesses.length >= 6) {
      // Lost
      setIsLost(true);
      setMessage(`The word was: ${targetWord}`);
    }
  };

  const getLetterColor = (letter: string, index: number, guess: string) => {
    if (guess[index] === targetWord[index]) {
      return 'bg-[#00B894] border-black text-white'; // Correct position
    } else if (targetWord.includes(letter)) {
      return 'bg-[#FFD93D] border-black text-black'; // Wrong position
    } else {
      return 'bg-[#B2BEC3] border-black text-black/50'; // Not in word
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowRules(false)}>
          <div className="bg-white border-4 border-black rounded-[20px] p-6 sm:p-8 max-w-2xl max-h-[80vh] overflow-y-auto neo-shadow" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl sm:text-3xl font-black mb-6 uppercase">📝 How to Play Wordle</h2>
            
            <div className="space-y-4 text-left">
              <div>
                <h3 className="font-black text-lg mb-2 text-[#6C5CE7]">🎯 Objective</h3>
                <p className="text-black/80">Guess the 5-letter word in 6 attempts or less!</p>
              </div>

              <div>
                <h3 className="font-black text-lg mb-2 text-[#6C5CE7]">🎮 How to Play</h3>
                <ul className="space-y-2 text-black/80">
                  <li>• Type a 5-letter word and press Enter</li>
                  <li>• After each guess, tiles change color to give you clues:</li>
                </ul>
                <div className="mt-3 space-y-2 pl-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#00B894] border-2 border-black rounded-lg flex items-center justify-center text-white font-black">A</div>
                    <span className="text-sm"><strong>Green</strong> = Letter is correct and in the right position</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#FFD93D] border-2 border-black rounded-lg flex items-center justify-center text-black font-black">B</div>
                    <span className="text-sm"><strong>Yellow</strong> = Letter is in the word but wrong position</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#B2BEC3] border-2 border-black rounded-lg flex items-center justify-center text-black/50 font-black">C</div>
                    <span className="text-sm"><strong>Gray</strong> = Letter is not in the word</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-black text-lg mb-2 text-[#00B894]">🏆 Scoring</h3>
                <ul className="space-y-1 text-black/80">
                  <li>• Guess in 1-2 tries: Maximum points</li>
                  <li>• Guess in 3-4 tries: Good points</li>
                  <li>• Guess in 5-6 tries: Base points</li>
                  <li>• Game of the Day: 2x points!</li>
                </ul>
              </div>

              <div>
                <h3 className="font-black text-lg mb-2 text-[#FFD93D]">💡 Tips</h3>
                <ul className="space-y-1 text-black/80">
                  <li>• Start with words that have common vowels (A, E, I, O, U)</li>
                  <li>• Use letters like R, S, T, N in your first guesses</li>
                  <li>• Pay attention to yellow letters - they're in the word!</li>
                  <li>• Don't repeat gray letters</li>
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

      {/* Game of the Day Badge */}
      {isGameOfDay && (
        <div className="mb-6 flex justify-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFD93D] text-black rounded-full font-black tracking-widest text-sm border-2 border-black shadow-[4px_4px_0px_#000]">
            <Star size={16} className="fill-black" /> GAME OF THE DAY - 2X POINTS!
          </div>
        </div>
      )}

      <div className="bg-white border-2 border-black p-8 rounded-[25px] neo-shadow">

        <div className="text-center mb-8">
          <button
            onClick={() => setShowRules(true)}
            className="mb-4 px-6 py-3 bg-[#FFD93D] text-black rounded-xl border-2 border-black font-black uppercase text-sm hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_#000] transition-all"
          >
            📝 How to Play
          </button>
          <h2 className="text-3xl font-black text-black uppercase tracking-tighter">Enter Guess</h2>
          <p className="text-black/60 font-medium text-sm">Attempt {guesses.length + 1} of 6</p>
        </div>

        {/* Guesses Grid */}
        <div className="space-y-2 mb-8">
          {Array.from({ length: 6 }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex gap-2 justify-center">
              {Array.from({ length: 5 }).map((_, colIndex) => {
                const guess = guesses[rowIndex];
                const letter = guess ? guess[colIndex] : '';
                const colorClass = guess ? getLetterColor(letter, colIndex, guess) : 'bg-white border-black text-black shadow-[2px_2px_0px_#000]';

                return (
                  <div
                    key={colIndex}
                    className={`w-14 h-14 border-2 rounded-xl flex items-center justify-center text-3xl font-black ${colorClass} transition-all`}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Win/Loss State */}
        {(isWon || isLost) && (
          <div className="text-center mb-8 p-6 bg-[#FFFDF5] border-2 border-black rounded-xl border-dashed">
            {isWon ? (
              <div className="animate-in zoom-in duration-300">
                <Trophy className="w-12 h-12 text-[#FFD93D] mx-auto mb-4 drop-shadow-[2px_2px_0px_#000]" />
                <h3 className="text-2xl font-black text-black uppercase mb-1">IMPRESSIVE!</h3>
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
              </div>
            ) : (
              <div>
                <AlertCircle className="w-12 h-12 text-[#FF7675] mx-auto mb-4" />
                <h3 className="text-2xl font-black text-black uppercase mb-1">SO CLOSE!</h3>
                <p className="text-black font-bold mb-2">The word was:</p>
                <div className="bg-black text-white inline-block px-4 py-2 rounded-lg font-black text-2xl tracking-widest">{targetWord}</div>
              </div>
            )}
            <button onClick={() => window.location.reload()} className="block mx-auto mt-6 text-black underline font-bold hover:text-[#6C5CE7]">Play Again Tomorrow</button>
          </div>
        )}

        {/* Input Form */}
        {!isWon && !isLost && !alreadyPlayed && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={currentGuess}
              onChange={(e) => setCurrentGuess(e.target.value.toUpperCase().slice(0, 5))}
              placeholder="TYPE WORD..."
              maxLength={5}
              className="w-full bg-[#FFFDF5] border-2 border-black rounded-xl px-4 py-4 text-center text-black text-3xl font-black uppercase focus:outline-none focus:shadow-[4px_4px_0px_#000] placeholder:text-black/20 transition-all"
              autoFocus
            />
            <button
              type="submit"
              disabled={currentGuess.length !== 5}
              className="w-full px-8 py-4 bg-[#6C5CE7] border-2 border-black rounded-xl text-white font-black tracking-[0.2em] text-sm uppercase shadow-[4px_4px_0px_#000] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
            >
              SUBMIT GUESS
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default WordleGame;
