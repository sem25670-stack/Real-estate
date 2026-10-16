CREATE TABLE `agencies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerUserId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`description` text,
	`phone` varchar(32),
	`email` varchar(320),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agencies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agency_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agencyId` int NOT NULL,
	`userId` int NOT NULL,
	`memberRole` enum('owner','manager','agent') NOT NULL DEFAULT 'agent',
	`status` enum('active','invited','removed') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agency_members_id` PRIMARY KEY(`id`),
	CONSTRAINT `agency_members_agency_user_unique` UNIQUE(`agencyId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `favourites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`listingId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favourites_id` PRIMARY KEY(`id`),
	CONSTRAINT `favourites_user_listing_unique` UNIQUE(`userId`,`listingId`)
);
--> statement-breakpoint
CREATE TABLE `inquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`listingId` int NOT NULL,
	`customerUserId` int,
	`assignedUserId` int,
	`name` varchar(160) NOT NULL,
	`email` varchar(320),
	`phone` varchar(32),
	`message` text NOT NULL,
	`status` enum('new','contacted','qualified','closed','archived') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `listing_images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`listingId` int NOT NULL,
	`storageKey` varchar(500) NOT NULL,
	`url` varchar(500) NOT NULL,
	`altText` varchar(240),
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `listing_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `listing_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`listingId` int NOT NULL,
	`views` int NOT NULL DEFAULT 0,
	`favourites` int NOT NULL DEFAULT 0,
	`inquiries` int NOT NULL DEFAULT 0,
	`viewings` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `listing_metrics_id` PRIMARY KEY(`id`),
	CONSTRAINT `listing_metrics_listingId_unique` UNIQUE(`listingId`)
);
--> statement-breakpoint
CREATE TABLE `listing_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`listingId` int NOT NULL,
	`reporterUserId` int,
	`reason` varchar(160) NOT NULL,
	`details` text NOT NULL,
	`status` enum('open','reviewing','resolved','dismissed') NOT NULL DEFAULT 'open',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `listing_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `listings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerUserId` int NOT NULL,
	`agencyId` int,
	`title` varchar(180) NOT NULL,
	`propertyType` enum('house','apartment','land','commercial') NOT NULL,
	`status` enum('draft','pending_review','published','rejected','paused','reserved','sold','rented','expired') NOT NULL DEFAULT 'draft',
	`description` text NOT NULL,
	`price` decimal(15,2) NOT NULL,
	`pricePeriod` enum('total','monthly','yearly') NOT NULL DEFAULT 'total',
	`location` varchar(180) NOT NULL,
	`city` varchar(100) NOT NULL,
	`bedrooms` int NOT NULL DEFAULT 0,
	`bathrooms` int NOT NULL DEFAULT 0,
	`areaSqft` int,
	`amenitiesJson` text,
	`specificationsJson` text,
	`availability` enum('available','unavailable','move_in_soon') NOT NULL DEFAULT 'available',
	`availableFrom` timestamp,
	`rejectionReason` text,
	`expiresAt` timestamp,
	`featured` boolean NOT NULL DEFAULT false,
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `listings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`body` text NOT NULL,
	`kind` varchar(64) NOT NULL,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `seller_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`accountType` enum('owner','landlord','agent','agency') NOT NULL DEFAULT 'owner',
	`displayName` varchar(160) NOT NULL,
	`phone` varchar(32),
	`bio` text,
	`agencyName` varchar(160),
	`avatarUrl` varchar(500),
	`verificationStatus` enum('not_started','submitted','under_review','verified','rejected') NOT NULL DEFAULT 'not_started',
	`verificationNote` text,
	`settingsJson` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `seller_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `seller_profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `seller_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`agencyId` int,
	`plan` enum('starter','professional','agency') NOT NULL DEFAULT 'starter',
	`status` enum('trialing','active','cancelled','expired') NOT NULL DEFAULT 'trialing',
	`startsAt` timestamp NOT NULL DEFAULT (now()),
	`endsAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `seller_subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `viewing_appointments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`listingId` int NOT NULL,
	`requesterUserId` int,
	`assignedUserId` int,
	`name` varchar(160) NOT NULL,
	`email` varchar(320),
	`phone` varchar(32),
	`appointmentDate` timestamp NOT NULL,
	`timeSlot` varchar(80) NOT NULL,
	`notes` text,
	`status` enum('requested','confirmed','completed','cancelled','no_show') NOT NULL DEFAULT 'requested',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `viewing_appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','seller','agent','agency') NOT NULL DEFAULT 'user';--> statement-breakpoint
CREATE INDEX `agencies_owner_idx` ON `agencies` (`ownerUserId`);--> statement-breakpoint
CREATE INDEX `agency_members_user_idx` ON `agency_members` (`userId`);--> statement-breakpoint
CREATE INDEX `favourites_user_idx` ON `favourites` (`userId`);--> statement-breakpoint
CREATE INDEX `favourites_listing_idx` ON `favourites` (`listingId`);--> statement-breakpoint
CREATE INDEX `inquiries_listing_idx` ON `inquiries` (`listingId`);--> statement-breakpoint
CREATE INDEX `inquiries_assigned_idx` ON `inquiries` (`assignedUserId`);--> statement-breakpoint
CREATE INDEX `listing_images_listing_idx` ON `listing_images` (`listingId`);--> statement-breakpoint
CREATE INDEX `listing_reports_listing_idx` ON `listing_reports` (`listingId`);--> statement-breakpoint
CREATE INDEX `listing_reports_status_idx` ON `listing_reports` (`status`);--> statement-breakpoint
CREATE INDEX `listings_owner_idx` ON `listings` (`ownerUserId`);--> statement-breakpoint
CREATE INDEX `listings_status_idx` ON `listings` (`status`);--> statement-breakpoint
CREATE INDEX `listings_city_idx` ON `listings` (`city`);--> statement-breakpoint
CREATE INDEX `notifications_user_idx` ON `notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `seller_profiles_user_idx` ON `seller_profiles` (`userId`);--> statement-breakpoint
CREATE INDEX `viewings_listing_idx` ON `viewing_appointments` (`listingId`);--> statement-breakpoint
CREATE INDEX `viewings_assigned_idx` ON `viewing_appointments` (`assignedUserId`);