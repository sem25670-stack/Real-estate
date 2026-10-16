import { boolean, decimal, index, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "seller", "agent", "agency"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const sellerProfiles = mysqlTable("seller_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  accountType: mysqlEnum("accountType", ["owner", "landlord", "agent", "agency"]).default("owner").notNull(),
  displayName: varchar("displayName", { length: 160 }).notNull(),
  phone: varchar("phone", { length: 32 }),
  bio: text("bio"),
  agencyName: varchar("agencyName", { length: 160 }),
  avatarUrl: varchar("avatarUrl", { length: 500 }),
  verificationStatus: mysqlEnum("verificationStatus", ["not_started", "submitted", "under_review", "verified", "rejected"]).default("not_started").notNull(),
  verificationNote: text("verificationNote"),
  settingsJson: text("settingsJson"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ userIdx: index("seller_profiles_user_idx").on(table.userId) }));

export const agencies = mysqlTable("agencies", {
  id: int("id").autoincrement().primaryKey(),
  ownerUserId: int("ownerUserId").notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  description: text("description"),
  phone: varchar("phone", { length: 32 }),
  email: varchar("email", { length: 320 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ ownerIdx: index("agencies_owner_idx").on(table.ownerUserId) }));

export const agencyMembers = mysqlTable("agency_members", {
  id: int("id").autoincrement().primaryKey(),
  agencyId: int("agencyId").notNull(),
  userId: int("userId").notNull(),
  memberRole: mysqlEnum("memberRole", ["owner", "manager", "agent"]).default("agent").notNull(),
  status: mysqlEnum("status", ["active", "invited", "removed"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({ agencyUserUnique: uniqueIndex("agency_members_agency_user_unique").on(table.agencyId, table.userId), userIdx: index("agency_members_user_idx").on(table.userId) }));

export const listings = mysqlTable("listings", {
  id: int("id").autoincrement().primaryKey(),
  ownerUserId: int("ownerUserId").notNull(),
  agencyId: int("agencyId"),
  title: varchar("title", { length: 180 }).notNull(),
  propertyType: mysqlEnum("propertyType", ["house", "apartment", "land", "commercial"]).notNull(),
  status: mysqlEnum("status", ["draft", "pending_review", "published", "rejected", "paused", "reserved", "sold", "rented", "expired"]).default("draft").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 15, scale: 2 }).notNull(),
  pricePeriod: mysqlEnum("pricePeriod", ["total", "monthly", "yearly"]).default("total").notNull(),
  location: varchar("location", { length: 180 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  bedrooms: int("bedrooms").default(0).notNull(),
  bathrooms: int("bathrooms").default(0).notNull(),
  areaSqft: int("areaSqft"),
  amenitiesJson: text("amenitiesJson"),
  specificationsJson: text("specificationsJson"),
  availability: mysqlEnum("availability", ["available", "unavailable", "move_in_soon"]).default("available").notNull(),
  availableFrom: timestamp("availableFrom"),
  rejectionReason: text("rejectionReason"),
  expiresAt: timestamp("expiresAt"),
  featured: boolean("featured").default(false).notNull(),
  propertyDocsStatus: mysqlEnum("propertyDocsStatus", ["not_submitted", "submitted", "reviewed", "rejected"]).default("not_submitted").notNull(),
  legalChecksStatus: mysqlEnum("legalChecksStatus", ["not_applicable", "not_started", "in_review", "completed", "rejected"]).default("not_started").notNull(),
  duplicateFlag: boolean("duplicateFlag").default(false).notNull(),
  duplicateOfListingId: int("duplicateOfListingId"),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ ownerIdx: index("listings_owner_idx").on(table.ownerUserId), statusIdx: index("listings_status_idx").on(table.status), cityIdx: index("listings_city_idx").on(table.city) }));

export const listingImages = mysqlTable("listing_images", {
  id: int("id").autoincrement().primaryKey(),
  listingId: int("listingId").notNull(),
  storageKey: varchar("storageKey", { length: 500 }).notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  altText: varchar("altText", { length: 240 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({ listingIdx: index("listing_images_listing_idx").on(table.listingId) }));

export const listingMetrics = mysqlTable("listing_metrics", {
  id: int("id").autoincrement().primaryKey(),
  listingId: int("listingId").notNull().unique(),
  views: int("views").default(0).notNull(),
  favourites: int("favourites").default(0).notNull(),
  inquiries: int("inquiries").default(0).notNull(),
  viewings: int("viewings").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const favourites = mysqlTable("favourites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  listingId: int("listingId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({ uniqueFavourite: uniqueIndex("favourites_user_listing_unique").on(table.userId, table.listingId), userIdx: index("favourites_user_idx").on(table.userId), listingIdx: index("favourites_listing_idx").on(table.listingId) }));

export const inquiries = mysqlTable("inquiries", {
  id: int("id").autoincrement().primaryKey(),
  listingId: int("listingId").notNull(),
  customerUserId: int("customerUserId"),
  assignedUserId: int("assignedUserId"),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 32 }),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["new", "contacted", "qualified", "closed", "archived"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ listingIdx: index("inquiries_listing_idx").on(table.listingId), assignedIdx: index("inquiries_assigned_idx").on(table.assignedUserId) }));

export const viewingAppointments = mysqlTable("viewing_appointments", {
  id: int("id").autoincrement().primaryKey(),
  listingId: int("listingId").notNull(),
  requesterUserId: int("requesterUserId"),
  assignedUserId: int("assignedUserId"),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 32 }),
  appointmentDate: timestamp("appointmentDate").notNull(),
  timeSlot: varchar("timeSlot", { length: 80 }).notNull(),
  notes: text("notes"),
  status: mysqlEnum("status", ["requested", "confirmed", "completed", "cancelled", "no_show"]).default("requested").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ listingIdx: index("viewings_listing_idx").on(table.listingId), assignedIdx: index("viewings_assigned_idx").on(table.assignedUserId) }));

export const listingReports = mysqlTable("listing_reports", {
  id: int("id").autoincrement().primaryKey(),
  listingId: int("listingId").notNull(),
  reporterUserId: int("reporterUserId"),
  reason: varchar("reason", { length: 160 }).notNull(),
  details: text("details").notNull(),
  status: mysqlEnum("status", ["open", "reviewing", "resolved", "dismissed"]).default("open").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ listingIdx: index("listing_reports_listing_idx").on(table.listingId), statusIdx: index("listing_reports_status_idx").on(table.status) }));

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  body: text("body").notNull(),
  kind: varchar("kind", { length: 64 }).notNull(),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({ userIdx: index("notifications_user_idx").on(table.userId) }));

export const sellerSubscriptions = mysqlTable("seller_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  agencyId: int("agencyId"),
  plan: mysqlEnum("plan", ["starter", "professional", "agency"]).default("starter").notNull(),
  status: mysqlEnum("status", ["trialing", "active", "cancelled", "expired"]).default("trialing").notNull(),
  startsAt: timestamp("startsAt").defaultNow().notNull(),
  endsAt: timestamp("endsAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const verificationChecks = mysqlTable("verification_checks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  identityStatus: mysqlEnum("identityStatus", ["not_started", "submitted", "in_review", "completed", "rejected"]).default("not_started").notNull(),
  authorizationStatus: mysqlEnum("authorizationStatus", ["not_started", "submitted", "in_review", "completed", "rejected"]).default("not_started").notNull(),
  propertyDocsStatus: mysqlEnum("propertyDocsStatus", ["not_started", "in_review", "completed", "rejected"]).default("not_started").notNull(),
  legalChecksStatus: mysqlEnum("legalChecksStatus", ["not_applicable", "not_started", "in_review", "completed", "rejected"]).default("not_started").notNull(),
  notes: text("notes"),
  reviewedByUserId: int("reviewedByUserId"),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const verificationDocuments = mysqlTable("verification_documents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  listingId: int("listingId"),
  docType: mysqlEnum("docType", ["identity", "seller_authorization", "ownership_evidence", "title_search", "tenure", "survey", "plot_dimensions", "boundary_document", "legal_check"]).notNull(),
  fileName: varchar("fileName", { length: 240 }).notNull(),
  contentType: varchar("contentType", { length: 120 }).notNull(),
  byteSize: int("byteSize").notNull(),
  storageKey: varchar("storageKey", { length: 500 }).notNull(),
  status: mysqlEnum("status", ["uploaded", "in_review", "approved", "rejected"]).default("uploaded").notNull(),
  rejectionReason: text("rejectionReason"),
  reviewedByUserId: int("reviewedByUserId"),
  reviewedAt: timestamp("reviewedAt"),
  retentionUntil: timestamp("retentionUntil"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ userIdx: index("verification_documents_user_idx").on(table.userId), listingIdx: index("verification_documents_listing_idx").on(table.listingId), statusIdx: index("verification_documents_status_idx").on(table.status) }));

export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  listingId: int("listingId").notNull(),
  buyerUserId: int("buyerUserId").notNull(),
  sellerUserId: int("sellerUserId").notNull(),
  status: mysqlEnum("status", ["open", "archived", "blocked"]).default("open").notNull(),
  lastMessageAt: timestamp("lastMessageAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ participantsIdx: index("conversations_participants_idx").on(table.buyerUserId, table.sellerUserId), listingIdx: index("conversations_listing_idx").on(table.listingId), uniqueThread: uniqueIndex("conversations_listing_buyer_unique").on(table.listingId, table.buyerUserId) }));

export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  senderUserId: int("senderUserId").notNull(),
  body: text("body").notNull(),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({ conversationIdx: index("messages_conversation_idx").on(table.conversationId), senderIdx: index("messages_sender_idx").on(table.senderUserId) }));

export const subscriptionPayments = mysqlTable("subscription_payments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  agencyId: int("agencyId"),
  subscriptionId: int("subscriptionId"),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 8 }).default("UGX").notNull(),
  status: mysqlEnum("status", ["pending", "paid", "failed", "refunded"]).default("pending").notNull(),
  providerReference: varchar("providerReference", { length: 180 }),
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const adminAuditLogs = mysqlTable("admin_audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  adminUserId: int("adminUserId").notNull(),
  action: varchar("action", { length: 120 }).notNull(),
  entityType: varchar("entityType", { length: 80 }).notNull(),
  entityId: int("entityId"),
  detailsJson: text("detailsJson"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({ adminIdx: index("admin_audit_admin_idx").on(table.adminUserId), entityIdx: index("admin_audit_entity_idx").on(table.entityType, table.entityId) }));

export const propertyCategories = mysqlTable("property_categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 120 }).notNull().unique(),
  slug: varchar("slug", { length: 140 }).notNull().unique(),
  description: text("description"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const managedLocations = mysqlTable("managed_locations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 140 }).notNull().unique(),
  district: varchar("district", { length: 120 }),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type SellerProfile = typeof sellerProfiles.$inferSelect;
export type Listing = typeof listings.$inferSelect;
export type ListingImage = typeof listingImages.$inferSelect;
export type Inquiry = typeof inquiries.$inferSelect;
export type ViewingAppointment = typeof viewingAppointments.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type VerificationDocument = typeof verificationDocuments.$inferSelect;
