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
  const [scratcherDrops, setScratcherDrops] = useState<{prob:number,points:number}[]|null>(null);

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
        const res = await fetch('/api/games/award', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            gameId: WORDLE_GAME_ID, 
            retry: newGuesses.length - 1 
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
    } else if (newGuesses.length >= 6) {
      // Lost
      setIsLost(true);
      setMessage(`The word was: ${targetWord}`);
    }
  };

  const getLetterColor = (letter: string, index: number, guess: string) => {
    if (guess[index] === targetWord[index]) {
      return 'bg-green-500 border-green-600 text-white'; // Correct position
    } else if (targetWord.includes(letter)) {
      return 'bg-yellow-500 border-yellow-600 text-white'; // Wrong position
    } else {
      return 'bg-gray-600 border-gray-700 text-white'; // Not in word
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Game of the Day Badge */}
      {isGameOfDay && (
        <div className="mb-6 flex justify-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FFD93D] to-[#FF7675] text-black rounded-full font-header tracking-widest text-sm border-2 border-black shadow-[4px_4px_0px_#000]">
            <Star size={16} className="fill-current" /> GAME OF THE DAY - 2X POINTS!
          </div>
        </div>
      )}

      <div className="bg-black/40 border-2 border-white/20 p-8 rounded-2xl">
        <h2 className="text-center text-2xl font-bold text-white mb-6">WORDLE</h2>
        <p className="text-center text-white/60 text-sm mb-8">Guess the 5-letter word in 6 tries</p>

        {/* Guesses Grid */}
        <div className="space-y-2 mb-6">
          {Array.from({ length: 6 }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex gap-2 justify-center">
              {Array.from({ length: 5 }).map((_, colIndex) => {
                const guess = guesses[rowIndex];
                const letter = guess ? guess[colIndex] : '';
                const colorClass = guess ? getLetterColor(letter, colIndex, guess) : 'bg-white/10 border-white/20';

                return (
                  <div
                    key={colIndex}
                    className={`w-14 h-14 border-2 rounded flex items-center justify-center text-2xl font-bold ${colorClass} transition-all`}
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
          <div className="text-center mb-6">
            {isWon ? (
              <div className="animate-in zoom-in duration-300">
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
              </div>
            ) : (
              <div>
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-400 font-header tracking-widest text-sm">{message}</p>
              </div>
            )}
          </div>
        )}

        {/* Input Form */}
        {!isWon && !isLost && !alreadyPlayed && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={currentGuess}
              onChange={(e) => setCurrentGuess(e.target.value.toUpperCase().slice(0, 5))}
              placeholder="Enter 5-letter word"
              maxLength={5}
              className="w-full bg-black/50 border border-white/20 rounded px-4 py-3 text-center text-white text-xl font-bold uppercase focus:outline-none focus:border-amber-500 transition-colors"
              autoFocus
            />
            <button
              type="submit"
              disabled={currentGuess.length !== 5}
              className="w-full px-8 py-3 bg-amber-500 text-black font-header tracking-widest text-sm hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              SUBMIT GUESS
            </button>
          </form>
        )}

        {/* Attempts Counter */}
        <div className="text-center mt-4 text-white/60 text-sm">
          Attempts: {guesses.length} / 6
        </div>
      </div>
    </div>
  );
};

export default WordleGame;
