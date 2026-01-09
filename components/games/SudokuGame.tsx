'use client';

import React, { useState, useEffect } from 'react';
import Scratcher from '../gamification/Scratcher';
import { Clock, RefreshCcw, Trophy, AlertCircle, Star, Lightbulb, Eraser, Undo, Redo, PenTool, Pencil } from 'lucide-react';
import { awardGamePoints, getGameHistory } from '@/lib/gameApi';
import { usePopup } from '@/app/context/PopupContext';
import confetti from 'canvas-confetti';

async function fetchSudokuBoard(difficulty = 'easy') {
    const res = await fetch(`/api/games/sudoku-generate?difficulty=${difficulty}`);
    const data = await res.json();
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
    { label: 'Easy', value: 'easy', color: 'bg-[#00B894]' },
    { label: 'Medium', value: 'medium', color: 'bg-[#FFD93D]' },
    { label: 'Hard', value: 'hard', color: 'bg-[#FF7675]' },
    { label: 'Expert', value: 'expert', color: 'bg-[#6C5CE7]' }
];

const SudokuGame: React.FC = () => {
    const { showAlert, showConfirm } = usePopup();
    const [level, setLevel] = useState('medium');
    const [puzzle, setPuzzle] = useState<number[][]>([]);
    const [solution, setSolution] = useState<number[][]>([]);
    const [board, setBoard] = useState<number[][]>([]);
    const [timer, setTimer] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [isWon, setIsWon] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);
    const [mistakes, setMistakes] = useState(0);
    const [maxMistakes] = useState(3);
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
    const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
    const [noteMode, setNoteMode] = useState(false);
    const [notes, setNotes] = useState<Set<number>[][]>([]);
    const [undoStack, setUndoStack] = useState<any[]>([]);
    const [redoStack, setRedoStack] = useState<any[]>([]);
    const [hints, setHints] = useState(3);
    const [conflicts, setConflicts] = useState<Set<string>>(new Set());
    const [highlightNumber, setHighlightNumber] = useState<number | null>(null);
    const [showSolution, setShowSolution] = useState(false);
    const [showRules, setShowRules] = useState(false);

    // Initialize notes grid
    useEffect(() => {
        if (puzzle.length > 0) {
            const newNotes = Array(9).fill(null).map(() =>
                Array(9).fill(null).map(() => new Set<number>())
            );
            setNotes(newNotes);
        }
    }, [puzzle]);

    // Check for conflicts whenever board changes
    useEffect(() => {
        if (board.length === 0) return;
        const newConflicts = new Set<string>();

        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const val = board[r][c];
                if (val === 0) continue;

                // Check row
                for (let cc = 0; cc < 9; cc++) {
                    if (cc !== c && board[r][cc] === val) {
                        newConflicts.add(`${r}-${c}`);
                        newConflicts.add(`${r}-${cc}`);
                    }
                }

                // Check column
                for (let rr = 0; rr < 9; rr++) {
                    if (rr !== r && board[rr][c] === val) {
                        newConflicts.add(`${r}-${c}`);
                        newConflicts.add(`${rr}-${c}`);
                    }
                }

                // Check 3x3 box
                const boxR = Math.floor(r / 3) * 3;
                const boxC = Math.floor(c / 3) * 3;
                for (let rr = boxR; rr < boxR + 3; rr++) {
                    for (let cc = boxC; cc < boxC + 3; cc++) {
                        if ((rr !== r || cc !== c) && board[rr][cc] === val) {
                            newConflicts.add(`${r}-${c}`);
                            newConflicts.add(`${rr}-${cc}`);
                        }
                    }
                }
            }
        }

        setConflicts(newConflicts);
    }, [board]);

    // Always generate new puzzle on mount or level change
    useEffect(() => {
        fetchSudokuBoard(level).then(({ puzzle, solution }) => {
            setPuzzle(puzzle);
            setSolution(solution);
            setBoard(puzzle.map(row => [...row]));
            setTimer(0);
            setIsActive(true);
            setIsWon(false);
            setIsGameOver(false);
            setMistakes(0);
            setPoints(null);
            setMessage('');
            setRetry(0);
            setShowScratcher(false);
            setBonusPoints(null);
            setAlreadyPlayed(false);
            setSelectedCell(null);
            setNoteMode(false);
            setUndoStack([]);
            setRedoStack([]);
            setHints(3);
            setHighlightNumber(null);
            setShowSolution(false);
        });

        // Fetch leaderboard
        fetch(`/api/games/leaderboard?gameId=${SUDOKU_GAME_ID}&limit=10`)
            .then(r => r.json())
            .then(d => setLeaderboard(d.leaderboard || []))
            .catch(console.error);

        // Fetch history
        (async () => {
            try {
                const { getAuth } = await import('firebase/auth');
                const { app } = await import('@/lib/firebase');
                const auth = getAuth(app);
                const user = auth.currentUser;

                if (user) {
                    const token = await user.getIdToken();
                    const response = await fetch(`/api/games/history?gameId=${SUDOKU_GAME_ID}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setHistory(data.history || []);
                    }
                }
            } catch (error) {
                // Silently fail - user may not be authenticated
                setHistory([]);
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
        if (isActive && !isWon && !isGameOver) {
            interval = setInterval(() => {
                setTimer((prev) => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive, isWon, isGameOver]);

    const saveState = () => {
        setUndoStack(prev => [...prev, board.map(row => [...row])]);
        setRedoStack([]);
    };

    const handleUndo = () => {
        if (undoStack.length === 0) return;
        const prevState = undoStack[undoStack.length - 1];
        setRedoStack(prev => [...prev, board.map(row => [...row])]);
        setBoard(prevState);
        setUndoStack(prev => prev.slice(0, -1));
    };

    const handleRedo = () => {
        if (redoStack.length === 0) return;
        const nextState = redoStack[redoStack.length - 1];
        setUndoStack(prev => [...prev, board.map(row => [...row])]);
        setBoard(nextState);
        setRedoStack(prev => prev.slice(0, -1));
    };

    const handleHint = () => {
        if (hints === 0 || !selectedCell) return;
        const { row, col } = selectedCell;
        if (puzzle[row][col] !== 0) return;

        saveState();
        const newBoard = [...board];
        newBoard[row] = [...newBoard[row]];
        newBoard[row][col] = solution[row][col];
        setBoard(newBoard);
        setHints(h => h - 1);

        confetti({ particleCount: 50, spread: 30, origin: { y: 0.7 } });
    };

    const handleClearCell = () => {
        if (!selectedCell) return;
        const { row, col } = selectedCell;
        if (puzzle[row][col] !== 0) return;

        saveState();
        const newBoard = [...board];
        newBoard[row] = [...newBoard[row]];
        newBoard[row][col] = 0;
        setBoard(newBoard);

        // Clear notes too
        if (notes.length > 0) {
            const newNotes = notes.map(r => r.map(c => new Set<number>(c)));
            newNotes[row][col].clear();
            setNotes(newNotes);
        }
    };

    const handleNumberInput = (num: number) => {
        if (!selectedCell || !isActive || isWon || isGameOver || alreadyPlayed) return;
        const { row, col } = selectedCell;
        if (puzzle[row][col] !== 0) return;

        if (noteMode) {
            // Toggle note
            const newNotes = notes.map(r => r.map(c => new Set<number>(c)));
            if (newNotes[row][col].has(num)) {
                newNotes[row][col].delete(num);
            } else {
                newNotes[row][col].add(num);
            }
            setNotes(newNotes);
        } else {
            // Check if number is wrong
            const isWrong = solution[row][col] !== num;

            if (isWrong) {
                // Increment mistakes
                const newMistakes = mistakes + 1;
                setMistakes(newMistakes);

                // Check for game over
                if (newMistakes >= maxMistakes) {
                    setIsActive(false);
                    setIsGameOver(true);
                    return;
                }
            }

            // Place number
            saveState();
            const newBoard = [...board];
            newBoard[row] = [...newBoard[row]];
            newBoard[row][col] = num;
            setBoard(newBoard);

            // Clear notes when number is placed
            if (notes.length > 0) {
                const newNotes = notes.map(r => r.map(c => new Set<number>(c)));
                newNotes[row][col].clear();
                setNotes(newNotes);
            }

            // Auto-check on every move
            if (!isWrong && checkWin(newBoard)) {
                setTimeout(() => handleWin(), 500);
            }
        }
    };

    const checkWin = (currentBoard: number[][]) => {
        return currentBoard.every((row, r) =>
            row.every((cell, c) => cell === solution[r][c])
        );
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
                level
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

    const handleShowSolution = async () => {
        const confirmed = await showConfirm('Spend 50 JP to reveal the solution?', 'Reveal Solution');
        if (!confirmed) {
            return;
        }

        try {
            const { getAuth } = await import('firebase/auth');
            const { app } = await import('@/lib/firebase');
            const auth = getAuth(app);
            const user = auth.currentUser;

            if (!user) {
                await showAlert('Please sign in to use this feature', 'warning');
                return;
            }

            const token = await user.getIdToken();
            const response = await fetch('/api/wallet/deduct', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ amount: 50, reason: 'Sudoku solution reveal' })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setShowSolution(true);
                setBoard(solution.map(row => [...row]));
                confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 } });
            } else {
                const errorMsg = data.error || 'Failed to deduct JP';
                await showAlert(`${errorMsg}\n\nYou need 50 JP to reveal the solution. Play more games or complete challenges to earn JP!`, 'error', 'Insufficient JP');
            }
        } catch (error) {
            console.error('Error revealing solution:', error);
            await showAlert('Error revealing solution. Please check your internet connection and try again.', 'error');
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getCellClassName = (rIndex: number, cIndex: number, cell: number) => {
        const isInitial = puzzle[rIndex][cIndex] !== 0;
        const isSelected = selectedCell?.row === rIndex && selectedCell?.col === cIndex;
        const isHighlighted = highlightNumber !== null && cell === highlightNumber && cell !== 0;
        const isSameRow = selectedCell?.row === rIndex;
        const isSameCol = selectedCell?.col === cIndex;
        const isSameBox = selectedCell &&
            Math.floor(selectedCell.row / 3) === Math.floor(rIndex / 3) &&
            Math.floor(selectedCell.col / 3) === Math.floor(cIndex / 3);
        const hasConflict = conflicts.has(`${rIndex}-${cIndex}`);

        let bgColor = 'bg-white';
        if (isSelected) bgColor = 'bg-[#FFD93D]';
        else if (isHighlighted) bgColor = 'bg-[#6C5CE7]/20';
        else if (isSameRow || isSameCol || isSameBox) bgColor = 'bg-[#FFFDF5]';
        else if (isInitial) bgColor = 'bg-gray-50';

        return `
            text-center font-bold focus:outline-none cursor-pointer
            ${isInitial ? 'text-black font-black' : 'text-[#6C5CE7] font-bold'}
            ${bgColor}
            ${hasConflict ? '!bg-red-100 !text-red-600' : ''}
            ${isSelected ? 'ring-4 ring-[#FFD93D] ring-inset' : ''}
            ${!isInitial && !isWon && isActive ? 'hover:bg-[#F0F0F0]' : ''}
            transition-all duration-150
            relative
        `;
    };

    return (
        <div className="flex flex-col items-center gap-6 sm:gap-8 w-full min-h-screen py-8">
            {/* Game of the Day Badge */}
            {isGameOfDay && (
                <div className="mb-2">
                    <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-[#FFD93D] text-black rounded-full font-black tracking-widest text-xs sm:text-sm border-2 border-black shadow-[4px_4px_0px_#000]">
                        <Star size={14} className="fill-black sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">GAME OF THE DAY - 2X POINTS!</span>
                        <span className="sm:hidden">2X POINTS!</span>
                    </div>
                </div>
            )}

            <div className="w-full max-w-[1600px] grid grid-cols-1 xl:grid-cols-[300px_1fr_300px] gap-6 xl:gap-10 px-4 sm:px-6 lg:px-8">

                {/* Rules Modal */}
                {showRules && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowRules(false)}>
                        <div className="bg-white border-4 border-black rounded-[20px] p-6 sm:p-8 max-w-2xl max-h-[80vh] overflow-y-auto neo-shadow" onClick={e => e.stopPropagation()}>
                            <h2 className="text-2xl sm:text-3xl font-black mb-6 uppercase">📋 How to Play Sudoku</h2>

                            <div className="space-y-4 text-left">
                                <div>
                                    <h3 className="font-black text-lg mb-2 text-[#6C5CE7]">🎯 Objective</h3>
                                    <p className="text-black/80">Fill the 9×9 grid so that each row, column, and 3×3 box contains digits 1-9 without repetition.</p>
                                </div>

                                <div>
                                    <h3 className="font-black text-lg mb-2 text-[#6C5CE7]">🎮 Controls</h3>
                                    <ul className="space-y-2 text-black/80">
                                        <li>• <strong>Click a cell</strong> to select it (yellow highlight)</li>
                                        <li>• <strong>Click a number</strong> (1-9) to place it in the selected cell</li>
                                        <li>• <strong>Notes Mode</strong>: Toggle to add pencil marks for tracking possibilities</li>
                                        <li>• <strong>Eraser</strong>: Clear the selected cell</li>
                                        <li>• <strong>Undo/Redo</strong>: Revert or restore your moves</li>
                                        <li>• <strong>Hints</strong>: Get help (3 hints per game, costs 50 JP each after that)</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="font-black text-lg mb-2 text-[#FF7675]">❌ Mistakes</h3>
                                    <p className="text-black/80">You have <strong>3 lives</strong>. Wrong numbers count as mistakes. After 3 mistakes, it's game over!</p>
                                </div>

                                <div>
                                    <h3 className="font-black text-lg mb-2 text-[#00B894]">🏆 Scoring</h3>
                                    <ul className="space-y-1 text-black/80">
                                        <li>• Base points vary by difficulty</li>
                                        <li>• -10 points per mistake</li>
                                        <li>• -5 points per minute spent</li>
                                        <li>• Minimum 10 points guaranteed</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="font-black text-lg mb-2 text-[#FFD93D]">💡 Tips</h3>
                                    <ul className="space-y-1 text-black/80">
                                        <li>• Use notes to track possibilities</li>
                                        <li>• Start with rows/columns that have many numbers</li>
                                        <li>• Look for "naked singles" (only one possible number)</li>
                                        <li>• Red highlighting shows conflicts</li>
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

                {/* LEFT COLUMN: Controls */}
                <div className="space-y-6">
                    {/* Rules Button */}
                    <button
                        onClick={() => setShowRules(true)}
                        className="w-full px-6 py-4 bg-[#FFD93D] text-black rounded-xl border-2 border-black font-black uppercase text-sm hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_#000] transition-all"
                    >
                        📋 How to Play
                    </button>

                    {/* Difficulty */}
                    <div className="bg-white border-2 border-black p-6 rounded-[20px] neo-shadow">
                        <label className="font-black text-black text-xs uppercase tracking-widest block mb-3">Difficulty</label>
                        <div className="space-y-2">
                            {LEVELS.map(l => (
                                <button
                                    key={l.value}
                                    onClick={() => setLevel(l.value)}
                                    className={`
                                        w-full px-4 py-3 rounded-xl border-2 border-black font-black uppercase text-sm
                                        transition-all ${l.color} ${level === l.value ? 'neo-shadow' : 'opacity-50'}
                                        hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_#000]
                                    `}
                                >
                                    {l.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="bg-white border-2 border-black p-6 rounded-[20px] neo-shadow space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="font-black text-xs uppercase tracking-widest text-black/50">TIME</span>
                            <div className="flex items-center gap-2 font-black text-xl text-black">
                                <Clock size={20} />
                                {formatTime(timer)}
                            </div>
                        </div>
                        <div className="w-full h-0.5 bg-black/10"></div>
                        <div className="flex items-center justify-between">
                            <span className="font-black text-xs uppercase tracking-widest text-black/50">MISTAKES</span>
                            <div className="flex items-center gap-2 font-black text-xl text-[#FF7675]">
                                <AlertCircle size={20} />
                                {mistakes}/{maxMistakes}
                            </div>
                        </div>
                        <div className="w-full h-0.5 bg-black/10"></div>
                        <div className="flex items-center justify-between">
                            <span className="font-black text-xs uppercase tracking-widest text-black/50">HINTS</span>
                            <div className="flex items-center gap-2 font-black text-xl text-[#FFD93D]">
                                <Lightbulb size={20} />
                                {hints}/3
                            </div>
                        </div>
                    </div>

                    {/* Tool Controls */}
                    <div className="bg-white border-2 border-black p-6 rounded-[20px] neo-shadow space-y-3">
                        <button
                            onClick={() => setNoteMode(!noteMode)}
                            className={`
                                w-full px-4 py-3 rounded-xl border-2 border-black font-black uppercase text-sm
                                transition-all ${noteMode ? 'bg-[#6C5CE7] text-white' : 'bg-white text-black'}
                                hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_#000] flex items-center justify-center gap-2
                            `}
                        >
                            <Pencil size={16} />
                            {noteMode ? 'Notes ON' : 'Notes OFF'}
                        </button>
                        <button
                            onClick={handleHint}
                            disabled={hints === 0 || !selectedCell || isWon}
                            className="w-full px-4 py-3 bg-[#FFD93D] rounded-xl border-2 border-black font-black uppercase text-sm transition-all hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_#000] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Lightbulb size={16} />
                            Hint ({hints})
                        </button>
                        <div className="flex gap-2">
                            <button
                                onClick={handleUndo}
                                disabled={undoStack.length === 0}
                                className="flex-1 px-3 py-3 bg-white rounded-xl border-2 border-black font-black uppercase text-sm transition-all hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_#000] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                <Undo size={16} />
                            </button>
                            <button
                                onClick={handleRedo}
                                disabled={redoStack.length === 0}
                                className="flex-1 px-3 py-3 bg-white rounded-xl border-2 border-black font-black uppercase text-sm transition-all hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_#000] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                <Redo size={16} />
                            </button>
                            <button
                                onClick={handleClearCell}
                                disabled={!selectedCell}
                                className="flex-1 px-3 py-3 bg-white rounded-xl border-2 border-black font-black uppercase text-sm transition-all hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_#000] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                <Eraser size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* MIDDLE COLUMN: Grid */}
                <div className="flex flex-col items-center justify-start gap-6 lg:gap-8 w-full max-w-3xl mx-auto">
                    {/* GAME OVER STATE */}
                    {isGameOver && (
                        <div className="w-full max-w-2xl mb-4 animate-in zoom-in duration-300 bg-[#FF7675] border-2 border-black shadow-[4px_4px_0px_#000] p-6 sm:p-8 rounded-[20px] text-center">
                            <AlertCircle className="w-12 h-12 text-black mx-auto mb-4" />
                            <h2 className="text-xl sm:text-2xl font-black text-black uppercase mb-2">GAME OVER!</h2>
                            <p className="font-bold text-black/80 mb-4">
                                You made {maxMistakes} mistakes. Better luck next time!
                            </p>
                            {showSolution && (
                                <div className="mb-4 p-4 bg-[#00B894] rounded-xl border-2 border-black">
                                    <p className="font-black text-white">✨ SOLUTION REVEALED! ✨</p>
                                </div>
                            )}
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                {!showSolution && (
                                    <button
                                        onClick={handleShowSolution}
                                        className="px-6 py-3 bg-[#FFD93D] text-black rounded-xl border-2 border-black font-black uppercase text-sm hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_#000] transition-all flex items-center justify-center gap-2"
                                    >
                                        <Lightbulb size={16} />
                                        Show Solution (50 JP)
                                    </button>
                                )}
                                <button
                                    onClick={() => setLevel(level)}
                                    className="px-6 py-3 bg-black text-white rounded-xl border-2 border-black font-black uppercase text-sm hover:bg-white hover:text-black transition-all"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    )}

                    {/* WIN STATE */}
                    {isWon && (
                        <div className="w-full max-w-2xl mb-4 animate-in zoom-in duration-300 bg-[#FFFDF5] border-2 border-black shadow-[4px_4px_0px_#000] p-6 sm:p-8 rounded-[20px] text-center">
                            <Trophy className="w-12 h-12 text-[#FFD93D] mx-auto mb-4 drop-shadow-[2px_2px_0px_#000]" />
                            <h2 className="text-xl sm:text-2xl font-black text-black uppercase mb-1">PUZZLE SOLVED!</h2>
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
                    <div className="w-full flex justify-center overflow-x-auto px-2">
                        <div className="grid grid-cols-9 gap-0 border-4 border-black bg-black neo-shadow rounded-2xl overflow-hidden min-w-[396px] sm:min-w-[504px] md:min-w-[576px] lg:min-w-[648px]">
                            {board.map((row, rIndex) => (
                                row.map((cell, cIndex) => {
                                    const borderRight = (cIndex + 1) % 3 === 0 && cIndex !== 8 ? 'border-r-4 border-black' : 'border-r border-black/20';
                                    const borderBottom = (rIndex + 1) % 3 === 0 && rIndex !== 8 ? 'border-b-4 border-black' : 'border-b border-black/20';
                                    const cellNotes = notes[rIndex]?.[cIndex];

                                    return (
                                        <div
                                            key={`${rIndex}-${cIndex}`}
                                            onClick={() => setSelectedCell({ row: rIndex, col: cIndex })}
                                            className={`
                                                ${getCellClassName(rIndex, cIndex, cell)}
                                                ${borderRight} ${borderBottom}
                                                w-11 h-11 min-w-[44px] min-h-[44px] sm:w-14 sm:h-14 sm:min-w-[56px] sm:min-h-[56px] md:w-16 md:h-16 md:min-w-[64px] md:min-h-[64px] lg:w-[72px] lg:h-[72px] lg:min-w-[72px] lg:min-h-[72px]
                                                flex items-center justify-center
                                                select-none
                                            `}
                                        >
                                            {cell !== 0 ? (
                                                <span className="text-xl sm:text-2xl md:text-3xl font-bold">{cell}</span>
                                            ) : cellNotes && cellNotes.size > 0 ? (
                                                <div className="grid grid-cols-3 gap-0 w-full h-full p-0.5 sm:p-1">
                                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                                                        <span key={n} className="text-[7px] sm:text-[8px] md:text-[9px] text-gray-400 flex items-center justify-center font-medium">
                                                            {cellNotes.has(n) ? n : ''}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : null}
                                        </div>
                                    );
                                })
                            ))}
                        </div>
                    </div>

                    {/* Number Input Pad */}
                    {isActive && !isWon && !isGameOver && (
                        <div className="mt-8 w-full max-w-lg mx-auto">
                            <div className="grid grid-cols-5 gap-2 sm:gap-3">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                    <button
                                        key={num}
                                        onClick={() => handleNumberInput(num)}
                                        onMouseEnter={() => setHighlightNumber(num)}
                                        onMouseLeave={() => setHighlightNumber(null)}
                                        className="aspect-square bg-white border-2 border-black rounded-xl text-xl sm:text-2xl font-black hover:bg-[#FFD93D] hover:shadow-[4px_4px_0px_#000] hover:translate-y-[-2px] active:translate-y-[2px] active:shadow-none transition-all select-none"
                                    >
                                        {num}
                                    </button>
                                ))}
                                <button
                                    onClick={handleClearCell}
                                    className="col-span-1 aspect-square bg-white border-2 border-black rounded-xl font-black hover:bg-[#FF7675] hover:text-white hover:shadow-[4px_4px_0px_#000] hover:translate-y-[-2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center select-none"
                                >
                                    <Eraser size={18} className="sm:w-5 sm:h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: History */}
                <div className="space-y-6">
                    {history.length > 0 && (
                        <div className="bg-white border-2 border-black p-6 rounded-[20px] neo-shadow">
                            <h3 className="font-black text-xs uppercase tracking-widest mb-4">Your History</h3>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                {history.slice(0, 10).map((row, i) => (
                                    <div key={i} className="p-3 bg-[#FFFDF5] rounded-lg border border-black/10">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-xs text-black/50 font-bold">
                                                    {new Date(row.awardedAt).toLocaleDateString()}
                                                </p>
                                                <p className="text-sm font-bold uppercase">{row.level || 'Medium'}</p>
                                            </div>
                                            <p className="text-lg font-black text-[#00B894]">+{row.points}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SudokuGame;
