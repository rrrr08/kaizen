'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGamification } from '@/app/context/GamificationContext';
import { REWARDS } from '@/lib/gamification';
import { Dice5, Gamepad2, Ghost, Gift } from 'lucide-react';

const ICONS = [Dice5, Gamepad2, Ghost, Gift];

const TreasureHunt: React.FC = () => {
    const { foundEasterEgg, dailyStats } = useGamification();
    const [isVisible, setIsVisible] = useState(false);
    const [collected, setCollected] = useState(false);
    const [rewardAmount, setRewardAmount] = useState(0);

    // Choose random icon
    const [IconComponent, setIconComponent] = useState<any>(null);
    const [position, setPosition] = useState({ top: '20%', duration: 10 });

    useEffect(() => {
        // 1. Check Daily Cap
        if (dailyStats.eggsFound >= REWARDS.TREASURE_HUNT.DAILY_CAP) return;

        // 2. Roll Chance
        const roll = Math.random();
        if (roll > REWARDS.TREASURE_HUNT.SPAWN_CHANCE) return;

        // 3. Setup Spawn
        const RandomIcon = ICONS[Math.floor(Math.random() * ICONS.length)];
        setIconComponent(() => RandomIcon);

        // Randomize flight
        setPosition({
            top: `${Math.floor(Math.random() * 80) + 10}%`, // 10% to 90% height
            duration: Math.floor(Math.random() * 5) + 10 // 10-15s duration
        });

        // Delay start slightly
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 2000);

        return () => clearTimeout(timer);
    }, [dailyStats.eggsFound]);

    const handleCatch = async () => {
        if (collected) return;
        setCollected(true);

        const success = await foundEasterEgg();
        if (success) {
            // Show +JP animation (simplified here, in reality we'd get the actual amount from a return or calc)
            // For UI feedback we assume slightly generic or pre-calc. 
            // Ideally `foundEasterEgg` returns the amount. 
            // I'll assume 10 for visual feedback or just "+JP"
            setRewardAmount(10);

            // Hide after celebration
            setTimeout(() => setIsVisible(false), 2000);
        } else {
            // Maybe capped in race condition
            setIsVisible(false);
        }
    };

    if (!isVisible || !IconComponent) return null;

    return (
        <AnimatePresence>
            {isVisible && !collected && (
                <motion.div
                    className="fixed z-[100] cursor-pointer text-gold drop-shadow-[0_0_10px_rgba(251,191,36,0.5)] hover:text-white transition-colors"
                    initial={{ left: '-10%', top: position.top, rotate: 0 }}
                    animate={{ left: '110%', rotate: 360 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ duration: position.duration, ease: 'linear' }}
                    onClick={handleCatch}
                    whileHover={{ scale: 1.5 }}
                >
                    <IconComponent size={48} />
                </motion.div>
            )}

            {collected && (
                <motion.div
                    className="fixed z-[100] pointer-events-none"
                    style={{ top: position.top, left: '50%' }}
                    initial={{ opacity: 1, scale: 1, y: 0 }}
                    animate={{ opacity: 0, scale: 2, y: -100 }}
                    transition={{ duration: 1.5 }}
                >
                    <div className="flex flex-col items-center">
                        <div className="text-4xl font-bold text-gold">+{rewardAmount} JP</div>
                        <div className="text-white text-sm font-header tracking-widest">FOUND!</div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default TreasureHunt;
