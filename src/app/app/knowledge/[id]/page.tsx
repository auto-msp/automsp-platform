import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppPageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { StatusPill } from "@/components/app/status-pill";
import { getSource, listDocuments } from "@/server/ai/knowledge";
import { can, getSessionContext } from "@/server/auth/session";
import { formatDateTime } from "@/lib/format";
import { DocumentForm } from "./document-form";
import { DeleteDocumentButton } from "./delete-document";
import { RetrievalTest } from "./retrieval-test";

export const metadata: Metadata = { title: "Knowledge source" };
export const dynamic = "force-dynamic";

export default async function KnowledgeSourcePage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await getSessionContext();
  if (!ctx) return null;

  const { id } = await params;
  const source = await getSource(ctx.organization.id, id);
  if (!source) notFound();
  if (!can(ctx, "knowledge.view")) {
    return <AppPageHeader back={{ href: "/app/knowledge", label: "Knowledge" }} title={source.name} description="Your role does not include viewing knowledge." />;
  }

  const canManage = can(ctx, "knowledge.manage");
  const documents = await listDocuments(source.id);

  return (
    <div>
      <AppPageHeader
        title={source.name}
        description="Documents are chunked at insert. Retrieval is semantic when an embeddings-capable provider is configured, lexical otherwise — the test below shows which."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_22rem]">
        <div>
          {canManage ? (
            <div className="mb-6">
              <DocumentForm sourceId={source.id} />
            </div>
          ) : null}

          {documents.length === 0 ? (
            <EmptyState
              title="No documents yet"
              description={
                canManage
                  ? "Paste a reference document above — it is chunked and retrievable immediately."
                  : "No documents have been added to this source."
              }
            />
          ) : (
            <div className="table-wrap">
              <table className="app-table">
                <thead>
                  <tr>
                    <th className="font-medium">Document</th>
                    <th className="font-medium">Status</th>
                    <th className="font-medium">Chunks</th>
                    <th className="font-medium">Added</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id}>
                      <td className="px-4 py-3">
                        <span className="font-medium text-ink">{doc.filename}</span>
                        <span className="ml-2 text-xs text-mute">{doc.mimeType}</span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill status={doc.status} />
                      </td>
                      <td className="tnum px-4 py-3 text-slate">{doc.chunkCount}</td>
                      <td className="tnum px-4 py-3 text-slate">{formatDateTime(doc.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        {canManage ? <DeleteDocumentButton sourceId={source.id} documentId={doc.id} name={doc.filename} /> : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="border border-fog bg-paper p-5">
          <h3 className="mb-3 text-[13px] font-medium tracking-wide text-ink">Test retrieval</h3>
          <RetrievalTest sourceId={source.id} />
        </div>
      </div>
    </div>
  );
}
