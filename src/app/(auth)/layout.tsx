import Link from "next/link";
import { site } from "@/lib/site";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-paper">
      <header className="border-b border-fog">
        <div className="mx-auto flex h-16 w-full max-w-[76rem] items-center justify-between px-5 sm:px-8">
          <Link href="/" className="text-lg font-semibold tracking-tight text-ink">
            AutoMSP
          </Link>
          <Link
            href="/book-audit"
            className="text-[13px] font-medium tracking-[0.08em] text-slate uppercase hover:text-ink"
          >
            Book an audit
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-5 py-16">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <footer className="border-t border-fog py-6 text-center text-xs text-mute">
        © {new Date().getFullYear()} {site.name}. Managed AI Systems Partner.
      </footer>
    </div>
  );
}
