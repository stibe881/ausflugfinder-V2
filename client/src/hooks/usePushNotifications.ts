/**
 * Push Notifications Hook
 * Manages Web Push API subscriptions and notification handling
 */

import { useEffect, useState, useCallback } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

export interface PushNotificationSettings {
  notificationsEnabled: boolean;
  friendRequestNotifications: boolean;
  friendRequestAcceptedNotifications: boolean;
  nearbyTripNotifications: boolean;
  nearbyTripDistance: number;
  locationTrackingEnabled: boolean;
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'friend_request' | 'friend_accepted' | 'nearby_trip' | 'system';
  relatedId?: number;
  isRead: boolean;
  createdAt: Date;
}

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [error, setError] = useState<string | null>(null);

  // tRPC queries and mutations
  const vapidQuery = trpc.push.getVapidPublicKey.useQuery();

  // Debug VAPID query
  useEffect(() => {
    console.log('DEBUG: VAPID query updated:', {
      isLoading: vapidQuery.isLoading,
      isError: vapidQuery.isError,
      data: vapidQuery.data,
      error: vapidQuery.error,
    });
  }, [vapidQuery.isLoading, vapidQuery.data, vapidQuery.error]);

  const subscribesMutation = trpc.push.subscribe.useMutation();
  const unsubscribeMutation = trpc.push.unsubscribe.useMutation();
  const getSettingsQuery = trpc.push.getSettings.useQuery(undefined, {
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
  const updateSettingsMutation = trpc.push.updateSettings.useMutation();
  const getNotificationsQuery = trpc.push.getNotifications.useQuery(
    { limit: 20, unreadOnly: false },
    {
      enabled: !!user,
      staleTime: 30 * 1000, // Cache for 30 seconds
      gcTime: 2 * 60 * 1000, // Keep in cache for 2 minutes
    }
  );
  const markAsReadMutation = trpc.push.markAsRead.useMutation();
  const updateLocationMutation = trpc.push.updateLocation.useMutation();

  // Check if Push API is supported
  useEffect(() => {
    const supported =
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window;
    setIsSupported(supported);
    console.log(`✓ Push notifications supported: ${supported}`);
    console.log('DEBUG: Browser capabilities:', {
      serviceWorker: 'serviceWorker' in navigator,
      PushManager: 'PushManager' in window,
      Notification: 'Notification' in window,
    });
  }, []);

  // Register Service Worker and check subscription
  useEffect(() => {
    if (!isSupported || !user) return;

    const registerServiceWorker = async () => {
      try {
        const reg = await navigator.serviceWorker.ready;
        console.log('✓ Service Worker ready');

        // Check if already subscribed
        const existingSubscription = await reg.pushManager.getSubscription();
        if (existingSubscription) {
          console.log('✓ Already subscribed to push notifications');
          setSubscription(existingSubscription);
          setIsSubscribed(true);
        } else {
          console.log('→ Not subscribed to push notifications');
          setIsSubscribed(false);
        }
      } catch (err) {
        console.error('✗ Error with Service Worker:', err);
        setError('Service Worker registration failed');
      }
    };

    registerServiceWorker();
  }, [isSupported, user]);

  /**
   * Subscribe to push notifications
   */
  const subscribe = useCallback(async () => {
    console.log('DEBUG: subscribe() called');
    console.log('DEBUG: isSupported =', isSupported);

    if (!isSupported) {
      console.log('DEBUG: Push notifications not supported');
      setError('Push notifications not supported');
      return false;
    }

    console.log('DEBUG: vapidQuery.data =', vapidQuery.data);
    console.log('DEBUG: vapidQuery.isLoading =', vapidQuery.isLoading);
    console.log('DEBUG: vapidQuery.error =', vapidQuery.error);

    if (!vapidQuery.data?.publicKey) {
      console.log('DEBUG: VAPID public key not available');
      setError('VAPID public key not available');
      return false;
    }

    try {
      // Request notification permission
      console.log('DEBUG: Notification.permission =', Notification.permission);

      if (Notification.permission === 'denied') {
        console.log('DEBUG: Notification permission is denied');
        setError('Notification permission denied');
        return false;
      }

      if (Notification.permission !== 'granted') {
        console.log('DEBUG: Requesting notification permission...');
        const permission = await Notification.requestPermission();
        console.log('DEBUG: Permission result =', permission);
        if (permission !== 'granted') {
          console.log('DEBUG: User denied notification permission');
          setError('Notification permission denied');
          return false;
        }
      }

      // Get service worker registration
      console.log('DEBUG: Getting service worker registration...');
      const reg = await navigator.serviceWorker.ready;
      console.log('DEBUG: Service worker ready:', reg);

      // Create subscription
      console.log('DEBUG: Creating push subscription...');
      const newSubscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidQuery.data.publicKey),
      });

      console.log('✓ Push subscription created:', newSubscription.endpoint);

      // Send subscription to backend
      console.log('DEBUG: Sending subscription to backend...');
      const result = await subscribesMutation.mutateAsync({
        endpoint: newSubscription.endpoint,
        keys: {
          auth: arrayBufferToBase64(newSubscription.getKey('auth')!),
          p256dh: arrayBufferToBase64(newSubscription.getKey('p256dh')!),
        },
      });

      setSubscription(newSubscription);
      setIsSubscribed(true);
      setError(null);

      console.log(`✓ Subscription saved to backend: ${result.message}`);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('✗ Error subscribing to push:', err);
      console.error('✗ Error details:', errorMessage);
      setError(errorMessage);
      return false;
    }
  }, [isSupported, vapidQuery.data, subscribesMutation]);

  /**
   * Unsubscribe from push notifications
   */
  const unsubscribe = useCallback(async () => {
    if (!subscription) {
      setError('Not subscribed');
      return false;
    }

    try {
      // Unsubscribe from Service Worker
      await subscription.unsubscribe();
      console.log('✓ Unsubscribed from push notifications');

      // Notify backend
      await unsubscribeMutation.mutateAsync({
        endpoint: subscription.endpoint,
      });

      setSubscription(null);
      setIsSubscribed(false);
      setError(null);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('✗ Error unsubscribing:', err);
      setError(errorMessage);
      return false;
    }
  }, [subscription, unsubscribeMutation]);

  /**
   * Update notification settings
   */
  const updateSettings = useCallback(
    async (settings: Partial<PushNotificationSettings>) => {
      try {
        await updateSettingsMutation.mutateAsync(settings);
        console.log('✓ Notification settings updated');
        getSettingsQuery.refetch();
        return true;
      } catch (err) {
        console.error('✗ Error updating settings:', err);
        return false;
      }
    },
    [updateSettingsMutation, getSettingsQuery]
  );

  /**
   * Get notification history
   */
  const getNotifications = useCallback(
    async (unreadOnly = false) => {
      try {
        const result = await trpc.push.getNotifications.useQuery(
          { limit: 20, unreadOnly },
          { enabled: !!user }
        );
        return result.data?.notifications || [];
      } catch (err) {
        console.error('✗ Error getting notifications:', err);
        return [];
      }
    },
    [user]
  );

  /**
   * Mark notification as read
   */
  const markNotificationAsRead = useCallback(
    async (notificationId: number) => {
      try {
        await markAsReadMutation.mutateAsync({ notificationId });
        console.log(`✓ Notification ${notificationId} marked as read`);
        getNotificationsQuery.refetch();
        return true;
      } catch (err) {
        console.error('✗ Error marking notification as read:', err);
        return false;
      }
    },
    [markAsReadMutation, getNotificationsQuery]
  );

  /**
   * Update user location (for proximity-based notifications)
   */
  const updateLocation = useCallback(
    async (latitude: number, longitude: number, accuracy?: number) => {
      try {
        const result = await updateLocationMutation.mutateAsync({
          latitude,
          longitude,
          accuracy,
        });
        console.log('✓ Location updated');
        return result.success;
      } catch (err) {
        console.error('✗ Error updating location:', err);
        return false;
      }
    },
    [updateLocationMutation]
  );

  /**
   * Request geolocation from browser
   */
  const requestGeolocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return false;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          updateLocation(latitude, longitude, accuracy)
            .then((success) => {
              if (success) {
                console.log(
                  `✓ Location obtained: ${latitude}, ${longitude} (${accuracy}m)`
                );
              }
              resolve(success);
            })
            .catch((err) => {
              console.error('✗ Error updating location:', err);
              resolve(false);
            });
        },
        (error) => {
          console.error('✗ Geolocation error:', error.message);
          setError(error.message);
          resolve(false);
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }, [updateLocation]);

  /**
   * Start background location tracking
   */
  const startLocationTracking = useCallback(
    async (intervalMs = 60000) => {
      // Default: every minute
      if (!navigator.geolocation) {
        setError('Geolocation not supported');
        return null;
      }

      console.log(`→ Starting location tracking every ${intervalMs}ms`);

      // Get location immediately
      await requestGeolocation();

      // Set up recurring location updates
      const intervalId = setInterval(() => {
        requestGeolocation();
      }, intervalMs);

      return () => {
        console.log('→ Stopping location tracking');
        clearInterval(intervalId);
      };
    },
    [requestGeolocation]
  );

  return {
    // Support and subscription status
    isSupported,
    isSubscribed,
    subscription,
    error,

    // Actions
    subscribe,
    unsubscribe,
    updateSettings,
    getNotifications,
    markNotificationAsRead,
    updateLocation,
    requestGeolocation,
    startLocationTracking,

    // Data from queries
    settings: getSettingsQuery.data,
    notifications: getNotificationsQuery.data?.notifications || [],
    isLoadingSettings: getSettingsQuery.isLoading,
    isLoadingNotifications: getNotificationsQuery.isLoading,

    // Refetch functions
    refetchSettings: getSettingsQuery.refetch,
    refetchNotifications: getNotificationsQuery.refetch,
  };
};

/**
 * Helper function: Convert base64 string to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Helper function: Convert ArrayBuffer to base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export type UsePushNotificationsReturn = ReturnType<typeof usePushNotifications>;
