import "server-only";
import { store } from "@/server/db/store";
import type { KnowledgeSourceRecord } from "@/server/db/types";
import { addDocument, createSource, deleteSource, listSources } from "@/server/ai/knowledge";
import { runAgentCompletion } from "@/server/ai/agents";

/**
 * Research & Strategy engine.
 *
 * Generates the five grounding documents every growth agent reads before it
 * drafts a word: product info, marketing strategy, competitor analysis,
 * brand voice, and content strategy. Documents land in a dedicated knowledge
 * source so retrieval scopes them per organization automatically.
 *
 * Honesty rules carried over from the rest of the AI layer:
 *  - no provider configured → the run reports `notConfigured`, nothing is faked
 *  - a document that fails generation is reported per-document; the pipeline
 *    continues with the remaining documents rather than throwing away the run
 *  - every completion is recorded as an AiRun with its estimated cost, so
 *    research spend is visible in usage reporting like every other model call
 *
 * Grounding chain: each document prompt includes the previously generated
 * documents verbatim, so brand voice is consistent with positioning and the
 * content plan inherits both. Later documents never contradict earlier ones
 * silently — they are instructed to flag conflicts instead.
 */

export const STRATEGY_SOURCE_PREFIX = "Strategy";

export interface StrategyDocSpec {
  key: string;
  title: string;
  instruction: string;
}

export const STRATEGY_DOCS: readonly StrategyDocSpec[] = [
  {
    key: "product-info",
    title: "Product Information",
    instruction:
      "Write the Product Information document. Sections: What It Does; Product Category; Key Features; Who It Is For; What Makes It Different. State only what the provided material supports — where information is missing, write an explicit 'TO VERIFY' line with the question an operator should answer.",
  },
  {
    key: "marketing-strategy",
    title: "Marketing Strategy",
    instruction:
      "Using the Product Information above, write the Marketing Strategy document. Sections: Positioning Statement; Ideal Customer Profile (2-3 segments); Core Messages Per Segment; Channels Ranked With Rationale; 30-Day Plan (weekly milestones). Mark every claim that depends on unverified market data as ASSUMPTION.",
  },
  {
    key: "competitor-analysis",
    title: "Competitor Analysis",
    instruction:
      "Using the Product Information above, write the Competitor Analysis document. For each competitor you can name with confidence: Positioning, Apparent Strengths, Apparent Weaknesses, How This Business Differs. You do not have live web access in this step — name only competitors already present in the provided material or well-known in the stated category, label the rest 'research required', and date nothing you cannot verify.",
  },
  {
    key: "brand-voice",
    title: "Brand Voice Guide",
    instruction:
      "Using the Product Information and Marketing Strategy above, write the Brand Voice Guide. Sections: Voice Pillars (3-5 adjectives with do/don't examples); Tone By Channel; Vocabulary (words we use / words we avoid); Example Rewrite (take one plain sentence and rewrite it three ways). The guide must be specific enough that another writer produces indistinguishable copy.",
  },
  {
    key: "content-strategy",
    title: "Content Strategy",
    instruction:
      "Using all prior documents, write the Content Strategy document. Sections: Content Pillars (3-4 themes tied to ICP problems); Channel Plan (what format belongs where); Publishing Cadence; First 10 Assets (title + pillar + channel + target keyword); Measurement (the two metrics that prove content works here). Flag any conflict you perceive between earlier documents instead of silently resolving it.",
  },
] as const;

export interface StrategyRunInput {
  businessName: string;
  website?: string | null;
  description: string;
  audience?: string | null;
}

export interface StrategyDocResult {
  key: string;
  title: string;
  status: "generated" | "failed" | "skipped_no_provider";
  documentId?: string;
  filename?: string;
  error?: string;
  costEstimatedUsd?: number | null;
}

export interface StrategyRunResult {
  ok: boolean;
  notConfigured?: boolean;
  sourceId?: string;
  sourceName?: string;
  docs: StrategyDocResult[];
  error?: string;
}

function buildPrompt(spec: StrategyDocSpec, input: StrategyRunInput, priorDocs: string): string {
  const material = [
    `Business name: ${input.businessName}`,
    input.website ? `Website: ${input.website}` : null,
    `What the business does: ${input.description}`,
    input.audience ? `Known audience notes: ${input.audience}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return [
    "You are generating one grounding document for a business's growth agents.",
    "",
    "<business_material>",
    material,
    "</business_material>",
    ...(priorDocs ? ["<previously_generated_documents>", priorDocs, "</previously_generated_documents>"] : []),
    "",
    spec.instruction,
    "",
    "Output markdown only — no preamble, no closing commentary.",
  ].join("\n");
}

async function findStrategySource(organizationId: string, businessName: string): Promise<KnowledgeSourceRecord | null> {
  const sources = await listSources(organizationId);
  return sources.find((s) => s.name === `${STRATEGY_SOURCE_PREFIX} — ${businessName}`) ?? null;
}

/**
 * Generate (or regenerate) the five strategy documents for a business.
 * Regeneration replaces the previous strategy source wholesale so agents
 * never retrieve stale grounding next to fresh.
 */
export async function generateStrategyDocs(
  organizationId: string,
  input: StrategyRunInput,
  createdBy: string,
): Promise<StrategyRunResult> {
  const probe = await runAgentCompletion({
    organizationId,
    prompt: "ping",
    source: "workflow",
  });
  if (!probe.ok && probe.notConfigured) {
    return { ok: false, notConfigured: true, docs: [], error: probe.error };
  }

  // Replace-any-existing semantics: one canonical strategy source per business.
  const existing = await findStrategySource(organizationId, input.businessName);
  if (existing) await deleteSource(organizationId, existing.id);
  const source = await createSource(organizationId, `${STRATEGY_SOURCE_PREFIX} — ${input.businessName}`);
  // Mark the source kind as web-derived research when a website was provided.
  if (input.website) {
    await store.update("knowledge_sources", source.id, { kind: "web", updatedAt: new Date().toISOString() });
  }

  const results: StrategyDocResult[] = [];
  const priorDocs: string[] = [];

  for (const spec of STRATEGY_DOCS) {
    const result = await runAgentCompletion({
      organizationId,
      prompt: buildPrompt(spec, input, priorDocs.join("\n\n---\n\n")),
      source: "workflow",
    });

    if (!result.ok) {
      results.push({ key: spec.key, title: spec.title, status: "failed", error: result.error });
      continue;
    }

    const filename = `strategy/${spec.key}.md`;
    const doc = await addDocument(organizationId, source.id, { filename, content: result.text });
    priorDocs.push(`# ${spec.title}\n\n${result.text}`);
    results.push({
      key: spec.key,
      title: spec.title,
      status: "generated",
      documentId: doc?.id,
      filename,
      costEstimatedUsd: result.costEstimatedUsd,
    });
  }

  const generated = results.filter((r) => r.status === "generated").length;
  void createdBy;
  return {
    ok: generated > 0,
    sourceId: source.id,
    sourceName: source.name,
    docs: results,
    ...(generated === 0 ? { error: "No strategy documents could be generated." } : {}),
  };
}

/** List strategy runs for an org: one row per strategy knowledge source. */
export async function listStrategyRuns(organizationId: string): Promise<
  { source: KnowledgeSourceRecord; documentCount: number; docs: { id: string; filename: string }[] }[]
> {
  const sources = await listSources(organizationId);
  const strategySources = sources.filter((s) => s.name.startsWith(`${STRATEGY_SOURCE_PREFIX} — `));
  const out = [];
  for (const source of strategySources) {
    const docs = await store.query("documents", { sourceId: source.id });
    out.push({
      source,
      documentCount: docs.length,
      docs: docs.map((d) => ({ id: d.id, filename: d.filename })),
    });
  }
  return out;
}
