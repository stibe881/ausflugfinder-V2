CREATE TABLE `budgetItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dayPlanId` int NOT NULL,
	`category` varchar(100) NOT NULL,
	`description` varchar(255) NOT NULL,
	`estimatedCost` varchar(20) NOT NULL,
	`actualCost` varchar(20),
	`currency` varchar(10) NOT NULL DEFAULT 'CHF',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `budgetItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `checklistItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dayPlanId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`isCompleted` int NOT NULL DEFAULT 0,
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`dueDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `checklistItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `packingListItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dayPlanId` int NOT NULL,
	`item` varchar(255) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`isPacked` int NOT NULL DEFAULT 0,
	`category` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `packingListItems_id` PRIMARY KEY(`id`)
);
