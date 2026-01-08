'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Trophy, RotateCcw, Play, Pause, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { awardGamePoints } from '@/lib/gameApi';
import Scratcher from '../gamification/Scratcher';

const SNAKE_GAME_ID = 'snake';

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE: Position[] = [
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
];

export default function SnakeGame() {
    const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
    const [food, setFood] = useState<Position>({ x: 15, y: 15 });
    const [direction, setDirection] = useState<Direction>('UP');
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [isPaused, setIsPaused] = useState(true);
    const [speed, setSpeed] = useState(150);
    const [isGameOfDay, setIsGameOfDay] = useState(false);
    const [alreadyPlayed, setAlreadyPlayed] = useState(false);
    const [points, setPoints] = useState<number | null>(null);
    const [message, setMessage] = useState('');
    const [showScratcher, setShowScratcher] = useState(false);
    const [scratcherDrops, setScratcherDrops] = useState<{ prob: number, points: number }[] | null>(null);
    const [showRules, setShowRules] = useState(false);

    // Fetch game settings and status
    useEffect(() => {
        fetch('/api/games/game-of-the-day')
            .then(r => r.json())
            .then(d => { if (d.gameId === SNAKE_GAME_ID) setIsGameOfDay(true); });

        fetch('/api/games/settings')
            .then(r => r.json())
            .then(d => {
                const cfg = d.settings?.[SNAKE_GAME_ID];
                if (cfg?.scratcher?.enabled) setScratcherDrops(cfg.scratcher.drops || null);
            });
    }, []);

    // Award points logic
    const awardPoints = async (finalScore: number) => {
        if (finalScore < 50) {
            setMessage(`Score at least 50 points to earn JP!`);
            return;
        }

        setMessage('Awarding points...');
        const result = await awardGamePoints({
            gameId: SNAKE_GAME_ID,
            points: Math.floor(finalScore / 10), // Example: 1 JP per 10 points
            retry: 0
        });

        if (result.success) {
            setPoints(result.awardedPoints || 0);
            setMessage(result.message || `You earned ${result.awardedPoints} points!`);
            if (scratcherDrops) setShowScratcher(true);
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        } else if (result.error === 'Already played today') {
            setAlreadyPlayed(true);
            setMessage(result.message || 'You already played today!');
        } else {
            setMessage(result.error || 'Error awarding points');
        }
    };

    // Generate random food position
    const generateFood = useCallback((currentSnake: Position[]): Position => {
        let newFood: Position;
        do {
            newFood = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE),
            };
        } while (
            currentSnake.some((segment) => segment.x === newFood.x && segment.y === newFood.y)
        );
        return newFood;
    }, []);

    // Reset game
    const resetGame = () => {
        setSnake(INITIAL_SNAKE);
        setFood(generateFood(INITIAL_SNAKE));
        setDirection('UP');
        setGameOver(false);
        setScore(0);
        setIsPaused(true);
        setSpeed(150);
        setPoints(null);
        setMessage('');
        setShowScratcher(false);
    };

    // Handle keyboard input
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (gameOver) return;

            // Prevent default scrolling behavior for arrow keys and space
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }

            if (e.key === ' ') {
                setIsPaused((prev) => !prev);
                return;
            }

            if (isPaused) {
                setIsPaused(false);
            }

            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    if (direction !== 'DOWN') setDirection('UP');
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    if (direction !== 'UP') setDirection('DOWN');
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    if (direction !== 'RIGHT') setDirection('LEFT');
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    if (direction !== 'LEFT') setDirection('RIGHT');
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [direction, gameOver, isPaused]);

    // Game loop
    useEffect(() => {
        if (gameOver || isPaused) return;

        const gameLoop = setInterval(() => {
            setSnake((prevSnake) => {
                const head = prevSnake[0];
                let newHead: Position;

                switch (direction) {
                    case 'UP':
                        newHead = { x: head.x, y: head.y - 1 };
                        break;
                    case 'DOWN':
                        newHead = { x: head.x, y: head.y + 1 };
                        break;
                    case 'LEFT':
                        newHead = { x: head.x - 1, y: head.y };
                        break;
                    case 'RIGHT':
                        newHead = { x: head.x + 1, y: head.y };
                        break;
                }

                // Check wall collision
                if (
                    newHead.x < 0 ||
                    newHead.x >= GRID_SIZE ||
                    newHead.y < 0 ||
                    newHead.y >= GRID_SIZE
                ) {
                    setGameOver(true);
                    if (score > highScore) setHighScore(score);
                    awardPoints(score);
                    return prevSnake;
                }

                // Check self collision
                if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
                    setGameOver(true);
                    if (score > highScore) setHighScore(score);
                    awardPoints(score);
                    return prevSnake;
                }

                const newSnake = [newHead, ...prevSnake];

                // Check food collision
                if (newHead.x === food.x && newHead.y === food.y) {
                    setScore((prev) => prev + 10);
                    setFood(generateFood(newSnake));
                    // Increase speed slightly
                    setSpeed((prev) => Math.max(50, prev - 2));
                } else {
                    newSnake.pop();
                }

                return newSnake;
            });
        }, speed);

        return () => clearInterval(gameLoop);
    }, [direction, food, gameOver, isPaused, speed, score, highScore, generateFood]);

    return (
        <div className="max-w-2xl mx-auto py-8">
            {/* Rules Modal */}
            {showRules && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowRules(false)}>
                    <div className="bg-white border-4 border-black rounded-[20px] p-6 sm:p-8 max-w-2xl max-h-[80vh] overflow-y-auto neo-shadow" onClick={e => e.stopPropagation()}>
                        <h2 className="text-2xl sm:text-3xl font-black mb-6 uppercase">🐍 How to Play Snake</h2>

                        <div className="space-y-4 text-left">
                            <div>
                                <h3 className="font-black text-lg mb-2 text-[#6C5CE7]">🎯 Objective</h3>
                                <p className="text-black/80">Eat as much food as possible without hitting the walls or yourself!</p>
                            </div>

                            <div>
                                <h3 className="font-black text-lg mb-2 text-[#6C5CE7]">🎮 Controls</h3>
                                <ul className="space-y-2 text-black/80">
                                    <li>• <strong>Arrows / WASD</strong>: Change direction</li>
                                    <li>• <strong>Space</strong>: Pause/Resume game</li>
                                    <li>• <strong>Mobile</strong>: Use buttons below the board</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-black text-lg mb-2 text-[#00B894]">🏆 Scoring</h3>
                                <ul className="space-y-1 text-black/80">
                                    <li>• Food: +10 points each</li>
                                    <li>• Score <strong>50+ points</strong> to earn JP!</li>
                                    <li>• Game of the Day: 2x points!</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-black text-lg mb-2 text-[#FFD93D]">💡 Tips</h3>
                                <ul className="space-y-1 text-black/80">
                                    <li>• The snake speeds up as you eat!</li>
                                    <li>• Don't make 180-degree turns!</li>
                                    <li>• Plan your route to avoid getting trapped</li>
                                </ul>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowRules(false)}
                            className="mt-6 w-full px-6 py-3 bg-[#6C5CE7] text-white rounded-xl border-2 border-black font-black uppercase hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_#000] transition-all"
                        >
                            Got It!
                        </button>
                    </div>
                </div>
            )}

            {/* Game of the Day Badge */}
            {isGameOfDay && (
                <div className="mb-6 flex justify-center">
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFD93D] text-black rounded-full font-black tracking-widest text-sm border-2 border-black shadow-[4px_4px_0px_#000]">
                        <Star size={16} className="fill-black" /> GAME OF THE DAY - 2X POINTS!
                    </div>
                </div>
            )}

            <div className="bg-white border-2 border-black p-8 rounded-[25px] neo-shadow">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <button
                            onClick={() => setShowRules(true)}
                            className="mb-3 px-4 py-2 bg-[#FFD93D] text-black rounded-xl border-2 border-black font-black uppercase text-xs hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_#000] transition-all"
                        >
                            🐍 How to Play
                        </button>
                        <h2 className="text-4xl font-black text-black uppercase tracking-tighter">SNAKE</h2>
                    </div>
                    <div className="text-right">
                        <div className="text-xs font-black text-black/40 uppercase tracking-widest">High Score</div>
                        <div className="text-2xl font-black text-[#00B894]">{highScore}</div>
                    </div>
                </div>

                {/* Score Board */}
                <div className="flex justify-between items-center mb-8 bg-[#FFFDF5] p-4 rounded-xl border-2 border-black shadow-sm">
                    <div className="text-center flex-1 border-r-2 border-black/10">
                        <div className="text-xs font-black text-black/40 uppercase tracking-widest mb-1">Score</div>
                        <div className="text-3xl font-black text-black">{score}</div>
                    </div>
                    <div className="px-6">
                        <button
                            onClick={() => setIsPaused(!isPaused)}
                            disabled={gameOver}
                            className={`w-12 h-12 flex items-center justify-center rounded-full border-2 border-black transition-all ${isPaused ? 'bg-[#00B894] text-white' : 'bg-[#FFD93D] text-black'
                                } hover:scale-110 active:scale-95 disabled:opacity-50`}
                        >
                            {isPaused ? <Play size={20} fill="currentColor" /> : <Pause size={20} fill="currentColor" />}
                        </button>
                    </div>
                    <div className="text-center flex-1 border-l-2 border-black/10">
                        <div className="text-xs font-black text-black/40 uppercase tracking-widest mb-1">Speed</div>
                        <div className="text-xl font-black text-black">{Math.floor(200 - speed)}</div>
                    </div>
                </div>

                {/* Game Board */}
                <div className="flex flex-col items-center">
                    <div
                        className="relative bg-[#f0fdf4] border-4 border-black rounded-2xl overflow-hidden shadow-[8px_8px_0px_rgba(0,0,0,1)]"
                        style={{
                            width: GRID_SIZE * CELL_SIZE,
                            height: GRID_SIZE * CELL_SIZE,
                            backgroundImage: 'linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)',
                            backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`
                        }}
                    >
                        {/* Snake */}
                        {snake.map((segment, index) => (
                            <div
                                key={index}
                                className="absolute border-black"
                                style={{
                                    left: segment.x * CELL_SIZE,
                                    top: segment.y * CELL_SIZE,
                                    width: CELL_SIZE,
                                    height: CELL_SIZE,
                                    background: index === 0
                                        ? '#2D3436'
                                        : '#22c55e',
                                    borderRadius: index === 0 ? '4px' : '2px',
                                    border: '1px solid rgba(0,0,0,0.1)',
                                    zIndex: index === 0 ? 2 : 1
                                }}
                            />
                        ))}

                        {/* Food */}
                        <div
                            className="absolute bg-[#FF7675] rounded-full border-2 border-black animate-pulse"
                            style={{
                                left: food.x * CELL_SIZE,
                                top: food.y * CELL_SIZE,
                                width: CELL_SIZE,
                                height: CELL_SIZE,
                            }}
                        />

                        {/* Game Over / Pause Overlay */}
                        {(gameOver || (isPaused && score === 0)) && (
                            <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-md flex items-center justify-center p-6 text-center">
                                <div className="bg-white border-8 border-black p-8 rounded-[40px] shadow-[16px_16px_0px_rgba(0,0,0,1)] w-full max-w-sm animate-in zoom-in duration-300">
                                    {gameOver ? (
                                        <>
                                            <div className={`w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-2xl border-4 border-black ${score >= 50 ? 'bg-[#00B894]' : 'bg-[#FF7675]'}`}>
                                                <Trophy size={40} className="text-white" />
                                            </div>
                                            <h3 className="text-3xl font-black text-black uppercase mb-1">
                                                {score >= 50 ? 'VICTORY!' : 'GAME OVER'}
                                            </h3>
                                            <p className="font-bold text-black/60 mb-6 uppercase tracking-widest text-sm">
                                                Final Score: {score}
                                            </p>

                                            {message && (
                                                <div className="mb-6 p-4 bg-[#FFFDF5] border-4 border-black border-dashed rounded-2xl">
                                                    <p className={`font-black uppercase tracking-widest text-xs mb-2 ${alreadyPlayed ? 'text-black/50' : 'text-[#00B894]'}`}>
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
                                                className="w-full py-5 bg-[#2D3436] text-white font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-all text-lg"
                                            >
                                                Try Again
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-20 h-20 mx-auto mb-6 bg-[#FFD93D] flex items-center justify-center rounded-2xl border-4 border-black">
                                                <Play size={40} className="text-black" fill="currentColor" />
                                            </div>
                                            <h3 className="text-3xl font-black text-black uppercase mb-4 tracking-tighter">READY?</h3>
                                            <button
                                                onClick={() => setIsPaused(false)}
                                                className="w-full py-5 bg-[#00B894] border-4 border-black text-black font-black uppercase tracking-widest rounded-2xl hover:translate-y-[-4px] hover:shadow-[6px_6px_0px_#000] transition-all"
                                            >
                                                Start Game
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Mobile Controls */}
                    <div className="grid grid-cols-3 gap-3 mt-12 w-full max-w-[240px]">
                        <div />
                        <button
                            onPointerDown={() => !gameOver && direction !== 'DOWN' && setDirection('UP')}
                            className="h-16 bg-white border-2 border-black rounded-2xl flex items-center justify-center hover:bg-[#FFFDF5] active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_#000] transition-all"
                        >
                            <ArrowUp size={24} />
                        </button>
                        <div />
                        <button
                            onPointerDown={() => !gameOver && direction !== 'RIGHT' && setDirection('LEFT')}
                            className="h-16 bg-white border-2 border-black rounded-2xl flex items-center justify-center hover:bg-[#FFFDF5] active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_#000] transition-all"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <button
                            onPointerDown={() => !gameOver && direction !== 'UP' && setDirection('DOWN')}
                            className="h-16 bg-white border-2 border-black rounded-2xl flex items-center justify-center hover:bg-[#FFFDF5] active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_#000] transition-all"
                        >
                            <ArrowDown size={24} />
                        </button>
                        <button
                            onPointerDown={() => !gameOver && direction !== 'LEFT' && setDirection('RIGHT')}
                            className="h-16 bg-white border-2 border-black rounded-2xl flex items-center justify-center hover:bg-[#FFFDF5] active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_#000] transition-all"
                        >
                            <ArrowRight size={24} />
                        </button>
                    </div>

                    {/* Desktop Hint */}
                    <p className="mt-8 text-black/30 font-black text-[10px] uppercase tracking-[0.2em] hidden md:block">
                        WASD or Arrow Keys to move • Space to Pause
                    </p>
                </div>
            </div>
        </div>
    );
}
