CREATE TABLE `tripCategories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tripId` int NOT NULL,
	`category` varchar(100) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tripCategories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tripJournal` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tripId` int NOT NULL,
	`userId` int NOT NULL,
	`content` text NOT NULL,
	`entryDate` timestamp NOT NULL,
	`mood` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tripJournal_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tripVideos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tripId` int NOT NULL,
	`videoId` varchar(255) NOT NULL,
	`platform` enum('youtube','tiktok') NOT NULL,
	`title` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tripVideos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `trip_categories_trip_id_idx` ON `tripCategories` (`tripId`);--> statement-breakpoint
CREATE INDEX `trip_categories_category_idx` ON `tripCategories` (`category`);--> statement-breakpoint
CREATE INDEX `trip_journal_trip_id_idx` ON `tripJournal` (`tripId`);--> statement-breakpoint
CREATE INDEX `trip_journal_user_id_idx` ON `tripJournal` (`userId`);--> statement-breakpoint
CREATE INDEX `trip_journal_entry_date_idx` ON `tripJournal` (`entryDate`);--> statement-breakpoint
CREATE INDEX `trip_journal_created_at_idx` ON `tripJournal` (`createdAt`);--> statement-breakpoint
CREATE INDEX `trip_videos_trip_id_idx` ON `tripVideos` (`tripId`);--> statement-breakpoint
CREATE INDEX `trip_videos_created_at_idx` ON `tripVideos` (`createdAt`);