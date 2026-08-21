import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { getSessionContext } from "@/server/auth/session";

// Auth guard runs per request; never prerender /app.
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Server-side guard: everything under /app requires a resolved session +
  // organization. This is the enforcement point — navigation hiding is cosmetic.
  const ctx = await getSessionContext();
  if (!ctx) redirect("/sign-in");

  return <AppShell ctx={ctx}>{children}</AppShell>;
}
