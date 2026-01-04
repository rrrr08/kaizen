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
    const [riddle, setRiddle] = useState<{ question: string; answer: string; hint: string } | null>(null);
    const [answer, setAnswer] = useState('');
    const [hintRevealed, setHintRevealed] = useState(false);
    const [isWon, setIsWon] = useState(false);
    const [error, setError] = useState('');
    const [retry, setRetry] = useState(0);
    const [points, setPoints] = useState<number | null>(null);
    const [message, setMessage] = useState('');
    const [isGameOfDay, setIsGameOfDay] = useState(false);
    const [alreadyPlayed, setAlreadyPlayed] = useState(false);
    const [showRules, setShowRules] = useState(false);

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

    useEffect(() => {
        let isMounted = true;
        fetchRiddle().then(r => {
            if (isMounted) setRiddle(r);
        });

        const check = async () => {
            try {
                const res = await fetch('/api/games/game-of-the-day');
                const data = await res.json();
                if (isMounted && data.gameId === RIDDLE_GAME_ID) {
                    setIsGameOfDay(true);
                }
            } catch (error) {
                console.error('Error checking game of the day:', error);
            }
        };
        check();

        return () => { isMounted = false; };
    }, []);

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
            {/* Rules Modal */}
            {showRules && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowRules(false)}>
                    <div className="bg-white border-4 border-black rounded-[20px] p-6 sm:p-8 max-w-2xl max-h-[80vh] overflow-y-auto neo-shadow" onClick={e => e.stopPropagation()}>
                        <h2 className="text-2xl sm:text-3xl font-black mb-6 uppercase">🤔 How to Play Riddles</h2>
                        
                        <div className="space-y-4 text-left">
                            <div>
                                <h3 className="font-black text-lg mb-2 text-[#6C5CE7]">🎯 Objective</h3>
                                <p className="text-black/80">Read the riddle carefully and type the correct answer to solve it!</p>
                            </div>

                            <div>
                                <h3 className="font-black text-lg mb-2 text-[#6C5CE7]">🎮 How to Play</h3>
                                <ul className="space-y-2 text-black/80">
                                    <li>• Read the riddle question</li>
                                    <li>• Think about the answer</li>
                                    <li>• Type your answer in the text box</li>
                                    <li>• Click "Submit Answer" to check</li>
                                    <li>• Use the hint if you're stuck (no penalty)</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-black text-lg mb-2 text-[#FFD93D]">💡 Hints</h3>
                                <p className="text-black/80">Click the "Need a Hint?" button to reveal a helpful clue. There's no penalty for using hints!</p>
                            </div>

                            <div>
                                <h3 className="font-black text-lg mb-2 text-[#00B894]">🏆 Scoring</h3>
                                <ul className="space-y-1 text-black/80">
                                    <li>• Solve in first try: Maximum points</li>
                                    <li>• Multiple attempts: Slightly fewer points</li>
                                    <li>• Game of the Day: 2x points!</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-black text-lg mb-2 text-[#FFD93D]">💡 Tips</h3>
                                <ul className="space-y-1 text-black/80">
                                    <li>• Read the riddle multiple times</li>
                                    <li>• Think about wordplay and double meanings</li>
                                    <li>• Don't overthink - answers are often simple</li>
                                    <li>• Use hints to get unstuck</li>
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

            <div className="bg-white border-2 border-black p-8 md:p-12 rounded-[25px] neo-shadow relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD93D] rounded-full blur-3xl opacity-20 -mr-16 -mt-16 pointer-events-none"></div>

                <div className="text-center mb-8 relative z-10">
                    {/* How to Play Button */}
                    <button
                        onClick={() => setShowRules(true)}
                        className="mb-4 px-6 py-3 bg-[#FFD93D] text-black rounded-xl border-2 border-black font-black uppercase text-sm hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_#000] transition-all"
                    >
                        🤔 How to Play
                    </button>

                    <div className="inline-flex items-center justify-center w-20 h-20 bg-[#FFFDF5] border-2 border-black rounded-full mb-6 shadow-[4px_4px_0px_#000]">
                        <HelpCircle className="w-10 h-10 text-black" />
                    </div>
                    <h2 className="font-header text-2xl md:text-3xl font-black text-black leading-relaxed italic">
                        &quot;{riddle.question}&quot;
                    </h2>
                </div>

                {/* Retry Counter */}
                {retry > 0 && !isWon && (
                    <div className="mb-6 text-center">
                        <span className="inline-block px-3 py-1 bg-[#FF7675] border-2 border-black text-white text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#000]">
                            Attempts: {retry}
                        </span>
                    </div>
                )}

                {isWon ? (
                    <div className="text-center animate-in zoom-in duration-300 p-6 bg-[#FFFDF5] border-2 border-black rounded-xl border-dashed">
                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#00B894] border-2 border-black text-white rounded-full font-black tracking-widest text-sm shadow-[2px_2px_0px_#000] mb-6">
                            <Trophy size={16} /> SOLVED
                        </div>
                        <p className="text-black/60 font-medium mb-2">The answer was:</p>
                        <p className="text-4xl font-black text-black uppercase mb-6">{riddle.answer}</p>

                        <p className={`font-bold text-sm ${alreadyPlayed ? 'text-black/50' : 'text-[#00B894]'}`}>
                            {message}
                        </p>
                        {points !== null && (
                            <div className="mt-4 text-4xl font-black text-[#00B894]">
                                +{points} POINTS
                            </div>
                        )}
                        <button onClick={() => window.location.reload()} className="block mx-auto mt-6 text-black underline font-bold hover:text-[#6C5CE7]">Next Riddle</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        <div className="relative max-w-sm mx-auto">
                            <input
                                type="text"
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                placeholder="Type your answer..."
                                className="w-full bg-[#FFFDF5] border-2 border-black rounded-xl px-6 py-4 text-center text-black font-bold text-lg focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-all placeholder:text-black/30"
                            />
                            {error && (
                                <div className="absolute -bottom-8 left-0 w-full text-center">
                                    <span className="text-[#FF7675] font-black text-xs uppercase tracking-widest bg-white px-2 py-1 border border-black rounded shadow-[2px_2px_0px_#000]">{error}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-center gap-4 pt-4">
                            <button
                                type="submit"
                                className="px-8 py-4 bg-[#6C5CE7] border-2 border-black text-white font-black tracking-[0.2em] text-sm uppercase rounded-xl shadow-[4px_4px_0px_#000] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] active:translate-y-[2px] active:shadow-none transition-all"
                            >
                                SUBMIT
                            </button>
                        </div>

                        <div className="pt-8 text-center">
                            {!hintRevealed ? (
                                <button
                                    type="button"
                                    onClick={handleBuyHint}
                                    className="text-black/40 text-xs font-black tracking-widest hover:text-[#E17055] flex items-center justify-center gap-2 mx-auto transition-colors uppercase border-b-2 border-transparent hover:border-[#E17055] pb-1"
                                >
                                    <Lightbulb size={14} /> REVEAL HINT
                                </button>
                            ) : (
                                <div className="inline-block px-6 py-3 bg-[#FFFDF5] border-2 border-black text-black text-sm font-bold rounded-xl shadow-[2px_2px_0px_#000] animate-in fade-in slide-in-from-bottom-2">
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

