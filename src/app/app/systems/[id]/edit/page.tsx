import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppPageHeader } from "@/components/app/page-header";
import { can, getSessionContext } from "@/server/auth/session";
import { getSystem } from "@/server/systems";
import { updateSystemAction } from "../../actions";
import { SystemForm } from "../../system-form";
import { DeleteSystemForm } from "./delete-form";

export const metadata: Metadata = { title: "Edit system" };

export const dynamic = "force-dynamic";

export default async function EditSystemPage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await getSessionContext();
  if (!ctx) return null;

  const { id } = await params;
  const system = await getSystem(ctx.organization.id, id);
  if (!system) notFound();
  if (!can(ctx, "systems.manage")) notFound();

  const boundUpdate = updateSystemAction.bind(null, system.id);

  return (
    <div>
      <AppPageHeader title={`Edit — ${system.name}`} />
      <div className="max-w-xl space-y-10">
        <SystemForm
          action={boundUpdate}
          submitLabel="Save changes"
          defaultValues={{
            name: system.name,
            description: system.description,
            businessOutcome: system.businessOutcome,
            ownerName: system.ownerName,
            status: system.status,
          }}
          showStatus
        />
        <div className="border-t border-fog pt-8">
          <h2 className="text-sm font-semibold text-risk">Danger zone</h2>
          <p className="mt-1.5 text-[13px] text-slate">
            Deleting removes the system definition. Systems that still have automations cannot be
            deleted.
          </p>
          <DeleteSystemForm systemId={system.id} systemName={system.name} />
        </div>
      </div>
    </div>
  );
}
