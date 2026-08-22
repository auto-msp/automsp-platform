import "server-only";
import { newId } from "@/server/db/id";
import { store } from "@/server/db/store";
import type { AiRunRecord, AiRunSource, UsageMeter } from "@/server/db/types";
import { estimateCostUsd } from "./provider";

/**
 * AI usage & cost tracking. Every provider call — workflow step, playground
 * run, evaluation case, retrieval embed — writes one AiRunRecord plus usage
 * meter rows. Token counts are ACTUAL (reported by the provider); the USD
 * figure is ESTIMATED (list price × tokens) and labeled as such everywhere it
 * renders. Calls that fail still record a row with status "failed".
 */

const PREVIEW_LEN = 400;

export interface RecordAiRunInput {
  organizationId: string;
  agentId?: string | null;
  executionId?: string | null;
  evalRunId?: string | null;
  agentRunId?: string | null;
  source: AiRunSource;
  provider: string;
  model: string;
  status: "completed" | "failed";
  inputText?: string | null;
  outputText?: string | null;
  promptTokens?: number;
  completionTokens?: number;
  latencyMs?: number;
  retrievalMethod?: "semantic" | "lexical" | null;
  retrievalChunks?: number | null;
  error?: string | null;
}

export async function recordAiRun(input: RecordAiRunInput): Promise<AiRunRecord> {
  const now = new Date().toISOString();
  const promptTokens = input.promptTokens ?? 0;
  const completionTokens = input.completionTokens ?? 0;
  const costEstimatedUsd = estimateCostUsd(input.model, promptTokens, completionTokens);

  const record: AiRunRecord = {
    id: newId(),
    organizationId: input.organizationId,
    agentId: input.agentId ?? null,
    executionId: input.executionId ?? null,
    evalRunId: input.evalRunId ?? null,
    agentRunId: input.agentRunId ?? null,
    source: input.source,
    provider: input.provider,
    model: input.model,
    status: input.status,
    inputPreview: input.inputText ? input.inputText.slice(0, PREVIEW_LEN) : null,
    outputPreview: input.outputText ? input.outputText.slice(0, PREVIEW_LEN) : null,
    promptTokens,
    completionTokens,
    costEstimatedUsd,
    latencyMs: input.latencyMs ?? 0,
    retrievalMethod: input.retrievalMethod ?? null,
    retrievalChunks: input.retrievalChunks ?? null,
    error: input.error ? input.error.slice(0, 200) : null,
    createdAt: now,
  };
  await store.insert("ai_runs", record);

  if (input.status === "completed" && promptTokens + completionTokens > 0) {
    await insertMeter(input.organizationId, "tokens", promptTokens + completionTokens);
  }
  await insertMeter(input.organizationId, "agent_runs", 1);
  return record;
}

async function insertMeter(organizationId: string, meter: UsageMeter, quantity: number): Promise<void> {
  await store.insert("usage_records", {
    id: newId(),
    organizationId,
    meter,
    quantity,
    unitCostCents: null,
    recordedAt: new Date().toISOString(),
  });
}

export interface UsageSummary {
  callsCompleted: number;
  callsFailed: number;
  tokensIn: number;
  tokensOut: number;
  /** null when no run had a priced model — shown honestly as "not computable" */
  costEstimatedUsd: number | null;
  byModel: { model: string; calls: number; tokens: number }[];
  bySource: { source: string; calls: number }[];
}

export async function usageSummary(organizationId: string): Promise<UsageSummary> {
  const runs = await store.find("ai_runs", (r) => r.organizationId === organizationId);
  const byModel = new Map<string, { calls: number; tokens: number }>();
  const bySource = new Map<string, number>();
  let tokensIn = 0;
  let tokensOut = 0;
  let cost = 0;
  let anyCost = false;
  let completed = 0;
  let failed = 0;

  for (const run of runs) {
    if (run.status === "completed") completed += 1;
    else failed += 1;
    tokensIn += run.promptTokens;
    tokensOut += run.completionTokens;
    if (run.costEstimatedUsd !== null) {
      cost += run.costEstimatedUsd;
      anyCost = true;
    }
    const m = byModel.get(run.model) ?? { calls: 0, tokens: 0 };
    m.calls += 1;
    m.tokens += run.promptTokens + run.completionTokens;
    byModel.set(run.model, m);
    bySource.set(run.source, (bySource.get(run.source) ?? 0) + 1);
  }

  return {
    callsCompleted: completed,
    callsFailed: failed,
    tokensIn,
    tokensOut,
    costEstimatedUsd: anyCost ? cost : null,
    byModel: [...byModel.entries()].map(([model, v]) => ({ model, ...v })).sort((a, b) => b.calls - a.calls),
    bySource: [...bySource.entries()].map(([source, calls]) => ({ source, calls })).sort((a, b) => b.calls - a.calls),
  };
}

export async function listAiRuns(
  organizationId: string,
  { agentId, limit }: { agentId?: string; limit?: number } = {},
): Promise<AiRunRecord[]> {
  const runs = await store.find(
    "ai_runs",
    (r) => r.organizationId === organizationId && (!agentId || r.agentId === agentId),
  );
  return runs.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, limit ?? 50);
}
