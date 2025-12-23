'use client';

import Link from 'next/link';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';

interface ShopErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ShopError({ error, reset }: ShopErrorProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6 pt-28 pb-16">
      <div className="max-w-lg w-full">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 blur-lg rounded-full"></div>
            <div className="relative bg-red-500/10 border border-red-500/30 rounded-full p-6">
              <AlertCircle width={48} height={48} className="text-red-500" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold mb-4">Oops!</h1>
          <p className="text-muted-foreground font-body text-lg mb-4">
            We couldn't load the shop. Please try again.
          </p>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && error && (
            <div className="mt-6 p-4 bg-red-950/20 border border-red-500/30 rounded-lg text-left">
              <p className="text-xs text-red-400 font-mono break-all">
                {error.message || 'Unknown error'}
              </p>
              {error.digest && (
                <p className="text-xs text-red-400/70 font-mono mt-2">
                  ID: {error.digest}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Possible Issues */}
        <div className="bg-red-950/20 border border-red-500/30 rounded-lg p-6 mb-8">
          <p className="text-sm text-red-300 mb-4 font-header">
            What might have happened:
          </p>
          <ul className="space-y-2 text-sm text-red-300/80">
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>Network connection issue</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>Temporary server error</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>Products database unavailable</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-body font-semibold"
          >
            <RotateCcw width={18} height={18} />
            Try Again
          </button>
          <Link
            href="/shop"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-foreground rounded-lg hover:bg-white/20 transition-colors font-body font-semibold"
          >
            <ArrowLeft width={18} height={18} />
            Back to Shop
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-foreground rounded-lg hover:bg-white/20 transition-colors font-body font-semibold"
          >
            <Home width={18} height={18} />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}

import { RotateCcw } from 'lucide-react';
