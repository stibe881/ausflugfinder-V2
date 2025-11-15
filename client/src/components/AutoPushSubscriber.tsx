/**
 * Auto Push Subscriber Component
 * Automatically subscribes user to push notifications on app load
 * (with user consent through permission request)
 */

import { useEffect, useRef } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAuth } from '@/_core/hooks/useAuth';

export const AutoPushSubscriber = () => {
  const { user } = useAuth();
  const { isSupported, isSubscribed, subscribe } = usePushNotifications();
  const subscriptionAttempted = useRef(false);

  useEffect(() => {
    if (!user || !isSupported || isSubscribed || subscriptionAttempted.current) {
      return;
    }

    // Prevent multiple subscription attempts
    subscriptionAttempted.current = true;

    // Auto-subscribe to push notifications
    // Note: This will only work if the browser supports it and user hasn't denied permission
    const attemptAutoSubscribe = async () => {
      try {
        const permission = Notification.permission;

        // Only attempt subscription if:
        // 1. Notifications are already granted, OR
        // 2. The user hasn't explicitly denied them
        if (permission === 'granted') {
          console.log('AutoPushSubscriber: Attempting to subscribe (permission already granted)');
          await subscribe();
        } else if (permission === 'default') {
          console.log('AutoPushSubscriber: User permission is default, will request on first action');
          // Don't auto-request permission, let the browser handle it naturally
          // The user can still manually enable push notifications in settings
        } else if (permission === 'denied') {
          console.log('AutoPushSubscriber: Push notifications denied by user');
        }
      } catch (err) {
        console.error('AutoPushSubscriber: Error attempting subscription:', err);
      }
    };

    attemptAutoSubscribe();
  }, [user, isSupported, isSubscribed, subscribe]);

  // This component doesn't render anything
  return null;
};
