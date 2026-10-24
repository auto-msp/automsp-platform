import type { Metadata } from "next";
import Link from "next/link";
import { AppPageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { listSources } from "@/server/ai/knowledge";
import { providerStatus } from "@/server/ai/provider";
import { can, getSessionContext } from "@/server/auth/session";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Knowledge" };
export const dynamic = "force-dynamic";

export default async function KnowledgePage() {
  const ctx = await getSessionContext();
  if (!ctx) return null;
  if (!can(ctx, "knowledge.view")) {
    return (
      <EmptyState
        title="No access"
        description="Your role does not include knowledge. Ask an organization owner or admin."
      />
    );
  }

  const rows = await listSources(ctx.organization.id);
  const canManage = can(ctx, "knowledge.manage");
  const provider = providerStatus();
  const semantic = provider.configured && (provider.provider === "openai" || provider.provider === "google");

  return (
    <div>
      <AppPageHeader
        title="Knowledge"
        description="Pasted documents, chunked and indexed per source. Workflow AI steps and agents use these as retrieval context — scoped to your organization, always."
      >
        {canManage ? (
          <Link
            href="/app/knowledge/new"
            className="btn btn-primary btn-sm"
          >
            New source
          </Link>
        ) : null}
      </AppPageHeader>

      <div className="mb-6 border border-fog bg-haze px-4 py-3 rounded-lg">
        <p className="text-[13px] text-slate">
          {semantic ? (
            <>
              <span className="font-medium text-ok">Semantic retrieval active.</span> Queries and chunks are
              embedded with the configured provider and matched by cosine similarity.
            </>
          ) : (
            <>
              <span className="font-medium text-warn">Lexical retrieval (term matching).</span> Real but
              literal — synonyms and paraphrases will not match. Configure an embeddings-capable provider
              (OpenAI or Google) for semantic retrieval; runs always state which method served.
            </>
          )}{" "}
          File upload and web/integration ingestion are a later slice — documents are pasted text.
        </p>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No knowledge sources yet"
          description="A source groups documents on one domain — e.g. the client handbook, the SLA catalogue. Documents are chunked at insert; retrieval is immediate."
          action={canManage ? { href: "/app/knowledge/new", label: "Create the first source" } : undefined}
        />
      ) : (
        <div className="table-wrap" tabIndex={0}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Documents</th>
                <th>Chunks</th>
                <th>Ingestion</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-fog last:border-0">
                  <td>
                    <Link href={`/app/knowledge/${row.id}`} className="font-medium text-ink hover:underline">
                      {row.name}
                    </Link>
                  </td>
                  <td className="tnum text-slate">{row.documentCount}</td>
                  <td className="tnum text-slate">{row.chunkCount}</td>
                  <td className="text-slate">pasted text/markdown</td>
                  <td className="tnum text-slate">{formatDateTime(row.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
