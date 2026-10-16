CREATE TABLE `admin_audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adminUserId` int NOT NULL,
	`action` varchar(120) NOT NULL,
	`entityType` varchar(80) NOT NULL,
	`entityId` int,
	`detailsJson` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`listingId` int NOT NULL,
	`buyerUserId` int NOT NULL,
	`sellerUserId` int NOT NULL,
	`status` enum('open','archived','blocked') NOT NULL DEFAULT 'open',
	`lastMessageAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`),
	CONSTRAINT `conversations_listing_buyer_unique` UNIQUE(`listingId`,`buyerUserId`)
);
--> statement-breakpoint
CREATE TABLE `managed_locations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(140) NOT NULL,
	`district` varchar(120),
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `managed_locations_id` PRIMARY KEY(`id`),
	CONSTRAINT `managed_locations_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`senderUserId` int NOT NULL,
	`body` text NOT NULL,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `property_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`slug` varchar(140) NOT NULL,
	`description` text,
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `property_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `property_categories_name_unique` UNIQUE(`name`),
	CONSTRAINT `property_categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `subscription_payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`agencyId` int,
	`subscriptionId` int,
	`amount` decimal(15,2) NOT NULL,
	`currency` varchar(8) NOT NULL DEFAULT 'UGX',
	`status` enum('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
	`providerReference` varchar(180),
	`paidAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `subscription_payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `verification_checks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`identityStatus` enum('not_started','submitted','in_review','completed','rejected') NOT NULL DEFAULT 'not_started',
	`authorizationStatus` enum('not_started','submitted','in_review','completed','rejected') NOT NULL DEFAULT 'not_started',
	`propertyDocsStatus` enum('not_started','in_review','completed','rejected') NOT NULL DEFAULT 'not_started',
	`legalChecksStatus` enum('not_applicable','not_started','in_review','completed','rejected') NOT NULL DEFAULT 'not_started',
	`notes` text,
	`reviewedByUserId` int,
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `verification_checks_id` PRIMARY KEY(`id`),
	CONSTRAINT `verification_checks_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `verification_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`listingId` int,
	`docType` enum('identity','seller_authorization','ownership_evidence','title_search','tenure','survey','plot_dimensions','boundary_document','legal_check') NOT NULL,
	`fileName` varchar(240) NOT NULL,
	`contentType` varchar(120) NOT NULL,
	`byteSize` int NOT NULL,
	`storageKey` varchar(500) NOT NULL,
	`status` enum('uploaded','in_review','approved','rejected') NOT NULL DEFAULT 'uploaded',
	`rejectionReason` text,
	`reviewedByUserId` int,
	`reviewedAt` timestamp,
	`retentionUntil` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `verification_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `listings` ADD `propertyDocsStatus` enum('not_submitted','submitted','reviewed','rejected') DEFAULT 'not_submitted' NOT NULL;--> statement-breakpoint
ALTER TABLE `listings` ADD `legalChecksStatus` enum('not_applicable','not_started','in_review','completed','rejected') DEFAULT 'not_started' NOT NULL;--> statement-breakpoint
ALTER TABLE `listings` ADD `duplicateFlag` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `listings` ADD `duplicateOfListingId` int;--> statement-breakpoint
CREATE INDEX `admin_audit_admin_idx` ON `admin_audit_logs` (`adminUserId`);--> statement-breakpoint
CREATE INDEX `admin_audit_entity_idx` ON `admin_audit_logs` (`entityType`,`entityId`);--> statement-breakpoint
CREATE INDEX `conversations_participants_idx` ON `conversations` (`buyerUserId`,`sellerUserId`);--> statement-breakpoint
CREATE INDEX `conversations_listing_idx` ON `conversations` (`listingId`);--> statement-breakpoint
CREATE INDEX `messages_conversation_idx` ON `messages` (`conversationId`);--> statement-breakpoint
CREATE INDEX `messages_sender_idx` ON `messages` (`senderUserId`);--> statement-breakpoint
CREATE INDEX `verification_documents_user_idx` ON `verification_documents` (`userId`);--> statement-breakpoint
CREATE INDEX `verification_documents_listing_idx` ON `verification_documents` (`listingId`);--> statement-breakpoint
CREATE INDEX `verification_documents_status_idx` ON `verification_documents` (`status`);