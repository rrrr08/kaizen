'use client';

import { useEffect, useState } from 'react';
import { Loader } from 'lucide-react';

export default function Loading() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + '.' : ''));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full animate-pulse"></div>
            <div className="relative bg-primary/10 border border-primary/30 rounded-full p-6">
              <Loader size={48} className="text-primary animate-spin" />
            </div>
          </div>
        </div>

        {/* Content */}
        <h1 className="font-display text-4xl font-bold mb-4">Loading{dots}</h1>
        <p className="text-muted-foreground font-body text-lg mb-8">
          Please wait while we prepare your experience.
        </p>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary via-primary/50 to-transparent animate-pulse" 
               style={{
                 animation: 'shimmer 2s infinite',
                 backgroundSize: '200% 100%',
               }}
          ></div>
        </div>

        <style>{`
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </div>
    </div>
  );
}
