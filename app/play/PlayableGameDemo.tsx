import { useState } from 'react';
import { awardGamePoints } from '@/lib/gameApi';

export default function PlayableGameDemo() {
  const [status, setStatus] = useState<'idle' | 'won' | 'lost' | 'loading'>('idle');
  const [points, setPoints] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [retry, setRetry] = useState(0);

  // Simulate a simple win/loss game
  const playGame = () => {
    setStatus('loading');
    setTimeout(() => {
      const win = Math.random() > 0.5;
      setStatus(win ? 'won' : 'lost');
      setMessage(win ? 'You won! Claim your points.' : 'Try again!');
    }, 700);
  };

  const claimPoints = async () => {
    setMessage('');
    setStatus('loading');
    const result = await awardGamePoints({
      gameId: 'demoGame',
      retry
    });

    if (result.success) {
      setPoints(result.awardedPoints || 0);
      setMessage(`You received ${result.awardedPoints} points!${result.message?.includes('Game of the Day') ? ' (Game of the Day!)' : ''}`);
    } else {
      setMessage(result.error || 'Error awarding points');
    }
    setStatus('idle');
    setRetry(r => r + 1);
  };

  return (
    <div className="p-6 max-w-md mx-auto text-center">
      <h2 className="text-xl font-bold mb-4">Playable Game Demo</h2>
      <button className="px-4 py-2 bg-indigo-600 text-white rounded" onClick={playGame} disabled={status === 'loading'}>Play</button>
      {status === 'won' && <button className="ml-4 px-4 py-2 bg-green-600 text-white rounded" onClick={claimPoints}>Claim Points</button>}
      <div className="mt-4 text-lg">{message}</div>
      {points !== null && <div className="mt-2 text-2xl font-bold">Total Points: {points}</div>}
      <div className="mt-2 text-sm text-gray-500">Retries: {retry}</div>
    </div>
  );
}
