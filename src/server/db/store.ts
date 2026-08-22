import "server-only";
import type { CollectionName, Store } from "./json-store";

/**
 * Store selector. One interface, two adapters:
 *
 *  - DATABASE_URL set   → PostgreSQL via Prisma (src/server/db/prisma-store.ts)
 *  - DATABASE_URL unset → local JSON files in .data/store/ (src/server/db/json-store.ts)
 *
 * The Prisma adapter is imported lazily so a cold dev environment never pays
 * for it — and the build never requires the generated client when the JSON
 * store is in use. Which adapter is active is reported by /api/health.
 */

export type { CollectionName, Collections, Store } from "./json-store";

const usePostgres = Boolean(process.env.DATABASE_URL?.trim());

let resolved: Store | null = null;

async function impl(): Promise<Store> {
  if (resolved) return resolved;
  if (usePostgres) {
    const { prismaStore } = await import("./prisma-store");
    resolved = prismaStore;
  } else {
    const { jsonStore } = await import("./json-store");
    resolved = jsonStore;
  }
  return resolved;
}

function forward<K extends keyof Store>(method: K): Store[K] {
  return ((...args: unknown[]) =>
    impl().then((s) => (s[method] as (...a: unknown[]) => unknown)(...args))) as Store[K];
}

export const store: Store = {
  all: forward("all"),
  find: forward("find"),
  first: forward("first"),
  query: forward("query"),
  get: forward("get"),
  insert: forward("insert"),
  update: forward("update"),
  mutate: forward("mutate"),
  remove: forward("remove"),
  upsert: forward("upsert"),
};

/** Which persistence adapter is live — surfaced by /api/health. */
export function activeStoreKind(): "postgres" | "json-file" {
  return usePostgres ? "postgres" : "json-file";
}

/** Convenience re-export so new code can import names from one place. */
export type { CollectionName as Collection };
