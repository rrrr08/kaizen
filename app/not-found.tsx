'use client';

import Link from 'next/link';
import { AlertTriangle, Home, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6 pt-32 pb-16">
      <div className="max-w-lg w-full text-center">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-amber-500/20 blur-lg rounded-full"></div>
            <div className="relative bg-amber-500/10 border border-amber-500/30 rounded-full p-6">
              <AlertTriangle size={48} className="text-amber-500" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mb-8">
          <h1 className="font-display text-6xl font-bold mb-4">404</h1>
          <p className="text-2xl font-header tracking-widest mb-4">PAGE NOT FOUND</p>
          <p className="text-muted-foreground font-body text-lg">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        {/* Suggestions */}
        <div className="mb-8 p-6 bg-white/5 border border-white/10 rounded-lg">
          <p className="text-sm text-muted-foreground mb-4 font-header">You might want to visit:</p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <Link href="/shop" className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
              <ArrowRight size={12} /> Shop
            </Link>
            <Link href="/wallet" className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
              <ArrowRight size={12} /> Wallet
            </Link>
            <Link href="/events" className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
              <ArrowRight size={12} /> Events
            </Link>
            <Link href="/community" className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
              <ArrowRight size={12} /> Community
            </Link>
          </div>
        </div>

        {/* Action */}
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary text-primary-foreground font-header font-bold rounded hover:opacity-90 transition-all"
        >
          <Home size={18} />
          Go Home
        </Link>
      </div>
    </div>
  );
}
