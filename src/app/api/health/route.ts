import { NextResponse } from "next/server";
import { activeStoreKind } from "@/server/db/store";

export const dynamic = "force-dynamic";

/**
 * Liveness + which persistence adapter is live. Intentionally reveals nothing
 * else — no version internals, no env names beyond store kind.
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      status: "ok",
      store: activeStoreKind(),
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
