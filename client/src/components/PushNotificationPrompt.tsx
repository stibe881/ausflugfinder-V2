/**
 * Push Notification Prompt Component
 * Shows a prompt to enable push notifications with a button for user interaction
 * Required for iOS Safari which only allows permission requests from user interactions
 */

import { useEffect, useState } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { AlertCircle, Bell } from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';

export const PushNotificationPrompt = () => {
  const { user } = useAuth();
  const { isSupported, isSubscribed, subscribe } = usePushNotifications();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadyTriedSubscribe, setAlreadyTriedSubscribe] = useState(false);

  useEffect(() => {
    // Only show prompt if:
    // 1. User is logged in
    // 2. Push notifications are supported
    // 3. Not already subscribed
    if (!user || !isSupported || isSubscribed) {
      return;
    }

    const permission = Notification.permission;
    console.log('[PushNotificationPrompt] Current permission:', permission);

    // Only show prompt if permission is 'default' (not yet decided by user)
    if (permission === 'default') {
      console.log('[PushNotificationPrompt] Showing prompt - permission is default');
      setShowPrompt(true);
    } else if (permission === 'granted' && !isSubscribed && !alreadyTriedSubscribe) {
      // If permission is granted but not subscribed, try to subscribe
      console.log('[PushNotificationPrompt] Permission granted but not subscribed, attempting subscription...');
      setAlreadyTriedSubscribe(true);
      handleSubscribe();
    }
  }, [user, isSupported, isSubscribed, alreadyTriedSubscribe]);

  const handleSubscribe = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('[PushNotificationPrompt] handleSubscribe called');
      const permission = Notification.permission;
      console.log('[PushNotificationPrompt] Current permission:', permission);

      if (permission === 'granted') {
        // Permission already granted, just subscribe
        console.log('[PushNotificationPrompt] Permission already granted, subscribing...');
        // Add a small delay to ensure Service Worker is ready
        await new Promise(resolve => setTimeout(resolve, 500));
        const success = await subscribe();
        if (success) {
          console.log('[PushNotificationPrompt] Subscription successful');
          setShowPrompt(false);
        } else {
          setError('Fehler beim Abonnieren. Bitte überprüfe deine Verbindung und versuche es erneut.');
        }
      } else if (permission === 'default') {
        // Request permission
        console.log('[PushNotificationPrompt] Requesting permission from user...');
        try {
          const newPermission = await Notification.requestPermission();
          console.log('[PushNotificationPrompt] Permission response:', newPermission);

          if (newPermission === 'granted') {
            // Permission granted, now subscribe
            console.log('[PushNotificationPrompt] Permission granted, now subscribing...');
            // Add a small delay to ensure Service Worker is ready
            await new Promise(resolve => setTimeout(resolve, 500));
            const success = await subscribe();
            if (success) {
              console.log('[PushNotificationPrompt] Subscription successful');
              setShowPrompt(false);
            } else {
              setError('Fehler beim Abonnieren. Bitte überprüfe deine Verbindung und versuche es erneut.');
            }
          } else {
            console.log('[PushNotificationPrompt] User denied permission');
            setError('Du hast Benachrichtigungen abgelehnt. Du kannst sie später in den Einstellungen aktivieren.');
            setShowPrompt(false);
          }
        } catch (permErr) {
          console.error('[PushNotificationPrompt] Error requesting permission:', permErr);
          setError('Fehler beim Anfordern der Berechtigung.');
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unbekannter Fehler';
      console.error('[PushNotificationPrompt] Error:', err);
      setError(`Fehler: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    console.log('[PushNotificationPrompt] Dismissing prompt');
    setShowPrompt(false);
  };

  const handleRetry = () => {
    console.log('[PushNotificationPrompt] User retrying subscription');
    setError(null);
    handleSubscribe();
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-sm z-50">
      <Alert className="border-blue-200 bg-blue-50 shadow-lg">
        <Bell className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-900">Benachrichtigungen aktivieren?</AlertTitle>
        <AlertDescription className="text-blue-800 mt-2">
          Erhalte Push-Benachrichtigungen über neue Ausflüge und Freundschaftsanfragen.
        </AlertDescription>
        {error && (
          <div className="flex items-start gap-2 mt-3 p-2 bg-red-100 rounded">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        <div className="flex gap-2 mt-4 flex-wrap">
          {error ? (
            <>
              <Button
                size="sm"
                onClick={handleRetry}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? 'Versucht...' : 'Erneut versuchen'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDismiss}
                disabled={isLoading}
                className="border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                Schließen
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                onClick={handleSubscribe}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? 'Lädt...' : 'Aktivieren'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDismiss}
                disabled={isLoading}
                className="border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                Später
              </Button>
            </>
          )}
        </div>
      </Alert>
    </div>
  );
};
