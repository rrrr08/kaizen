'use client';

import React, { useState, useEffect } from 'react';
import Scratcher from '../gamification/Scratcher';
import { Clock, RefreshCcw, Trophy, AlertCircle, Star } from 'lucide-react';
import { awardGamePoints, getGameHistory } from '@/lib/gameApi';
import confetti from 'canvas-confetti';

async function fetchSudokuBoard(difficulty = 'easy') {
    const res = await fetch(`/api/games/sudoku-generate?difficulty=${difficulty}`);
    const data = await res.json();
    // Convert string to 2D array
    const to2D = (str: string) => {
        const arr = [];
        for (let i = 0; i < 9; i++) {
            arr.push(str.slice(i * 9, (i + 1) * 9).split('').map(x => (x === '.' ? 0 : parseInt(x))));
        }
        return arr;
    };
    return { puzzle: to2D(data.puzzle), solution: to2D(data.solution) };
}

const SUDOKU_GAME_ID = 'sudoku';

const LEVELS = [
    { label: 'Easy', value: 'easy' },
    { label: 'Medium', value: 'medium' },
    { label: 'Hard', value: 'hard' }
];

const SudokuGame: React.FC = () => {
    const [level, setLevel] = useState('medium');
    const [puzzle, setPuzzle] = useState<number[][]>([]);
    const [solution, setSolution] = useState<number[][]>([]);
    const [board, setBoard] = useState<number[][]>([]);
    const [timer, setTimer] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [isWon, setIsWon] = useState(false);
    const [mistakes, setMistakes] = useState(0);
    const [showScratcher, setShowScratcher] = useState(false);
    const [scratcherDrops, setScratcherDrops] = useState<{ prob: number, points: number }[] | null>(null);
    const [bonusPoints, setBonusPoints] = useState<number | null>(null);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [retry, setRetry] = useState(0);
    const [points, setPoints] = useState<number | null>(null);
    const [message, setMessage] = useState('');
    const [isGameOfDay, setIsGameOfDay] = useState(false);
    const [alreadyPlayed, setAlreadyPlayed] = useState(false);

    // Always generate new puzzle on mount or level change
    useEffect(() => {
        fetchSudokuBoard(level).then(({ puzzle, solution }) => {
            setPuzzle(puzzle);
            setSolution(solution);
            setBoard(puzzle.map(row => [...row]));
            setTimer(0);
            setIsActive(true);
            setIsWon(false);
            setMistakes(0);
            setPoints(null);
            setMessage('');
            setRetry(0);
            setShowScratcher(false);
            setBonusPoints(null);
            setAlreadyPlayed(false);
        });

        // Fetch leaderboard and history
        fetch(`/api/games/leaderboard?gameId=${SUDOKU_GAME_ID}&limit=10`)
            .then(r => r.json())
            .then(d => setLeaderboard(d.leaderboard || []))
            .catch(console.error);

        // Fetch history with Firebase Auth token
        (async () => {
            try {
                const { getAuth } = await import('firebase/auth');
                const { app } = await import('@/lib/firebase');
                const auth = getAuth(app);
                const user = auth.currentUser;

                if (user) {
                    const token = await user.getIdToken();
                    const response = await fetch(`/api/games/history?gameId=${SUDOKU_GAME_ID}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    const data = await response.json();
                    setHistory(data.history || []);
                }
            } catch (error) {
                console.error('Error fetching history:', error);
            }
        })();

        // Fetch scratcher config
        fetch('/api/games/settings')
            .then(r => r.json())
            .then(d => {
                const cfg = d.settings?.[SUDOKU_GAME_ID];
                if (cfg?.scratcher?.enabled) setScratcherDrops(cfg.scratcher.drops || null);
                else setScratcherDrops(null);
            })
            .catch(console.error);

        // Check if Game of the Day
        fetch('/api/games/game-of-the-day')
            .then(r => r.json())
            .then(d => {
                if (d.gameId === SUDOKU_GAME_ID) setIsGameOfDay(true);
            })
            .catch(console.error);
    }, [level]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive && !isWon) {
            interval = setInterval(() => {
                setTimer((prev) => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive, isWon]);

    const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
        if (!isActive || isWon || alreadyPlayed) return;
        if (puzzle[rowIndex][colIndex] !== 0) return;
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
    };

    const checkWin = (currentBoard: number[][]) => {
        const isComplete = currentBoard.every((row, r) =>
            row.every((cell, c) => cell === solution[r][c])
        );
        return isComplete;
    };

    const handleWin = async () => {
        setIsActive(false);
        setIsWon(true);
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        setMessage('Awarding points...');

        try {
            const result = await awardGamePoints({
                gameId: SUDOKU_GAME_ID,
                retry,
                level,
                points: Math.max(10 - timer * 0.1, 1) // Logic approximation, but server handles points usually
            });

            if (result.success) {
                setPoints(result.awardedPoints || 0);
                setMessage(result.message || `You received ${result.awardedPoints} points!`);
                if (scratcherDrops) setShowScratcher(true);
            } else if (result.error === 'Already played today') {
                setAlreadyPlayed(true);
                setMessage(result.message || 'You already played today. Come back tomorrow!');
            } else {
                setMessage(result.error || 'Error awarding points');
            }
        } catch (e) {
            setMessage('Error awarding points');
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col items-center gap-8 w-full">
            {/* Game of the Day Badge */}
            {isGameOfDay && (
                <div className="mb-2">
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFD93D] text-black rounded-full font-black tracking-widest text-sm border-2 border-black shadow-[4px_4px_0px_#000]">
                        <Star size={16} className="fill-black" /> GAME OF THE DAY - 2X POINTS!
                    </div>
                </div>
            )}

            <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN: Controls & HUD */}
                <div className="space-y-6">
                    <div className="bg-white border-2 border-black p-6 rounded-[20px] neo-shadow">
                        <label className="font-black text-black text-xs uppercase tracking-widest block mb-2">Difficulty</label>
                        <div className="relative">
                            <select
                                value={level}
                                onChange={e => setLevel(e.target.value)}
                                className="w-full bg-[#FFFDF5] border-2 border-black rounded-xl px-4 py-3 text-black font-bold uppercase focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-all appearance-none cursor-pointer"
                                disabled={!isActive || isWon}
                            >
                                {LEVELS.map(l => (
                                    <option key={l.value} value={l.value}>{l.label}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border-2 border-black p-6 rounded-[20px] neo-shadow space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="font-black text-xs uppercase tracking-widest text-black/50">TIME</span>
                            <div className="flex items-center gap-2 font-black text-xl text-black">
                                <Clock size={20} className="text-black" />
                                {formatTime(timer)}
                            </div>
                        </div>
                        <div className="w-full h-0.5 bg-black/10"></div>
                        <div className="flex items-center justify-between">
                            <span className="font-black text-xs uppercase tracking-widest text-black/50">MISTAKES</span>
                            <div className="flex items-center gap-2 font-black text-xl text-[#FF7675]">
                                <AlertCircle size={20} />
                                {mistakes}
                            </div>
                        </div>
                        {retry > 0 && (
                            <>
                                <div className="w-full h-0.5 bg-black/10"></div>
                                <div className="flex items-center justify-between">
                                    <span className="font-black text-xs uppercase tracking-widest text-black/50">RETRIES</span>
                                    <div className="font-black text-xl text-black">{retry}</div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* MIDDLE COLUMN: Grid */}
                <div className="flex flex-col items-center">
                    {/* WIN STATE */}
                    {isWon && (
                        <div className="w-full mb-6 animate-in zoom-in duration-300 bg-[#FFFDF5] border-2 border-black shadow-[4px_4px_0px_#000] p-8 rounded-[20px] text-center">
                            <Trophy className="w-12 h-12 text-[#FFD93D] mx-auto mb-4 drop-shadow-[2px_2px_0px_#000]" />
                            <h2 className="text-2xl font-black text-black uppercase mb-1">PUZZLE SOLVED!</h2>
                            <p className={`font-bold text-sm ${alreadyPlayed ? 'text-black/50' : 'text-[#00B894]'}`}>
                                {message}
                            </p>
                            {points !== null && !alreadyPlayed && (
                                <div className="mt-4 text-4xl font-black text-[#00B894]">
                                    +{points} POINTS
                                </div>
                            )}
                            {showScratcher && scratcherDrops && !alreadyPlayed && (
                                <div className="mt-6">
                                    <Scratcher drops={scratcherDrops} onScratch={setBonusPoints} />
                                </div>
                            )}
                        </div>
                    )}

                    {/* GRID */}
                    <div className="grid grid-cols-9 border-2 border-black bg-black neo-shadow rounded-lg overflow-hidden">
                        {board.map((row, rIndex) => (
                            row.map((cell, cIndex) => {
                                const isInitial = puzzle[rIndex][cIndex] !== 0;
                                const borderRight = (cIndex + 1) % 3 === 0 && cIndex !== 8 ? 'border-r-2 border-black' : 'border-r border-black/20';
                                const borderBottom = (rIndex + 1) % 3 === 0 && rIndex !== 8 ? 'border-b-2 border-black' : 'border-b border-black/20';
                                return (
                                    <input
                                        key={`${rIndex}-${cIndex}`}
                                        type="text"
                                        maxLength={1}
                                        value={cell === 0 ? '' : cell}
                                        onChange={(e) => handleCellChange(rIndex, cIndex, e.target.value)}
                                        disabled={isInitial || isWon || !isActive || alreadyPlayed}
                                        className={`
                                            w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-center text-lg md:text-xl font-bold focus:outline-none
                                            ${isInitial ? 'bg-[#FFFDF5] text-black font-black' : 'bg-white text-[#6C5CE7] font-bold'}
                                            ${!isInitial && !isWon && isActive ? 'hover:bg-[#F0F0F0] focus:bg-[#FFD93D]' : ''}
                                            ${borderRight} ${borderBottom}
                                            transition-colors
                                        `}
                                    />
                                );
                            })
                        ))}
                    </div>

                    {/* Submit Button */}
                    {isActive && !isWon && !alreadyPlayed && (
                        <button
                            onClick={() => {
                                if (checkWin(board)) handleWin();
                                else {
                                    setMessage('Board is not solved correctly.');
                                    setRetry(r => r + 1);
                                    setMistakes(m => m + 1);
                                    setTimeout(() => setMessage(''), 3000);
                                }
                            }}
                            className="w-full mt-8 px-8 py-4 bg-[#00B894] border-2 border-black rounded-xl text-black font-black tracking-[0.2em] text-sm uppercase shadow-[4px_4px_0px_#000] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] active:translate-y-[2px] active:shadow-none transition-all"
                        >
                            SUBMIT SOLUTION
                        </button>
                    )}
                </div>
            </div>

            {/* Leaderboard */}
            {leaderboard.length > 0 && (
                <div className="w-full max-w-xl mt-8">
                    <h3 className="font-header text-lg text-white/80 mb-2">Leaderboard</h3>
                    <div className="bg-black/40 border border-white/20 rounded-lg overflow-hidden">
                        <table className="w-full text-white/80 text-sm">
                            <thead className="bg-white/5">
                                <tr>
                                    <th className="p-3 text-left">User</th>
                                    <th className="p-3 text-left">Points</th>
                                    <th className="p-3 text-left">Games</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboard.map((row, i) => (
                                    <tr key={i} className="border-t border-white/10">
                                        <td className="p-3">{row.userId.slice(0, 8)}...</td>
                                        <td className="p-3 text-amber-500 font-bold">{row.totalPoints}</td>
                                        <td className="p-3">{row.gamesPlayed}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* History */}
            {history.length > 0 && (
                <div className="w-full max-w-xl mt-4">
                    <h3 className="font-header text-lg text-white/80 mb-2">Your History</h3>
                    <div className="bg-black/40 border border-white/20 rounded-lg overflow-hidden">
                        <table className="w-full text-white/80 text-sm">
                            <thead className="bg-white/5">
                                <tr>
                                    <th className="p-3 text-left">Date</th>
                                    <th className="p-3 text-left">Points</th>
                                    <th className="p-3 text-left">Level</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((row, i) => (
                                    <tr key={i} className="border-t border-white/10">
                                        <td className="p-3">{new Date(row.awardedAt).toLocaleDateString()}</td>
                                        <td className="p-3 text-amber-500 font-bold">{row.points}</td>
                                        <td className="p-3">{row.level || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SudokuGame;

