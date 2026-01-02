'use client';

import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useGamification } from '@/app/context/GamificationContext';
import { WHEEL_PRIZES, SPIN_COST, WheelPrize } from '@/lib/gamification';
import { Trophy, Loader2 } from 'lucide-react';

const WheelOfJoy: React.FC = () => {
    const { spinWheel, spendPoints, dailyStats, balance, loading: contextLoading } = useGamification();
    const [isSpinning, setIsSpinning] = useState(false);
    const [result, setResult] = useState<WheelPrize | null>(null);
    const [currentRotation, setCurrentRotation] = useState(0);
    const [prizes, setPrizes] = useState<WheelPrize[]>(WHEEL_PRIZES);
    const [loadingPrizes, setLoadingPrizes] = useState(true);
    const controls = useAnimation();

    useEffect(() => {
        const loadPrizes = async () => {
            const { fetchWheelPrizesFromFirebase } = await import('@/lib/gamification');
            const fetchedPrizes = await fetchWheelPrizesFromFirebase();
            if (fetchedPrizes && fetchedPrizes.length > 0) {
                setPrizes(fetchedPrizes);
            }
            setLoadingPrizes(false);
        };
        loadPrizes();
    }, []);

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
        } else if (!canPaidSpin) {
            alert("Insufficient Points!");
            return;
        }

        setIsSpinning(true);
        setResult(null);

        try {
            // Get Firebase Auth token
            const { getAuth } = await import('firebase/auth');
            const { app } = await import('@/lib/firebase');
            const auth = getAuth(app);
            const user = auth.currentUser;

            if (!user) {
                alert("Please login first");
                setIsSpinning(false);
                return;
            }

            const token = await user.getIdToken();

            // 1. Call API to get result
            const res = await fetch('/api/games/spin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isFreeSpin: isFree }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Spin failed');
            }

            const selectedPrize = data.result.prize;
            const awardedAmount = data.result.awardedValue;

            console.log('🎯 Server Selected Prize:', selectedPrize.label, 'at index:', prizes.findIndex(p => p.id === selectedPrize.id));

            // 2. Calculate Rotation (accounting for current rotation)
            const prizeIndex = prizes.findIndex(p => p.id === selectedPrize.id);
            if (prizeIndex === -1) {
                console.error("Prize returned by server not found in local configuration. Ensure admin settings match.");
                // Fallback?
            }

            const segmentAngle = 360 / prizes.length;
            const fullSpins = 5 * 360; // 5 full rotations

            // Prize at index 0 occupies: 0° to 72° (3 o'clock)
            // Pointer at 270 (top)

            const segmentStartAngle = prizeIndex * segmentAngle;
            const segmentCenterAngle = segmentStartAngle + (segmentAngle / 2);

            // Pointer is at 0° (top) in CSS terms
            const pointerAngle = 0;
            const targetAngle = pointerAngle - segmentCenterAngle;

            // Add to current rotation
            const newRotation = currentRotation + fullSpins + targetAngle;

            // 3. Animate
            await controls.start({
                rotate: newRotation,
                transition: { duration: 4, ease: "circOut" }
            });

            setCurrentRotation(newRotation);

            // 4. Update Context/UI
            // The API already updated the backend, but we might want to refresh local context
            // 'spinWheel' in context updates local state optimistically or re-fetches
            await spinWheel({ ...selectedPrize, value: awardedAmount });
            setResult({ ...selectedPrize, value: awardedAmount });

        } catch (error: any) {
            console.error('Spin Loop Error:', error);
            alert(error.message);
        } finally {
            setIsSpinning(false);
        }
    };

    if (contextLoading || loadingPrizes) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-gold" /></div>;

    const segmentAngle = 360 / prizes.length;

    return (
        <div className="flex flex-col items-center gap-12 relative">
            {/* The Wheel */}
            <div className="relative w-72 h-72 md:w-96 md:h-96">
                {/* Pointer */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 z-20 w-12 h-14 drop-shadow-[4px_4px_0px_#000]">
                    <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-black"></div>
                    <div className="absolute top-[-2px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[24px] border-t-[#FFD93D]"></div>
                </div>

                <motion.div
                    className="w-full h-full rounded-full border-4 border-black overflow-hidden relative shadow-[8px_8px_0px_#000] bg-white"
                    animate={controls}
                    initial={{ rotate: 0 }}
                >
                    {/* Background via Conic Gradient - simplified for Neo-Brutalism */}
                    <div className="absolute inset-0 rounded-full z-0" style={{
                        background: `conic-gradient(
                            ${prizes.map((p, i) =>
                            `${p.color} ${i * (100 / prizes.length)}% ${(i + 1) * (100 / prizes.length)}%`
                        ).join(', ')}
                        )`
                    }}></div>

                    {/* Segment Dividers */}
                    {prizes.map((prize, index) => (
                        <div
                            key={`divider-${prize.id}`}
                            className="absolute w-1 h-1/2 left-1/2 top-0 origin-bottom bg-black/20 z-10"
                            style={{
                                transform: `translateX(-50%) rotate(${index * segmentAngle}deg)`,
                            }}
                        />
                    ))}

                    {/* Labels Layer */}
                    {prizes.map((prize, index) => (
                        <div
                            key={prize.id}
                            className="absolute w-full h-1/2 left-0 top-0 origin-bottom flex justify-center pt-8 z-10"
                            style={{
                                transform: `rotate(${index * segmentAngle + (segmentAngle / 2)}deg)`, // Rotate to center of segment
                            }}
                        >
                            <span className="font-black text-xs md:text-sm text-white drop-shadow-[2px_2px_0px_#000] tracking-wider uppercase -rotate-90 md:rotate-0">
                                {prize.label}
                            </span>
                        </div>
                    ))}

                    {/* Center Cap */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white border-4 border-black rounded-full z-20 flex items-center justify-center shadow-[4px_4px_0px_transparent]">
                        <Trophy size={24} className="text-black fill-[#FFD93D]" />
                    </div>
                </motion.div>
            </div>

            {/* Controls */}
            <div className="text-center space-y-6 w-full max-w-md">
                {result && !isSpinning && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 mb-4 p-6 bg-[#00B894] border-2 border-black rounded-xl shadow-[4px_4px_0px_#000]">
                        <div className="text-black font-black text-xs tracking-[0.2em] mb-2 uppercase">YOU WON</div>
                        <div className="text-4xl font-black text-white drop-shadow-[2px_2px_0px_#000]">{result.label}</div>
                    </div>
                )}

                <button
                    onClick={handleSpin}
                    disabled={isSpinning || (!canFreeSpin && !canPaidSpin)}
                    className={`
                        w-full px-8 py-4 rounded-xl font-black text-lg tracking-[0.2em] transition-all uppercase border-2 border-black
                        ${isSpinning || (!canFreeSpin && !canPaidSpin)
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed border-dashed'
                            : canFreeSpin
                                ? 'bg-[#FFD93D] text-black shadow-[4px_4px_0px_#000] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] active:translate-y-[2px] active:shadow-none'
                                : 'bg-white text-black shadow-[4px_4px_0px_#000] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] active:translate-y-[2px] active:shadow-none'
                        }
                    `}
                >
                    {isSpinning ? 'SPINNING...' : canFreeSpin ? 'FREE SPIN' : `SPIN (${SPIN_COST} JP)`}
                </button>

                <div className="text-sm text-black/60 font-bold uppercase tracking-wider bg-[#FFFDF5] py-2 border-2 border-black rounded-lg inline-block px-6">
                    {canFreeSpin ? 'Daily Free Spin Available!' : `Balance: ${balance} JP`}
                </div>
            </div>
        </div>
    );
};

export default WheelOfJoy;
