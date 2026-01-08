'use client';

import { useState, useEffect, useRef } from 'react';
import { Trophy, RotateCcw, Play, Pause, Star, Info } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { awardGamePoints } from '@/lib/gameApi';
import Scratcher from '../gamification/Scratcher';

const TANGO_GAME_ID = 'tango';

export default function TangoGame() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [isPaused, setIsPaused] = useState(true);
    const [ballSpeed, setBallSpeed] = useState(3);
    const [isGameOfDay, setIsGameOfDay] = useState(false);
    const [alreadyPlayed, setAlreadyPlayed] = useState(false);
    const [points, setPoints] = useState<number | null>(null);
    const [message, setMessage] = useState('');
    const [showScratcher, setShowScratcher] = useState(false);
    const [scratcherDrops, setScratcherDrops] = useState<{ prob: number, points: number }[] | null>(null);
    const [showRules, setShowRules] = useState(false);

    useEffect(() => {
        // Fetch game settings and status
        fetch('/api/games/game-of-the-day')
            .then(r => r.json())
            .then(d => { if (d.gameId === TANGO_GAME_ID) setIsGameOfDay(true); });

        fetch('/api/games/settings')
            .then(r => r.json())
            .then(d => {
                const cfg = d.settings?.[TANGO_GAME_ID];
                if (cfg?.scratcher?.enabled) setScratcherDrops(cfg.scratcher.drops || null);
            });
    }, []);

    const awardPoints = async (finalScore: number) => {
        if (finalScore < 100) {
            setMessage(`Score at least 100 points to earn JP!`);
            return;
        }

        setMessage('Awarding points...');
        const result = await awardGamePoints({
            gameId: TANGO_GAME_ID,
            points: Math.floor(finalScore / 10),
            retry: 0
        });

        if (result.success) {
            setPoints(result.awardedPoints || 0);
            setMessage(result.message || `You earned ${result.awardedPoints} points!`);
            if (scratcherDrops) setShowScratcher(true);
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        } else if (result.error === 'Already played today') {
            setAlreadyPlayed(true);
            setMessage(result.message || 'You already played today!');
        } else {
            setMessage(result.error || 'Error awarding points');
        }
    };

    const gameStateRef = useRef({
        ball: { x: 300, y: 300, radius: 10, dx: 3, dy: -3 },
        paddle: { x: 250, y: 550, width: 100, height: 15 },
        bricks: [] as { x: number; y: number; width: number; height: number; hits: number; color: string }[],
        score: 0,
        animationId: 0,
    });

    // Initialize bricks
    const initializeBricks = () => {
        const bricks = [];
        const brickRowCount = 5;
        const brickColumnCount = 8;
        const brickWidth = 70;
        const brickHeight = 20;
        const brickPadding = 5;
        const brickOffsetTop = 50;
        const brickOffsetLeft = 35;

        const colors = ['#6C5CE7', '#FFD93D', '#00B894', '#FF7675', '#74B9FF'];

        for (let c = 0; c < brickColumnCount; c++) {
            for (let r = 0; r < brickRowCount; r++) {
                bricks.push({
                    x: c * (brickWidth + brickPadding) + brickOffsetLeft,
                    y: r * (brickHeight + brickPadding) + brickOffsetTop,
                    width: brickWidth,
                    height: brickHeight,
                    hits: 0,
                    color: colors[r],
                });
            }
        }

        gameStateRef.current.bricks = bricks;
    };

    // Reset game
    const resetGame = () => {
        gameStateRef.current = {
            ball: { x: 300, y: 300, radius: 10, dx: 3, dy: -3 },
            paddle: { x: 250, y: 550, width: 100, height: 15 },
            bricks: [],
            score: 0,
            animationId: 0,
        };
        initializeBricks();
        setScore(0);
        setGameOver(false);
        setIsPaused(true);
        setBallSpeed(3);
        setPoints(null);
        setMessage('');
        setShowScratcher(false);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!canvasRef.current) return;
            const rect = canvasRef.current.getBoundingClientRect();
            if (rect.width === 0) return;

            const scale = 600 / rect.width;
            const mouseX = (e.clientX - rect.left) * scale;

            gameStateRef.current.paddle.x = mouseX - gameStateRef.current.paddle.width / 2;

            if (gameStateRef.current.paddle.x < 0) {
                gameStateRef.current.paddle.x = 0;
            }
            if (gameStateRef.current.paddle.x + gameStateRef.current.paddle.width > 600) {
                gameStateRef.current.paddle.x = 600 - gameStateRef.current.paddle.width;
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        const handleTouchMove = (e: TouchEvent) => {
            if (!canvasRef.current || e.touches.length === 0) return;
            const rect = canvasRef.current.getBoundingClientRect();
            if (rect.width === 0) return;

            const scale = 600 / rect.width;
            const touchX = (e.touches[0].clientX - rect.left) * scale;

            gameStateRef.current.paddle.x = touchX - gameStateRef.current.paddle.width / 2;

            if (gameStateRef.current.paddle.x < 0) {
                gameStateRef.current.paddle.x = 0;
            }
            if (gameStateRef.current.paddle.x + gameStateRef.current.paddle.width > 600) {
                gameStateRef.current.paddle.x = 600 - gameStateRef.current.paddle.width;
            }
        };

        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        return () => window.removeEventListener('touchmove', handleTouchMove);
    }, []);

    // Game loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const draw = () => {
            const { ball, paddle, bricks } = gameStateRef.current;

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw ball
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#f59e0b';
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.closePath();

            // Draw paddle
            ctx.beginPath();
            ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 8);
            ctx.fillStyle = '#6C5CE7';
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.closePath();

            // Draw bricks
            bricks.forEach((brick) => {
                ctx.beginPath();
                ctx.roundRect(brick.x, brick.y, brick.width, brick.height, 6);
                ctx.fillStyle = brick.color;
                ctx.fill();
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 3;
                ctx.stroke();
                ctx.closePath();
            });

            if (!isPaused && !gameOver) {
                // Move ball
                ball.x += ball.dx;
                ball.y += ball.dy;

                // Wall collision
                if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
                    ball.dx = -ball.dx;
                }
                if (ball.y - ball.radius < 0) {
                    ball.dy = -ball.dy;
                }

                // Paddle collision
                if (
                    ball.y + ball.radius > paddle.y &&
                    ball.x > paddle.x &&
                    ball.x < paddle.x + paddle.width
                ) {
                    ball.dy = -ball.dy;
                    const hitPos = (ball.x - paddle.x) / paddle.width;
                    ball.dx = (hitPos - 0.5) * 6;
                }

                // Brick collision
                bricks.forEach((brick, index) => {
                    if (
                        ball.x > brick.x &&
                        ball.x < brick.x + brick.width &&
                        ball.y > brick.y &&
                        ball.y < brick.y + brick.height
                    ) {
                        ball.dy = -ball.dy;
                        bricks.splice(index, 1);
                        gameStateRef.current.score += 20;
                        setScore(gameStateRef.current.score);

                        if (gameStateRef.current.score % 100 === 0) {
                            const speedIncrease = 1.1;
                            ball.dx *= speedIncrease;
                            ball.dy *= speedIncrease;
                            setBallSpeed((prev) => prev * speedIncrease);
                        }
                    }
                });

                // Game over
                if (ball.y + ball.radius > canvas.height) {
                    setGameOver(true);
                    if (gameStateRef.current.score > highScore) {
                        setHighScore(gameStateRef.current.score);
                    }
                    awardPoints(gameStateRef.current.score);
                    return;
                }

                // Win condition
                if (bricks.length === 0) {
                    setGameOver(true);
                    if (gameStateRef.current.score > highScore) {
                        setHighScore(gameStateRef.current.score);
                    }
                    awardPoints(gameStateRef.current.score);
                    return;
                }
            }

            gameStateRef.current.animationId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            if (gameStateRef.current.animationId) {
                cancelAnimationFrame(gameStateRef.current.animationId);
            }
        };
    }, [isPaused, gameOver, highScore]);

    // Initialize game
    useEffect(() => {
        initializeBricks();
    }, []);

    return (
        <div className="max-w-4xl mx-auto px-4 py-4 sm:py-8">
            {/* Rules Modal */}
            <AnimatePresence>
                {showRules && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowRules(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white border-4 border-black rounded-[40px] p-8 max-w-2xl w-full neo-shadow relative overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#FFD93D] rounded-full opacity-20" />

                            <h2 className="text-3xl font-black mb-8 uppercase tracking-tighter flex items-center gap-3">
                                <Info size={32} className="text-[#6C5CE7]" /> HOW TO PLAY
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                                <div className="space-y-6">
                                    <div className="bg-[#FFFDF5] p-5 rounded-2xl border-2 border-black">
                                        <h3 className="font-black text-lg mb-2 text-[#6C5CE7]">🎯 Objective</h3>
                                        <p className="text-black/80 font-bold leading-snug">Bounce the ball and destroy all bricks to clear the stage!</p>
                                    </div>

                                    <div className="bg-[#E8F5E9] p-5 rounded-2xl border-2 border-black">
                                        <h3 className="font-black text-lg mb-2 text-[#00B894]">🎮 Controls</h3>
                                        <ul className="space-y-2 text-black/80 font-bold text-sm">
                                            <li>• Move Mouse / Slide on Touch</li>
                                            <li>• Don't let the ball fall!</li>
                                            <li>• Speed increases periodically</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-black text-white p-5 rounded-2xl">
                                        <h3 className="font-black text-lg mb-2 text-[#FF7675]">🏆 Rewards</h3>
                                        <ul className="space-y-2 text-white/80 font-bold text-sm">
                                            <li>• Score 100+ to earn JP</li>
                                            <li>• Game of the Day: 2X Bonus</li>
                                        </ul>
                                    </div>

                                    <div className="bg-[#A29BFE]/20 p-5 rounded-2xl border-2 border-dashed border-black">
                                        <h3 className="font-black text-lg mb-2 text-[#6C5CE7]">💡 Pro Tip</h3>
                                        <p className="text-black/70 font-bold text-xs italic">Use the edges of the paddle to spin the ball and hit tricky corners!</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowRules(false)}
                                className="mt-10 w-full px-6 py-4 bg-[#6C5CE7] text-white rounded-2xl border-4 border-black font-black uppercase text-xl shadow-[8px_8px_0px_#000] hover:translate-y-[-4px] hover:shadow-[10px_10px_0px_#000] active:translate-y-[2px] active:shadow-none transition-all"
                            >
                                Let's Battle!
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Game of the Day Badge */}
            <AnimatePresence>
                {isGameOfDay && (
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="mb-8 flex justify-center"
                    >
                        <div className="inline-flex items-center gap-3 px-8 py-4 bg-[#FFD93D] text-black rounded-full font-black tracking-[0.2em] text-sm border-4 border-black shadow-[6px_6px_0px_#000]">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            >
                                <Star size={20} className="fill-black" />
                            </motion.div>
                            GAME OF THE DAY IS LIVE
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="bg-white border-4 border-black p-4 sm:p-12 rounded-[50px] shadow-[16px_16px_0px_#000] relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD93D] rounded-bl-[100px] border-l-4 border-b-4 border-black -mr-16 -mt-16 sm:mr-0 sm:mt-0 shadow-[-4px_4px_0px_#000]" />

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 relative z-10">
                    <div className="text-left w-full sm:w-auto">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowRules(true)}
                            className="inline-flex items-center gap-2 mb-6 px-6 py-3 bg-[#FFD93D] text-black rounded-2xl border-2 border-black font-black uppercase text-xs shadow-[4px_4px_0px_#000] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] transition-all"
                        >
                            <Info size={16} strokeWidth={3} /> HOW TO PLAY
                        </motion.button>
                        <h2 className="text-6xl sm:text-7xl font-black text-black uppercase tracking-tighter leading-[0.8]">
                            TANGO<br /><span className="text-[#6C5CE7] text-3xl sm:text-4xl">BREAKOUT</span>
                        </h2>
                    </div>

                    <div className="flex items-center gap-4 bg-[#FFFDF5] p-6 rounded-[30px] border-4 border-black shadow-[8px_8px_0px_#000]">
                        <div className="text-right border-r-4 border-black/10 pr-6">
                            <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.3em] mb-1">Session High</p>
                            <p className="text-4xl font-black text-[#00B894]">{highScore}</p>
                        </div>
                        <div className="flex flex-col gap-2 pl-2">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setIsPaused(!isPaused)}
                                disabled={gameOver}
                                className={`w-14 h-14 flex items-center justify-center rounded-2xl border-4 border-black transition-all ${isPaused ? 'bg-[#00B894] text-white shadow-[4px_4px_0px_#000]' : 'bg-[#FFD93D] text-black shadow-none'
                                    } disabled:opacity-50`}
                            >
                                {isPaused ? <Play size={24} fill="currentColor" /> : <Pause size={24} fill="currentColor" />}
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 180 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={resetGame}
                                className="w-14 h-14 bg-white border-4 border-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_#000] transition-all"
                            >
                                <RotateCcw size={24} />
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Score & Stats Line */}
                <div className="grid grid-cols-2 gap-4 sm:gap-8 mb-12 relative z-10">
                    <div className="bg-[#6C5CE7] border-4 border-black p-6 sm:p-10 rounded-[30px] shadow-[8px_8px_0px_#000] text-white">
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] mb-4 opacity-60">SCORE</p>
                        <span className="text-5xl sm:text-7xl font-black leading-none tracking-tighter">{score}</span>
                    </div>
                    <div className="bg-[#FFFDF5] border-4 border-black p-6 sm:p-10 rounded-[30px] shadow-[8px_8px_0px_#000]">
                        <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.5em] mb-4">VELOCITY</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl sm:text-7xl font-black text-black tracking-tighter">{ballSpeed.toFixed(1)}</span>
                            <span className="text-xl font-black text-[#6C5CE7]">X</span>
                        </div>
                    </div>
                </div>

                {/* Game Container */}
                <div className="relative flex justify-center group overflow-hidden rounded-[40px] border-4 border-black shadow-[12px_12px_0px_#000] bg-black">
                    <canvas
                        ref={canvasRef}
                        width={600}
                        height={600}
                        className="bg-gradient-to-b from-[#1a1a2e] to-[#16213e] cursor-crosshair touch-action-none w-full max-w-[600px] aspect-square"
                    />

                    {/* Result Overlay */}
                    <AnimatePresence>
                        {(gameOver || (isPaused && score === 0)) && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-20 flex items-center justify-center p-4 sm:p-8 text-center bg-black/70 backdrop-blur-md"
                            >
                                <motion.div
                                    initial={{ scale: 0.8, rotate: -2 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    className="bg-white border-8 border-black p-6 sm:p-10 rounded-[50px] shadow-[24px_24px_0px_#000] w-full max-w-sm"
                                >
                                    {gameOver ? (
                                        <>
                                            <div className={`w-28 h-28 mx-auto mb-8 flex items-center justify-center rounded-[35px] border-4 border-black shadow-[8px_8px_0px_#000] rotate-3 ${gameStateRef.current.bricks.length === 0 ? 'bg-[#00B894]' : 'bg-[#FF7675]'}`}>
                                                <Trophy size={56} className="text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,0.5)]" />
                                            </div>
                                            <h3 className="text-4xl font-black text-black uppercase mb-2 tracking-tighter">
                                                {gameStateRef.current.bricks.length === 0 ? 'VICTORY' : 'DEFEATED'}
                                            </h3>
                                            <p className="font-black text-black/40 mb-10 uppercase tracking-[0.3em] text-xs">
                                                Final Score: {score}
                                            </p>

                                            {message && (
                                                <div className="mb-10 px-6 py-8 bg-[#FFFDF5] border-4 border-black border-dashed rounded-[30px] relative">
                                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-1 rounded-full text-[10px] font-black uppercase">Transmission</div>
                                                    <p className={`font-black uppercase tracking-widest text-xs mb-3 ${alreadyPlayed ? 'text-black/30' : 'text-[#6C5CE7]'}`}>
                                                        {message}
                                                    </p>
                                                    {points !== null && !alreadyPlayed && (
                                                        <div className="text-6xl font-black text-[#00B894] tracking-tighter">+{points}</div>
                                                    )}
                                                </div>
                                            )}

                                            {showScratcher && scratcherDrops && !alreadyPlayed && (
                                                <div className="mb-8 scale-90">
                                                    <Scratcher drops={scratcherDrops} onScratch={() => { }} />
                                                </div>
                                            )}

                                            <motion.button
                                                whileHover={{ scale: 1.05, y: -4 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={resetGame}
                                                className="w-full py-6 bg-[#6C5CE7] text-white font-black uppercase tracking-[0.2em] rounded-2xl border-4 border-black shadow-[8px_8px_0px_#000] text-2xl"
                                            >
                                                Restart
                                            </motion.button>
                                        </>
                                    ) : (
                                        <>
                                            <motion.div
                                                animate={{ y: [0, -10, 0] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="w-28 h-28 mx-auto mb-8 bg-[#FFD93D] flex items-center justify-center rounded-[35px] border-4 border-black shadow-[8px_8px_0px_#000] -rotate-3"
                                            >
                                                <Play size={56} className="text-black ml-2" fill="currentColor" />
                                            </motion.div>
                                            <h3 className="text-4xl font-black text-black uppercase mb-8 tracking-tighter leading-none">MISSION:<br />BREAKOUT</h3>
                                            <motion.button
                                                whileHover={{ scale: 1.05, y: -4 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setIsPaused(false)}
                                                className="w-full py-6 bg-[#00B894] border-4 border-black text-black font-black uppercase tracking-[0.2em] rounded-2xl shadow-[8px_8px_0px_#000] text-2xl"
                                            >
                                                ENGAGE
                                            </motion.button>
                                        </>
                                    )}
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Tip */}
                <div className="mt-12 flex justify-center">
                    <div className="bg-black/5 px-6 py-3 rounded-xl flex items-center gap-3">
                        <span className="text-[10px] font-black text-black/30 uppercase tracking-[0.3em]">System Status:</span>
                        <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-[#00B894] animate-pulse" />
                            <div className="w-2 h-2 rounded-full bg-[#00B894] opacity-50" />
                            <div className="w-2 h-2 rounded-full bg-[#00B894] opacity-20" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
