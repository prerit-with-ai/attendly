"use server";

import { db } from "@/db";
import { notification } from "@/db/schema";
import { requireCompany } from "@/lib/auth-server";
import { eq, and, desc, count } from "drizzle-orm";

export async function getNotifications(limit = 20) {
  const session = await requireCompany();
  const userId = session.user.id;

  return db
    .select()
    .from(notification)
    .where(eq(notification.userId, userId))
    .orderBy(desc(notification.createdAt))
    .limit(limit);
}

export async function getUnreadCount() {
  const session = await requireCompany();
  const userId = session.user.id;

  const [{ unread }] = await db
    .select({ unread: count() })
    .from(notification)
    .where(and(eq(notification.userId, userId), eq(notification.isRead, false)));

  return unread;
}

export async function markAsRead(notificationId: string) {
  const session = await requireCompany();
  const userId = session.user.id;

  await db
    .update(notification)
    .set({ isRead: true, readAt: new Date() })
    .where(and(eq(notification.id, notificationId), eq(notification.userId, userId)));

  return { success: true };
}

export async function markAllAsRead() {
  const session = await requireCompany();
  const userId = session.user.id;

  await db
    .update(notification)
    .set({ isRead: true, readAt: new Date() })
    .where(and(eq(notification.userId, userId), eq(notification.isRead, false)));

  return { success: true };
}
