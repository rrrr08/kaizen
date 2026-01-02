'use client';

import { useState, useEffect } from 'react';
import SplashScreen from '@/components/ui/SplashScreen';
import Navbar from '@/components/ui/JoyNavbar';
import Footer from '@/components/ui/Footer';

interface ClientLayoutProps {
    children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
    const [showSplash, setShowSplash] = useState(true);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        // Check if splash was already shown
        if (sessionStorage.getItem('splashShown') === 'true') {
            setShowSplash(false);
        }
    }, []);

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
            {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
            <Navbar />
            {children}
            <Footer />
        </>
    );
}
