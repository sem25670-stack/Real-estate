import { and, desc, eq, or } from "drizzle-orm";
import { z } from "zod";
import { conversations, listings, messages, users } from "../drizzle/schema";
import { createNotification, getDb, getListingById } from "./db";
import { protectedProcedure, router } from "./_core/trpc";

async function getConversationForParticipant(conversationId: number, userId: number) {
  const database = await getDb();
  if (!database) throw new Error("Database is not available");
  const rows = await database.select().from(conversations).where(and(eq(conversations.id, conversationId), or(eq(conversations.buyerUserId, userId), eq(conversations.sellerUserId, userId)))).limit(1);
  return { database, conversation: rows[0] };
}

export const chatRouter = router({
  inbox: protectedProcedure.query(async ({ ctx }) => {
    const database = await getDb();
    if (!database) throw new Error("Database is not available");
    const rows = await database.select({ conversation: conversations, listing: listings }).from(conversations).innerJoin(listings, eq(conversations.listingId, listings.id)).where(or(eq(conversations.buyerUserId, ctx.user.id), eq(conversations.sellerUserId, ctx.user.id))).orderBy(desc(conversations.lastMessageAt));
    if (!rows.length) return [];
    const participantIds = Array.from(new Set(rows.flatMap((row) => [row.conversation.buyerUserId, row.conversation.sellerUserId])));
    const participantRows = await database.select().from(users).where(or(...participantIds.map((id) => eq(users.id, id))));
    const allMessages = await database.select().from(messages).where(or(...rows.map((row) => eq(messages.conversationId, row.conversation.id)))).orderBy(desc(messages.createdAt));
    return rows.map(({ conversation, listing }) => {
      const otherId = conversation.buyerUserId === ctx.user.id ? conversation.sellerUserId : conversation.buyerUserId;
      const other = participantRows.find((item) => item.id === otherId);
      return { ...conversation, listingTitle: listing.title, listingLocation: listing.location, otherParticipant: { id: otherId, name: other?.name || "A&O member" }, unreadCount: allMessages.filter((message) => message.conversationId === conversation.id && message.senderUserId !== ctx.user.id && !message.readAt).length, lastMessage: allMessages.find((message) => message.conversationId === conversation.id) ?? null };
    });
  }),
  messages: protectedProcedure.input(z.object({ conversationId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const { database, conversation } = await getConversationForParticipant(input.conversationId, ctx.user.id);
    if (!conversation) throw new Error("Conversation not found");
    await database.update(messages).set({ readAt: new Date() }).where(and(eq(messages.conversationId, input.conversationId), eq(messages.senderUserId, ctx.user.id)));
    return database.select().from(messages).where(eq(messages.conversationId, input.conversationId)).orderBy(messages.createdAt);
  }),
  openConversation: protectedProcedure.input(z.object({ listingId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    const listing = await getListingById(input.listingId);
    if (!listing || listing.status !== "published") throw new Error("This listing is not available for chat.");
    if (listing.ownerUserId === ctx.user.id) throw new Error("You cannot start a buyer conversation with your own listing.");
    const database = await getDb();
    if (!database) throw new Error("Database is not available");
    const existing = await database.select().from(conversations).where(and(eq(conversations.listingId, input.listingId), eq(conversations.buyerUserId, ctx.user.id))).limit(1);
    if (existing[0]) return existing[0];
    const result = await database.insert(conversations).values({ listingId: input.listingId, buyerUserId: ctx.user.id, sellerUserId: listing.ownerUserId });
    const id = Number(result[0].insertId);
    await createNotification(listing.ownerUserId, "New buyer conversation", `${ctx.user.name || "A signed-in buyer"} started a conversation about ${listing.title}.`, "message");
    return { id, listingId: input.listingId, buyerUserId: ctx.user.id, sellerUserId: listing.ownerUserId };
  }),
  sendMessage: protectedProcedure.input(z.object({ conversationId: z.number().int().positive(), body: z.string().trim().min(1).max(4000) })).mutation(async ({ ctx, input }) => {
    const { database, conversation } = await getConversationForParticipant(input.conversationId, ctx.user.id);
    if (!conversation || conversation.status !== "open") throw new Error("This conversation is not available.");
    await database.insert(messages).values({ conversationId: input.conversationId, senderUserId: ctx.user.id, body: input.body });
    await database.update(conversations).set({ lastMessageAt: new Date() }).where(eq(conversations.id, input.conversationId));
    const recipientId = conversation.buyerUserId === ctx.user.id ? conversation.sellerUserId : conversation.buyerUserId;
    await createNotification(recipientId, "New message", `${ctx.user.name || "A&O member"} sent you a message.`, "message");
    return { success: true };
  }),
  archiveConversation: protectedProcedure.input(z.object({ conversationId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    const { database, conversation } = await getConversationForParticipant(input.conversationId, ctx.user.id);
    if (!conversation) throw new Error("Conversation not found");
    await database.update(conversations).set({ status: "archived" }).where(eq(conversations.id, input.conversationId));
    return { success: true };
  }),
});
