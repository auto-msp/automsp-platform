/**
 * Next.js instrumentation hook — runs once per Node server process.
 * Starts the in-process interval scheduler. Edge runtimes never get here.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startScheduler } = await import("@/server/scheduler");
    startScheduler();
  }
}
