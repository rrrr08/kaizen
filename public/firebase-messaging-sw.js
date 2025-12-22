// Service Worker for Firebase Cloud Messaging
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Firebase config is injected via environment variables from the main app
// These values are read from NEXT_PUBLIC_* env variables in the client
const firebaseConfig = {
  apiKey: self.firebaseConfig?.apiKey || 'SET_IN_ENV',
  authDomain: self.firebaseConfig?.authDomain || 'SET_IN_ENV',
  projectId: self.firebaseConfig?.projectId || 'SET_IN_ENV',
  storageBucket: self.firebaseConfig?.storageBucket || 'SET_IN_ENV',
  messagingSenderId: self.firebaseConfig?.messagingSenderId || 'SET_IN_ENV',
  appId: self.firebaseConfig?.appId || 'SET_IN_ENV',
};

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
