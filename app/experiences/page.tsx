'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default function Experiences() {
  const [experiences, setExperiences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        setLoading(true);
        const { getExperiences } = await import('@/lib/firebase');
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
    <div className="min-h-screen pt-28 pb-16 bg-[#FFFDF5]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="mb-20 border-b-2 border-black pb-12">
          <div className="text-[#6C5CE7] font-black text-sm tracking-[0.2em] mb-4 uppercase font-display">Custom & Hosted Experiences</div>
          <h1 className="font-header text-6xl md:text-8xl tracking-tighter mb-8 text-[#2D3436]">
            PLAY FOR <br /><span className="text-[#FFD93D] drop-shadow-[2px_2px_0px_#000] italic font-serif">OCCASIONS</span>
          </h1>
          <p className="text-black/80 font-bold text-xl max-w-3xl leading-relaxed">
            From corporate team-building to intimate celebrations, we design unforgettable experiences around game-based engagement.
          </p>
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
          <div className="space-y-24">
            {experiences.map((exp, idx) => (
              <div key={exp.id} className={`grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center ${idx % 2 === 1 ? 'md:grid-flow-dense' : ''}`}>
                {/* Image */}
                <div className={`${idx % 2 === 1 ? 'md:col-start-2' : ''}`}>
                  <div className="aspect-square overflow-hidden rounded-[30px] border-3 border-black neo-shadow bg-white group transition-transform hover:scale-[1.02] relative">
                    <Image
                      src={exp.image}
                      alt={exp.title}
                      fill
                      className="object-cover transition-all duration-700 group-hover:scale-110"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className={`${idx % 2 === 1 ? 'md:col-start-1' : ''}`}>
                  <div className="bg-[#FFD93D] text-black px-4 py-2 rounded-lg neo-border shadow-[2px_2px_0px_#000] inline-block font-black text-xs tracking-[0.2em] mb-6 uppercase">
                    {exp.category}
                  </div>
                  <h2 className="font-header text-5xl md:text-6xl mb-6 tracking-tight text-black">
                    {exp.title}
                  </h2>
                  <p className="text-black/80 font-medium text-lg mb-8 leading-relaxed">
                    {exp.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-4 mb-8">
                    {exp.details?.map((detail: string, i: number) => (
                      <li key={i} className="flex gap-4 items-start">
                        <span className="flex items-center gap-2"><ArrowRight size={16} className="text-[#6C5CE7]" />{detail}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button className="px-8 py-4 bg-black text-white font-black text-xs tracking-[0.2em] hover:bg-[#6C5CE7] hover:scale-105 transition-all rounded-xl border-2 border-transparent shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
                    INQUIRE NOW
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && experiences.length === 0 && (
          <div className="text-center py-24">
            <p className="text-black/60 font-black text-lg uppercase">NO EXPERIENCES FOUND</p>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-24 pt-24 border-t-2 border-black/10 text-center">
          <h2 className="font-header text-4xl md:text-6xl mb-6 text-black">Have a Unique Vision?</h2>
          <p className="text-black/70 font-bold text-lg mb-8 max-w-2xl mx-auto">
            We create bespoke experiences tailored to your specific needs and budget.
          </p>
          <button className="px-10 py-5 bg-[#00B894] text-black font-black text-xs tracking-[0.2em] neo-border neo-shadow hover:scale-105 transition-all rounded-xl">
            CONTACT OUR TEAM
          </button>
        </div>
      </div>
    </div>
  );
}
