/**
 * Capacitor Push Notifications Service
 * Handles native push notifications on iOS/Android
 */

import { PushNotifications } from '@capacitor/push-notifications';
import { toast } from 'sonner';

export const initCapacitorPushNotifications = async () => {
  try {
    console.log('[CapacitorPush] Initializing push notifications...');

    // Request permissions first
    await requestPushNotifications();

    // Set up event listeners
    setupPushEventListeners();

    console.log('[CapacitorPush] ✓ Push notifications initialized successfully');
    return true;
  } catch (error) {
    console.error('[CapacitorPush] ✗ Error initializing push notifications:', error);
    return false;
  }
};

/**
 * Request push notification permissions
 */
export const requestPushNotifications = async () => {
  try {
    console.log('[CapacitorPush] Requesting permissions...');

    const result = await PushNotifications.requestPermissions();
    const permissionStatus = result.receive;

    console.log('[CapacitorPush] Permission result:', {
      receive: result.receive,
      notifications: result.notifications,
    });

    if (permissionStatus === 'granted') {
      // Permission granted, register for push
      await registerForPushNotifications();
      return true;
    } else if (permissionStatus === 'prompt') {
      // Permission denied or prompt - should ask user again
      console.warn('[CapacitorPush] Permission not granted');
      toast.error('Push notification permission denied');
      return false;
    } else {
      console.warn('[CapacitorPush] Push notifications not available');
      toast.info('Push notifications not available on this device');
      return false;
    }
  } catch (error) {
    console.error('[CapacitorPush] Error requesting permissions:', error);
    toast.error('Error requesting push notification permission');
    return false;
  }
};

/**
 * Register device for push notifications
 */
export const registerForPushNotifications = async () => {
  try {
    console.log('[CapacitorPush] Registering for push...');

    await PushNotifications.register();

    console.log('[CapacitorPush] ✓ Registered for push notifications');
    toast.success('Push notifications enabled!');
    return true;
  } catch (error) {
    console.error('[CapacitorPush] Error registering for push:', error);
    toast.error('Error enabling push notifications');
    return false;
  }
};

/**
 * Setup push event listeners
 */
const setupPushEventListeners = () => {
  // Handle incoming push notifications
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('[CapacitorPush] Notification received:', notification);

    // Handle the notification
    handlePushNotification(notification);
  });

  // Handle push notification action (user tapped)
  PushNotifications.addListener(
    'pushNotificationActionPerformed',
    (notification) => {
      console.log('[CapacitorPush] Notification action performed:', notification);

      // Handle notification tap - navigate to relevant page
      if (notification.notification.data?.url) {
        window.location.href = notification.notification.data.url;
      }
    }
  );

  // Handle registration token
  PushNotifications.addListener('registration', (token) => {
    console.log('[CapacitorPush] Registration token received:', {
      value: token.value,
      platform: token.value.includes(':') ? 'Android' : 'iOS',
    });

    // Store the token for backend
    storeDevicePushToken(token.value);
  });

  // Handle registration error
  PushNotifications.addListener('registrationError', (error) => {
    console.error('[CapacitorPush] Registration error:', error);
    toast.error('Failed to enable push notifications');
  });

  console.log('[CapacitorPush] ✓ Event listeners set up');
};

/**
 * Handle incoming push notification
 */
const handlePushNotification = (notification: any) => {
  const { title, body, data } = notification;

  // Show toast notification in-app
  if (notification.platform === 'android') {
    toast.info(`${title || 'Notification'}: ${body}`);
  } else if (notification.platform === 'ios') {
    toast.info(`${title || 'Notification'}: ${body}`);
  }

  // Store notification in database if you have a backend endpoint
  if (data?.relatedId) {
    console.log('[CapacitorPush] Notification has related data:', data);
  }
};

/**
 * Store device push token on backend
 * This tells the backend how to send push to this device
 */
const storeDevicePushToken = async (token: string) => {
  try {
    // Store in localStorage for now
    // In production, you'd send this to your backend
    localStorage.setItem('capacitor_push_token', token);

    console.log('[CapacitorPush] ✓ Device token stored');

    // Optional: Send to backend
    // await trpc.push.storeCapacitorToken.mutate({ token });
  } catch (error) {
    console.error('[CapacitorPush] Error storing device token:', error);
  }
};

/**
 * Get the current device push token
 */
export const getDevicePushToken = (): string | null => {
  return localStorage.getItem('capacitor_push_token');
};

/**
 * Unregister from push notifications
 */
export const unregisterFromPushNotifications = async () => {
  try {
    console.log('[CapacitorPush] Unregistering from push...');

    await PushNotifications.removeAllListeners();

    localStorage.removeItem('capacitor_push_token');

    console.log('[CapacitorPush] ✓ Unregistered from push notifications');
    toast.info('Push notifications disabled');
    return true;
  } catch (error) {
    console.error('[CapacitorPush] Error unregistering from push:', error);
    return false;
  }
};

/**
 * Check if push notifications are supported (Capacitor environment)
 */
export const isCapacitorApp = (): boolean => {
  return !!(window as any).capacitor;
};
