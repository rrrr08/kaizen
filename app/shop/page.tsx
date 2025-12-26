'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ui/ProductCard';
import { Product } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('All');
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
          time: item.time || '30-45m',
          mood: item.mood || 'Fun',
          badges: item.badges || [],
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

  const filteredProducts = filter === 'All'
    ? products
    : products.filter(p => p.occasion?.includes(filter) || p.badges?.some((b: string) => b.toLowerCase().includes(filter.toLowerCase())));

  return (
    <div className="min-h-screen pt-28 pb-16 bg-[#FFFDF5]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="mb-20 flex flex-col md:flex-row items-end justify-between gap-8 border-b-2 border-black pb-12">
          <div>
            <div className="text-[#6C5CE7] font-black text-sm tracking-[0.2em] mb-4 uppercase font-display">Archive of Curiosities</div>
            <h1 className="font-header text-6xl md:text-8xl tracking-tighter text-[#2D3436]">
              THE <br /><span className="italic font-serif text-[#FFD93D] drop-shadow-[2px_2px_0px_#000]">REPOSITORY</span>
            </h1>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 md:gap-4">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all neo-border neo-shadow ${filter === cat
                  ? 'bg-[#FFD93D] text-black scale-105'
                  : 'bg-white text-black hover:bg-gray-50'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

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
                  {/* Note: ProductCard has its own "Add to Cart" button which currently doesn't work, 
                        but wrapping in Link makes the whole card clickable to go to details page.
                        We might need to adjust this interaction. */}
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
