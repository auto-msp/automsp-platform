import type { Metadata } from "next";
import { AppPageHeader } from "@/components/app/page-header";
import { can, getSessionContext } from "@/server/auth/session";
import { billingOverview, PLANS } from "@/server/billing";
import { laborRateForOrg } from "@/server/ops/roi";

export const metadata: Metadata = { title: "Billing" };

export const dynamic = "force-dynamic";

const METER_LABEL: Record<string, string> = {
  executions: "Workflow runs",
  tokens: "AI tokens",
  agent_runs: "Agent runs",
};

function fmtUsage(meter: string, total: number): string {
  if (meter === "tokens") return total.toLocaleString();
  return String(Math.round(total));
}

export default async function BillingPage() {
  const ctx = await getSessionContext();
  if (!ctx) return null;
  const orgId = ctx.organization.id;

  const [overview, laborRate] = await Promise.all([
    billingOverview(orgId),
    laborRateForOrg(orgId),
  ]);

  const periodLabel = `${overview.currentPeriod.start.slice(0, 10)} → ${overview.currentPeriod.end.slice(0, 10)}`;

  return (
    <div>
      <AppPageHeader
        title="Billing"
        description="Plan, metered usage, and invoices for this workspace. Metered usage is counted from records; subscription and invoice data only appear when a payment provider is connected."
      />

      {/* Usage — always real */}
      <div className="border border-fog bg-surface p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-ink">Metered usage · this period</h2>
          <p className="text-[11px] text-mute">
            <span className="font-medium text-ok">Actual</span> — {periodLabel}
          </p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {overview.usage.map((u) => (
            <div key={u.meter} className="border border-fog bg-paper p-4">
              <p className="text-[11px] font-medium tracking-[0.1em] text-mute uppercase">
                {METER_LABEL[u.meter] ?? u.meter}
              </p>
              <p className="tnum mt-1.5 text-2xl font-semibold text-ink">{fmtUsage(u.meter, u.total)}</p>
              <p className="mt-1 text-[11px] text-mute">
                {u.estimatedCostUsd !== null
                  ? `≈ $${u.estimatedCostUsd.toFixed(2)} at configured unit price`
                  : "no unit price configured — count only"}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[12px] text-mute">
          ROI assumption in use across analytics &amp; reports: labor rate ${laborRate}/hour.
          Catalog plan limits are informational until a payment processor is connected — usage is
          never throttled against a plan that hasn&apos;t been purchased.
        </p>
      </div>

      {/* Plan */}
      <div className="mt-6 border border-fog bg-surface p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-ink">Plan</h2>
          {!overview.configured ? (
            <span className="border border-fog bg-haze px-2 py-1 text-[11px] font-medium tracking-[0.1em] text-slate uppercase">
              Not configured
            </span>
          ) : null}
        </div>
        {!overview.configured ? (
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate">
            No payment processor is connected to this environment, so there is no live subscription
            to show — Stripe integration is withheld until configured, rather than simulated.
            Below is the plan catalog; a subscription is created only when Stripe confirms one.
          </p>
        ) : overview.subscription && overview.plan ? (
          <div className="mt-3">
            <p className="text-lg font-semibold text-ink">{overview.plan.name}</p>
            <p className="mt-1 text-sm text-slate">
              Status <span className="font-medium text-ink">{overview.subscription.status}</span>
              {overview.subscription.currentPeriodEnd
                ? ` · renews ${overview.subscription.currentPeriodEnd.slice(0, 10)}`
                : ""}
            </p>
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate">
            Stripe is connected but this organization has no subscription yet.
          </p>
        )}

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {PLANS.map((p) => (
            <div key={p.key} className="border border-fog bg-paper p-4">
              <div className="flex items-baseline justify-between">
                <p className="text-sm font-semibold text-ink">{p.name}</p>
                {overview.subscription?.planKey === p.key ? (
                  <span className="border border-ok/40 bg-ok/10 px-1.5 py-px text-[10px] font-medium tracking-[0.08em] text-ok uppercase">
                    Current
                  </span>
                ) : null}
              </div>
              <p className="tnum mt-1 text-xl font-semibold text-ink">
                {p.key === "platform"
                  ? "Custom"
                  : p.monthlyPriceUsd > 0
                    ? `$${p.monthlyPriceUsd}/mo`
                    : "Pilot"}
              </p>
              <p className="mt-1 text-[12px] leading-snug text-mute">{p.blurb}</p>
              <p className="mt-2 border-t border-fog pt-2 text-[11px] text-slate">
                {p.includedExecutions !== null
                  ? `${p.includedExecutions.toLocaleString()} runs · ${(p.includedTokens ?? 0).toLocaleString()} tokens /mo`
                  : "Unmetered — scoped per engagement"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Invoices */}
      <div className="mt-6">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-ink">Invoices</h2>
          <p className="text-[11px] text-mute">
            <span className="font-medium text-ok">Actual</span> — from the payment provider
          </p>
        </div>
        {overview.invoices.length === 0 ? (
          <div className="border border-dashed border-fog p-8 text-center">
            <p className="text-sm text-mute">
              {overview.configured
                ? "No invoices yet."
                : "No payment provider connected — there are no invoices to show."}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden border border-fog">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-fog bg-haze text-left text-[11px] font-medium tracking-[0.1em] text-mute uppercase">
                  <th className="px-4 py-2.5">Invoice</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Amount</th>
                  <th className="px-4 py-2.5">Due</th>
                </tr>
              </thead>
              <tbody>
                {overview.invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-fog last:border-0">
                    <td className="px-4 py-3 font-medium text-ink">
                      {inv.stripeInvoiceId ?? inv.id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3 text-slate">{inv.status}</td>
                    <td className="tnum px-4 py-3 text-slate">
                      {(inv.amountDueCents / 100).toLocaleString("en-US", {
                        style: "currency",
                        currency: inv.currency.toUpperCase(),
                      })}
                    </td>
                    <td className="tnum px-4 py-3 text-slate">{inv.dueAt ? inv.dueAt.slice(0, 10) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {can(ctx, "billing.manage") ? (
        <p className="mt-6 text-[12px] leading-relaxed text-mute">
          To connect a payment provider, set <code className="text-ink">STRIPE_SECRET_KEY</code> and
          configure the webhook endpoint; subscriptions and invoices then sync from Stripe.
        </p>
      ) : null}
    </div>
  );
}
