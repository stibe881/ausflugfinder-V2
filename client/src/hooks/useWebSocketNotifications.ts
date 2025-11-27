import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';

interface WebSocketState {
  isConnected: boolean;
  error: string | null;
}

export function useWebSocketNotifications(): WebSocketState {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    // Only connect if user is authenticated
    if (!user) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    const connect = () => {
      try {
        // Determine WebSocket protocol based on current location
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}`;

        console.log('[WebSocket] Connecting to:', wsUrl);

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('[WebSocket] Connected');
          setIsConnected(true);
          setError(null);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('[WebSocket] Message received:', data);

            // Handle different message types
            if (data.type === 'notification') {
              // Show browser notification if permission granted
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(data.title || 'Neue Benachrichtigung', {
                  body: data.message,
                  icon: '/icons/icon-192.png',
                });
              }
            }
          } catch (err) {
            console.error('[WebSocket] Error parsing message:', err);
          }
        };

        ws.onerror = (event) => {
          console.error('[WebSocket] Error:', event);
          setError('WebSocket connection error');
        };

        ws.onclose = () => {
          console.log('[WebSocket] Disconnected');
          setIsConnected(false);
          wsRef.current = null;

          // Attempt to reconnect after 5 seconds
          if (user) {
            reconnectTimeoutRef.current = setTimeout(() => {
              console.log('[WebSocket] Attempting to reconnect...');
              connect();
            }, 5000);
          }
        };
      } catch (err) {
        console.error('[WebSocket] Connection error:', err);
        setError(err instanceof Error ? err.message : 'Failed to connect');
      }
    };

    connect();

    // Cleanup on unmount or when user changes
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [user]);

  return { isConnected, error };
}
