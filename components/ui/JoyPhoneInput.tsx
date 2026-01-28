'use client';

import React from 'react';
import { Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface JoyPhoneInputProps {
    value: string;
    onChange: (value: string) => void; // Emits full E.164 format (+91 XXXXXXXXXX)
    disabled?: boolean;
    error?: string;
    name?: string;
    required?: boolean;
    placeholder?: string;
    className?: string; // Add className prop
}

export default function JoyPhoneInput({
    value,
    onChange,
    disabled = false,
    error,
    name,
    required = false,
    placeholder = "98765 43210"
}: JoyPhoneInputProps) {

    // Parse: Extract the 10-digit number for display
    // We strip +91 if it exists, and any non-digit chars
    const displayValue = value
        ? value.replace(/^\+91/, '').replace(/[^\d]/g, '').slice(0, 10)
        : '';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Allow only digits
        const rawInput = e.target.value.replace(/[^\d]/g, '');

        // Limit to 10 digits
        const truncated = rawInput.slice(0, 10);

        // Emit empty if empty, otherwise prepend +91
        if (truncated === '') {
            onChange('');
        } else {
            onChange(`+91${truncated}`);
        }
    };

    return (
        <div className={`space-y-1`}>
            <div className={`relative flex items-center bg-white border-2 rounded-lg transition-all overflow-hidden ${error ? 'border-red-500' : 'border-black focus-within:ring-4 focus-within:ring-[#FFD93D]/50'
                }`}>
                {/* Country Code Block */}
                <div className="flex items-center justify-center gap-1.5 px-3 py-3 bg-gray-50 border-r-2 border-black/10 shrink-0 select-none">
                    <span className="text-lg">🇮🇳</span>
                    <span className="font-black text-black text-sm md:text-base tracking-wider">+91</span>
                </div>

                {/* Input Field */}
                <input
                    type="tel"
                    name={name}
                    value={displayValue}
                    onChange={handleChange}
                    disabled={disabled}
                    placeholder={placeholder}
                    required={required}
                    className="flex-1 w-full px-4 py-3 md:py-4 bg-transparent border-none outline-none text-black font-bold text-sm md:text-base tracking-widest placeholder:text-black/20"
                    maxLength={10}
                />

                {/* Decorator Icon */}
                <div className="pr-4 text-black/20 pointer-events-none">
                    <Phone size={16} strokeWidth={2.5} />
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <p className="text-[10px] font-black text-red-500 uppercase tracking-wider ml-1">
                    {error}
                </p>
            )}
        </div>
    );
}
