import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router, adminProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  AppError, ValidationError, NotFoundError, UnauthorizedError, ForbiddenError,
  toTRPCError, handleError, trpcHandler
} from "./_core/errors";
import {
  createTripSchema, updateTripSchema, searchTripsSchema,
  createDestinationSchema, updateDestinationSchema,
  createDayPlanSchema, updateDayPlanSchema
} from "./_core/validation";
import { getWeatherForecast, getHourlyWeatherForecast } from "./_core/weather";
import { generateICalendar, generatePDFContent } from "./_core/export";
import { parseImportFile } from "./_core/importParser";
import {
  createTrip, deleteTrip, getAllTrips, getTripById, getUserTrips, updateTrip,
  createDestination, getUserDestinations, getDestinationById, updateDestination, deleteDestination,
  addTripParticipant, getTripParticipants, updateParticipantStatus, deleteParticipant,
  addTripComment, getTripComments, deleteComment,
  addTripPhoto, getTripPhotos, deleteTripPhoto, setPrimaryPhoto,
  addTripAttribute, getTripAttributes, deleteTripAttribute,
  searchTrips, toggleFavorite, toggleDone, getPublicTrips, getStatistics,
  createDayPlan, getDayPlansByUser, getDayPlanById, updateDayPlan, deleteDayPlan,
  addTripToDayPlan, getDayPlanItems, getDayPlanItemsWithTrips, getDayPlanWithItems, removeTripFromDayPlan, updateDayPlanItem,
  addPackingListItem, getPackingListItems, updatePackingListItem, updatePackingListItemFull, deletePackingListItem,
  addBudgetItem, getBudgetItems, updateBudgetItem, deleteBudgetItem,
  addChecklistItem, getChecklistItems, updateChecklistItem, deleteChecklistItem,
  addJournalEntry, getTripJournalEntries, updateJournalEntry, deleteJournalEntry,
  addVideo, getTripVideos, deleteVideo,
  getDb
} from "./db";
import { eq } from "drizzle-orm";
import { dayPlanItems, trips } from "../drizzle/schema";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(async (opts) => {
      try {
        return opts.ctx.user;
      } catch (error) {
        const appError = handleError(error, "auth.me");
        throw toTRPCError(appError);
      }
    }),
    logout: publicProcedure.mutation(async ({ ctx }) => {
      try {
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
        return {
          success: true,
        } as const;
      } catch (error) {
        const appError = handleError(error, "auth.logout");
        throw toTRPCError(appError);
      }
    }),
  }),

  destinations: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      try {
        return await getUserDestinations(ctx.user.id);
      } catch (error) {
        const appError = handleError(error, "destinations.list");
        throw toTRPCError(appError);
      }
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        try {
          const destination = await getDestinationById(input.id);
          if (!destination) {
            throw new NotFoundError("Destination", input.id);
          }
          return destination;
        } catch (error) {
          const appError = handleError(error, "destinations.getById");
          throw toTRPCError(appError);
        }
      }),
    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          description: z.string().optional(),
          location: z.string().min(1),
          imageUrl: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          await createDestination({
            userId: ctx.user.id,
            ...input,
          });
          return { success: true };
        } catch (error) {
          const appError = handleError(error, "destinations.create");
          throw toTRPCError(appError);
        }
      }),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).optional(),
          description: z.string().optional(),
          location: z.string().min(1).optional(),
          imageUrl: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const { id, ...data } = input;
          await updateDestination(id, ctx.user.id, data);
          return { success: true };
        } catch (error) {
          const appError = handleError(error, "destinations.update");
          throw toTRPCError(appError);
        }
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        try {
          await deleteDestination(input.id, ctx.user.id);
          return { success: true };
        } catch (error) {
          const appError = handleError(error, "destinations.delete");
          throw toTRPCError(appError);
        }
      }),
  }),

  participants: router({
    list: publicProcedure
      .input(z.object({ tripId: z.number() }))
      .query(async ({ input }) => {
        try {
          return await getTripParticipants(input.tripId);
        } catch (error) {
          const appError = handleError(error, "participants.list");
          throw toTRPCError(appError);
        }
      }),
    add: protectedProcedure
      .input(
        z.object({
          tripId: z.number(),
          name: z.string().min(1),
          email: z.string().email().optional(),
          userId: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          await addTripParticipant(input);
          return { success: true };
        } catch (error) {
          const appError = handleError(error, "participants.add");
          throw toTRPCError(appError);
        }
      }),
    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["confirmed", "pending", "declined"]),
        })
      )
      .mutation(async ({ input }) => {
        try {
          await updateParticipantStatus(input.id, input.status);
          return { success: true };
        } catch (error) {
          const appError = handleError(error, "participants.updateStatus");
          throw toTRPCError(appError);
        }
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        try {
          await deleteParticipant(input.id);
          return { success: true };
        } catch (error) {
          const appError = handleError(error, "participants.delete");
          throw toTRPCError(appError);
        }
      }),
  }),

  comments: router({
    list: publicProcedure
      .input(z.object({ tripId: z.number() }))
      .query(async ({ input }) => {
        try {
          return await getTripComments(input.tripId);
        } catch (error) {
          const appError = handleError(error, "comments.list");
          throw toTRPCError(appError);
        }
      }),
    add: protectedProcedure
      .input(
        z.object({
          tripId: z.number(),
          content: z.string().min(1).max(2000),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          await addTripComment({
            userId: ctx.user.id,
            ...input,
          });
          return { success: true };
        } catch (error) {
          const appError = handleError(error, "comments.add");
          throw toTRPCError(appError);
        }
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        try {
          await deleteComment(input.id, ctx.user.id);
          return { success: true };
        } catch (error) {
          const appError = handleError(error, "comments.delete");
          throw toTRPCError(appError);
        }
      }),
  }),

  trips: router({
    list: publicProcedure.query(async () => {
      try {
        return await getAllTrips();
      } catch (error) {
        const appError = handleError(error, "trips.list");
        throw toTRPCError(appError);
      }
    }),
    myTrips: protectedProcedure
      .input(z.object({
        page: z.number().min(1).default(1).optional(),
        limit: z.number().min(1).max(100).default(20).optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        try {
          return await getUserTrips(ctx.user.id, input);
        } catch (error) {
          const appError = handleError(error, "trips.myTrips");
          throw toTRPCError(appError);
        }
      }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        try {
          const trip = await getTripById(input.id);
          if (!trip) {
            throw new NotFoundError("Trip", input.id);
          }

          // Load categories for this trip
          const { getTripCategories } = await import('./db');
          const categories = await getTripCategories(input.id);

          return {
            ...trip,
            categories,
          };
        } catch (error) {
          const appError = handleError(error, "trips.getById");
          throw toTRPCError(appError);
        }
      }),
    create: protectedProcedure
      .input(
        z.object({
          title: z.string().min(1),
          description: z.string().optional(),
          destination: z.string().min(1),
          startDate: z.date(),
          endDate: z.date(),
          participants: z.number().min(1).default(1),
          status: z.enum(["planned", "ongoing", "completed", "cancelled"]).default("planned"),
          isFavorite: z.number().optional().default(0),
          isPublic: z.number().optional().default(0),
          image: z.string().optional(), // Title image for trip details and explore view (URL or Base64 data URL)
          region: z.string().optional(),
          cost: z.enum(["free", "low", "medium", "high", "very_high"]).optional(),
          categories: z.array(z.string()).optional(), // Array of category strings
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          if (input.endDate <= input.startDate) {
            throw new ValidationError("End date must be after start date");
          }
          const { categories, ...tripData } = input;
          await createTrip({
            userId: ctx.user.id,
            ...tripData,
          });

          // Note: Categories will be handled by the frontend via separate request
          // The trip.create endpoint in CreateTripWizard handles category assignment

          return { success: true };
        } catch (error) {
          const appError = handleError(error, "trips.create");
          throw toTRPCError(appError);
        }
      }),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().min(1).optional(),
          description: z.string().optional(),
          destination: z.string().min(1).optional(),
          startDate: z.date().optional(),
          endDate: z.date().optional(),
          participants: z.number().min(1).optional(),
          status: z.enum(["planned", "ongoing", "completed", "cancelled"]).optional(),
          isFavorite: z.number().optional(),
          isPublic: z.number().optional(),
          region: z.string().optional(),
          category: z.string().optional(),
          cost: z.enum(["free", "low", "medium", "high", "very_high"]).optional(),
          latitude: z.string().optional(),
          longitude: z.string().optional(),
          image: z.string().optional(), // Title image for trip details and explore view (URL or Base64 data URL)
          durationMin: z.number().optional(),
          durationMax: z.number().optional(),
          distanceMin: z.number().optional(),
          distanceMax: z.number().optional(),
          ageRecommendation: z.string().optional(),
          niceToKnow: z.string().optional(),
          categories: z.array(z.string()).optional(), // Array of category strings
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const { id, categories, ...data } = input;
          // Allow owner or admin to update
          const trip = await getTripById(id);
          if (!trip) throw new NotFoundError("Trip", id);
          if (trip.userId !== ctx.user.id && ctx.user.role !== 'admin') {
            throw new ForbiddenError("You are not authorized to update this trip");
          }
          await updateTrip(id, trip.userId, data);

          // Update categories if provided
          if (categories !== undefined) {
            const { deleteTripCategories, addTripCategory } = await import('./db');
            // Remove old categories
            await deleteTripCategories(id);
            // Add new categories
            for (const category of categories) {
              await addTripCategory(id, category);
            }
          }

          return { success: true };
        } catch (error) {
          const appError = handleError(error, "trips.update");
          throw toTRPCError(appError);
        }
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        try {
          // Allow owner or admin to delete
          const trip = await getTripById(input.id);
          if (!trip) throw new NotFoundError("Trip", input.id);
          if (trip.userId !== ctx.user.id && ctx.user.role !== 'admin') {
            throw new ForbiddenError("You are not authorized to delete this trip");
          }
          await deleteTrip(input.id, trip.userId);
          return { success: true };
        } catch (error) {
          const appError = handleError(error, "trips.delete");
          throw toTRPCError(appError);
        }
      }),
    search: publicProcedure
      .input(
        z.object({
          keyword: z.string().max(200).optional(),
          region: z.string().max(50).optional(),
          category: z.string().max(50).optional(),
          cost: z.string().optional(),
          attributes: z.array(z.string()).optional(),
          isPublic: z.boolean().optional(),
          userId: z.number().optional(),
          page: z.number().min(1).default(1).optional(),
          limit: z.number().min(1).max(100).default(50).optional(),
        })
      )
      .query(async ({ input }) => {
        try {
          const { page, limit, ...filters } = input;
          return await searchTrips(filters, { page, limit });
        } catch (error) {
          const appError = handleError(error, "trips.search");
          throw toTRPCError(appError);
        }
      }),
    publicTrips: publicProcedure
      .input(z.object({
        page: z.number().min(1).default(1).optional(),
        limit: z.number().min(1).max(100).default(50).optional(),
      }).optional())
      .query(async ({ input }) => {
        try {
          return await getPublicTrips(input);
        } catch (error) {
          const appError = handleError(error, "trips.publicTrips");
          throw toTRPCError(appError);
        }
      }),
    toggleFavorite: protectedProcedure
      .input(z.object({ tripId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        try {
          await toggleFavorite(input.tripId, ctx.user.id);
          return { success: true };
        } catch (error) {
          const appError = handleError(error, "trips.toggleFavorite");
          throw toTRPCError(appError);
        }
      }),
    toggleDone: protectedProcedure
      .input(z.object({ tripId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        try {
          await toggleDone(input.tripId, ctx.user.id);
          return { success: true };
        } catch (error) {
          const appError = handleError(error, "trips.toggleDone");
          throw toTRPCError(appError);
        }
      }),
    statistics: publicProcedure.query(async () => {
      try {
        return await getStatistics();
      } catch (error) {
        const appError = handleError(error, "trips.statistics");
        throw toTRPCError(appError);
      }
    }),
  }),

  photos: router({
    list: publicProcedure
      .input(z.object({ tripId: z.number() }))
      .query(async ({ input }) => {
        try {
          return await getTripPhotos(input.tripId);
        } catch (error) {
          const appError = handleError(error, "photos.list");
          throw toTRPCError(appError);
        }
      }),
    add: protectedProcedure
      .input(
        z.object({
          tripId: z.number(),
          photoUrl: z.string().url(),
          caption: z.string().max(500).optional(),
          isPrimary: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          await addTripPhoto({
            ...input,
            isPrimary: input.isPrimary ? 1 : 0,
          });
          return { success: true };
        } catch (error) {
          const appError = handleError(error, "photos.add");
          throw toTRPCError(appError);
        }
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        try {
          await deleteTripPhoto(input.id);
          return { success: true };
        } catch (error) {
          const appError = handleError(error, "photos.delete");
          throw toTRPCError(appError);
        }
      }),
    setPrimary: protectedProcedure
      .input(z.object({ tripId: z.number(), photoId: z.number() }))
      .mutation(async ({ input }) => {
        try {
          await setPrimaryPhoto(input.tripId, input.photoId);
          return { success: true };
        } catch (error) {
          const appError = handleError(error, "photos.setPrimary");
          throw toTRPCError(appError);
        }
      }),
  }),

  attributes: router({
    list: publicProcedure
      .input(z.object({ tripId: z.number() }))
      .query(async ({ input }) => {
        try {
          return await getTripAttributes(input.tripId);
        } catch (error) {
          const appError = handleError(error, "attributes.list");
          throw toTRPCError(appError);
        }
      }),
    add: protectedProcedure
      .input(
        z.object({
          tripId: z.number(),
          attribute: z.string().min(1).max(100),
        })
      )
      .mutation(async ({ input }) => {
        try {
          await addTripAttribute(input);
          return { success: true };
        } catch (error) {
          const appError = handleError(error, "attributes.add");
          throw toTRPCError(appError);
        }
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        try {
          await deleteTripAttribute(input.id);
          return { success: true };
        } catch (error) {
          const appError = handleError(error, "attributes.delete");
          throw toTRPCError(appError);
        }
      }),
  }),

  dayPlans: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      try {
        return await getDayPlansByUser(ctx.user.id);
      } catch (error) {
        const appError = handleError(error, "dayPlans.list");
        throw toTRPCError(appError);
      }
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        try {
          const dayPlan = await getDayPlanById(input.id);
          if (!dayPlan) {
            throw new NotFoundError("DayPlan", input.id);
          }
          return dayPlan;
        } catch (error) {
          const appError = handleError(error, "dayPlans.getById");
          throw toTRPCError(appError);
        }
      }),
    create: protectedProcedure
      .input(
        z.object({
          title: z.string().min(1),
          description: z.string().optional(),
          startDate: z.date(),
          endDate: z.date(),
          isPublic: z.number().optional(),
          isDraft: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          if (input.endDate <= input.startDate) {
            throw new ValidationError("End date must be after start date");
          }
          const result = await createDayPlan({
            userId: ctx.user.id,
            ...input,
          });
          // Get the newly created plan to return its ID
          const plans = await getDayPlansByUser(ctx.user.id);
          const newPlan = plans[plans.length - 1];
          return { success: true, id: newPlan?.id };
        } catch (error) {
          const appError = handleError(error, "dayPlans.create");
          throw toTRPCError(appError);
        }
      }),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          description: z.string().optional(),
          startDate: z.date().optional(),
          endDate: z.date().optional(),
          isPublic: z.number().optional(),
          isDraft: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const { id, ...data } = input;
          await updateDayPlan(id, data);
          return { success: true };
        } catch (error) {
          const appError = handleError(error, "dayPlans.update");
          throw toTRPCError(appError);
        }
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        try {
          await deleteDayPlan(input.id);
          return { success: true };
        } catch (error) {
          const appError = handleError(error, "dayPlans.delete");
          throw toTRPCError(appError);
        }
      }),
    getItems: publicProcedure
      .input(z.object({ dayPlanId: z.number() }))
      .query(async ({ input }) => {
        try {
          return await getDayPlanItemsWithTrips(input.dayPlanId);
        } catch (error) {
          const appError = handleError(error, "dayPlans.getItems");
          throw toTRPCError(appError);
        }
      }),
    addTrip: protectedProcedure
      .input(
        z.object({
          dayPlanId: z.number(),
          tripId: z.number(),
          dayNumber: z.number().optional(),
          orderIndex: z.number(),
          startTime: z.string().optional(),
          endTime: z.string().optional(),
          notes: z.string().max(2000).optional(),
          dateAssigned: z.string().optional(), // ISO date string (YYYY-MM-DD)
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          // If dateAssigned is provided, validate it's within the trip's duration
          if (input.dateAssigned) {
            const trip = await getTripById(input.tripId);
            const dateAssigned = new Date(input.dateAssigned);

            if (!trip) {
              throw new NotFoundError("Trip", input.tripId);
            }

            if (trip.startDate && trip.endDate) {
              const tripStart = new Date(trip.startDate);
              const tripEnd = new Date(trip.endDate);

              if (dateAssigned < tripStart || dateAssigned > tripEnd) {
                throw new ValidationError(`Das Datum muss zwischen ${tripStart.toLocaleDateString('de-DE')} und ${tripEnd.toLocaleDateString('de-DE')} liegen`);
              }
            }
          }

          await addTripToDayPlan({
            ...input,
            dateAssigned: input.dateAssigned ? new Date(input.dateAssigned) : undefined,
          });
          return { success: true };
        } catch (error) {
          const appError = handleError(error, "dayPlans.addTrip");
          throw toTRPCError(appError);
        }
      }),
    removeTrip: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        try {
          await removeTripFromDayPlan(input.id);
          return { success: true };
        } catch (error) {
          const appError = handleError(error, "dayPlans.removeTrip");
          throw toTRPCError(appError);
        }
      }),
    updateItem: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          dayNumber: z.number().optional(),
          orderIndex: z.number().optional(),
          startTime: z.string().optional(),
          endTime: z.string().optional(),
          notes: z.string().max(2000).optional(),
          dateAssigned: z.date().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const { id, dateAssigned, ...data } = input;

          // If dateAssigned is provided, validate it's within the trip duration
          if (dateAssigned) {
            const db = await getDb();
            if (db) {
              const item = await db.select().from(dayPlanItems).where(eq(dayPlanItems.id, id)).limit(1);
              if (item.length > 0) {
                const tripId = item[0].tripId;
                const trip = await getTripById(tripId);
                if (trip) {
                  const tripStart = new Date(trip.startDate);
                  const tripEnd = new Date(trip.endDate);
                  const assignedDate = new Date(dateAssigned);

                  if (assignedDate < tripStart || assignedDate > tripEnd) {
                    throw new ValidationError(`Datum muss zwischen ${tripStart.toLocaleDateString('de-DE')} und ${tripEnd.toLocaleDateString('de-DE')} liegen`);
                  }
                }
              }
            }
          }

          await updateDayPlanItem(id, { ...data, ...(dateAssigned && { dateAssigned }) });
          return { success: true };
        } catch (error) {
          const appError = handleError(error, "dayPlans.updateItem");
          throw toTRPCError(appError);
        }
      }),
  }),

  packingList: router({
    list: publicProcedure
      .input(z.object({ dayPlanId: z.number() }))
      .query(async ({ input }) => {
        try {
          return await getPackingListItems(input.dayPlanId);
        } catch (error) {
          const appError = handleError(error, "packingList.list");
          throw toTRPCError(appError);
        }
      }),
    add: protectedProcedure
      .input(
        z.object({
          dayPlanId: z.number(),
          item: z.string().min(1).max(200),
          quantity: z.number().min(1).optional(),
          category: z.string().max(50).optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          await addPackingListItem(input);
          return { success: true };
        } catch (error) {
          const appError = handleError(error, "packingList.add");
          throw toTRPCError(appError);
        }
      }),
    toggle: protectedProcedure
      .input(z.object({ id: z.number(), isPacked: z.number() }))
      .mutation(async ({ input }) => {
        try {
          await updatePackingListItem(input.id, input.isPacked);
          return { success: true };
        } catch (error) {
          const appError = handleError(error, "packingList.toggle");
          throw toTRPCError(appError);
        }
      }),
    update: protectedProcedure
      .input(z.object({ id: z.number(), item: z.string().min(1).max(200).optional(), quantity: z.number().min(1).optional(), category: z.string().max(50).optional() }))
      .mutation(async ({ input }) => {
        try {
          const { id, ...data } = input;
          await updatePackingListItemFull(id, data);
          return { success: true };
        } catch (error) {
          const appError = handleError(error, "packingList.update");
          throw toTRPCError(appError);
        }
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        try {
          await deletePackingListItem(input.id);
          return { success: true };
        } catch (error) {
          const appError = handleError(error, "packingList.delete");
          throw toTRPCError(appError);
        }
      }),
  }),

  budget: router({
    list: publicProcedure
      .input(z.object({ dayPlanId: z.number() }))
      .query(async ({ input }) => {
        try {
          return await getBudgetItems(input.dayPlanId);
        } catch (error) {
          const appError = handleError(error, "budget.list");
          throw toTRPCError(appError);
        }
      }),
    add: protectedProcedure
      .input(
        z.object({
          dayPlanId: z.number(),
          category: z.string().min(1).max(50),
          description: z.string().min(1).max(200),
          estimatedCost: z.string().min(1),
          actualCost: z.string().optional(),
          currency: z.string().length(3).optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          await addBudgetItem(input);
          return { success: true };
        } catch (error) {
          const appError = handleError(error, "budget.add");
          throw toTRPCError(appError);
        }
      }),
    updateActual: protectedProcedure
      .input(z.object({ id: z.number(), actualCost: z.string() }))
      .mutation(async ({ input }) => {
        try {
          await updateBudgetItem(input.id, input.actualCost);
          return { success: true };
        } catch (error) {
          const appError = handleError(error, "budget.updateActual");
          throw toTRPCError(appError);
        }
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        try {
          await deleteBudgetItem(input.id);
          return { success: true };
        } catch (error) {
          const appError = handleError(error, "budget.delete");
          throw toTRPCError(appError);
        }
      }),
  }),

  checklist: router({
    list: publicProcedure
      .input(z.object({ dayPlanId: z.number() }))
      .query(async ({ input }) => {
        try {
          return await getChecklistItems(input.dayPlanId);
        } catch (error) {
          const appError = handleError(error, "checklist.list");
          throw toTRPCError(appError);
        }
      }),
    add: protectedProcedure
      .input(
        z.object({
          dayPlanId: z.number(),
          title: z.string().min(1).max(500),
          priority: z.enum(["low", "medium", "high"]).optional(),
          dueDate: z.date().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          await addChecklistItem(input);
          return { success: true };
        } catch (error) {
          const appError = handleError(error, "checklist.add");
          throw toTRPCError(appError);
        }
      }),
    toggle: protectedProcedure
      .input(z.object({ id: z.number(), isCompleted: z.number() }))
      .mutation(async ({ input }) => {
        try {
          await updateChecklistItem(input.id, input.isCompleted);
          return { success: true };
        } catch (error) {
          const appError = handleError(error, "checklist.toggle");
          throw toTRPCError(appError);
        }
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        try {
          await deleteChecklistItem(input.id);
          return { success: true };
        } catch (error) {
          const appError = handleError(error, "checklist.delete");
          throw toTRPCError(appError);
        }
      }),
  }),

  weather: router({
    forecast: publicProcedure
      .input(
        z.object({
          latitude: z.number(),
          longitude: z.number(),
          days: z.number().min(1).max(16).optional(),
        })
      )
      .query(async ({ input }) => {
        try {
          return await getWeatherForecast(
            input.latitude,
            input.longitude,
            input.days || 7
          );
        } catch (error) {
          const appError = handleError(error, "weather.forecast");
          throw toTRPCError(appError);
        }
      }),
    hourly: publicProcedure
      .input(
        z.object({
          latitude: z.number(),
          longitude: z.number(),
          days: z.number().min(1).max(16).optional(),
        })
      )
      .query(async ({ input }) => {
        try {
          return await getHourlyWeatherForecast(
            input.latitude,
            input.longitude,
            input.days || 7
          );
        } catch (error) {
          const appError = handleError(error, "weather.hourly");
          throw toTRPCError(appError);
        }
      }),
  }),

  upload: router({
    tripImage: protectedProcedure
      .input(
        z.object({
          base64: z.string(), // Data URL or base64 string
          filename: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          // OPTIMIZATION #8: Move images from Base64 to filesystem storage
          const { saveBase64ImageLocal, validateImageFile } = await import("../storage");

          // Extract base64 data
          const base64Data = input.base64.includes(",")
            ? input.base64.split(",")[1]
            : input.base64;

          const buffer = Buffer.from(base64Data, "base64");

          // Validate image file
          const validation = validateImageFile(buffer);
          if (!validation.valid) {
            throw new Error(validation.error || "Invalid image file");
          }

          // Save to filesystem
          const result = await saveBase64ImageLocal(input.base64, input.filename);

          return {
            url: result.path,
            filename: result.filename,
            success: true
          };
        } catch (error) {
          console.error('Image upload error:', error);
          throw new Error(error instanceof Error ? error.message : "Fehler beim Hochladen des Bildes");
        }
      }),
  }),

  export: router({
    planToICal: publicProcedure
      .input(z.object({ planId: z.number() }))
      .query(async ({ input }) => {
        try {
          // OPTIMIZATION #5: Single combined query instead of separate fetches
          const data = await getDayPlanWithItems(input.planId);
          if (!data) throw new Error("Plan not found");

          const { plan, items } = data;

          // Extract and format trip data from items
          const formattedItems = items.map(item => ({
            trip: {
              title: item.trip?.title || "",
              description: item.trip?.description || undefined,
              destination: item.trip?.destination || "",
              startDate: item.trip?.startDate || new Date(),
              endDate: item.trip?.endDate || new Date(),
              status: item.trip?.status || "planned",
            },
            startTime: item.startTime || undefined,
            endTime: item.endTime || undefined,
            notes: item.notes || undefined,
          }));

          const icalContent = generateICalendar({
            title: plan.title,
            description: plan.description || undefined,
            startDate: plan.startDate,
            endDate: plan.endDate,
            items: formattedItems,
          });

          return { content: icalContent };
        } catch (error) {
          console.error('iCal export error:', error);
          throw error;
        }
      }),
    planToPDF: publicProcedure
      .input(z.object({ planId: z.number() }))
      .query(async ({ input }) => {
        try {
          // OPTIMIZATION #5: Single combined query instead of separate fetches
          const data = await getDayPlanWithItems(input.planId);
          if (!data) throw new Error("Plan not found");

          const { plan, items } = data;

          // Extract and format trip data from items
          const formattedItems = items.map(item => ({
            trip: {
              title: item.trip?.title || "",
              description: item.trip?.description || undefined,
              destination: item.trip?.destination || "",
              startDate: item.trip?.startDate || new Date(),
              endDate: item.trip?.endDate || new Date(),
              status: item.trip?.status || "planned",
            },
            startTime: item.startTime || undefined,
            endTime: item.endTime || undefined,
            notes: item.notes || undefined,
          }));

          const pdfBuffer = await generatePDFContent({
            title: plan.title,
            description: plan.description || undefined,
            startDate: plan.startDate,
            endDate: plan.endDate,
            items: formattedItems,
          });

          return { content: pdfBuffer.toString('base64') };
        } catch (error) {
          console.error('PDF export error:', error);
          throw error;
        }
      }),
  }),

  journal: router({
    list: publicProcedure
      .input(z.object({ tripId: z.number() }))
      .query(async ({ input }) => {
        try {
          return await getTripJournalEntries(input.tripId);
        } catch (error) {
          const appError = handleError(error, "journal.list");
          throw toTRPCError(appError);
        }
      }),
    add: protectedProcedure
      .input(
        z.object({
          tripId: z.number(),
          content: z.string().min(1).max(5000),
          entryDate: z.date(),
          mood: z.string().max(50).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          await addJournalEntry({
            tripId: input.tripId,
            userId: ctx.user.id,
            content: input.content,
            entryDate: input.entryDate,
            mood: input.mood || undefined,
          });
          return { success: true };
        } catch (error) {
          const appError = handleError(error, "journal.add");
          throw toTRPCError(appError);
        }
      }),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          content: z.string().min(1).max(5000).optional(),
          mood: z.string().max(50).optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const { id, ...data } = input;
          await updateJournalEntry(id, data);
          return { success: true };
        } catch (error) {
          const appError = handleError(error, "journal.update");
          throw toTRPCError(appError);
        }
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        try {
          await deleteJournalEntry(input.id);
          return { success: true };
        } catch (error) {
          const appError = handleError(error, "journal.delete");
          throw toTRPCError(appError);
        }
      }),
  }),

  videos: router({
    list: publicProcedure
      .input(z.object({ tripId: z.number() }))
      .query(async ({ input }) => {
        try {
          const videos = await getTripVideos(input.tripId);
          return videos.map((v) => ({
            ...v,
            id: v.id.toString(),
            url: v.videoId,
          }));
        } catch (error) {
          const appError = handleError(error, "videos.list");
          throw toTRPCError(appError);
        }
      }),
    add: protectedProcedure
      .input(
        z.object({
          tripId: z.number(),
          url: z.string().min(1),
          title: z.string().optional(),
          platform: z.enum(["youtube", "tiktok"]),
        })
      )
      .mutation(async ({ input }) => {
        try {
          await addVideo({
            tripId: input.tripId,
            videoId: input.url,
            title: input.title || undefined,
            platform: input.platform,
          });
          return { success: true };
        } catch (error) {
          const appError = handleError(error, "videos.add");
          throw toTRPCError(appError);
        }
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        try {
          await deleteVideo(parseInt(input.id));
          return { success: true };
        } catch (error) {
          const appError = handleError(error, "videos.delete");
          throw toTRPCError(appError);
        }
      }),
  }),

  admin: router({
    importExcursions: adminProcedure
      .input(
        z.object({
          fileContent: z.string().min(1),
          filename: z.string().min(1),
          userId: z.number().optional(), // Admin can import for specific user
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          // Get database instance
          const db = await getDb();
          if (!db) {
            throw new ValidationError("Database connection failed");
          }

          // Delete all existing trips first (clean slate for import)
          await db.delete(trips);

          // Parse the file
          const parseResult = parseImportFile(input.fileContent, input.filename);

          if (parseResult.success === 0 && parseResult.failed > 0) {
            throw new ValidationError(
              `All ${parseResult.failed} rows failed to parse: ${parseResult.errors.slice(0, 3).join("; ")}`
            );
          }

          const targetUserId = input.userId || ctx.user.id;
          const importedTrips = [];
          const failedImports = [];

          // Import each excursion as a trip
          for (const exc of parseResult.excursions) {
            try {
              const today = new Date();
              const tripResult = await createTrip({
                userId: targetUserId,
                title: exc.name,
                description: exc.description || "",
                destination: exc.destination || exc.address || "",
                startDate: today,
                endDate: today,
                participants: 1,
                status: "planned" as const,
                cost: exc.cost || "free",
                category: exc.category || "",
                region: exc.region || "",
                address: exc.address || "",
                websiteUrl: exc.website_url || "",
                latitude: exc.latitude || "",
                longitude: exc.longitude || "",
                ageRecommendation: undefined,
                routeType: "location" as const,
                isPublic: 1, // Mark imported trips as public for /explore page
              });

              // Get the trip ID from the result
              const tripId = tripResult[0].insertId as number;

              // Add primary photo if it exists
              if (exc.image) {
                try {
                  await addTripPhoto(tripId, {
                    photoUrl: exc.image,
                    caption: `${exc.name} - Cover Image`,
                    isPrimary: 1,
                  });
                } catch (photoError) {
                  // Log but don't fail the import if photo fails
                  console.warn(`Warning: Failed to add photo for ${exc.name}`);
                }
              }

              importedTrips.push(exc.name);
            } catch (error) {
              failedImports.push({
                name: exc.name,
                error: error instanceof Error ? error.message : String(error),
              });
            }
          }

          return {
            success: true,
            imported: importedTrips.length,
            failed: failedImports.length,
            parseErrors: parseResult.errors,
            failedImports,
            message: `Successfully imported ${importedTrips.length} excursions. ${
              failedImports.length > 0 ? `${failedImports.length} failed to import.` : ""
            }`,
          };
        } catch (error) {
          const appError = handleError(error, "admin.importExcursions");
          throw toTRPCError(appError);
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
