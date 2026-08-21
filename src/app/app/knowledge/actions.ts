"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { addDocument, createSource, deleteDocument, retrieve } from "@/server/ai/knowledge";
import { writeAuditLog } from "@/server/audit";
import { getSessionContext, requirePermission } from "@/server/auth/session";

export interface KnowledgeFormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

const sourceSchema = z.object({
  name: z.string().trim().min(2, "Give the source a name").max(120),
});

export async function createSourceAction(
  _prev: KnowledgeFormState | null,
  formData: FormData,
): Promise<KnowledgeFormState> {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/sign-in");
  try {
    requirePermission(ctx, "knowledge.manage");
  } catch {
    return { error: "Your role cannot manage knowledge." };
  }

  const parsed = sourceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  const source = await createSource(ctx.organization.id, parsed.data.name);
  await writeAuditLog({
    organizationId: ctx.organization.id,
    actorId: ctx.user.id,
    action: "knowledge.source_created",
    resource: "knowledge_source",
    resourceId: source.id,
    metadata: { name: source.name },
  });
  redirect(`/app/knowledge/${source.id}`);
}

const documentSchema = z.object({
  filename: z.string().trim().min(2, "Give the document a filename").max(200),
  content: z.string().trim().min(20, "Paste at least a paragraph of content").max(200_000),
});

export async function addDocumentAction(
  sourceId: string,
  _prev: KnowledgeFormState | null,
  formData: FormData,
): Promise<KnowledgeFormState> {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/sign-in");
  try {
    requirePermission(ctx, "knowledge.manage");
  } catch {
    return { error: "Your role cannot manage knowledge." };
  }

  const parsed = documentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  const document = await addDocument(ctx.organization.id, sourceId, {
    filename: parsed.data.filename,
    content: parsed.data.content,
  });
  if (!document) return { error: "Knowledge source not found." };
  await writeAuditLog({
    organizationId: ctx.organization.id,
    actorId: ctx.user.id,
    action: "knowledge.document_added",
    resource: "document",
    resourceId: document.id,
    metadata: { filename: document.filename, chunkCount: document.chunkCount },
  });
  revalidatePath(`/app/knowledge/${sourceId}`);
  return {};
}

export async function deleteDocumentAction(sourceId: string, documentId: string): Promise<void> {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/sign-in");
  requirePermission(ctx, "knowledge.manage");
  await deleteDocument(ctx.organization.id, sourceId, documentId);
  revalidatePath(`/app/knowledge/${sourceId}`);
}

export interface RetrievalTestState {
  error?: string;
  method?: "semantic" | "lexical";
  capped?: boolean;
  results?: { documentName: string; score: number; preview: string }[];
}

const testSchema = z.object({
  query: z.string().trim().min(2, "Write a query").max(2000),
  topK: z.coerce.number().int().min(1).max(10).default(3),
});

export async function testRetrievalAction(
  sourceId: string | null,
  _prev: RetrievalTestState | null,
  formData: FormData,
): Promise<RetrievalTestState> {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/sign-in");
  try {
    requirePermission(ctx, "knowledge.view");
  } catch {
    return { error: "Your role cannot view knowledge." };
  }

  const parsed = testSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "A query is required." };
  }
  const result = await retrieve(ctx.organization.id, {
    query: parsed.data.query,
    sourceId: sourceId ?? undefined,
    topK: parsed.data.topK,
  });
  return {
    method: result.method,
    capped: result.capped,
    results: result.chunks.map((c) => ({
      documentName: c.documentName,
      score: Number(c.score.toFixed(3)),
      preview: c.content.slice(0, 240) + (c.content.length > 240 ? "…" : ""),
    })),
  };
}
