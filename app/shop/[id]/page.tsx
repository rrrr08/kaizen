'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useCart } from '@/app/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Users, Clock, Zap, Star, ArrowLeft, Check, Minus, Plus } from 'lucide-react';

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
              (productData as any).category === p.category
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
    console.log("Adding to cart:", product.name, quantity);
    addToCart(product, quantity);
    setQuantity(1);
    alert("Added to cart!");
  };

  return (
    <div className="min-h-screen pt-28 pb-16 bg-[#FFFDF5] text-[#2D3436]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Back Button */}
        <Link href="/shop" className="font-black text-xs tracking-widest text-[#2D3436]/50 hover:text-[#FFD93D] mb-12 inline-flex items-center gap-2 transition-colors uppercase">
          <ArrowLeft size={16} /> Back to Repository
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 mb-20">
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
                {product.subtitle && (
                  <span className="bg-[#6C5CE7] text-white px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider neo-border shadow-[2px_2px_0px_#000]">
                    {product.subtitle}
                  </span>
                )}
                {product.ageGroup && (
                  <span className="bg-[#00B894] text-white px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider neo-border shadow-[2px_2px_0px_#000]">
                    AGE: {product.ageGroup}
                  </span>
                )}
                {(product.minPlayers && product.maxPlayers) && (
                  <span className="bg-[#FF7675] text-white px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider neo-border shadow-[2px_2px_0px_#000]">
                    {product.minPlayers}-{product.maxPlayers} Players
                  </span>
                )}
              </div>

              <h1 className="font-header text-6xl md:text-7xl font-black mb-2 tracking-tight leading-none text-black">
                {product.name}
              </h1>
              {product.subtitle && (
                <p className="font-bold text-lg text-black/60 mb-6 uppercase tracking-wide">{product.subtitle}</p>
              )}

              <p className="font-bold text-xl text-[#2D3436]/80 mb-8 leading-relaxed whitespace-pre-wrap">
                {product.description || "No description available."}
              </p>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-3 mb-8">
              {product.category && (
                <span className="px-4 py-1.5 bg-[#FFF] border-2 border-black text-black font-black text-[10px] tracking-widest rounded-full uppercase">
                  {product.category}
                </span>
              )}
            </div>

            {/* Box Content (if available) */}
            {product.boxContent && (
              <div className="mb-8 p-4 bg-white/50 border-2 border-black/10 rounded-xl">
                <p className="font-black text-xs uppercase tracking-widest mb-1 text-black/60">What's Inside:</p>
                <p className="font-bold text-sm text-black">{product.boxContent}</p>
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
                      className="px-4 py-2 hover:bg-gray-100 font-black text-lg flex items-center justify-center"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-4 py-2 font-black text-lg border-x-2 border-black min-w-[3rem] text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-2 hover:bg-gray-100 font-black text-lg flex items-center justify-center"
                    >
                      <Plus size={16} />
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

        {/* How to Play Section */}
        {product.howToPlay && product.howToPlay.length > 0 && (
          <div className="mb-24">
            <div className="text-center mb-12">
              <div className="inline-block bg-black text-white px-6 py-2 rounded-full mb-4">
                <h2 className="font-header text-3xl font-black uppercase tracking-widest">How to Play</h2>
              </div>
              <p className="text-black/60 font-bold max-w-2xl mx-auto">Master the game in {product.howToPlay.length} simple steps.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {product.howToPlay.map((step: any, index: number) => {
                // Rotate colors: Purple, Green, Blue, Red
                const colors = ['bg-[#6C5CE7]', 'bg-[#00B894]', 'bg-[#74B9FF]', 'bg-[#FF7675]'];
                const color = colors[index % colors.length];

                return (
                  <div key={index} className={`${color} p-6 rounded-[24px] border-3 border-black neo-shadow hover:-translate-y-2 transition-transform h-full flex flex-col`}>
                    <div className="bg-white w-12 h-12 rounded-full border-2 border-black flex items-center justify-center mb-4 neo-shadow-sm">
                      <span className="font-black text-lg text-black">{index + 1}</span>
                    </div>
                    <h3 className="font-black text-xl text-white mb-3 uppercase tracking-wide leading-tight">{step.title}</h3>
                    <p className="font-bold text-sm text-white/90 leading-relaxed">{step.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Key Features Section */}
        {product.features && product.features.length > 0 && (
          <div className="mb-24 bg-white border-3 border-black rounded-[30px] p-8 md:p-12 neo-shadow relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD93D] rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="flex flex-col md:flex-row gap-12 items-start relative z-10">
              <div className="flex-1">
                <h2 className="font-header text-4xl md:text-5xl font-black mb-6 text-black uppercase tracking-tighter">Key Features</h2>
                <p className="font-bold text-xl text-black/60 leading-relaxed">Everything that makes this game a must-have for your collection.</p>
              </div>

              <div className="flex-1 w-full">
                <div className="space-y-6">
                  {product.features.map((feature: any, index: number) => (
                    <div key={index} className="flex gap-4 items-start group">
                      <div className="mt-1 w-6 h-6 rounded-full bg-[#00B894] border-2 border-black flex-shrink-0 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Check size={12} className="text-white" strokeWidth={3} />
                      </div>
                      <div>
                        <h3 className="font-black text-lg text-black mb-1">{feature.title}</h3>
                        <p className="font-medium text-sm text-black/60">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="pt-12 border-t-2 border-black/10">
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
