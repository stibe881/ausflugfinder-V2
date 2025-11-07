import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertTrip, InsertUser, InsertDestination, InsertTripParticipant, InsertTripComment, InsertTripPhoto, InsertTripAttribute, InsertDayPlan, InsertDayPlanItem, InsertPackingListItem, InsertBudgetItem, InsertChecklistItem,
  trips, users, destinations, tripParticipants, tripComments, tripPhotos, tripAttributes, dayPlans, dayPlanItems, packingListItems, budgetItems, checklistItems
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
  return result;
}

export async function getUserTrips(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  return await db.select().from(trips).where(eq(trips.userId, userId)).orderBy(trips.createdAt);
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
  return await db.insert(tripPhotos).values(photo);
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

// Advanced search and filter queries
export async function searchTrips(filters: {
  keyword?: string;
  region?: string;
  category?: string;
  cost?: string;
  attributes?: string[];
  isPublic?: boolean;
  userId?: number;
}) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  let query = db.select().from(trips);
  
  // Apply filters (simplified - in production, use proper query builder)
  // This is a basic implementation
  const results = await query;
  
  return results.filter(trip => {
    if (filters.isPublic !== undefined && trip.isPublic !== (filters.isPublic ? 1 : 0)) return false;
    if (filters.userId && trip.userId !== filters.userId) return false;
    if (filters.region && trip.region !== filters.region) return false;
    if (filters.category && trip.category !== filters.category) return false;
    if (filters.cost && trip.cost !== filters.cost) return false;
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      const searchText = `${trip.title} ${trip.description} ${trip.destination}`.toLowerCase();
      if (!searchText.includes(keyword)) return false;
    }
    return true;
  });
}

// Toggle favorite status
export async function toggleFavorite(tripId: number, userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const trip = await getTripById(tripId);
  if (!trip) {
    throw new Error("Trip not found");
  }
  const newStatus = trip.isFavorite === 1 ? 0 : 1;
  return await db.update(trips).set({ isFavorite: newStatus }).where(eq(trips.id, tripId));
}

// Toggle done status
export async function toggleDone(tripId: number, userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const trip = await getTripById(tripId);
  if (!trip) {
    throw new Error("Trip not found");
  }
  const newStatus = trip.isDone === 1 ? 0 : 1;
  return await db.update(trips).set({ isDone: newStatus }).where(eq(trips.id, tripId));
}

// Get public trips for explore page
export async function getPublicTrips() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  return await db.select().from(trips).where(eq(trips.isPublic, 1)).orderBy(trips.createdAt);
}

// Get statistics
export async function getStatistics() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  const allTrips = await db.select().from(trips).where(eq(trips.isPublic, 1));
  const freeTrips = allTrips.filter(t => t.cost === 'free');
  const categories = new Set(allTrips.map(t => t.category).filter(Boolean));
  
  return {
    totalActivities: allTrips.length,
    freeActivities: freeTrips.length,
    totalCategories: categories.size,
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
  
  const items = await db.select().from(dayPlanItems).where(eq(dayPlanItems.dayPlanId, dayPlanId));
  
  const itemsWithTrips = await Promise.all(
    items.map(async (item) => {
      const trip = await getTripById(item.tripId);
      return { ...item, trip };
    })
  );
  
  return itemsWithTrips;
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
