'use client';

import React, { useState, useEffect } from 'react';
import { Star, Trophy, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { awardGamePoints } from '@/lib/gameApi';
import Scratcher from '../gamification/Scratcher';

const MATH_QUIZ_ID = 'mathquiz';

interface Question {
  question: string;
  answer: number;
}

const MathQuizGame: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);
  const [isGameOfDay, setIsGameOfDay] = useState(false);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const [points, setPoints] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [showScratcher, setShowScratcher] = useState(false);
  const [scratcherDrops, setScratcherDrops] = useState<{ prob: number, points: number }[] | null>(null);

  const generateQuestions = () => {
    const qs: Question[] = [];
    for (let i = 0; i < 10; i++) {
      const a = Math.floor(Math.random() * 20) + 1;
      const b = Math.floor(Math.random() * 20) + 1;
      const op = ['+', '-', '*'][Math.floor(Math.random() * 3)];
      let answer = 0;
      let question = '';

      if (op === '+') {
        answer = a + b;
        question = `${a} + ${b}`;
      } else if (op === '-') {
        answer = a - b;
        question = `${a} - ${b}`;
      } else {
        answer = a * b;
        question = `${a} × ${b}`;
      }

      qs.push({ question, answer });
    }
    setQuestions(qs);
  };

  useEffect(() => {
    generateQuestions();

    fetch('/api/games/game-of-the-day')
      .then(r => r.json())
      .then(d => { if (d.gameId === MATH_QUIZ_ID) setIsGameOfDay(true); });

    fetch('/api/games/settings')
      .then(r => r.json())
      .then(d => {
        const cfg = d.settings?.[MATH_QUIZ_ID];
        if (cfg?.scratcher?.enabled) setScratcherDrops(cfg.scratcher.drops || null);
      });
  }, []);

  useEffect(() => {
    if (isComplete || alreadyPlayed) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeout();
          return 20;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQ, isComplete, alreadyPlayed]);



  const handleTimeout = () => {
    setWrongAnswers(wrongAnswers + 1);
    if (currentQ + 1 >= questions.length) {
      finishQuiz();
    } else {
      setCurrentQ(currentQ + 1);
      setUserAnswer('');
      setTimeLeft(20);
    }
  };

  const handleSubmit = () => {
    if (!userAnswer) return;

    const correct = parseInt(userAnswer) === questions[currentQ].answer;
    if (correct) {
      setScore(score + 1);
    } else {
      setWrongAnswers(wrongAnswers + 1);
    }

    if (currentQ + 1 >= questions.length) {
      finishQuiz();
    } else {
      setCurrentQ(currentQ + 1);
      setUserAnswer('');
      setTimeLeft(20);
    }
  };

  const finishQuiz = async () => {
    setIsComplete(true);
    if (score >= 7) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      awardPoints();
    } else {
      setMessage(`You scored ${score}/10. Need at least 7 to win!`);
    }
  };

  const awardPoints = async () => {
    setMessage('Awarding points...');

    const result = await awardGamePoints({
      gameId: MATH_QUIZ_ID,
      retry: wrongAnswers
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
    <div className="max-w-2xl mx-auto">
      {isGameOfDay && (
        <div className="mb-6 flex justify-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFD93D] text-black rounded-full font-black tracking-widest text-sm border-2 border-black shadow-[4px_4px_0px_#000]">
            <Star size={16} className="fill-black" /> GAME OF THE DAY - 2X POINTS!
          </div>
        </div>
      )}

      <div className="bg-white border-2 border-black p-8 rounded-[25px] neo-shadow">

        {!isComplete ? (
          <>
            <div className="flex justify-between items-center mb-8">
              <div className="text-black font-black uppercase text-sm tracking-widest">
                Question {currentQ + 1} / {questions.length}
              </div>
              <div className="flex items-center gap-2 text-black font-black text-xl">
                <Clock size={20} className={timeLeft <= 5 ? 'text-[#FF7675] animate-pulse' : 'text-black'} />
                <span className={timeLeft <= 5 ? 'text-[#FF7675]' : ''}>{timeLeft}s</span>
              </div>
            </div>

            {questions[currentQ] && (
              <div className="text-center mb-12">
                <div className="text-6xl font-black text-black mb-8 tracking-tighter">
                  {questions[currentQ].question} = ?
                </div>
                <input
                  type="number"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                  className="w-full max-w-xs px-6 py-4 text-4xl text-center font-black bg-[#FFFDF5] border-2 border-black rounded-xl focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-all placeholder:text-black/20"
                  placeholder="?"
                  autoFocus
                />
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!userAnswer}
              className="w-full px-8 py-4 bg-[#6C5CE7] border-2 border-black rounded-xl text-white font-black tracking-[0.2em] text-sm uppercase shadow-[4px_4px_0px_#000] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
            >
              SUBMIT ANSWER
            </button>

            <div className="mt-6 flex justify-center gap-8 text-black/60 font-bold text-sm uppercase">
              <span>Score: {score}</span>
              <span className="text-[#FF7675]">Mistakes: {wrongAnswers}</span>
            </div>
          </>
        ) : (
          <div className="text-center p-6 bg-[#FFFDF5] border-2 border-black rounded-xl border-dashed">
            {score >= 7 ? (
              <>
                <Trophy className="w-16 h-16 text-[#FFD93D] mx-auto mb-4 drop-shadow-[2px_2px_0px_#000]" />
                <h3 className="text-3xl font-black text-black uppercase mb-2">QUIZ MASTER!</h3>
                <div className="text-xl font-bold text-black mb-4">Score: {score} / {questions.length}</div>
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
                <div className="text-3xl font-black text-[#FF7675] mb-4 uppercase">KEEP PRACTICING!</div>
                <div className="text-xl font-bold text-black mb-4">Score: {score} / {questions.length}</div>
                <p className="text-black/60 font-bold mb-6">{message}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-8 py-3 bg-[#00B894] border-2 border-black text-black font-black uppercase tracking-widest rounded-xl hover:shadow-[4px_4px_0px_#000] transition-all"
                >
                  TRY AGAIN
                </button>
              </>
            )}
            <button onClick={() => window.location.reload()} className="block mx-auto mt-6 text-black underline font-bold hover:text-[#6C5CE7]">Play Again</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MathQuizGame;
