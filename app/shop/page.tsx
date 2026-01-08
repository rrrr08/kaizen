'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ui/ProductCard';
import { Product } from '@/lib/types';
import { Filter, X } from 'lucide-react';
import { motion } from 'framer-motion';

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
        // Assuming data structure matches roughly, but ensuring core fields
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
          // Extra fields for details page
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
    // Occasion filter
    if (selectedOccasion !== 'All') {
      const occasions = product.occasion || [];
      const hasOccasion = Array.isArray(occasions)
        ? occasions.some(o => o.toLowerCase().includes(selectedOccasion.toLowerCase()))
        : false;

      // Also check badges for occasion
      const hasOccasionBadge = product.badges?.some((b: string) =>
        b.toLowerCase().includes(selectedOccasion.toLowerCase())
      );

      if (!hasOccasion && !hasOccasionBadge) {
        return false;
      }
    }

    // Players filter
    if (selectedPlayers !== 'All') {
      if (product.minPlayers || product.maxPlayers) {
        const [min, max] = selectedPlayers.split('-').map(s => parseInt(s.replace('+', '')));
        const productMin = product.minPlayers || 0;
        const productMax = product.maxPlayers || 999;

        if (max) {
          // Range like "2-4"
          const overlaps = !(productMin > max || productMax < min);
          if (!overlaps) return false;
        } else {
          // "8+" case
          if (productMax < min && productMin < min) return false;
        }
      }
    }

    // Mood filter
    if (selectedMood !== 'All') {
      const productMood = product.mood || '';
      if (!productMood.toLowerCase().includes(selectedMood.toLowerCase())) {
        return false;
      }
    }

    // Category filter
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
    <div className="min-h-screen pt-20 md:pt-28 pb-16 bg-[#FFFDF5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        {/* Header */}
        <div className="mb-8 md:mb-12 border-b-2 border-black/5 pb-8 md:pb-12">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 md:gap-8">
            <div className="max-w-2xl">
              <div className="text-[#6C5CE7] font-black text-[10px] md:text-xs tracking-[0.2em] mb-2 md:mb-4 uppercase font-display">Archive of Curiosities</div>
              <h1 className="font-header text-4xl sm:text-5xl md:text-8xl tracking-tighter text-[#2D3436] leading-[0.9]">
                THE <br className="hidden md:block" /><span className="italic font-serif text-[#FFD93D] drop-shadow-[1px_1px_0px_#000] md:drop-shadow-[2px_2px_0px_#000]">REPOSITORY</span>
              </h1>
              <p className="text-black/60 font-medium text-sm md:text-lg mt-3 md:mt-4 italic">Showing {filteredProducts.length} of {products.length} games in our collection</p>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full md:w-auto px-6 py-3 bg-black text-white font-black text-[10px] tracking-wider uppercase rounded-xl shadow-lg shadow-black/20 hover:bg-[#6C5CE7] transition-all flex items-center justify-center gap-2"
            >
              <Filter size={14} />
              FILTER GAMES
              {activeFiltersCount > 0 && (
                <span className="bg-[#FFD93D] text-black rounded-full w-5 h-5 flex items-center justify-center text-[10px]">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mb-12 bg-white/80 backdrop-blur-xl border border-black/5 rounded-3xl p-6 md:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-header text-xl md:text-2xl font-black uppercase tracking-tight">Refine Collection</h3>
              <div className="flex gap-2">
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="px-4 py-2 bg-red-50 text-red-500 font-bold text-xs rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center gap-1"
                  >
                    <X size={14} />
                    Reset
                  </button>
                )}
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 bg-black/5 text-black hover:bg-black/10 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {/* Occasion Filter */}
              <div className="space-y-2">
                <label className="block font-black text-[10px] uppercase tracking-widest text-black/40 ml-1">Occasion</label>
                <select
                  value={selectedOccasion}
                  onChange={(e) => setSelectedOccasion(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-black/5 rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] transition-all cursor-pointer shadow-sm hover:shadow-md"
                >
                  {occasions.map(occasion => (
                    <option key={occasion} value={occasion}>
                      {occasion}
                    </option>
                  ))}
                </select>
              </div>

              {/* Players Filter */}
              <div className="space-y-2">
                <label className="block font-black text-[10px] uppercase tracking-widest text-black/40 ml-1">Players</label>
                <select
                  value={selectedPlayers}
                  onChange={(e) => setSelectedPlayers(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-black/5 rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] transition-all cursor-pointer shadow-sm hover:shadow-md"
                >
                  {playerCounts.map(count => (
                    <option key={count} value={count}>
                      {count} Players
                    </option>
                  ))}
                </select>
              </div>

              {/* Mood Filter */}
              <div className="space-y-2">
                <label className="block font-black text-[10px] uppercase tracking-widest text-black/40 ml-1">Mood</label>
                <select
                  value={selectedMood}
                  onChange={(e) => setSelectedMood(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-black/5 rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD93D] transition-all cursor-pointer shadow-sm hover:shadow-md"
                >
                  {moods.map(mood => (
                    <option key={mood} value={mood}>
                      {mood}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="block font-black text-[10px] uppercase tracking-widest text-black/40 ml-1">Experience Type</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-black/5 rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#00D9A3] transition-all cursor-pointer shadow-sm hover:shadow-md"
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
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-[#FFD93D] border-t-black rounded-full"
            />
            <p className="text-black/30 font-black text-[10px] tracking-[0.4em] uppercase">ACCESSING ARCHIVES...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-24 bg-red-50 rounded-3xl border border-red-100">
            <p className="text-red-500 font-bold">{error}</p>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {filteredProducts.map(product => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Link href={`/shop/${product.id}`}>
                  <ProductCard product={product} />
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && !error && filteredProducts.length === 0 && (
          <div className="text-center py-24 border-2 border-dashed border-black/5 rounded-[3rem]">
            <p className="text-black/20 font-black text-xl md:text-2xl uppercase tracking-tighter">No curiosities found matching your search</p>
            <button
              onClick={clearAllFilters}
              className="mt-6 px-8 py-4 bg-black text-white rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-all"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
