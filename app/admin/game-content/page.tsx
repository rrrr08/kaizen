'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { usePopup } from '@/app/context/PopupContext';
import { Plus, Trash2, Edit2 } from 'lucide-react';

type GameType = 'riddle' | 'trivia' | 'wordle' | 'hangman' | 'wordsearch' | 'chess';

export default function GameContentPage() {
  const { user } = useAuth();
  const { showConfirm } = usePopup();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedGame, setSelectedGame] = useState<GameType>('riddle');
  const [gameContent, setGameContent] = useState<Record<string, any> | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState<Record<string, any>>({});

  useEffect(() => {
    if (selectedGame) {
      fetchGameContent(selectedGame);
    }
  }, [selectedGame]);

  const fetchGameContent = async (gameId: string) => {
    try {
      const response = await fetch(`/api/games/content?gameId=${gameId}`);
      if (response.ok) {
        const data = await response.json();
        setGameContent(data.content);
      } else {
        setGameContent(null);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      setGameContent(null);
    }
  };

  const initializeContent = async () => {
    if (!user) {
      setMessage('❌ Please log in first');
      return;
    }

    setLoading(true);
    setMessage('Initializing game content...');

    try {
      const token = await user.getIdToken();

      const response = await fetch('/api/games/content/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ Success! Initialized content for: ${data.gamesInitialized.join(', ')}`);
        fetchGameContent(selectedGame);
      } else {
        setMessage(`❌ Error: ${data.error || 'Failed to initialize'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('❌ Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const token = await user.getIdToken();
      const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
      const updatedItems = [...(gameContent?.items || []), { ...newItem, id: `${selectedGame}_${Date.now()}_${randomSuffix}` }];

      const response = await fetch('/api/games/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          gameId: selectedGame,
          content: { items: updatedItems }
        })
      });

      if (response.ok) {
        setMessage('✅ Item added successfully!');
        setShowAddForm(false);
        setNewItem({});
        fetchGameContent(selectedGame);
      } else {
        setMessage('❌ Failed to add item');
      }
    } catch (error) {
      setMessage('❌ Network error');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!user) return;
    const confirmed = await showConfirm('Delete this item?', 'Delete Item');
    if (!confirmed) return;

    setLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/games/content?gameId=${selectedGame}&itemId=${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessage('✅ Item deleted successfully!');
        fetchGameContent(selectedGame);
      } else {
        setMessage('❌ Failed to delete item');
      }
    } catch (error) {
      setMessage('❌ Network error');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const renderAddForm = () => {
    switch (selectedGame) {
      case 'riddle':
        return (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Question"
              value={newItem.question || ''}
              onChange={(e) => setNewItem({ ...newItem, question: e.target.value })}
              className="w-full px-4 py-2 border-2 border-black/20 rounded-lg focus:border-[#6C5CE7] focus:outline-none"
            />
            <input
              type="text"
              placeholder="Answer"
              value={newItem.answer || ''}
              onChange={(e) => setNewItem({ ...newItem, answer: e.target.value })}
              className="w-full px-4 py-2 border-2 border-black/20 rounded-lg focus:border-[#6C5CE7] focus:outline-none"
            />
            <input
              type="text"
              placeholder="Hint"
              value={newItem.hint || ''}
              onChange={(e) => setNewItem({ ...newItem, hint: e.target.value })}
              className="w-full px-4 py-2 border-2 border-black/20 rounded-lg focus:border-[#6C5CE7] focus:outline-none"
            />
          </div>
        );
      case 'trivia':
        return (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Question"
              value={newItem.question || ''}
              onChange={(e) => setNewItem({ ...newItem, question: e.target.value })}
              className="w-full px-4 py-2 border-2 border-black/20 rounded-lg focus:border-[#6C5CE7] focus:outline-none"
            />
            <input
              type="text"
              placeholder="Options (comma separated)"
              value={newItem.options?.join(', ') || ''}
              onChange={(e) => setNewItem({ ...newItem, options: e.target.value.split(',').map((s) => s.trim()) })}
              className="w-full px-4 py-2 border-2 border-black/20 rounded-lg focus:border-[#6C5CE7] focus:outline-none"
            />
            <input
              type="number"
              placeholder="Correct option index (0-3)"
              value={newItem.correct || 0}
              onChange={(e) => setNewItem({ ...newItem, correct: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border-2 border-black/20 rounded-lg focus:border-[#6C5CE7] focus:outline-none"
            />
            <input
              type="text"
              placeholder="Category"
              value={newItem.category || ''}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              className="w-full px-4 py-2 border-2 border-black/20 rounded-lg focus:border-[#6C5CE7] focus:outline-none"
            />
          </div>
        );
      case 'wordle':
        return (
          <input
            type="text"
            placeholder="5-letter word (uppercase)"
            maxLength={5}
            value={newItem.word || ''}
            onChange={(e) => setNewItem({ ...newItem, word: e.target.value.toUpperCase() })}
            className="w-full px-4 py-2 border-2 border-black/20 rounded-lg focus:border-[#6C5CE7] focus:outline-none"
          />
        );
      case 'hangman':
        return (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Word (uppercase)"
              value={newItem.word || ''}
              onChange={(e) => setNewItem({ ...newItem, word: e.target.value.toUpperCase() })}
              className="w-full px-4 py-2 border-2 border-black/20 rounded-lg focus:border-[#6C5CE7] focus:outline-none"
            />
            <input
              type="text"
              placeholder="Category"
              value={newItem.category || ''}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              className="w-full px-4 py-2 border-2 border-black/20 rounded-lg focus:border-[#6C5CE7] focus:outline-none"
            />
          </div>
        );
      case 'wordsearch':
        return (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Words (comma separated)"
              value={newItem.words?.join(', ') || ''}
              onChange={(e) => setNewItem({ ...newItem, words: e.target.value.split(',').map((s: string) => s.trim().toUpperCase()) })}
              className="w-full px-4 py-2 border-2 border-black/20 rounded-lg focus:border-[#6C5CE7] focus:outline-none"
            />
            <input
              type="text"
              placeholder="Theme"
              value={newItem.theme || ''}
              onChange={(e) => setNewItem({ ...newItem, theme: e.target.value })}
              className="w-full px-4 py-2 border-2 border-black/20 rounded-lg focus:border-[#6C5CE7] focus:outline-none"
            />
          </div>
        );
      case 'chess':
        return (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="FEN notation"
              value={newItem.fen || ''}
              onChange={(e) => setNewItem({ ...newItem, fen: e.target.value })}
              className="w-full px-4 py-2 border-2 border-black/20 rounded-lg focus:border-[#6C5CE7] focus:outline-none"
            />
            <input
              type="text"
              placeholder="Solution (e.g., Qxf7#)"
              value={newItem.solution || ''}
              onChange={(e) => setNewItem({ ...newItem, solution: e.target.value })}
              className="w-full px-4 py-2 border-2 border-black/20 rounded-lg focus:border-[#6C5CE7] focus:outline-none"
            />
            <input
              type="text"
              placeholder="Difficulty"
              value={newItem.difficulty || ''}
              onChange={(e) => setNewItem({ ...newItem, difficulty: e.target.value })}
              className="w-full px-4 py-2 border-2 border-black/20 rounded-lg focus:border-[#6C5CE7] focus:outline-none"
            />
          </div>
        );
    }
  };

  const renderContentItem = (item: Record<string, any>) => {
    switch (selectedGame) {
      case 'riddle':
        return (
          <div>
            <p className="font-bold text-black">{item.question}</p>
            <p className="text-sm text-black/60">Answer: {item.answer}</p>
            <p className="text-xs text-black/40">Hint: {item.hint}</p>
          </div>
        );
      case 'trivia':
        return (
          <div>
            <p className="font-bold text-black">{item.question}</p>
            <p className="text-sm text-black/60">Category: {item.category}</p>
            <p className="text-xs text-black/40">Answer: {item.options?.[item.correct]}</p>
          </div>
        );
      case 'wordle':
        return <p className="font-bold text-black text-2xl tracking-widest">{item.word}</p>;
      case 'hangman':
        return (
          <div>
            <p className="font-bold text-black text-xl">{item.word}</p>
            <p className="text-sm text-black/60">{item.category}</p>
          </div>
        );
      case 'wordsearch':
        return (
          <div>
            <p className="font-bold text-black">{item.theme}</p>
            <p className="text-sm text-black/60">{item.words?.join(', ')}</p>
          </div>
        );
      case 'chess':
        return (
          <div>
            <p className="text-xs text-black/60 font-mono">{item.fen}</p>
            <p className="text-sm text-black">Solution: {item.solution}</p>
            <p className="text-xs text-black/40">{item.difficulty}</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-16 bg-[#FFFDF5]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="mb-12 border-b-2 border-black pb-8">
          <h1 className="font-header text-5xl md:text-7xl tracking-tighter mb-4 text-[#2D3436]">
            GAME <span className="text-[#6C5CE7]">CONTENT</span>
          </h1>
          <p className="text-black/70 font-bold text-lg">
            Manage content for all games
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl border-2 ${message.startsWith('✅')
            ? 'bg-green-100 border-green-500 text-green-800'
            : message.startsWith('❌')
              ? 'bg-red-100 border-red-500 text-red-800'
              : 'bg-blue-100 border-blue-500 text-blue-800'
            }`}>
            <p className="font-bold">{message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Initialize Card */}
          <div className="bg-white border-2 border-black p-6 rounded-[30px] neo-shadow">
            <h2 className="font-header text-xl mb-4 text-black">🚀 Quick Start</h2>
            <p className="text-sm text-black/70 mb-4">Initialize default content for all games</p>
            <button
              onClick={initializeContent}
              disabled={loading}
              className="w-full px-6 py-3 bg-[#6C5CE7] text-white font-black text-sm uppercase tracking-widest rounded-xl border-2 border-black neo-shadow hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none disabled:opacity-50 transition-all"
            >
              {loading ? 'LOADING...' : 'INITIALIZE'}
            </button>
          </div>

          {/* Game Selector */}
          <div className="lg:col-span-2 bg-white border-2 border-black p-6 rounded-[30px] neo-shadow">
            <h2 className="font-header text-xl mb-4 text-black">📝 Select Game</h2>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {(['riddle', 'trivia', 'wordle', 'hangman', 'wordsearch', 'chess'] as GameType[]).map((game) => (
                <button
                  key={game}
                  onClick={() => setSelectedGame(game)}
                  className={`px-4 py-2 font-bold text-xs uppercase rounded-lg border-2 transition-all ${selectedGame === game
                    ? 'bg-[#6C5CE7] text-white border-black'
                    : 'bg-white text-black border-black/20 hover:border-black'
                    }`}
                >
                  {game}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Management */}
        <div className="mt-8 bg-white border-2 border-black p-8 rounded-[30px] neo-shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-header text-2xl text-black">{selectedGame.toUpperCase()} Content</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2 bg-[#00B894] text-white font-black text-xs uppercase rounded-lg border-2 border-black shadow-[2px_2px_0px_#000] hover:translate-y-1 hover:shadow-none transition-all"
            >
              <Plus size={16} /> ADD NEW
            </button>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <div className="mb-6 p-6 bg-[#FFFDF5] border-2 border-black/20 rounded-xl">
              <h3 className="font-bold text-black mb-4">Add New {selectedGame} Item</h3>
              {renderAddForm()}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleAddItem}
                  disabled={loading}
                  className="px-6 py-2 bg-[#6C5CE7] text-white font-black text-xs uppercase rounded-lg border-2 border-black shadow-[2px_2px_0px_#000] hover:translate-y-1 hover:shadow-none disabled:opacity-50 transition-all"
                >
                  SAVE
                </button>
                <button
                  onClick={() => { setShowAddForm(false); setNewItem({}); }}
                  className="px-6 py-2 bg-white text-black font-black text-xs uppercase rounded-lg border-2 border-black shadow-[2px_2px_0px_#000] hover:translate-y-1 hover:shadow-none transition-all"
                >
                  CANCEL
                </button>
              </div>
            </div>
          )}

          {/* Content List */}
          {gameContent?.items ? (
            <div className="space-y-3">
              {gameContent.items.map((item: any) => (
                <div key={item.id} className="flex items-start justify-between p-4 bg-[#FFFDF5] border-2 border-black/10 rounded-xl hover:border-black/30 transition-all">
                  <div className="flex-1">
                    {renderContentItem(item)}
                  </div>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="ml-4 p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              <p className="text-sm text-black/40 font-bold mt-4">
                Total: {gameContent.items.length} items
              </p>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-black/40 font-bold">No content found</p>
              <p className="text-sm text-black/60 mt-2">Click &quot;Initialize&quot; or &quot;Add New&quot; to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
