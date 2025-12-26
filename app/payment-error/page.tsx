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
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6 pt-28 pb-16">
      <div className="max-w-xl w-full border border-[#333] bg-[#050505] p-8 md:p-12 relative overflow-hidden">
        {/* Background Grids */}
        <div className="absolute inset-0 bg-[#FF003C]/5 bg-grid-white/[0.05] pointer-events-none"></div>

        {/* Icon */}
        <div className="mb-8 flex justify-center relative z-10">
          <div className="relative group">
            <div className="absolute inset-0 bg-[#FF003C] rounded-full blur-[30px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative bg-[#080808] border border-[#FF003C] rounded-full p-6 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(255,0,60,0.3)]">
              <AlertCircle size={48} className="text-[#FF003C]" strokeWidth={2} />
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8 relative z-10">
          <h1 className="font-arcade text-4xl md:text-5xl mb-4 text-[#FF003C] text-shadow-neon uppercase tracking-tight">SYSTEM_FAILURE</h1>
          <p className="text-gray-400 font-mono text-sm max-w-sm mx-auto">
            Transaction aborted. No assets were deducted from your account.
          </p>
        </div>

        {/* Error Details */}
        <div className="bg-[#FF003C]/5 border border-[#FF003C]/30 rounded-sm p-6 mb-8 relative z-10">
          <p className="text-xs font-arcade text-[#FF003C] uppercase tracking-widest mb-4 flex items-center gap-2">
            <span>[ERROR_LOG]</span> DIAGNOSTICS:
          </p>
          <ul className="space-y-3 text-xs font-mono text-gray-400">
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 bg-[#FF003C] mt-1.5"></span>
              <span>INSUFFICIENT_FUNDS or DAILY_LIMIT_EXCEEDED</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 bg-[#FF003C] mt-1.5"></span>
              <span>INVALID_CREDENTIALS or INPUT_ERROR</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 bg-[#FF003C] mt-1.5"></span>
              <span>GATEWAY_TIMEOUT (BANK_SIDE_REJECTION)</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-4 relative z-10">
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#FF003C] text-black border-b-4 border-[#8B0000] font-arcade text-xs tracking-[0.2em] uppercase hover:bg-white hover:text-black hover:border-white transition-all active:translate-y-1 active:border-b-0"
          >
            <RotateCcw size={16} strokeWidth={2} />
            {retrying ? 'REINITIALIZING...' : 'RETRY_TRANSACTION'}
          </button>

          <Link
            href="/shop"
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-transparent border border-gray-600 text-gray-400 font-arcade text-xs tracking-[0.2em] uppercase hover:text-white hover:border-white transition-all"
          >
            <Home size={16} strokeWidth={2} />
            ABORT_TO_VAULT
          </Link>

          <a
            href="mailto:support@joyjuncture.com"
            className="w-full flex items-center justify-center gap-2 px-6 py-2 bg-transparent text-gray-600 font-mono text-[10px] uppercase hover:text-[#FF8C00] transition-all"
          >
            <MessageSquare size={12} />
            REQUEST_HUMAN_ASSISTANCE
          </a>
        </div>
      </div>
    </div>
  );
}
