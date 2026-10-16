import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { ENV } from './_core/env';
import { agencies, agencyMembers, favourites, inquiries, listingImages, listingMetrics, listingReports, listings, notifications, sellerProfiles, sellerSubscriptions, users, verificationChecks, viewingAppointments, type InsertUser } from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && ENV.databaseUrl) {
    try { _db = drizzle(ENV.databaseUrl); } catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; }
  }
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getSellerProfile(userId: number) {
  const db = await getDb(); if (!db) return undefined;
  const result = await db.select().from(sellerProfiles).where(eq(sellerProfiles.userId, userId)).limit(1);
  return result[0];
}

export async function ensureSellerProfile(user: { id: number; name: string | null; email: string | null }) {
  const db = await getDb(); if (!db) throw new Error("Database is not available");
  const existing = await getSellerProfile(user.id);
  if (existing) return existing;
  await db.insert(sellerProfiles).values({ userId: user.id, displayName: user.name || user.email?.split("@")[0] || "Property seller" });
  return getSellerProfile(user.id);
}

export async function getSellerWorkspace(userId: number) {
  const db = await getDb(); if (!db) throw new Error("Database is not available");
  const profile = await ensureSellerProfile({ id: userId, name: null, email: null });
  const ownedListings = await db.select().from(listings).where(eq(listings.ownerUserId, userId)).orderBy(desc(listings.updatedAt));
  const listingIds = ownedListings.map((item) => item.id);
  const metrics = listingIds.length ? await db.select().from(listingMetrics).where(inArray(listingMetrics.listingId, listingIds)) : [];
  const leads = listingIds.length ? await db.select().from(inquiries).where(inArray(inquiries.listingId, listingIds)).orderBy(desc(inquiries.createdAt)) : [];
  const viewings = listingIds.length ? await db.select().from(viewingAppointments).where(inArray(viewingAppointments.listingId, listingIds)).orderBy(asc(viewingAppointments.appointmentDate)) : [];
  const reports = listingIds.length ? await db.select().from(listingReports).where(inArray(listingReports.listingId, listingIds)).orderBy(desc(listingReports.createdAt)) : [];
  const agencyMemberships = await db.select().from(agencyMembers).where(and(eq(agencyMembers.userId, userId), eq(agencyMembers.status, "active")));
  const agencyIds = agencyMemberships.map((membership) => membership.agencyId);
  const agencyRows = agencyIds.length ? await db.select().from(agencies).where(inArray(agencies.id, agencyIds)) : [];
  const subscription = await db.select().from(sellerSubscriptions).where(eq(sellerSubscriptions.userId, userId)).orderBy(desc(sellerSubscriptions.createdAt)).limit(1);
  return { profile, listings: ownedListings, metrics, leads, viewings, reports, agencies: agencyRows, subscription: subscription[0] ?? null };
}

export async function getListingById(id: number) {
  const db = await getDb(); if (!db) return undefined;
  const listing = await db.select().from(listings).where(eq(listings.id, id)).limit(1);
  if (!listing[0]) return undefined;
  const images = await db.select().from(listingImages).where(eq(listingImages.listingId, id)).orderBy(asc(listingImages.sortOrder));
  return { ...listing[0], images };
}

export async function getPublicListings() {
  const db = await getDb(); if (!db) return [];
  const published = await db.select().from(listings).where(eq(listings.status, "published")).orderBy(desc(listings.featured), desc(listings.updatedAt));
  if (!published.length) return [];
  const images = await db.select().from(listingImages).where(inArray(listingImages.listingId, published.map((item) => item.id))).orderBy(asc(listingImages.sortOrder));
  const ownerIds = Array.from(new Set(published.map((listing) => listing.ownerUserId)));
  const checks = ownerIds.length ? await db.select().from(verificationChecks).where(inArray(verificationChecks.userId, ownerIds)) : [];
  return published.map((listing) => { const check = checks.find((item) => item.userId === listing.ownerUserId); return { ...listing, images: images.filter((image) => image.listingId === listing.id), verification: { identityVerified: check?.identityStatus === "completed", sellerAuthorizationReviewed: check?.authorizationStatus === "completed", propertyDocumentationReviewed: check?.propertyDocsStatus === "completed", legalChecksCompleted: check?.legalChecksStatus === "completed" } }; });
}

type ListingImageInput = Omit<typeof listingImages.$inferInsert, "listingId">;

export async function createListing(data: typeof listings.$inferInsert, imageRows: Array<ListingImageInput>) {
  const db = await getDb(); if (!db) throw new Error("Database is not available");
  const result = await db.insert(listings).values(data);
  const id = Number(result[0].insertId);
  if (imageRows.length) await db.insert(listingImages).values(imageRows.map((image) => ({ ...image, listingId: id })));
  await db.insert(listingMetrics).values({ listingId: id });
  return getListingById(id);
}

export async function updateListing(id: number, data: Partial<typeof listings.$inferInsert>, imageRows?: Array<ListingImageInput>) {
  const db = await getDb(); if (!db) throw new Error("Database is not available");
  await db.update(listings).set(data).where(eq(listings.id, id));
  if (imageRows) {
    await db.delete(listingImages).where(eq(listingImages.listingId, id));
    if (imageRows.length) await db.insert(listingImages).values(imageRows.map((image) => ({ ...image, listingId: id })));
  }
  return getListingById(id);
}

export async function createNotification(userId: number, title: string, body: string, kind: string) {
  const db = await getDb(); if (!db) return;
  await db.insert(notifications).values({ userId, title, body, kind });
}

export async function getNotifications(userId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(30);
}

export async function getPublicMetrics(listingId: number) {
  const db = await getDb(); if (!db) return undefined;
  await db.update(listingMetrics).set({ views: sql`${listingMetrics.views} + 1` }).where(eq(listingMetrics.listingId, listingId));
  const result = await db.select().from(listingMetrics).where(eq(listingMetrics.listingId, listingId)).limit(1);
  return result[0];
}
