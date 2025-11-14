/**
 * Push Notification Service
 * Handles Web Push API operations using VAPID protocol
 */

import webpush from 'web-push';
import { getDb } from '../db';
import { pushSubscriptions, userSettings, notifications as notificationsTable, users, friendships, userLocations, trips } from '../../drizzle/schema';
import { eq, and, inArray } from 'drizzle-orm';

// Initialize web-push with VAPID keys
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY!;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!;

if (!vapidPublicKey || !vapidPrivateKey) {
  console.warn('⚠ VAPID keys not configured. Push notifications will not work.');
} else {
  webpush.setVapidDetails(
    'mailto:notifications@ausflugfinder.ch', // Contact email
    vapidPublicKey,
    vapidPrivateKey
  );
}

export interface PushNotificationPayload {
  title: string;
  message: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: {
    type: 'friend_request' | 'friend_accepted' | 'nearby_trip' | 'system';
    relatedId?: number;
    url?: string;
  };
}

/**
 * Send push notification to a specific user
 */
export async function sendPushNotificationToUser(
  userId: number,
  payload: PushNotificationPayload,
  notificationType: 'friend_request' | 'friend_accepted' | 'nearby_trip' | 'system' = 'system'
): Promise<boolean> {
  try {
    const db = getDb();

    // Check if user has notifications enabled
    const userSettings_ = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1);

    if (userSettings_.length === 0 || !userSettings_[0].notificationsEnabled) {
      console.log(`Push notifications disabled for user ${userId}`);
      return false;
    }

    // Check if specific notification type is enabled
    if (notificationType === 'friend_request' && !userSettings_[0].friendRequestNotifications) {
      return false;
    }
    if (notificationType === 'friend_accepted' && !userSettings_[0].friendRequestAcceptedNotifications) {
      return false;
    }
    if (notificationType === 'nearby_trip' && !userSettings_[0].nearbyTripNotifications) {
      return false;
    }

    // Get all subscriptions for the user
    const subscriptions = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, userId));

    if (subscriptions.length === 0) {
      console.log(`No push subscriptions found for user ${userId}`);
      return false;
    }

    // Send push to all subscriptions
    let successCount = 0;
    for (const subscription of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              auth: subscription.auth,
              p256dh: subscription.p256dh,
            },
          },
          JSON.stringify(payload)
        );
        successCount++;
      } catch (error: any) {
        // If subscription is invalid, remove it
        if (error.statusCode === 410 || error.statusCode === 404) {
          await db
            .delete(pushSubscriptions)
            .where(eq(pushSubscriptions.id, subscription.id));
          console.log(`Removed invalid push subscription ${subscription.id}`);
        } else {
          console.error(`Error sending push notification to subscription ${subscription.id}:`, error.message);
        }
      }
    }

    // Save notification to database for in-app notification center
    await db.insert(notificationsTable).values({
      userId,
      title: payload.title,
      message: payload.message,
      type: notificationType,
      relatedId: payload.data?.relatedId,
    });

    return successCount > 0;
  } catch (error) {
    console.error('Error in sendPushNotificationToUser:', error);
    return false;
  }
}

/**
 * Send friend request notification
 */
export async function sendFriendRequestNotification(
  fromUserId: number,
  toUserId: number
): Promise<boolean> {
  try {
    const db = getDb();

    // Get sender's name
    const sender = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, fromUserId))
      .limit(1);

    if (sender.length === 0) return false;

    const payload: PushNotificationPayload = {
      title: 'Freundschaftsanfrage',
      message: `${sender[0].name || 'Ein Benutzer'} möchte dein Freund sein`,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: `friend-request-${fromUserId}`,
      data: {
        type: 'friend_request',
        relatedId: fromUserId,
        url: '/friends',
      },
    };

    return await sendPushNotificationToUser(toUserId, payload, 'friend_request');
  } catch (error) {
    console.error('Error in sendFriendRequestNotification:', error);
    return false;
  }
}

/**
 * Send friend request accepted notification
 */
export async function sendFriendAcceptedNotification(
  fromUserId: number,
  toUserId: number
): Promise<boolean> {
  try {
    const db = getDb();

    // Get sender's name
    const sender = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, fromUserId))
      .limit(1);

    if (sender.length === 0) return false;

    const payload: PushNotificationPayload = {
      title: 'Freundschaftsanfrage akzeptiert',
      message: `${sender[0].name || 'Ein Benutzer'} hat deine Freundschaftsanfrage akzeptiert`,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: `friend-accepted-${fromUserId}`,
      data: {
        type: 'friend_accepted',
        relatedId: fromUserId,
        url: '/friends',
      },
    };

    return await sendPushNotificationToUser(toUserId, payload, 'friend_accepted');
  } catch (error) {
    console.error('Error in sendFriendAcceptedNotification:', error);
    return false;
  }
}

/**
 * Send nearby trip notification when user is near a trip location
 */
export async function sendNearbyTripNotification(
  userId: number,
  tripId: number,
  distanceInMeters: number
): Promise<boolean> {
  try {
    const db = getDb();

    // Get trip details
    const trip = await db
      .select()
      .from(trips)
      .where(eq(trips.id, tripId))
      .limit(1);

    if (trip.length === 0) return false;

    const distanceKm = (distanceInMeters / 1000).toFixed(1);
    const payload: PushNotificationPayload = {
      title: 'Ausflug in der Nähe',
      message: `"${trip[0].title}" ist nur noch ${distanceKm} km entfernt!`,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: `nearby-trip-${tripId}`,
      data: {
        type: 'nearby_trip',
        relatedId: tripId,
        url: `/trips/${tripId}`,
      },
    };

    return await sendPushNotificationToUser(userId, payload, 'nearby_trip');
  } catch (error) {
    console.error('Error in sendNearbyTripNotification:', error);
    return false;
  }
}

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Check and send nearby trip notifications for a user
 */
export async function checkAndSendNearbyTripNotifications(userId: number): Promise<void> {
  try {
    const db = getDb();

    // Get user's current location
    const userLocation = await db
      .select()
      .from(userLocations)
      .where(eq(userLocations.userId, userId))
      .limit(1);

    if (userLocation.length === 0) {
      console.log(`No location data for user ${userId}`);
      return;
    }

    const userLat = parseFloat(userLocation[0].latitude);
    const userLon = parseFloat(userLocation[0].longitude);

    // Get user settings (includes nearby trip distance threshold)
    const userSettings_ = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1);

    const distanceThreshold = userSettings_[0]?.nearbyTripDistance || 5000; // 5km default

    // Get all public and user's own trips
    const userTrips = await db
      .select()
      .from(trips)
      .where(
        and(
          // User's own trips OR public trips
          // This is simplified - in production you'd want more sophisticated filtering
          eq(trips.isPublic, 1)
        )
      );

    // Check distance for each trip
    for (const trip of userTrips) {
      if (!trip.latitude || !trip.longitude) continue;

      const tripLat = parseFloat(trip.latitude);
      const tripLon = parseFloat(trip.longitude);
      const distance = calculateDistance(userLat, userLon, tripLat, tripLon);

      // Only send notification if within threshold
      if (distance <= distanceThreshold) {
        // Check if we've already notified recently (prevent spam)
        const recentNotification = await db
          .select()
          .from(notificationsTable)
          .where(
            and(
              eq(notificationsTable.userId, userId),
              eq(notificationsTable.type, 'nearby_trip'),
              eq(notificationsTable.relatedId, trip.id)
            )
          )
          .orderBy((t) => t.createdAt)
          .limit(1);

        // Only send if no notification in last 24 hours
        if (recentNotification.length === 0 ||
          new Date().getTime() - recentNotification[0].createdAt.getTime() > 24 * 60 * 60 * 1000) {
          await sendNearbyTripNotification(userId, trip.id, distance);
        }
      }
    }
  } catch (error) {
    console.error('Error in checkAndSendNearbyTripNotifications:', error);
  }
}

export { webpush };
export const getVapidPublicKey = () => vapidPublicKey;
