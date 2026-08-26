import type { Metadata } from "next";
import Link from "next/link";
import { AppPageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { providerStatus } from "@/server/ai/provider";
import { can, getSessionContext } from "@/server/auth/session";
import { STRATEGY_DOCS, listStrategyRuns } from "@/server/growth/strategy";
import { formatDateTime } from "@/lib/format";
import { StrategyForm } from "./growth-form";

export const metadata: Metadata = { title: "Growth" };
export const dynamic = "force-dynamic";

export default async function GrowthPage() {
  const ctx = await getSessionContext();
  if (!ctx) return null;
  if (!can(ctx, "knowledge.view")) {
    return (
      <EmptyState
        title="No access"
        description="Your role does not include growth. Ask an organization owner or admin."
      />
    );
  }

  const runs = await listStrategyRuns(ctx.organization.id);
  const canManage = can(ctx, "knowledge.manage");
  const provider = providerStatus();

  return (
    <div>
      <AppPageHeader
        title="Growth"
        description="Grounding documents for the growth agents. Generate once; every agent — SEO Auditor, GEO Tracker, Social Media, Email Outreach — reads these before it drafts a word. Regenerating replaces the previous set wholesale."
      />

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {STRATEGY_DOCS.map((doc) => (
          <div key={doc.key} className="border border-fog bg-haze px-4 py-3">
            <p className="text-[13px] font-medium text-ink">{doc.title}</p>
          </div>
        ))}
      </div>

      {canManage ? (
        <section className="mb-10">
          <h2 className="mb-4 text-[12px] tracking-[0.08em] text-slate uppercase">New research run</h2>
          <StrategyForm providerConfigured={provider.configured} />
        </section>
      ) : null}

      <section>
        <h2 className="mb-4 text-[12px] tracking-[0.08em] text-slate uppercase">Strategy sources</h2>
        {runs.length === 0 ? (
          <EmptyState
            title="No strategy documents yet"
            description={
              canManage
                ? "Run your first research pass above. The five documents are written in sequence, each grounded in the ones before it."
                : "No growth research has been generated for this organization yet."
            }
          />
        ) : (
          <ul className="divide-y divide-fog border border-fog bg-paper">
            {runs.map((run) => (
              <li key={run.source.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-ink">{run.source.name}</p>
                  <p className="text-[12px] text-slate">
                    {run.documentCount}/5 documents · created {formatDateTime(run.source.createdAt)} ·{" "}
                    {run.source.kind === "web" ? "web-grounded" : "description-grounded"}
                  </p>
                  <p className="mt-1 text-[12px] text-mute">{run.docs.map((d) => d.filename).join(", ")}</p>
                </div>
                <Link
                  href={`/app/knowledge/${run.source.id}`}
                  className="shrink-0 text-[12px] tracking-[0.08em] text-ink uppercase underline decoration-fog underline-offset-4 hover:decoration-ink"
                >
                  View source
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
