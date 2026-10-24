import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-paper">
      <header className="border-b border-fog">
        <div className="mx-auto flex h-16 w-full max-w-[76rem] items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            className="-ml-1 inline-flex min-h-11 items-center gap-2.5 px-1 text-lg font-semibold tracking-tight text-ink"
          >
            <Image src="/brand/logo-gravatar.png" alt="" width={32} height={32} className="size-8 rounded-full" />
            AutoMSP
          </Link>
          <Link
            href="/book-audit"
            className="inline-flex min-h-11 items-center px-1 text-sm font-medium text-slate underline-offset-4 hover:text-ink hover:underline"
          >
            Book an audit
          </Link>
        </div>
      </header>
      <main id="main" className="flex flex-1 items-start justify-center px-5 py-10 sm:items-center sm:py-16">
        <div className="w-full max-w-md border border-fog bg-surface p-6 sm:p-10">{children}</div>
      </main>
      <footer className="border-t border-fog py-6 text-center text-xs text-mute">
        © {new Date().getFullYear()} {site.name}. Managed AI Systems Partner.
      </footer>
    </div>
  );
}
