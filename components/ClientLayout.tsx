'use client';

import { useState, useEffect } from 'react';
import SplashScreen from '@/components/ui/SplashScreen';
import Navbar from '@/components/ui/JoyNavbar';
import Footer from '@/components/ui/Footer';
import { useAuth } from '@/app/context/AuthContext';

interface ClientLayoutProps {
    children: React.ReactNode;
}

const SPLASH_SHOWN_KEY = 'joy-juncture-splash-shown';
const LAST_USER_KEY = 'joy-juncture-last-user';

export default function ClientLayout({ children }: ClientLayoutProps) {
    const [showSplash, setShowSplash] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const { user, loading } = useAuth();

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient || loading) return;

        const splashShown = localStorage.getItem(SPLASH_SHOWN_KEY);
        const lastUserId = localStorage.getItem(LAST_USER_KEY);
        const currentUserId = user?.uid || 'guest';

        // Show splash if:
        // 1. Never shown before (first visit)
        // 2. User changed (signed in/up from guest, or switched accounts)
        const shouldShowSplash = !splashShown || lastUserId !== currentUserId;

        if (shouldShowSplash) {
            setShowSplash(true);
            localStorage.setItem(SPLASH_SHOWN_KEY, 'true');
            localStorage.setItem(LAST_USER_KEY, currentUserId);
        }
    }, [isClient, user, loading]);

    const handleSplashComplete = () => {
        setShowSplash(false);
    };

    // Don't render splash on server
    if (!isClient) {
        return (
            <>
                <Navbar />
                {children}
                <Footer />
            </>
        );
    }

    return (
        <>
            {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
            <Navbar />
            {children}
            <Footer />
        </>
    );
}
