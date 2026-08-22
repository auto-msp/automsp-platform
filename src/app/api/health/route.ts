import { NextResponse } from "next/server";
import { activeStoreKind } from "@/server/db/store";
import { schedulerEnabled } from "@/server/scheduler";

export const dynamic = "force-dynamic";

/**
 * Liveness + which persistence adapter is live + whether this instance holds
 * the scheduler. Intentionally reveals nothing else — no version internals,
 * no env names beyond store kind and scheduler state.
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      status: "ok",
      store: activeStoreKind(),
      scheduler: schedulerEnabled() ? "enabled" : "disabled",
      time: new Date().toISOString(),
    },
    {
      headers: {
        "cache-control": "no-store",
        "x-robots-tag": "noindex",
      },
    },
  );
}
