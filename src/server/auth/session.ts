import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { store } from "@/server/db/store";
import type {
  MembershipRecord,
  OrganizationRecord,
  Role,
  SessionRecord,
  UserRecord,
} from "@/server/db/types";
import { hasPermission, type Permission } from "./permissions";

const COOKIE_NAME = "automsp_session";
const SESSION_DAYS = 30;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export interface SessionContext {
  user: UserRecord;
  organization: OrganizationRecord;
  membership: MembershipRecord;
}

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  const record: SessionRecord = {
    id: randomBytes(12).toString("base64url"),
    tokenHash: hashToken(token),
    userId,
    expiresAt: expires.toISOString(),
    createdAt: now.toISOString(),
  };
  await store.insert("sessions", record);

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (token) {
    const hash = hashToken(token);
    const existing = await store.first("sessions", (s) => s.tokenHash === hash);
    if (existing) {
      // mark expired rather than delete — sessions are also an audit trail
      await store.update("sessions", existing.id, { expiresAt: new Date().toISOString() });
    }
  }
  jar.delete(COOKIE_NAME);
}

/**
 * Resolve the current session to user + organization + membership.
 * Returns null when unauthenticated or when the user has no organization.
 * Tenant scoping: every service below requires this context, so no resource
 * is ever fetched without an organization boundary.
 */
export async function getSessionContext(): Promise<SessionContext | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const hash = hashToken(token);
  const session = await store.first("sessions", (s) => s.tokenHash === hash);
  if (!session) return null;
  if (new Date(session.expiresAt).getTime() < Date.now()) return null;

  const user = await store.get("users", session.userId);
  if (!user) return null;

  const memberships = await store.find("memberships", (m) => m.userId === user.id);
  if (memberships.length === 0) return null;

  // Active organization selection: first membership for now; org switching
  // (multi-org users) is a later slice and will carry orgId in the session.
  const membership = memberships[0];
  const organization = await store.get("organizations", membership.organizationId);
  if (!organization) return null;

  return { user, organization, membership };
}

export function requirePermission(ctx: SessionContext, permission: Permission): void {
  if (!hasPermission(ctx.membership.role, permission)) {
    throw new Error(`Forbidden: role ${ctx.membership.role} lacks permission "${permission}"`);
  }
}

export function can(ctx: SessionContext, permission: Permission): boolean {
  return hasPermission(ctx.membership.role, permission);
}

export type { Role };
