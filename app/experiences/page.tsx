'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { ExperienceCategory } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default function Experiences() {
  const [categories, setCategories] = useState<ExperienceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const { getExperienceCategories } = await import('@/lib/firebase');
        const data = await getExperienceCategories();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching experience categories:', err);
        setError('Failed to load experience categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen pt-28 pb-16 bg-[#FFFDF5]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="mb-20 border-b-4 border-black pb-12">
          <div className="flex flex-col items-start">
            <div className="text-[#6C5CE7] font-black text-xs md:text-sm tracking-[0.3em] mb-6 uppercase font-display bg-white px-3 py-1 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000]">
              Custom & Hosted Experiences
            </div>
            <h1 className="font-header tracking-tighter text-[#2D3436] flex flex-col items-start leading-none mb-8">
              <span className="text-3xl md:text-4xl font-black uppercase mb-1">PLAY FOR</span>
              <span className="text-6xl md:text-9xl italic font-serif text-black drop-shadow-[4px_4px_0px_#FFD93D] relative z-10">
                OCCASIONS
              </span>
            </h1>
            <p className="text-black/80 font-bold text-lg md:text-2xl max-w-3xl leading-relaxed">
              From corporate team-building to intimate celebrations, we design unforgettable experiences around game-based engagement.
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#FFD93D] border-t-black mb-4"></div>
              <p className="text-black/60 font-black text-xs tracking-[0.4em]">LOADING EXPERIENCES...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-24">
            <p className="text-red-500 font-black text-lg">{error}</p>
          </div>
        )}

        {/* Experiences Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 md:gap-12">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/experiences/${category.slug}`}
                className="group block"
              >
                <div className="bg-white rounded-[30px] border-3 border-black neo-shadow overflow-hidden hover:scale-[1.02] transition-all duration-300">
                  {/* Image */}
                  <div className="aspect-square overflow-hidden relative rounded-t-[30px]">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover transition-all duration-700 group-hover:scale-110"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    <div className="bg-[#FFD93D] text-black px-4 py-2 rounded-lg neo-border shadow-[2px_2px_0px_#000] inline-block font-black text-xs tracking-wider md:tracking-[0.2em] mb-4 uppercase">
                      {category.name}
                    </div>
                    <p className="text-black/80 font-medium text-lg mb-6 leading-relaxed line-clamp-5 md:line-clamp-6 break-words overflow-hidden">
                      {category.shortDescription}
                    </p>

                    {/* CTA */}
                    <div className="flex items-center gap-2 text-[#6C5CE7] font-black text-sm tracking-[0.2em] uppercase group-hover:gap-4 transition-all">
                      EXPLORE EXPERIENCE
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && !error && categories.length === 0 && (
          <div className="text-center py-24">
            <p className="text-black/60 font-black text-lg uppercase">NO EXPERIENCE CATEGORIES FOUND</p>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-24 pt-24 border-t-2 border-black/10 text-center">
          <h2 className="font-header text-4xl md:text-6xl mb-6 text-black">Have a Unique Vision?</h2>
          <p className="text-black/70 font-bold text-lg mb-8 max-w-2xl mx-auto">
            We create bespoke experiences tailored to your specific needs and budget.
          </p>
          <Link href="/contact" className="px-10 py-5 bg-[#00B894] text-black font-black text-xs tracking-[0.2em] neo-border neo-shadow hover:scale-105 transition-all rounded-xl inline-block">
            CONTACT OUR TEAM
          </Link>
        </div>
      </div>
    </div>
  );
}
