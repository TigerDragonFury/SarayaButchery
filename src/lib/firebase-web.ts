import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported, Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD4WYbKi2gq37LHyw34oMPkSh-9-7iqdpM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "alsaraya-notifications.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "alsaraya-notifications",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "alsaraya-notifications.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "48065650184",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:48065650184:web:a100eec1b31944a5603bbd",
};

let messagingInstance: Messaging | null = null;

export const getFirebaseApp = () => {
  if (getApps().length === 0) {
    return initializeApp(firebaseConfig);
  }
  return getApps()[0];
};

export const getFirebaseMessaging = async (): Promise<Messaging | null> => {
  if (messagingInstance) return messagingInstance;
  
  try {
    const supported = await isSupported();
    console.log('Firebase Messaging support check:', supported);
    
    if (!supported) {
      console.warn('Firebase Messaging not supported - browser may not have service worker support');
      // Continue anyway - we'll handle errors in requestWebPushToken
    }

    const app = getFirebaseApp();
    messagingInstance = getMessaging(app);
    return messagingInstance;
  } catch (error) {
    console.error('Error getting Firebase Messaging:', error);
    return null;
  }
};

export const requestWebPushToken = async (): Promise<string | null> => {
  try {
    const messaging = await getFirebaseMessaging();
    if (!messaging) return null;

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.error('VAPID key not configured');
      return null;
    }

    // Register service worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.log('Web push token obtained:', token.substring(0, 20) + '...');
      return token;
    }
    
    console.log('No web push token available');
    return null;
  } catch (error) {
    console.error('Error getting web push token:', error);
    return null;
  }
};

export const onForegroundMessage = (callback: (payload: any) => void) => {
  getFirebaseMessaging().then(messaging => {
    if (messaging) {
      onMessage(messaging, callback);
    }
  });
};
