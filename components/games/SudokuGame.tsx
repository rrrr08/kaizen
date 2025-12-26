'use client';

import React, { useState, useEffect } from 'react';
import { useGamification } from '@/app/context/GamificationContext';
import { REWARDS } from '@/lib/gamification';
import { Clock, RefreshCcw, Trophy, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

// Simple easy 9x9 puzzle for MVP
const INITIAL_BOARD = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9]
];

const SOLUTION = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9]
];

const SudokuGame: React.FC = () => {
    const { awardPoints, updateStreak } = useGamification();
    const [board, setBoard] = useState<number[][]>(INITIAL_BOARD.map(row => [...row]));
    const [timer, setTimer] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [isWon, setIsWon] = useState(false);
    const [mistakes, setMistakes] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive && !isWon) {
            interval = setInterval(() => {
                setTimer((prev) => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive, isWon]);

    const handleStart = () => {
        setBoard(INITIAL_BOARD.map(row => [...row]));
        setTimer(0);
        setIsActive(true);
        setIsWon(false);
        setMistakes(0);
    };

    const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
        if (!isActive || isWon) return;

        // Only allow editing if original was 0 (empty)
        if (INITIAL_BOARD[rowIndex][colIndex] !== 0) return;

        const num = parseInt(value);
        if (isNaN(num) || num < 1 || num > 9) {
            if (value === '') {
                const newBoard = [...board];
                newBoard[rowIndex] = [...newBoard[rowIndex]];
                newBoard[rowIndex][colIndex] = 0;
                setBoard(newBoard);
            }
            return;
        }

        const newBoard = [...board];
        newBoard[rowIndex] = [...newBoard[rowIndex]];
        newBoard[rowIndex][colIndex] = num;
        setBoard(newBoard);

        // Immediate validation (hard mode: check against solution)
        if (num !== SOLUTION[rowIndex][colIndex]) {
            setMistakes(m => m + 1);
        } else {
            checkWin(newBoard);
        }
    };

    const checkWin = (currentBoard: number[][]) => {
        // Check if board assumes solution
        const isComplete = currentBoard.every((row, r) =>
            row.every((cell, c) => cell === SOLUTION[r][c])
        );

        if (isComplete) {
            handleWin();
        }
    };

    const handleWin = async () => {
        setIsActive(false);
        setIsWon(true);
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
        });

        await awardPoints(REWARDS.SUDOKU.EASY, 'Sudoku Win');
        await updateStreak();
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col items-center gap-8">
            {/* HUD */}
            <div className="flex items-center gap-8 text-white/80 font-header tracking-widest text-sm">
                <div className="flex items-center gap-2">
                    <Clock size={16} className="text-amber-500" />
                    <span>{formatTime(timer)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <AlertCircle size={16} className={mistakes > 2 ? 'text-red-500' : 'text-white/40'} />
                    <span>MISTAKES: {mistakes}/3</span>
                </div>
            </div>

            {/* WIN STATE */}
            {isWon && (
                <div className="animate-in zoom-in duration-300 bg-emerald-500/20 border border-emerald-500 p-8 rounded text-center">
                    <Trophy className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">PUZZLE SOLVED!</h2>
                    <p className="text-emerald-400 font-header tracking-widest text-sm">+{REWARDS.SUDOKU.EASY} POINTS EARNED</p>
                </div>
            )}

            {/* GRID */}
            <div className="grid grid-cols-9 border-2 border-white/20 bg-black/40 shadow-2xl">
                {board.map((row, rIndex) => (
                    row.map((cell, cIndex) => {
                        const isInitial = INITIAL_BOARD[rIndex][cIndex] !== 0;
                        const isError = cell !== 0 && cell !== SOLUTION[rIndex][cIndex];

                        // Borders for 3x3 subgrids
                        const borderRight = (cIndex + 1) % 3 === 0 && cIndex !== 8 ? 'border-r-2 border-white/20' : 'border-r border-white/10';
                        const borderBottom = (rIndex + 1) % 3 === 0 && rIndex !== 8 ? 'border-b-2 border-white/20' : 'border-b border-white/10';

                        return (
                            <input
                                key={`${rIndex}-${cIndex}`}
                                type="text"
                                maxLength={1}
                                value={cell === 0 ? '' : cell}
                                onChange={(e) => handleCellChange(rIndex, cIndex, e.target.value)}
                                disabled={isInitial || isWon || !isActive}
                                className={`
                    w-8 h-8 md:w-12 md:h-12 text-center text-lg md:text-xl font-bold focus:outline-none focus:bg-amber-500/20
                    ${isInitial ? 'bg-white/5 text-white/40 cursor-not-allowed' : 'bg-transparent text-white'}
                    ${isError ? 'text-red-500 bg-red-500/10' : ''}
                    ${borderRight} ${borderBottom}
                    transition-colors
                 `}
                            />
                        );
                    })
                ))}
            </div>

            {!isActive && !isWon && (
                <button
                    onClick={handleStart}
                    className="px-8 py-3 bg-amber-500 text-black font-header tracking-widest text-sm hover:scale-105 transition-transform"
                >
                    START GAME
                </button>
            )}

            {isActive && (
                <button
                    onClick={handleStart}
                    className="text-white/40 text-xs flex items-center gap-2 hover:text-white transition-colors"
                >
                    <RefreshCcw size={12} /> RESTART
                </button>
            )}
        </div>
    );
};

export default SudokuGame;
