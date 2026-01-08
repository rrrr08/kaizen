'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { motion } from 'framer-motion';

export default function PlayLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, loading } = useAuth();

    // Protect all game-related routes under /play
    // Unauthorized users will be redirected to the login page
    useEffect(() => {
        if (!loading && !user) {
            console.log('[PlayLayout] Unauthorized access attempt, redirecting to login');
            router.push(`/auth/login?redirect=${pathname}`);
        }
    }, [user, loading, router, pathname]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#FFFDF5]">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <div className="w-16 h-16 border-8 border-black border-t-[#6C5CE7] rounded-full animate-spin mx-auto mb-6"></div>
                    <h2 className="text-2xl font-black text-black uppercase tracking-widest">
                        Verifying <span className="text-[#6C5CE7]">Identity</span>
                    </h2>
                    <p className="text-black/40 font-bold mt-2 uppercase text-xs tracking-[0.2em]">Preparing your game environment...</p>
                </motion.div>
            </div>
        );
    }

    // Prevent flash of protected content before redirect
    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#FFFDF5]">
                {/* Empty state while redirecting */}
            </div>
        );
    }

    return <>{children}</>;
}
