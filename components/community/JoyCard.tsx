import React from 'react';
import { Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface JoyCardProps {
    name: string;
    role: string;
    quote: string;
    image?: string;
    index: number;
}

export default function JoyCard({ name, role, quote, image, index }: JoyCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative bg-white border-4 border-black rounded-[32px] p-8 neo-shadow hover:translate-y-[-4px] transition-transform duration-300 flex flex-col h-full"
        >
            {/* Quote Icon */}
            <div className="mb-6">
                <div className="w-12 h-12 bg-[#FFD93D] border-4 border-black rounded-full flex items-center justify-center neo-shadow-sm group-hover:rotate-12 transition-transform">
                    <Quote size={20} className="text-black" />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 mb-6">
                <p className="font-medium text-lg text-black/80 leading-relaxed italic">
                    "{quote}"
                </p>
            </div>

            {/* Author */}
            <div className="flex items-center gap-4 pt-6 border-t-2 border-black/5">
                <div className="w-12 h-12 rounded-full border-2 border-black bg-gray-100 overflow-hidden flex-shrink-0 relative">
                    {image ? (
                        <Image
                            src={image}
                            alt={name}
                            fill
                            sizes="48px"
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#6C5CE7] text-white font-black text-lg">
                            {name.charAt(0)}
                        </div>
                    )}
                </div>
                <div>
                    <h4 className="font-black text-black uppercase tracking-tight">{name}</h4>
                    <p className="text-xs font-bold text-black/40 uppercase tracking-wider">{role}</p>
                </div>
            </div>

            {/* Decorative Corner */}
            <div className="absolute top-0 right-0 p-4">
                <div className="w-3 h-3 bg-black rounded-full/20 group-hover:bg-[#FF7675] transition-colors" />
            </div>
        </motion.div>
    );
}
