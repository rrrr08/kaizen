'use client';

import { useState, useEffect } from 'react';
import { Bomb, Flag, Trophy, RotateCcw, Star, X, Info } from 'lucide-react';
import confetti from 'canvas-confetti';
import { awardGamePoints } from '@/lib/gameApi';
import Scratcher from '../gamification/Scratcher';

const MINESWEEPER_GAME_ID = 'minesweeper';

type Cell = {
    isMine: boolean;
    isRevealed: boolean;
    isFlagged: boolean;
    neighborMines: number;
};

type Difficulty = 'easy' | 'medium' | 'hard';

const DIFFICULTIES = {
    easy: { rows: 8, cols: 8, mines: 10 },
    medium: { rows: 12, cols: 12, mines: 20 },
    hard: { rows: 16, cols: 16, mines: 40 },
};

export default function MinesweeperGame() {
    const [difficulty, setDifficulty] = useState<Difficulty>('easy');
    const [board, setBoard] = useState<Cell[][]>([]);
    const [gameOver, setGameOver] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const [flagsLeft, setFlagsLeft] = useState(0);
    const [timer, setTimer] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
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
            .then(d => { if (d.gameId === MINESWEEPER_GAME_ID) setIsGameOfDay(true); });

        fetch('/api/games/settings')
            .then(r => r.json())
            .then(d => {
                const cfg = d.settings?.[MINESWEEPER_GAME_ID];
                if (cfg?.scratcher?.enabled) setScratcherDrops(cfg.scratcher.drops || null);
            });
    }, []);

    useEffect(() => {
        initializeGame();
    }, [difficulty]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRunning && !gameOver && !gameWon) {
            interval = setInterval(() => {
                setTimer((prev) => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning, gameOver, gameWon]);

    const initializeGame = () => {
        const { rows, cols, mines } = DIFFICULTIES[difficulty];
        const newBoard: Cell[][] = Array(rows)
            .fill(null)
            .map(() =>
                Array(cols)
                    .fill(null)
                    .map(() => ({
                        isMine: false,
                        isRevealed: false,
                        isFlagged: false,
                        neighborMines: 0,
                    }))
            );

        // Place mines randomly
        let minesPlaced = 0;
        while (minesPlaced < mines) {
            const row = Math.floor(Math.random() * rows);
            const col = Math.floor(Math.random() * cols);
            if (!newBoard[row][col].isMine) {
                newBoard[row][col].isMine = true;
                minesPlaced++;
            }
        }

        // Calculate neighbor mines
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (!newBoard[row][col].isMine) {
                    let count = 0;
                    for (let dr = -1; dr <= 1; dr++) {
                        for (let dc = -1; dc <= 1; dc++) {
                            const newRow = row + dr;
                            const newCol = col + dc;
                            if (
                                newRow >= 0 &&
                                newRow < rows &&
                                newCol >= 0 &&
                                newCol < cols &&
                                newBoard[newRow][newCol].isMine
                            ) {
                                count++;
                            }
                        }
                    }
                    newBoard[row][col].neighborMines = count;
                }
            }
        }

        setBoard(newBoard);
        setGameOver(false);
        setGameWon(false);
        setFlagsLeft(mines);
        setTimer(0);
        setIsRunning(false);
        setPoints(null);
        setMessage('');
        setShowScratcher(false);
    };

    const handleWin = async (time: number) => {
        setGameWon(true);
        setIsRunning(false);
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        setMessage('Awarding points...');

        const result = await awardGamePoints({
            gameId: MINESWEEPER_GAME_ID,
            level: difficulty,
            points: Math.max(10, 100 - Math.floor(time / (difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3))),
            retry: 0
        });

        if (result.success) {
            setPoints(result.awardedPoints || 0);
            setMessage(result.message || `You earned ${result.awardedPoints} points!`);
            if (scratcherDrops) setShowScratcher(true);
        } else if (result.error === 'Already played today') {
            setAlreadyPlayed(true);
            setMessage(result.message || 'You already played today!');
        } else {
            setMessage(result.error || 'Error awarding points');
        }
    };

    const revealCell = (row: number, col: number) => {
        if (gameOver || gameWon || board[row][col].isRevealed || board[row][col].isFlagged) {
            return;
        }

        if (!isRunning) setIsRunning(true);

        const newBoard = [...board];

        if (newBoard[row][col].isMine) {
            // Game over - reveal all mines
            newBoard.forEach((r) =>
                r.forEach((cell) => {
                    if (cell.isMine) cell.isRevealed = true;
                })
            );
            setBoard(newBoard);
            setGameOver(true);
            setIsRunning(false);
            return;
        }

        // Reveal cell and neighbors if no mines nearby
        const reveal = (r: number, c: number) => {
            if (
                r < 0 ||
                r >= board.length ||
                c < 0 ||
                c >= board[0].length ||
                newBoard[r][c].isRevealed ||
                newBoard[r][c].isFlagged
            ) {
                return;
            }

            newBoard[r][c].isRevealed = true;

            if (newBoard[r][c].neighborMines === 0) {
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        reveal(r + dr, c + dc);
                    }
                }
            }
        };

        reveal(row, col);
        setBoard(newBoard);

        // Check for win
        const allNonMinesRevealed = newBoard.every((r) =>
            r.every((cell) => cell.isMine || cell.isRevealed)
        );
        if (allNonMinesRevealed) {
            handleWin(timer);
        }
    };

    const toggleFlag = (row: number, col: number, e: React.MouseEvent) => {
        e.preventDefault();
        if (gameOver || gameWon || board[row][col].isRevealed) return;

        if (!isRunning) setIsRunning(true);

        const newBoard = [...board];
        newBoard[row][col].isFlagged = !newBoard[row][col].isFlagged;
        setBoard(newBoard);
        setFlagsLeft((prev) => (newBoard[row][col].isFlagged ? prev - 1 : prev + 1));
    };

    const getCellColor = (cell: Cell) => {
        if (!cell.isRevealed) return '#FFFDF5';
        if (cell.isMine) return '#fee2e2';
        return '#f0fdf4';
    };

    const getNumberColor = (num: number) => {
        const colors = ['', '#3b82f6', '#22c55e', '#ef4444', '#8b5cf6', '#f59e0b', '#06b6d4', '#000', '#666'];
        return colors[num] || '#000';
    };

    return (
        <div className="max-w-4xl mx-auto py-8">
            {/* Rules Modal */}
            {showRules && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowRules(false)}>
                    <div className="bg-white border-4 border-black rounded-[20px] p-6 sm:p-8 max-w-2xl max-h-[80vh] overflow-y-auto neo-shadow" onClick={e => e.stopPropagation()}>
                        <h2 className="text-2xl sm:text-3xl font-black mb-6 uppercase tracking-tight">💣 Minesweeper Masterclass</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-black text-lg mb-2 text-[#6C5CE7]">🎯 Objective</h3>
                                    <p className="text-black/80 font-medium">Clear all safe cells without detonating any mines hidden beneath!</p>
                                </div>

                                <div>
                                    <h3 className="font-black text-lg mb-2 text-[#6C5CE7]">🎮 How to Play</h3>
                                    <ul className="space-y-2 text-black/80 font-medium">
                                        <li>• <strong>Left Click</strong>: Reveal a cell</li>
                                        <li>• <strong>Right Click</strong>: Place a flag on a suspected mine</li>
                                        <li>• <strong>Numbers</strong>: Indicate how many mines are adjacent</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-black text-lg mb-2 text-[#00B894]">🏆 Scoring</h3>
                                    <ul className="space-y-1 text-black/80 font-medium">
                                        <li>• Clear the board to earn JP!</li>
                                        <li>• Faster clears = More points</li>
                                        <li>• Game of the Day: 2x points!</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="font-black text-lg mb-2 text-[#FFD93D]">💡 Tactics</h3>
                                    <ul className="space-y-1 text-black/80 font-medium text-sm">
                                        <li>• Start with corners or edges</li>
                                        <li>• Use flags to keep track of threats</li>
                                        <li>• Look for "1"s next to single hidden cells</li>
                                        <li>• Don't guess if you don't have to!</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowRules(false)}
                            className="mt-8 w-full px-6 py-4 bg-[#6C5CE7] text-white rounded-xl border-4 border-black font-black uppercase tracking-widest hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] transition-all active:translate-y-[2px] active:shadow-none"
                        >
                            I'm Ready to Sweep!
                        </button>
                    </div>
                </div>
            )}

            {/* Game of the Day Badge */}
            {isGameOfDay && (
                <div className="mb-8 flex justify-center">
                    <div className="inline-flex items-center gap-2 px-8 py-4 bg-[#FFD93D] text-black rounded-full font-black tracking-[0.2em] text-sm border-4 border-black shadow-[6px_6px_0px_#000]">
                        <Star size={20} className="fill-black" /> GAME OF THE DAY active
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
                            <Info size={14} /> Guide
                        </button>
                        <h2 className="text-5xl font-black text-black uppercase tracking-tighter block">
                            MINESWEEPER
                        </h2>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3">
                        {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
                            <button
                                key={diff}
                                onClick={() => setDifficulty(diff)}
                                className={`px-6 py-3 border-4 border-black rounded-xl font-black uppercase text-sm tracking-widest transition-all ${difficulty === diff
                                    ? 'bg-[#2D3436] text-white shadow-none'
                                    : 'bg-white text-black hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_#000]'
                                    }`}
                            >
                                {diff}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
                    <div className="bg-[#FFFDF5] p-6 rounded-2xl border-4 border-black flex flex-col items-center justify-center shadow-sm">
                        <div className="text-xs font-black text-black/40 uppercase tracking-[0.3em] mb-2">Flags Left</div>
                        <div className="flex items-center gap-3">
                            <Flag size={24} className="text-[#FF7675] fill-current" />
                            <span className="text-4xl font-black text-black leading-none">{flagsLeft}</span>
                        </div>
                    </div>

                    <div className="bg-[#FFFDF5] p-6 rounded-2xl border-4 border-black flex flex-col items-center justify-center shadow-sm">
                        <div className="text-xs font-black text-black/40 uppercase tracking-[0.3em] mb-2">Time</div>
                        <div className="flex items-center gap-3">
                            <span className="text-2xl font-black">⏱️</span>
                            <span className="text-4xl font-black text-black leading-none">{timer}s</span>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <button
                            onClick={initializeGame}
                            className="w-full h-full py-6 bg-[#6C5CE7] border-4 border-black text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-[6px_6px_0px_#000] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_#000] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-3"
                        >
                            <RotateCcw size={20} /> Reset
                        </button>
                    </div>
                </div>

                {/* Result Overlay Container */}
                <div className="relative inline-block w-full overflow-x-auto no-scrollbar py-4" style={{ textAlign: 'center' }}>
                    <div
                        className="inline-grid border-4 border-black rounded-2xl overflow-hidden bg-[#2D3436] p-4 shadow-[8px_8px_0px_rgba(0,0,0,1)]"
                        style={{
                            gridTemplateColumns: `repeat(${DIFFICULTIES[difficulty].cols}, 45px)`,
                            gap: '4px'
                        }}
                    >
                        {board.map((row, rowIndex) =>
                            row.map((cell, colIndex) => (
                                <button
                                    key={`${rowIndex}-${colIndex}`}
                                    onClick={() => revealCell(rowIndex, colIndex)}
                                    onContextMenu={(e) => toggleFlag(rowIndex, colIndex, e)}
                                    className={`w-[45px] h-[45px] flex items-center justify-center text-xl font-black rounded-lg transition-all border-b-4 border-black/20 ${cell.isRevealed
                                        ? 'bg-[#f0fdf4] border-none shadow-inner'
                                        : 'bg-white hover:bg-[#FFFDF5] border-black/20'
                                        } ${(gameOver || gameWon) ? 'cursor-default' : 'active:scale-95'}`}
                                >
                                    {cell.isFlagged ? (
                                        <Flag size={20} className="text-[#FF7675] fill-current" />
                                    ) : cell.isRevealed ? (
                                        cell.isMine ? (
                                            <Bomb size={24} className="text-[#FF7675]" />
                                        ) : cell.neighborMines > 0 ? (
                                            <span style={{ color: getNumberColor(cell.neighborMines) }}>
                                                {cell.neighborMines}
                                            </span>
                                        ) : null
                                    ) : null}
                                </button>
                            ))
                        )}
                    </div>

                    {/* Win/Loss Modal */}
                    {(gameOver || gameWon) && (
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-20 px-8 flex justify-center pointer-events-none">
                            <div className="bg-white border-8 border-black p-8 rounded-[40px] shadow-[16px_16px_0px_rgba(0,0,0,1)] w-full max-w-sm pointer-events-auto animate-in zoom-in duration-300">
                                <div className={`w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-2xl border-4 border-black ${gameWon ? 'bg-[#00B894]' : 'bg-[#FF7675]'}`}>
                                    {gameWon ? <Trophy size={40} className="text-white" /> : <Bomb size={40} className="text-white" />}
                                </div>
                                <h3 className="text-3xl font-black text-black uppercase mb-1">
                                    {gameWon ? 'VICTORY!' : 'BOOM!'}
                                </h3>
                                <p className="font-bold text-black/60 mb-6 uppercase tracking-widest text-sm">
                                    {gameWon ? `Cleared in ${timer}s` : 'You triggered a mine'}
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
                                    onClick={initializeGame}
                                    className="w-full py-5 bg-[#2D3436] text-white font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-all text-lg"
                                >
                                    {gameWon ? 'Again?' : 'Retry'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Keyboard Hint */}
                <p className="mt-12 text-black/20 font-black text-xs uppercase tracking-[0.4em] text-center">
                    Right-Click or Long-Press to Flag
                </p>
            </div>
        </div>
    );
}
