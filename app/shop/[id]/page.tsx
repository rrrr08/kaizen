'use client';

import { PRODUCTS } from '@/lib/constants';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ProductDetail() {
  const params = useParams();
  const product = PRODUCTS.find(p => p.id === params.id);

  if (!product) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-header text-4xl mb-4">PRODUCT NOT FOUND</h1>
          <Link href="/shop" className="text-amber-500 font-header text-[10px] tracking-[0.4em]">
            RETURN TO SHOP
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Back Button */}
        <Link href="/shop" className="font-header text-[10px] tracking-[0.4em] text-white/40 hover:text-amber-500 mb-12 inline-block transition-colors">
          ← BACK TO REPOSITORY
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          {/* Product Image */}
          <div className="flex items-center justify-center">
            <div className="aspect-[9/16] w-full max-w-md overflow-hidden rounded-sm border border-white/10 bg-white/5">
              <img 
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center">
            <div className="mb-8">
              <div className="text-amber-500 font-header text-[10px] tracking-[0.6em] mb-4 uppercase">
                {product.mood} • {product.players}
              </div>
              <h1 className="font-header text-5xl md:text-6xl mb-6 tracking-tight">{product.name}</h1>
              <p className="font-serif italic text-xl text-white/60 mb-8">{product.description}</p>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-3 mb-8">
              {product.badges.map(badge => (
                <span key={badge} className="px-4 py-2 border border-amber-500/30 text-amber-500 font-header text-[8px] tracking-widest rounded-full">
                  {badge.toUpperCase()}
                </span>
              ))}
            </div>

            {/* Story Section */}
            <div className="mb-12 pb-12 border-b border-white/10">
              <h3 className="font-header text-[10px] tracking-[0.4em] text-amber-500 mb-4 uppercase">The Story</h3>
              <p className="font-serif italic text-white/70 leading-relaxed">{product.story}</p>
            </div>

            {/* How to Play */}
            <div className="mb-12 pb-12 border-b border-white/10">
              <h3 className="font-header text-[10px] tracking-[0.4em] text-amber-500 mb-4 uppercase">How to Play</h3>
              <p className="font-serif italic text-white/70 leading-relaxed">{product.howToPlay}</p>
            </div>

            {/* Occasions */}
            {product.occasion.length > 0 && (
              <div className="mb-12 pb-12 border-b border-white/10">
                <h3 className="font-header text-[10px] tracking-[0.4em] text-amber-500 mb-4 uppercase">Best For</h3>
                <div className="flex flex-wrap gap-3">
                  {product.occasion.map(occ => (
                    <span key={occ} className="px-4 py-2 bg-white/5 border border-white/10 rounded-sm font-header text-[9px] tracking-widest">
                      {occ}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Price & Action */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <p className="font-header text-[10px] tracking-[0.4em] text-white/40 mb-2">PRICE</p>
                <p className="font-serif italic text-3xl text-amber-500">₹{product.price}</p>
              </div>
              <button className="w-full sm:w-auto px-12 py-4 bg-amber-500 text-black font-header text-[10px] tracking-[0.4em] hover:bg-amber-400 transition-all rounded-sm">
                ADD TO CART
              </button>
            </div>

            {/* Info Note */}
            <p className="mt-8 text-white/40 font-serif italic text-sm">
              Contact us for bulk orders or custom experiences.
            </p>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-24 pt-24 border-t border-white/10">
          <h2 className="font-header text-4xl mb-12">SIMILAR GAMES</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {PRODUCTS.filter(p => p.id !== product.id && p.occasion.some(o => product.occasion.includes(o))).slice(0, 4).map(relProduct => (
              <Link key={relProduct.id} href={`/shop/${relProduct.id}`} className="group">
                <div className="aspect-[9/16] overflow-hidden rounded-sm border border-white/5 group-hover:border-amber-500/40 bg-white/5 transition-all mb-4">
                  <img 
                    src={relProduct.image}
                    alt={relProduct.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                </div>
                <h3 className="font-header text-sm tracking-wider group-hover:text-amber-500 transition-colors">{relProduct.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
