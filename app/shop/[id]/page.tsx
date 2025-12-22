'use client';

import { getProductById, getProducts } from '@/lib/firebase';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useCart } from '@/app/context/CartContext';
import { useToast } from '@/hooks/use-toast';

export default function ProductDetail() {
  const params = useParams();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { addToast } = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productId = typeof params.id === 'string' ? params.id : params.id[0];
        const productData = await getProductById(productId);
        
        if (productData) {
          setProduct(productData);
          
          // Fetch related products
          const allProducts = await getProducts();
          const related = allProducts
            .filter((p: any) => 
              p.id !== productData.id && 
              p.occasion?.some((o: string) => productData.occasion?.includes(o))
            )
            .slice(0, 4);
          setRelatedProducts(related);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mb-4"></div>
          <p className="text-white/60 font-header text-[10px] tracking-[0.4em]">LOADING PRODUCT...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-header text-4xl mb-4">{error || 'PRODUCT NOT FOUND'}</h1>
          <Link href="/shop" className="text-amber-500 font-header text-[10px] tracking-[0.4em]">
            RETURN TO SHOP
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    addToast({
      title: "Added to Cart",
      description: `${product.name} (x${quantity}) has been added to your cart.`,
    });
    setQuantity(1);
  };

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Back Button */}
        <Link href="/shop" className="font-header text-sm tracking-widest text-white/50 hover:text-amber-500 mb-16 inline-block transition-colors font-medium uppercase">
          ← BACK TO REPOSITORY
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
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
            <div className="mb-12">
              <div className="text-amber-500 font-header text-xs font-bold tracking-[0.2em] mb-6 uppercase">
                {product.mood} • {product.players}
              </div>
              <h1 className="font-header text-6xl md:text-7xl font-bold mb-8 tracking-tight leading-tight">{product.name}</h1>
              <p className="font-body text-2xl text-white/70 mb-12 leading-relaxed">{product.description}</p>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-3 mb-8">
              {product.badges?.map((badge: string) => (
                <span key={badge} className="px-4 py-2 border border-amber-500/30 text-amber-500 font-header text-[8px] tracking-widest rounded-full">
                  {badge.toUpperCase()}
                </span>
              ))}
            </div>

            {/* Story Section */}
            <div className="mb-12 pb-12 border-b border-white/10">
              <h3 className="font-display text-lg font-bold tracking-wider text-amber-500 mb-6 uppercase">The Story</h3>
              <p className="font-body text-lg text-white/70 leading-relaxed">{product.story}</p>
            </div>

            {/* How to Play */}
            <div className="mb-12 pb-12 border-b border-white/10">
              <h3 className="font-display text-lg font-bold tracking-wider text-amber-500 mb-6 uppercase">How to Play</h3>
              <p className="font-body text-lg text-white/70 leading-relaxed">{product.howToPlay}</p>
            </div>

            {/* Occasions */}
            {product.occasion?.length > 0 && (
              <div className="mb-12 pb-12 border-b border-white/10">
                <h3 className="font-display text-lg font-bold tracking-wider text-amber-500 mb-6 uppercase">Best For</h3>
                <div className="flex flex-wrap gap-3">
                  {product.occasion.map((occ: string) => (
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
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-white/20 rounded-sm">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 font-header text-[10px] tracking-widest hover:bg-white/5 transition"
                  >
                    −
                  </button>
                  <span className="px-4 py-2 font-header text-[10px]">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 font-header text-[10px] tracking-widest hover:bg-white/5 transition"
                  >
                    +
                  </button>
                </div>
                <button 
                  onClick={handleAddToCart}
                  className="w-full sm:w-auto px-12 py-4 bg-amber-500 text-black font-header text-[10px] tracking-[0.4em] hover:bg-amber-400 transition-all rounded-sm"
                >
                  ADD TO CART
                </button>
              </div>
            </div>

            {/* Info Note */}
            <p className="mt-8 text-white/40 font-serif italic text-sm">
              Contact us for bulk orders or custom experiences.
            </p>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 pt-24 border-t border-white/10">
            <h2 className="font-header text-4xl mb-12">SIMILAR GAMES</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map(relProduct => (
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
        )}
      </div>
    </div>
  );
}
