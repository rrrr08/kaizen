'use client';

import { Skeleton } from '@/components/ui/skeleton';

export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-background pt-32 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-12 text-center">
          <Skeleton className="h-12 w-1/2 mx-auto mb-4" />
          <Skeleton className="h-6 w-3/4 mx-auto" />
        </div>

        {/* Blog Posts Grid Skeleton */}
        <div className="space-y-12">
          {Array.from({ length: 3 }).map((_, i) => (
            <article key={i} className="space-y-4">
              <Skeleton className="w-full h-64 rounded-lg" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex gap-4">
                <Skeleton className="h-10 w-32" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
