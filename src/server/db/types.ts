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
  trigger: "manual";
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
