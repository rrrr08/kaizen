'use client';

import React, { useState, useEffect } from 'react';
import { Star, Trophy, Clock, CheckCircle, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { awardGamePoints } from '@/lib/gameApi';
import Scratcher from '../gamification/Scratcher';

const TRIVIA_GAME_ID = 'trivia';

interface Question {
  question: string;
  options: string[];
  correct: number;
  category: string;
}

// Fetch questions from Firebase
const fetchQuestions = async (): Promise<Question[]> => {
  try {
    const res = await fetch('/api/games/content?gameId=trivia');
    const data = await res.json();
    const items = data.content?.items || [];

    if (items.length === 0) {
      // Fallback questions
      return [
        {
          question: "What is the capital of France?",
          options: ["London", "Berlin", "Paris", "Madrid"],
          correct: 2,
          category: "Geography"
        },
        {
          question: "Who painted the Mona Lisa?",
          options: ["Van Gogh", "Da Vinci", "Picasso", "Monet"],
          correct: 1,
          category: "Art"
        },
        {
          question: "What is 15 × 8?",
          options: ["120", "125", "115", "130"],
          correct: 0,
          category: "Math"
        },
        {
          question: "Which planet is known as the Red Planet?",
          options: ["Venus", "Jupiter", "Mars", "Saturn"],
          correct: 2,
          category: "Science"
        },
        {
          question: "In which year did World War II end?",
          options: ["1943", "1944", "1945", "1946"],
          correct: 2,
          category: "History"
        }
      ];
    }

    return items;
  } catch (error) {
    console.error('Error fetching trivia questions:', error);
    // Return fallback questions
    return [
      {
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correct: 2,
        category: "Geography"
      }
    ];
  }
};

const TriviaGame: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [timer, setTimer] = useState(30);
  const [isGameOfDay, setIsGameOfDay] = useState(false);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const [points, setPoints] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [showScratcher, setShowScratcher] = useState(false);
  const [scratcherDrops, setScratcherDrops] = useState<{ prob: number, points: number }[] | null>(null);
  const [wrongAnswers, setWrongAnswers] = useState(0);

  useEffect(() => {
    // Fetch questions from Firebase
    const loadQuestions = async () => {
      const allQuestions = await fetchQuestions();
      // Select 5 random questions
      const shuffled = [...allQuestions].sort(() => Math.random() - 0.5).slice(0, 5);
      setQuestions(shuffled);
    };

    loadQuestions();

    // Check Game of the Day
    fetch('/api/games/game-of-the-day')
      .then(r => r.json())
      .then(d => {
        if (d.gameId === TRIVIA_GAME_ID) setIsGameOfDay(true);
      })
      .catch(console.error);

    // Fetch scratcher config
    fetch('/api/games/settings')
      .then(r => r.json())
      .then(d => {
        const cfg = d.settings?.[TRIVIA_GAME_ID];
        if (cfg?.scratcher?.enabled) setScratcherDrops(cfg.scratcher.drops || null);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (timer > 0 && !showResult && !isGameOver && questions.length > 0) {
      const interval = setInterval(() => {
        setTimer(t => t - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0 && !showResult) {
      handleTimeout();
    }
  }, [timer, showResult, isGameOver, questions]);

  const handleTimeout = () => {
    setWrongAnswers(w => w + 1);
    setShowResult(true);
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedAnswer(null);
        setShowResult(false);
        setTimer(30);
      } else {
        finishGame();
      }
    }, 2000);
  };

  const handleAnswer = (index: number) => {
    if (showResult || isGameOver) return;

    setSelectedAnswer(index);
    setShowResult(true);

    const isCorrect = index === questions[currentIndex].correct;
    if (isCorrect) {
      setScore(score + 1);
    } else {
      setWrongAnswers(w => w + 1);
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedAnswer(null);
        setShowResult(false);
        setTimer(30);
      } else {
        finishGame();
      }
    }, 2000);
  };

  const finishGame = async () => {
    setIsGameOver(true);
    if (score > 0) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
    setMessage('Awarding points...');

    try {
      const result = await awardGamePoints({
        gameId: TRIVIA_GAME_ID,
        retry: wrongAnswers,
        level: `${score}/${questions.length}`
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
  };

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#FFD93D] border-t-black mb-4"></div>
          <p className="text-white/60 font-black text-xs tracking-[0.4em]">LOADING...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

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
        {!isGameOver ? (
          <>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-white/60 text-sm">
                Question {currentIndex + 1} / {questions.length}
              </div>
              <div className="flex items-center gap-2 text-amber-500">
                <Clock size={16} />
                <span className="font-bold">{timer}s</span>
              </div>
              <div className="text-white/60 text-sm">
                Score: {score}
              </div>
            </div>

            {/* Category */}
            <div className="text-center mb-4">
              <span className="inline-block px-4 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-bold">
                {currentQuestion.category}
              </span>
            </div>

            {/* Question */}
            <h2 className="text-2xl font-bold text-white text-center mb-8">
              {currentQuestion.question}
            </h2>

            {/* Options */}
            <div className="grid grid-cols-1 gap-4">
              {currentQuestion.options.map((option, index) => {
                let bgColor = 'bg-white/10 hover:bg-white/20';
                let borderColor = 'border-white/20';
                let icon = null;

                if (showResult) {
                  if (index === currentQuestion.correct) {
                    bgColor = 'bg-green-500/20';
                    borderColor = 'border-green-500';
                    icon = <CheckCircle size={20} className="text-green-500" />;
                  } else if (index === selectedAnswer) {
                    bgColor = 'bg-red-500/20';
                    borderColor = 'border-red-500';
                    icon = <XCircle size={20} className="text-red-500" />;
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={showResult}
                    className={`${bgColor} border-2 ${borderColor} p-4 rounded-xl text-white font-bold text-left transition-all flex items-center justify-between disabled:cursor-not-allowed`}
                  >
                    <span>{option}</span>
                    {icon}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center">
            <Trophy className="w-16 h-16 text-amber-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Quiz Complete!</h2>
            <p className="text-2xl text-white/80 mb-6">
              You scored {score} out of {questions.length}
            </p>
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
                <Scratcher drops={scratcherDrops} onScratch={() => { }} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TriviaGame;
