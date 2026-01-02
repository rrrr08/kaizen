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
        <div className="flex flex-col items-center gap-8">
            {/* Game of the Day Badge */}
            {isGameOfDay && (
                <div className="mb-2">
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FFD93D] to-[#FF7675] text-black rounded-full font-header tracking-widest text-sm border-2 border-black shadow-[4px_4px_0px_#000]">
                        <Star size={16} className="fill-current" /> GAME OF THE DAY - 2X POINTS!
                    </div>
                </div>
            )}

            {/* Level Selector */}
            <div className="mb-4">
                <label className="font-header text-white/80 mr-2">Level:</label>
                <select
                    value={level}
                    onChange={e => setLevel(e.target.value)}
                    className="bg-black text-white border border-white/20 rounded px-2 py-1"
                    disabled={!isActive || isWon}
                >
                    {LEVELS.map(l => (
                        <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                </select>
            </div>

            {/* HUD */}
            <div className="flex items-center gap-8 text-white/80 font-header tracking-widest text-sm">
                <div className="flex items-center gap-2">
                    <Clock size={16} className="text-amber-500" />
                    <span>{formatTime(timer)}</span>
                </div>
                {retry > 0 && (
                    <div className="flex items-center gap-2">
                        <RefreshCcw size={16} className="text-red-400" />
                        <span>Retries: {retry}</span>
                    </div>
                )}
            </div>

            {/* WIN STATE */}
            {isWon && (
                <div className="animate-in zoom-in duration-300 bg-emerald-500/20 border border-emerald-500 p-8 rounded text-center">
                    <Trophy className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">PUZZLE SOLVED!</h2>
                    <p className={`font-header tracking-widest text-sm ${alreadyPlayed ? 'text-amber-500' : 'text-emerald-400'}`}>
                        {message}
                    </p>
                    {points !== null && !alreadyPlayed && (
                        <div className="mt-4 text-4xl font-black text-[#FFD93D]">
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
            <div className="grid grid-cols-9 border-2 border-white/20 bg-black/40 shadow-2xl">
                {board.map((row, rIndex) => (
                    row.map((cell, cIndex) => {
                        const isInitial = puzzle[rIndex][cIndex] !== 0;
                        const borderRight = (cIndex + 1) % 3 === 0 && cIndex !== 8 ? 'border-r-2 border-white/20' : 'border-r border-white/10';
                        const borderBottom = (rIndex + 1) % 3 === 0 && rIndex !== 8 ? 'border-b-2 border-white/20' : 'border-b border-white/10';
                        return (
                            <input
                                key={`${rIndex}-${cIndex}`}
                                type="text"
                                maxLength={1}
                                value={cell === 0 ? '' : cell}
                                onChange={(e) => handleCellChange(rIndex, cIndex, e.target.value)}
                                disabled={isInitial || isWon || !isActive || alreadyPlayed}
                                className={`
                                    w-8 h-8 md:w-12 md:h-12 text-center text-lg md:text-xl font-bold focus:outline-none focus:bg-amber-500/20
                                    ${isInitial ? 'bg-white/5 text-white/40 cursor-not-allowed' : 'bg-transparent text-white'}
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
                            setTimeout(() => setMessage(''), 3000);
                        }
                    }}
                    className="px-8 py-3 bg-amber-500 text-black font-header tracking-widest text-sm hover:scale-105 transition-transform mt-4"
                >
                    SUBMIT
                </button>
            )}

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

