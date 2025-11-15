/**
 * Auto Push Subscriber Component
 * Automatically subscribes user to push notifications on app load
 * Requests permission and subscribes to push notifications
 */

import { useEffect, useRef } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAuth } from '@/_core/hooks/useAuth';

export const AutoPushSubscriber = () => {
  const { user } = useAuth();
  const { isSupported, isSubscribed, subscribe } = usePushNotifications();
  const subscriptionAttempted = useRef(false);

  useEffect(() => {
    console.log('[AutoPushSubscriber] Checking conditions:', {
      user: !!user,
      isSupported,
      isSubscribed,
      alreadyAttempted: subscriptionAttempted.current
    });

    if (!user || !isSupported) {
      if (!user) console.log('[AutoPushSubscriber] No user logged in');
      if (!isSupported) console.log('[AutoPushSubscriber] Push notifications not supported');
      return;
    }

    // If already subscribed, no need to try again
    if (isSubscribed) {
      console.log('[AutoPushSubscriber] Already subscribed');
      return;
    }

    // Prevent multiple subscription attempts
    if (subscriptionAttempted.current) {
      console.log('[AutoPushSubscriber] Subscription already attempted');
      return;
    }

    subscriptionAttempted.current = true;

    // Auto-subscribe to push notifications
    const attemptAutoSubscribe = async () => {
      try {
        const currentPermission = Notification.permission;
        console.log('[AutoPushSubscriber] Current notification permission:', currentPermission);

        if (currentPermission === 'granted') {
          console.log('[AutoPushSubscriber] Permission already granted, subscribing now');
          const success = await subscribe();
          console.log('[AutoPushSubscriber] Subscription result:', success);
        } else if (currentPermission === 'default') {
          // Request permission and then subscribe
          console.log('[AutoPushSubscriber] Permission is default, requesting now...');
          try {
            const newPermission = await Notification.requestPermission();
            console.log('[AutoPushSubscriber] Permission result:', newPermission);

            if (newPermission === 'granted') {
              console.log('[AutoPushSubscriber] Permission granted, subscribing now');
              const success = await subscribe();
              console.log('[AutoPushSubscriber] Subscription result:', success);
            } else {
              console.log('[AutoPushSubscriber] User denied permission:', newPermission);
            }
          } catch (permissionErr) {
            console.error('[AutoPushSubscriber] Error requesting permission:', permissionErr);
          }
        } else if (currentPermission === 'denied') {
          console.log('[AutoPushSubscriber] Push notifications previously denied by user');
          // User has explicitly denied notifications - we cannot re-request
          // They must manually enable in browser settings
        }
      } catch (err) {
        console.error('[AutoPushSubscriber] Error during auto-subscribe:', err);
      }
    };

    attemptAutoSubscribe();
  }, [user, isSupported, isSubscribed, subscribe]);

  // This component doesn't render anything
  return null;
};
