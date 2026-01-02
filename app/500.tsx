'use client';

import Link from 'next/link';
import { AlertCircle, Home, RotateCcw } from 'lucide-react';

export default function ServerError() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6 pt-32 pb-16">
      <div className="max-w-lg w-full">
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
        <div className="text-center mb-8">
          <h1 className="font-display text-6xl font-bold mb-4">500</h1>
          <p className="text-2xl font-header tracking-widest mb-4">SERVER ERROR</p>
          <p className="text-muted-foreground font-body text-lg">
            Something went wrong on our end. Please try again later.
          </p>
        </div>

        {/* Possible Issues */}
        <div className="bg-red-950/20 border border-red-500/30 rounded-lg p-6 mb-8">
          <p className="text-sm text-red-300 mb-4 font-header">
            What might have happened:
          </p>
          <ul className="space-y-2 text-sm text-red-300/80">
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>Server is temporarily down for maintenance</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>Database connection error</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>Unexpected application error</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-body font-semibold"
          >
            <RotateCcw size={18} />
            Try Again
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-foreground rounded-lg hover:bg-white/20 transition-colors font-body font-semibold"
          >
            <Home size={18} />
            Home
          </Link>
        </div>

        {/* Support Message */}
        <div className="mt-12 p-6 bg-white/5 border border-white/10 rounded-lg text-center">
          <p className="text-sm text-muted-foreground font-body">
            If this problem persists, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
}
