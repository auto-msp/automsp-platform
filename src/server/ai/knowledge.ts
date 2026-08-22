import "server-only";
import { newId } from "@/server/db/id";
import { store } from "@/server/db/store";
import type { DocumentChunkRecord, DocumentRecord, KnowledgeSourceRecord } from "@/server/db/types";
import { getProvider } from "./provider";

/**
 * Knowledge / retrieval. Documents are pasted text/markdown in this slice;
 * they are chunked at insert time. Retrieval is semantic (provider embeddings,
 * cosine similarity) when an embeddings-capable provider is configured, and
 * lexical (term-frequency cosine) otherwise. Which method served a query is
 * always reported — a lexical result is a real result, but it is not a
 * semantic one and the UI says so.
 *
 * Corpus size is capped for on-the-fly embedding; larger corpora need the
 * pgvector migration (see schema.prisma's DocumentChunk note).
 */

const CHUNK_TARGET = 900;
const CHUNK_OVERLAP = 120;
const SEMANTIC_CORPUS_CAP = 200;

/** Paragraph-aware chunking with a small character overlap between chunks. */
export function chunkText(text: string): string[] {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  const chunks: string[] = [];
  let current = "";
  for (const para of paragraphs) {
    if (current && current.length + para.length + 2 > CHUNK_TARGET) {
      chunks.push(current);
      const tail = current.slice(-CHUNK_OVERLAP);
      current = para.length + CHUNK_OVERLAP > CHUNK_TARGET ? para.slice(0, CHUNK_TARGET) : `${tail}\n\n${para}`;
    } else {
      current = current ? `${current}\n\n${para}` : para;
    }
  }
  if (current) chunks.push(current);
  // Very short documents still index as a single chunk; empty input indexes none.
  return chunks;
}

// ── Sources & documents ─────────────────────────────────────────────────────

export async function listSources(organizationId: string): Promise<
  (KnowledgeSourceRecord & { documentCount: number; chunkCount: number })[]
> {
  const sources = await store.query("knowledge_sources", { organizationId });
  const documents = await store.all("documents");
  const bySource = new Map<string, { docs: number; chunks: number }>();
  for (const doc of documents) {
    const entry = bySource.get(doc.sourceId) ?? { docs: 0, chunks: 0 };
    entry.docs += 1;
    entry.chunks += doc.chunkCount;
    bySource.set(doc.sourceId, entry);
  }
  return sources
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .map((s) => ({
      ...s,
      documentCount: bySource.get(s.id)?.docs ?? 0,
      chunkCount: bySource.get(s.id)?.chunks ?? 0,
    }));
}

export async function getSource(organizationId: string, id: string): Promise<KnowledgeSourceRecord | null> {
  const source = await store.get("knowledge_sources", id);
  if (!source || source.organizationId !== organizationId) return null;
  return source;
}

export async function createSource(organizationId: string, name: string): Promise<KnowledgeSourceRecord> {
  const now = new Date().toISOString();
  const source: KnowledgeSourceRecord = {
    id: newId(),
    organizationId,
    name,
    kind: "upload",
    createdAt: now,
    updatedAt: now,
  };
  await store.insert("knowledge_sources", source);
  return source;
}

export async function deleteSource(organizationId: string, id: string): Promise<boolean> {
  const source = await getSource(organizationId, id);
  if (!source) return false;
  const docs = await store.query("documents", { sourceId: id });
  for (const doc of docs) {
    const chunks = await store.query("document_chunks", { documentId: doc.id });
    for (const chunk of chunks) await store.remove("document_chunks", chunk.id);
    await store.remove("documents", doc.id);
  }
  await store.remove("knowledge_sources", id);
  return true;
}

export async function listDocuments(sourceId: string): Promise<DocumentRecord[]> {
  const documents = await store.query("documents", { sourceId });
  return documents.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

/**
 * Paste a document into a source: chunk immediately, embed when a provider
 * supports it (embeddings are stored by the JSON adapter; the Postgres
 * adapter re-embeds on the fly until pgvector lands).
 */
export async function addDocument(
  organizationId: string,
  sourceId: string,
  { filename, content }: { filename: string; content: string },
): Promise<DocumentRecord | null> {
  const source = await getSource(organizationId, sourceId);
  if (!source) return null;

  const now = new Date().toISOString();
  const isMarkdown = /\.md|markdown/i.test(filename);
  const document: DocumentRecord = {
    id: newId(),
    sourceId,
    filename,
    mimeType: isMarkdown ? "text/markdown" : "text/plain",
    storageKey: "inline:pasted",
    version: 1,
    status: "indexed",
    chunkCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  const texts = chunkText(content);
  const provider = getProvider();
  let embeddings: number[][] | null = null;
  if (provider?.supportsEmbeddings && provider.embed && texts.length > 0) {
    try {
      embeddings = await provider.embed(texts);
    } catch {
      // Embedding failure is not fatal: the document still indexes lexically
      // and the retrieval method label will say "lexical" honestly.
      embeddings = null;
    }
  }

  const chunks: DocumentChunkRecord[] = texts.map((text, ordinal) => ({
    id: newId(),
    documentId: document.id,
    ordinal,
    content: text,
    embedding: embeddings?.[ordinal] ?? null,
    createdAt: now,
  }));
  for (const chunk of chunks) await store.insert("document_chunks", chunk);
  await store.insert("documents", { ...document, chunkCount: chunks.length });
  return { ...document, chunkCount: chunks.length };
}

export async function deleteDocument(organizationId: string, sourceId: string, documentId: string): Promise<boolean> {
  const source = await getSource(organizationId, sourceId);
  if (!source) return false;
  const doc = await store.get("documents", documentId);
  if (!doc || doc.sourceId !== sourceId) return false;
  const chunks = await store.query("document_chunks", { documentId: documentId });
  for (const chunk of chunks) await store.remove("document_chunks", chunk.id);
  await store.remove("documents", documentId);
  return true;
}

// ── Retrieval ───────────────────────────────────────────────────────────────

export interface RetrievedChunk {
  chunkId: string;
  documentId: string;
  documentName: string;
  content: string;
  score: number;
}

export interface RetrievalResult {
  method: "semantic" | "lexical";
  chunks: RetrievedChunk[];
  /** true when the semantic path was capped by corpus size */
  capped: boolean;
}

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
}

const STOP = new Set(["the", "a", "an", "and", "or", "of", "to", "in", "is", "for", "on", "with", "by", "at", "as", "it", "this", "that", "are", "be", "was", "were"]);

function termFreq(text: string): Map<string, number> {
  const map = new Map<string, number>();
  for (const raw of text.toLowerCase().split(/[^a-z0-9]+/)) {
    if (raw.length < 3 || STOP.has(raw)) continue;
    map.set(raw, (map.get(raw) ?? 0) + 1);
  }
  return map;
}

function lexicalScore(query: Map<string, number>, chunk: Map<string, number>): number {
  let dot = 0;
  let nq = 0;
  let nc = 0;
  for (const v of query.values()) nq += v * v;
  for (const v of chunk.values()) nc += v * v;
  for (const [term, q] of query) dot += q * (chunk.get(term) ?? 0);
  return nq && nc ? dot / (Math.sqrt(nq) * Math.sqrt(nc)) : 0;
}

/**
 * Retrieve the top-K chunks for a query. Tries semantic first (requires an
 * embeddings-capable provider); falls back to lexical when embeddings are
 * unavailable — the returned `method` names the method actually used.
 */
export async function retrieve(
  organizationId: string,
  { query, sourceId, topK }: { query: string; sourceId?: string; topK: number },
): Promise<RetrievalResult> {
  const sources = await store.query("knowledge_sources", { organizationId });
  const sourceIds = new Set(sources.map((s) => s.id));
  if (sourceId) {
    if (!sourceIds.has(sourceId)) return { method: "lexical", chunks: [], capped: false };
    for (const id of [...sourceIds]) if (id !== sourceId) sourceIds.delete(id);
  }
  const documents = (await store.all("documents")).filter((d) => sourceIds.has(d.sourceId));
  const names = new Map(documents.map((d) => [d.id, d.filename]));
  const allChunks = (await store.all("document_chunks")).filter((c) => {
    const doc = documents.find((d) => d.id === c.documentId);
    return Boolean(doc);
  });
  if (allChunks.length === 0 || !query.trim()) return { method: "lexical", chunks: [], capped: false };

  const provider = getProvider();
  if (provider?.supportsEmbeddings && provider.embed) {
    const capped = allChunks.length > SEMANTIC_CORPUS_CAP;
    const corpus = allChunks.slice(0, SEMANTIC_CORPUS_CAP);
    try {
      const stored = corpus.map((c) => c.embedding);
      let vectors: number[][];
      if (stored.every((e) => Array.isArray(e) && e.length > 0)) {
        vectors = stored as number[][];
      } else {
        // Any missing vector (e.g. Postgres adapter without pgvector) → re-embed on the fly.
        vectors = await provider.embed(corpus.map((c) => c.content));
      }
      const [queryVector] = await provider.embed([query]);
      const scored = corpus.map((chunk, i) => ({
        chunkId: chunk.id,
        documentId: chunk.documentId,
        documentName: names.get(chunk.documentId) ?? "document",
        content: chunk.content,
        score: cosine(queryVector, vectors[i]),
      }));
      scored.sort((a, b) => b.score - a.score);
      return { method: "semantic", chunks: scored.slice(0, topK), capped };
    } catch {
      // fall through to lexical — reported as lexical
    }
  }

  const queryTf = termFreq(query);
  const scored = allChunks.map((chunk) => ({
    chunkId: chunk.id,
    documentId: chunk.documentId,
    documentName: names.get(chunk.documentId) ?? "document",
    content: chunk.content,
    score: lexicalScore(queryTf, termFreq(chunk.content)),
  }));
  scored.sort((a, b) => b.score - a.score);
  return { method: "lexical", chunks: scored.slice(0, topK), capped: false };
}
