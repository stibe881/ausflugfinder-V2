/**
 * WebSocket Server for Real-Time Notifications
 * Sends notifications in real-time to all connected clients
 */

import { Server as HTTPServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import type { IncomingMessage } from 'http';
import { verify as verifyJWT } from '@tsndr/cloudflare-worker-jwt';

interface NotificationMessage {
  type: 'notification' | 'ping' | 'pong';
  data?: {
    id?: number;
    title?: string;
    message?: string;
    notificationType?: 'friend_request' | 'friend_accepted' | 'nearby_trip' | 'new_trip' | 'system';
    relatedId?: number;
    url?: string;
    timestamp?: number;
  };
}

interface ConnectedClient {
  ws: WebSocket;
  userId: number;
  connected: boolean;
  lastPing: number;
}

// Store connected clients by userId
const connectedClients = new Map<number, Set<ConnectedClient>>();

// Heartbeat interval to check client connection
const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const HEARTBEAT_TIMEOUT = 60000; // 60 seconds

export function setupWebSocketServer(server: HTTPServer, secret: string = process.env.JWT_SECRET || '') {
  const wss = new WebSocketServer({ server, path: '/ws' });

  console.log('✓ WebSocket server initialized');

  wss.on('connection', async (ws: WebSocket, req: IncomingMessage) => {
    console.log('→ New WebSocket connection attempt');

    // Extract and verify JWT token
    const token = extractToken(req.url);
    if (!token) {
      console.log('✗ No token provided');
      ws.close(1008, 'Unauthorized');
      return;
    }

    let userId: number;
    try {
      const decoded = await verifyJWT(token, secret);
      userId = decoded.sub as number;
      console.log(`✓ WebSocket user authenticated: ${userId}`);
    } catch (err) {
      console.error('✗ Token verification failed:', err);
      ws.close(1008, 'Unauthorized');
      return;
    }

    // Add client to connected clients
    const client: ConnectedClient = {
      ws,
      userId,
      connected: true,
      lastPing: Date.now(),
    };

    if (!connectedClients.has(userId)) {
      connectedClients.set(userId, new Set());
    }
    connectedClients.get(userId)!.add(client);

    console.log(`✓ User ${userId} connected. Total connections for user: ${connectedClients.get(userId)!.size}`);

    // Handle incoming messages
    ws.on('message', (data: Buffer) => {
      try {
        const message: NotificationMessage = JSON.parse(data.toString());

        if (message.type === 'ping') {
          client.lastPing = Date.now();
          ws.send(JSON.stringify({ type: 'pong' }));
        }
      } catch (err) {
        console.error('Error processing WebSocket message:', err);
      }
    });

    // Handle client disconnect
    ws.on('close', () => {
      const userClients = connectedClients.get(userId);
      if (userClients) {
        userClients.delete(client);
        if (userClients.size === 0) {
          connectedClients.delete(userId);
          console.log(`✓ User ${userId} fully disconnected`);
        } else {
          console.log(`✓ User ${userId} connection closed. Remaining: ${userClients.size}`);
        }
      }
    });

    ws.on('error', (err) => {
      console.error(`WebSocket error for user ${userId}:`, err);
    });
  });

  // Start heartbeat to keep connections alive and detect dead connections
  startHeartbeat(wss);

  return wss;
}

/**
 * Send notification to a specific user via WebSocket
 */
export function sendWebSocketNotification(
  userId: number,
  notification: {
    title: string;
    message: string;
    notificationType: 'friend_request' | 'friend_accepted' | 'nearby_trip' | 'new_trip' | 'system';
    relatedId?: number;
    url?: string;
  }
) {
  const userClients = connectedClients.get(userId);
  if (!userClients || userClients.size === 0) {
    console.log(`[WebSocket] No connected clients for user ${userId}`);
    return false;
  }

  const message: NotificationMessage = {
    type: 'notification',
    data: {
      title: notification.title,
      message: notification.message,
      notificationType: notification.notificationType,
      relatedId: notification.relatedId,
      url: notification.url,
      timestamp: Date.now(),
    },
  };

  let sentCount = 0;
  for (const client of userClients) {
    if (client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(JSON.stringify(message));
        sentCount++;
      } catch (err) {
        console.error(`Error sending notification to user ${userId}:`, err);
      }
    }
  }

  console.log(`[WebSocket] Sent notification to ${sentCount} clients for user ${userId}`);
  return sentCount > 0;
}

/**
 * Broadcast notification to multiple users via WebSocket
 */
export function broadcastWebSocketNotification(
  userIds: number[],
  notification: {
    title: string;
    message: string;
    notificationType: 'friend_request' | 'friend_accepted' | 'nearby_trip' | 'new_trip' | 'system';
    relatedId?: number;
    url?: string;
  }
) {
  let totalSent = 0;
  for (const userId of userIds) {
    if (sendWebSocketNotification(userId, notification)) {
      totalSent++;
    }
  }
  return totalSent;
}

/**
 * Extract JWT token from query parameter
 */
function extractToken(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/[?&]token=([^&]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Start heartbeat to keep WebSocket connections alive
 */
function startHeartbeat(wss: WebSocketServer) {
  setInterval(() => {
    for (const [userId, clients] of connectedClients) {
      const now = Date.now();
      for (const client of clients) {
        if (now - client.lastPing > HEARTBEAT_TIMEOUT) {
          console.log(`Closing dead connection for user ${userId}`);
          client.ws.close(1000, 'Heartbeat timeout');
        } else if (client.ws.readyState === WebSocket.OPEN) {
          const message: NotificationMessage = { type: 'ping' };
          client.ws.send(JSON.stringify(message));
        }
      }
    }
  }, HEARTBEAT_INTERVAL);
}

/**
 * Get total number of connected WebSocket clients
 */
export function getConnectedClientsCount(): number {
  let total = 0;
  for (const clients of connectedClients.values()) {
    total += clients.size;
  }
  return total;
}

/**
 * Get connected clients for a specific user
 */
export function getUserConnectedClientsCount(userId: number): number {
  return connectedClients.get(userId)?.size || 0;
}
