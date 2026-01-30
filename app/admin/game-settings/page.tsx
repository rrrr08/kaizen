'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { usePopup } from '@/app/context/PopupContext';
import { useRouter } from 'next/navigation';
import {
    Gamepad2, Trophy, TrendingUp, Database,
    Plus, Trash2, Edit2, Save, AlertCircle,
    Settings, Zap, CheckCircle, Info,
    Grid3x3, HelpCircle, Search, Type, Skull, Lightbulb, Bomb, Activity, Calculator, Puzzle, Disc, Coins
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc, setDoc, getFirestore } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import {
    WHEEL_PRIZES,
    REWARDS,
    fetchWheelPrizesFromFirebase,
    fetchRewardsConfigFromFirebase,
    fetchStoreSettingsFromFirebase
} from '@/lib/gamification';

// --- Types ---
type TabType = 'general' | 'rewards' | 'xp-tiers' | 'content';

interface GameSettings {
    name: string;
    basePoints: number;
    retryPenalty: number;
    maxRetries: number;
    scratcher: {
        enabled: boolean;
        drops?: Array<{ prob: number; points: number; label?: string }>;
    };
}

interface AllSettings {
    [gameId: string]: GameSettings;
}

interface Tier {
    name: string;
    minXP: number;
    multiplier: number;
    badge: string;
    perk: string;
    color: string;
    icon: string;
    unlockPrice?: number;
}

interface XPSource {
    name: string;
    baseXP: number;
    baseJP: number;
    enabled: boolean;
}

type GameType = 'riddle' | 'trivia' | 'wordle' | 'hangman' | 'wordsearch' | 'chess';

const db = getFirestore(app);

export default function GameSettingsDashboard() {
    const { user, loading: authLoading, isAdmin } = useAuth();
    const { showAlert, showConfirm } = usePopup();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<TabType>('general');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    // --- Shared State ---
    // General (Games) Settings
    const [settings, setSettings] = useState<AllSettings>({});
    const [gameOfTheDay, setGameOfTheDay] = useState<Record<string, any> | null>(null);
    const [rotationPolicy, setRotationPolicy] = useState<Record<string, any> | null>(null);

    // Rewards (Gamification) Settings
    const [prizes, setPrizes] = useState(WHEEL_PRIZES);
    const [rewards, setRewards] = useState(REWARDS);
    const [storeSettings, setStoreSettings] = useState({
        pointsPerRupee: 1,
        redeemRate: 0.5,
        maxRedeemPercent: 50,
        firstTimeBonusPoints: 100
    });

    // XP & Tiers Settings
    const [tiers, setTiers] = useState<Tier[]>([]);
    const [xpSources, setXPSources] = useState<XPSource[]>([]);
    const [xpInitialized, setXpInitialized] = useState(false);

    // Content Settings
    const [selectedGame, setSelectedGame] = useState<GameType>('riddle');
    const [gameContent, setGameContent] = useState<Record<string, any> | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newItem, setNewItem] = useState<Record<string, any>>({});

    // --- Effects ---
    useEffect(() => {
        if (!authLoading && !user) router.push('/auth/login');
        if (!authLoading && user && !isAdmin) router.push('/');
    }, [user, authLoading, isAdmin, router]);

    useEffect(() => {
        if (user && isAdmin) {
            loadAllSettings();
        }
    }, [user, isAdmin]);

    useEffect(() => {
        if (activeTab === 'content' && selectedGame) {
            fetchGameContent(selectedGame);
        }
    }, [activeTab, selectedGame]);

    const loadAllSettings = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchGamesSettings(),
                fetchGameOfTheDay(),
                fetchRotationPolicy(),
                loadGamificationData(),
                loadXPSettings()
            ]);
        } catch (error) {
            console.error("Error loading settings:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- Fetching Functions ---
    const fetchGamesSettings = async () => {
        const res = await fetch('/api/games/settings');
        const data = await res.json();

        // Default settings for all games if not in database
        const defaultGames: AllSettings = {
            '2048': { name: '2048', basePoints: 100, retryPenalty: 5, maxRetries: 3, scratcher: { enabled: false, drops: [] } },
            riddle: { name: 'Riddle', basePoints: 50, retryPenalty: 5, maxRetries: 3, scratcher: { enabled: false, drops: [] } },
            sudoku: { name: 'Sudoku', basePoints: 150, retryPenalty: 10, maxRetries: 2, scratcher: { enabled: false, drops: [] } },
            wordsearch: { name: 'Word Search', basePoints: 80, retryPenalty: 5, maxRetries: 3, scratcher: { enabled: false, drops: [] } },
            wordle: { name: 'Wordle', basePoints: 100, retryPenalty: 0, maxRetries: 6, scratcher: { enabled: false, drops: [] } },
            hangman: { name: 'Hangman', basePoints: 60, retryPenalty: 5, maxRetries: 6, scratcher: { enabled: false, drops: [] } },
            trivia: { name: 'Trivia', basePoints: 50, retryPenalty: 5, maxRetries: 3, scratcher: { enabled: false, drops: [] } },
            chess: { name: 'Chess', basePoints: 200, retryPenalty: 20, maxRetries: 1, scratcher: { enabled: false, drops: [] } },
            minesweeper: { name: 'Minesweeper', basePoints: 120, retryPenalty: 10, maxRetries: 3, scratcher: { enabled: false, drops: [] } },
            snake: { name: 'Snake', basePoints: 100, retryPenalty: 5, maxRetries: 5, scratcher: { enabled: false, drops: [] } },
            mathquiz: { name: 'Math Quiz', basePoints: 80, retryPenalty: 5, maxRetries: 3, scratcher: { enabled: false, drops: [] } },
            puzzles: { name: 'Puzzles', basePoints: 90, retryPenalty: 5, maxRetries: 3, scratcher: { enabled: false, drops: [] } }
        };

        // Merge: Start with defaults, then override with Firebase data
        // Merge: Start with defaults, then override with Firebase data
        const firebaseSettings = data.settings || {};

        // Deep merge to preserve defaults (especially name) if missing in Firebase
        const mergedSettings: AllSettings = { ...defaultGames };

        Object.entries(firebaseSettings).forEach(([key, value]) => {
            if (mergedSettings[key]) {
                // Determine if we need to merge specific sub-objects like 'scratcher'
                const existing = mergedSettings[key];
                const incoming = value as GameSettings;

                mergedSettings[key] = {
                    ...existing,
                    ...incoming,
                    // If scratcher exists in both, merge it (optional, but good practice)
                    scratcher: {
                        ...existing.scratcher,
                        ...(incoming.scratcher || {})
                    }
                };
            } else {
                mergedSettings[key] = value as GameSettings;
            }
        });

        setSettings(mergedSettings);
    };

    const fetchGameOfTheDay = async () => {
        const res = await fetch('/api/games/game-of-the-day');
        const data = await res.json();
        setGameOfTheDay(data);
    };

    const fetchRotationPolicy = async () => {
        const res = await fetch('/api/games/rotation-policy');
        const data = await res.json();
        setRotationPolicy(data);
    };

    const loadGamificationData = async () => {
        const [fetchedPrizes, fetchedRewards, fetchedStore] = await Promise.all([
            fetchWheelPrizesFromFirebase(),
            fetchRewardsConfigFromFirebase(),
            fetchStoreSettingsFromFirebase()
        ]);
        if (fetchedPrizes) setPrizes(fetchedPrizes);
        if (fetchedRewards) setRewards(fetchedRewards);
        if (fetchedStore) setStoreSettings(prev => ({ ...prev, ...fetchedStore }));
    };

    const loadXPSettings = async () => {
        const settingsRef = doc(db, 'settings', 'xpSystem');
        const snap = await getDoc(settingsRef);

        const defaultTiers = getDefaultTiers();
        const defaultSources = getDefaultXPSources();

        if (snap.exists()) {
            const data = snap.data();

            // Merge Tiers: Keep existing, add missing defaults
            const existingTiers = (data.tiers || []) as Tier[];
            const mergedTiers = [...existingTiers];

            defaultTiers.forEach(defTier => {
                if (!existingTiers.some(t => t.name === defTier.name)) {
                    mergedTiers.push(defTier);
                }
            });

            // Sort by minXP to keep order correct
            mergedTiers.sort((a, b) => a.minXP - b.minXP);


            // Merge Sources: Keep existing, add missing defaults
            const existingSources = (data.xpSources || []) as XPSource[];
            const mergedSources = [...existingSources];

            defaultSources.forEach(defSource => {
                if (!existingSources.some(s => s.name === defSource.name)) {
                    mergedSources.push(defSource);
                }
            });

            setTiers(mergedTiers);
            setXPSources(mergedSources);
            setXpInitialized(true);
        } else {
            setTiers(defaultTiers);
            setXPSources(defaultSources);
            setXpInitialized(false);
        }
    };

    const fetchGameContent = async (gameId: string) => {
        const response = await fetch(`/api/games/content?gameId=${gameId}`);
        if (response.ok) {
            const data = await response.json();
            setGameContent(data.content);
        } else {
            setGameContent(null);
        }
    };

    const getDefaultTiers = (): Tier[] => [
        {
            name: 'Newbie',
            minXP: 0,
            multiplier: 1.0,
            badge: 'Grey Meeple',
            perk: 'None',
            color: '#94a3b8',
            icon: '♟️',
            unlockPrice: 0
        },
        {
            name: 'Player',
            minXP: 500,
            multiplier: 1.1,
            badge: 'Green Pawn',
            perk: 'Early access to Event Tickets',
            color: '#34d399',
            icon: '♝',
            unlockPrice: 2000
        },
        {
            name: 'Strategist',
            minXP: 2000,
            multiplier: 1.25,
            badge: 'Blue Rook',
            perk: '5% off all Workshops',
            color: '#60a5fa',
            icon: '♜',
            unlockPrice: 5000
        },
        {
            name: 'Knight',
            minXP: 3500,
            multiplier: 1.35,
            badge: 'Purple Knight',
            perk: 'Priority access & bonus XP on Experiences',
            color: '#a78bfa',
            icon: '♞',
            unlockPrice: 7500
        },
        {
            name: 'Grandmaster',
            minXP: 5000,
            multiplier: 1.5,
            badge: 'Gold Crown',
            perk: 'VIP Seating at Game Nights',
            color: '#fbbf24',
            icon: '♛',
            unlockPrice: 10000
        },
        {
            name: 'Legend',
            minXP: 7500,
            multiplier: 1.75,
            badge: 'Platinum King',
            perk: 'Exclusive access to all premium features',
            color: '#e879f9',
            icon: '♚',
            unlockPrice: 15000
        }
    ];


    const getDefaultXPSources = (): XPSource[] => [
        { name: 'Shop Purchase (per ₹100)', baseXP: 10, baseJP: 10, enabled: true },
        { name: 'Event Registration', baseXP: 50, baseJP: 50, enabled: true },
        { name: 'Experiences Registration', baseXP: 60, baseJP: 60, enabled: true },
        { name: 'Workshop Registration', baseXP: 75, baseJP: 75, enabled: true },
        { name: 'Game Night Attendance', baseXP: 100, baseJP: 100, enabled: true }
    ];

    // --- Handler Functions ---
    const handleSaveGeneral = async (gameId: string) => {
        setSaving(true);
        try {
            const token = await user?.getIdToken();
            const res = await fetch('/api/games/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ gameId, ...settings[gameId] }),
            });
            if (res.ok) showAlert(`${gameId} settings saved!`, 'success');
        } catch (error) {
            showAlert('Error saving settings', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveRewards = async () => {
        setSaving(true);
        try {
            await setDoc(doc(db, 'settings', 'wheelPrizes'), {
                prizes: prizes.map(p => ({
                    ...p,
                    probability: Number(p.probability),
                    value: (p.type === 'JP' || p.type === 'XP' || p.type === 'JACKPOT') ? (Number(p.value) || 0) : p.value
                }))
            });
            await setDoc(doc(db, 'settings', 'gamificationRewards'), rewards);

            // Save Store/Economy Settings
            await setDoc(doc(db, 'settings', 'store'), storeSettings, { merge: true });

            showAlert("Rewards & Economy settings saved!", 'success');
        } catch (error) {
            showAlert("Error saving settings", 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveXP = async () => {
        setSaving(true);
        try {
            const settingsRef = doc(db, 'settings', 'xpSystem');
            await setDoc(settingsRef, {
                tiers,
                xpSources,
                updatedAt: new Date().toISOString()
            });
            showAlert('XP System settings saved!', 'success');
            setXpInitialized(true);
        } catch (error) {
            showAlert('Failed to save XP settings', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleAddContent = async () => {
        if (!user) return;
        setSaving(true);
        try {
            const token = await user.getIdToken();
            const updatedItems = [...(gameContent?.items || []), { ...newItem, id: `${selectedGame}_${Date.now()}` }];
            const response = await fetch('/api/games/content', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ gameId: selectedGame, content: { items: updatedItems } })
            });
            if (response.ok) {
                showAlert('Item added successfully!', 'success');
                setShowAddForm(false);
                setNewItem({});
                fetchGameContent(selectedGame);
            }
        } catch (error) {
            showAlert('Network error', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteContent = async (itemId: string) => {
        const confirmed = await showConfirm('Delete this item?', 'Delete Item');
        if (!confirmed || !user) return;
        setSaving(true);
        try {
            const token = await user.getIdToken();
            const response = await fetch(`/api/games/content?gameId=${selectedGame}&itemId=${itemId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                showAlert('Item deleted!', 'success');
                fetchGameContent(selectedGame);
            }
        } finally {
            setSaving(false);
        }
    };

    // --- UI Components ---
    const SidebarTab = ({ id, label, icon: Icon }: { id: TabType, label: string, icon: any }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 font-black uppercase tracking-wider border-2 ${activeTab === id
                ? 'bg-[#FFD93D] text-black border-black neo-shadow-sm'
                : 'text-black/40 border-transparent hover:bg-black/5 hover:text-black'
                }`}
        >
            <Icon size={22} strokeWidth={2.5} />
            <span className="text-sm">{label}</span>
        </button>
    );

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-black border-t-[#FFD93D] rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-black font-black uppercase tracking-widest">Loading Settings...</p>
                </div>
            </div>
        );
    }

    if (!user || !isAdmin) return null;

    return (
        <div className="min-h-screen bg-[#FFFDF5] flex flex-col md:flex-row gap-8 pb-12 px-3 md:px-8 md:p-8 overflow-x-hidden">
            {/* Internal Navigation Sidebar */}
            <div className="w-full md:w-72 flex-shrink-0">
                <div className="sticky top-8 space-y-3">
                    <SidebarTab id="general" label="General" icon={Settings} />
                    <SidebarTab id="rewards" label="Rewards" icon={Trophy} />
                    <SidebarTab id="xp-tiers" label="XP & Tiers" icon={TrendingUp} />
                    <SidebarTab id="content" label="Game Content" icon={Database} />

                    <div className="mt-8 p-6 bg-white border-2 border-black rounded-3xl neo-shadow-sm">
                        <h4 className="font-header text-sm mb-2">QUICK TIP</h4>
                        <p className="text-[10px] font-bold text-black/40 leading-relaxed uppercase">
                            Remember to save each section individually after making changes!
                        </p>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-w-0">
                <div className="mb-10 flex justify-between items-end">
                    <div>
                        <h1 className="font-header text-6xl md:text-8xl tracking-tighter mb-2 text-[#2D3436]">
                            {activeTab.replace('-', ' ').toUpperCase()}
                        </h1>
                        <p className="text-black/50 font-black text-xs tracking-[0.4em] uppercase">
                            Game Settings Dashboard
                        </p>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeTab === 'general' && (
                            <div className="space-y-8">
                                {/* Game of the Day */}
                                <div className="bg-gradient-to-r from-[#FFD93D] to-[#FF7675] border-2 border-black p-8 rounded-[40px] neo-shadow flex flex-col md:flex-row justify-between items-center gap-6">
                                    <div>
                                        <h2 className="font-header text-3xl mb-1 flex items-center gap-2">
                                            <Zap className="fill-current" size={24} /> GAME OF THE DAY
                                        </h2>
                                        <p className="font-black text-black/60 uppercase tracking-widest text-xs">
                                            {gameOfTheDay?.gameName || gameOfTheDay?.gameId || 'Not Set'} — 2X Bonus Points Active
                                        </p>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            const today = new Date().toISOString().slice(0, 10);
                                            const todayGames = rotationPolicy?.rotationSchedule?.[today] || [];
                                            // Fallback to all games if today's list is empty
                                            const pool = todayGames.length > 0 ? todayGames : Object.keys(settings);

                                            if (pool.length === 0) {
                                                showAlert('No games available to select.', 'error');
                                                return;
                                            }

                                            const rand = pool[Math.floor(Math.random() * pool.length)];
                                            const token = await user?.getIdToken();
                                            await fetch('/api/games/game-of-the-day', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                                body: JSON.stringify({ gameId: rand, gameName: settings[rand]?.name || rand }),
                                            });
                                            fetchGameOfTheDay();
                                            showAlert(`Set ${rand} as Game of the Day!`, 'success');
                                        }}
                                        className="px-8 py-3 bg-black text-white font-black text-xs tracking-widest rounded-2xl hover:bg-black/80 transition-all border-2 border-transparent hover:border-white shadow-[4px_4px_0px_#fff]"
                                    >
                                        RANDOMIZE
                                    </button>
                                </div>

                                {/* Rotation Policy */}
                                {rotationPolicy && (
                                    <div className="bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] border-2 border-black p-8 rounded-[40px] neo-shadow text-white">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                                            <div>
                                                <h2 className="font-header text-3xl mb-1">ROTATION POLICY</h2>
                                                <p className="font-bold text-white/60 text-xs tracking-widest uppercase">
                                                    Control automatic game switching and daily availability
                                                </p>
                                            </div>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={async () => {
                                                        setSaving(true);
                                                        try {
                                                            const token = await user?.getIdToken();
                                                            const res = await fetch('/api/games/rotation-policy', {
                                                                method: 'PUT',
                                                                headers: { 'Authorization': `Bearer ${token}` }
                                                            });
                                                            if (res.ok) {
                                                                showAlert('Games rotated successfully!', 'success');
                                                                fetchRotationPolicy();
                                                            }
                                                        } finally {
                                                            setSaving(false);
                                                        }
                                                    }}
                                                    className="px-6 py-2 bg-white text-[#6C5CE7] font-black text-[10px] tracking-widest rounded-xl hover:bg-white/90 transition-all border-2 border-black shadow-[4px_4px_0px_#000]"
                                                >
                                                    ROTATE NOW
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        setSaving(true);
                                                        try {
                                                            const token = await user?.getIdToken();
                                                            const res = await fetch('/api/games/rotation-policy', {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                                                body: JSON.stringify(rotationPolicy),
                                                            });
                                                            if (res.ok) showAlert('Policy saved!', 'success');
                                                        } finally {
                                                            setSaving(false);
                                                        }
                                                    }}
                                                    className="px-6 py-2 bg-black text-white font-black text-[10px] tracking-widest rounded-xl hover:bg-black/80 transition-all border-2 border-white shadow-[4px_4px_0px_#fff]"
                                                >
                                                    SAVE POLICY
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                                            <div className="bg-white/10 p-6 rounded-[24px] border-2 border-white/10">
                                                <label className="flex items-center gap-3 cursor-pointer mb-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={rotationPolicy.enabled || false}
                                                        onChange={(e) => setRotationPolicy({ ...rotationPolicy, enabled: e.target.checked })}
                                                        className="w-5 h-5 accent-[#FFD93D]"
                                                    />
                                                    <span className="font-black text-xs tracking-wider uppercase">Auto Rotation</span>
                                                </label>
                                                <p className="text-[10px] font-bold text-white/40 leading-tight">Switch games automatically every day</p>
                                            </div>

                                            <div className="bg-white/10 p-6 rounded-[24px] border-2 border-white/10">
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">Games Per Day</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="20"
                                                    value={rotationPolicy.gamesPerDay || 5}
                                                    onChange={(e) => setRotationPolicy({ ...rotationPolicy, gamesPerDay: parseInt(e.target.value) })}
                                                    className="w-full bg-white/10 border-2 border-white/20 rounded-xl px-4 py-2 font-bold text-white outline-none focus:border-white transition-all"
                                                />
                                            </div>

                                            <div className="bg-white/10 p-6 rounded-[24px] border-2 border-white/10">
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">Last Rotation</label>
                                                <p className="font-black text-lg tracking-tight">{rotationPolicy.lastRotation || 'Never'}</p>
                                            </div>
                                        </div>

                                        {rotationPolicy.rotationSchedule && (
                                            <div className="bg-white/10 p-6 rounded-[30px] border-2 border-white/10">
                                                <h4 className="font-black text-[10px] tracking-[0.2em] mb-4 text-white/40 uppercase flex items-center gap-2">
                                                    <Info size={14} /> Today&apos;s Active Games
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {(rotationPolicy.rotationSchedule?.[new Date().toISOString().slice(0, 10)] || []).map((gameId: string) => (
                                                        <div key={gameId} className="group relative flex items-center gap-3 px-4 py-2 bg-white text-[#6C5CE7] rounded-xl font-bold text-xs border-2 border-black transition-all hover:translate-y-[-2px] hover:shadow-[3px_3px_0px_#000]">
                                                            {settings[gameId]?.name || gameId}
                                                            <button
                                                                onClick={async () => {
                                                                    const today = new Date().toISOString().slice(0, 10);
                                                                    const schedule = { ...rotationPolicy.rotationSchedule };
                                                                    schedule[today] = (schedule[today] || []).filter((id: string) => id !== gameId);
                                                                    setRotationPolicy(p => p ? { ...p, rotationSchedule: schedule } : null);
                                                                }}
                                                                className="text-red-400 hover:text-red-600 transition-colors"
                                                            >
                                                                &times;
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Games List Container */}
                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                                    {Object.entries(settings).map(([id, config]) => {
                                        // Game-specific icons and colors
                                        // Game-specific icons and colors
                                        const gameStyles: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
                                            '2048': { icon: <Grid3x3 size={40} />, color: '#FF6B6B', bg: '#FFE5E5' },
                                            riddle: { icon: <HelpCircle size={40} />, color: '#6C5CE7', bg: '#F0EDFF' },
                                            sudoku: { icon: <Grid3x3 size={40} />, color: '#00B894', bg: '#E5F9F4' },
                                            wordsearch: { icon: <Search size={40} />, color: '#FDCB6E', bg: '#FFF9E5' },
                                            wordle: { icon: <Type size={40} />, color: '#A29BFE', bg: '#F0EDFF' },
                                            hangman: { icon: <Skull size={40} />, color: '#FF7675', bg: '#FFE9E9' },
                                            trivia: { icon: <Lightbulb size={40} />, color: '#74B9FF', bg: '#E8F4FF' },
                                            // chess: { icon: <Crown size={40} />, color: '#2D3436', bg: '#F5F6FA' },
                                            memory: { icon: <Puzzle size={40} />, color: '#A29BFE', bg: '#F0EDFF' },
                                            tictactoe: { icon: <Activity size={40} />, color: '#FD79A8', bg: '#FFE9F5' },
                                            minesweeper: { icon: <Bomb size={40} />, color: '#E17055', bg: '#FFE9E3' },
                                            snake: { icon: <Activity size={40} />, color: '#55EFC4', bg: '#E5FFF8' },
                                            mathquiz: { icon: <Calculator size={40} />, color: '#74B9FF', bg: '#E8F4FF' },
                                            puzzles: { icon: <Puzzle size={40} />, color: '#94a3b8', bg: '#f1f5f9' }
                                        };

                                        const style = gameStyles[id] || { icon: <Gamepad2 size={40} />, color: '#6C5CE7', bg: '#F0EDFF' };

                                        return (
                                            <motion.div
                                                key={id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-white border-3 border-black rounded-3xl overflow-hidden neo-shadow group hover:translate-y-[-4px] transition-all"
                                            >
                                                {/* Header with Game Icon & Name */}
                                                <div className="p-6" style={{ backgroundColor: style.bg }}>
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                                            <div className="w-20 h-20 rounded-3xl border-3 border-black flex-shrink-0 flex items-center justify-center text-5xl bg-white shadow-[4px_4px_0px_rgba(0,0,0,0.15)]">
                                                                {style.icon}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <h3 className="font-header text-xl md:text-2xl font-black text-black uppercase tracking-tight leading-tight break-words pr-2">
                                                                    {config.name || id}
                                                                </h3>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleSaveGeneral(id)}
                                                            title="Save Settings"
                                                            className="p-3 rounded-xl border-2 border-black hover:translate-y-[-2px] transition-all bg-white shadow-[3px_3px_0px_rgba(0,0,0,1)]"
                                                            style={{ color: style.color }}
                                                        >
                                                            <Save size={20} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Stats Section */}
                                                <div className="p-6 space-y-4">
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 block" style={{ color: style.color, opacity: 0.6 }}>
                                                            Base Points
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={config.basePoints}
                                                            onChange={e => setSettings(p => ({ ...p, [id]: { ...p[id], basePoints: +e.target.value } }))}
                                                            className="w-full px-4 py-3 bg-[#FFFDF5] border-2 border-black/10 rounded-xl font-black text-3xl focus:border-black outline-none transition-all focus:bg-white"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 block" style={{ color: style.color, opacity: 0.6 }}>
                                                            Max Retries
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={config.maxRetries}
                                                            onChange={e => setSettings(p => ({ ...p, [id]: { ...p[id], maxRetries: +e.target.value } }))}
                                                            className="w-full px-4 py-3 bg-[#FFFDF5] border-2 border-black/10 rounded-xl font-black text-xl focus:border-black outline-none transition-all focus:bg-white"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="p-6 pt-0 flex gap-2">
                                                    <button
                                                        onClick={async () => {
                                                            const token = await user?.getIdToken();
                                                            await fetch('/api/games/game-of-the-day', {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                                                body: JSON.stringify({ gameId: id, gameName: config.name || id }),
                                                            });
                                                            fetchGameOfTheDay();
                                                            showAlert(`Set ${config.name} as GOTD!`, 'success');
                                                        }}
                                                        className="flex-1 px-3 py-2.5 bg-[#FFD93D] text-black font-black text-[10px] tracking-[0.15em] uppercase rounded-xl border-2 border-black hover:translate-y-[-2px] transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                                                    >
                                                        Set AS GOTD
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            const today = new Date().toISOString().slice(0, 10);
                                                            const schedule = { ...rotationPolicy?.rotationSchedule };
                                                            const todayGames = schedule[today] || [];
                                                            if (!todayGames.includes(id)) {
                                                                schedule[today] = [...todayGames, id];
                                                                setRotationPolicy(p => p ? { ...p, rotationSchedule: schedule } : null);
                                                                showAlert(`Added ${config.name} to Today's Games!`, 'success');
                                                            } else {
                                                                showAlert(`${config.name} is already active today.`, 'info');
                                                            }
                                                        }}
                                                        className="flex-1 px-3 py-2.5 bg-white text-black font-black text-[10px] tracking-[0.15em] uppercase rounded-xl border-2 border-black hover:translate-y-[-2px] transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                                                    >
                                                        ADD TO TODAY
                                                    </button>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {activeTab === 'rewards' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-white border-2 border-black p-8 rounded-[40px] neo-shadow h-fit">
                                    <div className="flex justify-between items-center mb-8">
                                        <h2 className="font-header text-3xl italic flex items-center gap-2"><Disc size={32} /> WHEEL ODDS</h2>
                                        <button
                                            onClick={() => setPrizes([...prizes, { id: `new_${Date.now()}`, type: 'JP', value: 10, label: '10 JP', probability: 0, color: '#000000' }])}
                                            className="p-3 bg-[#00B894] text-white rounded-xl border-2 border-black neo-shadow-sm"
                                        >
                                            <Plus size={20} />
                                        </button>
                                    </div>
                                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                        {prizes.map((p, i) => (
                                            <div key={p.id} className="flex items-center gap-2 md:gap-3 p-3 bg-[#FFFDF5] border-2 border-black/10 rounded-2xl">
                                                <input type="color" value={p.color} onChange={e => {
                                                    const n = [...prizes]; n[i].color = e.target.value; setPrizes(n);
                                                }} className="w-8 h-8 md:w-10 md:h-10 rounded-lg cursor-pointer p-0 border-2 border-black flex-shrink-0" />
                                                <input value={p.label} onChange={e => {
                                                    const n = [...prizes]; n[i].label = e.target.value; setPrizes(n);
                                                }} className="flex-1 bg-transparent font-bold text-sm outline-none px-2 min-w-0" />
                                                <input type="number" step="0.01" value={p.probability} onChange={e => {
                                                    const n = [...prizes]; n[i].probability = +e.target.value; setPrizes(n);
                                                }} className="w-14 md:w-16 bg-white border-2 border-black/10 rounded-lg px-2 py-1 font-bold text-xs flex-shrink-0" />
                                                <button onClick={() => setPrizes(prizes.filter((_, idx) => idx !== i))} className="text-red-400 p-1 flex-shrink-0"><Trash2 size={16} /></button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-8 pt-6 border-t-2 border-black/10 flex justify-between items-baseline">
                                        <span className="font-header italic text-xl">TOTAL PROBABILITY</span>
                                        <span className={`text-2xl font-black ${prizes.reduce((a, b) => a + (+b.probability), 0) === 1 ? 'text-green-500' : 'text-red-500'}`}>
                                            {prizes.reduce((a, b) => a + (+b.probability), 0).toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-white border-2 border-black p-8 rounded-[40px] neo-shadow">
                                    <h2 className="font-header text-3xl mb-6 italic text-[#6C5CE7] flex items-center gap-2"><Coins size={32} /> ECONOMY & POINTS</h2>

                                    {/* Store Economy Settings */}
                                    <div className="grid gap-6 mb-8 pb-8 border-b-2 border-dashed border-black/10">
                                        <div className="bg-[#FFFDF5] p-6 rounded-2xl border-2 border-black/5">
                                            <h4 className="font-black text-xs uppercase text-black/40 tracking-widest mb-4">GLOBAL STORE</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-black uppercase tracking-wider mb-2">Points Per ₹1 Spent</label>
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        value={storeSettings.pointsPerRupee}
                                                        onChange={e => setStoreSettings({ ...storeSettings, pointsPerRupee: +e.target.value })}
                                                        className="w-full p-3 border-2 border-black/10 rounded-xl font-bold text-sm bg-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black uppercase tracking-wider mb-2">Redeem Rate (₹ per point)</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={storeSettings.redeemRate}
                                                        onChange={e => setStoreSettings({ ...storeSettings, redeemRate: +e.target.value })}
                                                        className="w-full p-3 border-2 border-black/10 rounded-xl font-bold text-sm bg-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black uppercase tracking-wider mb-2">Max Redeem %</label>
                                                    <input
                                                        type="number"
                                                        value={storeSettings.maxRedeemPercent}
                                                        onChange={e => setStoreSettings({ ...storeSettings, maxRedeemPercent: +e.target.value })}
                                                        className="w-full p-3 border-2 border-black/10 rounded-xl font-bold text-sm bg-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black uppercase tracking-wider mb-2">First Time Bonus</label>
                                                    <input
                                                        type="number"
                                                        value={storeSettings.firstTimeBonusPoints}
                                                        onChange={e => setStoreSettings({ ...storeSettings, firstTimeBonusPoints: +e.target.value })}
                                                        className="w-full p-3 border-2 border-black/10 rounded-xl font-bold text-sm bg-white"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>


                                </div>
                                <button onClick={handleSaveRewards} className="w-full py-4 bg-[#6C5CE7] text-white font-black text-xl rounded-[30px] border-4 border-black neo-shadow-hover transition-all">
                                    SAVE ECONOMY & REWARDS
                                </button>
                            </div>
                        )}

                        {activeTab === 'xp-tiers' && (
                            <div className="space-y-8">
                                {!xpInitialized && (
                                    <div className="p-6 bg-[#FFD93D] border-4 border-black rounded-[30px] neo-shadow flex items-start gap-4">
                                        <AlertCircle className="w-8 h-8 flex-shrink-0" />
                                        <div>
                                            <h3 className="font-header text-xl">NOT INITIALIZED</h3>
                                            <p className="font-bold text-sm opacity-60">System not found in database. Save to initialize with defaults.</p>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                    {/* Tiers */}
                                    <div className="bg-white border-4 border-black p-8 rounded-[40px] neo-shadow">
                                        <h2 className="font-header text-3xl mb-8 flex items-center gap-3">
                                            <TrendingUp className="text-[#6C5CE7]" /> TIERS
                                        </h2>
                                        <div className="space-y-6">
                                            {tiers.map((t, i) => (
                                                <div key={i} className="p-6 bg-[#FFFDF5] border-2 border-black rounded-3xl relative">
                                                    <span className="absolute -top-3 left-6 px-3 py-1 bg-black text-white text-[10px] font-black rounded-full uppercase italic">TIER 0{i + 1}</span>
                                                    <div className="flex gap-4 items-center mb-4">
                                                        <div className="relative">
                                                            <input
                                                                type="text"
                                                                value={t.icon}
                                                                onChange={e => { const n = [...tiers]; n[i].icon = e.target.value; setTiers(n); }}
                                                                className="w-16 h-16 border-2 border-black/10 rounded-2xl bg-white flex items-center justify-center text-3xl text-center outline-none focus:border-[#6C5CE7] transition-all cursor-text"
                                                                maxLength={2}
                                                                placeholder="🎮"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <input value={t.name} onChange={e => { const n = [...tiers]; n[i].name = e.target.value; setTiers(n); }} className="w-full bg-transparent font-header text-2xl outline-none" />
                                                            <input value={t.perk} onChange={e => { const n = [...tiers]; n[i].perk = e.target.value; setTiers(n); }} className="w-full bg-transparent font-bold text-xs text-black/40 outline-none" placeholder="Perk details..." />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="text-[10px] font-black opacity-30 uppercase block mb-1">Min XP</label>
                                                            <input type="number" value={t.minXP} onChange={e => { const n = [...tiers]; n[i].minXP = +e.target.value; setTiers(n); }} className="w-full p-2 border-2 border-black/5 rounded-xl font-bold bg-white" />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-black opacity-30 uppercase block mb-1">JP Multiplier</label>
                                                            <input type="number" step="0.1" value={t.multiplier} onChange={e => { const n = [...tiers]; n[i].multiplier = +e.target.value; setTiers(n); }} className="w-full p-2 border-2 border-black/5 rounded-xl font-bold bg-white" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Sources */}
                                    <div className="space-y-6">
                                        <div className="bg-white border-4 border-black p-8 rounded-[40px] neo-shadow h-fit">
                                            <h2 className="font-header text-3xl mb-8 flex items-center gap-3">
                                                <Zap className="text-[#FFD93D]" /> XP SOURCES
                                            </h2>
                                            <div className="space-y-3">
                                                {xpSources.map((s, i) => (
                                                    <div key={i} className={`flex flex-col gap-4 p-4 rounded-3xl border-2 transition-all ${s.enabled ? 'border-black bg-[#FFFDF5]' : 'border-black/5 opacity-40'}`}>
                                                        <div className="flex items-center gap-3">
                                                            <input type="checkbox" checked={s.enabled} onChange={e => { const n = [...xpSources]; n[i].enabled = e.target.checked; setXPSources(n); }} className="w-5 h-5 accent-[#00B894]" />
                                                            <span className="flex-1 font-black text-xs uppercase tracking-wider">{s.name}</span>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="text-[10px] font-black opacity-30 uppercase block mb-1">Base XP</label>
                                                                <input type="number" value={s.baseXP} onChange={e => { const n = [...xpSources]; n[i].baseXP = +e.target.value; setXPSources(n); }} className="w-full p-2 bg-white border-2 border-black/10 rounded-xl text-center font-bold text-xs" />
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] font-black opacity-30 uppercase block mb-1">Base JP</label>
                                                                <input type="number" value={s.baseJP} onChange={e => { const n = [...xpSources]; n[i].baseJP = +e.target.value; setXPSources(n); }} className="w-full p-2 bg-white border-2 border-black/10 rounded-xl text-center font-bold text-xs" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <button onClick={handleSaveXP} className="w-full py-4 bg-[#6C5CE7] text-white font-black text-xl rounded-[30px] border-4 border-black neo-shadow-hover transition-all flex items-center justify-center gap-3">
                                            <Save size={24} /> SAVE XP SYSTEM
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'content' && (
                            <div className="space-y-8">
                                <div className="bg-white border-2 border-black p-8 rounded-[40px] neo-shadow">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                                        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 flex-1 w-full">
                                            {(['riddle', 'trivia', 'wordle', 'hangman', 'wordsearch', 'chess'] as GameType[]).map((game) => (
                                                <button
                                                    key={game}
                                                    onClick={() => setSelectedGame(game)}
                                                    className={`px-2 py-3 font-black text-[10px] uppercase rounded-xl border-2 transition-all ${selectedGame === game
                                                        ? 'bg-[#6C5CE7] text-white border-black neo-shadow-sm'
                                                        : 'bg-white text-black border-black/10 hover:border-black'
                                                        }`}
                                                >
                                                    {game}
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => setShowAddForm(!showAddForm)}
                                            className="whitespace-nowrap flex items-center gap-2 px-6 py-3 bg-[#00B894] text-white font-black text-xs uppercase rounded-xl border-2 border-black neo-shadow-sm hover:translate-y-[-2px] transition-all"
                                        >
                                            <Plus size={18} /> ADD ITEM
                                        </button>
                                    </div>

                                    {showAddForm && (
                                        <div className="mb-10 p-8 bg-[#FFFDF5] border-4 border-dashed border-black/10 rounded-[30px]">
                                            <h3 className="font-header text-xl mb-6">NEW {selectedGame.toUpperCase()} ENTRY</h3>
                                            {selectedGame === 'riddle' && (
                                                <div className="grid gap-4">
                                                    <input placeholder="Question" className="p-4 border-2 border-black rounded-2xl font-bold bg-white" value={newItem.question || ''} onChange={e => setNewItem({ ...newItem, question: e.target.value })} />
                                                    <input placeholder="Answer" className="p-4 border-2 border-black rounded-2xl font-bold bg-white" value={newItem.answer || ''} onChange={e => setNewItem({ ...newItem, answer: e.target.value })} />
                                                </div>
                                            )}
                                            {selectedGame === 'wordle' && (
                                                <input placeholder="5-Letter Word" className="p-4 border-2 border-black rounded-2xl font-bold bg-white w-full uppercase" maxLength={5} value={newItem.word || ''} onChange={e => setNewItem({ ...newItem, word: e.target.value.toUpperCase() })} />
                                            )}
                                            {/* Add other specific forms if desired, truncated for clarity */}
                                            <div className="flex flex-col sm:flex-row gap-4 mt-8">
                                                <button onClick={handleAddContent} className="px-8 py-3 bg-black text-white font-black text-xs uppercase rounded-xl w-full sm:w-auto">SAVE TO CLOUD</button>
                                                <button onClick={() => setShowAddForm(false)} className="px-8 py-3 bg-white text-black font-black text-xs uppercase rounded-xl border-2 border-black w-full sm:w-auto">CANCEL</button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {gameContent?.items ? gameContent.items.map((item: any) => (
                                            <div key={item.id} className="p-6 bg-[#FFFDF5] border-2 border-black/5 rounded-3xl group hover:border-black/20 transition-all flex justify-between items-center gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-black text-sm uppercase leading-tight mb-1 break-words">{item.question || item.word || item.theme}</p>
                                                    <span className="text-[10px] font-bold opacity-30 tracking-widest uppercase block truncate">ANS: {item.answer || item.solution || 'N/A'}</span>
                                                </div>
                                                <button onClick={() => handleDeleteContent(item.id)} className="p-3 text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 rounded-xl flex-shrink-0">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )) : (
                                            <div className="col-span-full py-20 text-center">
                                                <Database size={48} className="mx-auto mb-4 opacity-10" />
                                                <p className="font-black text-black/20 uppercase tracking-widest">No Content Found</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div >
    );
}
// Force rebuild - 01/16/2026 01:41:40
