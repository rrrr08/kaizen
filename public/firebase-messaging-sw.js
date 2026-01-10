// Service Worker for Firebase Cloud Messaging
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Firebase config - Note: Service workers can't access environment variables directly
// The config is passed from the main app during service worker registration
// For local development, you can temporarily hardcode values, but remember to:
// 1. Never commit real Firebase credentials
// 2. Use a build script to inject these values in production
const firebaseConfig = {
    apiKey: "AIzaSyD7S6QWd6reHEt1TEtTow7ZnTA4VV4Y1q4",
    authDomain: "gwoc-e598b.firebaseapp.com",
    projectId: "gwoc-e598b",
    storageBucket: "gwoc-e598b.firebasestorage.app",
    messagingSenderId: "594368440316",
    appId: "1:594368440316:web:4b1ded550d642ecb047479"
};

try {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    // Handle background messages
    messaging.onBackgroundMessage((payload) => {
        console.log('Background message received:', payload);

        const notificationTitle = payload.notification?.title || 'Joy Juncture';
        const notificationOptions = {
            body: payload.notification?.body || 'You have a new notification',
            icon: payload.notification?.icon || '/icons/logo-192x192.png',
            image: payload.notification?.image,
            badge: '/icons/badge-96x96.png',
            tag: payload.data?.campaignId || 'notification',
            requireInteraction: true,
            vibrate: [200, 100, 200],
            data: payload.data || {},
        };

        self.registration.showNotification(notificationTitle, notificationOptions);
    });
} catch (error) {
    console.error('Error initializing Firebase in service worker:', error);
}

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const actionUrl = event.notification.data?.actionUrl || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Check if there's already a window/tab with the target URL open
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url === actionUrl && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not, open a new window/tab with the target URL
            if (clients.openWindow) {
                return clients.openWindow(actionUrl);
            }
        })
    );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
    console.log('Notification dismissed:', event.notification.tag);
});
