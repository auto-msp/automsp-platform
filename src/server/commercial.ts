import "server-only";
import { newId } from "@/server/db/id";
import { store } from "@/server/db/store";
import type {
  AuditRecord,
  AuditStatus,
  ClientRecord,
  OpportunityRecord,
  OpportunityStage,
  ProjectRecord,
  ProjectStage,
} from "@/server/db/types";
import type { AuditRequestInput } from "@/lib/validation";

/**
 * The AutoMSP commercial workspace: inbound audit requests, the opportunity
 * pipeline, clients, and delivery projects. This is AutoMSP's own operations
 * tenant — distinct from a customer's platform workspace. Tenant rule applies
 * unchanged: every record carries organizationId and every query filters on it.
 *
 * The marketing "Book an audit" funnel writes an Audit into the AutoMSP
 * operator organization. Nothing is simulated: a pipeline card only exists
 * when a real person submitted the form or an operator recorded one.
 */

export const OPPORTUNITY_STAGES: { key: OpportunityStage; label: string }[] = [
  { key: "new", label: "New" },
  { key: "qualified", label: "Qualified" },
  { key: "discovery", label: "Discovery" },
  { key: "audit", label: "Audit" },
  { key: "proposal", label: "Proposal" },
  { key: "negotiation", label: "Negotiation" },
  { key: "won", label: "Won" },
  { key: "lost", label: "Lost" },
];

export const AUDIT_STATUSES: { key: AuditStatus; label: string }[] = [
  { key: "received", label: "Received" },
  { key: "in_review", label: "In review" },
  { key: "scheduled", label: "Scheduled" },
  { key: "completed", label: "Completed" },
  { key: "declined", label: "Declined" },
];

export const PROJECT_STAGES: { key: ProjectStage; label: string }[] = [
  { key: "lead", label: "Lead" },
  { key: "discovery", label: "Discovery" },
  { key: "audit", label: "Audit" },
  { key: "proposal", label: "Proposal" },
  { key: "approved", label: "Approved" },
  { key: "design", label: "Design" },
  { key: "build", label: "Build" },
  { key: "testing", label: "Testing" },
  { key: "deployment", label: "Deployment" },
  { key: "managed_operations", label: "Managed operations" },
  { key: "expansion", label: "Expansion" },
];

/** AutoMSP's operations tenant — where the commercial pipeline lives. */
export async function getAutomspOrg() {
  return store.first("organizations", (o) => o.kind === "automsp");
}

// ── Audits (inbound funnel inbox) ───────────────────────────────────────────

/**
 * Record a marketing-funnel audit request. Writes into the AutoMSP operator
 * org. Returns null when no operator org is provisioned — the caller surfaces
 * an honest failure rather than dropping the request silently.
 */
export async function createAuditFromFunnel(input: AuditRequestInput): Promise<AuditRecord | null> {
  const org = await getAutomspOrg();
  if (!org) return null;
  const now = new Date().toISOString();
  const record: AuditRecord = {
    id: newId(),
    organizationId: org.id,
    company: input.company,
    contactName: input.name,
    contactEmail: input.email,
    phone: input.phone || null,
    role: input.role || null,
    companySize: input.companySize || null,
    industry: input.industry || null,
    aiUsage: input.aiUsage || null,
    currentSystems: input.currentSystems || null,
    bottlenecks: input.bottlenecks || null,
    processVolume: input.processVolume || null,
    desiredOutcomes: input.outcomes || null,
    status: "received",
    findings: null,
    priorityScore: null,
    createdAt: now,
    updatedAt: now,
  };
  await store.insert("audits", record);
  // an inbound audit is a lead — open a matching opportunity card
  await createOpportunity(org.id, {
    company: input.company,
    contactName: input.name,
    contactEmail: input.email,
    source: "audit-funnel",
    industry: input.industry || null,
    size: input.companySize || null,
    stage: "new",
    nextAction: "Review audit request",
  });
  return record;
}

export async function listAudits(organizationId: string): Promise<AuditRecord[]> {
  const rows = await store.find("audits", (a) => a.organizationId === organizationId);
  return rows.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function getAudit(organizationId: string, id: string): Promise<AuditRecord | null> {
  const row = await store.get("audits", id);
  return row && row.organizationId === organizationId ? row : null;
}

export async function setAuditStatus(
  organizationId: string,
  id: string,
  status: AuditStatus,
  patch: { findings?: unknown; priorityScore?: number | null } = {},
): Promise<AuditRecord | null> {
  const existing = await getAudit(organizationId, id);
  if (!existing) return null;
  return store.update("audits", id, {
    status,
    ...(patch.findings !== undefined ? { findings: patch.findings } : {}),
    ...(patch.priorityScore !== undefined ? { priorityScore: patch.priorityScore } : {}),
    updatedAt: new Date().toISOString(),
  });
}

// ── Opportunities (pipeline) ────────────────────────────────────────────────

export interface OpportunityInput {
  company: string;
  contactName?: string | null;
  contactEmail?: string | null;
  source?: string | null;
  industry?: string | null;
  size?: string | null;
  estimatedValue?: number | null;
  stage?: OpportunityStage;
  probability?: number | null;
  expectedClose?: string | null;
  owner?: string | null;
  notes?: string | null;
  nextAction?: string | null;
}

export async function createOpportunity(
  organizationId: string,
  input: OpportunityInput,
  createdBy: string | null = null,
): Promise<OpportunityRecord> {
  const now = new Date().toISOString();
  const record: OpportunityRecord = {
    id: newId(),
    organizationId,
    company: input.company,
    contactName: input.contactName ?? null,
    contactEmail: input.contactEmail ?? null,
    source: input.source ?? null,
    industry: input.industry ?? null,
    size: input.size ?? null,
    estimatedValue: input.estimatedValue ?? null,
    stage: input.stage ?? "new",
    probability: input.probability ?? null,
    expectedClose: input.expectedClose ?? null,
    owner: input.owner ?? null,
    notes: input.notes ?? null,
    nextAction: input.nextAction ?? null,
    createdAt: now,
    updatedAt: now,
    createdBy,
  };
  await store.insert("opportunities", record);
  return record;
}

export async function listOpportunities(organizationId: string): Promise<OpportunityRecord[]> {
  const rows = await store.find("opportunities", (o) => o.organizationId === organizationId);
  return rows.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

export async function getOpportunity(
  organizationId: string,
  id: string,
): Promise<OpportunityRecord | null> {
  const row = await store.get("opportunities", id);
  return row && row.organizationId === organizationId ? row : null;
}

export async function updateOpportunity(
  organizationId: string,
  id: string,
  patch: Partial<OpportunityInput>,
): Promise<OpportunityRecord | null> {
  const existing = await getOpportunity(organizationId, id);
  if (!existing) return null;
  return store.update("opportunities", id, {
    ...patch,
    updatedAt: new Date().toISOString(),
  });
}

// ── Pipeline rollup (all values are user-entered estimates — labeled) ───────

export interface PipelineSummary {
  openCount: number;
  /** sum of estimatedValue for open stages; null when none carry a value */
  estimatedPipelineUsd: number | null;
  /** probability-weighted; an estimate derived from two user-entered numbers */
  weightedPipelineUsd: number | null;
  byStage: { stage: OpportunityStage; label: string; count: number }[];
}

const OPEN_STAGES: OpportunityStage[] = ["new", "qualified", "discovery", "audit", "proposal", "negotiation"];

export function summarizePipeline(opportunities: OpportunityRecord[]): PipelineSummary {
  const open = opportunities.filter((o) => OPEN_STAGES.includes(o.stage));
  let est = 0;
  let anyEst = false;
  let weighted = 0;
  let anyWeighted = false;
  for (const o of open) {
    if (o.estimatedValue !== null) {
      est += o.estimatedValue;
      anyEst = true;
      if (o.probability !== null && o.probability >= 0) {
        weighted += o.estimatedValue * (o.probability / 100);
        anyWeighted = true;
      }
    }
  }
  return {
    openCount: open.length,
    estimatedPipelineUsd: anyEst ? Math.round(est * 100) / 100 : null,
    weightedPipelineUsd: anyWeighted ? Math.round(weighted * 100) / 100 : null,
    byStage: OPPORTUNITY_STAGES.map((s) => ({
      stage: s.key,
      label: s.label,
      count: opportunities.filter((o) => o.stage === s.key).length,
    })),
  };
}

// ── Clients & projects ──────────────────────────────────────────────────────

export async function listClients(organizationId: string): Promise<ClientRecord[]> {
  const rows = await store.find("clients", (c) => c.organizationId === organizationId);
  return rows.sort((a, b) => a.name.localeCompare(b.name));
}

export async function createClient(
  organizationId: string,
  input: { name: string; industry?: string | null; size?: string | null },
  createdBy: string | null = null,
): Promise<ClientRecord> {
  const now = new Date().toISOString();
  const record: ClientRecord = {
    id: newId(),
    organizationId,
    name: input.name,
    industry: input.industry ?? null,
    size: input.size ?? null,
    createdAt: now,
    updatedAt: now,
    createdBy,
  };
  await store.insert("clients", record);
  return record;
}

export async function listProjects(organizationId: string): Promise<ProjectRecord[]> {
  const rows = await store.find("projects", (p) => p.organizationId === organizationId);
  return rows.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

export async function createProject(
  organizationId: string,
  input: { name: string; clientId?: string | null; stage?: ProjectStage },
  createdBy: string | null = null,
): Promise<ProjectRecord> {
  const now = new Date().toISOString();
  const record: ProjectRecord = {
    id: newId(),
    organizationId,
    clientId: input.clientId ?? null,
    name: input.name,
    stage: input.stage ?? "lead",
    createdAt: now,
    updatedAt: now,
    createdBy,
  };
  await store.insert("projects", record);
  return record;
}
