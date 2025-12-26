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
                origin: { y: 0.6 },
                colors: ['#FF8C00', '#FFD400', '#FFFFFF']
            });
            await awardPoints(REWARDS.RIDDLE.SOLVE, 'Riddle Solved');
            await updateStreak();
        } else {
            setError('ACCESS_DENIED. TRY AGAIN.');
            setTimeout(() => setError(''), 2000);
        }
    };

    const handleBuyHint = async () => {
        if (hintRevealed) return;
        const success = await spendPoints(REWARDS.RIDDLE.HINT_COST, 'Riddle Hint');
        if (success) {
            setHintRevealed(true);
        } else {
            alert("INSUFFICIENT TOKENS!");
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="arcade-card-3d p-8 md:p-12 bg-black text-center relative overflow-hidden">


                <HelpCircle className="w-12 h-12 text-[#FF8C00] mx-auto mb-6" />

                <h2 className="font-arcade text-2xl md:text-3xl mb-8 leading-relaxed text-white text-3d-orange">
                    "{TODAY_RIDDLE.question}"
                </h2>

                {isWon ? (
                    <div className="animate-in zoom-in duration-300 border-2 border-[#FFD400] p-6 bg-[#FFD400]/5">
                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFD400] text-black font-arcade text-xs border border-[#B8860B] mb-4">
                            <Trophy size={16} /> DECRYPTED
                        </div>
                        <p className="text-gray-400 font-arcade text-xs">PASSWORD WAS: <span className="text-white font-bold uppercase">{TODAY_RIDDLE.answer}</span></p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative max-w-sm mx-auto">
                            <input
                                type="text"
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                placeholder="ENTER_CIPHER..."
                                className="w-full bg-[#111] border-2 border-[#333] px-4 py-4 text-center text-white focus:outline-none focus:border-[#FFD400] transition-colors font-arcade uppercase placeholder:text-gray-700"
                            />
                            {error && (
                                <div className="absolute -bottom-8 left-0 w-full text-center text-red-500 text-[10px] font-arcade animate-pulse">
                                    {error}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-center gap-4 pt-4">
                            <button
                                type="submit"
                                className="px-8 py-3 bg-white text-black font-arcade text-sm border-b-4 border-gray-400 active:border-b-0 active:translate-y-1 hover:bg-[#FF8C00] transition-all"
                            >
                                TRANSMIT
                            </button>
                        </div>

                        <div className="pt-8 border-t border-[#1A1A1A] mt-8">
                            {!hintRevealed ? (
                                <button
                                    type="button"
                                    onClick={handleBuyHint}
                                    className="text-gray-500 text-[10px] font-arcade hover:text-[#FFD400] flex items-center justify-center gap-2 mx-auto transition-colors uppercase border border-gray-800 px-4 py-2 hover:border-[#FFD400]"
                                >
                                    <Lightbulb size={14} /> DECRYPT_HINT (-{REWARDS.RIDDLE.HINT_COST} TOKENS)
                                </button>
                            ) : (
                                <div className="text-[#FFD400] text-sm font-arcade animate-in fade-in slide-in-from-bottom-2 border border-[#FFD400] p-4 bg-[#FFD400]/5">
                                    DATA_FRAGMENT: {TODAY_RIDDLE.hint}
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
