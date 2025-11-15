import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, index } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. Optional for local auth. */
  openId: varchar("openId", { length: 64 }).unique(),
  /** Username for local authentication. Optional if using OAuth. */
  username: varchar("username", { length: 255 }).unique(),
  /** Password hash for local authentication. Optional if using OAuth. */
  passwordHash: varchar("passwordHash", { length: 255 }),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }).default("local"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Ausflüge table for managing trips/excursions.
 * Each trip is associated with a user who created it.
 */
export const trips = mysqlTable("trips", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  destination: varchar("destination", { length: 255 }).notNull(),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  participants: int("participants").default(1).notNull(),
  status: mysqlEnum("status", ["planned", "ongoing", "completed", "cancelled"]).default("planned").notNull(),
  // New fields from ausflugfinder.ch
  cost: mysqlEnum("cost", ["free", "low", "medium", "high", "very_high"]).default("free").notNull(),
  ageRecommendation: varchar("ageRecommendation", { length: 50 }),
  routeType: mysqlEnum("routeType", ["round_trip", "one_way", "location"]).default("location").notNull(),
  category: varchar("category", { length: 100 }),
  region: varchar("region", { length: 100 }),
  address: varchar("address", { length: 512 }),
  websiteUrl: varchar("websiteUrl", { length: 512 }),
  contactEmail: varchar("contactEmail", { length: 320 }),
  contactPhone: varchar("contactPhone", { length: 50 }),
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),
  image: text("image"), // Title image/cover image for trip details and explore view (Base64 data URL or URL)
  isFavorite: int("isFavorite").default(0).notNull(),
  isDone: int("isDone").default(0).notNull(),
  isPublic: int("isPublic").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  // OPTIMIZATION #7: Database indexes for query performance
  userIdIdx: index("trips_user_id_idx").on(table.userId),
  isPublicIdx: index("trips_is_public_idx").on(table.isPublic),
  createdAtIdx: index("trips_created_at_idx").on(table.createdAt),
  regionIdx: index("trips_region_idx").on(table.region),
  categoryIdx: index("trips_category_idx").on(table.category),
  costIdx: index("trips_cost_idx").on(table.cost),
  // Composite index for search queries (region + category + cost)
  searchIdx: index("trips_search_idx").on(table.region, table.category, table.cost),
}));

export type Trip = typeof trips.$inferSelect;
export type InsertTrip = typeof trips.$inferInsert;

/**
 * Destinations table for managing favorite locations.
 * Users can save and reuse destinations across multiple trips.
 */
export const destinations = mysqlTable("destinations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  location: varchar("location", { length: 255 }).notNull(),
  imageUrl: varchar("imageUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  // OPTIMIZATION #7: Indexes for user destinations
  userIdIdx: index("destinations_user_id_idx").on(table.userId),
  createdAtIdx: index("destinations_created_at_idx").on(table.createdAt),
}));

export type Destination = typeof destinations.$inferSelect;
export type InsertDestination = typeof destinations.$inferInsert;

/**
 * Trip participants table for managing who is joining each trip.
 * Links users to trips they are participating in.
 */
export const tripParticipants = mysqlTable("tripParticipants", {
  id: int("id").autoincrement().primaryKey(),
  tripId: int("tripId").notNull(),
  userId: int("userId"),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  status: mysqlEnum("status", ["confirmed", "pending", "declined"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  // OPTIMIZATION #7: Indexes for trip participants lookup
  tripIdIdx: index("trip_participants_trip_id_idx").on(table.tripId),
  userIdIdx: index("trip_participants_user_id_idx").on(table.userId),
}));

export type TripParticipant = typeof tripParticipants.$inferSelect;
export type InsertTripParticipant = typeof tripParticipants.$inferInsert;

/**
 * Trip comments/notes table for adding notes and updates to trips.
 * Allows users to document their planning process and memories.
 */
export const tripComments = mysqlTable("tripComments", {
  id: int("id").autoincrement().primaryKey(),
  tripId: int("tripId").notNull(),
  userId: int("userId").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  // OPTIMIZATION #7: Indexes for comment lookups
  tripIdIdx: index("trip_comments_trip_id_idx").on(table.tripId),
  createdAtIdx: index("trip_comments_created_at_idx").on(table.createdAt),
}));

export type TripComment = typeof tripComments.$inferSelect;
export type InsertTripComment = typeof tripComments.$inferInsert;

/**
 * Trip photos table for storing multiple photos per trip.
 * Allows users to upload and display photo galleries for each trip.
 */
export const tripPhotos = mysqlTable("tripPhotos", {
  id: int("id").autoincrement().primaryKey(),
  tripId: int("tripId").notNull(),
  photoUrl: varchar("photoUrl", { length: 512 }).notNull(),
  caption: text("caption"),
  isPrimary: int("isPrimary").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  // OPTIMIZATION #7: Indexes for photo lookups
  tripIdIdx: index("trip_photos_trip_id_idx").on(table.tripId),
  createdAtIdx: index("trip_photos_created_at_idx").on(table.createdAt),
}));

export type TripPhoto = typeof tripPhotos.$inferSelect;
export type InsertTripPhoto = typeof tripPhotos.$inferInsert;

/**
 * Trip journal entries table for documenting trip experiences.
 * Allows users to write entries during their trips with timestamps.
 */
export const tripJournal = mysqlTable("tripJournal", {
  id: int("id").autoincrement().primaryKey(),
  tripId: int("tripId").notNull(),
  userId: int("userId").notNull(),
  content: text("content").notNull(),
  entryDate: timestamp("entryDate").notNull(), // Date when the entry was written (not today, but the trip date)
  mood: varchar("mood", { length: 50 }), // e.g., "happy", "excited", "tired", "relaxed"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  // OPTIMIZATION #7: Indexes for journal lookups
  tripIdIdx: index("trip_journal_trip_id_idx").on(table.tripId),
  userIdIdx: index("trip_journal_user_id_idx").on(table.userId),
  entryDateIdx: index("trip_journal_entry_date_idx").on(table.entryDate),
  createdAtIdx: index("trip_journal_created_at_idx").on(table.createdAt),
}));

export type TripJournalEntry = typeof tripJournal.$inferSelect;
export type InsertTripJournalEntry = typeof tripJournal.$inferInsert;

/**
 * Trip videos table for storing embedded videos from YouTube and TikTok.
 * Allows users to add videos from their trips.
 */
export const tripVideos = mysqlTable("tripVideos", {
  id: int("id").autoincrement().primaryKey(),
  tripId: int("tripId").notNull(),
  videoId: varchar("videoId", { length: 255 }).notNull(), // Platform-specific video ID
  platform: mysqlEnum("platform", ["youtube", "tiktok"]).notNull(),
  title: varchar("title", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  // OPTIMIZATION #7: Indexes for video lookups
  tripIdIdx: index("trip_videos_trip_id_idx").on(table.tripId),
  createdAtIdx: index("trip_videos_created_at_idx").on(table.createdAt),
}));

export type TripVideo = typeof tripVideos.$inferSelect;
export type InsertTripVideo = typeof tripVideos.$inferInsert;

/**
 * Trip attributes/tags table for filtering and categorization.
 * Stores various attributes like "Family-friendly", "Barrier-free", etc.
 */
export const tripAttributes = mysqlTable("tripAttributes", {
  id: int("id").autoincrement().primaryKey(),
  tripId: int("tripId").notNull(),
  attribute: varchar("attribute", { length: 100 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TripAttribute = typeof tripAttributes.$inferSelect;
export type InsertTripAttribute = typeof tripAttributes.$inferInsert;
/**
 * Day plans table for organizing multiple trips into daily or multi-day itineraries.
 * Users can create plans and add trips to them in a specific order.
 */
export const dayPlans = mysqlTable("dayPlans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  isPublic: int("isPublic").default(0).notNull(),
  isDraft: int("isDraft").default(1).notNull(), // 1 = draft, 0 = published
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  // OPTIMIZATION #7: Indexes for day plan lookups
  userIdIdx: index("day_plans_user_id_idx").on(table.userId),
  createdAtIdx: index("day_plans_created_at_idx").on(table.createdAt),
}));

export type DayPlan = typeof dayPlans.$inferSelect;
export type InsertDayPlan = typeof dayPlans.$inferInsert;

/**
 * Day plan items table for linking trips to day plans.
 * Maintains the order and timing of trips within a plan.
 */
export const dayPlanItems = mysqlTable("dayPlanItems", {
  id: int("id").autoincrement().primaryKey(),
  dayPlanId: int("dayPlanId").notNull(),
  tripId: int("tripId").notNull(),
  dayNumber: int("dayNumber").default(1).notNull(), // For multi-day plans
  orderIndex: int("orderIndex").notNull(), // Order within the day
  startTime: varchar("startTime", { length: 10 }), // e.g., "09:00"
  endTime: varchar("endTime", { length: 10 }), // e.g., "12:00"
  notes: text("notes"),
  dateAssigned: timestamp("dateAssigned"), // The specific date this trip is assigned to
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  // OPTIMIZATION #7: Indexes for day plan items
  dayPlanIdIdx: index("day_plan_items_day_plan_id_idx").on(table.dayPlanId),
  tripIdIdx: index("day_plan_items_trip_id_idx").on(table.tripId),
}));

export type DayPlanItem = typeof dayPlanItems.$inferSelect;
export type InsertDayPlanItem = typeof dayPlanItems.$inferInsert;

/**
 * Packing list items for day plans.
 * Users can create checklists of items to bring.
 */
export const packingListItems = mysqlTable("packingListItems", {
  id: int("id").autoincrement().primaryKey(),
  dayPlanId: int("dayPlanId").notNull(),
  item: varchar("item", { length: 255 }).notNull(),
  quantity: int("quantity").default(1).notNull(),
  isPacked: int("isPacked").default(0).notNull(),
  category: varchar("category", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PackingListItem = typeof packingListItems.$inferSelect;
export type InsertPackingListItem = typeof packingListItems.$inferInsert;

/**
 * Budget items for day plans.
 * Track estimated and actual costs for trips.
 */
export const budgetItems = mysqlTable("budgetItems", {
  id: int("id").autoincrement().primaryKey(),
  dayPlanId: int("dayPlanId").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  estimatedCost: varchar("estimatedCost", { length: 20 }).notNull(),
  actualCost: varchar("actualCost", { length: 20 }),
  currency: varchar("currency", { length: 10 }).default("CHF").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BudgetItem = typeof budgetItems.$inferSelect;
export type InsertBudgetItem = typeof budgetItems.$inferInsert;

/**
 * Checklists for day plans.
 * General purpose checklists for tasks and reminders.
 */
export const checklistItems = mysqlTable("checklistItems", {
  id: int("id").autoincrement().primaryKey(),
  dayPlanId: int("dayPlanId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  isCompleted: int("isCompleted").default(0).notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
  dueDate: timestamp("dueDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChecklistItem = typeof checklistItems.$inferSelect;
export type InsertChecklistItem = typeof checklistItems.$inferInsert;

/**
 * Trip categories table for storing multiple categories per trip.
 * Allows trips to have multiple category tags instead of just one.
 */
export const tripCategories = mysqlTable("tripCategories", {
  id: int("id").autoincrement().primaryKey(),
  tripId: int("tripId").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  // OPTIMIZATION #7: Indexes for category lookups
  tripIdIdx: index("trip_categories_trip_id_idx").on(table.tripId),
  categoryIdx: index("trip_categories_category_idx").on(table.category),
}));

export type TripCategory = typeof tripCategories.$inferSelect;
export type InsertTripCategory = typeof tripCategories.$inferInsert;

/**
 * Push subscriptions table for storing Web Push API subscriptions.
 * Each subscription allows sending push notifications to a specific device/browser.
 */
export const pushSubscriptions = mysqlTable("pushSubscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  endpoint: varchar("endpoint", { length: 2048 }).notNull(),
  auth: varchar("auth", { length: 255 }).notNull(),
  p256dh: varchar("p256dh", { length: 255 }).notNull(),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("push_subscriptions_user_id_idx").on(table.userId),
  endpointIdx: index("push_subscriptions_endpoint_idx").on(table.endpoint),
}));

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = typeof pushSubscriptions.$inferInsert;

/**
 * User notification settings table for managing notification preferences.
 * Controls which types of notifications a user wants to receive.
 */
export const userSettings = mysqlTable("userSettings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  notificationsEnabled: int("notificationsEnabled").default(1).notNull(), // 1 = true, 0 = false
  friendRequestNotifications: int("friendRequestNotifications").default(1).notNull(),
  friendRequestAcceptedNotifications: int("friendRequestAcceptedNotifications").default(1).notNull(),
  nearbyTripNotifications: int("nearbyTripNotifications").default(1).notNull(),
  nearbyTripDistance: int("nearbyTripDistance").default(5000).notNull(), // in meters
  locationTrackingEnabled: int("locationTrackingEnabled").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_settings_user_id_idx").on(table.userId),
}));

export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = typeof userSettings.$inferInsert;

/**
 * Friendships table for managing friend connections between users.
 * Bidirectional relationships with pending/accepted/blocked status.
 */
export const friendships = mysqlTable("friendships", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  friendId: int("friendId").notNull(),
  status: mysqlEnum("status", ["pending", "accepted", "blocked"]).default("pending").notNull(),
  requestedBy: int("requestedBy").notNull(), // Which user sent the request
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("friendships_user_id_idx").on(table.userId),
  friendIdIdx: index("friendships_friend_id_idx").on(table.friendId),
  statusIdx: index("friendships_status_idx").on(table.status),
}));

export type Friendship = typeof friendships.$inferSelect;
export type InsertFriendship = typeof friendships.$inferInsert;

/**
 * User locations table for tracking user GPS coordinates.
 * Updated periodically when location tracking is enabled.
 */
export const userLocations = mysqlTable("userLocations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  latitude: varchar("latitude", { length: 50 }).notNull(),
  longitude: varchar("longitude", { length: 50 }).notNull(),
  accuracy: varchar("accuracy", { length: 50 }),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_locations_user_id_idx").on(table.userId),
  updatedAtIdx: index("user_locations_updated_at_idx").on(table.updatedAt),
}));

export type UserLocation = typeof userLocations.$inferSelect;
export type InsertUserLocation = typeof userLocations.$inferInsert;

/**
 * Notifications table for storing in-app notifications history.
 * Allows users to view notification history in the app.
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: mysqlEnum("type", ["friend_request", "friend_accepted", "nearby_trip", "system"]).default("system").notNull(),
  relatedId: int("relatedId"), // ID of related entity (userId for friend, tripId for nearby trip, etc.)
  isRead: int("isRead").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("notifications_user_id_idx").on(table.userId),
  isReadIdx: index("notifications_is_read_idx").on(table.isRead),
  createdAtIdx: index("notifications_created_at_idx").on(table.createdAt),
}));

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
