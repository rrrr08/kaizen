'use client';

import { useState, useEffect } from 'react';
import { getProducts } from '@/lib/firebase';
import Link from 'next/link';

const TarotCard = ({ product, onClick }: any) => {
  return (
    <div 
      onClick={onClick}
      className="group relative cursor-pointer"
    >
      <div className="aspect-[9/16] rounded-sm overflow-hidden border border-white/5 hover:border-amber-500/40 bg-white/5 transition-all duration-700">
        <img 
          src={product.image} 
          className="w-full h-full object-cover transition-all duration-1000 grayscale group-hover:grayscale-0 opacity-40 group-hover:opacity-100 scale-110 group-hover:scale-100"
          alt={product.name}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>

        <div className="absolute bottom-12 left-6 md:left-8 right-6 md:right-8 text-center">
          {product.mood && (
            <div className="text-amber-500 font-header text-[9px] tracking-[0.5em] mb-4 opacity-0 group-hover:opacity-100 transition-all">
              {product.mood.toUpperCase()}
            </div>
          )}
          <h3 className="font-header text-2xl mb-1 tracking-wider uppercase text-white group-hover:text-amber-400 transition-colors">
            {product.name}
          </h3>
          {product.players && (
            <div className="font-serif italic text-white/40 text-sm">
              {product.players}
            </div>
          )}
        </div>
      </div>
      
      {/* Decorative Corners */}
      <div className="absolute -top-1 -left-1 w-4 h-4 border-t border-l border-amber-500/0 group-hover:border-amber-500/60 transition-all"></div>
      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b border-r border-amber-500/0 group-hover:border-amber-500/60 transition-all"></div>
    </div>
  );
};

export default function Shop() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('All');
  const categories = ['All', 'Party', 'Family', 'Strategy', 'Adults Only'];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts();
        setProducts(data);
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
    <div className="min-h-screen pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="mb-20 flex flex-col md:flex-row items-end justify-between gap-8 border-b border-white/5 pb-12">
          <div>
            <div className="text-amber-500 font-header text-[10px] tracking-[0.6em] mb-4 uppercase">Archive of Curiosities</div>
            <h1 className="font-header text-5xl md:text-7xl lg:text-8xl tracking-tighter">
              THE <br/><span className="italic font-serif text-amber-500">REPOSITORY</span>
            </h1>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-4 md:gap-8">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`font-header text-[9px] tracking-[0.4em] transition-all relative pb-2 ${
                  filter === cat ? 'text-amber-500 border-b border-amber-500' : 'text-white/40 hover:text-white'
                }`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mb-4"></div>
              <p className="text-white/60 font-header text-[10px] tracking-[0.4em]">LOADING REPOSITORY...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-24">
            <p className="text-red-500 font-header text-[10px] tracking-[0.4em]">{error}</p>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {filteredProducts.map(product => (
              <Link key={product.id} href={`/shop/${product.id}`}>
                <TarotCard product={product} />
              </Link>
            ))}
          </div>
        )}

        {!loading && !error && filteredProducts.length === 0 && (
          <div className="text-center py-24">
            <p className="text-white/60 font-header text-[10px] tracking-[0.4em]">NO ITEMS FOUND</p>
          </div>
        )}
      </div>
    </div>
  );
}
