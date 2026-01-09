'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { doc, updateDoc, increment, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { usePathname, useSearchParams } from 'next/navigation';

const TRACKING_INTERVAL = 60000; // 1 minute
const IDLE_TIMEOUT = 300000; // 5 minutes

export default function UserActivityTracker() {
    const { user } = useAuth();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const lastActivityRef = useRef<number>(Date.now());
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const [isIdle, setIsIdle] = useState(false);

    // Track activity (mouse, keyboard) to reset idle timer
    useEffect(() => {
        const handleActivity = () => {
            lastActivityRef.current = Date.now();
            if (isIdle) setIsIdle(false);
        };

        window.addEventListener('mousemove', handleActivity);
        window.addEventListener('keydown', handleActivity);
        window.addEventListener('scroll', handleActivity);
        window.addEventListener('click', handleActivity);

        return () => {
            window.removeEventListener('mousemove', handleActivity);
            window.removeEventListener('keydown', handleActivity);
            window.removeEventListener('scroll', handleActivity);
            window.removeEventListener('click', handleActivity);
        };
    }, [isIdle]);

    // Periodic update of timeOnline
    useEffect(() => {
        if (!user) return;

        const updateStats = async () => {
            const now = Date.now();
            const timeSinceLastActivity = now - lastActivityRef.current;

            if (timeSinceLastActivity < IDLE_TIMEOUT) {
                // User is active, increment stats
                try {
                    const statsRef = doc(db, 'users', user.uid, 'stats', 'timeOnline');
                    await setDoc(statsRef, {
                        totalMinutes: increment(1),
                        lastActive: serverTimestamp()
                    }, { merge: true });
                } catch (error) {
                    console.error("Error updating activity stats:", error);
                }
            } else {
                setIsIdle(true);
            }
        };

        updateStats(); // Initial call
        intervalRef.current = setInterval(updateStats, TRACKING_INTERVAL);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [user]);

    // Track Affinity based on Navigation
    useEffect(() => {
        if (!user || !pathname) return;

        const trackAffinity = async () => {
            let category = '';
            if (pathname.startsWith('/play')) category = 'gamer';
            else if (pathname.startsWith('/shop') || pathname.startsWith('/products')) category = 'shopper';
            else if (pathname.startsWith('/events')) category = 'social';

            if (category) {
                try {
                    const affinityRef = doc(db, 'users', user.uid, 'stats', 'affinity');
                    await setDoc(affinityRef, {
                        [category]: increment(1),
                        lastUpdated: serverTimestamp()
                    }, { merge: true });
                } catch (error) {
                    console.error("Error updating affinity:", error);
                }
            }
        };

        trackAffinity();
    }, [pathname, user]);

    return null; // Invisible component
}
