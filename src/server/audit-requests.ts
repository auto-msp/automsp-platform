import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { AuditRequestInput } from "@/lib/validation";

export type AuditRequestRecord = AuditRequestInput & {
  id: string;
  status: "received";
  createdAt: string;
};

const storeDir = path.join(process.cwd(), ".data");
const storeFile = path.join(storeDir, "audit-requests.json");

async function readStore(): Promise<AuditRequestRecord[]> {
  try {
    const raw = await readFile(storeFile, "utf8");
    return JSON.parse(raw) as AuditRequestRecord[];
  } catch {
    return [];
  }
}

/**
 * Persistence adapter for audit requests.
 *
 * Current implementation: JSON file store in `.data/` so the funnel works
 * end-to-end in any environment. When DATABASE_URL + Prisma are configured
 * (Phase 5 — Commercial), swap this implementation for a Prisma write while
 * keeping the same function signature.
 */
export async function createAuditRequest(
  input: AuditRequestInput,
): Promise<AuditRequestRecord> {
  const record: AuditRequestRecord = {
    ...input,
    id: randomUUID(),
    status: "received",
    createdAt: new Date().toISOString(),
  };

  await mkdir(storeDir, { recursive: true });
  const records = await readStore();
  records.push(record);
  await writeFile(storeFile, JSON.stringify(records, null, 2) + "\n", "utf8");

  return record;
}
