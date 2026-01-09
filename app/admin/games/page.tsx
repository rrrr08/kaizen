'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Settings, Plus, Star, Save, Zap, Info, ShieldAlert, Gift, RotateCcw, X } from 'lucide-react';

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

const PREDEFINED_GAMES = [
  { id: 'snake', name: 'Snake' },
  { id: 'minesweeper', name: 'Minesweeper' },
  { id: 'tango', name: 'Tango (Breakout)' },
  { id: '2048', name: '2048' },
  { id: 'wordle', name: 'Wordle' },
  { id: 'sudoku', name: 'Sudoku' },
];

export default function AdminGamesPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<AllSettings>({});
  const [gameOfTheDay, setGameOfTheDay] = useState<Record<string, any> | null>(null);
  const [rotationPolicy, setRotationPolicy] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [editingDropsGameId, setEditingDropsGameId] = useState<string | null>(null);
  const [tempDrops, setTempDrops] = useState<Array<{ prob: number; points: number; label?: string }>>([]);
  const [isDropsModalOpen, setIsDropsModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!authLoading && user && !isAdmin) {
      router.push('/');
    }
  }, [user, authLoading, isAdmin, router]);

  useEffect(() => {
    fetchSettings();
    fetchGameOfTheDay();
    fetchRotationPolicy();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/games/settings');
      const data = await res.json();
      setSettings(data.settings || {});
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGameOfTheDay = async () => {
    try {
      const res = await fetch('/api/games/game-of-the-day');
      const data = await res.json();
      setGameOfTheDay(data);
    } catch (error) {
      console.error('Error fetching game of the day:', error);
    }
  };

  const fetchRotationPolicy = async () => {
    try {
      const res = await fetch('/api/games/rotation-policy');
      const data = await res.json();
      setRotationPolicy(data);
    } catch (error) {
      console.error('Error fetching rotation policy:', error);
    }
  };

  const handleSaveGame = async (gameId: string) => {
    setSaving(true);
    setMessage('');
    try {
      const token = await user?.getIdToken();
      const res = await fetch('/api/games/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          gameId,
          ...settings[gameId],
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`✓ ${gameId} settings saved successfully!`);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`✗ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('✗ Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSetGameOfDay = async (gameId: string) => {
    setSaving(true);
    try {
      const token = await user?.getIdToken();
      const res = await fetch('/api/games/game-of-the-day', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          gameId,
          gameName: settings[gameId]?.name || gameId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`✓ ${gameId} set as Game of the Day!`);
        fetchGameOfTheDay();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('✗ Error setting game of the day');
    } finally {
      setSaving(false);
    }
  };

  const handleRandomizeGotD = async () => {
    const gameIds = Object.keys(settings);
    if (gameIds.length === 0) return;
    const randomGameId = gameIds[Math.floor(Math.random() * gameIds.length)];
    await handleSetGameOfDay(randomGameId);
  };

  const updateGameSetting = (gameId: string, field: string, value: unknown) => {
    setSettings(prev => ({
      ...prev,
      [gameId]: {
        ...prev[gameId],
        [field]: value,
      },
    }));
  };

  const addNewGameById = (gameId: string, name: string) => {
    if (settings[gameId]) return;
    setSettings(prev => ({
      ...prev,
      [gameId]: {
        name,
        basePoints: 100,
        retryPenalty: 10,
        maxRetries: 5,
        scratcher: {
          enabled: true,
          drops: [
            { prob: 0.1, points: 500, label: 'Super Lucky' },
            { prob: 0.3, points: 100, label: 'Lucky' },
            { prob: 0.6, points: 20, label: 'Small Bonus' }
          ]
        },
      },
    }));
  };

  const addNewGame = () => {
    const gameId = prompt('Enter new game ID (e.g., "mystery-game"):');
    if (gameId && !settings[gameId]) {
      addNewGameById(gameId.toLowerCase().replace(/\s+/g, '-'), gameId.charAt(0).toUpperCase() + gameId.slice(1));
    }
  };

  const handleSaveRotationPolicy = async () => {
    setSaving(true);
    setMessage('');
    try {
      const token = await user?.getIdToken();
      const res = await fetch('/api/games/rotation-policy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(rotationPolicy),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(' Rotation policy saved successfully!');
        fetchRotationPolicy();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(` Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(' Error saving rotation policy');
    } finally {
      setSaving(false);
    }
  };

  const handleManualRotation = async () => {
    setSaving(true);
    try {
      const token = await user?.getIdToken();
      const res = await fetch('/api/games/rotation-policy', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Games rotated successfully!');
        fetchRotationPolicy();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('Error rotating games');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-28 pb-16 bg-[#FFFDF5] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#FFD93D] border-t-black mb-4"></div>
          <p className="text-black/60 font-black text-xs tracking-[0.4em]">LOADING CONTROL CENTER...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen pt-28 pb-24 bg-[#FFFDF5]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header Section */}
        <div className="mb-16 pb-10 border-b-4 border-black flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#6C5CE7] p-2 rounded-lg border-2 border-black shadow-[2px_2px_0px_#000]">
                <Settings className="text-white" size={24} />
              </div>
              <span className="font-bold text-xs uppercase tracking-[0.4em] text-[#2D3436]/40">Admin Dashboard</span>
            </div>
            <h1 className="font-header text-6xl md:text-8xl tracking-tighter text-[#2D3436]">
              GAME <span className="text-[#6C5CE7]">MATRIX</span>
            </h1>
            <p className="text-[#2D3436]/50 font-bold text-xl mt-4 max-w-xl">
              Precision control over point economies, daily rotations, and reward distributions.
            </p>
          </div>

          <div className="flex flex-col gap-4 w-full md:w-auto">
            {message && (
              <div className={`px-6 py-4 rounded-2xl border-4 shadow-[4px_4px_0px_#000] animate-bounce ${message.includes('✓') ? 'bg-[#00B894] border-black text-white' : 'bg-[#FF7675] border-black text-white'
                }`}>
                <p className="font-black uppercase tracking-widest text-xs flex items-center gap-2">
                  {message.includes('✓') ? <Zap size={16} /> : <ShieldAlert size={16} />}
                  {message}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Global Controls Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Game of the Day Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-[#FFD93D] to-[#FF9F1C] border-4 border-black p-8 rounded-[40px] shadow-[12px_12px_0px_rgba(0,0,0,1)] flex flex-col justify-between overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-12 opacity-5 -rotate-12 group-hover:rotate-0 transition-transform duration-700">
              <Star size={180} fill="currentColor" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-black text-white p-1 rounded">
                  <Star size={16} fill="white" />
                </div>
                <h2 className="font-black text-xs uppercase tracking-[0.3em] text-[#2D3436]">Active Multiplier</h2>
              </div>

              {gameOfTheDay ? (
                <>
                  <h3 className="text-5xl font-black text-[#2D3436] uppercase tracking-tighter mb-2">
                    {gameOfTheDay.gameName || gameOfTheDay.gameId}
                  </h3>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl font-black text-xs tracking-widest uppercase mb-6">
                    2X EARNINGS ACTIVE
                  </div>
                  <p className="text-[#2D3436]/60 font-bold text-sm">Scheduled since: {gameOfTheDay.date}</p>
                </>
              ) : (
                <h3 className="text-4xl font-black text-[#2D3436]/40 uppercase tracking-tighter mb-8">NO ACTIVE MULTIPLIER</h3>
              )}
            </div>

            <div className="mt-10 flex gap-4">
              <button
                onClick={handleRandomizeGotD}
                disabled={saving}
                className="px-8 py-4 bg-black text-white font-black text-sm tracking-[0.2em] rounded-2xl hover:translate-y-[-4px] hover:shadow-[6px_6px_0px_rgba(0,0,0,0.3)] transition-all flex items-center gap-3 active:translate-y-0"
              >
                <RotateCcw size={18} /> RANDOMIZE GOTD
              </button>
            </div>
          </div>

          {/* Quick Stats/Rotation Policy */}
          <div className="bg-white border-4 border-black p-8 rounded-[40px] shadow-[12px_12px_0px_rgba(0,0,0,1)] flex flex-col">
            <div className="flex items-center gap-2 mb-8">
              <div className="bg-[#6C5CE7] text-white p-1 rounded">
                <RotateCcw size={16} />
              </div>
              <h2 className="font-black text-xs uppercase tracking-[0.3em] text-[#6C5CE7]">Daily Rotation</h2>
            </div>

            {rotationPolicy && (
              <div className="space-y-6 flex-1">
                <label className="flex items-center gap-4 cursor-pointer p-4 bg-[#FFFDF5] border-2 border-black rounded-2xl hover:bg-white transition-colors group">
                  <div className={`w-6 h-6 border-2 border-black rounded flex items-center justify-center transition-colors ${rotationPolicy.enabled ? 'bg-[#00B894]' : 'bg-white'}`}>
                    {rotationPolicy.enabled && <Plus size={14} className="text-white rotate-45" />}
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={rotationPolicy.enabled || false}
                    onChange={(e) => setRotationPolicy({ ...rotationPolicy, enabled: e.target.checked })}
                  />
                  <span className="font-black text-sm uppercase tracking-widest">Automation Active</span>
                </label>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="font-black text-[10px] text-black/40 uppercase tracking-widest">GAMES CAPACITY</label>
                    <span className="font-black text-[#6C5CE7]">{rotationPolicy.gamesPerDay || 5} Slots</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={rotationPolicy.gamesPerDay || 5}
                    onChange={(e) => setRotationPolicy({ ...rotationPolicy, gamesPerDay: parseInt(e.target.value) })}
                    className="w-full h-3 bg-[#f0f0f0] rounded-lg appearance-none cursor-pointer accent-[#6C5CE7]"
                  />
                </div>

                <div className="pt-4 border-t-2 border-black/5">
                  <button
                    onClick={handleSaveRotationPolicy}
                    disabled={saving}
                    className="w-full py-4 bg-[#6C5CE7] text-white font-black text-xs tracking-[0.3em] rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000] hover:translate-y-[-2px] active:translate-y-0 transition-all"
                  >
                    UPDATE RULES
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Add Section */}
        <div className="mb-16">
          <h2 className="font-black text-xs uppercase tracking-[0.4em] text-[#2D3436]/40 mb-6 flex items-center gap-3">
            <Plus size={16} /> Quick Integrate Support
          </h2>
          <div className="flex flex-wrap gap-4">
            {PREDEFINED_GAMES.map(g => (
              <button
                key={g.id}
                onClick={() => addNewGameById(g.id, g.name)}
                disabled={!!settings[g.id]}
                className={`px-6 py-4 rounded-2xl border-4 font-black text-sm tracking-widest transition-all flex items-center gap-3 ${settings[g.id]
                  ? 'bg-black/5 border-black/10 text-black/20 cursor-not-allowed'
                  : 'bg-white border-black text-black hover:translate-y-[-4px] hover:shadow-[6px_6px_0px_#000] active:translate-y-0'
                  }`}
              >
                {settings[g.id] ? 'ACTIVE' : `ADD ${g.name.toUpperCase()}`}
              </button>
            ))}
            <button
              onClick={addNewGame}
              className="px-6 py-4 bg-black text-white rounded-2xl border-4 border-black font-black text-sm tracking-widest hover:translate-y-[-4px] hover:shadow-[6px_6px_0px_rgba(0,0,0,0.5)] transition-all flex items-center gap-3"
            >
              <Plus size={20} /> CUSTOM GAME
            </button>
          </div>
        </div>

        {/* Individual Game Configs */}
        <div className="grid grid-cols-1 gap-12">
          {Object.entries(settings).map(([gameId, config]) => (
            <div key={gameId} className="bg-white border-4 border-black p-8 sm:p-12 rounded-[50px] shadow-[16px_16px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
              {/* Card Decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#6C5CE7]/5 rounded-bl-[100px] -z-1" />

              <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-12">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#6C5CE7]/10 text-[#6C5CE7] rounded-lg font-black text-[10px] tracking-widest uppercase mb-4 mb-2">
                    Engine ID: {gameId}
                  </div>
                  <h3 className="text-5xl font-black text-[#2D3436] uppercase tracking-tighter leading-none">{config.name || gameId}</h3>
                </div>

                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => handleSetGameOfDay(gameId)}
                    disabled={saving}
                    className="px-6 py-4 bg-[#FFD93D] text-black font-black text-xs tracking-[0.2em] border-4 border-black shadow-[4px_4px_0px_#000] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] transition-all rounded-2xl disabled:opacity-50"
                  >
                    FORCE GOTD
                  </button>
                  <button
                    onClick={() => handleSaveGame(gameId)}
                    disabled={saving}
                    className="px-8 py-4 bg-[#6C5CE7] text-white font-black text-sm tracking-[0.3em] border-4 border-black shadow-[4px_4px_0px_#000] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] transition-all rounded-2xl disabled:opacity-50 flex items-center gap-3"
                  >
                    <Save size={18} /> PUSH CONFIG
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {/* Basic Economy */}
                <div className="space-y-6 md:col-span-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-[#FFFDF5] p-6 rounded-3xl border-2 border-black/10">
                      <label className="block text-[#2D3436]/40 font-black text-[10px] tracking-widest mb-3 uppercase">Display Label</label>
                      <input
                        type="text"
                        value={config.name || ''}
                        onChange={(e) => updateGameSetting(gameId, 'name', e.target.value)}
                        className="w-full bg-transparent border-b-2 border-black font-black text-xl py-1 focus:outline-none focus:border-[#6C5CE7] transition-colors"
                      />
                    </div>

                    <div className="bg-[#FFFDF5] p-6 rounded-3xl border-2 border-black/10">
                      <label className="block text-[#2D3436]/40 font-black text-[10px] tracking-widest mb-3 uppercase">Yield Efficiency (Base Points)</label>
                      <div className="flex items-center gap-3">
                        <Zap size={20} className="text-[#00B894]" />
                        <input
                          type="number"
                          value={config.basePoints || 0}
                          onChange={(e) => updateGameSetting(gameId, 'basePoints', parseInt(e.target.value))}
                          className="w-full bg-transparent border-b-2 border-black font-black text-3xl py-1 focus:outline-none focus:border-[#6C5CE7]"
                        />
                      </div>
                    </div>

                    <div className="bg-[#FFFDF5] p-6 rounded-3xl border-2 border-black/10">
                      <label className="block text-[#2D3436]/40 font-black text-[10px] tracking-widest mb-3 uppercase">Friction Coeff (Penalty)</label>
                      <input
                        type="number"
                        value={config.retryPenalty || 0}
                        onChange={(e) => updateGameSetting(gameId, 'retryPenalty', parseInt(e.target.value))}
                        className="w-full bg-transparent border-b-2 border-black font-black text-xl py-1 focus:outline-none focus:border-[#FF7675]"
                      />
                    </div>

                    <div className="bg-[#FFFDF5] p-6 rounded-3xl border-2 border-black/10">
                      <label className="block text-[#2D3436]/40 font-black text-[10px] tracking-widest mb-3 uppercase">Saturation Limit (Max Retries)</label>
                      <input
                        type="number"
                        value={config.maxRetries || 0}
                        onChange={(e) => updateGameSetting(gameId, 'maxRetries', parseInt(e.target.value))}
                        className="w-full bg-transparent border-b-2 border-black font-black text-xl py-1 focus:outline-none focus:border-[#6C5CE7]"
                      />
                    </div>
                  </div>
                </div>

                {/* Reward Systems */}
                <div className="bg-[#2D3436] p-8 rounded-[40px] border-4 border-black text-white shadow-[8px_8px_0px_rgba(108,92,231,1)]">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <Gift size={24} className="text-[#FFD93D]" />
                      <span className="font-black uppercase tracking-widest text-sm">Reward Engine</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={config.scratcher?.enabled || false}
                        onChange={(e) => updateGameSetting(gameId, 'scratcher', { ...config.scratcher, enabled: e.target.checked })}
                      />
                      <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00B894]"></div>
                    </label>
                  </div>

                  <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-6 leading-relaxed">
                    Configure probability matrices for post-game loot drops.
                  </p>

                  {config.scratcher?.enabled ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-black text-white/40 uppercase">Economic Status</span>
                          <span className="text-[10px] font-black text-[#00B894] uppercase tracking-widest">Optimized</span>
                        </div>
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-[#00B894] w-[85%]" />
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setEditingDropsGameId(gameId);
                          setTempDrops(config.scratcher?.drops || []);
                          setIsDropsModalOpen(true);
                        }}
                        className="w-full py-3 bg-white/10 border-2 border-white/20 rounded-xl font-black text-[10px] tracking-[0.2em] transition-all hover:bg-white/20"
                      >
                        CONFIGURE MATRIX
                      </button>
                    </div>
                  ) : (
                    <div className="py-10 text-center border-2 border-white/10 border-dashed rounded-[30px]">
                      <Info size={32} className="mx-auto text-white/10 mb-2" />
                      <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Drops Disabled</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {Object.keys(settings).length === 0 && (
          <div className="text-center py-24 bg-white border-4 border-black border-dashed rounded-[60px]">
            <div className="bg-[#FFFDF5] w-24 h-24 rounded-full border-4 border-black flex items-center justify-center mx-auto mb-8 shadow-[8px_8px_0px_#000]">
              <Plus size={48} className="text-black/20" />
            </div>
            <h2 className="text-4xl font-black text-black uppercase tracking-tighter mb-4">SYSTEMS OFFLINE</h2>
            <p className="text-black/40 font-bold text-lg max-w-sm mx-auto">
              No game neural networks detected in the current matrix. Initiate first sequence to begin.
            </p>
          </div>
        )}
      </div>
      {/* Matrix Editor Modal */}
      {isDropsModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsDropsModalOpen(false)} />
          <div className="relative bg-white border-8 border-black p-8 rounded-[40px] shadow-[24px_24px_0px_#000] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-8 bg-black text-white inline-block px-4 py-1">Loot Matrix: {editingDropsGameId}</h2>

            <div className="space-y-4 mb-8">
              {tempDrops.map((drop, idx) => (
                <div key={idx} className="flex gap-4 items-end bg-gray-50 p-6 rounded-3xl border-2 border-black/5">
                  <div className="flex-1">
                    <label className="block text-[10px] font-black uppercase mb-2">Label</label>
                    <input
                      type="text"
                      value={drop.label || ''}
                      onChange={(e) => {
                        const newDrops = [...tempDrops];
                        newDrops[idx].label = e.target.value;
                        setTempDrops(newDrops);
                      }}
                      className="w-full border-b-2 border-black bg-transparent font-bold"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-[10px] font-black uppercase mb-2">Prob (0-1)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={drop.prob}
                      onChange={(e) => {
                        const newDrops = [...tempDrops];
                        newDrops[idx].prob = parseFloat(e.target.value);
                        setTempDrops(newDrops);
                      }}
                      className="w-full border-b-2 border-black bg-transparent font-bold"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-[10px] font-black uppercase mb-2">Points</label>
                    <input
                      type="number"
                      value={drop.points}
                      onChange={(e) => {
                        const newDrops = [...tempDrops];
                        newDrops[idx].points = parseInt(e.target.value);
                        setTempDrops(newDrops);
                      }}
                      className="w-full border-b-2 border-black bg-transparent font-bold"
                    />
                  </div>
                  <button
                    onClick={() => setTempDrops(tempDrops.filter((_, i) => i !== idx))}
                    className="p-2 bg-red-500 text-white rounded-lg border-2 border-black"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}

              <button
                onClick={() => setTempDrops([...tempDrops, { prob: 0.1, points: 100, label: 'New Drop' }])}
                className="w-full py-4 border-4 border-black border-dashed rounded-3xl font-black uppercase tracking-widest text-[#6C5CE7] hover:bg-[#6C5CE7]/5 transition-colors"
              >
                + ADD NEW ITEM TO MATRIX
              </button>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  if (editingDropsGameId) {
                    updateGameSetting(editingDropsGameId, 'scratcher', {
                      ...settings[editingDropsGameId].scratcher,
                      drops: tempDrops
                    });
                  }
                  setIsDropsModalOpen(false);
                }}
                className="flex-1 py-4 bg-[#00B894] text-white border-4 border-black rounded-2xl font-black uppercase tracking-widest shadow-[4px_4px_0px_#000] hover:translate-y-[-2px] transition-all"
              >
                APPLY TO ENGINE
              </button>
              <button
                onClick={() => setIsDropsModalOpen(false)}
                className="px-8 py-4 bg-gray-200 border-4 border-black rounded-2xl font-black uppercase tracking-widest"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
