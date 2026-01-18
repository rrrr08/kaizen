'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
    size?: 'small' | 'medium' | 'large';
    linkTo?: string;
    className?: string;
    showText?: boolean;
}

const sizeMap = {
    small: { container: 'w-8 h-8', text: 'text-lg' },
    medium: { container: 'w-10 h-10', text: 'text-xl' },
    large: { container: 'w-12 h-12', text: 'text-2xl' }
};

export default function Logo({ size = 'medium', linkTo = '/', className = '', showText = false }: LogoProps) {
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogo = async () => {
            try {
                const response = await fetch('/api/logo');
                const data = await response.json();
                setLogoUrl(data.logoUrl);
            } catch (error) {
                console.error('Error fetching logo:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLogo();
    }, []);

    const sizeConfig = sizeMap[size];

    const LogoContent = () => (
        <div className={`flex items-center gap-2 group ${className}`}>
            <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
                className={`bg-[#FFD93D] ${sizeConfig.container} border-2 border-black rounded-[12px] neo-shadow flex items-center justify-center overflow-hidden relative`}
            >
                {loading ? (
                    <span className={`${sizeConfig.text} font-black text-black`}>JJ</span>
                ) : logoUrl ? (
                    <Image
                        src={logoUrl}
                        alt="Joy Juncture Logo"
                        fill
                        className="object-cover"
                    />
                ) : (
                    <span className={`${sizeConfig.text} font-black text-black`}>JJ</span>
                )}
            </motion.div>
            {showText && (
                <span className="text-xl font-black tracking-tighter hidden xl:block text-black">
                    Joy Juncture
                </span>
            )}
        </div>
    );

    if (linkTo) {
        return (
            <Link href={linkTo} className="z-50">
                <LogoContent />
            </Link>
        );
    }

    return <LogoContent />;
}
