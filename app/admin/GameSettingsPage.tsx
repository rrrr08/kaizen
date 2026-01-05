import { useEffect, useState } from 'react';

export default function GameSettingsPage() {
  const [settings, setSettings] = useState<any>({});
  const [gotd, setGotd] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/games/settings')
      .then(r => r.json())
      .then(data => {
        setSettings(data.settings || {});
        setGotd(data.gameOfTheDay || '');
        setLoading(false);
      });
  }, []);

  const handleSave = async (gameId: string, values: any) => {
    setMessage('');
    const res = await fetch('/api/games/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId, ...values }),
    });
    if (res.ok) setMessage('Saved!');
    else setMessage('Error saving');
  };

  const updateConfig = (gameId: string, updates: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [gameId]: {
        ...prev[gameId],
        ...updates
      }
    }));
  };

  const updateLevelConfig = (gameId: string, lv: string, key: string, value: number) => {
    setSettings((prev: any) => {
      const gameCfg = prev[gameId] || {};
      const levels = gameCfg.levels || {};
      return {
        ...prev,
        [gameId]: {
          ...gameCfg,
          levels: {
            ...levels,
            [lv]: {
              ...(levels[lv] || {}),
              [key]: value
            }
          }
        }
      };
    });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Game Points & Scratcher Settings</h2>
      {Object.entries(settings).map(([gameId, cfg]: [string, any]) => (
        <div key={gameId} className="mb-6 border p-4 rounded">
          <h3 className="font-semibold">{gameId}</h3>
          <form onSubmit={e => { e.preventDefault(); handleSave(gameId, cfg); }}>
            <label>Base Points: <input type="number" defaultValue={cfg.basePoints} max={10000} onChange={e => updateConfig(gameId, { basePoints: +e.target.value })} /></label><br />
            <label>Retry Penalty: <input type="number" defaultValue={cfg.retryPenalty} max={1000} onChange={e => updateConfig(gameId, { retryPenalty: +e.target.value })} /></label><br />
            {/* Level settings for sudoku */}
            {gameId === 'sudoku' && (
              <div className="mt-2">
                <label className="font-semibold">Level Settings:</label><br />
                {['easy', 'medium', 'hard'].map(lv => (
                  <div key={lv} className="ml-4 mb-1">
                    <span className="capitalize">{lv}:</span>
                    <label className="ml-2">Points: <input type="number" defaultValue={cfg.levels?.[lv]?.points || ''} max={10000} onChange={e => updateLevelConfig(gameId, lv, 'points', +e.target.value)} /></label>
                    <label className="ml-2">Retry Penalty: <input type="number" defaultValue={cfg.levels?.[lv]?.retryPenalty || ''} max={1000} onChange={e => updateLevelConfig(gameId, lv, 'retryPenalty', +e.target.value)} /></label>
                  </div>
                ))}
              </div>
            )}
            <label>Scratcher Enabled: <input type="checkbox" defaultChecked={cfg.scratcher?.enabled} onChange={e => updateConfig(gameId, { scratcher: { ...cfg.scratcher, enabled: e.target.checked } })} /></label><br />
            <label>Scratcher Drops (prob,points): <input type="text" defaultValue={JSON.stringify(cfg.scratcher?.drops || [])} onChange={e => updateConfig(gameId, { scratcher: { ...cfg.scratcher, drops: JSON.parse(e.target.value) } })} /></label><br />
            <button type="submit" className="mt-2 px-3 py-1 bg-blue-600 text-white rounded">Save</button>
          </form>
        </div>
      ))}
      <div className="mt-8">
        <h3 className="font-semibold">Game of the Day</h3>
        <input type="text" value={gotd} onChange={e => setGotd(e.target.value)} maxLength={50} className="border rounded px-2" />
        <button className="ml-2 px-3 py-1 bg-green-600 text-white rounded" onClick={async () => {
          await fetch('/api/games/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ gameId: gotd, gameOfTheDay: true }) });
          setMessage('Game of the Day set!');
        }}>Set</button>
      </div>
      {message && <div className="mt-4 text-green-700">{message}</div>}
    </div>
  );
}
