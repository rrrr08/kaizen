'use client';

import { Skeleton } from '@/components/ui/skeleton';

export default function WalletLoading() {
  return (
    <div className="min-h-screen bg-background pt-32 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-12">
          <Skeleton className="h-12 w-1/3 mb-4" />
        </div>

        {/* Balance Card Skeleton */}
        <div className="bg-gradient-to-r from-amber-600/20 to-orange-600/20 rounded-lg p-8 mb-12 space-y-4">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-12 w-1/3" />
        </div>

        {/* Sections Skeleton */}
        <div className="space-y-12">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-8 w-1/4" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-20 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
