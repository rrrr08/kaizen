'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useCart } from '@/app/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Users, Clock, Zap, Star } from 'lucide-react';

export const dynamic = 'force-dynamic';

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
        const { getProductById, getProducts } = await import('@/lib/firebase');

        const productId = typeof params.id === 'string' ? params.id : params.id?.[0] || '';
        if (!productId) {
          setError('Product not found');
          setLoading(false);
          return;
        }
        const productData = await getProductById(productId);

        if (productData) {
          setProduct(productData);

          // Fetch related products
          const allProducts = await getProducts();
          const related = allProducts
            .filter((p: any) =>
              p.id !== productData.id &&
              (productData as any).occasion &&
              p.occasion?.some((o: string) => (productData as any).occasion?.includes(o))
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
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-[#FFFDF5]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#FFD93D] border-t-black mb-4"></div>
          <p className="text-black/60 font-black text-xs tracking-[0.4em]">LOADING PRODUCT...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-[#FFFDF5]">
        <div className="text-center">
          <h1 className="font-header text-4xl mb-4 text-black">{error || 'PRODUCT NOT FOUND'}</h1>
          <Link href="/shop" className="text-[#6C5CE7] font-black text-xs tracking-[0.2em] underline">
            RETURN TO SHOP
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    // Add logic to show visual feedback even if toast doesn't work right away
    console.log("Adding to cart:", product.name, quantity);
    addToCart(product, quantity);

    // Try simple alert if toast fails, but toast is preferred
    // toast({
    //   title: "Added to Cart!",
    //   description: `${product.name} (x${quantity}) added.`,
    // });
    setQuantity(1);
  };

  return (
    <div className="min-h-screen pt-28 pb-16 bg-[#FFFDF5] text-[#2D3436]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Back Button */}
        <Link href="/shop" className="font-black text-xs tracking-widest text-[#2D3436]/50 hover:text-[#FFD93D] mb-12 inline-flex items-center gap-2 transition-colors uppercase">
          <span>←</span> Back to Repository
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
          {/* Product Image */}
          <div className="flex items-center justify-center">
            <div className="aspect-[3/4] w-full max-w-md overflow-hidden rounded-[30px] border-3 border-black neo-shadow bg-white relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-6 right-6">
                <button className="bg-white p-3 rounded-full neo-border neo-shadow hover:scale-110 transition-transform">
                  <Star className="text-[#FFD93D]" fill="#FFD93D" size={24} />
                </button>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-[#6C5CE7] text-white px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider neo-border shadow-[2px_2px_0px_#000]">
                  {product.mood || 'FUN'}
                </span>
                <span className="bg-[#00B894] text-white px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider neo-border shadow-[2px_2px_0px_#000]">
                  {product.players || '2-4 Players'}
                </span>
              </div>
              <h1 className="font-header text-6xl md:text-7xl font-black mb-6 tracking-tight leading-none text-black">
                {product.name}
              </h1>
              <p className="font-bold text-xl text-[#2D3436]/80 mb-8 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-3 mb-8">
              {product.badges?.map((badge: string) => (
                <span key={badge} className="px-4 py-1.5 bg-[#FFF] border-2 border-black text-black font-black text-[10px] tracking-widest rounded-full uppercase">
                  {badge}
                </span>
              ))}
            </div>

            {/* Story Section */}
            {(product.story || product.howToPlay) && (
              <div className="mb-10 p-6 bg-white rounded-2xl border-2 border-black neo-shadow">
                {product.story && (
                  <div className="mb-6">
                    <h3 className="font-black text-sm tracking-wider text-[#FFD93D] drop-shadow-[1px_1px_0px_#000] mb-2 uppercase">The Story</h3>
                    <p className="font-medium text-sm text-black/70 leading-relaxed">{product.story}</p>
                  </div>
                )}
                {product.howToPlay && (
                  <div>
                    <h3 className="font-black text-sm tracking-wider text-[#00B894] drop-shadow-[1px_1px_0px_#000] mb-2 uppercase">How to Play</h3>
                    <p className="font-medium text-sm text-black/70 leading-relaxed">{product.howToPlay}</p>
                  </div>
                )}
              </div>
            )}

            {/* Price & Action */}
            <div className="mt-auto bg-[#FFD93D] p-6 rounded-2xl border-3 border-black neo-shadow">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <p className="font-black text-[10px] tracking-[0.2em] text-black/60 mb-1">TOTAL PRICE</p>
                  <p className="font-black text-4xl text-black">₹{product.price}</p>
                </div>

                <div className="flex flex-col gap-3 w-full sm:w-auto">
                  <div className="flex items-center justify-center bg-white border-2 border-black rounded-xl overflow-hidden shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 hover:bg-gray-100 font-black text-lg"
                    >
                      −
                    </button>
                    <span className="px-4 py-2 font-black text-lg border-x-2 border-black min-w-[3rem] text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-2 hover:bg-gray-100 font-black text-lg"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="w-full sm:w-auto px-8 py-3 bg-black text-white font-black text-xs tracking-[0.2em] hover:scale-105 hover:bg-[#6C5CE7] transition-all rounded-xl border-2 border-transparent shadow-[4px_4px_0px_rgba(255,255,255,0.5)] active:translate-y-1 active:shadow-none"
                  >
                    ADD TO CART
                  </button>
                </div>
              </div>
            </div>

            {/* Info Note */}
            <p className="mt-6 text-black/40 font-bold text-xs text-center sm:text-left">
              *Free shipping on orders over ₹999.
            </p>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 pt-12 border-t-2 border-black/10">
            <h2 className="font-display text-4xl font-black mb-12 text-black">YOU MIGHT ALSO LIKE</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map(relProduct => (
                <Link key={relProduct.id} href={`/shop/${relProduct.id}`} className="group block">
                  <div className="aspect-[3/4] overflow-hidden rounded-2xl border-2 border-black neo-shadow bg-white mb-4 transition-transform group-hover:translate-y-[-4px]">
                    <img
                      src={relProduct.image}
                      alt={relProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-black text-lg leading-tight group-hover:text-[#6C5CE7] transition-colors">{relProduct.name}</h3>
                  <p className="font-bold text-sm text-black/60">₹{relProduct.price}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
