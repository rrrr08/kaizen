'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

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

export default function AdminGamesPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<AllSettings>({});
  const [gameOfTheDay, setGameOfTheDay] = useState<Record<string, any> | null>(null);
  const [rotationPolicy, setRotationPolicy] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

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

  const addNewGame = () => {
    const gameId = prompt('Enter new game ID (e.g., "wordle", "chess"):');
    if (gameId && !settings[gameId]) {
      setSettings(prev => ({
        ...prev,
        [gameId]: {
          name: gameId.charAt(0).toUpperCase() + gameId.slice(1),
          basePoints: 10,
          retryPenalty: 2,
          maxRetries: 3,
          scratcher: { enabled: false },
        },
      }));
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
          <p className="text-black/60 font-black text-xs tracking-[0.4em]">LOADING...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen pt-28 pb-16 bg-[#FFFDF5]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="mb-12 border-b-2 border-black pb-8">
          <h1 className="font-header text-5xl md:text-7xl tracking-tighter mb-4 text-[#2D3436]">
            GAME <span className="text-[#6C5CE7]">SETTINGS</span>
          </h1>
          <p className="text-black/70 font-bold text-lg">
            Configure points, retries, and rewards for each game
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl border-2 ${message.startsWith('✓') ? 'bg-green-100 border-green-500 text-green-800' : 'bg-red-100 border-red-500 text-red-800'}`}>
            <p className="font-bold">{message}</p>
          </div>
        )}

        {/* Game of the Day */}
        {gameOfTheDay && (
          <div className="mb-12 bg-gradient-to-r from-[#FFD93D] to-[#FF7675] border-2 border-black p-8 rounded-[30px] neo-shadow">
            <h2 className="font-header text-2xl mb-2 text-black"> GAME OF THE DAY</h2>
            <p className="text-black/80 font-bold text-lg">
              {gameOfTheDay.gameName || gameOfTheDay.gameId} - <span className="text-white">2x Points!</span>
            </p>
            <p className="text-black/60 text-sm mt-2">Date: {gameOfTheDay.date}</p>
            <button
              onClick={handleRandomizeGotD}
              disabled={saving}
              className="mt-4 px-4 py-2 bg-black text-white font-black text-xs tracking-[0.2em] hover:bg-black/80 transition-colors rounded-lg disabled:opacity-50"
            >
              RANDOMIZE
            </button>
          </div>
        )}
        {!gameOfTheDay && (
          <div className="mb-12">
            <button
              onClick={handleRandomizeGotD}
              disabled={saving}
              className="px-6 py-3 bg-[#FF7675] text-black font-black text-sm tracking-[0.2em] border-2 border-black shadow-[4px_4px_0px_#000] hover:translate-y-1 hover:shadow-none transition-all rounded-xl disabled:opacity-50"
            >
              SET RANDOM GAM OF THE DAY
            </button>
          </div>
        )}

        {/* Rotation Policy */}
        {rotationPolicy && (
          <div className="mb-12 bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] border-2 border-black p-8 rounded-[30px] neo-shadow">
            <h2 className="font-header text-2xl mb-4 text-white"> DAILY ROTATION POLICY</h2>
            <p className="text-white/90 font-bold text-sm mb-6">
              Control which games appear on the play page each day
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="flex items-center gap-3 cursor-pointer mb-4">
                  <input
                    type="checkbox"
                    checked={rotationPolicy.enabled || false}
                    onChange={(e) => setRotationPolicy({ ...rotationPolicy, enabled: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <span className="text-white font-bold text-sm">Enable Daily Rotation</span>
                </label>

                <label className="block text-white/80 font-bold text-xs tracking-widest mb-2">GAMES PER DAY</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={rotationPolicy.gamesPerDay || 5}
                  onChange={(e) => setRotationPolicy({ ...rotationPolicy, gamesPerDay: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border-2 border-white/20 bg-white/10 text-white rounded-lg focus:border-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-white/80 font-bold text-xs tracking-widest mb-2">LAST ROTATION</label>
                <p className="text-white font-bold text-lg">{rotationPolicy.lastRotation || 'Never'}</p>
                <button
                  onClick={handleManualRotation}
                  disabled={saving}
                  className="mt-4 px-4 py-2 bg-white text-[#6C5CE7] font-black text-xs tracking-[0.2em] border-2 border-black shadow-[2px_2px_0px_#000] hover:translate-y-1 hover:shadow-none transition-all rounded-lg disabled:opacity-50"
                >
                  ROTATE NOW
                </button>
              </div>
            </div>

            {rotationPolicy.rotationSchedule && (
              <div className="bg-white/10 border-2 border-white/20 p-4 rounded-xl mb-4">
                <p className="text-white/80 font-bold text-xs tracking-widest mb-2">TODAY&apos;S GAMES</p>
                <div className="flex flex-wrap gap-2">
                  {(rotationPolicy.rotationSchedule[new Date().toISOString().slice(0, 10)] || []).map((gameId: string) => (
                    <span key={gameId} className="px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full">
                      {settings[gameId]?.name || gameId}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleSaveRotationPolicy}
              disabled={saving}
              className="px-6 py-3 bg-white text-[#6C5CE7] font-black text-xs tracking-[0.3em] border-2 border-black shadow-[4px_4px_0px_#000] hover:translate-y-1 hover:shadow-none transition-all rounded-xl disabled:opacity-50"
            >
              SAVE ROTATION POLICY
            </button>
          </div>
        )}

        {/* Add New Game Button */}
        <div className="mb-8">
          <button
            onClick={addNewGame}
            className="px-6 py-3 bg-[#00B894] text-white font-black text-sm tracking-[0.3em] border-2 border-black shadow-[4px_4px_0px_#000] hover:translate-y-1 hover:shadow-none transition-all rounded-xl"
          >
            + ADD NEW GAME
          </button>
        </div>

        {/* Games List */}
        <div className="space-y-6">
          {Object.entries(settings).map(([gameId, config]) => (
            <div key={gameId} className="bg-white border-2 border-black p-8 rounded-[30px] neo-shadow">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-header text-2xl text-black mb-2">{config.name || gameId}</h3>
                  <p className="text-black/40 font-bold text-xs tracking-widest">ID: {gameId}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleSetGameOfDay(gameId)}
                    disabled={saving}
                    className="px-4 py-2 bg-[#FFD93D] text-black font-black text-xs tracking-[0.2em] border-2 border-black shadow-[2px_2px_0px_#000] hover:translate-y-1 hover:shadow-none transition-all rounded-lg disabled:opacity-50"
                  >
                    SET AS GOTD
                  </button>
                  <button
                    onClick={() => handleSaveGame(gameId)}
                    disabled={saving}
                    className="px-6 py-2 bg-[#6C5CE7] text-white font-black text-xs tracking-[0.2em] border-2 border-black shadow-[2px_2px_0px_#000] hover:translate-y-1 hover:shadow-none transition-all rounded-lg disabled:opacity-50"
                  >
                    SAVE
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-black/60 font-bold text-xs tracking-widest mb-2">GAME NAME</label>
                  <input
                    type="text"
                    value={config.name || ''}
                    onChange={(e) => updateGameSetting(gameId, 'name', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-black/20 rounded-lg focus:border-[#6C5CE7] focus:outline-none"
                  />
                </div>

                {/* Base Points */}
                <div>
                  <label className="block text-black/60 font-bold text-xs tracking-widest mb-2">BASE POINTS</label>
                  <input
                    type="number"
                    value={config.basePoints || 0}
                    onChange={(e) => updateGameSetting(gameId, 'basePoints', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border-2 border-black/20 rounded-lg focus:border-[#6C5CE7] focus:outline-none"
                  />
                </div>

                {/* Retry Penalty */}
                <div>
                  <label className="block text-black/60 font-bold text-xs tracking-widest mb-2">RETRY PENALTY (points deducted per retry)</label>
                  <input
                    type="number"
                    value={config.retryPenalty || 0}
                    onChange={(e) => updateGameSetting(gameId, 'retryPenalty', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border-2 border-black/20 rounded-lg focus:border-[#6C5CE7] focus:outline-none"
                  />
                </div>

                {/* Max Retries */}
                <div>
                  <label className="block text-black/60 font-bold text-xs tracking-widest mb-2">MAX RETRIES</label>
                  <input
                    type="number"
                    value={config.maxRetries || 0}
                    onChange={(e) => updateGameSetting(gameId, 'maxRetries', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border-2 border-black/20 rounded-lg focus:border-[#6C5CE7] focus:outline-none"
                  />
                </div>

                {/* Scratcher Enabled */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.scratcher?.enabled || false}
                      onChange={(e) => updateGameSetting(gameId, 'scratcher', { ...config.scratcher, enabled: e.target.checked })}
                      className="w-5 h-5"
                    />
                    <span className="text-black/80 font-bold text-sm">Enable Scratcher (random bonus points)</span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>

        {Object.keys(settings).length === 0 && (
          <div className="text-center py-12">
            <p className="text-black/40 font-black text-lg">NO GAMES CONFIGURED</p>
            <p className="text-black/60 text-sm mt-2">Click &quot;Add New Game&quot; to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
