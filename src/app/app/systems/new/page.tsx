import type { Metadata } from "next";
import { AppPageHeader } from "@/components/app/page-header";
import { SystemForm } from "../system-form";
import { createSystemAction } from "../actions";

export const metadata: Metadata = { title: "New system" };

export const dynamic = "force-dynamic";

export default function NewSystemPage() {
  return (
    <div>
      <AppPageHeader
        title="New system"
        description="A system is the container your automations live in — one business outcome per system."
      />
      <div className="max-w-xl">
        <SystemForm action={createSystemAction} submitLabel="Create system" />
      </div>
    </div>
  );
}
