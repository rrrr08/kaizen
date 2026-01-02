'use client';

import React, { useState, useEffect } from 'react';
import { Star, Trophy, Smile, Meh, Frown, Skull } from 'lucide-react';
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
  const [scratcherDrops, setScratcherDrops] = useState<{ prob: number, points: number }[] | null>(null);

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
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFD93D] text-black rounded-full font-black tracking-widest text-sm border-2 border-black shadow-[4px_4px_0px_#000]">
            <Star size={16} className="fill-black" /> GAME OF THE DAY - 2X POINTS!
          </div>
        </div>
      )}

      <div className="bg-white border-2 border-black p-8 rounded-[25px] neo-shadow">

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-black text-black uppercase tracking-tighter">HANGMAN</h2>
          <div className="px-4 py-2 bg-[#FFFDF5] border-2 border-black rounded-xl font-bold text-sm">
            Attempts: {6 - wrongGuesses} Left
          </div>
        </div>

        {/* Hangman Drawing */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-[#FFFDF5] border-2 border-black rounded-full text-black shadow-[4px_4px_0px_#000]">
            {wrongGuesses === 0 && <Smile size={64} />}
            {wrongGuesses >= 1 && wrongGuesses < 3 && <Meh size={64} />}
            {wrongGuesses >= 3 && wrongGuesses < 5 && <Frown size={64} />}
            {wrongGuesses >= 5 && wrongGuesses < 6 && <Frown size={64} className="text-[#E17055]" />}
            {wrongGuesses >= 6 && <Skull size={64} className="text-black" />}
          </div>
        </div>

        {/* Word Display */}
        <div className="flex justify-center flex-wrap gap-2 mb-12">
          {word.split('').map((letter, i) => (
            <div key={i} className="w-12 h-16 border-b-4 border-black flex items-center justify-center text-4xl font-black text-black">
              {guessed.includes(letter) ? letter : ''}
            </div>
          ))}
        </div>

        {/* Win/Loss State */}
        {(isWon || isLost) && (
          <div className="text-center mb-8 p-6 bg-[#FFFDF5] border-2 border-black rounded-xl border-dashed">
            {isWon ? (
              <>
                <Trophy className="w-12 h-12 text-[#FFD93D] mx-auto mb-4 drop-shadow-[2px_2px_0px_#000]" />
                <h3 className="text-2xl font-black text-black uppercase mb-1">YOU SAVED HIM!</h3>
                <p className={`font-bold text-sm ${alreadyPlayed ? 'text-black/50' : 'text-[#00B894]'}`}>
                  {message}
                </p>
                {points !== null && !alreadyPlayed && (
                  <div className="mt-4 text-4xl font-black text-[#00B894]">+{points} POINTS</div>
                )}
                {showScratcher && scratcherDrops && !alreadyPlayed && (
                  <div className="mt-6"><Scratcher drops={scratcherDrops} onScratch={() => { }} /></div>
                )}
              </>
            ) : (
              <>
                <Skull size={64} className="mx-auto mb-4 text-black" />
                <h3 className="text-2xl font-black text-black uppercase mb-2">GAME OVER</h3>
                <p className="font-bold text-black mb-1">The word was:</p>
                <div className="inline-block bg-black text-white text-xl font-black px-4 py-2 rounded-lg">{word}</div>
              </>
            )}
            <button onClick={() => window.location.reload()} className="block mx-auto mt-6 text-black underline font-bold hover:text-[#6C5CE7]">Play Again Tomorrow</button>
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
                className={`px-1 py-3 rounded-lg font-black text-lg border-2 border-black transition-all ${guessed.includes(letter)
                  ? word.includes(letter)
                    ? 'bg-[#00B894] text-white cursor-not-allowed opacity-50'
                    : 'bg-[#FF7675] text-white cursor-not-allowed opacity-50'
                  : 'bg-white text-black hover:bg-[#FFFDF5] hover:-translate-y-1 hover:shadow-[2px_2px_0px_#000] active:translate-y-0 active:shadow-none'
                  }`}
              >
                {letter}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HangmanGame;
