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
            origin: { y: 0.6 },
            colors: ['#FF8C00', '#FFD400', '#FFFFFF']
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
        <div className="flex flex-col items-center gap-8 arcade-card-3d p-8 bg-black">
            {/* HUD */}
            <div className="flex items-center gap-8 text-white font-arcade text-xs tracking-widest bg-[#1A1A1A] px-6 py-2 border border-[#333]">
                <div className="flex items-center gap-2">
                    <Clock size={16} className="text-[#FF8C00]" />
                    <span>TIMER: {formatTime(timer)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <AlertCircle size={16} className={mistakes > 2 ? 'text-red-500' : 'text-gray-500'} />
                    <span className={mistakes > 2 ? 'text-red-500' : ''}>ERRORS: {mistakes}/3</span>
                </div>
            </div>

            {/* WIN STATE */}
            {isWon && (
                <div className="animate-in zoom-in duration-300 bg-[#FFD400]/10 border-2 border-[#FFD400] p-8 text-center shadow-[0_0_20px_rgba(255,212,0,0.3)]">
                    <Trophy className="w-12 h-12 text-[#FFD400] mx-auto mb-4" />
                    <h2 className="text-2xl font-arcade text-white mb-2 uppercase text-3d-yellow">System Solved!</h2>
                    <p className="text-[#FFD400] font-arcade tracking-widest text-xs">+{REWARDS.SUDOKU.EASY} TOKENS CREDITED</p>
                </div>
            )}

            {/* GRID */}
            <div className="grid grid-cols-9 border-4 border-[#333] bg-black shadow-[8px_8px_0px_#111] p-1 relative">
                {/* Scanline overlay for grid */}
                <div className="absolute inset-0 pointer-events-none scanlines opacity-50 z-10"></div>

                {board.map((row, rIndex) => (
                    row.map((cell, cIndex) => {
                        const isInitial = INITIAL_BOARD[rIndex][cIndex] !== 0;
                        const isError = cell !== 0 && cell !== SOLUTION[rIndex][cIndex];

                        // Borders for 3x3 subgrids
                        const borderRight = (cIndex + 1) % 3 === 0 && cIndex !== 8 ? 'border-r-2 border-[#FF8C00]/50' : 'border-r border-[#333]';
                        const borderBottom = (rIndex + 1) % 3 === 0 && rIndex !== 8 ? 'border-b-2 border-[#FF8C00]/50' : 'border-b border-[#333]';

                        return (
                            <input
                                key={`${rIndex}-${cIndex}`}
                                type="text"
                                maxLength={1}
                                value={cell === 0 ? '' : cell}
                                onChange={(e) => handleCellChange(rIndex, cIndex, e.target.value)}
                                disabled={isInitial || isWon || !isActive}
                                className={`
                                    w-8 h-8 md:w-12 md:h-12 text-center text-lg md:text-xl font-arcade z-20 relative
                                    ${isInitial ? 'text-[#FFD400] bg-[#111] cursor-not-allowed' : 'bg-black text-white focus:bg-[#FF8C00]/20'}
                                    ${isError ? 'text-red-500 bg-red-900/20' : ''}
                                    ${borderRight} ${borderBottom}
                                    focus:outline-none transition-colors
                                `}
                            />
                        );
                    })
                ))}
            </div>

            {!isActive && !isWon && (
                <button
                    onClick={handleStart}
                    className="px-8 py-3 bg-[#FF8C00] text-black font-arcade text-sm border-b-4 border-[#A0522D] active:border-b-0 active:translate-y-1 hover:bg-white transition-all uppercase"
                >
                    INITIALIZE_GRID
                </button>
            )}

            {isActive && (
                <button
                    onClick={handleStart}
                    className="text-gray-500 text-[10px] font-arcade flex items-center gap-2 hover:text-white transition-colors uppercase border border-gray-800 px-4 py-2 hover:border-[#FFD400]"
                >
                    <RefreshCcw size={12} /> REBOOT_SYSTEM
                </button>
            )}
        </div>
    );
};

export default SudokuGame;
