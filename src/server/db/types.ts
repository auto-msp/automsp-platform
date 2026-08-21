/**
 * Persistence types for the dev store.
 * Field names mirror the Prisma schema (prisma/schema.prisma) so the swap to
 * Postgres is mechanical: same entities, same seams in src/server/*.
 */

export type Role =
  | "platform_owner"
  | "automsp_admin"
  | "automsp_operator"
  | "automsp_analyst"
  | "customer_owner"
  | "customer_admin"
  | "customer_member"
  | "customer_viewer";

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
}

export interface OrganizationRecord {
  id: string;
  name: string;
  slug: string;
  kind: "automsp" | "customer";
  industry?: string;
  size?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MembershipRecord {
  id: string;
  organizationId: string;
  userId: string;
  role: Role;
  createdAt: string;
}

export interface SessionRecord {
  id: string;
  /** sha256 of the bearer token — raw token never stored */
  tokenHash: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
}

export type SystemStatus = "healthy" | "warning" | "paused" | "incident" | "draft";

export interface SystemRecord {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  status: SystemStatus;
  businessOutcome: string;
  ownerName: string;
  createdAt: string;
  updatedAt: string;
}

export type AutomationStatus = "draft" | "active" | "paused" | "archived";

export interface AutomationRecord {
  id: string;
  organizationId: string;
  systemId: string | null;
  name: string;
  description: string;
  status: AutomationStatus;
  /** estimated minutes of human work avoided per completed run (user-supplied) */
  estMinutesPerRun: number;
  /** next due time when the trigger is a schedule; null for manual/disabled */
  nextRunAt: string | null;
  /** last time the scheduler started a run for this automation */
  lastScheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type NodeType =
  | "trigger"
  | "condition"
  | "template"
  | "approval"
  | "log"
  | "output"
  | "ai"
  | "http";

export interface WorkflowNodeRecord {
  key: string;
  type: NodeType;
  /** type-specific config; validated by the engine before a run */
  config: Record<string, unknown>;
}

export interface WorkflowEdgeRecord {
  from: string;
  to: string;
  /** for condition nodes: "true" | "false"; omit for unconditional */
  condition?: string;
}

export interface WorkflowDefinition {
  nodes: WorkflowNodeRecord[];
  edges: WorkflowEdgeRecord[];
}

export interface AutomationVersionRecord {
  id: string;
  automationId: string;
  version: number;
  definition: WorkflowDefinition;
  createdAt: string;
  createdBy: string;
}

export type ExecutionStatus =
  | "queued"
  | "running"
  | "waiting"
  | "completed"
  | "failed"
  | "cancelled";

export interface ExecutionLogRecord {
  id: string;
  executionId: string;
  level: "info" | "warn" | "error";
  message: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface ExecutionStepRecord {
  id: string;
  executionId: string;
  nodeKey: string;
  status: "running" | "completed" | "failed" | "waiting";
  input?: unknown;
  output?: unknown;
  error?: string;
  startedAt: string;
  finishedAt?: string;
}

export interface ExecutionRecord {
  id: string;
  organizationId: string;
  automationId: string;
  automationName: string;
  version: number;
  status: ExecutionStatus;
  trigger: "manual" | "schedule";
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  idempotencyKey?: string;
  /** engine cursor when paused at an approval node */
  resume?: { nodeKey: string; context: Record<string, unknown> };
  startedAt: string;
  finishedAt?: string;
  createdAt: string;
}

export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface ApprovalRecord {
  id: string;
  organizationId: string;
  executionId: string;
  action: string;
  rationale: string;
  payload: Record<string, unknown>;
  riskLevel: "low" | "medium" | "high";
  status: ApprovalStatus;
  reviewerId?: string;
  decidedAt?: string;
  decisionNote?: string;
  createdAt: string;
}

export interface AuditLogRecord {
  id: string;
  organizationId: string | null;
  actorId: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface NotificationRecord {
  id: string;
  organizationId: string;
  userId: string | null;
  kind: string;
  title: string;
  body: string;
  href: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface AuthAttemptRecord {
  email: string;
  failures: number;
  lockedUntil: string | null;
}

export type IntegrationStatus = "active" | "revoked";

/**
 * A connected integration. The secret is sealed with AES-256-GCM under the
 * vault key (AUTOMSP_VAULT_KEY, or the gitignored dev key file); the plaintext
 * never lives in this record and never reaches the frontend.
 */
export interface IntegrationRecord {
  id: string;
  organizationId: string;
  /** catalog key, e.g. "slack", "hubspot", "generic-http" */
  providerKey: string;
  name: string;
  authType: "api_token" | "header_secret";
  status: IntegrationStatus;
  /** base64(iv | authTag | ciphertext) — see server/vault.ts */
  sealedSecret: string;
  /** last 4 characters of the secret, for operator recognition only */
  secretPreview: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastUsedAt: string | null;
}

export interface AuditRequestRecord {
  id: string;
  company: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  companySize: string;
  industry: string;
  currentSystems?: string;
  bottlenecks: string;
  aiUsage: string;
  processVolume?: string;
  outcomes?: string;
  status: "received" | "in_review" | "scheduled" | "completed" | "declined";
  createdAt: string;
}

// ── AI agents ───────────────────────────────────────────────────────────────

export type AgentStatus = "draft" | "testing" | "approved" | "production" | "paused" | "archived";

export interface AgentRecord {
  id: string;
  organizationId: string;
  systemId: string | null;
  name: string;
  purpose: string | null;
  description: string;
  status: AgentStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
}

export interface AgentApprovalPolicy {
  /** consequential agent actions pause for human approval — always on */
  consequentialActions: "require_approval";
}

export interface AgentLimits {
  maxOutputTokens: number;
  timeoutMs: number;
}

export interface AgentVersionRecord {
  id: string;
  agentId: string;
  version: number;
  model: string;
  systemInstructions: string;
  /** tool scopes granted to this version; tools ship in a later slice */
  permissionScopes: string[];
  approvalPolicy: AgentApprovalPolicy;
  limits: AgentLimits;
  createdAt: string;
  createdBy: string | null;
}

// ── Knowledge / RAG ─────────────────────────────────────────────────────────

export interface KnowledgeSourceRecord {
  id: string;
  organizationId: string;
  name: string;
  /** "upload" now; web/integration ingestion is a later slice */
  kind: "upload" | "web" | "integration";
  createdAt: string;
  updatedAt: string;
}

export type DocumentStatus = "indexed" | "failed";

export interface DocumentRecord {
  id: string;
  sourceId: string;
  filename: string;
  mimeType: string;
  /** inline:pasted — object storage (S3) is a later slice */
  storageKey: string;
  version: number;
  status: DocumentStatus;
  chunkCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentChunkRecord {
  id: string;
  documentId: string;
  ordinal: number;
  content: string;
  /**
   * Embedding vector, when an embeddings-capable provider was configured at
   * indexing time. JSON adapter stores it inline; the Postgres adapter keeps
   * embeddings out of this table until the pgvector migration lands, so the
   * field reads null there and retrieval re-embeds on the fly.
   */
  embedding: number[] | null;
  createdAt: string;
}

// ── AI usage & cost ─────────────────────────────────────────────────────────

export type AiRunSource = "playground" | "workflow" | "evaluation";

export interface AiRunRecord {
  id: string;
  organizationId: string;
  agentId: string | null;
  executionId: string | null;
  evalRunId: string | null;
  source: AiRunSource;
  provider: string;
  model: string;
  status: "completed" | "failed";
  /** truncated (≤400 chars) previews for debugging; org-internal only */
  inputPreview: string | null;
  outputPreview: string | null;
  promptTokens: number;
  completionTokens: number;
  /** list-price estimate in USD; null when the model has no catalog price */
  costEstimatedUsd: number | null;
  latencyMs: number;
  retrievalMethod: "semantic" | "lexical" | null;
  retrievalChunks: number | null;
  error: string | null;
  createdAt: string;
}

export type UsageMeter = "tokens" | "agent_runs" | "executions";

export interface UsageRecordRecord {
  id: string;
  organizationId: string;
  meter: UsageMeter;
  quantity: number;
  unitCostCents: number | null;
  recordedAt: string;
}

// ── Evaluations ─────────────────────────────────────────────────────────────

export type EvalScorer = "exact" | "contains" | "llm_judge";

export interface EvalSuiteRecord {
  id: string;
  organizationId: string;
  agentId: string | null;
  name: string;
  description: string;
  scorer: EvalScorer;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
}

export interface EvalCaseRecord {
  id: string;
  suiteId: string;
  input: string;
  expected: string;
  createdAt: string;
}

export type EvalRunStatus = "completed" | "failed" | "blocked";

export interface EvalRunRecord {
  id: string;
  organizationId: string;
  suiteId: string;
  agentId: string | null;
  model: string | null;
  scorerUsed: string | null;
  status: EvalRunStatus;
  total: number;
  passed: number;
  failed: number;
  blockedReason: string | null;
  startedAt: string;
  completedAt: string | null;
  createdBy: string | null;
}

export interface EvalResultRecord {
  id: string;
  runId: string;
  caseId: string;
  output: string | null;
  passed: boolean | null;
  reason: string | null;
  latencyMs: number | null;
  createdAt: string;
}
