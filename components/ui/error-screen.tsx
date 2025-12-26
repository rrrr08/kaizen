import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorScreenProps {
    error?: Error & { digest?: string };
    reset?: () => void;
    title?: string;
    message?: string;
}

export function ErrorScreen({ error, reset, title = "SYSTEM_FAILURE", message = "CRITICAL_ERROR_DETECTED" }: ErrorScreenProps) {
    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-8">
            <div className="max-w-md w-full bg-[#080808] border-2 border-red-500/50 rounded-[4px] p-8 shadow-[0_0_50px_rgba(239,68,68,0.2)] text-center relative overflow-hidden">

                {/* Scanlines Effect */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,2px_100%] pointer-events-none z-0"></div>

                <div className="relative z-10">
                    <div className="mx-auto w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/30 animate-pulse">
                        <AlertTriangle className="w-10 h-10 text-red-500" />
                    </div>

                    <h1 className="font-arcade text-3xl text-red-500 mb-2 tracking-widest text-shadow-glow">{title}</h1>
                    <p className="text-gray-400 font-mono text-xs uppercase mb-8 tracking-wider">{message}</p>

                    {error && (
                        <div className="bg-[#111] border border-red-900/30 p-4 rounded-sm mb-8 text-left overflow-hidden">
                            <p className="text-red-400 font-mono text-[10px] uppercase mb-1">ERROR_LOG_OUTPUT:</p>
                            <div className="text-gray-500 font-mono text-xs break-all">
                                &gt; {error.message || 'UNKNOWN_EXCEPTION'}
                            </div>
                            {error.digest && (
                                <div className="text-gray-600 font-mono text-[10px] mt-2">
                                    ID: {error.digest}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid gap-4">
                        {reset && (
                            <button
                                onClick={reset}
                                className="w-full py-4 bg-red-500 text-black font-arcade text-sm uppercase tracking-widest hover:bg-red-400 transition flex items-center justify-center gap-2 group"
                            >
                                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                                REBOOT_SYSTEM
                            </button>
                        )}

                        <Link
                            href="/"
                            className="w-full py-4 bg-transparent border border-[#333] text-gray-500 font-arcade text-sm uppercase tracking-widest hover:text-white hover:border-white transition flex items-center justify-center gap-2"
                        >
                            <Home className="w-4 h-4" />
                            RETURN_TO_BASE
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
