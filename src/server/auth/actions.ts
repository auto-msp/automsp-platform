"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { z } from "zod";
import { store } from "@/server/db/store";
import type { AuditLogRecord, Role } from "@/server/db/types";
import { hashPassword, verifyPassword } from "./password";
import { createSession, destroySession } from "./session";

const signUpSchema = z.object({
  name: z.string().trim().min(2, "Your name is required").max(200),
  email: z.string().trim().toLowerCase().email("A valid email is required").max(254),
  password: z
    .string()
    .min(10, "Password must be at least 10 characters")
    .max(200)
    .refine((s) => /[a-zA-Z]/.test(s) && /[0-9]/.test(s), "Use letters and numbers"),
  company: z.string().trim().min(2, "Company name is required").max(200),
});

const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

export type AuthFormState = { error?: string; fieldErrors?: Record<string, string[]> } | null;

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

async function writeAudit(entry: Omit<AuditLogRecord, "id" | "createdAt">): Promise<void> {
  await store.insert("audit_logs", {
    ...entry,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  });
}

// ── Sign up ─────────────────────────────────────────────────────────────────

export async function signUp(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "Please review the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { name, email, password, company } = parsed.data;

  const existing = await store.first("users", (u) => u.email === email);
  if (existing) {
    return { error: "An account with this email already exists.", fieldErrors: { email: ["Already registered"] } };
  }

  const now = new Date().toISOString();
  const user = await store.insert("users", {
    id: randomUUID(),
    email,
    name,
    passwordHash: hashPassword(password),
    createdAt: now,
  });

  let slug = slugify(company);
  for (let i = 2; await store.first("organizations", (o) => o.slug === slug); i += 1) {
    slug = `${slugify(company)}-${i}`;
  }

  const org = await store.insert("organizations", {
    id: randomUUID(),
    name: company,
    slug,
    kind: "customer",
    createdAt: now,
    updatedAt: now,
  });

  await store.insert("memberships", {
    id: randomUUID(),
    organizationId: org.id,
    userId: user.id,
    role: "customer_owner" satisfies Role,
    createdAt: now,
  });

  await writeAudit({
    organizationId: org.id,
    actorId: user.id,
    action: "user.sign_up",
    resource: "organization",
    resourceId: org.id,
    metadata: { slug },
  });

  await createSession(user.id);
  redirect("/app/onboarding");
}

// ── Sign in ─────────────────────────────────────────────────────────────────
// Brute-force throttle: lock after 8 consecutive failures for 15 minutes.

const MAX_FAILURES = 8;
const LOCK_MINUTES = 15;

export async function signIn(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "Enter your email and password.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { email, password } = parsed.data;

  const attempt = await store.first("auth_attempts", (a) => a.email === email);
  if (attempt?.lockedUntil && new Date(attempt.lockedUntil).getTime() > Date.now()) {
    return { error: "Too many attempts. Try again in a few minutes." };
  }

  const user = await store.first("users", (u) => u.email === email);
  const ok = user ? verifyPassword(password, user.passwordHash) : false;

  if (!ok) {
    // Same message whether the email exists or not — no account enumeration.
    const failures = (attempt?.failures ?? 0) + 1;
    const lockedUntil =
      failures >= MAX_FAILURES
        ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000).toISOString()
        : null;
    await store.upsert(
      "auth_attempts",
      (a) => a.email === email,
      { email, failures, lockedUntil },
    );
    await writeAudit({
      organizationId: null,
      actorId: null,
      action: "user.sign_in_failed",
      resource: "user",
      resourceId: null,
      metadata: { failures },
    });
    return { error: "Incorrect email or password." };
  }

  // From here on the user definitely exists — verification above passed.
  if (!user) {
    return { error: "Incorrect email or password." };
  }

  // Success clears the throttle.
  if (attempt) {
    await store.upsert(
      "auth_attempts",
      (a) => a.email === email,
      { email, failures: 0, lockedUntil: null },
    );
  }

  await writeAudit({
    organizationId: null,
    actorId: user.id,
    action: "user.sign_in",
    resource: "user",
    resourceId: user.id,
  });

  await createSession(user.id);
  redirect("/app/dashboard");
}

// ── Sign out ────────────────────────────────────────────────────────────────

export async function signOut(): Promise<void> {
  await destroySession();
  redirect("/");
}
