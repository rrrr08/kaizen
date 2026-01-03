'use client';

import { useState, useEffect } from 'react';
import SplashScreen from '@/components/ui/SplashScreen';
import Navbar from '@/components/ui/JoyNavbar';
import Footer from '@/components/ui/Footer';
import { useAuth } from '@/app/context/AuthContext';

interface ClientLayoutProps {
    children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
    const [showSplash, setShowSplash] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const { user, loading } = useAuth();

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient || loading) return;

        // Show splash animation on every page load
        setShowSplash(true);
    }, [isClient, loading]);

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
