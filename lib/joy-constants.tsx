import React from 'react';

export const COLORS = {
    cream: '#FFFDF5',
    yellow: '#FFD93D',
    purple: '#6C5CE7',
    mint: '#00B894',
    charcoal: '#2D3436',
};

export const FloatingPatterns = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100">
            <path d="M10,10 L20,20 M15,10 L15,20" stroke="currentColor" fill="none" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="5" fill="currentColor" />
            <rect x="80" y="20" width="10" height="10" stroke="currentColor" fill="none" />
            <path d="M30,80 Q40,70 50,80 T70,80" stroke="currentColor" fill="none" />
        </svg>
    </div>
);

export interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    players: string;
    time: string;
    mood: string;
    description?: string;
    occasion?: string[];
    story?: string;
    howToPlay?: string;
    badges: string[];
}
