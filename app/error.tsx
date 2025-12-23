'use client';

import Link from 'next/link';
import { AlertCircle, Home, ArrowLeft } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">
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
        <div className="mb-8">
          <h1 className="font-display text-5xl font-bold mb-4">Oops!</h1>
          <p className="text-muted-foreground font-body text-lg mb-4">
            Something went wrong. Our team has been notified.
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

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-header font-bold rounded hover:opacity-90 transition-all"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary/10 border border-primary/30 text-primary font-header font-bold rounded hover:bg-primary/20 transition-all"
          >
            <Home width={18} height={18} />
            Go Home
          </Link>
        </div>

        {/* Support Message */}
        <p className="text-xs text-muted-foreground mt-8">
          If this problem persists, please contact our support team.
        </p>
      </div>
    </div>
  );
}
