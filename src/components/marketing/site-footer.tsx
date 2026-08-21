import Image from "next/image";
import Link from "next/link";
import { footerNav, site } from "@/lib/site";

function Column({ title, items }: { title: string; items: readonly { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="text-[11px] font-medium uppercase tracking-[0.18em] text-mute">{title}</h3>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li key={item.label}>
            <Link href={item.href} className="text-sm text-graphite transition-colors hover:text-ink">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="hairline-t bg-paper">
      <div className="mx-auto w-full max-w-[76rem] px-5 py-14 sm:px-8 sm:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <Image
              src="/brand/automsp-logo.png"
              alt="AutoMSP logo"
              width={64}
              height={64}
              className="size-14 rounded-full"
            />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-slate">
              {site.name} is your Managed AI Systems Partner — designing, building, and operating
              the AI layer that powers your business.
            </p>
            <a
              href={`mailto:${site.email}`}
              className="mt-5 inline-block text-sm font-medium text-ink underline-offset-4 hover:underline"
            >
              {site.email}
            </a>
          </div>
          <Column title="Services" items={footerNav.services} />
          <Column title="Company" items={footerNav.company} />
          <Column title="Resources" items={footerNav.resources} />
          <Column title="Legal" items={footerNav.legal} />
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-fog pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-mute">
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p className="text-xs text-mute">
            Managed AI Systems Partner — {site.domain}
          </p>
        </div>
      </div>
    </footer>
  );
}
