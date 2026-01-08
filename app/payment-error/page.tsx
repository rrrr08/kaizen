'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AlertCircle, Home, RotateCcw, MessageSquare } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function PaymentError() {
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    setRetrying(true);
    // Redirect back to checkout to retry
    window.location.href = '/checkout';
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-[#2D3436] flex items-center justify-center px-4 md:px-6 pt-28 pb-16">
      <div className="max-w-xl w-full">
        {/* Icon */}
        <div className="mb-10 flex justify-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-[#FF7675] rounded-full blur-[40px] opacity-20 transition-opacity"></div>
            <div className="relative bg-white shadow-2xl shadow-red-100 rounded-full p-8 border border-red-50">
              <AlertCircle size={64} className="text-[#FF7675]" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-header text-4xl md:text-5xl font-black mb-4 text-black tracking-tighter leading-none uppercase">Payment Failed</h1>
          <p className="text-black/40 font-medium text-base md:text-lg italic">
            Your curiosity journey hit a snag. No charges were made.
          </p>
        </div>

        {/* Error Details */}
        <div className="bg-white/60 backdrop-blur-md border border-black/5 rounded-[2.5rem] p-6 md:p-10 mb-6 shadow-xl shadow-black/5">
          <p className="text-[10px] font-black text-black/20 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
            Potential Obstacles
          </p>
          <ul className="space-y-4">
            <li className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-red-50 text-[#FF7675] flex items-center justify-center flex-shrink-0 text-[10px] font-black border border-red-100 italic">!</div>
              <span className="text-sm font-bold text-black/60">Insufficient funds or daily limit reached</span>
            </li>
            <li className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-red-50 text-[#FF7675] flex items-center justify-center flex-shrink-0 text-[10px] font-black border border-red-100 italic">!</div>
              <span className="text-sm font-bold text-black/60">Incorrect authentication or card status</span>
            </li>
            <li className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-[#FFD93D]/10 text-black flex items-center justify-center flex-shrink-0 text-[10px] font-black border border-[#FFD93D]/20">?</div>
              <span className="text-sm font-bold text-black/60 italic">International card usage limitations</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3 px-2">
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-black text-white font-black text-xs tracking-[0.2em] uppercase rounded-[2rem] shadow-xl shadow-black/20 hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            <RotateCcw size={18} strokeWidth={3} />
            {retrying ? 'Attempting Recovery...' : 'Retry Transaction'}
          </button>

          <Link
            href="/shop"
            className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-white border border-black/5 text-black font-black text-xs tracking-[0.2em] uppercase rounded-[2rem] shadow-sm hover:gray-50 transition-all"
          >
            <Home size={18} strokeWidth={3} />
            Return to Gallery
          </Link>

          <div className="pt-6 text-center">
            <a
              href="mailto:support@joyjuncture.com"
              className="text-[10px] font-black text-black/20 hover:text-[#6C5CE7] uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare size={14} /> Contact Curator Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
