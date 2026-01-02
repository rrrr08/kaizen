'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Sparkles } from 'lucide-react';
import Image from 'next/image';

interface SplashScreenProps {
    onComplete?: () => void;
}

// Particle component for explosion effect
const Particle = ({ delay, color, size, x, y }: { delay: number; color: string; size: number; x: number; y: number }) => (
    <motion.div
        initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
        animate={{
            opacity: [1, 1, 0],
            scale: [0, 1.5, 0.5],
            x: x,
            y: y,
        }}
        transition={{
            duration: 1.2,
            delay: delay,
            ease: "easeOut"
        }}
        className="absolute rounded-full"
        style={{
            backgroundColor: color,
            width: size,
            height: size,
            left: '50%',
            top: '50%',
            marginLeft: -size / 2,
            marginTop: -size / 2,
        }}
    />
);

// Floating dice component
const FloatingDice = ({ delay, Icon, color, startX, startY }: {
    delay: number;
    Icon: React.ElementType;
    color: string;
    startX: number;
    startY: number;
}) => (
    <motion.div
        initial={{ opacity: 0, x: startX, y: startY, rotate: 0, scale: 0 }}
        animate={{
            opacity: [0, 1, 1, 0],
            y: [startY, startY - 100, startY - 200, startY - 300],
            x: [startX, startX + 20, startX - 10, startX + 30],
            rotate: [0, 180, 360, 540],
            scale: [0, 1, 1.2, 0.8],
        }}
        transition={{
            duration: 2,
            delay: delay,
            ease: "easeOut"
        }}
        className="absolute p-3 rounded-xl border-2 border-black"
        style={{ backgroundColor: color }}
    >
        <Icon size={32} className="text-black" />
    </motion.div>
);

export default function SplashScreen({ onComplete }: SplashScreenProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [phase, setPhase] = useState(1);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);

    useEffect(() => {
        // Fetch logo from API
        const fetchLogo = async () => {
            try {
                const response = await fetch('/api/logo');
                const data = await response.json();
                if (data.logoUrl) {
                    setLogoUrl(data.logoUrl);
                }
            } catch (error) {
                console.error('Error fetching logo:', error);
            }
        };
        fetchLogo();
    }, []);

    useEffect(() => {

        // Phase transitions
        const phase2Timer = setTimeout(() => setPhase(2), 800);
        const phase3Timer = setTimeout(() => setPhase(3), 1600);
        const phase4Timer = setTimeout(() => setPhase(4), 2400);
        const phase5Timer = setTimeout(() => setPhase(5), 3200);
        const completeTimer = setTimeout(() => {
            setIsVisible(false);
            onComplete?.();
        }, 4500);

        return () => {
            clearTimeout(phase2Timer);
            clearTimeout(phase3Timer);
            clearTimeout(phase4Timer);
            clearTimeout(phase5Timer);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    const handleSkip = () => {
        setIsVisible(false);
        onComplete?.();
    };

    const colors = {
        yellow: '#FFD93D',
        purple: '#6C5CE7',
        green: '#00B894',
        coral: '#FF7675',
    };

    // Generate particles with deterministic values
    const particles = Array.from({ length: 20 }).map((_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const distance = 100 + ((i * 7) % 150);
        return {
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance,
            color: Object.values(colors)[i % 4],
            size: 8 + ((i * 3) % 16),
            delay: 0.3 + (i * 0.02),
        };
    });

    const letterVariants = {
        hidden: { opacity: 0, y: 50, rotate: -10 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            rotate: 0,
            transition: {
                delay: 1.8 + i * 0.08,
                duration: 0.5,
                type: "spring" as const,
                stiffness: 200,
            },
        }),
    };

    const title = "Joy Juncture";

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
                    style={{ backgroundColor: '#FFFDF5' }}
                >
                    {/* Background gradient animation */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: phase >= 3 ? 0.3 : 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0"
                        style={{
                            background: `radial-gradient(circle at center, ${colors.purple}40 0%, transparent 70%)`,
                        }}
                    />

                    {/* Particles */}
                    {phase >= 1 && particles.map((p, i) => (
                        <Particle key={i} {...p} />
                    ))}

                    {/* Floating Dice */}
                    {phase >= 2 && (
                        <>
                            <FloatingDice delay={0.9} Icon={Dice1} color={colors.yellow} startX={-150} startY={50} />
                            <FloatingDice delay={1.0} Icon={Dice2} color={colors.purple} startX={150} startY={80} />
                            <FloatingDice delay={1.1} Icon={Dice3} color={colors.green} startX={-100} startY={120} />
                            <FloatingDice delay={1.2} Icon={Dice4} color={colors.coral} startX={100} startY={60} />
                            <FloatingDice delay={1.3} Icon={Dice5} color={colors.yellow} startX={-180} startY={100} />
                            <FloatingDice delay={1.4} Icon={Dice6} color={colors.purple} startX={180} startY={40} />
                        </>
                    )}

                    {/* Logo */}
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{
                            scale: phase >= 1 ? 1 : 0,
                            rotate: phase >= 1 ? 0 : -180,
                        }}
                        transition={{
                            duration: 0.8,
                            type: "spring",
                            stiffness: 200,
                            damping: 15,
                        }}
                        className="relative z-10"
                    >
                        <motion.div
                            animate={{
                                boxShadow: [
                                    '0 0 0px rgba(255,217,61,0)',
                                    '0 0 60px rgba(255,217,61,0.8)',
                                    '0 0 30px rgba(255,217,61,0.4)',
                                ],
                            }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="bg-[#FFD93D] rounded-[20px] border-4 border-black flex items-center justify-center overflow-hidden"
                            style={{ width: 100, height: 100, padding: logoUrl ? 8 : 16 }}
                        >
                            {logoUrl ? (
                                <motion.div
                                    className="relative w-full h-full"
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ duration: 0.5, delay: 0.5, ease: "easeInOut" }}
                                >
                                    <Image
                                        src={logoUrl}
                                        alt="Logo"
                                        fill
                                        className="object-cover rounded-lg"
                                    />
                                </motion.div>
                            ) : (
                                <motion.span
                                    className="text-4xl md:text-5xl font-black text-black"
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ duration: 0.5, delay: 0.5, ease: "easeInOut" }}
                                >
                                    JJ
                                </motion.span>
                            )}
                        </motion.div>

                        {/* Sparkle accents */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1, rotate: 15 }}
                            transition={{ delay: 0.6, duration: 0.3 }}
                            className="absolute -top-4 -right-4"
                        >
                            <Sparkles size={32} className="text-[#FFD93D]" />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1, rotate: -15 }}
                            transition={{ delay: 0.7, duration: 0.3 }}
                            className="absolute -bottom-4 -left-4"
                        >
                            <Sparkles size={24} className="text-[#00B894]" />
                        </motion.div>
                    </motion.div>

                    {/* Title */}
                    {phase >= 3 && (
                        <div className="mt-8 md:mt-12 flex overflow-hidden">
                            {title.split('').map((letter, i) => (
                                <motion.span
                                    key={i}
                                    custom={i}
                                    initial="hidden"
                                    animate="visible"
                                    variants={letterVariants}
                                    className={`text-4xl md:text-6xl font-black ${letter === ' ' ? 'w-4' : ''}`}
                                    style={{
                                        color: i < 3 ? colors.purple : i < 4 ? '#2D3436' : colors.green,
                                        textShadow: '2px 2px 0px rgba(0,0,0,0.1)',
                                    }}
                                >
                                    {letter}
                                </motion.span>
                            ))}
                        </div>
                    )}

                    {/* Tagline */}
                    {phase >= 4 && (
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="mt-4 md:mt-6 text-lg md:text-xl text-black/60 font-bold tracking-wide"
                        >
                            Games • Moments • Joy
                        </motion.p>
                    )}

                    {/* Greeting */}
                    {phase >= 5 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, type: "spring", stiffness: 150 }}
                            className="mt-8 md:mt-12 text-center"
                        >
                            <motion.p
                                className="text-3xl md:text-5xl font-black text-[#6C5CE7]"
                                animate={{ y: [0, -5, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            >
                                🙏 Hello Namaste!
                            </motion.p>
                        </motion.div>
                    )}

                    {/* Skip button */}
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        whileHover={{ opacity: 1, scale: 1.05 }}
                        transition={{ delay: 0.5 }}
                        onClick={handleSkip}
                        className="absolute bottom-8 right-8 text-black/40 hover:text-black text-sm font-bold tracking-wider uppercase transition-colors"
                    >
                        Skip →
                    </motion.button>

                    {/* Loading bar */}
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 4.2, ease: "linear" }}
                        className="absolute bottom-0 left-0 h-1 origin-left"
                        style={{
                            width: '100%',
                            background: `linear-gradient(90deg, ${colors.yellow}, ${colors.purple}, ${colors.green}, ${colors.coral})`,
                        }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
