'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useCart } from '@/app/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Star, ArrowLeft, Check, Minus, Plus } from 'lucide-react';
import { Product } from '@/lib/types';
import Image from 'next/image';
import ReactImageMagnify from 'easy-magnify-waft';

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
    <div className="min-h-screen pt-24 md:pt-32 pb-16 bg-[#FFFDF5] text-[#2D3436]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        <Link href="/shop" className="font-black text-[10px] md:text-xs tracking-widest text-[#2D3436]/40 hover:text-[#6C5CE7] mb-8 md:mb-12 inline-flex items-center gap-2 transition-colors uppercase">
          <ArrowLeft size={14} /> Back to Repository
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-20 mb-16 md:mb-24 relative text-left">
          {/* Gallery Section */}
          <div className="flex flex-col gap-4 md:gap-6 relative">
            <div className="w-full max-w-lg mx-auto overflow-hidden rounded-[2.5rem] border border-black/5 shadow-xl bg-white relative cursor-crosshair">
              {/* easy-magnify-waft implementation */}
              <div className="w-full relative z-10 magnifier-wrapper">
                <ReactImageMagnify
                  {...{
                    smallImage: {
                      alt: product.name,
                      isFluidWidth: true,
                      src: currentImage
                    },
                    largeImage: {
                      src: currentImage,
                      width: 1800,
                      height: 2400
                    },
                    enlargedImagePosition: 'beside',
                    enlargedImageContainerClassName: 'custom-enlarged-container',
                    enlargedImageContainerDimensions: {
                      width: '100%',
                      height: '100%'
                    },
                    enlargedImagePortalId: 'zoom-portal',
                    shouldUsePositiveSpaceLens: true,
                    lensStyle: {
                      background: 'rgba(255, 255, 255, 0.4)',
                      border: '2px solid black'
                    }
                  }}
                  className="w-full"
                />
              </div>

              <div className="absolute top-4 right-4 z-20 pointer-events-none">
                <div className="bg-white/90 backdrop-blur-md p-2 rounded-full border border-black/5 shadow-sm">
                  <Star className="text-[#FFD93D]" fill="#FFD93D" size={20} />
                </div>
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto py-2 max-w-lg mx-auto no-scrollbar">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-16 md:w-20 h-16 md:h-20 flex-shrink-0 rounded-2xl border-2 transition-all overflow-hidden ${selectedImage === img ? 'border-[#6C5CE7] shadow-lg shadow-purple-100 scale-105 z-10' : 'border-transparent opacity-40 hover:opacity-100 hover:scale-105'}`}
                  >
                    <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-start relative pt-4">
            {/* Dedicated Zoom Portal - matches aspect by being fluid over the content */}
            <div id="zoom-portal" className="absolute top-0 left-0 w-full h-[600px] z-[50] pointer-events-none hidden lg:block" />

            <div className="mb-6 md:mb-10 relative z-10">
              <div className="flex flex-wrap items-center gap-2 mb-4 md:mb-6">
                {product.subtitle && (
                  <span className="bg-black text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {product.subtitle}
                  </span>
                )}
                {product.ageGroup && (
                  <span className="bg-[#6C5CE7] text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    AGE: {product.ageGroup}
                  </span>
                )}
                {(product.minPlayers && product.maxPlayers) && (
                  <span className="bg-[#00B894] text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {product.minPlayers}-{product.maxPlayers} Players
                  </span>
                )}
              </div>

              <h1 className="font-header text-4xl md:text-7xl font-black mb-3 md:mb-4 tracking-tighter leading-[0.9] text-black">
                {product.name}
              </h1>

              <p className="font-bold text-sm md:text-base text-black/60 mb-6 md:mb-8 leading-relaxed max-w-xl">
                {product.description || "No description available."}
              </p>

              {product.category && (
                <div className="flex gap-2 mb-6 md:mb-10">
                  <span className="px-4 py-1.5 bg-black/5 text-black font-black text-[10px] tracking-widest rounded-full uppercase">
                    {product.category}
                  </span>
                </div>
              )}
            </div>

            {product.boxContent && (
              <div className="mb-8 md:mb-12 p-5 bg-white/40 backdrop-blur-sm border border-black/5 rounded-3xl">
                <p className="font-black text-[10px] uppercase tracking-widest mb-2 text-black/30">What&apos;s Inside:</p>
                <p className="font-bold text-xs md:text-sm text-black leading-relaxed">{product.boxContent}</p>
              </div>
            )}

            <div className="mt-auto bg-white/80 backdrop-blur-xl p-6 md:p-8 rounded-[2.5rem] border border-black/5 shadow-2xl">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 md:gap-10">
                <div className="text-left w-full sm:w-auto">
                  <p className="font-black text-[10px] tracking-[0.2em] text-black/20 mb-1">CURIOSITY PRICE</p>
                  <p className="font-black text-4xl md:text-5xl text-black tracking-tighter leading-none">₹{product.price.toLocaleString()}</p>
                </div>

                <div className="flex flex-col gap-3 w-full sm:w-auto min-w-[180px]">
                  <div className="flex items-center justify-between bg-black/5 rounded-2xl overflow-hidden p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl transition-all"
                    >
                      <Minus size={14} strokeWidth={3} />
                    </button>
                    <span className="font-black text-lg min-w-[2rem] text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl transition-all"
                    >
                      <Plus size={14} strokeWidth={3} />
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="w-full px-8 py-4 bg-black text-white font-black text-xs tracking-[0.2em] hover:scale-[1.02] hover:bg-[#6C5CE7] transition-all rounded-2xl shadow-xl shadow-black/10 uppercase"
                  >
                    Add to Bag
                  </button>
                </div>
              </div>
            </div>

            <p className="mt-6 text-black/20 font-black text-[10px] text-center sm:text-left uppercase tracking-widest">
              *Free secure delivery on all curiosities
            </p>
          </div>
        </div>

        {/* How to Play Section */}
        {product.howToPlay && (Array.isArray(product.howToPlay) ? product.howToPlay.length > 0 : false) && (
          <div className="mb-20 md:mb-32">
            <div className="text-center mb-12 md:mb-16">
              <span className="text-[10px] font-black text-[#6C5CE7] uppercase tracking-[0.4em] mb-4 block">Manifesto</span>
              <h2 className="font-header text-4xl md:text-6xl font-black uppercase tracking-tighter text-black leading-none mb-4">How to Master</h2>
              <p className="text-black/40 font-medium text-sm md:text-lg italic">Follow the prophecy in {Array.isArray(product.howToPlay) ? product.howToPlay.length : 0} delicate steps.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {Array.isArray(product.howToPlay) && product.howToPlay.map((step: any, index: number) => {
                return (
                  <div key={index} className="bg-white/60 backdrop-blur-md p-6 md:p-8 rounded-[2.5rem] border border-black/5 hover:border-[#6C5CE7]/30 transition-all group h-full flex flex-col">
                    <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center mb-6 text-lg font-black group-hover:scale-110 transition-transform">
                      {index + 1}
                    </div>
                    <h3 className="font-header text-xl md:text-2xl text-black mb-3 uppercase tracking-tight leading-tight">{step.title}</h3>
                    <p className="font-medium text-xs md:text-sm text-black/50 leading-relaxed">{step.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Features Section */}
        {product.features && product.features.length > 0 && (
          <div className="mb-20 md:mb-32">
            <div className="text-center mb-12 md:mb-20">
              <span className="text-[10px] font-black text-[#00B894] uppercase tracking-[0.4em] mb-4 block">Excellence</span>
              <h2 className="font-header text-4xl md:text-7xl font-black mb-4 text-black uppercase tracking-tighter leading-none">Curiosity Attributes</h2>
              <p className="font-medium text-sm md:text-xl text-black/40 italic">What makes this piece truly unique.</p>
            </div>

            <div className="bg-white/40 backdrop-blur-xl border border-black/5 rounded-[3rem] p-8 md:p-20 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD93D]/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#6C5CE7]/5 rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 relative z-10">
                {product.features.map((feature: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 md:gap-8 group"
                  >
                    <div className="w-10 md:w-14 h-10 md:h-14 rounded-2xl bg-black text-white flex-shrink-0 flex items-center justify-center font-black text-xl group-hover:rotate-12 transition-transform shadow-lg shadow-black/10">
                      {index + 1}
                    </div>
                    <div className="text-left flex-1 pt-1 md:pt-2">
                      <h3 className="font-black text-xl md:text-3xl mb-3 text-black leading-none tracking-tight">
                        {feature.title}
                      </h3>
                      <p className="font-bold text-sm md:text-lg text-black/30 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="pt-20 border-t border-black/5 text-left">
            <div className="flex items-end justify-between mb-12">
              <h2 className="font-header text-3xl md:text-5xl font-black text-black tracking-tighter leading-none">SIMILAR CURIOSITIES</h2>
              <Link href="/shop" className="text-[10px] font-black uppercase tracking-widest text-[#6C5CE7] hover:text-black transition-colors mb-1">View All</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {relatedProducts.map(relProduct => (
                <Link key={relProduct.id} href={`/shop/${relProduct.id}`} className="group block">
                  <div className="aspect-[3/4] overflow-hidden rounded-[2rem] border border-black/5 bg-white mb-6 transition-all group-hover:shadow-2xl group-hover:-translate-y-2 relative">
                    <Image
                      src={relProduct.image}
                      alt={relProduct.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <h3 className="font-black text-lg md:text-xl leading-tight group-hover:text-[#6C5CE7] transition-colors mb-1 tracking-tight">{relProduct.name}</h3>
                  <p className="font-bold text-xs uppercase tracking-widest text-black/30">₹{relProduct.price.toLocaleString()}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
