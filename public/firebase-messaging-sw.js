// Firebase Messaging Service Worker for Web Push Notifications
// This file MUST be in the public root for FCM to work

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Firebase config will be passed via the messaging.getToken() call
// but we need a basic init for the SW
firebase.initializeApp({
  apiKey: "AIzaSyD4WYbKi2gq37LHyw34oMPkSh-9-7iqdpM",
  authDomain: "alsaraya-notifications.firebaseapp.com",
  projectId: "alsaraya-notifications",
  storageBucket: "alsaraya-notifications.firebasestorage.app",
  messagingSenderId: "48065650184",
  appId: "1:48065650184:web:a100eec1b31944a5603bbd",
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background message:', payload);

  const notificationTitle = payload.notification?.title || 'إشعار جديد';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/app-icon.png',
    badge: '/app-icon.png',
    data: payload.data || {},
    vibrate: [200, 100, 200],
    tag: payload.data?.orderId || 'general',
    renotify: true,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click:', event);
  event.notification.close();

  const data = event.notification.data;
  let url = '/';

  if (data?.orderId) {
    url = `/track/${data.orderId}`;
  } else if (data?.route) {
    url = data.route;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if available
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Open new window
      return clients.openWindow(url);
    })
  );
});
