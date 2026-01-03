'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
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
    const [previousAuthState, setPreviousAuthState] = useState<boolean | null>(null);
    const { user, loading } = useAuth();

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Show splash only on home page initial load
    useEffect(() => {
        if (!isClient || loading) return;

        if (!hasShownInitialSplash && pathname === '/') {
            setShowSplash(true);
            setHasShownInitialSplash(true);
            // Initialize the auth state after initial splash
            setPreviousAuthState(!!user);
        } else if (!hasShownInitialSplash) {
            // If not on home page, just mark as shown without displaying
            setHasShownInitialSplash(true);
            setPreviousAuthState(!!user);
        }
    }, [isClient, loading, hasShownInitialSplash, user, pathname]);

    // Show splash when user authenticates (not on initial load)
    useEffect(() => {
        if (!isClient || loading || !hasShownInitialSplash || previousAuthState === null) return;

        const isAuthenticated = !!user;
        
        // Show splash when transitioning from unauthenticated to authenticated
        if (previousAuthState === false && isAuthenticated) {
            setShowSplash(true);
        }
        
        setPreviousAuthState(isAuthenticated);
    }, [user, loading, isClient, hasShownInitialSplash, previousAuthState]);

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

    // For other pages or after splash completes
    return (
        <>
            {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
            <Navbar />
            {children}
            <Footer />
        </>
    );
}
