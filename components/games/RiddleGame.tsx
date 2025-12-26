'use client';

import React, { useState } from 'react';
import { useGamification } from '@/app/context/GamificationContext';
import { REWARDS } from '@/lib/gamification';
import { Lightbulb, Trophy, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

const RIDDLES = [
    {
        id: 'r1',
        question: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?",
        answer: "map",
        hint: "You use me to find your way."
    },
    {
        id: 'r2',
        question: "The more of this there is, the less you see. What is it?",
        answer: "darkness",
        hint: "Turn on the light to lose me."
    }
];

// Pick one based on day of month to rotate
const TODAY_RIDDLE = RIDDLES[new Date().getDate() % RIDDLES.length];

const RiddleGame: React.FC = () => {
    const { awardPoints, spendPoints, updateStreak } = useGamification();
    const [answer, setAnswer] = useState('');
    const [hintRevealed, setHintRevealed] = useState(false);
    const [isWon, setIsWon] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isWon) return;

        if (answer.toLowerCase().trim() === TODAY_RIDDLE.answer) {
            setIsWon(true);
            setError('');
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
            await awardPoints(REWARDS.RIDDLE.SOLVE, 'Riddle Solved');
            await updateStreak();
        } else {
            setError('Incorrect, try again!');
            setTimeout(() => setError(''), 2000);
        }
    };

    const handleBuyHint = async () => {
        if (hintRevealed) return;
        const success = await spendPoints(REWARDS.RIDDLE.HINT_COST, 'Riddle Hint');
        if (success) {
            setHintRevealed(true);
        } else {
            alert("Not enough points for hint!");
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="glass-card p-8 md:p-12 rounded-lg border border-white/10 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50"></div>

                <HelpCircle className="w-12 h-12 text-amber-500/50 mx-auto mb-6" />

                <h2 className="font-display text-2xl md:text-3xl mb-8 leading-relaxed">
                    "{TODAY_RIDDLE.question}"
                </h2>

                {isWon ? (
                    <div className="animate-in zoom-in duration-300">
                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500/20 text-emerald-400 rounded-full font-header tracking-widest text-sm border border-emerald-500/50 mb-4">
                            <Trophy size={16} /> SOLVED
                        </div>
                        <p className="text-white/60 font-serif italic">The answer was: <span className="text-white font-bold uppercase">{TODAY_RIDDLE.answer}</span></p>
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
                                    <Lightbulb size={14} /> REVEAL HINT (-{REWARDS.RIDDLE.HINT_COST} JP)
                                </button>
                            ) : (
                                <div className="text-amber-500 text-sm font-serif italic animate-in fade-in slide-in-from-bottom-2">
                                    Hint: {TODAY_RIDDLE.hint}
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
