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
  /**
   * Sandbox mode (default true): agent runs execute end-to-end but every
   * consequential outbound action stays gated behind approvals, and nightly
   * cycles record reports without dispatching anything external. Flipping it
   * off is an explicit owner action and is audit-logged.
   */
  sandboxMode?: boolean;
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

/** workflow = engine approval node; agent_tool = consequential agent tool call */
export type ApprovalKind = "workflow" | "agent_tool";

export interface ApprovalRecord {
  id: string;
  organizationId: string;
  kind: ApprovalKind;
  /** set for workflow approvals; null for agent-tool approvals */
  executionId: string | null;
  /** set for agent_tool approvals; null for workflow approvals */
  agentRunId: string | null;
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

// ── Operations: metrics, reports, incidents ──────────────────────────────────

/** Never blur these three — every metric carries its basis. */
export type MetricBasis = "actual" | "estimated" | "projected";

export interface MetricRecord {
  id: string;
  organizationId: string;
  /** e.g. executions_total | success_rate | hours_saved | ai_cost_usd | projected_monthly_savings_usd */
  key: string;
  value: number;
  basis: MetricBasis;
  periodStart: string;
  periodEnd: string;
  /** source + method, per ROI transparency rules (shown to the reader) */
  calculation: { source: string; method: string } | null;
  createdAt: string;
}

export type ReportType =
  | "weekly_ops"
  | "monthly_impact"
  | "system_health"
  | "morning_brief"
  | "automation_performance"
  | "ai_cost"
  | "incident";

export interface ReportRecord {
  id: string;
  organizationId: string;
  type: ReportType;
  periodStart: string;
  periodEnd: string;
  /** structured sections — title, narrative, kpis, and a metric breakdown with basis labels */
  payload: unknown;
  storageKey: string | null;
  createdAt: string;
}

export type IncidentStatus = "open" | "investigating" | "mitigated" | "resolved";

export interface IncidentRecord {
  id: string;
  organizationId: string;
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  status: IncidentStatus;
  rootCause: string | null;
  startedAt: string;
  resolvedAt: string | null;
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
  /** tool scopes granted to this version (see AGENT_TOOL_CATALOG in server/ai/tools) */
  permissionScopes: string[];
  approvalPolicy: AgentApprovalPolicy;
  limits: AgentLimits;
  createdAt: string;
  createdBy: string | null;
}

// ── Agent tool runs ─────────────────────────────────────────────────────────

/** One tool call the model asked for (provider-reported, before any gating). */
export interface AgentToolCallRecord {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

/** Outcome of one attempted tool execution inside a run. */
export interface AgentToolInvocationRecord {
  call: AgentToolCallRecord;
  status: "executed" | "denied_scope" | "failed" | "skipped";
  /** truncated (≤ chars) tool result text fed back to the model */
  resultPreview: string | null;
  error: string | null;
  /** approval id when this invocation was authorized by a human decision */
  approvalId: string | null;
  latencyMs: number;
  createdAt: string;
}

/** Neutral transcript message — mapped to each provider's wire format at send time. */
export type AgentTranscriptMessage =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string; toolCalls?: AgentToolCallRecord[] }
  | { role: "tool"; toolCallId: string; name: string; content: string };

export type AgentRunStatus =
  | "running"
  | "waiting_approval"
  | "completed"
  | "failed"
  | "rejected";

export interface AgentRunRecord {
  id: string;
  organizationId: string;
  agentId: string;
  agentVersionId: string;
  status: AgentRunStatus;
  /** transcript so far; tool messages carry tool results back to the model */
  messages: AgentTranscriptMessage[];
  invocations: AgentToolInvocationRecord[];
  /** tool calls awaiting a decision or execution (approval-gated) */
  pendingToolCalls: AgentToolCallRecord[];
  finalText: string | null;
  error: string | null;
  turns: number;
  maxTurns: number;
  // playground (manual) | nightly-cycle (scheduled orchestrator pass)
  source: "playground" | "nightly-cycle";
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
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

export type AiRunSource = "playground" | "workflow" | "evaluation" | "agent";

export interface AiRunRecord {
  id: string;
  organizationId: string;
  agentId: string | null;
  executionId: string | null;
  evalRunId: string | null;
  /** the agent run this model call belongs to, when source = "agent" */
  agentRunId: string | null;
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

// ── Shared rate limiting ────────────────────────────────────────────────────
// Global (not tenant-scoped): key = endpoint + client address.

export interface RateLimitBucketRecord {
  key: string;
  count: number;
  resetAt: string;
}

// ── Commercial: billing, opportunities, audits, clients, projects ──────────

export type SubscriptionStatus = "trialing" | "active" | "past_due" | "cancelled";

export interface SubscriptionRecord {
  id: string;
  organizationId: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  planKey: string;
  status: SubscriptionStatus;
  currency: string;
  currentPeriodEnd: string | null;
  createdAt: string;
  updatedAt: string;
}

export type InvoiceStatus = "draft" | "open" | "paid" | "void" | "uncollectible";

export interface InvoiceRecord {
  id: string;
  organizationId: string;
  stripeInvoiceId: string | null;
  status: InvoiceStatus;
  currency: string;
  amountDueCents: number;
  amountPaidCents: number;
  dueAt: string | null;
  paidAt: string | null;
  createdAt: string;
}

export type OpportunityStage =
  | "new"
  | "qualified"
  | "discovery"
  | "audit"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

export interface OpportunityRecord {
  id: string;
  organizationId: string;
  company: string;
  contactName: string | null;
  contactEmail: string | null;
  source: string | null;
  industry: string | null;
  size: string | null;
  estimatedValue: number | null;
  stage: OpportunityStage;
  probability: number | null;
  expectedClose: string | null;
  owner: string | null;
  notes: string | null;
  nextAction: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
}

export type AuditStatus = "received" | "in_review" | "scheduled" | "completed" | "declined";

export interface AuditRecord {
  id: string;
  organizationId: string;
  company: string;
  contactName: string;
  contactEmail: string;
  phone: string | null;
  role: string | null;
  companySize: string | null;
  industry: string | null;
  aiUsage: string | null;
  currentSystems: string | null;
  bottlenecks: string | null;
  processVolume: string | null;
  desiredOutcomes: string | null;
  status: AuditStatus;
  /** identified opportunities, scored: businessImpact × frequency × feasibility × strategicFit */
  findings: unknown;
  priorityScore: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClientRecord {
  id: string;
  organizationId: string;
  name: string;
  industry: string | null;
  size: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
}

export type ProjectStage =
  | "lead"
  | "discovery"
  | "audit"
  | "proposal"
  | "approved"
  | "design"
  | "build"
  | "testing"
  | "deployment"
  | "managed_operations"
  | "expansion";

export interface ProjectRecord {
  id: string;
  organizationId: string;
  clientId: string | null;
  name: string;
  stage: ProjectStage;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
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
