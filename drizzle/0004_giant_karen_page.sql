CREATE TABLE `dayPlanItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dayPlanId` int NOT NULL,
	`tripId` int NOT NULL,
	`dayNumber` int NOT NULL DEFAULT 1,
	`orderIndex` int NOT NULL,
	`startTime` varchar(10),
	`endTime` varchar(10),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dayPlanItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dayPlans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`isPublic` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dayPlans_id` PRIMARY KEY(`id`)
);
