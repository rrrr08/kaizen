import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
    message?: string;
}

export function LoadingScreen({ message = "INITIALIZING_SYSTEM..." }: LoadingScreenProps) {
    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-8">
            <div className="text-center">
                <div className="relative inline-block mb-8">
                    <div className="absolute inset-0 bg-[#FFD400]/20 blur-xl rounded-full animate-pulse"></div>
                    <div className="relative bg-[#111] border-2 border-[#333] rounded-full p-8 flex items-center justify-center">
                        <Loader2 className="w-12 h-12 text-[#FFD400] animate-spin" />
                    </div>
                </div>

                <h2 className="font-arcade text-2xl text-white mb-2 tracking-[0.2em] animate-pulse">
                    {message}
                </h2>

                <div className="w-64 h-1 bg-[#111] rounded-full mx-auto overflow-hidden mt-6 border border-[#333]">
                    <div className="h-full bg-[#FFD400] w-1/3 animate-[slide_1.5s_ease-in-out_infinite]"></div>
                </div>

                <div className="mt-4 text-[#00B894] font-mono text-xs uppercase tracking-widest">
                    ESTABLISHING_SECURE_CONNECTION
                </div>

                <style jsx>{`
          @keyframes slide {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(300%); }
          }
        `}</style>
            </div>
        </div>
    );
}
