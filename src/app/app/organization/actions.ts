"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { writeAuditLog } from "@/server/audit";
import { getSessionContext, requirePermission } from "@/server/auth/session";
import { newId } from "@/server/db/id";
import { store } from "@/server/db/store";
import { notify } from "@/server/notifications";
import { formatRole } from "@/server/roles";
import type { Role } from "@/server/db/types";

export interface OrgFormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: string;
}

const CUSTOMER_ROLES: Role[] = ["customer_owner", "customer_admin", "customer_member", "customer_viewer"];

const inviteSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  role: z.enum(["customer_admin", "customer_member", "customer_viewer"]),
});

export async function inviteMemberAction(
  _prev: OrgFormState | null,
  formData: FormData,
): Promise<OrgFormState> {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/sign-in");

  try {
    requirePermission(ctx, "members.invite");
  } catch {
    return { error: "Your role cannot invite members." };
  }

  const parsed = inviteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  const { email, role } = parsed.data;

  const user = await store.first("users", (u) => u.email === email);
  if (!user) {
    // Email invitations are not configured in this environment.
    return {
      fieldErrors: {
        email: ["No account exists for this email. Ask them to sign up, then invite them."],
      },
    };
  }

  const existing = await store.first(
    "memberships",
    (m) => m.organizationId === ctx.organization.id && m.userId === user.id,
  );
  if (existing) return { fieldErrors: { email: ["This person is already a member."] } };

  await store.insert("memberships", {
    id: newId(),
    organizationId: ctx.organization.id,
    userId: user.id,
    role,
    createdAt: new Date().toISOString(),
  });

  await writeAuditLog({
    organizationId: ctx.organization.id,
    actorId: ctx.user.id,
    action: "member.invited",
    resource: "membership",
    resourceId: user.id,
    metadata: { role },
  });
  await notify({
    organizationId: ctx.organization.id,
    userId: user.id,
    kind: "membership",
    title: `You were added to ${ctx.organization.name}`,
    body: `${ctx.user.name} added you as ${formatRole(role)}.`,
    href: "/app/dashboard",
  });

  revalidatePath("/app/organization");
  return { success: `${user.name} added as ${role.replace("customer_", "")}.` };
}

export async function changeMemberRoleAction(
  membershipId: string,
  _prev: OrgFormState | null,
  formData: FormData,
): Promise<OrgFormState> {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/sign-in");

  try {
    requirePermission(ctx, "members.invite");
  } catch {
    return { error: "Your role cannot manage members." };
  }

  const membership = await store.get("memberships", membershipId);
  if (!membership || membership.organizationId !== ctx.organization.id) {
    return { error: "Membership not found." };
  }

  const roleRaw = String(formData.get("role") ?? "");
  if (!CUSTOMER_ROLES.includes(roleRaw as Role)) return { error: "Invalid role." };
  const role = roleRaw as Role;

  if (membership.role === "customer_owner" && role !== "customer_owner") {
    const owners = await store.find(
      "memberships",
      (m) => m.organizationId === ctx.organization.id && m.role === "customer_owner",
    );
    if (owners.length <= 1) return { error: "The organization needs at least one owner." };
  }

  await store.update("memberships", membershipId, { role });
  await writeAuditLog({
    organizationId: ctx.organization.id,
    actorId: ctx.user.id,
    action: "member.role_changed",
    resource: "membership",
    resourceId: membershipId,
    metadata: { role },
  });
  await notify({
    organizationId: ctx.organization.id,
    userId: membership.userId,
    kind: "membership",
    title: "Your role changed",
    body: `${ctx.user.name} set your role in ${ctx.organization.name} to ${formatRole(role)}.`,
    href: "/app/organization",
  });

  revalidatePath("/app/organization");
  return { success: "Role updated." };
}

export async function removeMemberAction(
  membershipId: string,
  prev: OrgFormState | null,
  formData: FormData,
): Promise<OrgFormState> {
  void prev;
  void formData;
  const ctx = await getSessionContext();
  if (!ctx) redirect("/sign-in");

  try {
    requirePermission(ctx, "members.invite");
  } catch {
    return { error: "Your role cannot manage members." };
  }

  const membership = await store.get("memberships", membershipId);
  if (!membership || membership.organizationId !== ctx.organization.id) {
    return { error: "Membership not found." };
  }

  if (membership.userId === ctx.user.id) {
    return { error: "You cannot remove yourself." };
  }
  if (membership.role === "customer_owner") {
    const owners = await store.find(
      "memberships",
      (m) => m.organizationId === ctx.organization.id && m.role === "customer_owner",
    );
    if (owners.length <= 1) return { error: "The organization needs at least one owner." };
  }

  const removedUser = await store.get("users", membership.userId);
  await store.remove("memberships", membershipId);
  await writeAuditLog({
    organizationId: ctx.organization.id,
    actorId: ctx.user.id,
    action: "member.removed",
    resource: "membership",
    resourceId: membershipId,
  });
  await notify({
    organizationId: ctx.organization.id,
    kind: "membership",
    title: `${removedUser?.name ?? "A member"} was removed`,
    body: `${ctx.user.name} removed them from ${ctx.organization.name}.`,
    href: "/app/organization",
  });

  revalidatePath("/app/organization");
  return { success: "Member removed." };
}
