/**
 * Centralized Input Validation
 * Improvement #12: Complete input validation across all endpoints
 */

import { z } from "zod";

// Enum definitions for consistency
export const tripStatusEnum = ["planned", "ongoing", "completed", "cancelled"] as const;
export const costLevelEnum = ["free", "low", "medium", "high", "very_high"] as const;
export const participantStatusEnum = ["confirmed", "pending", "declined"] as const;

// ====== TRIP VALIDATION ======
export const createTripSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  destination: z.string().min(2).max(100),
  description: z.string().max(2000).optional(),
  startDate: z.date(),
  endDate: z.date(),
  region: z.string().max(50).optional(),
  category: z.string().max(50).optional(),
  cost: z.enum(costLevelEnum),
  ageRecommendation: z.string().max(50).optional(),
  estimatedCost: z.number().min(0).default(0),
  isPublic: z.boolean().default(false),
  image: z.string().max(1000000).optional(), // Max 1MB Base64
}).refine(data => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
});

export const updateTripSchema = createTripSchema.partial();

export const tripIdSchema = z.object({
  id: z.number().positive("Trip ID must be positive"),
});

export const searchTripsSchema = z.object({
  keyword: z.string().max(200).optional(),
  region: z.string().max(50).optional(),
  category: z.string().max(50).optional(),
  cost: z.enum(costLevelEnum).optional(),
  isPublic: z.boolean().default(true),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

// ====== DESTINATION VALIDATION ======
export const createDestinationSchema = z.object({
  name: z.string().min(2).max(100),
  location: z.string().min(2).max(200),
  description: z.string().max(1000).optional(),
  imageUrl: z.string().url().optional(),
});

export const updateDestinationSchema = createDestinationSchema.partial();

// ====== DAY PLAN VALIDATION ======
export const createDayPlanSchema = z.object({
  tripId: z.number().positive(),
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  startDate: z.date(),
  isDraft: z.boolean().default(true),
});

export const updateDayPlanSchema = createDayPlanSchema.partial();

// ====== PAGINATION ======
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

// ====== AUTHENTICATION ======
export const loginSchema = z.object({
  username: z.string().min(3).max(50).email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
});

export const registerSchema = z.object({
  username: z.string().min(3).max(50).email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  name: z.string().min(2).max(100),
});

// ====== PACKING LIST ======
export const createPackingItemSchema = z.object({
  dayPlanId: z.number().positive(),
  category: z.string().max(50),
  item: z.string().min(1).max(200),
  quantity: z.number().min(1).default(1),
  isPacked: z.boolean().default(false),
});

// ====== BUDGET ======
export const createBudgetItemSchema = z.object({
  tripId: z.number().positive(),
  category: z.string().max(50),
  description: z.string().max(200),
  estimatedCost: z.number().min(0),
  actualCost: z.number().min(0).optional(),
  currency: z.string().length(3).default("CHF"),
});

// ====== CHECKLIST ======
export const checklistPriorityEnum = ["low", "medium", "high"] as const;

export const createChecklistItemSchema = z.object({
  tripId: z.number().positive(),
  task: z.string().min(1).max(500),
  priority: z.enum(checklistPriorityEnum).default("medium"),
  dueDate: z.date().optional(),
  isCompleted: z.boolean().default(false),
});

// ====== TRIP PARTICIPANTS ======
export const addParticipantSchema = z.object({
  tripId: z.number().positive(),
  email: z.string().email(),
  status: z.enum(participantStatusEnum).default("pending"),
});

// ====== TRIP COMMENTS ======
export const createCommentSchema = z.object({
  tripId: z.number().positive(),
  content: z.string().min(1).max(2000),
});

// Type exports for use in routers
export type CreateTripInput = z.infer<typeof createTripSchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;
export type SearchTripsInput = z.infer<typeof searchTripsSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
