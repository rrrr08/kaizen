'use client';

import { useState, useEffect, useRef } from 'react';
import { Trophy, RotateCcw, Play, Pause, Star, Info } from 'lucide-react';
import confetti from 'canvas-confetti';
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

        const colors = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6'];

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

    // Mouse movement
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!canvasRef.current) return;
            const rect = canvasRef.current.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            gameStateRef.current.paddle.x = mouseX - gameStateRef.current.paddle.width / 2;

            // Keep paddle within canvas
            if (gameStateRef.current.paddle.x < 0) {
                gameStateRef.current.paddle.x = 0;
            }
            if (gameStateRef.current.paddle.x + gameStateRef.current.paddle.width > 600) {
                gameStateRef.current.paddle.x = 600 - gameStateRef.current.paddle.width;
            }
        };

        const canvas = canvasRef.current;
        if (canvas) {
            canvas.addEventListener('mousemove', handleMouseMove);
            return () => canvas.removeEventListener('mousemove', handleMouseMove);
        }
    }, []);

    // Touch movement for mobile
    useEffect(() => {
        const handleTouchMove = (e: TouchEvent) => {
            if (!canvasRef.current) return;
            e.preventDefault();
            const rect = canvasRef.current.getBoundingClientRect();
            const touchX = e.touches[0].clientX - rect.left;
            gameStateRef.current.paddle.x = touchX - gameStateRef.current.paddle.width / 2;

            if (gameStateRef.current.paddle.x < 0) {
                gameStateRef.current.paddle.x = 0;
            }
            if (gameStateRef.current.paddle.x + gameStateRef.current.paddle.width > 600) {
                gameStateRef.current.paddle.x = 600 - gameStateRef.current.paddle.width;
            }
        };

        const canvas = canvasRef.current;
        if (canvas) {
            canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
            return () => canvas.removeEventListener('touchmove', handleTouchMove);
        }
    }, []);

    // Game loop
    useEffect(() => {
        if (isPaused || gameOver) return;

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
            ctx.fillStyle = '#fbbf24';
            ctx.fill();
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.closePath();

            // Draw paddle
            ctx.beginPath();
            ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 5);
            ctx.fillStyle = '#3b82f6';
            ctx.fill();
            ctx.closePath();

            // Draw bricks
            bricks.forEach((brick) => {
                ctx.beginPath();
                ctx.roundRect(brick.x, brick.y, brick.width, brick.height, 3);
                ctx.fillStyle = brick.color;
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.closePath();
            });

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
                // Add spin based on where ball hits paddle
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
                    gameStateRef.current.score += 10;
                    setScore(gameStateRef.current.score);

                    // Increase speed slightly
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
        <div className="max-w-4xl mx-auto py-8">
            {/* Rules Modal */}
            {showRules && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowRules(false)}>
                    <div className="bg-white border-4 border-black rounded-[20px] p-6 sm:p-8 max-w-2xl max-h-[80vh] overflow-y-auto neo-shadow" onClick={e => e.stopPropagation()}>
                        <h2 className="text-2xl sm:text-3xl font-black mb-6 uppercase tracking-tight">🎯 Tango: The Breakout Battle</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-black text-lg mb-2 text-[#6C5CE7]">🎯 Objective</h3>
                                    <p className="text-black/80 font-medium">Control the paddle and bounce the ball to destroy all the colored bricks!</p>
                                </div>

                                <div>
                                    <h3 className="font-black text-lg mb-2 text-[#6C5CE7]">🎮 How to Play</h3>
                                    <ul className="space-y-2 text-black/80 font-medium">
                                        <li>• <strong>Mouse/Touch</strong>: Move paddle horizontally</li>
                                        <li>• <strong>Objective</strong>: Don't let the ball fall past the paddle!</li>
                                        <li>• <strong>Spin</strong>: Hit the ball with the edges of the paddle to change its angle</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-black text-lg mb-2 text-[#00B894]">🏆 Scoring</h3>
                                    <ul className="space-y-1 text-black/80 font-medium">
                                        <li>• Score <strong>100+ points</strong> to earn JP!</li>
                                        <li>• Higher scores = More points</li>
                                        <li>• Game of the Day: 2x points!</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="font-black text-lg mb-2 text-[#FFD93D]">💡 Pro Tips</h3>
                                    <ul className="space-y-1 text-black/80 font-medium text-sm">
                                        <li>• The ball speeds up every 100 points!</li>
                                        <li>• Try to clear a path to the top - the ball will bounce around for huge combos!</li>
                                        <li>• Keep your eye on the ball, not the bricks</li>
                                        <li>• Use the edges of the paddle for tricky shots</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowRules(false)}
                            className="mt-8 w-full px-6 py-4 bg-[#6C5CE7] text-white rounded-xl border-4 border-black font-black uppercase tracking-widest hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] transition-all active:translate-y-[2px] active:shadow-none"
                        >
                            Game On!
                        </button>
                    </div>
                </div>
            )}

            {/* Game of the Day Badge */}
            {isGameOfDay && (
                <div className="mb-8 flex justify-center">
                    <div className="inline-flex items-center gap-2 px-8 py-4 bg-[#FFD93D] text-black rounded-full font-black tracking-[0.2em] text-sm border-4 border-black shadow-[6px_6px_0px_#000]">
                        <Star size={20} className="fill-black" /> GAME OF THE DAY is live
                    </div>
                </div>
            )}

            <div className="bg-white border-4 border-black p-4 sm:p-10 rounded-[40px] shadow-[12px_12px_0px_rgba(0,0,0,1)]">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
                    <div className="text-center md:text-left">
                        <button
                            onClick={() => setShowRules(true)}
                            className="inline-flex items-center gap-2 mb-3 px-4 py-2 bg-[#6C5CE7] text-white rounded-xl border-2 border-black font-black uppercase text-xs hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_#000] transition-all"
                        >
                            <Info size={14} /> Play Guide
                        </button>
                        <h2 className="text-5xl font-black text-black uppercase tracking-tighter block leading-none">
                            TANGO
                        </h2>
                        <div className="text-black/40 font-black text-[10px] uppercase tracking-[0.3em] mt-2">Breakout Edition</div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4">
                        <div className="text-right border-r-4 border-black pr-6">
                            <div className="text-[10px] font-black text-black/40 uppercase tracking-[0.3em] mb-1">High Score</div>
                            <div className="text-3xl font-black text-[#00B894]">{highScore}</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsPaused(!isPaused)}
                                disabled={gameOver}
                                className={`w-14 h-14 flex items-center justify-center rounded-2xl border-4 border-black transition-all ${isPaused ? 'bg-[#00B894] text-white shadow-[4px_4px_0px_#000]' : 'bg-[#FFD93D] text-black shadow-none translate-x-1 translate-y-1'
                                    } hover:scale-105 active:scale-95 disabled:opacity-50 disabled:shadow-none`}
                            >
                                {isPaused ? <Play size={24} fill="currentColor" /> : <Pause size={24} fill="currentColor" />}
                            </button>
                            <button
                                onClick={resetGame}
                                className="w-14 h-14 bg-white border-4 border-black rounded-2xl flex items-center justify-center hover:bg-[#FFFDF5] active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_#000] transition-all"
                            >
                                <RotateCcw size={24} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Score & Stats Line */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                    <div className="bg-[#FFFDF5] border-4 border-black p-6 rounded-2xl flex justify-between items-center shadow-sm">
                        <span className="text-xs font-black text-black/40 uppercase tracking-[0.3em]">Current Score</span>
                        <span className="text-4xl font-black text-black">{score}</span>
                    </div>
                    <div className="bg-[#FFFDF5] border-4 border-black p-6 rounded-2xl flex justify-between items-center shadow-sm">
                        <span className="text-xs font-black text-black/40 uppercase tracking-[0.3em]">Ball Velocity</span>
                        <span className="text-2xl font-black text-[#6C5CE7]">{ballSpeed.toFixed(1)}x</span>
                    </div>
                </div>

                {/* Game Container */}
                <div className="relative flex justify-center group">
                    <div className="relative p-3 bg-black rounded-[24px] shadow-[12px_12px_0px_rgba(0,0,0,0.1)] transition-transform duration-500 group-hover:scale-[1.01]">
                        <canvas
                            ref={canvasRef}
                            width={600}
                            height={600}
                            className="bg-gradient-to-b from-[#1a1a2e] to-[#16213e] rounded-[18px] cursor-none touch-action-none border-2 border-white/5"
                        />
                    </div>

                    {/* Result Overlay */}
                    {(gameOver || (isPaused && score === 0)) && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center p-8 text-center bg-black/60 backdrop-blur-md rounded-[24px] m-3">
                            <div className="bg-white border-8 border-black p-8 rounded-[40px] shadow-[16px_16px_0px_rgba(0,0,0,1)] w-full max-w-sm animate-in zoom-in duration-300">
                                {gameOver ? (
                                    <>
                                        <div className={`w-24 h-24 mx-auto mb-6 flex items-center justify-center rounded-3xl border-4 border-black ${gameStateRef.current.bricks.length === 0 ? 'bg-[#00B894]' : 'bg-[#FF7675]'}`}>
                                            <Trophy size={48} className="text-white" />
                                        </div>
                                        <h3 className="text-3xl font-black text-black uppercase mb-2">
                                            {gameStateRef.current.bricks.length === 0 ? 'ULTIMATE WIN!' : 'GAME OVER'}
                                        </h3>
                                        <p className="font-bold text-black/60 mb-6 uppercase tracking-widest text-sm">
                                            Total Score: {score}
                                        </p>

                                        {message && (
                                            <div className="mb-6 p-5 bg-[#FFFDF5] border-4 border-black border-dashed rounded-3xl">
                                                <p className={`font-black uppercase tracking-widest text-[10px] mb-2 ${alreadyPlayed ? 'text-black/50' : 'text-[#00B894]'}`}>
                                                    {message}
                                                </p>
                                                {points !== null && !alreadyPlayed && (
                                                    <div className="text-4xl font-black text-[#00B894]">+{points} JP</div>
                                                )}
                                            </div>
                                        )}

                                        {showScratcher && scratcherDrops && !alreadyPlayed && (
                                            <div className="mb-6">
                                                <Scratcher drops={scratcherDrops} onScratch={() => { }} />
                                            </div>
                                        )}

                                        <button
                                            onClick={resetGame}
                                            className="w-full py-5 bg-[#6C5CE7] text-white font-black uppercase tracking-widest rounded-2xl border-4 border-black hover:translate-y-[-4px] hover:shadow-[6px_6px_0px_#000] active:translate-y-[2px] active:shadow-none transition-all text-xl"
                                        >
                                            Play Again
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-24 h-24 mx-auto mb-6 bg-[#FFD93D] flex items-center justify-center rounded-3xl border-4 border-black">
                                            <Play size={48} className="text-black" fill="currentColor" />
                                        </div>
                                        <h3 className="text-3xl font-black text-black uppercase mb-4 tracking-tighter">READY FOR TANGO?</h3>
                                        <button
                                            onClick={() => setIsPaused(false)}
                                            className="w-full py-5 bg-[#00B894] border-4 border-black text-black font-black uppercase tracking-[0.2em] rounded-2xl hover:translate-y-[-4px] hover:shadow-[6px_6px_0px_#000] transition-all"
                                        >
                                            BEGIN BATTLE
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
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
