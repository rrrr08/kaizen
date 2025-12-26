'use client';

import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useGamification } from '@/app/context/GamificationContext';
import { WHEEL_PRIZES, SPIN_COST, WheelPrize } from '@/lib/gamification';
import { Trophy, Loader2 } from 'lucide-react';

const WheelOfJoy: React.FC = () => {
    const { spinWheel, spendPoints, dailyStats, balance, loading } = useGamification();
    const [isSpinning, setIsSpinning] = useState(false);
    const [result, setResult] = useState<WheelPrize | null>(null);
    const controls = useAnimation();

    const canFreeSpin = (() => {
        if (!dailyStats.lastSpinDate) return true;
        const today = new Date().toISOString().split('T')[0];
        return dailyStats.lastSpinDate !== today;
    })();

    const canPaidSpin = balance >= SPIN_COST;

    const handleSpin = async () => {
        if (isSpinning) return;

        let isFree = false;
        if (canFreeSpin) {
            isFree = true;
        } else if (canPaidSpin) {
            const success = await spendPoints(SPIN_COST, 'Wheel Spin');
            if (!success) {
                alert("Insufficient Points!");
                return;
            }
        } else {
            return;
        }

        setIsSpinning(true);
        setResult(null);

        // 1. Determine Result (Weighted Random)
        const rand = Math.random();
        let cumulative = 0;
        let selectedPrize = WHEEL_PRIZES[0];

        for (const prize of WHEEL_PRIZES) {
            cumulative += prize.probability;
            if (rand <= cumulative) {
                selectedPrize = prize;
                break;
            }
        }

        // 2. Calculate Rotation
        const prizeIndex = WHEEL_PRIZES.findIndex(p => p.id === selectedPrize.id);
        const segmentAngle = 360 / WHEEL_PRIZES.length;
        // Add minimal extra rotation (e.g., 5 full spins) + random jitter within segment - target segment offset
        const fullSpins = 5 * 360;
        const targetRotation = fullSpins + (360 - (prizeIndex * segmentAngle)) - (segmentAngle / 2); // Center of segment

        // 3. Animate
        await controls.start({
            rotate: targetRotation,
            transition: { duration: 4, ease: "circOut" }
        });

        // 4. Commit Result
        await spinWheel(selectedPrize);
        setResult(selectedPrize);
        setIsSpinning(false);

        // Reset rotation visually (instant) for next spin logic if needed, 
        // but typically better to just keep adding rotation or reset 
        // Modulo logic would be needed for continuous spinning without visual glitches
        // For simple MVP: leave it rotated.
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-gold" /></div>;

    const segmentAngle = 360 / WHEEL_PRIZES.length;

    return (
        <div className="flex flex-col items-center gap-8 relative">
            {/* The Wheel */}
            <div className="relative w-64 h-64 md:w-80 md:h-80">
                {/* Pointer */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20 w-8 h-10">
                    <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[20px] border-t-white drop-shadow-lg"></div>
                </div>

                <motion.div
                    className="w-full h-full rounded-full border-4 border-amber-500/30 overflow-hidden relative shadow-[0_0_50px_rgba(245,158,11,0.2)] bg-black"
                    animate={controls}
                    initial={{ rotate: 0 }}
                >
                    {WHEEL_PRIZES.map((prize, index) => (
                        <div
                            key={prize.id}
                            className="absolute w-full h-full left-0 top-0 origin-center flex justify-center pt-4"
                            style={{
                                transform: `rotate(${index * segmentAngle}deg)`,
                                clipPath: 'polygon(50% 50%, 0 0, 100% 0)' // Rough segment approximation
                                // Better approach for segments is CSS conic-gradient or SVG text on path.
                                // For MVP simplicity with div rotation:
                                // This won't nicely slice the PIE. 
                                // Alternative: Use Conic Gradient for background and just rotate text markers.
                            }}
                        >
                            {/* <span className="font-header text-[10px] font-bold text-white tracking-widest -rotate-90 mt-8" style={{ color: prize.color }}>
                                {prize.label}
                            </span> */}
                        </div>
                    ))}

                    {/* Background via Conic Gradient */}
                    <div className="absolute inset-0 rounded-full z-0" style={{
                        background: `conic-gradient(
                            ${WHEEL_PRIZES.map((p, i) =>
                            `${p.color} ${i * (100 / WHEEL_PRIZES.length)}% ${(i + 1) * (100 / WHEEL_PRIZES.length)}%`
                        ).join(', ')}
                        )`
                    }}></div>

                    {/* Labels Layer */}
                    {WHEEL_PRIZES.map((prize, index) => (
                        <div
                            key={prize.id}
                            className="absolute w-full h-1/2 left-0 top-0 origin-bottom flex justify-center pt-6 z-10"
                            style={{
                                transform: `rotate(${index * segmentAngle + (segmentAngle / 2)}deg)`, // Rotate to center of segment
                            }}
                        >
                            <span className="font-header text-[10px] font-bold text-white drop-shadow-md tracking-wider">
                                {prize.label}
                            </span>
                        </div>
                    ))}

                    {/* Center Cap */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-black border-2 border-amber-500 rounded-full z-20 flex items-center justify-center">
                        <Trophy size={16} className="text-gold" />
                    </div>
                </motion.div>
            </div>

            {/* Controls */}
            <div className="text-center space-y-4">
                {result && !isSpinning && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 mb-4 p-4 border border-gold/30 bg-gold/10 rounded-lg">
                        <div className="text-gold font-header text-sm tracking-widest mb-1">YOU WON</div>
                        <div className="text-2xl font-bold text-white">{result.label}</div>
                    </div>
                )}

                <button
                    onClick={handleSpin}
                    disabled={isSpinning || (!canFreeSpin && !canPaidSpin)}
                    className={`
                        px-8 py-3 rounded-full font-header text-sm tracking-widest transition-all
                        ${isSpinning || (!canFreeSpin && !canPaidSpin)
                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            : canFreeSpin
                                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:scale-105 shadow-glow'
                                : 'border border-amber-500/50 text-amber-500 hover:bg-amber-500/10'
                        }
                    `}
                >
                    {isSpinning ? 'SPINNING...' : canFreeSpin ? 'FREE SPIN' : `SPIN (${SPIN_COST} JP)`}
                </button>

                <div className="text-xs text-white/40 font-serif italic">
                    {canFreeSpin ? 'Daily Free Spin Available!' : `Balance: ${balance} JP`}
                </div>
            </div>
        </div>
    );
};

export default WheelOfJoy;
