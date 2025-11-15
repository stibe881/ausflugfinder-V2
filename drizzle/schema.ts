import { mysqlTable, mysqlSchema, AnyMySqlColumn, int, varchar, text, decimal, datetime, timestamp, mysqlEnum, index, longtext, unique, tinyint } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const ausfluege = mysqlTable("ausfluege", {
	id: int().notNull(),
	userId: int("user_id").default('NULL'),
	name: varchar({ length: 255 }).notNull(),
	beschreibung: text().default('NULL'),
	adresse: varchar({ length: 255 }).notNull(),
	land: varchar({ length: 50 }).default('\'Schweiz\''),
	region: varchar({ length: 100 }).default('NULL'),
	kategorieAlt: varchar("kategorie_alt", { length: 100 }).default('NULL'),
	parkplatz: varchar({ length: 100 }).default('NULL'),
	parkplatzKostenlos: tinyint("parkplatz_kostenlos").default(0),
	kostenStufe: tinyint("kosten_stufe").default('NULL'),
	jahreszeiten: varchar({ length: 100 }).default('NULL'),
	websiteUrl: varchar("website_url", { length: 255 }).default('NULL'),
	lat: decimal({ precision: 10, scale: 7 }).default('NULL'),
	lng: decimal({ precision: 10, scale: 7 }).default('NULL'),
	// Warning: Can't parse point from database
	// pointType: point("coordinates"),
	createdAt: datetime("created_at", { mode: 'string'}).default('current_timestamp()').notNull(),
	niceToKnow: varchar("nice_to_know", { length: 255 }).default('NULL'),
	dauerMin: decimal("dauer_min", { precision: 5, scale: 2 }).default('NULL'),
	dauerMax: decimal("dauer_max", { precision: 5, scale: 2 }).default('NULL'),
	distanzMin: decimal("distanz_min", { precision: 6, scale: 2 }).default('NULL'),
	distanzMax: decimal("distanz_max", { precision: 6, scale: 2 }).default('NULL'),
	dauerStunden: decimal("dauer_stunden", { precision: 5, scale: 2 }).default('NULL'),
	distanzKm: decimal("distanz_km", { precision: 6, scale: 2 }).default('NULL'),
	isRundtour: tinyint("is_rundtour").default(0).notNull(),
	isVonANachB: tinyint("is_von_a_nach_b").default(0).notNull(),
	altersempfehlung: varchar({ length: 255 }).default('NULL'),
});

export const budgetItems = mysqlTable("budgetItems", {
	id: int().autoincrement().notNull(),
	dayPlanId: int().notNull(),
	category: varchar({ length: 100 }).notNull(),
	description: varchar({ length: 255 }).notNull(),
	estimatedCost: varchar({ length: 20 }).notNull(),
	actualCost: varchar({ length: 20 }).default('NULL'),
	currency: varchar({ length: 10 }).default('\'CHF\'').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('current_timestamp()').notNull(),
});

export const checklistItems = mysqlTable("checklistItems", {
	id: int().autoincrement().notNull(),
	dayPlanId: int().notNull(),
	title: varchar({ length: 255 }).notNull(),
	isCompleted: int().default(0).notNull(),
	priority: mysqlEnum(['low','medium','high']).default('\'medium\'').notNull(),
	dueDate: timestamp({ mode: 'string' }).default('NULL'),
	createdAt: timestamp({ mode: 'string' }).default('current_timestamp()').notNull(),
});

export const dayPlanItems = mysqlTable("dayPlanItems", {
	id: int().autoincrement().notNull(),
	dayPlanId: int().notNull(),
	tripId: int().notNull(),
	dayNumber: int().default(1).notNull(),
	orderIndex: int().notNull(),
	startTime: varchar({ length: 10 }).default('NULL'),
	endTime: varchar({ length: 10 }).default('NULL'),
	notes: text().default('NULL'),
	dateAssigned: timestamp({ mode: 'string' }).default('NULL'),
	createdAt: timestamp({ mode: 'string' }).default('current_timestamp()').notNull(),
});

export const dayPlans = mysqlTable("dayPlans", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text().default('NULL'),
	startDate: timestamp({ mode: 'string' }).notNull(),
	endDate: timestamp({ mode: 'string' }).notNull(),
	isPublic: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('current_timestamp()').notNull(),
	updatedAt: timestamp({ mode: 'string' }).default('current_timestamp()').notNull(),
	isDraft: int().default(1).notNull(),
});

export const destinations = mysqlTable("destinations", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text().default('NULL'),
	location: varchar({ length: 255 }).notNull(),
	imageUrl: varchar({ length: 512 }).default('NULL'),
	createdAt: timestamp({ mode: 'string' }).default('current_timestamp()').notNull(),
	updatedAt: timestamp({ mode: 'string' }).default('current_timestamp()').notNull(),
});

export const friendships = mysqlTable("friendships", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	friendId: int().notNull(),
	status: mysqlEnum(['pending','accepted','blocked']).default('\'pending\'').notNull(),
	requestedBy: int().notNull(),
	createdAt: timestamp({ mode: 'string' }).default('current_timestamp()').notNull(),
	updatedAt: timestamp({ mode: 'string' }).default('current_timestamp()').notNull(),
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
	type: mysqlEnum(['friend_request','friend_accepted','nearby_trip','system']).default('\'system\'').notNull(),
	relatedId: int().default('NULL'),
	isRead: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('current_timestamp()').notNull(),
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
	category: varchar({ length: 100 }).default('NULL'),
	createdAt: timestamp({ mode: 'string' }).default('current_timestamp()').notNull(),
});

export const pushSubscriptions = mysqlTable("pushSubscriptions", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	endpoint: varchar({ length: 2048 }).notNull(),
	auth: varchar({ length: 255 }).notNull(),
	p256Dh: varchar({ length: 255 }).notNull(),
	userAgent: text().default('NULL'),
	createdAt: timestamp({ mode: 'string' }).default('current_timestamp()').notNull(),
	updatedAt: timestamp({ mode: 'string' }).default('current_timestamp()').notNull(),
},
(table) => [
	index("push_subscriptions_user_id_idx").on(table.userId),
	index("push_subscriptions_endpoint_idx").on(table.endpoint),
]);

export const tripAttributes = mysqlTable("tripAttributes", {
	id: int().autoincrement().notNull(),
	tripId: int().notNull(),
	attribute: varchar({ length: 100 }).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('current_timestamp()').notNull(),
});

export const tripCategories = mysqlTable("tripCategories", {
	id: int().autoincrement().notNull(),
	tripId: int().notNull(),
	category: varchar({ length: 100 }).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('current_timestamp()').notNull(),
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
	createdAt: timestamp({ mode: 'string' }).default('current_timestamp()').notNull(),
	updatedAt: timestamp({ mode: 'string' }).default('current_timestamp()').notNull(),
});

export const tripJournal = mysqlTable("tripJournal", {
	id: int().autoincrement().notNull(),
	tripId: int().notNull(),
	userId: int().notNull(),
	content: text().notNull(),
	entryDate: timestamp({ mode: 'string' }).notNull(),
	mood: varchar({ length: 50 }).default('NULL'),
	createdAt: timestamp({ mode: 'string' }).default('current_timestamp()').notNull(),
	updatedAt: timestamp({ mode: 'string' }).default('current_timestamp()').notNull(),
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
	userId: int().default('NULL'),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 320 }).default('NULL'),
	status: mysqlEnum(['confirmed','pending','declined']).default('\'pending\'').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('current_timestamp()').notNull(),
});

export const tripPhotos = mysqlTable("tripPhotos", {
	id: int().autoincrement().notNull(),
	tripId: int().notNull(),
	photoUrl: varchar({ length: 512 }).notNull(),
	caption: text().default('NULL'),
	isPrimary: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('current_timestamp()').notNull(),
});

export const trips = mysqlTable("trips", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text().default('NULL'),
	destination: varchar({ length: 255 }).notNull(),
	startDate: timestamp({ mode: 'string' }).default('NULL'),
	endDate: timestamp({ mode: 'string' }).default('NULL'),
	participants: int().default(1).notNull(),
	status: mysqlEnum(['planned','ongoing','completed','cancelled']).default('\'planned\'').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('current_timestamp()').notNull(),
	updatedAt: timestamp({ mode: 'string' }).default('current_timestamp()').notNull(),
	cost: mysqlEnum(['free','low','medium','high','very_high']).default('\'free\'').notNull(),
	ageRecommendation: varchar({ length: 50 }).default('NULL'),
	routeType: mysqlEnum(['round_trip','one_way','location']).default('\'location\'').notNull(),
	region: varchar({ length: 100 }).default('NULL'),
	address: varchar({ length: 512 }).default('NULL'),
	websiteUrl: varchar({ length: 512 }).default('NULL'),
	contactEmail: varchar({ length: 320 }).default('NULL'),
	contactPhone: varchar({ length: 50 }).default('NULL'),
	latitude: varchar({ length: 50 }).default('NULL'),
	longitude: varchar({ length: 50 }).default('NULL'),
	isFavorite: int().default(0).notNull(),
	isDone: int().default(0).notNull(),
	isPublic: int().default(0).notNull(),
	durationMin: decimal({ precision: 5, scale: 2 }).default('NULL'),
	durationMax: decimal({ precision: 5, scale: 2 }).default('NULL'),
	distanceMin: decimal({ precision: 6, scale: 2 }).default('NULL'),
	distanceMax: decimal({ precision: 6, scale: 2 }).default('NULL'),
	niceToKnow: varchar({ length: 500 }).default('NULL'),
	image: longtext().default('NULL'),
});

export const tripVideos = mysqlTable("tripVideos", {
	id: int().autoincrement().notNull(),
	tripId: int().notNull(),
	videoId: varchar({ length: 255 }).notNull(),
	platform: mysqlEnum(['youtube','tiktok']).notNull(),
	title: varchar({ length: 255 }).default('NULL'),
	createdAt: timestamp({ mode: 'string' }).default('current_timestamp()').notNull(),
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
	accuracy: varchar({ length: 50 }).default('NULL'),
	updatedAt: timestamp({ mode: 'string' }).default('current_timestamp()').notNull(),
},
(table) => [
	index("user_locations_user_id_idx").on(table.userId),
	index("user_locations_updated_at_idx").on(table.updatedAt),
]);

export const users = mysqlTable("users", {
	id: int().autoincrement().notNull(),
	openId: varchar({ length: 64 }).default('NULL'),
	name: text().default('NULL'),
	email: varchar({ length: 320 }).default('NULL'),
	loginMethod: varchar({ length: 64 }).default('\'local\''),
	role: mysqlEnum(['user','admin']).default('\'user\'').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('current_timestamp()').notNull(),
	updatedAt: timestamp({ mode: 'string' }).default('current_timestamp()').notNull(),
	lastSignedIn: timestamp({ mode: 'string' }).default('current_timestamp()').notNull(),
	username: varchar({ length: 255 }).default('NULL'),
	passwordHash: varchar({ length: 255 }).default('NULL'),
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
	nearbyTripDistance: int().default(5000).notNull(),
	locationTrackingEnabled: int().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('current_timestamp()').notNull(),
	updatedAt: timestamp({ mode: 'string' }).default('current_timestamp()').notNull(),
},
(table) => [
	index("user_settings_user_id_idx").on(table.userId),
	unique("userId").on(table.userId),
]);
