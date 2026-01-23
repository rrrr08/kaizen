'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Gamepad2, Lightbulb, MoreHorizontal, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategorySelectProps {
    value: 'Workshop' | 'Game Night' | 'Other';
    onChange: (value: 'Workshop' | 'Game Night' | 'Other') => void;
    className?: string;
}

const CATEGORIES = [
    { id: 'Workshop', label: 'Workshop', icon: Lightbulb, color: '#FFD93D' },
    { id: 'Game Night', label: 'Game Night', icon: Gamepad2, color: '#6C5CE7' },
    { id: 'Other', label: 'Other', icon: MoreHorizontal, color: '#00B894' },
] as const;

export default function CategorySelect({ value, onChange, className }: CategorySelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selected = CATEGORIES.find(c => c.id === value) || CATEGORIES[2];

    return (
        <div className={cn("relative w-full", className)} ref={containerRef}>
            <label className="font-black text-xs tracking-widest text-black/40 uppercase pl-1 mb-2 block">
                Event Category
            </label>

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full flex items-center justify-between px-4 py-3 bg-white border-2 border-black rounded-xl text-black hover:shadow-[4px_4px_0px_#000] transition-all font-bold text-left active:translate-x-[1px] active:translate-y-[1px] active:shadow-none",
                    isOpen && "shadow-[4px_4px_0px_#000] translate-x-[1px] translate-y-[1px]"
                )}
            >
                <div className="flex items-center gap-3">
                    <div
                        className="w-8 h-8 rounded-lg border-2 border-black flex items-center justify-center neo-shadow-sm"
                        style={{ backgroundColor: selected.color }}
                    >
                        <selected.icon size={16} className={selected.id === 'Game Night' ? 'text-white' : 'text-black'} />
                    </div>
                    <span className="tracking-tight">{selected.label}</span>
                </div>
                <ChevronDown
                    size={20}
                    className={cn("text-black/30 transition-transform duration-300", isOpen && "rotate-180 text-black")}
                />
            </button>

            {isOpen && (
                <div className="absolute z-[100] top-full mt-3 w-full bg-white border-2 border-black rounded-2xl shadow-[8px_8px_0px_#000] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-2 space-y-1">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => {
                                    onChange(cat.id);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all group",
                                    value === cat.id
                                        ? "bg-[#A8E6CF] text-black font-black"
                                        : "hover:bg-[#FFFDF5] text-black/60 hover:text-black"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={cn(
                                            "w-8 h-8 rounded-lg border-2 border-black flex items-center justify-center transition-transform group-hover:scale-110",
                                            value === cat.id ? "neo-shadow-none" : "neo-shadow-sm"
                                        )}
                                        style={{ backgroundColor: cat.color }}
                                    >
                                        <cat.icon size={16} className={cn(cat.id === 'Game Night' ? 'text-white' : 'text-black')} />
                                    </div>
                                    <span className="font-black text-sm uppercase tracking-wide">{cat.label}</span>
                                </div>
                                {value === cat.id && <Check size={18} className="text-black" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
