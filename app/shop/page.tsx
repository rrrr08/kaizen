"use client";

import React, { useState, useEffect } from 'react';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/lib/types';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/app/context/CartContext';

// Extended interface for UI display
interface DisplayProduct extends Product {
  // Add any UI-specific properties if needed
}

const Shop: React.FC = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<DisplayProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Ensure arrays exist for UI compatibility
          badges: doc.data().badges || ['NEW'],
          mood: doc.data().mood || doc.data().category || 'Standard',
          players: doc.data().players || '1+',
          description: doc.data().description || 'No description available.',
          image: doc.data().image || 'https://via.placeholder.com/400x400?text=NO+IMAGE',
        })) as DisplayProduct[];
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Extract unique categories for filters
  const categories = ['ALL', ...Array.from(new Set(products.map(p => p.category || 'Other')))];

  const filteredGames = filter === 'ALL'
    ? products
    : products.filter(g => g.category === filter);

  if (loading) {
    return <LoadingScreen message="ACCESSING_VAULT_DATABASE..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-20 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-10">
        <div>
          <div className="arcade-panel-header bg-[#FF8C00]">VAULT.ACCESS</div>
          <h1 className="font-arcade text-6xl text-white text-3d-orange-deep">THE VAULT</h1>
          <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-xs mt-2 italic">Curated gear for your home lobby</p>
        </div>

        <div className="flex flex-wrap gap-4 font-arcade text-xs">
          {categories.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-3 border-b-4 transition-all uppercase ${filter === f
                ? 'bg-[#FF8C00] border-[#A0522D] text-black translate-y-1'
                : 'bg-[#1A1A1A] border-[#000000] text-gray-400 hover:border-[#FF8C00]'
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filteredGames.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-[#333] rounded-[4px]">
          <ShoppingBag className="w-16 h-16 text-[#333] mx-auto mb-6" />
          <p className="text-gray-500 font-arcade tracking-widest text-xl">NO_INVENTORY_DETECTED</p>
          <p className="text-gray-600 font-mono text-sm mt-2 uppercase">Systems indicate empty vault</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {filteredGames.map((game) => (
            <div key={game.id} className="relative group h-full">
              <div className="arcade-panel-header bg-[#1A1A1A] text-gray-400 group-hover:bg-[#FFD400] group-hover:text-black transition-colors uppercase truncate">
                ITEM_DATA_{game.id.substring(0, 8)}
              </div>
              <div className="arcade-card-3d flex flex-col h-full overflow-hidden pixel-grid bg-[#0a0a0a]">
                {/* Card Brackets */}
                <div className="corner-bracket top-2 left-2 border-t border-l"></div>
                <div className="corner-bracket bottom-2 right-2 border-b border-r"></div>

                <div className="relative h-64 overflow-hidden border-b-2 border-[#1A1A1A] group-hover:border-[#FFD400] transition-colors">
                  <img src={game.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-110" alt={game.name} />
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {game.badges && game.badges.map((badge, idx) => (
                      <span key={idx} className="bg-black text-[#FFD400] text-[8px] font-arcade px-3 py-1 border border-[#FFD400] shadow-[3px_3px_0px_black] uppercase">
                        {badge}
                      </span>
                    ))}
                    <span className="bg-black text-[#00B894] text-[8px] font-arcade px-3 py-1 border border-[#00B894] shadow-[3px_3px_0px_black] uppercase">
                      {game.category}
                    </span>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-black/80 px-4 py-2 border border-[#FF8C00] text-white font-arcade text-lg group-hover:bg-[#FF8C00] group-hover:text-black transition-all">
                    ₹{game.price}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                </div>

                <div className="p-8 flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-arcade text-2xl text-white group-hover:text-3d-orange transition-all uppercase leading-none break-words w-full">{game.name}</h3>
                  </div>
                  <p className="text-gray-500 text-sm mb-8 flex-grow leading-relaxed font-medium italic line-clamp-3">"{game.description}"</p>

                  <div className="bg-black/50 p-4 mb-8 border border-[#1A1A1A] group-hover:border-[#222]">
                    <div className="flex justify-between text-[8px] font-arcade text-gray-600 mb-2">
                      <span>CONFIG_READOUT</span>
                      <span className={`text-${game.stock && game.stock > 0 ? '[#00B894]' : 'red-500'}`}>
                        {game.stock && game.stock > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK'}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-[10px] font-arcade text-gray-400">
                      <span className="flex items-center gap-2 uppercase">👤 {game.players}</span>
                      <span className="flex items-center gap-2 uppercase">⚡ {game.mood}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button className="bg-[#1A1A1A] text-white font-arcade text-[10px] py-4 border-b-4 border-black hover:bg-[#222] hover:border-[#FF8C00] transition-all">
                      INTEL
                    </button>
                    <button
                      onClick={() => addToCart(game, 1)}
                      disabled={!game.stock || game.stock <= 0}
                      className="bg-[#FF8C00] text-black font-arcade text-[10px] py-4 border-b-4 border-[#A0522D] active:border-b-0 active:translate-y-1 hover:bg-white transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                    >
                      {game.stock && game.stock > 0 ? 'ADD_VAULT' : 'LOCKED'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Shop;
