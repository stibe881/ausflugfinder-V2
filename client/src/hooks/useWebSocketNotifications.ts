/**
 * WebSocket Notifications Hook
 * Manages real-time WebSocket connection for push notifications
 * Works on all devices including iPhone
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { toast } from 'sonner';

interface WebSocketNotification {
  title: string;
  message: string;
  notificationType: 'friend_request' | 'friend_accepted' | 'nearby_trip' | 'new_trip' | 'system';
  relatedId?: number;
  url?: string;
  timestamp: number;
}

interface NotificationMessage {
  type: 'notification' | 'ping' | 'pong';
  data?: {
    title?: string;
    message?: string;
    notificationType?: string;
    relatedId?: number;
    url?: string;
    timestamp?: number;
  };
}

export const useWebSocketNotifications = () => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectAttemptRef = useRef(0);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 2000; // 2 seconds

  // Connect to WebSocket server
  const connect = useCallback(() => {
    if (!user) {
      console.log('⚠ No user logged in');
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    console.log('→ Attempting WebSocket connection');
    console.log('  Protocol:', protocol);
    console.log('  Host:', window.location.host);
    console.log('  URL:', wsUrl);
    console.log('  User:', user.name);

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('✓ WebSocket connected');
        setIsConnected(true);
        setError(null);
        reconnectAttemptRef.current = 0;

        // Start heartbeat
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000); // Send ping every 30 seconds
      };

      ws.onmessage = (event) => {
        try {
          const message: NotificationMessage = JSON.parse(event.data);

          if (message.type === 'ping') {
            ws.send(JSON.stringify({ type: 'pong' }));
          } else if (message.type === 'notification' && message.data) {
            const notification: WebSocketNotification = {
              title: message.data.title || 'Notification',
              message: message.data.message || '',
              notificationType: (message.data.notificationType as any) || 'system',
              relatedId: message.data.relatedId,
              url: message.data.url,
              timestamp: message.data.timestamp || Date.now(),
            };

            console.log('📬 Received WebSocket notification:', notification);

            // Show toast notification
            toast.success(`${notification.title}: ${notification.message}`);

            // Optionally navigate if URL provided and user clicks
            // This could be enhanced with a more interactive notification
            if (notification.url) {
              // Store notification for later navigation
              sessionStorage.setItem('pending_notification_url', notification.url);
            }
          }
        } catch (err) {
          console.error('Error processing WebSocket message:', err);
        }
      };

      ws.onerror = (event) => {
        const errorMsg = event instanceof Event ? 'Connection failed' : String(event);
        console.error('✗ WebSocket error event:', event);
        console.error('✗ WebSocket readyState:', ws.readyState);
        setError(`WebSocket error: ${errorMsg}`);
      };

      ws.onclose = () => {
        console.log('→ WebSocket disconnected');
        setIsConnected(false);

        // Clear ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
        }

        // Attempt to reconnect with exponential backoff
        if (reconnectAttemptRef.current < maxReconnectAttempts && user) {
          const delay = baseReconnectDelay * Math.pow(2, reconnectAttemptRef.current);
          console.log(`⏳ Reconnecting in ${delay}ms (attempt ${reconnectAttemptRef.current + 1}/${maxReconnectAttempts})`);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptRef.current++;
            connect();
          }, delay);
        } else if (reconnectAttemptRef.current >= maxReconnectAttempts) {
          setError('Failed to connect to notification server after multiple attempts');
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('Error creating WebSocket:', err);
      setError('Failed to create WebSocket connection');
    }
  }, [user]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
    }

    setIsConnected(false);
    console.log('✓ WebSocket disconnected');
  }, []);

  // Auto-connect when user changes
  useEffect(() => {
    if (user) {
      console.log('⏱ User detected, connecting to WebSocket...');
      console.log('User:', user.name);
      connect();
    } else {
      console.log('⚠ Cannot connect - no user logged in');
      disconnect();
    }

    return () => {
      // disconnect();
    };
  }, [user, connect, disconnect]);

  return {
    isConnected,
    error,
    connect,
    disconnect,
  };
};

export type UseWebSocketNotificationsReturn = ReturnType<typeof useWebSocketNotifications>;
