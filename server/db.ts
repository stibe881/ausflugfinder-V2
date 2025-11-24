import { eq, and, sql, or, like, count, inArray, isNotNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertTrips as InsertTrip,
  InsertUsers as InsertUser,
  InsertDestinations as InsertDestination,
  InsertTripParticipants as InsertTripParticipant,
  InsertTripComments as InsertTripComment,
  InsertTripPhotos as InsertTripPhoto,
  InsertTripAttributes as InsertTripAttribute,
  InsertDayPlans as InsertDayPlan,
  InsertDayPlanItems as InsertDayPlanItem,
  InsertPackingListItems as InsertPackingListItem,
  InsertBudgetItems as InsertBudgetItem,
  InsertChecklistItems as InsertChecklistItem,
  InsertTripJournal as InsertTripJournalEntry,
  InsertTripVideos as InsertTripVideo,
  InsertTripCategories as InsertTripCategory,
  trips, users, destinations, tripParticipants, tripComments, tripPhotos, tripAttributes, dayPlans, dayPlanItems, packingListItems, budgetItems, checklistItems, tripJournal, tripVideos, tripCategories
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Trip queries
export async function createTrip(trip: InsertTrip) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const result = await db.insert(trips).values(trip);
  // Drizzle's MySQL insert returns the result directly from mysql2
  // Log the result structure for debugging
  console.log("[createTrip] Insert result:", JSON.stringify(result, null, 2));

  // Try to extract insertId from different possible locations
  let insertId = (result as any).insertId;
  if (!insertId && Array.isArray(result) && result[0]) {
    insertId = result[0].insertId;
  }
  if (!insertId && typeof result === 'object' && result) {
    // Check all keys in the result object
    insertId = Object.values(result).find((val: any) => typeof val === 'number');
  }

  if (!insertId) {
    throw new Error(`Failed to get inserted trip ID. Result: ${JSON.stringify(result)}`);
  }
  return { id: insertId };
}

export async function getUserTrips(userId: number, pagination?: { page?: number; limit?: number }) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // OPTIMIZATION #6: Pagination support for user trips
  const page = pagination?.page || 1;
  const limit = Math.min(pagination?.limit || 20, 100);
  const offset = (page - 1) * limit;

  const [data, countResult] = await Promise.all([
    db.select()
      .from(trips)
      .where(eq(trips.userId, userId))
      .orderBy(trips.createdAt)
      .limit(limit)
      .offset(offset),
    db.select({ value: count() })
      .from(trips)
      .where(eq(trips.userId, userId))
  ]);

  const total = countResult[0]?.value || 0;

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

export async function getAllTrips() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  return await db.select().from(trips).orderBy(trips.createdAt);
}

export async function getTripById(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const result = await db.select().from(trips).where(eq(trips.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getTripCategories(tripId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  try {
    const result = await db.select().from(tripCategories).where(eq(tripCategories.tripId, tripId)).orderBy(tripCategories.createdAt);
    return result.map((r) => r.category);
  } catch (error) {
    // If table doesn't exist yet, return empty array
    // This allows the app to function while the migration is pending
    if (error instanceof Error && (error.message.includes("Unknown table") || error.message.includes("doesn't exist"))) {
      console.warn("[Database] tripCategories table does not exist yet, returning empty array");
      return [];
    }
    throw error;
  }
}

export async function updateTrip(id: number, userId: number, data: Partial<InsertTrip>) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  return await db.update(trips).set(data).where(eq(trips.id, id));
}

export async function deleteTrip(id: number, userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  return await db.delete(trips).where(eq(trips.id, id));
}

// Destination queries
export async function createDestination(destination: InsertDestination) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  return await db.insert(destinations).values(destination);
}

export async function getUserDestinations(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  return await db.select().from(destinations).where(eq(destinations.userId, userId)).orderBy(destinations.createdAt);
}

export async function getDestinationById(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const result = await db.select().from(destinations).where(eq(destinations.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateDestination(id: number, userId: number, data: Partial<InsertDestination>) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  return await db.update(destinations).set(data).where(and(eq(destinations.id, id), eq(destinations.userId, userId)));
}

export async function deleteDestination(id: number, userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  return await db.delete(destinations).where(and(eq(destinations.id, id), eq(destinations.userId, userId)));
}

// Trip Participant queries
export async function addTripParticipant(participant: InsertTripParticipant) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  return await db.insert(tripParticipants).values(participant);
}

export async function getTripParticipants(tripId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  return await db.select().from(tripParticipants).where(eq(tripParticipants.tripId, tripId));
}

export async function updateParticipantStatus(id: number, status: "confirmed" | "pending" | "declined") {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  return await db.update(tripParticipants).set({ status }).where(eq(tripParticipants.id, id));
}

export async function deleteParticipant(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  return await db.delete(tripParticipants).where(eq(tripParticipants.id, id));
}

// Trip Comment queries
export async function addTripComment(comment: InsertTripComment) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  return await db.insert(tripComments).values(comment);
}

export async function getTripComments(tripId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  return await db.select().from(tripComments).where(eq(tripComments.tripId, tripId)).orderBy(tripComments.createdAt);
}

export async function deleteComment(id: number, userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  return await db.delete(tripComments).where(and(eq(tripComments.id, id), eq(tripComments.userId, userId)));
}

// Trip Photo queries
export async function addTripPhoto(photo: InsertTripPhoto) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const result = await db.insert(tripPhotos).values(photo);
  return { insertId: (result as any)[0].insertId };
}

export async function getTripPhotos(tripId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  return await db.select().from(tripPhotos).where(eq(tripPhotos.tripId, tripId)).orderBy(tripPhotos.createdAt);
}

export async function deleteTripPhoto(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  return await db.delete(tripPhotos).where(eq(tripPhotos.id, id));
}

export async function setPrimaryPhoto(tripId: number, photoId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  // First, unset all primary photos for this trip
  await db.update(tripPhotos).set({ isPrimary: 0 }).where(eq(tripPhotos.tripId, tripId));
  // Then set the selected photo as primary
  return await db.update(tripPhotos).set({ isPrimary: 1 }).where(eq(tripPhotos.id, photoId));
}

// Trip Attribute queries
export async function addTripAttribute(attribute: InsertTripAttribute) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  return await db.insert(tripAttributes).values(attribute);
}

export async function getTripAttributes(tripId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  return await db.select().from(tripAttributes).where(eq(tripAttributes.tripId, tripId));
}

export async function deleteTripAttribute(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  return await db.delete(tripAttributes).where(eq(tripAttributes.id, id));
}

// Trip Category queries
export async function addTripCategory(tripId: number, category: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  return await db.insert(tripCategories).values({ tripId, category });
}

export async function deleteTripCategory(tripId: number, category: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  return await db.delete(tripCategories).where(and(eq(tripCategories.tripId, tripId), eq(tripCategories.category, category)));
}

export async function deleteTripCategories(tripId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  return await db.delete(tripCategories).where(eq(tripCategories.tripId, tripId));
}

// Advanced search and filter queries with pagination
export async function searchTrips(
  filters: {
    keyword?: string;
    region?: string;
    category?: string;
    cost?: string;
    attributes?: string[];
    isPublic?: boolean;
    userId?: number;
  },
  pagination?: { page?: number; limit?: number }
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // OPTIMIZATION #6: Pagination support
  const page = pagination?.page || 1;
  const limit = Math.min(pagination?.limit || 20, 100); // Cap at 100 for security
  const offset = (page - 1) * limit;

  // Build WHERE conditions
  const conditions: any[] = [];

  if (filters.isPublic !== undefined) {
    conditions.push(eq(trips.isPublic, filters.isPublic ? 1 : 0));
  }

  if (filters.userId) {
    conditions.push(eq(trips.userId, filters.userId));
  }

  if (filters.region) {
    conditions.push(eq(trips.region, filters.region));
  }

  if (filters.category) {
    conditions.push(eq(trips.category, filters.category));
  }

  if (filters.cost) {
    conditions.push(eq(trips.cost, filters.cost));
  }

  if (filters.keyword) {
    // Search in title, description, and destination
    const keyword = `%${filters.keyword}%`;
    conditions.push(
      or(
        like(trips.title, keyword),
        sql`COALESCE(${trips.description}, '') LIKE ${keyword}`,
        like(trips.destination, keyword)
      )
    );
  }

  // Combine all conditions
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Fetch trips and total count in parallel
  const [tripsData, countResult] = await Promise.all([
    db.select()
      .from(trips)
      .where(whereClause)
      .orderBy(trips.createdAt)
      .limit(limit)
      .offset(offset),
    db.select({ value: count() })
      .from(trips)
      .where(whereClause)
  ]);

  // Get primary photos for these trips
  const tripIds = tripsData.map(t => t.id);
  const photosData = tripIds.length > 0 ? await db.select()
    .from(tripPhotos)
    .where(
      and(
        inArray(tripPhotos.tripId, tripIds),
        eq(tripPhotos.isPrimary, 1)
      )
    ) : [];

  // Create a map for quick lookup
  const photoMap = new Map(photosData.map(p => [p.tripId, p.photoUrl]));

  // Map results to combine trip with primary photo
  const mappedData = tripsData.map(trip => ({
    ...trip,
    image: photoMap.get(trip.id) || trip.image || null
  }));

  const total = countResult[0]?.value || 0;

  return {
    data: mappedData,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

// Toggle favorite status
export async function toggleFavorite(tripId: number, userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Get current trip to check isFavorite status
  const trip = await db.select().from(trips).where(eq(trips.id, tripId)).limit(1);
  if (!trip || trip.length === 0) {
    throw new Error(`Trip ${tripId} not found`);
  }

  // Toggle the isFavorite status (0 -> 1, 1 -> 0)
  const newIsFavorite = trip[0].isFavorite === 1 ? 0 : 1;
  return await db
    .update(trips)
    .set({ isFavorite: newIsFavorite })
    .where(eq(trips.id, tripId));
}

// Toggle done status
export async function toggleDone(tripId: number, userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Get current trip to check isDone status
  const trip = await db.select().from(trips).where(eq(trips.id, tripId)).limit(1);
  if (!trip || trip.length === 0) {
    throw new Error(`Trip ${tripId} not found`);
  }

  // Toggle the isDone status (0 -> 1, 1 -> 0)
  const newIsDone = trip[0].isDone === 1 ? 0 : 1;
  return await db
    .update(trips)
    .set({ isDone: newIsDone })
    .where(eq(trips.id, tripId));
}

// Get public trips for explore page with pagination
export async function getPublicTrips(pagination?: { page?: number; limit?: number }) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // OPTIMIZATION #6: Pagination support for explore page
  const page = pagination?.page || 1;
  const limit = Math.min(pagination?.limit || 20, 100);
  const offset = (page - 1) * limit;

  // Get trips without photos first (avoiding duplicate rows from leftJoin)
  const [tripsData, countResult] = await Promise.all([
    db.select()
      .from(trips)
      .where(eq(trips.isPublic, 1))
      .orderBy(trips.createdAt)
      .limit(limit)
      .offset(offset),
    db.select({ value: count() })
      .from(trips)
      .where(eq(trips.isPublic, 1))
  ]);

  // Get primary photos for these trips in parallel
  const tripIds = tripsData.map(t => t.id);
  const photosData = tripIds.length > 0 ? await db.select()
    .from(tripPhotos)
    .where(
      and(
        inArray(tripPhotos.tripId, tripIds),
        eq(tripPhotos.isPrimary, 1)
      )
    ) : [];

  // Create a map for quick lookup
  const photoMap = new Map(photosData.map(p => [p.tripId, p.photoUrl]));

  // Map results to combine trip with primary photo
  const mappedData = tripsData.map(trip => ({
    ...trip,
    image: photoMap.get(trip.id) || trip.image || null
  }));

  const total = countResult[0]?.value || 0;

  return {
    data: mappedData,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

// Get statistics using SQL aggregation (much faster!)
export async function getStatistics() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Use SQL COUNT and DISTINCT instead of loading all data into memory
  const [totalResult, freeResult, categoriesResult] = await Promise.all([
    db.select({ value: count() })
      .from(trips)
      .where(eq(trips.isPublic, 1)),
    db.select({ value: count() })
      .from(trips)
      .where(and(eq(trips.isPublic, 1), eq(trips.cost, 'free'))),
    db.select({ value: sql`COUNT(DISTINCT ${tripCategories.category})` })
      .from(tripCategories)
      .innerJoin(trips, eq(tripCategories.tripId, trips.id))
      .where(eq(trips.isPublic, 1))
  ]);

  return {
    totalActivities: totalResult[0]?.value || 0,
    freeActivities: freeResult[0]?.value || 0,
    totalCategories: (categoriesResult[0]?.value as number) || 0,
  };
}


// ===== Day Plans Functions =====

export async function createDayPlan(dayPlan: InsertDayPlan) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(dayPlans).values(dayPlan);
  return result;
}

export async function getDayPlansByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(dayPlans).where(eq(dayPlans.userId, userId));
}

export async function getDayPlanById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(dayPlans).where(eq(dayPlans.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateDayPlan(id: number, data: Partial<InsertDayPlan>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(dayPlans).set(data).where(eq(dayPlans.id, id));
}

export async function deleteDayPlan(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Delete all items first
  await db.delete(dayPlanItems).where(eq(dayPlanItems.dayPlanId, id));
  // Then delete the plan
  return await db.delete(dayPlans).where(eq(dayPlans.id, id));
}

// ===== Day Plan Items Functions =====

export async function addTripToDayPlan(item: InsertDayPlanItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(dayPlanItems).values(item);
}

export async function getDayPlanItems(dayPlanId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(dayPlanItems).where(eq(dayPlanItems.dayPlanId, dayPlanId));
}

export async function getDayPlanItemsWithTrips(dayPlanId: number) {
  const db = await getDb();
  if (!db) return [];

  // OPTIMIZATION #5: Single JOIN query instead of N+1 pattern
  // Before: 1 query for items + N queries for trips = N+1 total
  // After: 1 query with LEFT JOIN = massive performance improvement
  const results = await db
    .select({
      // Day plan item fields
      id: dayPlanItems.id,
      dayPlanId: dayPlanItems.dayPlanId,
      tripId: dayPlanItems.tripId,
      dayNumber: dayPlanItems.dayNumber,
      orderIndex: dayPlanItems.orderIndex,
      startTime: dayPlanItems.startTime,
      endTime: dayPlanItems.endTime,
      notes: dayPlanItems.notes,
      dateAssigned: dayPlanItems.dateAssigned,
      createdAt: dayPlanItems.createdAt,
      // Trip fields (nested object)
      trip: {
        id: trips.id,
        userId: trips.userId,
        title: trips.title,
        description: trips.description,
        destination: trips.destination,
        startDate: trips.startDate,
        endDate: trips.endDate,
        participants: trips.participants,
        status: trips.status,
        cost: trips.cost,
        ageRecommendation: trips.ageRecommendation,
        routeType: trips.routeType,
        category: trips.category,
        region: trips.region,
        address: trips.address,
        websiteUrl: trips.websiteUrl,
        contactEmail: trips.contactEmail,
        contactPhone: trips.contactPhone,
        latitude: trips.latitude,
        longitude: trips.longitude,
        image: trips.image,
        isFavorite: trips.isFavorite,
        isDone: trips.isDone,
        isPublic: trips.isPublic,
        createdAt: trips.createdAt,
        updatedAt: trips.updatedAt,
      }
    })
    .from(dayPlanItems)
    .leftJoin(trips, eq(dayPlanItems.tripId, trips.id))
    .where(eq(dayPlanItems.dayPlanId, dayPlanId));

  return results;
}

/**
 * OPTIMIZATION #5: Consolidate day plan fetching
 * Combines getDayPlanById and getDayPlanItemsWithTrips into single operation
 * Used by export functions to avoid duplicate data fetches
 */
export async function getDayPlanWithItems(dayPlanId: number) {
  const db = await getDb();
  if (!db) return null;

  const plan = await getDayPlanById(dayPlanId);
  if (!plan) return null;

  const items = await getDayPlanItemsWithTrips(dayPlanId);

  return { plan, items };
}

export async function removeTripFromDayPlan(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(dayPlanItems).where(eq(dayPlanItems.id, id));
}

export async function updateDayPlanItem(id: number, data: Partial<InsertDayPlanItem>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(dayPlanItems).set(data).where(eq(dayPlanItems.id, id));
}

// ===== Packing List Functions =====
export async function addPackingListItem(item: InsertPackingListItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(packingListItems).values(item);
  return result;
}

export async function getPackingListItems(dayPlanId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(packingListItems).where(eq(packingListItems.dayPlanId, dayPlanId));
}

export async function updatePackingListItem(id: number, isPacked: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(packingListItems).set({ isPacked }).where(eq(packingListItems.id, id));
}

export async function updatePackingListItemFull(id: number, data: { item?: string; quantity?: number; category?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(packingListItems).set(data).where(eq(packingListItems.id, id));
}

export async function deletePackingListItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(packingListItems).where(eq(packingListItems.id, id));
}

// ===== Budget Functions =====
export async function addBudgetItem(item: InsertBudgetItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(budgetItems).values(item);
  return result;
}

export async function getBudgetItems(dayPlanId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(budgetItems).where(eq(budgetItems.dayPlanId, dayPlanId));
}

export async function updateBudgetItem(id: number, actualCost: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(budgetItems).set({ actualCost }).where(eq(budgetItems.id, id));
}

export async function deleteBudgetItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(budgetItems).where(eq(budgetItems.id, id));
}

// ===== Checklist Functions =====
export async function addChecklistItem(item: InsertChecklistItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(checklistItems).values(item);
  return result;
}

export async function getChecklistItems(dayPlanId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(checklistItems).where(eq(checklistItems.dayPlanId, dayPlanId));
}

export async function updateChecklistItem(id: number, isCompleted: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(checklistItems).set({ isCompleted }).where(eq(checklistItems.id, id));
}

export async function deleteChecklistItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(checklistItems).where(eq(checklistItems.id, id));
}

// ===== Trip Journal Functions =====
export async function addJournalEntry(entry: InsertTripJournalEntry) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(tripJournal).values(entry);
}

export async function getTripJournalEntries(tripId: number) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(tripJournal).where(eq(tripJournal.tripId, tripId)).orderBy(tripJournal.entryDate);
  } catch (error) {
    // If table doesn't exist yet, return empty array
    if (error instanceof Error && (error.message.includes("Unknown table") || error.message.includes("doesn't exist"))) {
      console.warn("[Database] tripJournal table does not exist yet, returning empty array");
      return [];
    }
    throw error;
  }
}

export async function updateJournalEntry(id: number, data: Partial<Omit<InsertTripJournalEntry, 'id' | 'tripId' | 'userId'>>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(tripJournal).set(data).where(eq(tripJournal.id, id));
}

export async function deleteJournalEntry(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(tripJournal).where(eq(tripJournal.id, id));
}

// ===== Trip Video Functions =====
export async function addVideo(video: InsertTripVideo) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(tripVideos).values(video);
}

export async function getTripVideos(tripId: number) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(tripVideos).where(eq(tripVideos.tripId, tripId)).orderBy(tripVideos.createdAt);
  } catch (error) {
    // If table doesn't exist yet, return empty array
    if (error instanceof Error && (error.message.includes("Unknown table") || error.message.includes("doesn't exist"))) {
      console.warn("[Database] tripVideos table does not exist yet, returning empty array");
      return [];
    }
    throw error;
  }
}

export async function deleteVideo(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(tripVideos).where(eq(tripVideos.id, id));
}

// ===== User Functions =====
export async function deleteUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Delete all related data in cascade order
  // Get all trips for this user
  const userTrips = await db.select({ id: trips.id }).from(trips).where(eq(trips.userId, userId));
  const tripIds = userTrips.map(t => t.id);

  // Delete trip-related data for all trips
  for (const tripId of tripIds) {
    await db.delete(tripParticipants).where(eq(tripParticipants.tripId, tripId));
    await db.delete(tripPhotos).where(eq(tripPhotos.tripId, tripId));
    await db.delete(tripComments).where(eq(tripComments.tripId, tripId));
    await db.delete(tripAttributes).where(eq(tripAttributes.tripId, tripId));
    await db.delete(tripJournal).where(eq(tripJournal.tripId, tripId));
    await db.delete(tripVideos).where(eq(tripVideos.tripId, tripId));
  }

  // Delete day plans and associated data
  const userDayPlans = await db.select({ id: dayPlans.id }).from(dayPlans).where(eq(dayPlans.userId, userId));
  const dayPlanIds = userDayPlans.map(dp => dp.id);

  for (const dpId of dayPlanIds) {
    await db.delete(dayPlanItems).where(eq(dayPlanItems.dayPlanId, dpId));
    await db.delete(packingListItems).where(eq(packingListItems.dayPlanId, dpId));
    await db.delete(budgetItems).where(eq(budgetItems.dayPlanId, dpId));
    await db.delete(checklistItems).where(eq(checklistItems.dayPlanId, dpId));
  }

  // Delete day plans
  await db.delete(dayPlans).where(eq(dayPlans.userId, userId));

  // Delete trips
  await db.delete(trips).where(eq(trips.userId, userId));

  // Delete destinations
  await db.delete(destinations).where(eq(destinations.userId, userId));

  // Delete friendships
  await db.delete(friendships).where(eq(friendships.userId, userId));
  await db.delete(friendships).where(eq(friendships.friendId, userId));

  // Delete notifications
  await db.delete(notifications).where(eq(notifications.userId, userId));

  // Delete push subscriptions
  await db.delete(pushSubscriptions).where(eq(pushSubscriptions.userId, userId));

  // Delete user locations
  await db.delete(userLocations).where(eq(userLocations.userId, userId));

  // Delete user settings
  await db.delete(userSettings).where(eq(userSettings.userId, userId));

  // Delete password reset tokens
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));

  // Finally, delete the user
  return await db.delete(users).where(eq(users.id, userId));
}
