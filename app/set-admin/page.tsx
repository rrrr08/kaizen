'use client';

import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';

export default function SetAdminPage() {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSetAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/admin/set-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to set admin role');
        return;
      }

      setMessage(`✅ ${data.message}`);
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-28 pb-16">
      <div className="max-w-md mx-auto px-6">
        <div className="bg-slate-900 border border-amber-500/30 rounded-lg p-8">
          <h1 className="text-2xl font-bold text-amber-500 mb-2">Set Admin Role</h1>
          <p className="text-white/60 text-sm mb-6">
            Development tool to promote a user to admin (requires valid email)
          </p>

          <form onSubmit={handleSetAdmin} className="space-y-4">
            <div>
              <label className="block text-white/70 text-sm mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@joyjuncture.com"
                className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded text-white placeholder-white/40 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-amber-500 text-black font-bold rounded hover:bg-amber-400 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Setting Admin...' : 'Set as Admin'}
            </button>
          </form>

          {message && (
            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded text-green-400 text-sm">
              {message}
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-white/60 text-xs mb-3">Once set, refresh the page and check the navbar dropdown</p>
            <Link
              href="/"
              className="inline-block text-amber-500 hover:text-amber-400 text-sm font-header tracking-wider"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
