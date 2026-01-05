'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star, Users, Target, Gamepad2 } from 'lucide-react';
import { ExperienceCategory } from '@/lib/types';

export default function ExperienceCategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [category, setCategory] = useState<ExperienceCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        const { getExperienceCategoryBySlug } = await import('@/lib/firebase');
        const data = await getExperienceCategoryBySlug(slug);
        setCategory(data);
      } catch (err) {
        console.error('Error fetching experience category:', err);
        setError('Failed to load experience category');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCategory();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-16 bg-[#FFFDF5] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#FFD93D] border-t-black mb-4"></div>
          <p className="text-black/60 font-black text-xs tracking-[0.4em]">LOADING EXPERIENCE...</p>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen pt-28 pb-16 bg-[#FFFDF5] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-black text-lg">{error || 'Experience category not found'}</p>
        </div>
      </div>
    );
  }
 
  return (
    <div className="min-h-screen pt-28 pb-16 bg-[#FFFDF5]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="mb-20">
          <div className="text-[#6C5CE7] font-black text-sm tracking-[0.2em] mb-4 uppercase font-display">Custom Experience</div>
          <h1 className="font-header text-6xl md:text-8xl tracking-tighter mb-8 text-[#2D3436]">
            {category.name}
          </h1>
          <p className="text-black/80 font-bold text-xl max-w-3xl leading-relaxed">
            {category.shortDescription}
          </p>
        </div>

        {/* Hero Image */}
        <div className="mb-20">
          <div className="w-full max-w-5xl mx-auto">
            <div className="relative aspect-[16/9] overflow-hidden rounded-[30px] border-3 border-black neo-shadow bg-white">
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
              />
            </div>
          </div>
        </div>

        {/* Who it's for */}
        <section className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-header text-4xl md:text-5xl mb-6 tracking-tight text-black">
                Who This Experience is For
              </h2>
              <p className="text-black/80 font-medium text-lg leading-relaxed">
                {category.whoFor}
              </p>
            </div>
            <div className="bg-[#FFD93D] p-8 rounded-[20px] neo-border neo-shadow">
              <Users size={48} className="text-black mb-4" />
              <p className="text-black font-bold text-lg">
                Perfect for teams, families, and groups looking to create unforgettable memories through interactive gaming experiences.
              </p>
            </div>
          </div>
        </section>

        {/* Problems Solved */}
        <section className="mb-20">
          <h2 className="font-header text-4xl md:text-5xl mb-12 tracking-tight text-black text-center">
            Problems This Experience Solves
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {category.problemsSolved.map((problem, idx) => (
              <div key={idx} className="bg-white p-8 rounded-[20px] neo-border neo-shadow">
                <Target size={32} className="text-[#6C5CE7] mb-4" />
                <p className="text-black font-medium text-lg">{problem}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Games & Formats */}
        <section className="mb-20">
          <h2 className="font-header text-4xl md:text-5xl mb-12 tracking-tight text-black text-center">
            Games & Formats Used
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {category.gamesFormats.map((format, idx) => (
              <div key={idx} className="bg-[#00B894] text-white p-8 rounded-[20px] neo-border neo-shadow">
                <Gamepad2 size={32} className="mb-4" />
                <p className="font-bold text-lg">{format}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Image Gallery */}
        {category.imageGallery.length > 0 && (
          <section className="mb-20">
            <h2 className="font-header text-4xl md:text-5xl mb-12 tracking-tight text-black text-center">
              Experience Gallery
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {category.imageGallery.map((image, idx) => (
                <div key={idx} className="relative aspect-square overflow-hidden rounded-[20px] border-2 border-black neo-shadow bg-white">
                  <Image
                    src={image}
                    alt={`${category.name} gallery ${idx + 1}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Testimonials */}
        {category.testimonials.length > 0 && (
          <section className="mb-20">
            <h2 className="font-header text-4xl md:text-5xl mb-12 tracking-tight text-black text-center">
              What People Say
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {category.testimonials.map((testimonial, idx) => (
                <div key={idx} className="bg-white p-8 rounded-[20px] neo-border neo-shadow">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={20} className="text-[#FFD93D] fill-current" />
                    ))}
                  </div>
                  <p className="text-black/80 font-medium text-lg mb-4 italic">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center gap-4">
                    {testimonial.image && (
                      <Image
                        src={testimonial.image}
                        alt={testimonial.author}
                        width={48}
                        height={48}
                        className="rounded-full border-2 border-black"
                      />
                    )}
                    <div>
                      <p className="font-bold text-black">{testimonial.author}</p>
                      {testimonial.occasion && (
                        <p className="text-black/60 text-sm">{testimonial.occasion}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="text-center pt-16 border-t-2 border-black/10">
          <h2 className="font-header text-4xl md:text-6xl mb-6 text-black">
            Ready to Plan Your Experience?
          </h2>
          <p className="text-black/70 font-bold text-lg mb-8 max-w-2xl mx-auto">
            Let's create something amazing together. Fill out our enquiry form and we'll get back to you within 24 hours.
          </p>
          <Link
            href={`/experiences/${category.slug}/enquire`}
            className="inline-flex items-center gap-4 px-10 py-5 bg-[#6C5CE7] text-white font-black text-sm tracking-[0.2em] neo-border neo-shadow hover:scale-105 transition-all rounded-xl"
          >
            PLAN THIS EXPERIENCE
            <ArrowRight size={20} />
          </Link>
        </section>
      </div>
    </div>
  );
}