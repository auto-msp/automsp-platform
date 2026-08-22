import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppPageHeader } from "@/components/app/page-header";
import { can, getSessionContext } from "@/server/auth/session";
import { getAutomation } from "@/server/automations";
import { store } from "@/server/db/store";
import { updateAutomationAction } from "../../actions";
import { AutomationSettingsForm } from "../../settings-form";
import { DeleteAutomationForm } from "./delete-form";

export const metadata: Metadata = { title: "Automation settings" };

export const dynamic = "force-dynamic";

export default async function AutomationEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ctx = await getSessionContext();
  if (!ctx) return null;
  const orgId = ctx.organization.id;

  const { id } = await params;
  const automation = await getAutomation(orgId, id);
  if (!automation) notFound();
  if (!can(ctx, "automations.manage")) notFound();

  const systems = await store.query("systems", { organizationId: orgId });
  const boundUpdate = updateAutomationAction.bind(null, automation.id);

  return (
    <div>
      <AppPageHeader title={`Settings — ${automation.name}`}>
        <Link
          href={`/app/automations/${automation.id}`}
          className="text-[13px] text-slate hover:text-ink"
        >
          ← Back to automation
        </Link>
      </AppPageHeader>

      <div className="max-w-xl space-y-10">
        <AutomationSettingsForm
          action={boundUpdate}
          submitLabel="Save changes"
          systems={systems.map((s) => ({ id: s.id, name: s.name }))}
          defaultSystemId={automation.systemId ?? ""}
          defaultValues={{
            name: automation.name,
            description: automation.description,
            estMinutesPerRun: automation.estMinutesPerRun,
            status: automation.status,
          }}
          showStatus
        />
        <div className="border-t border-fog pt-8">
          <h2 className="text-sm font-semibold text-risk">Danger zone</h2>
          <p className="mt-1.5 text-[13px] text-slate">
            Automations with recorded runs cannot be deleted — archive them instead. Execution
            history is immutable.
          </p>
          <DeleteAutomationForm automationId={automation.id} automationName={automation.name} />
        </div>
      </div>
    </div>
  );
}
