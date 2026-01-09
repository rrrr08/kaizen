'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import SplashScreen from '@/components/ui/SplashScreen';
import Navbar from '@/components/ui/JoyNavbar';
import Footer from '@/components/ui/Footer';
import { useAuth } from '@/app/context/AuthContext';

interface ClientLayoutProps {
    children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
    const pathname = usePathname();
    const isHomePage = pathname === '/';
    const [showSplash, setShowSplash] = useState(isHomePage);
    const [isClient, setIsClient] = useState(false);
    const [hasShownInitialSplash, setHasShownInitialSplash] = useState(false);

    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user && !user.emailVerified) {
            // Paths that unverified users are ALLOWED to visit
            const allowedPaths = [
                '/auth/verify',
                '/auth/action',
                '/auth/signout',
                '/auth/login', // Just in case
                '/terms',
                '/privacy',
                '/contact'
            ];

            // Check if current path is allowed
            // We use startsWith to allow for sub-paths (e.g. /auth/action?mode=...)
            const isAllowed = allowedPaths.some(path => pathname === path || pathname?.startsWith(path + '/'));

            if (!isAllowed) {
                // If they are on home page, we might want to let them see it, but user asked to prevent entering pages.
                // Redirect to verify page
                router.push(`/auth/verify?email=${encodeURIComponent(user.email || '')}&redirect=${encodeURIComponent(pathname || '/')}`);
            }
        }
    }, [user, loading, pathname, router]);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Show splash only on home page initial load
    useEffect(() => {
        if (!isClient || loading) return;

        if (!hasShownInitialSplash && pathname === '/') {
            setShowSplash(true);
            setHasShownInitialSplash(true);
        } else if (!hasShownInitialSplash) {
            // If not on home page, just mark as shown without displaying
            setHasShownInitialSplash(true);
        }
    }, [isClient, loading, hasShownInitialSplash, pathname]);

    const handleSplashComplete = () => {
        setShowSplash(false);
    };

    // On home page, block content until splash completes
    if (isHomePage && (!isClient || showSplash)) {
        return (
            <>
                {isClient && <SplashScreen onComplete={handleSplashComplete} />}
            </>
        );
    }

    const isAdminPage = pathname?.startsWith('/admin');

    // For other pages or after splash completes
    return (
        <>
            {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
            {!isAdminPage && <Navbar />}
            {children}
            {!isAdminPage && <Footer />}
        </>
    );
}
