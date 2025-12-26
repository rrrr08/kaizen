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
    <div className="min-h-screen bg-[#FFFDF5] text-[#2D3436] flex items-center justify-center px-6 pt-28 pb-16">
      <div className="max-w-xl w-full">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-[#FF7675] rounded-full blur-[20px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative bg-[#FF7675] border-3 border-black rounded-full p-6 neo-shadow group-hover:scale-110 transition-transform">
              <AlertCircle size={48} className="text-white" strokeWidth={3} />
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-header text-5xl font-black mb-4 text-black uppercase tracking-tight">OOF! Payment Failed</h1>
          <p className="text-black/70 font-bold text-lg">
            We couldn't process your payment. No worries, you haven't been charged.
          </p>
        </div>

        {/* Error Details */}
        <div className="bg-[#FF7675]/10 border-2 border-black rounded-[20px] p-6 mb-8 neo-shadow">
          <p className="text-sm font-black text-black uppercase tracking-widest mb-4 flex items-center gap-2">
            <span>🧐</span> What went wrong?
          </p>
          <ul className="space-y-3 text-sm font-bold text-black/70">
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 bg-[#FF7675] rounded-full border border-black mt-1.5"></span>
              <span>Insufficient funds or daily limit reached</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 bg-[#FF7675] rounded-full border border-black mt-1.5"></span>
              <span>Incorrect card details entered</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 bg-[#FF7675] rounded-full border border-black mt-1.5"></span>
              <span>Bank declined transaction (security check)</span>
            </li>
          </ul>
        </div>

        {/* International Card Notice */}
        <div className="bg-[#FFD93D]/20 border-2 border-black rounded-[20px] p-6 mb-8 neo-shadow">
          <p className="text-sm font-black text-black uppercase tracking-widest mb-3 flex items-center gap-2">
            <span>💳</span> Using an International Card?
          </p>
          <p className="text-sm font-bold text-black/80 mb-4">
            We currently don't support international cards directly.
          </p>
          <div className="p-3 bg-white border-2 border-black rounded-xl">
            <p className="text-sm font-black text-black">💡 Pro Tip:</p>
            <p className="text-sm text-black/70 font-medium">Use UPI or a domestic Indian card for the smoothest experience.</p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#6C5CE7] text-white border-2 border-black font-black text-sm tracking-widest uppercase rounded-[15px] hover:bg-[#5a4bd1] hover:-translate-y-1 transition-all neo-shadow active:translate-y-0 active:shadow-none"
          >
            <RotateCcw size={18} strokeWidth={3} />
            {retrying ? 'Loading...' : 'Try Again'}
          </button>

          <Link
            href="/shop"
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-black text-black font-black text-sm tracking-widest uppercase rounded-[15px] hover:bg-gray-50 hover:-translate-y-1 transition-all neo-shadow"
          >
            <Home size={18} strokeWidth={3} />
            Back to Shop
          </Link>

          <a
            href="mailto:support@joyjuncture.com"
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-transparent border-2 border-transparent text-black/60 font-black text-xs tracking-widest uppercase rounded-[15px] hover:text-black hover:border-black/10 transition-all"
          >
            <MessageSquare size={16} />
            Need Help? Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
