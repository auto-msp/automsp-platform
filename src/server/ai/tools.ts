import "server-only";
import { addDocument } from "@/server/ai/knowledge";
import { store } from "@/server/db/store";
import { providerByKey } from "@/server/integrations";
import { notify } from "@/server/notifications";
import { openSecret } from "@/server/vault";

/**
 * Agent tool registry + runtime.
 *
 * A tool is something the model can ask to call during an agent run. Two
 * independent gates protect every call, enforced server-side in the runner:
 *
 *  1. Scope — the tool's scope must be listed on the agent *version* that is
 *     running (least privilege, versioned and auditable like instructions).
 *  2. Consequential actions — tools flagged consequential pause the run for a
 *     human approval; the approval pins the EXACT arguments the model asked
 *     for, and approving executes those arguments verbatim, never a
 *     re-generated variant.
 *
 * Security invariants:
 *  - secrets are unsealed only at call time and never enter tool results,
 *    run records, logs, or the client
 *  - every executor is organization-guarded
 *  - tool results fed back to the model are truncated
 */

export interface AgentToolSpec {
  name: string;
  description: string;
  /** scope key granted on agent versions; renderers show this checklist */
  scope: string;
  /** true → human approval before execution (policy: consequential=require_approval) */
  consequential: boolean;
  /** JSON Schema describing the arguments the model must supply */
  inputSchema: Record<string, unknown>;
}

export const AGENT_TOOL_CATALOG: AgentToolSpec[] = [
  {
    name: "http_request",
    description:
      "Call an HTTP endpoint on a connected integration. The stored credential is injected as an auth header from the vault at call time; the secret is never visible to the model or the operator.",
    scope: "integrations.http",
    consequential: true,
    inputSchema: {
      type: "object",
      properties: {
        integrationId: { type: "string", description: "Id of the connected integration credential to authenticate with." },
        url: { type: "string", description: "Absolute http(s) URL to request." },
        method: { type: "string", enum: ["GET", "POST"], description: "HTTP method. Defaults to GET." },
        body: { type: "string", description: "Optional JSON string body for POST requests." },
      },
      required: ["integrationId", "url"],
      additionalProperties: false,
    },
  },
  {
    name: "knowledge_write",
    description:
      "Write a document into one of the organization's knowledge sources. The content is chunked and indexed immediately (semantic when an embeddings-capable provider is configured, lexical otherwise).",
    scope: "knowledge.write",
    consequential: true,
    inputSchema: {
      type: "object",
      properties: {
        sourceId: { type: "string", description: "Id of the knowledge source to write into." },
        filename: { type: "string", description: "File name for the document (e.g. notes.md)." },
        content: { type: "string", description: "Full text content of the document." },
      },
      required: ["sourceId", "filename", "content"],
      additionalProperties: false,
    },
  },
  {
    name: "notify_send",
    description: "Send an in-app notification to the members of the organization.",
    scope: "notifications.send",
    consequential: false,
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Short notification title." },
        body: { type: "string", description: "Notification body text." },
        href: { type: "string", description: "Optional in-app link (e.g. /app/approvals)." },
      },
      required: ["title", "body"],
      additionalProperties: false,
    },
  },
];

export function toolByName(name: string): AgentToolSpec | undefined {
  return AGENT_TOOL_CATALOG.find((t) => t.name === name);
}

/** Tool availability for a set of granted scopes — used to build the provider schema list. */
export function toolsForScopes(scopes: string[]): AgentToolSpec[] {
  const granted = new Set(scopes);
  return AGENT_TOOL_CATALOG.filter((t) => granted.has(t.scope));
}

export interface ToolExecutionContext {
  organizationId: string;
}

export type ToolExecutionResult = { ok: true; resultText: string } | { ok: false; error: string };

const MAX_RESULT_CHARS = 8_000;
const MAX_HTTP_BODY_CHARS = 64 * 1024;

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/**
 * Execute one tool call. The caller (agent runner) has already passed the
 * scope gate and, for consequential tools, the approval gate. Arguments are
 * validated lightly here — the approval payload shows them as-is, so anything
 * malformed must fail loudly rather than be "fixed" silently.
 */
export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  context: ToolExecutionContext,
): Promise<ToolExecutionResult> {
  switch (name) {
    case "http_request":
      return execHttpRequest(args, context);
    case "knowledge_write":
      return execKnowledgeWrite(args, context);
    case "notify_send":
      return execNotifySend(args, context);
    default:
      return { ok: false, error: `Unknown tool "${name}".` };
  }
}

async function execHttpRequest(
  args: Record<string, unknown>,
  context: ToolExecutionContext,
): Promise<ToolExecutionResult> {
  const integrationId = asString(args.integrationId);
  const url = asString(args.url);
  const method = asString(args.method).toUpperCase() === "POST" ? "POST" : "GET";
  const body = asString(args.body);

  if (!integrationId) return { ok: false, error: "integrationId is required." };
  if (!url) return { ok: false, error: "url is required." };
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { ok: false, error: "url is not valid." };
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    return { ok: false, error: "Only http and https URLs are allowed." };
  }
  if (method === "POST" && body.length > MAX_HTTP_BODY_CHARS) {
    return { ok: false, error: `Request body exceeds the ${MAX_HTTP_BODY_CHARS}-character limit.` };
  }

  const integration = await store.get("integrations", integrationId);
  if (!integration || integration.organizationId !== context.organizationId) {
    return { ok: false, error: "Integration not found." };
  }
  if (integration.status !== "active") {
    return { ok: false, error: `Credential "${integration.name}" is revoked.` };
  }
  const secret = await openSecret(integration.sealedSecret);
  if (secret === null) {
    return { ok: false, error: `Credential "${integration.name}" could not be unsealed.` };
  }
  await store.update("integrations", integration.id, { lastUsedAt: new Date().toISOString() });

  const provider = providerByKey(integration.providerKey);
  const headerName = provider?.defaultHeader ?? "Authorization";
  const scheme = provider?.scheme ?? null;
  // The secret goes straight into the request headers. It is never placed in
  // tool results, run records, logs, or anywhere client-visible.
  const headers: Record<string, string> = { "content-type": "application/json" };
  headers[headerName] = scheme ? `${scheme} ${secret}` : secret;

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: method === "POST" && body ? body : undefined,
      signal: AbortSignal.timeout(15_000),
    });
    const text = (await res.text()).slice(0, MAX_RESULT_CHARS);
    return {
      ok: true,
      resultText: `HTTP ${res.status} ${res.statusText}\n\n${text}`,
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "HTTP request failed." };
  }
}

async function execKnowledgeWrite(
  args: Record<string, unknown>,
  context: ToolExecutionContext,
): Promise<ToolExecutionResult> {
  const sourceId = asString(args.sourceId);
  const filename = asString(args.filename);
  const content = asString(args.content);
  if (!sourceId) return { ok: false, error: "sourceId is required." };
  if (!filename) return { ok: false, error: "filename is required." };
  if (!content) return { ok: false, error: "content is required." };
  if (content.length > 200_000) return { ok: false, error: "content exceeds the 200k-character limit." };

  // addDocument is organization-guarded: a source from another organization
  // returns null, never an error that would confirm the id exists.
  const document = await addDocument(context.organizationId, sourceId, { filename, content });
  if (!document) return { ok: false, error: "Knowledge source not found." };
  return {
    ok: true,
    resultText: `Document "${document.filename}" indexed in ${document.chunkCount} chunk(s) (document id ${document.id}).`,
  };
}

async function execNotifySend(
  args: Record<string, unknown>,
  context: ToolExecutionContext,
): Promise<ToolExecutionResult> {
  const title = asString(args.title);
  const body = asString(args.body);
  if (!title) return { ok: false, error: "title is required." };
  if (!body) return { ok: false, error: "body is required." };

  await notify({
    organizationId: context.organizationId,
    kind: "agent",
    title: title.slice(0, 200),
    body: body.slice(0, 2_000),
    href: asString(args.href) || null,
  });
  return { ok: true, resultText: "Notification sent to the organization." };
}
