'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

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
    <div className="min-h-screen pt-28 pb-16 bg-black text-white relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute inset-0 pixel-grid opacity-20 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FF8C00]/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Header */}
        <div className="mb-20 border-b-2 border-[#333] pb-12">
          <div className="text-[#FF8C00] font-arcade text-sm tracking-[0.2em] mb-4 uppercase">Custom & Hosted Experiences</div>
          <h1 className="font-arcade text-6xl md:text-8xl tracking-tighter mb-8 text-white text-3d-orange">
            PLAY FOR <br /><span className="text-[#00B894] italic font-serif">OCCASIONS</span>
          </h1>
          <p className="text-gray-400 font-bold text-xl max-w-3xl leading-relaxed font-arcade tracking-wide">
            From corporate team-building to intimate celebrations, we design unforgettable experiences around game-based engagement.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="inline-block animate-pulse font-arcade text-[#FF8C00] text-lg tracking-widest">LOADING_EXPERIENCE_MODULES...</div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-24">
            <p className="text-red-500 font-arcade text-lg">{error}</p>
          </div>
        )}

        {/* Experiences Grid */}
        {!loading && !error && (
          <div className="space-y-24">
            {experiences.map((exp, idx) => (
              <div key={exp.id} className={`grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center ${idx % 2 === 1 ? 'md:grid-flow-dense' : ''}`}>
                {/* Image */}
                <div className={`${idx % 2 === 1 ? 'md:col-start-2' : ''}`}>
                  <div className="aspect-square overflow-hidden arcade-card-3d bg-[#111] group transition-transform hover:scale-[1.02]">
                    <img
                      src={exp.image}
                      alt={exp.title}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className={`${idx % 2 === 1 ? 'md:col-start-1' : ''}`}>
                  <div className="bg-[#FF8C00] text-black px-4 py-2 border border-[#FF8C00] inline-block font-arcade text-xs tracking-[0.2em] mb-6 uppercase">
                    {exp.category}
                  </div>
                  <h2 className="font-arcade text-4xl md:text-5xl mb-6 tracking-tight text-white uppercase text-3d-purple">
                    {exp.title}
                  </h2>
                  <p className="text-gray-400 font-medium text-lg mb-8 leading-relaxed font-sans">
                    {exp.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-4 mb-8">
                    {exp.details?.map((detail: string, i: number) => (
                      <li key={i} className="flex gap-4 items-start">
                        <span className="text-[#00B894] mt-1 font-arcade">&gt;&gt;</span>
                        <span className="text-gray-300 font-bold font-sans">{detail}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button className="px-8 py-4 bg-[#FF8C00] text-black font-arcade text-xs tracking-[0.2em] hover:bg-white transition-all border-b-4 border-[#A0522D] active:border-b-0 active:translate-y-1 uppercase">
                    INQUIRE NOW
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && experiences.length === 0 && (
          <div className="text-center py-24 border border-[#333] bg-[#111]">
            <p className="text-gray-500 font-arcade text-lg uppercase">NO EXPERIENCES FOUND_</p>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-24 pt-24 border-t-2 border-[#333] text-center">
          <h2 className="font-arcade text-4xl md:text-6xl mb-6 text-white uppercase text-3d-green">Have a Unique Vision?</h2>
          <p className="text-gray-400 font-bold text-lg mb-8 max-w-2xl mx-auto font-sans">
            We create bespoke experiences tailored to your specific needs and budget.
          </p>
          <button className="px-10 py-5 bg-[#00B894] text-black font-arcade text-xs tracking-[0.2em] hover:bg-white transition-all border-b-4 border-[#006266] active:border-b-0 active:translate-y-1 uppercase">
            CONTACT OUR TEAM
          </button>
        </div>
      </div>
    </div>
  );
}
