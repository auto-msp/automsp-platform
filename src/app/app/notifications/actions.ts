"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionContext } from "@/server/auth/session";
import { markAllNotificationsRead, markNotificationRead } from "@/server/notifications";

export async function markReadAction(notificationId: string): Promise<void> {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/sign-in");
  await markNotificationRead(ctx.organization.id, ctx.user.id, notificationId);
  revalidatePath("/app/notifications");
}

export async function markAllReadAction(): Promise<void> {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/sign-in");
  await markAllNotificationsRead(ctx.organization.id, ctx.user.id);
  revalidatePath("/app/notifications");
}
