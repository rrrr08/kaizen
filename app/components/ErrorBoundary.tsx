'use client';

import { ReactNode, useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface ErrorBoundaryProps {
  children: ReactNode;
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Error caught by boundary:', event.error);
      setHasError(true);
      setError(event.error);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      setHasError(true);
      setError(
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason))
      );
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
        <div className="max-w-lg w-full text-center">
          {/* Icon */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 blur-lg rounded-full"></div>
              <div className="relative bg-red-500/10 border border-red-500/30 rounded-full p-6">
                <AlertCircle size={48} className="text-red-500" />
              </div>
            </div>
          </div>

          {/* Content */}
          <h1 className="font-display text-4xl font-bold mb-4">Something Went Wrong</h1>
          <p className="text-muted-foreground font-body text-lg mb-8">
            We encountered an unexpected error. Please try refreshing the page.
          </p>

          {/* Error Details (Dev Only) */}
          {process.env.NODE_ENV === 'development' && error && (
            <div className="mb-8 p-4 bg-red-950/20 border border-red-500/30 rounded-lg text-left">
              <p className="text-xs text-red-400 font-mono break-all">
                {error.message}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-4">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-primary text-primary-foreground font-header font-bold rounded hover:opacity-90 transition-all"
            >
              Refresh Page
            </button>
            <Link
              href="/"
              className="w-full block px-6 py-3 bg-primary/10 border border-primary/30 text-primary font-header font-bold rounded hover:bg-primary/20 transition-all"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
