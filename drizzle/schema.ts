import { mysqlTable, mysqlSchema, AnyMySqlColumn, int, varchar, text, decimal, datetime, timestamp, mysqlEnum, index, longtext, unique, tinyint } from "drizzle-orm/mysql-core"
import { sql, relations } from "drizzle-orm"
import { type InferInsertModel, type InferSelectModel } from "drizzle-orm"

export const ausfluege = mysqlTable("ausfluege", {
	id: int().notNull(),
	userId: int("user_id"),
	name: varchar({ length: 255 }).notNull(),
	beschreibung: text(),
	adresse: varchar({ length: 255 }).notNull(),
	land: varchar({ length: 50 }).default('Schweiz'),
	region: varchar({ length: 100 }),
	kategorieAlt: varchar("kategorie_alt", { length: 100 }),
	parkplatz: varchar({ length: 100 }),
	parkplatzKostenlos: tinyint("parkplatz_kostenlos").default(0),
	kostenStufe: tinyint("kosten_stufe"),
	jahreszeiten: varchar({ length: 100 }),
	websiteUrl: varchar("website_url", { length: 255 }),
	lat: decimal({ precision: 10, scale: 7 }),
	lng: decimal({ precision: 10, scale: 7 }),
	// Warning: Can't parse point from database
	// pointType: point("coordinates"),
	createdAt: datetime("created_at", { mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
	niceToKnow: varchar("nice_to_know", { length: 255 }),
	dauerMin: decimal("dauer_min", { precision: 5, scale: 2 }),
	dauerMax: decimal("dauer_max", { precision: 5, scale: 2 }),
	distanzMin: decimal("distanz_min", { precision: 6, scale: 2 }),
	distanzMax: decimal("distanz_max", { precision: 6, scale: 2 }),
	dauerStunden: decimal("dauer_stunden", { precision: 5, scale: 2 }),
	distanzKm: decimal("distanz_km", { precision: 6, scale: 2 }),
	isRundtour: tinyint("is_rundtour").default(0).notNull(),
	isVonANachB: tinyint("is_von_a_nach_b").default(0).notNull(),
	altersempfehlung: varchar({ length: 255 }),
});

export const budgetItems = mysqlTable("budgetItems", {
	id: int().autoincrement().notNull(),
	dayPlanId: int().notNull(),
	category: varchar({ length: 100 }).notNull(),
	description: varchar({ length: 255 }).notNull(),
	estimatedCost: varchar({ length: 20 }).notNull(),
	actualCost: varchar({ length: 20 }),
	currency: varchar({ length: 10 }).default('CHF').notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const checklistItems = mysqlTable("checklistItems", {
	id: int().autoincrement().notNull(),
	dayPlanId: int().notNull(),
	title: varchar({ length: 255 }).notNull(),
	isCompleted: int().default(0).notNull(),
	priority: mysqlEnum(['low','medium','high']).default('medium').notNull(),
	dueDate: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const dayPlanItems = mysqlTable("dayPlanItems", {
	id: int().autoincrement().notNull(),
	dayPlanId: int().notNull(),
	tripId: int().notNull(),
	dayNumber: int().default(1).notNull(),
	orderIndex: int().notNull(),
	startTime: varchar({ length: 10 }),
	endTime: varchar({ length: 10 }),
	notes: text(),
	dateAssigned: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const dayPlans = mysqlTable("dayPlans", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	startDate: timestamp({ mode: 'string' }).notNull(),
	endDate: timestamp({ mode: 'string' }).notNull(),
	isPublic: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	isDraft: int().default(1).notNull(),
});

export const destinations = mysqlTable("destinations", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	location: varchar({ length: 255 }).notNull(),
	imageUrl: varchar({ length: 512 }),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const friendships = mysqlTable("friendships", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	friendId: int().notNull(),
	status: mysqlEnum(['pending','accepted','blocked']).default('pending').notNull(),
	requestedBy: int().notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => [
	index("friendships_user_id_idx").on(table.userId),
	index("friendships_friend_id_idx").on(table.friendId),
	index("friendships_status_idx").on(table.status),
]);

export const notifications = mysqlTable("notifications", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	title: varchar({ length: 255 }).notNull(),
	message: text().notNull(),
	type: mysqlEnum(['friend_request','friend_accepted','nearby_trip','new_trip','system']).default('system').notNull(),
	relatedId: int(),
	isRead: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => [
	index("notifications_user_id_idx").on(table.userId),
	index("notifications_is_read_idx").on(table.isRead),
	index("notifications_created_at_idx").on(table.createdAt),
]);

export const packingListItems = mysqlTable("packingListItems", {
	id: int().autoincrement().notNull(),
	dayPlanId: int().notNull(),
	item: varchar({ length: 255 }).notNull(),
	quantity: int().default(1).notNull(),
	isPacked: int().default(0).notNull(),
	category: varchar({ length: 100 }),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const pushSubscriptions = mysqlTable("pushSubscriptions", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	endpoint: varchar({ length: 2048 }).notNull(),
	auth: varchar({ length: 255 }).notNull(),
	p256Dh: varchar({ length: 255 }).notNull(),
	userAgent: text(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => [
	index("push_subscriptions_user_id_idx").on(table.userId),
	index("push_subscriptions_endpoint_idx").on(table.endpoint),
]);

export const tripAttributes = mysqlTable("tripAttributes", {
	id: int().autoincrement().notNull(),
	tripId: int().notNull(),
	attribute: varchar({ length: 100 }).notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const tripCategories = mysqlTable("tripCategories", {
	id: int().autoincrement().notNull(),
	tripId: int().notNull(),
	category: varchar({ length: 100 }).notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => [
	index("trip_categories_trip_id_idx").on(table.tripId),
	index("trip_categories_category_idx").on(table.category),
]);

export const tripComments = mysqlTable("tripComments", {
	id: int().autoincrement().notNull(),
	tripId: int().notNull(),
	userId: int().notNull(),
	content: text().notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const tripJournal = mysqlTable("tripJournal", {
	id: int().autoincrement().notNull(),
	tripId: int().notNull(),
	userId: int().notNull(),
	content: text().notNull(),
	entryDate: timestamp({ mode: 'string' }).notNull(),
	mood: varchar({ length: 50 }),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => [
	index("trip_journal_trip_id_idx").on(table.tripId),
	index("trip_journal_user_id_idx").on(table.userId),
	index("trip_journal_entry_date_idx").on(table.entryDate),
	index("trip_journal_created_at_idx").on(table.createdAt),
]);

export const tripParticipants = mysqlTable("tripParticipants", {
	id: int().autoincrement().notNull(),
	tripId: int().notNull(),
	userId: int(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 320 }),
	status: mysqlEnum(['confirmed','pending','declined']).default('pending').notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const tripPhotos = mysqlTable("tripPhotos", {
	id: int().autoincrement().notNull(),
	tripId: int().notNull(),
	photoUrl: varchar({ length: 512 }).notNull(),
	caption: text(),
	isPrimary: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const trips = mysqlTable("trips", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	destination: varchar({ length: 255 }).notNull(),
	startDate: timestamp({ mode: 'string' }),
	endDate: timestamp({ mode: 'string' }),
	participants: int().default(1).notNull(),
	status: mysqlEnum(['planned','ongoing','completed','cancelled']).default('planned').notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	cost: mysqlEnum(['free','low','medium','high','very_high']).default('free').notNull(),
	ageRecommendation: varchar({ length: 50 }),
	routeType: mysqlEnum(['round_trip','one_way','location']).default('location').notNull(),
	region: varchar({ length: 100 }),
	address: varchar({ length: 512 }),
	websiteUrl: varchar({ length: 512 }),
	contactEmail: varchar({ length: 320 }),
	contactPhone: varchar({ length: 50 }),
	latitude: varchar({ length: 50 }),
	longitude: varchar({ length: 50 }),
	isFavorite: int().default(0).notNull(),
	isDone: int().default(0).notNull(),
	isPublic: int().default(0).notNull(),
	durationMin: decimal({ precision: 5, scale: 2 }),
	durationMax: decimal({ precision: 5, scale: 2 }),
	distanceMin: decimal({ precision: 6, scale: 2 }),
	distanceMax: decimal({ precision: 6, scale: 2 }),
	niceToKnow: varchar({ length: 500 }),
	image: longtext(),
});

export const tripVideos = mysqlTable("tripVideos", {
	id: int().autoincrement().notNull(),
	tripId: int().notNull(),
	videoId: varchar({ length: 255 }).notNull(),
	platform: mysqlEnum(['youtube','tiktok']).notNull(),
	title: varchar({ length: 255 }),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => [
	index("trip_videos_trip_id_idx").on(table.tripId),
	index("trip_videos_created_at_idx").on(table.createdAt),
]);

export const userLocations = mysqlTable("userLocations", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	latitude: varchar({ length: 50 }).notNull(),
	longitude: varchar({ length: 50 }).notNull(),
	accuracy: varchar({ length: 50 }),
	updatedAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => [
	index("user_locations_user_id_idx").on(table.userId),
	index("user_locations_updated_at_idx").on(table.updatedAt),
]);

export const users = mysqlTable("users", {
	id: int().autoincrement().notNull(),
	openId: varchar({ length: 64 }),
	name: text(),
	email: varchar({ length: 320 }),
	loginMethod: varchar({ length: 64 }).default('local'),
	role: mysqlEnum(['user','admin']).default('user').notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	lastSignedIn: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	username: varchar({ length: 255 }),
	passwordHash: varchar({ length: 255 }),
},
(table) => [
	unique("users_openId_unique").on(table.openId),
	unique("users_username_unique").on(table.username),
]);

export const userSettings = mysqlTable("userSettings", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	notificationsEnabled: int().default(1).notNull(),
	friendRequestNotifications: int().default(1).notNull(),
	friendRequestAcceptedNotifications: int().default(1).notNull(),
	nearbyTripNotifications: int().default(1).notNull(),
	newTripNotifications: int().default(1).notNull(),
	nearbyTripDistance: int().default(5000).notNull(),
	locationTrackingEnabled: int().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => [
	index("user_settings_user_id_idx").on(table.userId),
	unique("userId").on(table.userId),
]);

export type InsertAusfluege = InferInsertModel<typeof ausfluege>;
export type SelectAusfluege = InferSelectModel<typeof ausfluege>;

export type InsertBudgetItems = InferInsertModel<typeof budgetItems>;
export type SelectBudgetItems = InferSelectModel<typeof budgetItems>;

export type InsertChecklistItems = InferInsertModel<typeof checklistItems>;
export type SelectChecklistItems = InferSelectModel<typeof checklistItems>;

export type InsertDayPlanItems = InferInsertModel<typeof dayPlanItems>;
export type SelectDayPlanItems = InferSelectModel<typeof dayPlanItems>;

export type InsertDayPlans = InferInsertModel<typeof dayPlans>;
export type SelectDayPlans = InferSelectModel<typeof dayPlans>;

export type InsertDestinations = InferInsertModel<typeof destinations>;
export type SelectDestinations = InferSelectModel<typeof destinations>;

export type InsertFriendships = InferInsertModel<typeof friendships>;
export type SelectFriendships = InferSelectModel<typeof friendships>;

export type InsertNotifications = InferInsertModel<typeof notifications>;
export type SelectNotifications = InferSelectModel<typeof notifications>;

export type InsertPackingListItems = InferInsertModel<typeof packingListItems>;
export type SelectPackingListItems = InferSelectModel<typeof packingListItems>;

export type InsertPushSubscriptions = InferInsertModel<typeof pushSubscriptions>;
export type SelectPushSubscriptions = InferSelectModel<typeof pushSubscriptions>;

export type InsertTripAttributes = InferInsertModel<typeof tripAttributes>;
export type SelectTripAttributes = InferSelectModel<typeof tripAttributes>;

export type InsertTripCategories = InferInsertModel<typeof tripCategories>;
export type SelectTripCategories = InferSelectModel<typeof tripCategories>;

export type InsertTripComments = InferInsertModel<typeof tripComments>;
export type SelectTripComments = InferSelectModel<typeof tripComments>;

export type InsertTripJournal = InferInsertModel<typeof tripJournal>;
export type SelectTripJournal = InferSelectModel<typeof tripJournal>;

export type InsertTripParticipants = InferInsertModel<typeof tripParticipants>;
export type SelectTripParticipants = InferSelectModel<typeof tripParticipants>;

export type InsertTripPhotos = InferInsertModel<typeof tripPhotos>;
export type SelectTripPhotos = InferSelectModel<typeof tripPhotos>;

export type InsertTrips = InferInsertModel<typeof trips>;
export type SelectTrips = InferSelectModel<typeof trips>;

export type InsertTripVideos = InferInsertModel<typeof tripVideos>;
export type SelectTripVideos = InferSelectModel<typeof tripVideos>;

export type InsertUserLocations = InferInsertModel<typeof userLocations>;
export type SelectUserLocations = InferSelectModel<typeof userLocations>;

export type InsertUsers = InferInsertModel<typeof users>;
export type SelectUsers = InferSelectModel<typeof users>;

export type InsertUserSettings = InferInsertModel<typeof userSettings>;
export type SelectUserSettings = InferSelectModel<typeof userSettings>;

// export const commentRelations = relations(tripComments, ({ one }) => ({
//   user: one(users, { fields: [tripComments.userId], references: [users.id] }),
// }));
