'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ui/ProductCard';
import { Product } from '@/lib/types';
import { Filter, X } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedOccasion, setSelectedOccasion] = useState<string>('All');
  const [selectedPlayers, setSelectedPlayers] = useState<string>('All');
  const [selectedMood, setSelectedMood] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showFilters, setShowFilters] = useState(false);

  // Filter options
  const occasions = ['All', 'Party', 'Family', 'Corporate', 'Wedding', 'Kids'];
  const playerCounts = ['All', '2-4', '4-6', '6-8', '8+'];
  const moods = ['All', 'Fun', 'Strategic', 'Creative', 'Competitive', 'Relaxing'];
  const categories = ['All', 'Party', 'Family', 'Strategy', 'Adults Only'];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { getProducts } = await import('@/lib/firebase');
        const data = await getProducts();

        // Transform firebase data to match Product interface if needed
        const formattedData: Product[] = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          description: item.description,
          players: item.players,
          minPlayers: item.minPlayers,
          maxPlayers: item.maxPlayers,
          time: item.time || '30-45m',
          mood: item.mood || 'Fun',
          badges: item.badges || [],
          category: item.category,
          story: item.story,
          howToPlay: item.howToPlay,
          occasion: item.occasion
        }));

        setProducts(formattedData);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Apply all filters
  const filteredProducts = products.filter(product => {
    if (selectedOccasion !== 'All') {
      const occasions = product.occasion || [];
      const hasOccasion = Array.isArray(occasions)
        ? occasions.some(o => o.toLowerCase().includes(selectedOccasion.toLowerCase()))
        : false;

      const hasOccasionBadge = product.badges?.some((b: string) =>
        b.toLowerCase().includes(selectedOccasion.toLowerCase())
      );

      if (!hasOccasion && !hasOccasionBadge) {
        return false;
      }
    }

    if (selectedPlayers !== 'All') {
      if (product.minPlayers || product.maxPlayers) {
        const [minStr, maxStr] = selectedPlayers.split('-');
        const min = parseInt(minStr.replace('+', ''));
        const max = maxStr ? parseInt(maxStr) : null;

        const productMin = product.minPlayers || 0;
        const productMax = product.maxPlayers || 999;

        if (max) {
          const overlaps = !(productMin > max || productMax < min);
          if (!overlaps) return false;
        } else {
          if (productMax < min && productMin < min) return false;
        }
      }
    }

    if (selectedMood !== 'All') {
      const productMood = product.mood || '';
      if (!productMood.toLowerCase().includes(selectedMood.toLowerCase())) {
        return false;
      }
    }

    if (selectedCategory !== 'All') {
      const hasCategory = product.category?.toLowerCase().includes(selectedCategory.toLowerCase());
      const hasMatchingBadge = product.badges?.some((b: string) =>
        b.toLowerCase().includes(selectedCategory.toLowerCase())
      );

      if (!hasCategory && !hasMatchingBadge) {
        return false;
      }
    }

    return true;
  });

  const activeFiltersCount = [
    selectedOccasion !== 'All',
    selectedPlayers !== 'All',
    selectedMood !== 'All',
    selectedCategory !== 'All'
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setSelectedOccasion('All');
    setSelectedPlayers('All');
    setSelectedMood('All');
    setSelectedCategory('All');
  };

  return (
    <div className="min-h-screen pt-28 pb-16 bg-[#FFFDF5]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="mb-12 border-b-4 border-black pb-12">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
            <div className="flex flex-col items-start">
              <div className="text-[#6C5CE7] font-black text-xs md:text-sm tracking-[0.3em] mb-6 uppercase font-display bg-white px-3 py-1 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000]">
                Cabinet of Curiosities at Joy Juncture
              </div>
              <h1 className="font-header tracking-tighter text-[#2D3436] flex flex-col items-start leading-none">
                <span className="text-2xl md:text-4xl font-black uppercase mb-1">THE</span>
                <span className="text-5xl md:text-9xl italic font-serif text-black drop-shadow-[4px_4px_0px_#FFD93D] relative z-10">
                  REPOSITORY
                </span>
              </h1>
              <p className="text-[#2D3436]/60 font-black text-sm md:text-xl mt-6 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 bg-[#6C5CE7] rounded-full animate-pulse"></span>
                Showing {filteredProducts.length} of {products.length} games
              </p>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full md:w-auto px-8 py-4 bg-black text-white font-black text-sm tracking-[0.2em] uppercase rounded-full border-2 border-black shadow-[6px_6px_0px_#6C5CE7] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              <Filter size={20} className={showFilters ? "text-[#FFD93D]" : "text-white"} />
              FILTERS
              {activeFiltersCount > 0 && (
                <span className="bg-[#FFD93D] text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mb-12 bg-white border-2 border-black rounded-2xl p-6 neo-shadow">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-lg uppercase tracking-wider">Filter Games</h3>
              <div className="flex gap-2">
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="px-4 py-2 bg-red-500 text-white font-bold text-xs rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1"
                  >
                    <X size={14} />
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-4 py-2 bg-gray-200 text-black font-bold text-xs rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Occasion Filter */}
              <div>
                <label className="block font-black text-xs uppercase tracking-widest mb-3 text-black/70">Occasion</label>
                <select
                  value={selectedOccasion}
                  onChange={(e) => setSelectedOccasion(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] transition-all cursor-pointer hover:bg-gray-50"
                >
                  {occasions.map(occasion => (
                    <option key={occasion} value={occasion}>
                      {occasion}
                    </option>
                  ))}
                </select>
              </div>

              {/* Players Filter */}
              <div>
                <label className="block font-black text-xs uppercase tracking-widest mb-3 text-black/70">Players</label>
                <select
                  value={selectedPlayers}
                  onChange={(e) => setSelectedPlayers(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] transition-all cursor-pointer hover:bg-gray-50"
                >
                  {playerCounts.map(count => (
                    <option key={count} value={count}>
                      {count} Players
                    </option>
                  ))}
                </select>
              </div>

              {/* Mood Filter */}
              <div>
                <label className="block font-black text-xs uppercase tracking-widest mb-3 text-black/70">Mood</label>
                <select
                  value={selectedMood}
                  onChange={(e) => setSelectedMood(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD93D] transition-all cursor-pointer hover:bg-gray-50"
                >
                  {moods.map(mood => (
                    <option key={mood} value={mood}>
                      {mood}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block font-black text-xs uppercase tracking-widest mb-3 text-black/70">Game Type</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#00D9A3] transition-all cursor-pointer hover:bg-gray-50"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#FFD93D] border-t-black mb-4"></div>
              <p className="text-black/60 font-black text-xs tracking-[0.4em]">LOADING REPOSITORY...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-24">
            <p className="text-red-500 font-black text-lg">{error}</p>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {filteredProducts.map(product => (
              <Link key={product.id} href={`/shop/${product.id}`} className="block">
                <div className="transform transition-transform hover:scale-[1.02]">
                  <ProductCard product={product} />
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && !error && filteredProducts.length === 0 && (
          <div className="text-center py-24">
            <p className="text-black/60 font-black text-lg uppercase">NO ITEMS FOUND</p>
          </div>
        )}
      </div>
    </div>
  );
}
