'use client';

import { useEffect, useState, useCallback } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { initializeApp, getApps } from 'firebase/app';

interface NotificationPayload {
  title: string;
  body: string;
  image?: string;
  icon?: string;
}

export function usePushNotifications() {
  const [token, setToken] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [foregroundMessage, setForegroundMessage] = useState<any>(null);

  useEffect(() => {
    // Check if notifications are supported
    const supported =
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'Notification' in window;

    setIsSupported(supported);
    setPermission(Notification?.permission || 'default');

    if (!supported) {
      console.log('Push notifications not supported on this device');
      return;
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }

    // Setup messaging and handle foreground messages
    try {
      const app = getApps().length === 0 ? initializeApp({}) : getApps()[0];
      const messaging = getMessaging(app);

      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('Foreground message received:', payload);
        setForegroundMessage(payload);

        // Show notification in browser even in foreground
        if ('Notification' in window && Notification.permission === 'granted') {
          const notifOptions: NotificationOptions = {
            body: payload.notification?.body,
            icon: payload.notification?.icon || '/icons/logo-192x192.png',
            badge: '/icons/badge-96x96.png',
            tag: payload.data?.campaignId,
          };

          // Add image if available (image is not in standard NotificationOptions but browsers support it)
          if (payload.notification?.image) {
            (notifOptions as any).image = payload.notification.image;
          }

          new Notification(payload.notification?.title || 'Joy Juncture', notifOptions);
        }
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up messaging:', error);
    }
  }, []);

  const getFCMToken = useCallback(async (): Promise<string | null> => {
    if (!isSupported) return null;

    try {
      const app = getApps().length === 0 ? initializeApp({}) : getApps()[0];
      const messaging = getMessaging(app);

      const fcmToken = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });

      return fcmToken;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }, [isSupported]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn('Push notifications not supported');
      return false;
    }

    try {
      console.log('Requesting notification permission...');
      const permission = await Notification.requestPermission();
      console.log('Permission result:', permission);
      setPermission(permission);

      if (permission === 'granted') {
        console.log('Permission granted! Getting FCM token...');
        const fcmToken = await getFCMToken();
        console.log('FCM Token:', fcmToken ? 'Generated' : 'Failed');
        
        if (fcmToken) {
          setToken(fcmToken);
          // Save token to backend
          console.log('Saving device token to backend...');
          await saveDeviceToken(fcmToken);
          console.log('Device token saved successfully');
          return true;
        } else {
          console.error('Failed to get FCM token');
        }
      } else {
        console.warn('Permission not granted:', permission);
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [isSupported, getFCMToken]);



  return {
    token,
    isSupported,
    permission,
    foregroundMessage,
    requestPermission,
    getFCMToken,
  };
}

async function saveDeviceToken(fcmToken: string) {
  try {
    // Get Firebase auth token
    const { auth } = await import('@/lib/firebase');
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      console.error('No authenticated user');
      return;
    }

    const token = await currentUser.getIdToken();

    const response = await fetch('/api/push/register-device', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        deviceToken: fcmToken,
        deviceType: 'web',
        deviceName: `${getBrowserName()} on ${getOSName()}`,
      }),
    });

    if (!response.ok) {
      console.error('Failed to save device token:', await response.text());
    } else {
      console.log('Device token saved successfully');
    }
  } catch (error) {
    console.error('Error saving device token:', error);
  }
}

function getBrowserName(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edge')) return 'Edge';
  return 'Browser';
}

function getOSName(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Win')) return 'Windows';
  if (ua.includes('Mac')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iPhone')) return 'iOS';
  return 'Unknown';
}
