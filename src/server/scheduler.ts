import "server-only";
import { store } from "@/server/db/store";
import { notify } from "@/server/notifications";
import { getCurrentDefinition, scheduleIntervalMs } from "./automations";
import { startExecution } from "./engine/executor";

/**
 * In-process interval scheduler.
 *
 * Scope, honestly: this is a single-process poller. It runs inside the
 * Next.js Node process (started from instrumentation.ts) and fires automations
 * whose trigger is a schedule and whose nextRunAt has passed.
 *
 * Multi-instance deployments: the scheduler must run in exactly one process.
 * Set AUTOMSP_SCHEDULER=off on every instance except one (or run a dedicated
 * instance whose only job is scheduling). The gate is checked at startup and
 * surfaced by /api/health so an operator can verify which instance holds it.
 * With no shared lock, two schedulers would double-fire — the engine's
 * idempotency key dedupes the execution, but notifications would still
 * duplicate. That is why the switch exists instead of "just run it everywhere".
 *
 * Idempotency: the cursor is advanced after firing, so the engine's
 * "active and due" guard still passes. A crash between the two is safe —
 * the idempotency key `sched:{automationId}:{dueAt}` makes the retry return
 * the already-created execution instead of duplicating the work.
 */

const TICK_MS = 30_000;
const GLOBAL_KEY = "__automsp_scheduler__";

/**
 * Multi-instance switch. Default: enabled, so a single-instance deployment
 * works with zero configuration. Set AUTOMSP_SCHEDULER to off/0/false/no to
 * disable it on this instance.
 */
export function schedulerEnabled(): boolean {
  const raw = process.env.AUTOMSP_SCHEDULER;
  if (raw === undefined || raw.trim() === "") return true;
  return !["off", "0", "false", "no", "disabled"].includes(raw.trim().toLowerCase());
}

function scheduleCursorKey(automationId: string, nextRunAt: string): string {
  return `sched:${automationId}:${nextRunAt}`;
}

async function tick(): Promise<void> {
  const now = Date.now();
  // Status equality is pushed into the store (SQL where on Postgres); the
  // due-time compare stays in memory.
  const active = await store.query("automations", { status: "active" });
  const due = active.filter((a) => a.nextRunAt !== null && Date.parse(a.nextRunAt) <= now);

  for (const automation of due) {
    const dueAt = automation.nextRunAt as string;
    const current = await store.get("automations", automation.id);
    // Re-read under the same cursor; a concurrent save may have moved it.
    if (!current || current.nextRunAt !== dueAt || current.status !== "active") continue;

    const def = await getCurrentDefinition(automation.id);
    const triggerNode = def?.definition.nodes.find((n) => n.type === "trigger");
    const interval = triggerNode ? scheduleIntervalMs(triggerNode.config) : null;

    // Fire first, then advance the cursor. The engine enforces "active and
    // due", so the cursor must still point at dueAt when startExecution runs.
    // A crash in between is safe: the next tick retries with the same
    // idempotency key and gets the already-created execution back.
    const nextRunAt = interval ? new Date(Date.parse(dueAt) + interval).toISOString() : null;
    const result = await startExecution({
      organizationId: automation.organizationId,
      automationId: automation.id,
      input: { scheduledAt: dueAt },
      idempotencyKey: scheduleCursorKey(automation.id, dueAt),
      startedBy: "scheduler",
      trigger: "schedule",
    });

    if (!result.ok) {
      // Failure to start is real and must be visible, not silent.
      await notify({
        organizationId: automation.organizationId,
        kind: "schedule",
        title: `Scheduled run did not start — ${automation.name}`,
        body: result.error,
        href: `/app/automations/${automation.id}`,
      });
    }

    // Advance the cursor in both outcomes — a broken definition should skip
    // this occurrence, not re-fail (and re-notify) on every tick.
    await store.update("automations", automation.id, {
      lastScheduledAt: new Date().toISOString(),
      nextRunAt,
    });
  }
}

/** Start the poller exactly once per Node process. Safe to call repeatedly. */
export function startScheduler(): void {
  if (!schedulerEnabled()) return;

  const g = globalThis as Record<string, unknown>;
  if (g[GLOBAL_KEY]) return;

  const handle = setInterval(() => {
    tick().catch((err) => {
      // Never let a tick kill the process; the error is recorded for the ops view.
      console.error("[scheduler] tick failed:", err instanceof Error ? err.message : err);
    });
  }, TICK_MS);
  handle.unref();
  g[GLOBAL_KEY] = handle;
}
