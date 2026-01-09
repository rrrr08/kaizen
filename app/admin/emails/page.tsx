'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page has been merged with the Unified Dispatch Hub
// Redirecting to the centralized communication management page
export default function EmailsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/push-notifications');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFDF5]">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent mb-4"></div>
        <p className="text-lg font-black text-[#2D3436] uppercase tracking-widest">Redirecting to Dispatch Hub...</p>
      </div>
    </div>
  );
}
