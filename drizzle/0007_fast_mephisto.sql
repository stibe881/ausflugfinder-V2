ALTER TABLE `users` MODIFY COLUMN `openId` varchar(64);--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `loginMethod` varchar(64) DEFAULT 'local';--> statement-breakpoint
ALTER TABLE `dayPlanItems` ADD `dateAssigned` timestamp;--> statement-breakpoint
ALTER TABLE `trips` ADD `image` text;--> statement-breakpoint
ALTER TABLE `users` ADD `username` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_username_unique` UNIQUE(`username`);--> statement-breakpoint
CREATE INDEX `day_plan_items_day_plan_id_idx` ON `dayPlanItems` (`dayPlanId`);--> statement-breakpoint
CREATE INDEX `day_plan_items_trip_id_idx` ON `dayPlanItems` (`tripId`);--> statement-breakpoint
CREATE INDEX `day_plans_user_id_idx` ON `dayPlans` (`userId`);--> statement-breakpoint
CREATE INDEX `day_plans_created_at_idx` ON `dayPlans` (`createdAt`);--> statement-breakpoint
CREATE INDEX `destinations_user_id_idx` ON `destinations` (`userId`);--> statement-breakpoint
CREATE INDEX `destinations_created_at_idx` ON `destinations` (`createdAt`);--> statement-breakpoint
CREATE INDEX `trip_comments_trip_id_idx` ON `tripComments` (`tripId`);--> statement-breakpoint
CREATE INDEX `trip_comments_created_at_idx` ON `tripComments` (`createdAt`);--> statement-breakpoint
CREATE INDEX `trip_participants_trip_id_idx` ON `tripParticipants` (`tripId`);--> statement-breakpoint
CREATE INDEX `trip_participants_user_id_idx` ON `tripParticipants` (`userId`);--> statement-breakpoint
CREATE INDEX `trip_photos_trip_id_idx` ON `tripPhotos` (`tripId`);--> statement-breakpoint
CREATE INDEX `trip_photos_created_at_idx` ON `tripPhotos` (`createdAt`);--> statement-breakpoint
CREATE INDEX `trips_user_id_idx` ON `trips` (`userId`);--> statement-breakpoint
CREATE INDEX `trips_is_public_idx` ON `trips` (`isPublic`);--> statement-breakpoint
CREATE INDEX `trips_created_at_idx` ON `trips` (`createdAt`);--> statement-breakpoint
CREATE INDEX `trips_region_idx` ON `trips` (`region`);--> statement-breakpoint
CREATE INDEX `trips_category_idx` ON `trips` (`category`);--> statement-breakpoint
CREATE INDEX `trips_cost_idx` ON `trips` (`cost`);--> statement-breakpoint
CREATE INDEX `trips_search_idx` ON `trips` (`region`,`category`,`cost`);