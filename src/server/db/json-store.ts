import "server-only";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
  AgentRecord,
  AgentRunRecord,
  AgentVersionRecord,
  AiRunRecord,
  ApprovalRecord,
  AuditLogRecord,
  AuditRecord,
  AuditRequestRecord,
  AuthAttemptRecord,
  AutomationRecord,
  AutomationVersionRecord,
  ClientRecord,
  DocumentChunkRecord,
  DocumentRecord,
  EvalCaseRecord,
  EvalResultRecord,
  EvalRunRecord,
  EvalSuiteRecord,
  ExecutionLogRecord,
  ExecutionRecord,
  ExecutionStepRecord,
  IncidentRecord,
  IntegrationRecord,
  InvoiceRecord,
  KnowledgeSourceRecord,
  MembershipRecord,
  MetricRecord,
  NotificationRecord,
  OpportunityRecord,
  OrganizationRecord,
  ProjectRecord,
  ReportRecord,
  SessionRecord,
  SubscriptionRecord,
  SystemRecord,
  UsageRecordRecord,
  UserRecord,
} from "./types";

/**
 * Dev data store: one JSON file per collection in `.data/store/`, written
 * atomically (tmp + rename). This is the local/dev adapter — every access goes
 * through typed collection helpers in src/server/* services, so swapping the
 * body of those helpers for Prisma queries leaves call sites unchanged.
 *
 * Production target: PostgreSQL via Prisma (schema is already in prisma/).
 */

const dir = path.join(process.cwd(), ".data", "store");

export interface Collections {
  users: UserRecord;
  organizations: OrganizationRecord;
  memberships: MembershipRecord;
  sessions: SessionRecord;
  systems: SystemRecord;
  automations: AutomationRecord;
  automation_versions: AutomationVersionRecord;
  executions: ExecutionRecord;
  execution_steps: ExecutionStepRecord;
  execution_logs: ExecutionLogRecord;
  approvals: ApprovalRecord;
  audit_logs: AuditLogRecord;
  notifications: NotificationRecord;
  auth_attempts: AuthAttemptRecord;
  audit_requests: AuditRequestRecord;
  integrations: IntegrationRecord;
  metrics: MetricRecord;
  reports: ReportRecord;
  incidents: IncidentRecord;
  agents: AgentRecord;
  agent_versions: AgentVersionRecord;
  agent_runs: AgentRunRecord;
  knowledge_sources: KnowledgeSourceRecord;
  documents: DocumentRecord;
  document_chunks: DocumentChunkRecord;
  usage_records: UsageRecordRecord;
  ai_runs: AiRunRecord;
  eval_suites: EvalSuiteRecord;
  eval_cases: EvalCaseRecord;
  eval_runs: EvalRunRecord;
  eval_results: EvalResultRecord;
  subscriptions: SubscriptionRecord;
  invoices: InvoiceRecord;
  opportunities: OpportunityRecord;
  audits: AuditRecord;
  clients: ClientRecord;
  projects: ProjectRecord;
}

export type CollectionName = keyof Collections;

function fileFor(name: CollectionName): string {
  return path.join(dir, `${name}.json`);
}

async function readCollection<T>(name: CollectionName): Promise<T[]> {
  try {
    const raw = await readFile(fileFor(name), "utf8");
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

async function writeCollection<T>(name: CollectionName, rows: T[]): Promise<void> {
  await mkdir(dir, { recursive: true });
  const tmp = fileFor(name) + `.tmp-${process.pid}-${Date.now()}`;
  await writeFile(tmp, JSON.stringify(rows, null, 2) + "\n", "utf8");
  await rename(tmp, fileFor(name));
}

export const jsonStore = {
  async all<K extends CollectionName>(name: K): Promise<Collections[K][]> {
    return readCollection<Collections[K]>(name);
  },

  async find<K extends CollectionName>(
    name: K,
    predicate: (row: Collections[K]) => boolean,
  ): Promise<Collections[K][]> {
    const rows = await readCollection<Collections[K]>(name);
    return rows.filter(predicate);
  },

  async first<K extends CollectionName>(
    name: K,
    predicate: (row: Collections[K]) => boolean,
  ): Promise<Collections[K] | null> {
    const rows = await readCollection<Collections[K]>(name);
    return rows.find(predicate) ?? null;
  },

  async get<K extends CollectionName>(name: K, id: string): Promise<Collections[K] | null> {
    const rows = (await readCollection<{ id: string }>(name)) as unknown as Collections[K][];
    return rows.find((r) => (r as { id: string }).id === id) ?? null;
  },

  async insert<K extends CollectionName>(name: K, row: Collections[K]): Promise<Collections[K]> {
    const rows = await readCollection<Collections[K]>(name);
    rows.push(row);
    await writeCollection(name, rows);
    return row;
  },

  async update<K extends CollectionName>(
    name: K,
    id: string,
    patch: Partial<Collections[K]>,
  ): Promise<Collections[K] | null> {
    const rows = (await readCollection<{ id: string }>(name)) as unknown as Collections[K][];
    const idx = rows.findIndex((r) => (r as { id: string }).id === id);
    if (idx === -1) return null;
    rows[idx] = { ...rows[idx], ...patch };
    await writeCollection(name, rows);
    return rows[idx];
  },

  /** Update matching rows via a mutator that receives a draft row. */
  async mutate<K extends CollectionName>(
    name: K,
    id: string,
    mutator: (row: Collections[K]) => void,
  ): Promise<Collections[K] | null> {
    const rows = (await readCollection<{ id: string }>(name)) as unknown as Collections[K][];
    const idx = rows.findIndex((r) => (r as { id: string }).id === id);
    if (idx === -1) return null;
    mutator(rows[idx]);
    await writeCollection(name, rows);
    return rows[idx];
  },

  /** Delete a row by id. Returns true when a row was removed. */
  async remove(name: CollectionName, id: string): Promise<boolean> {
    const rows = (await readCollection<{ id: string }>(name)) as unknown as { id: string }[];
    const next = rows.filter((r) => r.id !== id);
    if (next.length === rows.length) return false;
    await writeCollection(name, next);
    return true;
  },

  /** Replace the row matching `predicate`, or append `row` if none matches. */
  async upsert<K extends CollectionName>(
    name: K,
    predicate: (row: Collections[K]) => boolean,
    row: Collections[K],
  ): Promise<Collections[K]> {
    const rows = await readCollection<Collections[K]>(name);
    const idx = rows.findIndex(predicate);
    if (idx === -1) rows.push(row);
    else rows[idx] = row;
    await writeCollection(name, rows);
    return row;
  },
};

/** The persistence interface both adapters implement. */
export type Store = typeof jsonStore;
