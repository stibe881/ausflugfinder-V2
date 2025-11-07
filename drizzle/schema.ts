import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

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
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
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
  isFavorite: int("isFavorite").default(0).notNull(),
  isDone: int("isDone").default(0).notNull(),
  isPublic: int("isPublic").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

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
});

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
});

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
});

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
});

export type TripPhoto = typeof tripPhotos.$inferSelect;
export type InsertTripPhoto = typeof tripPhotos.$inferInsert;

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
});

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
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

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
