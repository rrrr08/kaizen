'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useCart } from '@/app/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Star, ArrowLeft, Check, Minus, Plus } from 'lucide-react';
import { Product } from '@/lib/types';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default function ProductDetail() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const [selectedImage, setSelectedImage] = useState<string>('');

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
        const productData = await getProductById(productId) as Product;

        if (productData) {
          setProduct(productData);
          setSelectedImage(productData.image);

          const allProducts = await getProducts() as Product[];
          const related = allProducts
            .filter((p: Product) =>
              p.id !== productData.id &&
              productData.category === p.category
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

  const images = product?.images && product.images.length > 0
    ? Array.from(new Set([product.image, ...product.images]))
    : product ? [product.image] : [];

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
    addToCart(product, quantity);
    setQuantity(1);
    addToast({
      title: "Success!",
      description: `${product.name} added to cart.`,
    });
  };

  const currentImage = selectedImage || product.image;

  return (
    <div className="min-h-screen pt-28 pb-16 bg-[#FFFDF5] text-[#2D3436]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <Link href="/shop" className="font-black text-xs tracking-widest text-[#2D3436]/50 hover:text-[#FFD93D] mb-12 inline-flex items-center gap-2 transition-colors uppercase">
          <ArrowLeft size={16} /> Back to Repository
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 mb-20 relative text-left">
          {/* Gallery Section */}
          <div className="flex flex-col gap-6 relative">
            <div className="w-full max-w-md overflow-hidden rounded-[30px] border-4 border-black neo-shadow bg-white relative">
              {/* Product Image */}
              <div className="w-full relative aspect-[3/4]">
                <Image
                  src={currentImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              <div className="absolute top-6 right-6 z-20 pointer-events-none">
                <div className="bg-white p-3 rounded-full neo-border neo-shadow">
                  <Star className="text-[#FFD93D]" fill="#FFD93D" size={24} />
                </div>
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto py-4 max-w-md">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-24 h-24 flex-shrink-0 rounded-2xl border-4 transition-all ${selectedImage === img ? 'border-[#6C5CE7] neo-shadow scale-105 z-10' : 'border-black opacity-60 hover:opacity-100 hover:scale-105'}`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center relative">
            <div className="mb-8 relative z-10">
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

            <div className="flex flex-wrap gap-3 mb-8">
              {product.category && (
                <span className="px-4 py-1.5 bg-[#FFF] border-2 border-black text-black font-black text-[10px] tracking-widest rounded-full uppercase">
                  {product.category}
                </span>
              )}
            </div>

            {product.boxContent && (
              <div className="mb-8 p-4 bg-white/50 border-2 border-black/10 rounded-xl">
                <p className="font-black text-xs uppercase tracking-widest mb-1 text-black/60">What&apos;s Inside:</p>
                <p className="font-bold text-sm text-black">{product.boxContent}</p>
              </div>
            )}

            <div className="mt-auto bg-[#FFD93D] p-6 rounded-2xl border-3 border-black neo-shadow">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-left w-full sm:w-auto">
                  <p className="font-black text-[10px] tracking-[0.2em] text-black/60 mb-1">TOTAL PRICE</p>
                  <p className="font-black text-4xl text-black">₹{product.price}</p>
                </div>

                <div className="flex flex-col gap-3 w-full sm:w-auto">
                  <div className="flex items-center justify-center bg-white border-2 border-black rounded-xl overflow-hidden shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 hover:bg-gray-100 font-black text-lg flex items-center justify-center transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-4 py-2 font-black text-lg border-x-2 border-black min-w-[3rem] text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-2 hover:bg-gray-100 font-black text-lg flex items-center justify-center transition-colors"
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
            <p className="mt-6 text-black/40 font-bold text-xs text-center sm:text-left">
              *Free shipping on orders over ₹999.
            </p>
          </div>
        </div>

        {/* How to Play Section */}
        {product.howToPlay && (Array.isArray(product.howToPlay) ? product.howToPlay.length > 0 : false) && (
          <div className="mb-24">
            <div className="text-center mb-12">
              <div className="inline-block bg-black text-white px-6 py-2 rounded-full mb-4">
                <h2 className="font-header text-3xl font-black uppercase tracking-widest">How to Play</h2>
              </div>
              <p className="text-black/60 font-bold max-w-2xl mx-auto">Master the game in {Array.isArray(product.howToPlay) ? product.howToPlay.length : 0} simple steps.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.isArray(product.howToPlay) && product.howToPlay.map((step: any, index: number) => {
                const colors = ['bg-[#6C5CE7]', 'bg-[#00B894]', 'bg-[#74B9FF]', 'bg-[#FF7675]'];
                const color = colors[index % colors.length];

                return (
                  <div key={index} className={`${color} p-6 rounded-[24px] border-3 border-black neo-shadow hover:-translate-y-2 transition-transform h-full flex flex-col`}>
                    <div className="bg-white w-12 h-12 rounded-full border-2 border-black flex items-center justify-center mb-4 neo-shadow-sm">
                      <span className="font-black text-lg text-black">{index + 1}</span>
                    </div>
                    <h3 className="font-black text-xl text-white mb-3 uppercase tracking-wide leading-tight text-left">{step.title}</h3>
                    <p className="font-bold text-sm text-white/90 leading-relaxed text-left">{step.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Features Section */}
        {product.features && product.features.length > 0 && (
          <div className="mb-24 bg-white border-3 border-black rounded-[30px] p-8 md:p-12 neo-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD93D] rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="flex flex-col md:flex-row gap-12 items-start relative z-10">
              <div className="flex-1 text-left">
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
                      <div className="text-left">
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
          <div className="pt-12 border-t-2 border-black/10 text-left">
            <h2 className="font-display text-4xl font-black mb-12 text-black">YOU MIGHT ALSO LIKE</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map(relProduct => (
                <Link key={relProduct.id} href={`/shop/${relProduct.id}`} className="group block">
                  <div className="aspect-[3/4] overflow-hidden rounded-2xl border-2 border-black neo-shadow bg-white mb-4 transition-transform group-hover:translate-y-[-4px] relative">
                    <Image
                      src={relProduct.image}
                      alt={relProduct.name}
                      fill
                      className="object-cover"
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
