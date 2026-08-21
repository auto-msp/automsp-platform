import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import type { CollectionName, Collections, Store } from "./json-store";
import type { WorkflowDefinition } from "./types";

/**
 * PostgreSQL adapter, selected by DATABASE_URL in store.ts.
 *
 * It implements exactly the JSON store's interface. Predicate-based lookups
 * (`find`/`first`) currently resolve in application memory after a
 * `findMany()` — correctness is identical and tenant guards still apply
 * because the same service-layer code runs; pushing predicates into SQL
 * `where` clauses is the performance follow-up, not a semantic change.
 *
 * Conversions at this boundary:
 *  - Date columns ⇄ ISO strings (the app's records use ISO 8601 strings)
 *  - nullable columns ⇄ null (records keep `| null` types) — optional (`?`)
 *    record fields become `undefined`
 *  - `undefined` in UPDATE patches means "clear this column" → null
 *  - JSON columns pass through untouched
 */

type Row = Record<string, unknown>;

interface Delegate {
  findMany(): Promise<Row[]>;
  findUnique(args: { where: Row }): Promise<Row | null>;
  create(args: { data: Row }): Promise<Row>;
  update(args: { where: Row; data: Row }): Promise<Row>;
  delete(args: { where: Row }): Promise<Row>;
}

// ── Client singleton (hot-reload safe) ──────────────────────────────────────

const GLOBAL_KEY = "__automsp_prisma__";

function client(): PrismaClient {
  const g = globalThis as Record<string, unknown>;
  if (!g[GLOBAL_KEY]) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("prisma-store requires DATABASE_URL");
    g[GLOBAL_KEY] = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
  }
  return g[GLOBAL_KEY] as PrismaClient;
}

function delegate(name: CollectionName): Delegate {
  const map: Record<CollectionName, string> = {
    users: "user",
    organizations: "organization",
    memberships: "organizationMember",
    sessions: "session",
    systems: "system",
    automations: "automation",
    automation_versions: "automationVersion",
    executions: "execution",
    execution_steps: "executionStep",
    execution_logs: "executionLog",
    approvals: "approval",
    audit_logs: "auditLog",
    notifications: "notification",
    auth_attempts: "authAttempt",
    audit_requests: "auditRequest",
    integrations: "integrationConnection",
  };
  const pk: Partial<Record<CollectionName, string>> = { auth_attempts: "email" };
  const clientRow = client() as unknown as Record<string, Delegate>;
  const d = clientRow[map[name]];
  return new Proxy({} as Delegate, {
    get: (_t, method: string) => {
      if (method === "__pk") return pk[name] ?? "id";
      const fn = d?.[method as keyof Delegate] as unknown;
      if (typeof fn !== "function") return undefined;
      // keep the receiver — Prisma delegate methods may rely on it
      return (...args: unknown[]) => (fn as (...a: unknown[]) => unknown).apply(d, args);
    },
  });
}

// ── Conversion helpers ───────────────────────────────────────────────────────

function toIso(value: unknown): string | null {
  if (value instanceof Date) return value.toISOString();
  if (value === null || value === undefined) return null;
  return String(value);
}

/** Convert listed keys Date→ISO; returns a shallow copy. */
function dates(row: Row, fields: readonly string[]): Row {
  const out = { ...row };
  for (const f of fields) out[f] = toIso(out[f]);
  return out;
}

/** Fill required string fields with "" when the column is NULL. */
function fill(row: Row, fields: readonly string[]): Row {
  const out = { ...row };
  for (const f of fields) if (out[f] === null || out[f] === undefined) out[f] = "";
  return out;
}

/** null → undefined for fields the app's records declare optional (`?`). */
function opt(row: Row, fields: readonly string[]): Row {
  const out = { ...row };
  for (const f of fields) if (out[f] === null) out[f] = undefined;
  return out;
}

function strip(row: Row, fields: readonly string[]): Row {
  const out = { ...row };
  for (const f of fields) delete out[f];
  return out;
}

// ── Per-collection row ⇄ column mapping ─────────────────────────────────────

const D = (r: Row, ...extra: string[]) =>
  dates(r, ["createdAt", "updatedAt", ...extra]);

const FROM: { [K in CollectionName]: (row: Row) => Collections[K] } = {
  users: (r) =>
    fill(dates(r, ["createdAt", "updatedAt"]), ["name", "passwordHash", "email"]) as unknown as Collections["users"],
  organizations: (r) => D(r) as unknown as Collections["organizations"],
  memberships: (r) =>
    dates(r, ["createdAt", "updatedAt"]) as unknown as Collections["memberships"],
  sessions: (r) => dates(r, ["createdAt", "expiresAt"]) as unknown as Collections["sessions"],
  systems: (r) =>
    fill(dates(r, ["createdAt", "updatedAt"]), ["description", "businessOutcome", "ownerName"]) as unknown as Collections["systems"],
  automations: (r) =>
    fill(dates(r, ["createdAt", "updatedAt", "nextRunAt", "lastScheduledAt"]), ["description"]) as unknown as Collections["automations"],
  automation_versions: (r) => {
    const base = fill(dates(r, ["createdAt"]), ["createdBy"]);
    base.definition =
      base.definition && typeof base.definition === "object"
        ? (base.definition as WorkflowDefinition)
        : { nodes: [], edges: [] };
    return base as unknown as Collections["automation_versions"];
  },
  executions: (r) => {
    const base = fill(dates(r, ["createdAt", "startedAt", "finishedAt"]), ["automationName"]);
    base.trigger = base.trigger === "schedule" ? "schedule" : "manual";
    if (base.input === null || base.input === undefined) base.input = {};
    if (typeof base.error !== "string") base.error = base.error ? String(base.error) : undefined;
    if (base.version === null || base.version === undefined) base.version = 0;
    return opt(base, ["output", "error", "idempotencyKey", "resume"]) as unknown as Collections["executions"];
  },
  execution_steps: (r) =>
    opt(dates(r, ["startedAt", "finishedAt"]), ["input", "output", "error"]) as unknown as Collections["execution_steps"],
  execution_logs: (r) =>
    opt(dates(r, ["createdAt"]), ["metadata"]) as unknown as Collections["execution_logs"],
  approvals: (r) => {
    const base = fill(dates(r, ["createdAt", "decidedAt"]), ["rationale"]);
    if (base.payload === null || base.payload === undefined) base.payload = {};
    if (!["low", "medium", "high"].includes(String(base.riskLevel))) base.riskLevel = "medium";
    return opt(base, ["reviewerId", "decidedAt", "decisionNote"]) as unknown as Collections["approvals"];
  },
  audit_logs: (r) =>
    opt(dates(r, ["createdAt"]), ["metadata"]) as unknown as Collections["audit_logs"],
  notifications: (r) =>
    fill(dates(r, ["createdAt", "readAt"]), ["body"]) as unknown as Collections["notifications"],
  auth_attempts: (r) => dates(r, ["lockedUntil"]) as unknown as Collections["auth_attempts"],
  audit_requests: (r) =>
    opt(dates(r, ["createdAt"]), ["phone", "currentSystems", "processVolume", "outcomes"]) as unknown as Collections["audit_requests"],
  integrations: (r) => {
    const base = fill(dates(r, ["createdAt", "updatedAt", "lastUsedAt"]), [
      "name",
      "sealedSecret",
      "secretPreview",
    ]);
    base.providerKey = base.providerKey ?? "generic-http";
    base.authType = base.authType === "header_secret" ? "header_secret" : "api_token";
    base.status = base.status === "revoked" ? "revoked" : "active";
    return strip(base, ["scopes", "credentialRef", "lastSyncAt", "integrationId"]) as unknown as Collections["integrations"];
  },
};

/** undefined patch values mean "clear the column" in the JSON store → null. */
function toData(data: Row): Row {
  const out: Row = {};
  for (const [k, v] of Object.entries(data)) out[k] = v === undefined ? null : v;
  return out;
}

function toCreate<K extends CollectionName>(name: K, row: Collections[K]): Row {
  const data = toData(row as unknown as Row);
  if (name === "integrations") data.scopes = []; // required column, unused at v1
  return data;
}

// ── The adapter ──────────────────────────────────────────────────────────────

function pkOf(name: CollectionName): string {
  return (delegate(name) as unknown as { __pk: string }).__pk;
}

export const prismaStore: Store = {
  async all(name) {
    const rows = await delegate(name).findMany();
    return rows.map((r) => FROM[name](r));
  },

  async find(name, predicate) {
    const rows = await delegate(name).findMany();
    const mapped = rows.map((r) => FROM[name](r));
    return mapped.filter(predicate);
  },

  async first(name, predicate) {
    const rows = await delegate(name).findMany();
    const mapped = rows.map((r) => FROM[name](r));
    return mapped.find(predicate) ?? null;
  },

  async get(name, id) {
    const row = await delegate(name).findUnique({ where: { [pkOf(name)]: id } });
    return row ? FROM[name](row) : null;
  },

  async insert(name, row) {
    const created = await delegate(name).create({ data: toCreate(name, row) });
    return FROM[name](created);
  },

  async update(name, id, patch) {
    const d = delegate(name);
    const exists = await d.findUnique({ where: { [pkOf(name)]: id } });
    if (!exists) return null;
    const updated = await d.update({
      where: { [pkOf(name)]: id },
      data: toData(patch as unknown as Row),
    });
    return FROM[name](updated);
  },

  async mutate(name, id, mutator) {
    const d = delegate(name);
    const row = await d.findUnique({ where: { [pkOf(name)]: id } });
    if (!row) return null;
    const record = FROM[name](row);
    mutator(record);
    const updated = await d.update({
      where: { [pkOf(name)]: id },
      data: toData(record as unknown as Row),
    });
    return FROM[name](updated);
  },

  async remove(name, id) {
    const d = delegate(name);
    const exists = await d.findUnique({ where: { [pkOf(name)]: id } });
    if (!exists) return false;
    await d.delete({ where: { [pkOf(name)]: id } });
    return true;
  },

  async upsert(name, predicate, row) {
    const d = delegate(name);
    const rows = await d.findMany();
    const mapped = rows.map((r) => FROM[name](r));
    const existing = mapped.find(predicate);
    if (!existing) {
      const created = await d.create({ data: toCreate(name, row) });
      return FROM[name](created);
    }
    const existingId = (existing as { id?: string; email?: string }).id ?? (existing as { email: string }).email;
    const updated = await d.update({
      where: { [pkOf(name)]: existingId },
      data: toData(row as unknown as Row),
    });
    return FROM[name](updated);
  },
};
