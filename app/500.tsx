'use client';

import Link from 'next/link';
import { Home, RotateCcw, ShieldAlert } from 'lucide-react';

export default function ServerError() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6 selection:bg-[#FF003C] selection:text-white font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#FF003C]/50"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-[#FF003C]/50"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#FF003C]/5 blur-[120px] pointer-events-none"></div>
      </div>

      <div className="max-w-xl w-full relative z-10 font-mono">
        {/* Decorative Header */}
        <div className="flex justify-between items-center mb-8 text-[#FF003C] text-[10px] tracking-widest border-b border-[#FF003C]/30 pb-2">
          <span>SYS_CRITICAL</span>
          <span>ERROR_CODE: 500</span>
        </div>

        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-[#FF003C]/20 blur-xl rounded-full animate-pulse"></div>
            <div className="relative bg-[#111] border-2 border-[#FF003C] rounded-full p-8 shadow-[0_0_30px_rgba(255,0,60,0.3)]">
              <ShieldAlert size={64} className="text-[#FF003C]" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <h1 className="font-arcade text-6xl font-black mb-2 text-white text-3d-red tracking-widest">
            SYSTEM<br />FAILURE
          </h1>
          <p className="text-sm font-mono text-[#FF003C] tracking-widest mb-4 uppercase animate-pulse">
            Internal_Server_Error_Detected
          </p>
          <div className="bg-[#1a0505] border border-[#FF003C]/30 p-4 rounded-sm text-left relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#FF003C]"></div>
            <p className="text-gray-400 font-mono text-xs leading-relaxed">
              <span className="text-[#FF003C]">{'>'}</span> DIAGNOSTIC: UNEXPECTED TERMINATION<br />
              <span className="text-[#FF003C]">{'>'}</span> ROOT CAUSE: UNKNOWN<br />
              <span className="text-[#FF003C]">{'>'}</span> ACTION: REBOOT ADVISED
            </p>
          </div>
        </div>

        {/* Possible Issues */}
        <div className="bg-[#111] border border-[#333] p-6 mb-8 rounded-sm">
          <p className="text-[10px] text-gray-500 mb-4 font-arcade tracking-[0.2em] uppercase">
            Potential_Causes:
          </p>
          <ul className="space-y-2 text-xs text-gray-400 font-mono">
            <li className="flex items-start gap-2">
              <span className="text-[#FF003C] blink">_</span>
              <span>Maintenance protocols in progress</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FF003C] blink">_</span>
              <span>Database uplink severed</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FF003C] blink">_</span>
              <span>Traffic overload on mainframe</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-[#FF003C] text-white rounded-sm hover:bg-[#ff1f53] hover:shadow-[0_0_20px_#FF003C] transition-all font-arcade text-xs tracking-[0.2em] uppercase"
          >
            <RotateCcw size={16} />
            REBOOT_SYSTEM
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-8 py-4 bg-transparent border border-white text-white rounded-sm hover:bg-white hover:text-black transition-all font-arcade text-xs tracking-[0.2em] uppercase"
          >
            <Home size={16} />
            ABORT_TO_HOME
          </Link>
        </div>

        {/* Support Message */}
        <div className="mt-12 text-center">
          <p className="text-[10px] text-gray-600 font-mono uppercase">
            PERSISTENT_FAILURE? <span className="text-gray-400 underline cursor-pointer hover:text-white">INITIATE_SUPPORT_TICKET</span>
          </p>
        </div>
      </div>
    </div>
  );
}
