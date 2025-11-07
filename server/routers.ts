import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getWeatherForecast } from "./_core/weather";
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
  addTripToDayPlan, getDayPlanItems, getDayPlanItemsWithTrips, removeTripFromDayPlan, updateDayPlanItem,
  addPackingListItem, getPackingListItems, updatePackingListItem, deletePackingListItem,
  addBudgetItem, getBudgetItems, updateBudgetItem, deleteBudgetItem,
  addChecklistItem, getChecklistItems, updateChecklistItem, deleteChecklistItem
} from "./db";

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
        await createDestination({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
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
        const { id, ...data } = input;
        await updateDestination(id, ctx.user.id, data);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteDestination(input.id, ctx.user.id);
        return { success: true };
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
    myTrips: protectedProcedure.query(async ({ ctx }) => {
      return await getUserTrips(ctx.user.id);
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
        })
      )
      .mutation(async ({ ctx, input }) => {
        await createTrip({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
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
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await updateTrip(id, ctx.user.id, data);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteTrip(input.id, ctx.user.id);
        return { success: true };
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
        })
      )
      .query(async ({ input }) => {
        return await searchTrips(input);
      }),
    publicTrips: publicProcedure.query(async () => {
      return await getPublicTrips();
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
        const result = await createDayPlan({
          userId: ctx.user.id,
          ...input,
        });
        // Get the newly created plan to return its ID
        const plans = await getDayPlansByUser(ctx.user.id);
        const newPlan = plans[plans.length - 1];
        return { success: true, id: newPlan?.id };
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
        const { id, ...data } = input;
        await updateDayPlan(id, data);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteDayPlan(input.id);
        return { success: true };
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
        })
      )
      .mutation(async ({ input }) => {
        await addTripToDayPlan(input);
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
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateDayPlanItem(id, data);
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
  }),

  export: router({
    planToICal: publicProcedure
      .input(z.object({ planId: z.number() }))
      .query(async ({ input }) => {
        const plan = await getDayPlanById(input.planId);
        const items = await getDayPlanItemsWithTrips(input.planId);
        
        if (!plan) throw new Error("Plan not found");
        
        const icalContent = generateICalendar({
          title: plan.title,
          description: plan.description || undefined,
          startDate: plan.startDate,
          endDate: plan.endDate,
          items: items.map(item => ({
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
          })),
        });
        
        return { content: icalContent };
      }),
    planToPDF: publicProcedure
      .input(z.object({ planId: z.number() }))
      .query(async ({ input }) => {
        const plan = await getDayPlanById(input.planId);
        const items = await getDayPlanItemsWithTrips(input.planId);
        
        if (!plan) throw new Error("Plan not found");
        
        const pdfContent = generatePDFContent({
          title: plan.title,
          description: plan.description || undefined,
          startDate: plan.startDate,
          endDate: plan.endDate,
          items: items.map(item => ({
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
          })),
        });
        
        return { content: pdfContent };
      }),
  }),
});

export type AppRouter = typeof appRouter;
