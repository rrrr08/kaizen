'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to admin dashboard
    router.push('/admin/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen bg-[#050505]">
      <div className="text-center">
        <div className="text-[#FFD400] font-arcade tracking-[0.3em] animate-pulse text-xl">
          INITIALIZING_SYSTEM...
        </div>
        <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mt-4">ESTABLISHING_SECURE_CONNECTION</p>
      </div>
    </div>
  );
}
