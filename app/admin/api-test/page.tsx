'use client';

import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { usePopup } from '@/app/context/PopupContext';
import { Play, CheckCircle, XCircle, Loader } from 'lucide-react';

interface TestResult {
  name: string;
  method: string;
  url: string;
  status: 'pending' | 'success' | 'error';
  statusCode?: number;
  response?: Record<string, unknown>;
  error?: string;
}

export default function APITestPage() {
  const { user } = useAuth();
  const { showAlert } = usePopup();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const endpoints = [
    { name: 'Get Game Settings', method: 'GET', url: '/api/games/settings', auth: false },
    { name: 'Get Game of the Day', method: 'GET', url: '/api/games/game-of-the-day', auth: false },
    { name: 'Get Rotation Policy', method: 'GET', url: '/api/games/rotation-policy', auth: false },
    { name: 'Get Riddle Content', method: 'GET', url: '/api/games/content?gameId=riddle', auth: false },
    { name: 'Get Trivia Content', method: 'GET', url: '/api/games/content?gameId=trivia', auth: false },
    { name: 'Get Wordle Content', method: 'GET', url: '/api/games/content?gameId=wordle', auth: false },
    { name: 'Get Hangman Content', method: 'GET', url: '/api/games/content?gameId=hangman', auth: false },
    { name: 'Get Word Search Content', method: 'GET', url: '/api/games/content?gameId=wordsearch', auth: false },
    { name: 'Get Chess Content', method: 'GET', url: '/api/games/content?gameId=chess', auth: false },
    { name: 'Get Upcoming Events', method: 'GET', url: '/api/events?status=upcoming', auth: false },
    { name: 'Get Past Events', method: 'GET', url: '/api/events?status=past', auth: false },
    { name: 'Get Game History (Auth)', method: 'GET', url: '/api/games/history?gameId=riddle', auth: true },
  ];

  const runTests = async () => {
    if (!user) {
      await showAlert('Please log in first!', 'warning');
      return;
    }

    setTesting(true);
    const testResults: TestResult[] = [];

    for (const endpoint of endpoints) {
      const result: TestResult = {
        name: endpoint.name,
        method: endpoint.method,
        url: endpoint.url,
        status: 'pending',
      };

      try {
        const options: RequestInit = {
          method: endpoint.method,
          headers: {
            'Content-Type': 'application/json',
          },
        };

        if (endpoint.auth) {
          const token = await user.getIdToken();
          options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
          };
        }

        const response = await fetch(endpoint.url, options);
        const data = await response.json();

        result.response = data;
        result.status = response.ok ? 'success' : 'error';
        result.error = response.ok ? undefined : data.error || 'Request failed';
      } catch (error: unknown) {
        result.status = 'error';
        result.error = error instanceof Error ? error.message : 'An unknown error occurred';
      }

      testResults.push(result);
      setResults([...testResults]);

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    setTesting(false);
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const successRate = results.length > 0 ? ((successCount / results.length) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen pt-28 pb-16 bg-[#FFFDF5]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="mb-12 border-b-2 border-black pb-8">
          <h1 className="font-header text-5xl md:text-7xl tracking-tighter mb-4 text-[#2D3436]">
            API <span className="text-[#6C5CE7]">TESTING</span>
          </h1>
          <p className="text-black/70 font-bold text-lg">
            Test all game-related API endpoints
          </p>
        </div>

        {/* Test Controls */}
        <div className="bg-white border-2 border-black p-8 rounded-[30px] neo-shadow mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-header text-2xl text-black mb-2">Endpoint Tests</h2>
              <p className="text-black/60 text-sm font-bold">
                {endpoints.length} endpoints will be tested
              </p>
            </div>
            <button
              onClick={runTests}
              disabled={testing || !user}
              className="flex items-center gap-2 px-8 py-4 bg-[#6C5CE7] text-white font-black text-lg uppercase tracking-widest rounded-xl border-2 border-black neo-shadow hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {testing ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  TESTING...
                </>
              ) : (
                <>
                  <Play size={20} />
                  RUN TESTS
                </>
              )}
            </button>
          </div>

          {/* Summary */}
          {results.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-[#FFFDF5] border-2 border-black/10 rounded-xl">
              <div>
                <p className="text-black/60 text-xs font-bold uppercase tracking-wide mb-1">Total</p>
                <p className="text-3xl font-black text-black">{results.length}</p>
              </div>
              <div>
                <p className="text-black/60 text-xs font-bold uppercase tracking-wide mb-1">Passed</p>
                <p className="text-3xl font-black text-green-600">{successCount}</p>
              </div>
              <div>
                <p className="text-black/60 text-xs font-bold uppercase tracking-wide mb-1">Failed</p>
                <p className="text-3xl font-black text-red-600">{errorCount}</p>
              </div>
              <div>
                <p className="text-black/60 text-xs font-bold uppercase tracking-wide mb-1">Success Rate</p>
                <p className="text-3xl font-black text-[#6C5CE7]">{successRate}%</p>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="bg-white border-2 border-black p-8 rounded-[30px] neo-shadow">
            <h2 className="font-header text-2xl text-black mb-6">Test Results</h2>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 border-2 rounded-xl transition-all ${result.status === 'success'
                      ? 'bg-green-50 border-green-500'
                      : result.status === 'error'
                        ? 'bg-red-50 border-red-500'
                        : 'bg-gray-50 border-gray-300'
                    }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {result.status === 'success' && (
                        <CheckCircle className="text-green-600" size={20} />
                      )}
                      {result.status === 'error' && (
                        <XCircle className="text-red-600" size={20} />
                      )}
                      {result.status === 'pending' && (
                        <Loader className="text-gray-400 animate-spin" size={20} />
                      )}
                      <div>
                        <h3 className="font-bold text-black">{result.name}</h3>
                        <p className="text-xs text-black/60 font-mono">
                          {result.method} {result.url}
                        </p>
                      </div>
                    </div>
                    {result.statusCode && (
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-black ${result.status === 'success'
                            ? 'bg-green-600 text-white'
                            : 'bg-red-600 text-white'
                          }`}
                      >
                        {result.statusCode}
                      </span>
                    )}
                  </div>
                  {result.error && (
                    <div className="mt-2 p-3 bg-red-100 border border-red-300 rounded-lg">
                      <p className="text-xs text-red-800 font-bold">Error: {result.error}</p>
                    </div>
                  )}
                  {result.response && result.status === 'success' && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs text-black/60 font-bold hover:text-black">
                        View Response
                      </summary>
                      <pre className="mt-2 p-3 bg-black/5 rounded-lg text-xs overflow-x-auto">
                        {JSON.stringify(result.response, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        {results.length === 0 && !testing && (
          <div className="bg-white border-2 border-black p-8 rounded-[30px] neo-shadow text-center">
            <p className="text-black/60 font-bold mb-4">
              Click &quot;RUN TESTS&quot; to test all API endpoints
            </p>
            <p className="text-black/40 text-sm">
              Make sure you&apos;re logged in as an admin
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
