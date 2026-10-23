import Link from "next/link";
import { Check } from "lucide-react";
import { site } from "@/lib/site";

// Statements here are product rules documented in the README, not marketing claims.
const rules = [
  "Consequential actions pause for a person to approve.",
  "Every number is labelled Actual, Estimated or Projected.",
  "Your records are scoped to your organization.",
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh bg-paper lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="on-dark hidden flex-col justify-between bg-night p-12 text-night-text lg:flex">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          AutoMSP
        </Link>
        <div>
          <p className="flex items-center gap-2.5 text-xs font-semibold tracking-[0.18em] text-night-mute uppercase">
            <span aria-hidden className="inline-block size-[5px] bg-trail" />
            Control plane
          </p>
          <p className="font-display mt-6 max-w-md text-5xl leading-[1.05] tracking-tight">
            Run your AI operations with a person in the loop.
          </p>
          <ul className="mt-10 space-y-4">
            {rules.map((r) => (
              <li key={r} className="flex items-start gap-3 text-[15px] text-night-text">
                <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-trail" strokeWidth={2} />
                {r}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-night-mute">
          © {new Date().getFullYear()} {site.name}. Managed AI Systems Partner.
        </p>
      </aside>

      <div className="flex min-h-svh flex-col">
        <header className="flex h-16 items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex min-h-11 items-center text-lg font-semibold tracking-tight text-ink lg:invisible">
            AutoMSP
          </Link>
          <Link
            href="/book-audit"
            className="flex min-h-11 items-center text-[13px] font-medium text-slate hover:text-ink"
          >
            Book an audit
          </Link>
        </header>
        <main id="main" className="flex flex-1 items-center justify-center px-5 pt-6 pb-16 sm:px-8">
          <div className="w-full max-w-md">{children}</div>
        </main>
        <footer className="py-6 text-center text-xs text-mute lg:hidden">
          © {new Date().getFullYear()} {site.name}. Managed AI Systems Partner.
        </footer>
      </div>
    </div>
  );
}
