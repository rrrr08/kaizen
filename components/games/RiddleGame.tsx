'use client';

import React, { useState, useEffect } from 'react';
import { Lightbulb, Trophy, HelpCircle, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { awardGamePoints, getGameContent } from '@/lib/gameApi';

// Fetch riddles from Firebase
async function fetchRiddle() {
    try {
        const content = await getGameContent('riddle');
        const items = content?.items || [];
        
        if (items.length === 0) {
            // Fallback riddle if no content
            return {
                id: 'fallback',
                question: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?",
                answer: "map",
                hint: "You use me to find your way."
            };
        }
        
        // Pick one randomly
        return items[Math.floor(Math.random() * items.length)];
    } catch (error) {
        console.error('Error fetching riddle:', error);
        // Fallback riddle
        return {
            id: 'fallback',
            question: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?",
            answer: "map",
            hint: "You use me to find your way."
        };
    }
}

const RIDDLE_GAME_ID = 'riddle';

const RiddleGame: React.FC = () => {
    const [riddle, setRiddle] = useState<any>(null);
    const [answer, setAnswer] = useState('');
    const [hintRevealed, setHintRevealed] = useState(false);
    const [isWon, setIsWon] = useState(false);
    const [error, setError] = useState('');
    const [retry, setRetry] = useState(0);
    const [points, setPoints] = useState<number|null>(null);
    const [message, setMessage] = useState('');
    const [isGameOfDay, setIsGameOfDay] = useState(false);
    const [alreadyPlayed, setAlreadyPlayed] = useState(false);

    useEffect(() => {
        fetchRiddle().then(setRiddle);
        checkGameOfTheDay();
    }, []);

    const checkGameOfTheDay = async () => {
        try {
            const res = await fetch('/api/games/game-of-the-day');
            const data = await res.json();
            if (data.gameId === RIDDLE_GAME_ID) {
                setIsGameOfDay(true);
            }
        } catch (error) {
            console.error('Error checking game of the day:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isWon || !riddle || alreadyPlayed) return;
        
        if (answer.toLowerCase().trim() === riddle.answer) {
            setIsWon(true);
            setError('');
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            setMessage('Awarding points...');
            
            const result = await awardGamePoints({ gameId: RIDDLE_GAME_ID, retry });
            
            if (result.success) {
                setPoints(result.awardedPoints || 0);
                setMessage(result.message || `You received ${result.awardedPoints} points!`);
            } else if (result.error === 'Already played today') {
                setAlreadyPlayed(true);
                setMessage(result.message || 'You already played today. Come back tomorrow!');
            } else {
                setMessage(result.error || 'Error awarding points');
            }
        } else {
            setError('Incorrect, try again!');
            setTimeout(() => setError(''), 2000);
            setRetry(r => r + 1);
        }
    };

    const handleBuyHint = async () => {
        if (hintRevealed) return;
        // For demo, just reveal. In production, call spendPoints API.
        setHintRevealed(true);
    };

    if (!riddle) return (
        <div className="flex items-center justify-center py-12">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#FFD93D] border-t-black mb-4"></div>
                <p className="text-white/60 font-black text-xs tracking-[0.4em]">LOADING...</p>
            </div>
        </div>
    );

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

            <div className="glass-card p-8 md:p-12 rounded-lg border border-white/10 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50"></div>
                <HelpCircle className="w-12 h-12 text-amber-500/50 mx-auto mb-6" />
                <h2 className="font-display text-2xl md:text-3xl mb-8 leading-relaxed">
                    "{riddle.question}"
                </h2>
                
                {/* Retry Counter */}
                {retry > 0 && !isWon && (
                    <div className="mb-4 text-amber-500/60 text-sm font-header tracking-widest">
                        ATTEMPTS: {retry}
                    </div>
                )}

                {isWon ? (
                    <div className="animate-in zoom-in duration-300">
                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500/20 text-emerald-400 rounded-full font-header tracking-widest text-sm border border-emerald-500/50 mb-4">
                            <Trophy size={16} /> SOLVED
                        </div>
                        <p className="text-white/60 font-serif italic">The answer was: <span className="text-white font-bold uppercase">{riddle.answer}</span></p>
                        <p className={`font-header tracking-widest text-sm mt-4 ${alreadyPlayed ? 'text-amber-500' : 'text-emerald-400'}`}>
                            {message}
                        </p>
                        {points !== null && (
                            <div className="mt-6 text-4xl font-black text-[#FFD93D]">
                                +{points} POINTS
                            </div>
                        )}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative max-w-sm mx-auto">
                            <input
                                type="text"
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                placeholder="Type your answer..."
                                className="w-full bg-black/50 border border-white/20 rounded px-4 py-3 text-center text-white focus:outline-none focus:border-amber-500 transition-colors font-serif italic"
                            />
                            {error && (
                                <div className="absolute -bottom-6 left-0 w-full text-center text-red-500 text-xs font-header tracking-widest animate-pulse">
                                    {error}
                                </div>
                            )}
                        </div>
                        <div className="flex justify-center gap-4 pt-4">
                            <button
                                type="submit"
                                className="px-8 py-3 bg-white text-black font-header tracking-widest text-sm hover:bg-amber-500 transition-colors"
                            >
                                SUBMIT
                            </button>
                        </div>

                        <div className="pt-8">
                            {!hintRevealed ? (
                                <button
                                    type="button"
                                    onClick={handleBuyHint}
                                    className="text-white/40 text-xs font-header tracking-widest hover:text-amber-500 flex items-center justify-center gap-2 mx-auto transition-colors"
                                >
                                    <Lightbulb size={14} /> REVEAL HINT
                                </button>
                            ) : (
                                <div className="text-amber-500 text-sm font-serif italic animate-in fade-in slide-in-from-bottom-2">
                                    Hint: {riddle.hint}
                                </div>
                            )}
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default RiddleGame;

