import "server-only";

/**
 * AI provider abstraction. Every model call in the platform routes through
 * getProvider() — engine AI steps, the agent playground, evaluation runs, and
 * retrieval embeddings. There is exactly one rule: when no provider key is
 * configured, getProvider() returns null and callers must surface that
 * honestly ("provider not configured"), never simulate output.
 *
 * API keys are read from environment variables on the server only. They are
 * never returned to the client, never written to the store, never logged.
 *
 * Prices below are the providers' public list prices captured 2026-08, used
 * for ESTIMATED cost reporting only — the invoice is the actual.
 */

export type ProviderKey = "anthropic" | "openai" | "google";

export interface ModelInfo {
  key: string;
  label: string;
  providerKey: ProviderKey;
  /** USD per 1M input tokens (list price) */
  inputPer1M: number;
  /** USD per 1M output tokens (list price) */
  outputPer1M: number;
}

export const MODELS: readonly ModelInfo[] = [
  { key: "claude-sonnet-4-5", label: "Claude Sonnet 4.5", providerKey: "anthropic", inputPer1M: 3, outputPer1M: 15 },
  { key: "claude-haiku-4-5", label: "Claude Haiku 4.5", providerKey: "anthropic", inputPer1M: 1, outputPer1M: 5 },
  { key: "gpt-4o", label: "GPT-4o", providerKey: "openai", inputPer1M: 2.5, outputPer1M: 10 },
  { key: "gpt-4o-mini", label: "GPT-4o mini", providerKey: "openai", inputPer1M: 0.15, outputPer1M: 0.6 },
  { key: "gemini-2.0-flash", label: "Gemini 2.0 Flash", providerKey: "google", inputPer1M: 0.1, outputPer1M: 0.4 },
];

export const DEFAULT_MODEL_BY_PROVIDER: Record<ProviderKey, string> = {
  anthropic: "claude-haiku-4-5",
  openai: "gpt-4o-mini",
  google: "gemini-2.0-flash",
};

export function modelInfo(modelKey: string): ModelInfo | null {
  return MODELS.find((m) => m.key === modelKey) ?? null;
}

/** Estimated USD cost at list price; null when the model is not in the catalog. */
export function estimateCostUsd(modelKey: string, promptTokens: number, completionTokens: number): number | null {
  const info = modelInfo(modelKey);
  if (!info) return null;
  return (promptTokens * info.inputPer1M + completionTokens * info.outputPer1M) / 1_000_000;
}

// ── Provider construction ───────────────────────────────────────────────────

const KEY_ENV: Record<ProviderKey, string> = {
  anthropic: "ANTHROPIC_API_KEY",
  openai: "OPENAI_API_KEY",
  google: "GOOGLE_GENERATIVE_AI_API_KEY",
};

export interface CompletionParams {
  model: string;
  system?: string;
  messages: ConversationMessage[];
  /** tools offered to the model; providers without tool support must not receive any */
  tools?: ToolSchema[];
  maxTokens: number;
  temperature: number;
}

/** Tool definition in provider-neutral form, mapped per provider at send time. */
export interface ToolSchema {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface ProviderToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

/**
 * Neutral transcript message. The persisted agent-run transcript
 * (AgentTranscriptMessage) uses the same shape, so the agent runner passes
 * messages straight through; each provider maps them to its wire format here.
 */
export type ConversationMessage =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string; toolCalls?: ProviderToolCall[] }
  | { role: "tool"; toolCallId: string; name: string; content: string };

export interface CompletionResult {
  text: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
  /** tool calls the model requested this turn; absent for a plain-text turn */
  toolCalls?: ProviderToolCall[];
}

export interface AiProvider {
  key: ProviderKey;
  /** Whether this provider can produce embeddings for knowledge retrieval */
  supportsEmbeddings: boolean;
  /** Whether this provider can request tool calls (function calling) */
  supportsTools: boolean;
  complete(params: CompletionParams): Promise<CompletionResult>;
  embed?(texts: string[]): Promise<number[][]>;
}

export interface ProviderStatus {
  configured: boolean;
  provider: ProviderKey | null;
  /** The env var that would enable the first unconfigured provider, for UI hints */
  hintEnv: string;
}

/** Which provider would serve model calls right now (without the key itself). */
export function providerStatus(): ProviderStatus {
  const provider = getProviderKey();
  return { configured: provider !== null, provider, hintEnv: provider ? KEY_ENV[provider] : "ANTHROPIC_API_KEY" };
}

function getProviderKey(): ProviderKey | null {
  const requested = process.env.AUTOMSP_AI_PROVIDER?.trim() as ProviderKey | undefined;
  if (requested && requested in KEY_ENV) {
    return process.env[KEY_ENV[requested]]?.trim() ? requested : null;
  }
  for (const key of ["anthropic", "openai", "google"] as const) {
    if (process.env[KEY_ENV[key]]?.trim()) return key;
  }
  return null;
}

/** The provider for this environment, or null when no key is configured. */
export function getProvider(): AiProvider | null {
  const key = getProviderKey();
  if (!key) return null;
  // Key value is read here and captured in closures; it never leaves this module.
  const apiKey = process.env[KEY_ENV[key]] as string;
  if (key === "anthropic") return anthropicProvider(apiKey);
  if (key === "openai") return openAiProvider(apiKey);
  return googleProvider(apiKey);
}

async function readJson(res: Response): Promise<Record<string, unknown>> {
  const text = await res.text();
  if (!res.ok) {
    // Provider error bodies can echo request metadata — surface status + a
    // short excerpt only, never headers (which may contain the key).
    throw new Error(`Provider request failed (${res.status}): ${text.slice(0, 200)}`);
  }
  return JSON.parse(text) as Record<string, unknown>;
}

function anthropicProvider(apiKey: string): AiProvider {
  return {
    key: "anthropic",
    supportsEmbeddings: false,
    supportsTools: true,
    async complete({ model, system, messages, tools, maxTokens, temperature }) {
      const started = Date.now();
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          system,
          messages: toAnthropicMessages(messages),
          ...(tools?.length
            ? {
                tools: tools.map((t) => ({
                  name: t.name,
                  description: t.description,
                  input_schema: t.inputSchema,
                })),
              }
            : {}),
          max_tokens: maxTokens,
          temperature,
        }),
        signal: AbortSignal.timeout(60_000),
      });
      const data = await readJson(res);
      const content = Array.isArray(data.content)
        ? (data.content as { type?: string; text?: string; id?: string; name?: string; input?: unknown }[])
        : [];
      const usage = (data.usage ?? {}) as { input_tokens?: number; output_tokens?: number };
      const toolCalls = content
        .filter((b) => b.type === "tool_use")
        .map((b) => ({
          id: String(b.id ?? ""),
          name: String(b.name ?? ""),
          arguments: (typeof b.input === "object" && b.input !== null ? b.input : {}) as Record<string, unknown>,
        }));
      return {
        text: content.filter((b) => b.type === "text").map((b) => b.text ?? "").join(""),
        model: String(data.model ?? model),
        promptTokens: usage.input_tokens ?? 0,
        completionTokens: usage.output_tokens ?? 0,
        latencyMs: Date.now() - started,
        ...(toolCalls.length > 0 ? { toolCalls } : {}),
      };
    },
  };
}

/**
 * Anthropic wire format: assistant turns become text + tool_use blocks; tool
 * results ride inside the next user turn as tool_result blocks (consecutive
 * tool messages merge into one user turn).
 */
function toAnthropicMessages(
  messages: ConversationMessage[],
): { role: "user" | "assistant"; content: unknown }[] {
  const out: { role: "user" | "assistant"; content: unknown }[] = [];
  for (const m of messages) {
    if (m.role === "user") {
      out.push({ role: "user", content: m.content });
    } else if (m.role === "assistant") {
      const blocks: Record<string, unknown>[] = [];
      if (m.content) blocks.push({ type: "text", text: m.content });
      for (const tc of m.toolCalls ?? []) {
        blocks.push({ type: "tool_use", id: tc.id, name: tc.name, input: tc.arguments });
      }
      out.push({ role: "assistant", content: blocks.length > 0 ? blocks : [{ type: "text", text: "" }] });
    } else {
      const block = { type: "tool_result", tool_use_id: m.toolCallId, content: m.content };
      const prev = out[out.length - 1];
      if (prev && prev.role === "user" && Array.isArray(prev.content)) {
        (prev.content as Record<string, unknown>[]).push(block);
      } else {
        out.push({ role: "user", content: [block] });
      }
    }
  }
  return out;
}

function openAiProvider(apiKey: string): AiProvider {
  const base = "https://api.openai.com/v1";
  const headers = { "content-type": "application/json", authorization: `Bearer ${apiKey}` };
  return {
    key: "openai",
    supportsEmbeddings: true,
    supportsTools: true,
    async complete({ model, system, messages, tools, maxTokens, temperature }) {
      const started = Date.now();
      const res = await fetch(`${base}/chat/completions`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model,
          messages: [
            ...(system ? [{ role: "system", content: system }] : []),
            ...toOpenAiMessages(messages),
          ],
          ...(tools?.length
            ? {
                tools: tools.map((t) => ({
                  type: "function",
                  function: { name: t.name, description: t.description, parameters: t.inputSchema },
                })),
              }
            : {}),
          max_tokens: maxTokens,
          temperature,
        }),
        signal: AbortSignal.timeout(60_000),
      });
      const data = await readJson(res);
      const choices = Array.isArray(data.choices)
        ? (data.choices as {
            message?: {
              content?: string | null;
              tool_calls?: { id?: string; function?: { name?: string; arguments?: string } }[];
            };
          }[])
        : [];
      const usage = (data.usage ?? {}) as { prompt_tokens?: number; completion_tokens?: number };
      const message = choices[0]?.message;
      const toolCalls = (message?.tool_calls ?? []).map((tc) => {
        let args: Record<string, unknown> = {};
        try {
          const parsed: unknown = JSON.parse(tc.function?.arguments ?? "{}");
          if (typeof parsed === "object" && parsed !== null) args = parsed as Record<string, unknown>;
        } catch {
          // malformed arguments JSON → empty args; the tool executor validates
        }
        return { id: String(tc.id ?? ""), name: String(tc.function?.name ?? ""), arguments: args };
      });
      return {
        text: message?.content ?? "",
        model: String(data.model ?? model),
        promptTokens: usage.prompt_tokens ?? 0,
        completionTokens: usage.completion_tokens ?? 0,
        latencyMs: Date.now() - started,
        ...(toolCalls.length > 0 ? { toolCalls } : {}),
      };
    },
    async embed(texts) {
      const res = await fetch(`${base}/embeddings`, {
        method: "POST",
        headers,
        body: JSON.stringify({ model: "text-embedding-3-small", input: texts }),
        signal: AbortSignal.timeout(30_000),
      });
      const data = await readJson(res);
      const rows = Array.isArray(data.data) ? (data.data as { embedding: number[] }[]) : [];
      return rows.map((r) => r.embedding);
    },
  };
}

function toOpenAiMessages(messages: ConversationMessage[]): Record<string, unknown>[] {
  return messages.map((m) => {
    if (m.role === "user") return { role: "user", content: m.content };
    if (m.role === "tool") {
      return { role: "tool", tool_call_id: m.toolCallId, name: m.name, content: m.content };
    }
    return {
      role: "assistant",
      content: m.content || null,
      ...(m.toolCalls?.length
        ? {
            tool_calls: m.toolCalls.map((tc) => ({
              id: tc.id,
              type: "function",
              function: { name: tc.name, arguments: JSON.stringify(tc.arguments) },
            })),
          }
        : {}),
    };
  });
}

function googleProvider(apiKey: string): AiProvider {
  const base = "https://generativelanguage.googleapis.com/v1beta";
  const headers = { "content-type": "application/json", "x-goog-api-key": apiKey };
  return {
    key: "google",
    supportsEmbeddings: true,
    // Tool calling is not implemented for Gemini in this release — the agent
    // runner checks supportsTools and reports the limitation honestly instead
    // of silently dropping granted tools.
    supportsTools: false,
    async complete({ model, system, messages, maxTokens, temperature }) {
      const started = Date.now();
      const res = await fetch(`${base}/models/${model}:generateContent`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
          contents: messages.map((m) => ({ role: m.role, parts: [{ text: m.content }] })),
          generationConfig: { maxOutputTokens: maxTokens, temperature },
        }),
        signal: AbortSignal.timeout(60_000),
      });
      const data = await readJson(res);
      const candidates = Array.isArray(data.candidates)
        ? (data.candidates as { content?: { parts?: { text?: string }[] } }[])
        : [];
      const usage = (data.usageMetadata ?? {}) as { promptTokenCount?: number; candidatesTokenCount?: number };
      return {
        text: (candidates[0]?.content?.parts ?? []).map((p) => p.text ?? "").join(""),
        model,
        promptTokens: usage.promptTokenCount ?? 0,
        completionTokens: usage.candidatesTokenCount ?? 0,
        latencyMs: Date.now() - started,
      };
    },
    async embed(texts) {
      const res = await fetch(`${base}/models/text-embedding-004:batchEmbedContents`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          requests: texts.map((text) => ({ model: "models/text-embedding-004", content: { parts: [{ text }] } })),
        }),
        signal: AbortSignal.timeout(30_000),
      });
      const data = await readJson(res);
      const rows = Array.isArray(data.embeddings) ? (data.embeddings as { values: number[] }[]) : [];
      return rows.map((r) => r.values);
    },
  };
}
