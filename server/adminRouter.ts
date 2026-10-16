import { and, desc, eq, inArray, or } from "drizzle-orm";
import { z } from "zod";
import { adminProcedure, router } from "./_core/trpc";
import { createNotification, getDb, getListingById } from "./db";
import { storageGetSignedUrl } from "./storage";
import { adminAuditLogs, agencies, conversations, listingReports, listings, managedLocations, propertyCategories, sellerProfiles, sellerSubscriptions, subscriptionPayments, users, verificationChecks, verificationDocuments } from "../drizzle/schema";

const accountRole = z.enum(["user", "admin", "seller", "agent", "agency"]);
const reviewStatus = z.enum(["approved", "rejected"]);

async function audit(adminUserId: number, action: string, entityType: string, entityId: number | null, details: Record<string, unknown> = {}) {
  const database = await getDb();
  if (!database) throw new Error("Database is not available");
  await database.insert(adminAuditLogs).values({ adminUserId, action, entityType, entityId, detailsJson: JSON.stringify(details) });
}

export const adminRouter = router({
  overview: adminProcedure.query(async () => {
    const database = await getDb();
    if (!database) throw new Error("Database is not available");
    const [listingRows, sellerRows, documentRows, reportRows, userRows, featuredRows, subscriptionRows, paymentRows, categoryRows, locationRows, auditRows, checkRows] = await Promise.all([
      database.select().from(listings).orderBy(desc(listings.updatedAt)),
      database.select().from(sellerProfiles).orderBy(desc(sellerProfiles.updatedAt)),
      database.select().from(verificationDocuments).orderBy(desc(verificationDocuments.createdAt)),
      database.select().from(listingReports).orderBy(desc(listingReports.createdAt)),
      database.select().from(users).orderBy(desc(users.createdAt)),
      database.select().from(listings).where(eq(listings.featured, true)).orderBy(desc(listings.updatedAt)),
      database.select().from(sellerSubscriptions).orderBy(desc(sellerSubscriptions.updatedAt)),
      database.select().from(subscriptionPayments).orderBy(desc(subscriptionPayments.createdAt)),
      database.select().from(propertyCategories).orderBy(propertyCategories.name),
      database.select().from(managedLocations).orderBy(managedLocations.name),
      database.select().from(adminAuditLogs).orderBy(desc(adminAuditLogs.createdAt)).limit(100),
      database.select().from(verificationChecks),
    ]);
    const staleCutoff = new Date(Date.now() - 90 * 86400000);
    return { listings: listingRows, sellers: sellerRows, documents: documentRows.map(({ storageKey: _privateKey, ...document }) => document), reports: reportRows, users: userRows, featured: featuredRows, subscriptions: subscriptionRows, payments: paymentRows, categories: categoryRows, locations: locationRows, auditLogs: auditRows, verificationChecks: checkRows, conversations: await database.select().from(conversations).orderBy(desc(conversations.lastMessageAt)), metrics: { totalListings: listingRows.length, pendingReview: listingRows.filter((item) => item.status === "pending_review").length, published: listingRows.filter((item) => item.status === "published").length, verificationQueue: documentRows.filter((item) => ["uploaded", "in_review"].includes(item.status)).length, openReports: reportRows.filter((item) => ["open", "reviewing"].includes(item.status)).length, staleListings: listingRows.filter((item) => item.status === "published" && item.updatedAt < staleCutoff).length, users: userRows.length } };
  }),
  reviewListing: adminProcedure.input(z.object({ listingId: z.number().int().positive(), decision: reviewStatus, reason: z.string().trim().min(5).max(2000).optional() })).mutation(async ({ ctx, input }) => {
    const database = await getDb(); if (!database) throw new Error("Database is not available");
    const listing = await getListingById(input.listingId); if (!listing) throw new Error("Listing not found");
    if (input.decision === "rejected" && !input.reason) throw new Error("A rejection reason is required.");
    await database.update(listings).set({ status: input.decision === "approved" ? "published" : "rejected", rejectionReason: input.decision === "approved" ? null : input.reason, publishedAt: input.decision === "approved" ? new Date() : listing.publishedAt }).where(eq(listings.id, input.listingId));
    await createNotification(listing.ownerUserId, input.decision === "approved" ? "Listing approved" : "Listing needs corrections", input.decision === "approved" ? `${listing.title} is now published.` : `${listing.title} was rejected: ${input.reason}. Correct the listing and resubmit it.`, "moderation");
    await audit(ctx.user.id, input.decision === "approved" ? "listing_approved" : "listing_rejected", "listing", input.listingId, { reason: input.reason || null });
    return { success: true };
  }),
  setListingStatus: adminProcedure.input(z.object({ listingId: z.number().int().positive(), status: z.enum(["published", "paused", "reserved", "sold", "rented", "expired", "rejected"]), reason: z.string().max(2000).optional() })).mutation(async ({ ctx, input }) => {
    const database = await getDb(); if (!database) throw new Error("Database is not available");
    await database.update(listings).set({ status: input.status, rejectionReason: input.reason || null }).where(eq(listings.id, input.listingId));
    await audit(ctx.user.id, "listing_status_changed", "listing", input.listingId, { status: input.status, reason: input.reason || null });
    return { success: true };
  }),
  markFeatured: adminProcedure.input(z.object({ listingId: z.number().int().positive(), featured: z.boolean() })).mutation(async ({ ctx, input }) => { const database = await getDb(); if (!database) throw new Error("Database is not available"); await database.update(listings).set({ featured: input.featured }).where(eq(listings.id, input.listingId)); await audit(ctx.user.id, input.featured ? "listing_featured" : "listing_unfeatured", "listing", input.listingId); return { success: true }; }),
  scanDuplicates: adminProcedure.mutation(async ({ ctx }) => {
    const database = await getDb(); if (!database) throw new Error("Database is not available");
    const rows = await database.select().from(listings).where(inArray(listings.status, ["draft", "pending_review", "published", "paused", "reserved", "rented"]));
    const seen = new Map<string, number>(); const duplicates: Array<{ id: number; duplicateOfListingId: number }> = [];
    for (const listing of rows.sort((a, b) => a.id - b.id)) { const key = `${listing.title.trim().toLowerCase()}|${listing.city.trim().toLowerCase()}|${listing.price}`; const prior = seen.get(key); if (prior) { duplicates.push({ id: listing.id, duplicateOfListingId: prior }); await database.update(listings).set({ duplicateFlag: true, duplicateOfListingId: prior }).where(eq(listings.id, listing.id)); } else { seen.set(key, listing.id); await database.update(listings).set({ duplicateFlag: false, duplicateOfListingId: null }).where(eq(listings.id, listing.id)); } }
    await audit(ctx.user.id, "duplicate_scan", "listing", null, { duplicateCount: duplicates.length }); return { duplicates };
  }),
  reviewDocument: adminProcedure.input(z.object({ documentId: z.number().int().positive(), decision: reviewStatus, reason: z.string().trim().min(5).max(2000).optional() })).mutation(async ({ ctx, input }) => {
    const database = await getDb(); if (!database) throw new Error("Database is not available"); if (input.decision === "rejected" && !input.reason) throw new Error("A rejection reason is required."); const rows = await database.select().from(verificationDocuments).where(eq(verificationDocuments.id, input.documentId)).limit(1); const document = rows[0]; if (!document) throw new Error("Document not found"); await database.update(verificationDocuments).set({ status: input.decision === "approved" ? "approved" : "rejected", rejectionReason: input.decision === "approved" ? null : input.reason, reviewedByUserId: ctx.user.id, reviewedAt: new Date() }).where(eq(verificationDocuments.id, input.documentId)); await createNotification(document.userId, input.decision === "approved" ? "Verification document approved" : "Verification document needs attention", input.decision === "approved" ? `${document.fileName} was approved.` : `${document.fileName} was rejected: ${input.reason}. Upload a corrected document.`, "verification"); await audit(ctx.user.id, input.decision === "approved" ? "verification_document_approved" : "verification_document_rejected", "verification_document", input.documentId, { reason: input.reason || null }); return { success: true }; }),
  updateVerification: adminProcedure.input(z.object({ userId: z.number().int().positive(), identityStatus: z.enum(["not_started", "submitted", "in_review", "completed", "rejected"]), authorizationStatus: z.enum(["not_started", "submitted", "in_review", "completed", "rejected"]), propertyDocsStatus: z.enum(["not_started", "in_review", "completed", "rejected"]), legalChecksStatus: z.enum(["not_applicable", "not_started", "in_review", "completed", "rejected"]), notes: z.string().max(4000).optional() })).mutation(async ({ ctx, input }) => { const database = await getDb(); if (!database) throw new Error("Database is not available"); const existing = await database.select().from(verificationChecks).where(eq(verificationChecks.userId, input.userId)).limit(1); if (existing[0]) await database.update(verificationChecks).set({ ...input, reviewedByUserId: ctx.user.id, reviewedAt: new Date() }).where(eq(verificationChecks.userId, input.userId)); else await database.insert(verificationChecks).values({ ...input, reviewedByUserId: ctx.user.id, reviewedAt: new Date() }); await audit(ctx.user.id, "verification_status_updated", "user", input.userId, input); return { success: true }; }),
  userRole: adminProcedure.input(z.object({ userId: z.number().int().positive(), role: accountRole })).mutation(async ({ ctx, input }) => { const database = await getDb(); if (!database) throw new Error("Database is not available"); await database.update(users).set({ role: input.role }).where(eq(users.id, input.userId)); await audit(ctx.user.id, "user_role_updated", "user", input.userId, { role: input.role }); return { success: true }; }),
  reportStatus: adminProcedure.input(z.object({ reportId: z.number().int().positive(), status: z.enum(["open", "reviewing", "resolved", "dismissed"]) })).mutation(async ({ ctx, input }) => { const database = await getDb(); if (!database) throw new Error("Database is not available"); await database.update(listingReports).set({ status: input.status }).where(eq(listingReports.id, input.reportId)); await audit(ctx.user.id, "report_status_updated", "listing_report", input.reportId, { status: input.status }); return { success: true }; }),
  documentUrl: adminProcedure.input(z.object({ documentId: z.number().int().positive() })).mutation(async ({ ctx, input }) => { const database = await getDb(); if (!database) throw new Error("Database is not available"); const rows = await database.select().from(verificationDocuments).where(eq(verificationDocuments.id, input.documentId)).limit(1); if (!rows[0]) throw new Error("Document not found"); await audit(ctx.user.id, "verification_document_viewed", "verification_document", input.documentId); return { url: await storageGetSignedUrl(rows[0].storageKey) };
  }),
  createCategory: adminProcedure.input(z.object({ name: z.string().trim().min(2).max(120), slug: z.string().trim().regex(/^[a-z0-9-]+$/).max(140), description: z.string().max(500).optional() })).mutation(async ({ ctx, input }) => { const database = await getDb(); if (!database) throw new Error("Database is not available"); await database.insert(propertyCategories).values(input); await audit(ctx.user.id, "category_created", "category", null, input); return { success: true }; }),
  createLocation: adminProcedure.input(z.object({ name: z.string().trim().min(2).max(140), district: z.string().max(120).optional() })).mutation(async ({ ctx, input }) => { const database = await getDb(); if (!database) throw new Error("Database is not available"); await database.insert(managedLocations).values(input); await audit(ctx.user.id, "location_created", "location", null, input); return { success: true }; }),
  paymentStatus: adminProcedure.input(z.object({ paymentId: z.number().int().positive(), status: z.enum(["pending", "paid", "failed", "refunded"]) })).mutation(async ({ ctx, input }) => { const database = await getDb(); if (!database) throw new Error("Database is not available"); await database.update(subscriptionPayments).set({ status: input.status, paidAt: input.status === "paid" ? new Date() : null }).where(eq(subscriptionPayments.id, input.paymentId)); await audit(ctx.user.id, "payment_status_updated", "subscription_payment", input.paymentId, { status: input.status }); return { success: true }; }),
});
