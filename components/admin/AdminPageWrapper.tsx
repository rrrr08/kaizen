'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface AdminPageWrapperProps {
    children: ReactNode;
    title: string;
    description?: string;
    icon?: LucideIcon;
    iconColor?: string;
    iconBg?: string;
}

export default function AdminPageWrapper({
    children,
    title,
    description,
    icon: Icon,
    iconColor = '#FFD93D',
    iconBg = '#FFD93D',
}: AdminPageWrapperProps) {
    return (
        <div className="p-4 pb-16 md:p-8 md:pb-16 min-h-screen bg-[#FFFDF5]">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 md:mb-12 border-b-2 border-black pb-6 md:pb-8"
            >
                <div className="flex items-center gap-3 md:gap-4 mb-2">
                    {Icon && (
                        <div
                            className="p-2 rounded-lg border-2 border-black neo-shadow-sm"
                            style={{ backgroundColor: iconBg }}
                        >
                            <Icon className="w-5 h-5 md:w-6 md:h-6 text-black" />
                        </div>
                    )}
                    <h1 className="font-header text-3xl md:text-6xl font-black text-black uppercase tracking-tighter">
                        {title}
                    </h1>
                </div>
                {description && (
                    <p className="text-black/60 font-bold text-sm md:text-xl md:ml-12 lg:ml-12">
                        {description}
                    </p>
                )}
            </motion.div>

            {/* Content */}
            {children}
        </div>
    );
}
