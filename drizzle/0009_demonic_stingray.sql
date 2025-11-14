CREATE TABLE `friendships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`friendId` int NOT NULL,
	`status` enum('pending','accepted','blocked') NOT NULL DEFAULT 'pending',
	`requestedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `friendships_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`type` enum('friend_request','friend_accepted','nearby_trip','system') NOT NULL DEFAULT 'system',
	`relatedId` int,
	`isRead` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pushSubscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`endpoint` varchar(2048) NOT NULL,
	`auth` varchar(255) NOT NULL,
	`p256dh` varchar(255) NOT NULL,
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pushSubscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userLocations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`latitude` varchar(50) NOT NULL,
	`longitude` varchar(50) NOT NULL,
	`accuracy` varchar(50),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userLocations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`notificationsEnabled` int NOT NULL DEFAULT 1,
	`friendRequestNotifications` int NOT NULL DEFAULT 1,
	`friendRequestAcceptedNotifications` int NOT NULL DEFAULT 1,
	`nearbyTripNotifications` int NOT NULL DEFAULT 1,
	`nearbyTripDistance` int NOT NULL DEFAULT 5000,
	`locationTrackingEnabled` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `userSettings_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE INDEX `friendships_user_id_idx` ON `friendships` (`userId`);--> statement-breakpoint
CREATE INDEX `friendships_friend_id_idx` ON `friendships` (`friendId`);--> statement-breakpoint
CREATE INDEX `friendships_status_idx` ON `friendships` (`status`);--> statement-breakpoint
CREATE INDEX `notifications_user_id_idx` ON `notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `notifications_is_read_idx` ON `notifications` (`isRead`);--> statement-breakpoint
CREATE INDEX `notifications_created_at_idx` ON `notifications` (`createdAt`);--> statement-breakpoint
CREATE INDEX `push_subscriptions_user_id_idx` ON `pushSubscriptions` (`userId`);--> statement-breakpoint
CREATE INDEX `push_subscriptions_endpoint_idx` ON `pushSubscriptions` (`endpoint`);--> statement-breakpoint
CREATE INDEX `user_locations_user_id_idx` ON `userLocations` (`userId`);--> statement-breakpoint
CREATE INDEX `user_locations_updated_at_idx` ON `userLocations` (`updatedAt`);--> statement-breakpoint
CREATE INDEX `user_settings_user_id_idx` ON `userSettings` (`userId`);