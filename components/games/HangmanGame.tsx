'use client';

import React, { useState, useEffect } from 'react';
import { Star, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { awardGamePoints } from '@/lib/gameApi';
import Scratcher from '../gamification/Scratcher';

const HANGMAN_GAME_ID = 'hangman';

// Fetch words from Firebase
const fetchWords = async (): Promise<string[]> => {
  try {
    const res = await fetch('/api/games/content?gameId=hangman');
    const data = await res.json();
    const items = data.content?.items || [];
    
    if (items.length === 0) {
      // Fallback words
      return ['JAVASCRIPT', 'PYTHON', 'REACT', 'TYPESCRIPT', 'DATABASE'];
    }
    
    return items.map((item: any) => item.word.toUpperCase());
  } catch (error) {
    console.error('Error fetching hangman words:', error);
    return ['JAVASCRIPT', 'PYTHON', 'REACT'];
  }
};

const HangmanGame: React.FC = () => {
  const [word, setWord] = useState('');
  const [guessed, setGuessed] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [isLost, setIsLost] = useState(false);
  const [isGameOfDay, setIsGameOfDay] = useState(false);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const [points, setPoints] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [showScratcher, setShowScratcher] = useState(false);
  const [scratcherDrops, setScratcherDrops] = useState<{prob:number,points:number}[]|null>(null);

  useEffect(() => {
    // Fetch and select random word from Firebase
    const loadWord = async () => {
      const words = await fetchWords();
      setWord(words[Math.floor(Math.random() * words.length)]);
    };
    
    loadWord();
    
    fetch('/api/games/game-of-the-day')
      .then(r => r.json())
      .then(d => { if (d.gameId === HANGMAN_GAME_ID) setIsGameOfDay(true); });

    fetch('/api/games/settings')
      .then(r => r.json())
      .then(d => {
        const cfg = d.settings?.[HANGMAN_GAME_ID];
        if (cfg?.scratcher?.enabled) setScratcherDrops(cfg.scratcher.drops || null);
      });
  }, []);

  const handleGuess = async (letter: string) => {
    if (guessed.includes(letter) || isWon || isLost || alreadyPlayed) return;

    const newGuessed = [...guessed, letter];
    setGuessed(newGuessed);

    if (!word.includes(letter)) {
      const newWrong = wrongGuesses + 1;
      setWrongGuesses(newWrong);
      if (newWrong >= 6) {
        setIsLost(true);
        setMessage(`The word was: ${word}`);
      }
    } else {
      const allGuessed = word.split('').every(l => newGuessed.includes(l));
      if (allGuessed) {
        setIsWon(true);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        awardPoints();
      }
    }
  };

  const awardPoints = async () => {
    setMessage('Awarding points...');
    const result = await awardGamePoints({ gameId: HANGMAN_GAME_ID, retry: wrongGuesses });
    
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

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

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
        <h2 className="text-2xl font-bold text-white text-center mb-6">HANGMAN</h2>

        {/* Hangman Drawing */}
        <div className="text-center mb-8 text-6xl">
          {wrongGuesses >= 1 && '😟'}
          {wrongGuesses >= 3 && '😰'}
          {wrongGuesses >= 5 && '😱'}
        </div>

        {/* Word Display */}
        <div className="flex justify-center gap-2 mb-8">
          {word.split('').map((letter, i) => (
            <div key={i} className="w-12 h-16 border-b-4 border-white/40 flex items-center justify-center text-3xl font-bold text-white">
              {guessed.includes(letter) ? letter : ''}
            </div>
          ))}
        </div>

        {/* Win/Loss State */}
        {(isWon || isLost) && (
          <div className="text-center mb-6">
            {isWon ? (
              <>
                <Trophy className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <p className={`font-header tracking-widest text-sm ${alreadyPlayed ? 'text-amber-500' : 'text-emerald-400'}`}>
                  {message}
                </p>
                {points !== null && !alreadyPlayed && (
                  <div className="mt-4 text-4xl font-black text-[#FFD93D]">+{points} POINTS</div>
                )}
                {showScratcher && scratcherDrops && !alreadyPlayed && (
                  <div className="mt-6"><Scratcher drops={scratcherDrops} onScratch={() => {}} /></div>
                )}
              </>
            ) : (
              <p className="text-red-400 font-header tracking-widest text-sm">{message}</p>
            )}
          </div>
        )}

        {/* Keyboard */}
        {!isWon && !isLost && !alreadyPlayed && (
          <div className="grid grid-cols-7 gap-2">
            {alphabet.map(letter => (
              <button
                key={letter}
                onClick={() => handleGuess(letter)}
                disabled={guessed.includes(letter)}
                className={`px-3 py-2 rounded font-bold transition-colors ${
                  guessed.includes(letter)
                    ? word.includes(letter)
                      ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
                      : 'bg-red-500/20 text-red-400 cursor-not-allowed'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
        )}

        <p className="text-white/60 text-sm text-center mt-4">Wrong guesses: {wrongGuesses} / 6</p>
      </div>
    </div>
  );
};

export default HangmanGame;
