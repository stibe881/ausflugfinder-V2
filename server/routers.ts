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
  getDb
} from "./db";
import { eq } from "drizzle-orm";
import { dayPlanItems } from "../drizzle/schema";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  destinations: router({  
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserDestinations(ctx.user.id);
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getDestinationById(input.id);
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
        return await getTripParticipants(input.tripId);
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
        await addTripParticipant(input);
        return { success: true };
      }),
    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["confirmed", "pending", "declined"]),
        })
      )
      .mutation(async ({ input }) => {
        await updateParticipantStatus(input.id, input.status);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteParticipant(input.id);
        return { success: true };
      }),
  }),

  comments: router({
    list: publicProcedure
      .input(z.object({ tripId: z.number() }))
      .query(async ({ input }) => {
        return await getTripComments(input.tripId);
      }),
    add: protectedProcedure
      .input(
        z.object({
          tripId: z.number(),
          content: z.string().min(1),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await addTripComment({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteComment(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  trips: router({
    list: publicProcedure.query(async () => {
      return await getAllTrips();
    }),
    myTrips: protectedProcedure
      .input(z.object({
        page: z.number().min(1).default(1).optional(),
        limit: z.number().min(1).max(100).default(20).optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        return await getUserTrips(ctx.user.id, input);
      }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getTripById(input.id);
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
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          if (input.endDate <= input.startDate) {
            throw new ValidationError("End date must be after start date");
          }
          await createTrip({
            userId: ctx.user.id,
            ...input,
          });
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
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const { id, ...data } = input;
          // Allow owner or admin to update
          const trip = await getTripById(id);
          if (!trip) throw new NotFoundError("Trip", id);
          if (trip.userId !== ctx.user.id && ctx.user.role !== 'admin') {
            throw new ForbiddenError("You are not authorized to update this trip");
          }
          await updateTrip(id, trip.userId, data);
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
          keyword: z.string().optional(),
          region: z.string().optional(),
          category: z.string().optional(),
          cost: z.string().optional(),
          attributes: z.array(z.string()).optional(),
          isPublic: z.boolean().optional(),
          userId: z.number().optional(),
          page: z.number().min(1).default(1).optional(),
          limit: z.number().min(1).max(100).default(20).optional(),
        })
      )
      .query(async ({ input }) => {
        const { page, limit, ...filters } = input;
        return await searchTrips(filters, { page, limit });
      }),
    publicTrips: publicProcedure
      .input(z.object({
        page: z.number().min(1).default(1).optional(),
        limit: z.number().min(1).max(100).default(20).optional(),
      }).optional())
      .query(async ({ input }) => {
        return await getPublicTrips(input);
      }),
    toggleFavorite: protectedProcedure
      .input(z.object({ tripId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await toggleFavorite(input.tripId, ctx.user.id);
        return { success: true };
      }),
    toggleDone: protectedProcedure
      .input(z.object({ tripId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await toggleDone(input.tripId, ctx.user.id);
        return { success: true };
      }),
    statistics: publicProcedure.query(async () => {
      return await getStatistics();
    }),
  }),

  photos: router({
    list: publicProcedure
      .input(z.object({ tripId: z.number() }))
      .query(async ({ input }) => {
        return await getTripPhotos(input.tripId);
      }),
    add: protectedProcedure
      .input(
        z.object({
          tripId: z.number(),
          photoUrl: z.string().url(),
          caption: z.string().optional(),
          isPrimary: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await addTripPhoto({
          ...input,
          isPrimary: input.isPrimary ? 1 : 0,
        });
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteTripPhoto(input.id);
        return { success: true };
      }),
    setPrimary: protectedProcedure
      .input(z.object({ tripId: z.number(), photoId: z.number() }))
      .mutation(async ({ input }) => {
        await setPrimaryPhoto(input.tripId, input.photoId);
        return { success: true };
      }),
  }),

  attributes: router({
    list: publicProcedure
      .input(z.object({ tripId: z.number() }))
      .query(async ({ input }) => {
        return await getTripAttributes(input.tripId);
      }),
    add: protectedProcedure
      .input(
        z.object({
          tripId: z.number(),
          attribute: z.string().min(1),
        })
      )
      .mutation(async ({ input }) => {
        await addTripAttribute(input);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteTripAttribute(input.id);
        return { success: true };
      }),
  }),

  dayPlans: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getDayPlansByUser(ctx.user.id);
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getDayPlanById(input.id);
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
        return await getDayPlanItemsWithTrips(input.dayPlanId);
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
          notes: z.string().optional(),
          dateAssigned: z.string().optional(), // ISO date string (YYYY-MM-DD)
        })
      )
      .mutation(async ({ input, ctx }) => {
        // If dateAssigned is provided, validate it's within the trip's duration
        if (input.dateAssigned) {
          const trip = await getTripById(input.tripId);
          const dateAssigned = new Date(input.dateAssigned);

          if (trip?.startDate && trip?.endDate) {
            const tripStart = new Date(trip.startDate);
            const tripEnd = new Date(trip.endDate);

            if (dateAssigned < tripStart || dateAssigned > tripEnd) {
              throw new Error(`Das Datum muss zwischen ${tripStart.toLocaleDateString('de-DE')} und ${tripEnd.toLocaleDateString('de-DE')} liegen`);
            }
          }
        }

        await addTripToDayPlan({
          ...input,
          dateAssigned: input.dateAssigned ? new Date(input.dateAssigned) : undefined,
        });
        return { success: true };
      }),
    removeTrip: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await removeTripFromDayPlan(input.id);
        return { success: true };
      }),
    updateItem: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          dayNumber: z.number().optional(),
          orderIndex: z.number().optional(),
          startTime: z.string().optional(),
          endTime: z.string().optional(),
          notes: z.string().optional(),
          dateAssigned: z.date().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
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
                  throw new Error(`Datum muss zwischen ${tripStart.toLocaleDateString('de-DE')} und ${tripEnd.toLocaleDateString('de-DE')} liegen`);
                }
              }
            }
          }
        }

        await updateDayPlanItem(id, { ...data, ...(dateAssigned && { dateAssigned }) });
        return { success: true };
      }),
  }),

  packingList: router({    list: publicProcedure
      .input(z.object({ dayPlanId: z.number() }))
      .query(async ({ input }) => {
        return await getPackingListItems(input.dayPlanId);
      }),
    add: protectedProcedure
      .input(
        z.object({
          dayPlanId: z.number(),
          item: z.string().min(1),
          quantity: z.number().optional(),
          category: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await addPackingListItem(input);
        return { success: true };
      }),
    toggle: protectedProcedure
      .input(z.object({ id: z.number(), isPacked: z.number() }))
      .mutation(async ({ input }) => {
        await updatePackingListItem(input.id, input.isPacked);
        return { success: true };
      }),
    update: protectedProcedure
      .input(z.object({ id: z.number(), item: z.string().optional(), quantity: z.number().optional(), category: z.string().optional() }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updatePackingListItemFull(id, data);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deletePackingListItem(input.id);
        return { success: true };
      }),
  }),

  budget: router({
    list: publicProcedure
      .input(z.object({ dayPlanId: z.number() }))
      .query(async ({ input }) => {
        return await getBudgetItems(input.dayPlanId);
      }),
    add: protectedProcedure
      .input(
        z.object({
          dayPlanId: z.number(),
          category: z.string().min(1),
          description: z.string().min(1),
          estimatedCost: z.string().min(1),
          actualCost: z.string().optional(),
          currency: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await addBudgetItem(input);
        return { success: true };
      }),
    updateActual: protectedProcedure
      .input(z.object({ id: z.number(), actualCost: z.string() }))
      .mutation(async ({ input }) => {
        await updateBudgetItem(input.id, input.actualCost);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteBudgetItem(input.id);
        return { success: true };
      }),
  }),

  checklist: router({
    list: publicProcedure
      .input(z.object({ dayPlanId: z.number() }))
      .query(async ({ input }) => {
        return await getChecklistItems(input.dayPlanId);
      }),
    add: protectedProcedure
      .input(
        z.object({
          dayPlanId: z.number(),
          title: z.string().min(1),
          priority: z.enum(["low", "medium", "high"]).optional(),
          dueDate: z.date().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await addChecklistItem(input);
        return { success: true };
      }),
    toggle: protectedProcedure
      .input(z.object({ id: z.number(), isCompleted: z.number() }))
      .mutation(async ({ input }) => {
        await updateChecklistItem(input.id, input.isCompleted);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteChecklistItem(input.id);
        return { success: true };
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
        return await getWeatherForecast(
          input.latitude,
          input.longitude,
          input.days || 7
        );
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
        return await getHourlyWeatherForecast(
          input.latitude,
          input.longitude,
          input.days || 7
        );
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
});

export type AppRouter = typeof appRouter;
