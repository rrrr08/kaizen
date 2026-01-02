'use client';

import React, { useState, useEffect } from 'react';
import { Star, Trophy, Clock, CheckCircle, XCircle, Brain } from 'lucide-react';
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
      const res = await fetch('/api/games/award', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: TRIVIA_GAME_ID,
          retry: wrongAnswers,
          level: `${score}/${questions.length}`
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
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFD93D] text-black rounded-full font-black tracking-widest text-sm border-2 border-black shadow-[4px_4px_0px_#000]">
            <Star size={16} className="fill-black" /> GAME OF THE DAY - 2X POINTS!
          </div>
        </div>
      )}

      <div className="bg-white border-2 border-black p-8 rounded-[25px] neo-shadow">
        {!isGameOver ? (
          <>
            {/* Header */}
            <div className="flex justify-between items-center mb-8 bg-[#FFFDF5] p-4 rounded-xl border-2 border-black shadow-sm">
              <div className="text-black font-black uppercase text-xs tracking-widest">
                Question {currentIndex + 1} / {questions.length}
              </div>
              <div className="flex items-center gap-2 text-black font-black text-xl">
                <Clock size={20} className={timer <= 5 ? 'text-[#FF7675] animate-pulse' : 'text-black'} />
                <span className={timer <= 5 ? 'text-[#FF7675]' : ''}>{timer}s</span>
              </div>
              <div className="text-black font-black uppercase text-xs tracking-widest">
                Score: {score}
              </div>
            </div>

            {/* Category */}
            <div className="text-center mb-6">
              <span className="inline-block px-4 py-1 bg-[#A29BFE] text-black border-2 border-black rounded-lg text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#000]">
                {currentQuestion.category}
              </span>
            </div>

            {/* Question */}
            <h2 className="text-3xl font-black text-black text-center mb-10 leading-tight">
              "{currentQuestion.question}"
            </h2>

            {/* Options */}
            <div className="grid grid-cols-1 gap-4">
              {currentQuestion.options.map((option, index) => {
                let bgColor = 'bg-white hover:bg-[#FFFDF5] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_#000]';
                let borderColor = 'border-black';
                let textColor = 'text-black';
                let shadow = 'shadow-[2px_2px_0px_#000]';
                let icon = null;

                if (showResult) {
                  if (index === currentQuestion.correct) {
                    bgColor = 'bg-[#00B894]';
                    textColor = 'text-white';
                    shadow = 'shadow-[4px_4px_0px_#000]';
                    icon = <CheckCircle size={24} className="text-white" />;
                  } else if (index === selectedAnswer) {
                    bgColor = 'bg-[#FF7675]';
                    textColor = 'text-white';
                    shadow = 'shadow-[4px_4px_0px_#000]';
                    icon = <XCircle size={24} className="text-white" />;
                  } else {
                    bgColor = 'bg-gray-100 opacity-50';
                    shadow = 'shadow-none';
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={showResult}
                    className={`${bgColor} ${textColor} border-2 ${borderColor} ${shadow} p-6 rounded-xl font-bold text-lg text-left transition-all flex items-center justify-between disabled:cursor-not-allowed disabled:transform-none`}
                  >
                    <span>{option}</span>
                    {icon}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center p-6">
            {score > 0 ? (
              <Trophy className="w-16 h-16 text-[#FFD93D] mx-auto mb-6 drop-shadow-[2px_2px_0px_#000]" />
            ) : (
              <Brain className="w-16 h-16 text-black/20 mx-auto mb-6" />
            )}

            <h2 className="text-4xl font-black text-black uppercase mb-4 tracking-tighter">Quiz Complete!</h2>
            <p className="text-2xl font-bold text-black mb-8">
              You scored <span className="text-[#00B894]">{score}</span> out of {questions.length}
            </p>

            <div className="bg-[#FFFDF5] border-2 border-black rounded-xl p-6 mb-8 border-dashed">
              <p className={`font-black uppercase tracking-widest text-sm mb-2 ${alreadyPlayed ? 'text-black/50' : 'text-[#00B894]'}`}>
                {message}
              </p>
              {points !== null && !alreadyPlayed && (
                <div className="text-5xl font-black text-[#00B894] mb-2">
                  +{points} POINTS
                </div>
              )}
            </div>

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

export default TriviaGame;
