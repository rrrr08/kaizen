'use client';

import { getExperiences } from '@/lib/firebase';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Experiences() {
  const [experiences, setExperiences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        setLoading(true);
        const data = await getExperiences();
        setExperiences(data);
      } catch (err) {
        console.error('Error fetching experiences:', err);
        setError('Failed to load experiences');
      } finally {
        setLoading(false);
      }
    };

    fetchExperiences();
  }, []);

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="mb-20 border-b border-white/5 pb-12">
          <div className="text-amber-500 font-header text-[10px] tracking-[0.6em] mb-4 uppercase">Custom & Hosted Experiences</div>
          <h1 className="font-header text-5xl md:text-7xl lg:text-8xl tracking-tighter mb-8">
            PLAY FOR <br/><span className="text-amber-400">OCCASIONS</span>
          </h1>
          <p className="text-white/60 font-serif italic text-lg max-w-3xl">
            From corporate team-building to intimate celebrations, we design unforgettable experiences around game-based engagement.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mb-4"></div>
              <p className="text-white/60 font-header text-[10px] tracking-[0.4em]">LOADING EXPERIENCES...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-24">
            <p className="text-red-500 font-header text-[10px] tracking-[0.4em]">{error}</p>
          </div>
        )}

        {/* Experiences Grid */}
        {!loading && !error && (
          <div className="space-y-24">
            {experiences.map((exp, idx) => (
              <div key={exp.id} className={`grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center ${idx % 2 === 1 ? 'md:grid-flow-dense' : ''}`}>
                {/* Image */}
                <div className={`${idx % 2 === 1 ? 'md:col-start-2' : ''}`}>
                  <div className="aspect-square overflow-hidden rounded-sm border border-white/10 group hover:border-amber-500/40 transition-all bg-white/5">
                    <img 
                      src={exp.image}
                      alt={exp.title}
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500 hover:scale-105"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className={`${idx % 2 === 1 ? 'md:col-start-1' : ''}`}>
                  <div className="text-amber-500 font-header text-[10px] tracking-[0.6em] mb-6 uppercase">
                    {exp.category}
                  </div>
                  <h2 className="font-header text-4xl md:text-5xl mb-6 tracking-tight">
                    {exp.title}
                  </h2>
                  <p className="text-white/60 font-serif italic text-lg mb-8">
                    {exp.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-4 mb-8">
                    {exp.details?.map((detail: string, i: number) => (
                      <li key={i} className="flex gap-4">
                        <span className="text-amber-500 mt-1">→</span>
                        <span className="text-white/70 font-serif">{detail}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button className="px-8 py-4 bg-amber-500 text-black font-header text-[10px] tracking-[0.4em] hover:bg-amber-400 transition-all rounded-sm">
                    INQUIRE NOW
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && experiences.length === 0 && (
          <div className="text-center py-24">
            <p className="text-white/60 font-header text-[10px] tracking-[0.4em]">NO EXPERIENCES FOUND</p>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-24 pt-24 border-t border-white/10 text-center">
          <h2 className="font-header text-4xl md:text-5xl mb-6">Have a Unique Vision?</h2>
          <p className="text-white/60 font-serif italic text-lg mb-8 max-w-2xl mx-auto">
            We create bespoke experiences tailored to your specific needs and budget.
          </p>
          <button className="px-8 py-4 border border-amber-500 text-amber-500 font-header text-[10px] tracking-[0.4em] hover:bg-amber-500/10 transition-all rounded-sm">
            CONTACT OUR TEAM
          </button>
        </div>
      </div>
    </div>
  );
}
