CREATE TABLE `tripAttributes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tripId` int NOT NULL,
	`attribute` varchar(100) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tripAttributes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tripPhotos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tripId` int NOT NULL,
	`photoUrl` varchar(512) NOT NULL,
	`caption` text,
	`isPrimary` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tripPhotos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `trips` ADD `cost` enum('free','low','medium','high','very_high') DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE `trips` ADD `ageRecommendation` varchar(50);--> statement-breakpoint
ALTER TABLE `trips` ADD `routeType` enum('round_trip','one_way','location') DEFAULT 'location' NOT NULL;--> statement-breakpoint
ALTER TABLE `trips` ADD `category` varchar(100);--> statement-breakpoint
ALTER TABLE `trips` ADD `region` varchar(100);--> statement-breakpoint
ALTER TABLE `trips` ADD `address` varchar(512);--> statement-breakpoint
ALTER TABLE `trips` ADD `websiteUrl` varchar(512);--> statement-breakpoint
ALTER TABLE `trips` ADD `contactEmail` varchar(320);--> statement-breakpoint
ALTER TABLE `trips` ADD `contactPhone` varchar(50);--> statement-breakpoint
ALTER TABLE `trips` ADD `latitude` varchar(50);--> statement-breakpoint
ALTER TABLE `trips` ADD `longitude` varchar(50);--> statement-breakpoint
ALTER TABLE `trips` ADD `isFavorite` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `trips` ADD `isDone` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `trips` ADD `isPublic` int DEFAULT 0 NOT NULL;