'use client';

import React from 'react';
import { useGamification } from '@/app/context/GamificationContext';

interface LevelBadgeProps {
    showProgress?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

const LevelBadge: React.FC<LevelBadgeProps> = ({ showProgress = false, size = 'md' }) => {
    const { tier, xp, nextTier } = useGamification();

    // Calculate Progress
    let progress = 0;
    if (nextTier) {
        const currentLevelBase = tier.minXP;
        const nextLevelTarget = nextTier.minXP;
        progress = Math.min(100, Math.max(0, ((xp - currentLevelBase) / (nextLevelTarget - currentLevelBase)) * 100));
    } else {
        progress = 100; // Max level
    }

    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-3 py-1',
        lg: 'text-base px-4 py-2'
    };

    const iconSizes = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-xl'
    };

    return (
        <div className="flex flex-col gap-1">
            <div className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm ${sizeClasses[size]} ${tier.color} transition-all hover:bg-white/10`}>
                <span className={iconSizes[size]}>{tier.icon}</span>
                <span className="font-header tracking-widest uppercase font-bold">{tier.name}</span>
            </div>

            {showProgress && nextTier && (
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-1">
                    <div
                        className={`h-full ${tier.color.replace('text-', 'bg-')} transition-all duration-500`}
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            )}

            {showProgress && nextTier && (
                <div className="flex justify-between text-[8px] text-white/30 uppercase tracking-wider px-1">
                    <span>{xp} XP</span>
                    <span>{nextTier.minXP} XP</span>
                </div>
            )}
        </div>
    );
};

export default LevelBadge;
