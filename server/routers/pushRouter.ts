/**
 * Push Notifications Router
 * Handles all push notification and subscription endpoints
 */

import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import {
  pushSubscriptions,
  userSettings,
  userLocations,
  notifications as notificationsTable,
  friendships,
  users,
} from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import {
  sendPushNotificationToUser,
  sendFriendRequestNotification,
  sendFriendAcceptedNotification,
  checkAndSendNearbyTripNotifications,
  getVapidPublicKey,
} from "../_core/pushNotifications";
import { handleError, toTRPCError } from "../_core/errors";

const PushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    auth: z.string(),
    p256dh: z.string(),
  }),
});

export const pushRouter = router({
  // Get VAPID public key for client-side subscription
  getVapidPublicKey: publicProcedure.query(async () => {
    try {
      return { publicKey: getVapidPublicKey() };
    } catch (error) {
      const appError = handleError(error, "push.getVapidPublicKey");
      throw toTRPCError(appError);
    }
  }),

  // Subscribe user to push notifications
  subscribe: protectedProcedure
    .input(PushSubscriptionSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        const userId = ctx.user?.id;

        if (!db) {
          throw new Error("Database not available");
        }

        if (!userId) {
          throw new Error("User not authenticated");
        }

        // Check if this exact subscription already exists
        const existingSubscription = await db
          .select()
          .from(pushSubscriptions)
          .where(
            and(
              eq(pushSubscriptions.userId, userId),
              eq(pushSubscriptions.endpoint, input.endpoint)
            )
          )
          .limit(1);

        if (existingSubscription.length > 0) {
          return { success: true, isNew: false, message: "Subscription already exists" };
        }

        // Insert new subscription
        await db.insert(pushSubscriptions).values({
          userId,
          endpoint: input.endpoint,
          auth: input.keys.auth,
          p256dh: input.keys.p256dh,
          userAgent: ctx.request?.headers.get("user-agent") || undefined,
        });

        // Create default user settings if not exists
        const existingSettings = await db
          .select()
          .from(userSettings)
          .where(eq(userSettings.userId, userId))
          .limit(1);

        if (existingSettings.length === 0) {
          await db.insert(userSettings).values({
            userId,
            notificationsEnabled: 1,
            friendRequestNotifications: 1,
            friendRequestAcceptedNotifications: 1,
            nearbyTripNotifications: 1,
            nearbyTripDistance: 5000,
            locationTrackingEnabled: 1,
          });
        }

        console.log(`✓ Push subscription added for user ${userId}`);
        return { success: true, isNew: true, message: "Push subscription created" };
      } catch (error) {
        const appError = handleError(error, "push.subscribe");
        throw toTRPCError(appError);
      }
    }),

  // Unsubscribe user from push notifications
  unsubscribe: protectedProcedure
    .input(z.object({ endpoint: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        const userId = ctx.user?.id;

        if (!db) {
          throw new Error("Database not available");
        }

        if (!userId) {
          throw new Error("User not authenticated");
        }

        // Delete subscription
        await db
          .delete(pushSubscriptions)
          .where(
            and(
              eq(pushSubscriptions.userId, userId),
              eq(pushSubscriptions.endpoint, input.endpoint)
            )
          );

        console.log(`✓ Push subscription removed for user ${userId}`);
        return { success: true, message: "Unsubscribed from push notifications" };
      } catch (error) {
        const appError = handleError(error, "push.unsubscribe");
        throw toTRPCError(appError);
      }
    }),

  // Update user location for proximity checks
  updateLocation: protectedProcedure
    .input(
      z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        accuracy: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        const userId = ctx.user?.id;

        if (!db) {
          throw new Error("Database not available");
        }

        if (!userId) {
          throw new Error("User not authenticated");
        }

        // Check if user has location enabled
        const userSettings_ = await db
          .select()
          .from(userSettings)
          .where(eq(userSettings.userId, userId))
          .limit(1);

        if (userSettings_.length === 0 || !userSettings_[0].locationTrackingEnabled) {
          return { success: false, message: "Location tracking is disabled" };
        }

        // Check if location record exists
        const existingLocation = await db
          .select()
          .from(userLocations)
          .where(eq(userLocations.userId, userId))
          .limit(1);

        if (existingLocation.length > 0) {
          // Update existing location
          await db
            .update(userLocations)
            .set({
              latitude: input.latitude.toString(),
              longitude: input.longitude.toString(),
              accuracy: input.accuracy?.toString(),
              updatedAt: new Date(),
            })
            .where(eq(userLocations.userId, userId));
        } else {
          // Insert new location
          await db.insert(userLocations).values({
            userId,
            latitude: input.latitude.toString(),
            longitude: input.longitude.toString(),
            accuracy: input.accuracy?.toString(),
          });
        }

        // Check for nearby trips (can be done asynchronously in production)
        // await checkAndSendNearbyTripNotifications(userId);

        console.log(`✓ Location updated for user ${userId}`);
        return { success: true, message: "Location updated" };
      } catch (error) {
        const appError = handleError(error, "push.updateLocation");
        throw toTRPCError(appError);
      }
    }),

  // Get user settings
  getSettings: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      const userId = ctx.user?.id;

      if (!db) {
        throw new Error("Database not available");
      }

      if (!userId) {
        throw new Error("User not authenticated");
      }

      const settings = await db
        .select()
        .from(userSettings)
        .where(eq(userSettings.userId, userId))
        .limit(1);

      if (settings.length === 0) {
        // Return default settings if not found
        return {
          notificationsEnabled: true,
          friendRequestNotifications: true,
          friendRequestAcceptedNotifications: true,
          nearbyTripNotifications: true,
          nearbyTripDistance: 5000,
          locationTrackingEnabled: true,
        };
      }

      return {
        notificationsEnabled: !!settings[0].notificationsEnabled,
        friendRequestNotifications: !!settings[0].friendRequestNotifications,
        friendRequestAcceptedNotifications: !!settings[0].friendRequestAcceptedNotifications,
        nearbyTripNotifications: !!settings[0].nearbyTripNotifications,
        nearbyTripDistance: settings[0].nearbyTripDistance,
        locationTrackingEnabled: !!settings[0].locationTrackingEnabled,
      };
    } catch (error) {
      const appError = handleError(error, "push.getSettings");
      throw toTRPCError(appError);
    }
  }),

  // Update user settings
  updateSettings: protectedProcedure
    .input(
      z.object({
        notificationsEnabled: z.boolean().optional(),
        friendRequestNotifications: z.boolean().optional(),
        friendRequestAcceptedNotifications: z.boolean().optional(),
        nearbyTripNotifications: z.boolean().optional(),
        nearbyTripDistance: z.number().min(100).max(100000).optional(),
        locationTrackingEnabled: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        const userId = ctx.user?.id;

        if (!db) {
          throw new Error("Database not available");
        }

        if (!userId) {
          throw new Error("User not authenticated");
        }

        // Prepare update object
        const updateData: any = {
          updatedAt: new Date(),
        };

        if (input.notificationsEnabled !== undefined) {
          updateData.notificationsEnabled = input.notificationsEnabled ? 1 : 0;
        }
        if (input.friendRequestNotifications !== undefined) {
          updateData.friendRequestNotifications = input.friendRequestNotifications ? 1 : 0;
        }
        if (input.friendRequestAcceptedNotifications !== undefined) {
          updateData.friendRequestAcceptedNotifications =
            input.friendRequestAcceptedNotifications ? 1 : 0;
        }
        if (input.nearbyTripNotifications !== undefined) {
          updateData.nearbyTripNotifications = input.nearbyTripNotifications ? 1 : 0;
        }
        if (input.nearbyTripDistance !== undefined) {
          updateData.nearbyTripDistance = input.nearbyTripDistance;
        }
        if (input.locationTrackingEnabled !== undefined) {
          updateData.locationTrackingEnabled = input.locationTrackingEnabled ? 1 : 0;
        }

        // Check if settings exist
        const existingSettings = await db
          .select()
          .from(userSettings)
          .where(eq(userSettings.userId, userId))
          .limit(1);

        if (existingSettings.length > 0) {
          // Update existing settings
          await db
            .update(userSettings)
            .set(updateData)
            .where(eq(userSettings.userId, userId));
        } else {
          // Create new settings with defaults
          await db.insert(userSettings).values({
            userId,
            notificationsEnabled: updateData.notificationsEnabled ?? 1,
            friendRequestNotifications: updateData.friendRequestNotifications ?? 1,
            friendRequestAcceptedNotifications:
              updateData.friendRequestAcceptedNotifications ?? 1,
            nearbyTripNotifications: updateData.nearbyTripNotifications ?? 1,
            nearbyTripDistance: updateData.nearbyTripDistance ?? 5000,
            locationTrackingEnabled: updateData.locationTrackingEnabled ?? 1,
          });
        }

        console.log(`✓ Settings updated for user ${userId}`);
        return { success: true, message: "Settings updated" };
      } catch (error) {
        const appError = handleError(error, "push.updateSettings");
        throw toTRPCError(appError);
      }
    }),

  // Get notification history
  getNotifications: protectedProcedure
    .input(z.object({ limit: z.number().default(20), unreadOnly: z.boolean().default(false) }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        const userId = ctx.user?.id;

        if (!db) {
          throw new Error("Database not available");
        }

        if (!userId) {
          throw new Error("User not authenticated");
        }

        let query = db.select().from(notificationsTable).where(eq(notificationsTable.userId, userId));

        if (input.unreadOnly) {
          query = db
            .select()
            .from(notificationsTable)
            .where(
              and(
                eq(notificationsTable.userId, userId),
                eq(notificationsTable.isRead, 0)
              )
            );
        }

        const notifications = await query.orderBy((t) => t.createdAt).limit(input.limit);

        return {
          notifications: notifications.map((n) => ({
            ...n,
            isRead: !!n.isRead,
          })),
        };
      } catch (error) {
        const appError = handleError(error, "push.getNotifications");
        throw toTRPCError(appError);
      }
    }),

  // Mark notification as read
  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        const userId = ctx.user?.id;

        if (!db) {
          throw new Error("Database not available");
        }

        if (!userId) {
          throw new Error("User not authenticated");
        }

        // Verify notification belongs to user before updating
        const notification = await db
          .select()
          .from(notificationsTable)
          .where(
            and(
              eq(notificationsTable.id, input.notificationId),
              eq(notificationsTable.userId, userId)
            )
          )
          .limit(1);

        if (notification.length === 0) {
          throw new Error("Notification not found");
        }

        await db
          .update(notificationsTable)
          .set({ isRead: 1 })
          .where(eq(notificationsTable.id, input.notificationId));

        return { success: true, message: "Notification marked as read" };
      } catch (error) {
        const appError = handleError(error, "push.markAsRead");
        throw toTRPCError(appError);
      }
    }),

  // Find user by email
  findUserByEmail: protectedProcedure
    .input(z.object({ email: z.string().email("Invalid email format") }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();

        if (!db) {
          throw new Error("Database not available");
        }

        const [user] = await db
          .select({ id: users.id, name: users.name, email: users.email })
          .from(users)
          .where(eq(users.email, input.email))
          .limit(1);

        if (!user) {
          return null;
        }

        // Do not allow finding self
        if (user.id === ctx.user?.id) {
          throw new Error("Cannot add yourself as a friend");
        }

        return user;
      } catch (error) {
        const appError = handleError(error, "push.findUserByEmail");
        throw toTRPCError(appError);
      }
    }),

  // Send friend request
  sendFriendRequest: protectedProcedure
    .input(z.object({ toUserIdentifier: z.union([z.number(), z.string().email("Invalid email format")]) }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        const fromUserId = ctx.user?.id;

        if (!db) {
          throw new Error("Database not available");
        }

        if (!fromUserId) {
          throw new Error("User not authenticated");
        }

        let toUserId: number;

        if (typeof input.toUserIdentifier === 'string') {
          // It's an email, find the user ID
          const [user] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, input.toUserIdentifier))
            .limit(1);

          if (!user) {
            throw new Error("User with this email not found");
          }
          toUserId = user.id;
        } else {
          // It's already a user ID
          toUserId = input.toUserIdentifier;
        }

        // Do not allow sending friend request to self
        if (fromUserId === toUserId) {
          throw new Error("Cannot send friend request to yourself");
        }

        // Check if users are already friends or have a pending request
        const existingFriendship = await db
          .select()
          .from(friendships)
          .where(
            and(
              eq(friendships.userId, fromUserId),
              eq(friendships.friendId, toUserId)
            )
          )
          .limit(1);

        if (existingFriendship.length > 0) {
          const existing = existingFriendship[0];
          if (existing.status === "accepted") {
            throw new Error("Already friends with this user");
          }
          if (existing.status === "pending") {
            throw new Error("Friend request already sent");
          }
        }

        // Create friendship record (forward direction)
        await db.insert(friendships).values({
          userId: fromUserId,
          friendId: toUserId,
          status: "pending",
          requestedBy: fromUserId,
        });

        // Create friendship record (reverse direction) - for easier querying
        await db.insert(friendships).values({
          userId: toUserId,
          friendId: fromUserId,
          status: "pending",
          requestedBy: fromUserId,
        });

        // Send notification
        await sendFriendRequestNotification(fromUserId, toUserId);

        console.log(`✓ Friend request sent from ${fromUserId} to ${toUserId}`);
        return { success: true, message: "Friend request sent" };
      } catch (error) {
        const appError = handleError(error, "push.sendFriendRequest");
        throw toTRPCError(appError);
      }
    }),

  // Accept friend request
  acceptFriendRequest: protectedProcedure
    .input(z.object({ fromUserId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        const toUserId = ctx.user?.id;

        if (!db) {
          throw new Error("Database not available");
        }

        if (!toUserId) {
          throw new Error("User not authenticated");
        }

        // Update friendship status
        await db
          .update(friendships)
          .set({ status: "accepted" })
          .where(
            and(
              eq(friendships.userId, toUserId),
              eq(friendships.friendId, input.fromUserId),
              eq(friendships.status, "pending")
            )
          );

        // Also update the reverse friendship
        await db
          .update(friendships)
          .set({ status: "accepted" })
          .where(
            and(
              eq(friendships.userId, input.fromUserId),
              eq(friendships.friendId, toUserId)
            )
          );

        // Send notification
        await sendFriendAcceptedNotification(toUserId, input.fromUserId);

        console.log(`✓ Friend request accepted between ${input.fromUserId} and ${toUserId}`);
        return { success: true, message: "Friend request accepted" };
      } catch (error) {
        const appError = handleError(error, "push.acceptFriendRequest");
        throw toTRPCError(appError);
      }
    }),

  // Get friends list
  getFriends: protectedProcedure
    .input(z.object({ status: z.enum(["pending", "accepted", "blocked"]).default("accepted") }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        const userId = ctx.user?.id;

        if (!db) {
          throw new Error("Database not available");
        }

        if (!userId) {
          throw new Error("User not authenticated");
        }

        const friendshipList = await db
          .select()
          .from(friendships)
          .where(
            and(
              eq(friendships.userId, userId),
              eq(friendships.status, input.status)
            )
          );

        return { friends: friendshipList };
      } catch (error) {
        const appError = handleError(error, "push.getFriends");
        throw toTRPCError(appError);
      }
    }),
});

export type PushRouter = typeof pushRouter;
