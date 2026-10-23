import Image from "next/image";
import Link from "next/link";
import { footerNav, site } from "@/lib/site";

function Column({ title, items }: { title: string; items: readonly { label: string; href: string }[] }) {
  return (
    <div>
      {/*
        h2, not h3. The footer is its own landmark and these columns are its
        top-level sections, so h2 keeps the outline honest on pages that have no
        h2 content of their own (e.g. /book-audit, whose h1 runs straight into
        the footer) without skipping a level. Styling is class-driven, so the
        element change is invisible.
      */}
      <h2 className="text-[13px] font-semibold text-night-mute">{title}</h2>
      <ul className="mt-3">
        {items.map((item) => (
          <li key={item.label}>
            <Link href={item.href} className="flex min-h-11 items-center text-sm text-night-text transition-colors hover:text-trail">
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
    <footer className="on-dark bg-night text-night-text">
      <div className="mx-auto w-full max-w-[76rem] px-5 py-14 sm:px-8 sm:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <Image
              src="/brand/automsp-logo.png"
              // Decorative: the company name appears as text immediately below,
              // and "logo" adds nothing for a screen reader.
              alt=""
              width={64}
              height={64}
              className="size-14 rounded-full ring-1 ring-nline"
            />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-night-mute">
              {site.name} is your Managed AI Systems Partner — designing, building, and operating
              the AI layer that powers your business.
            </p>
            <a
              href={`mailto:${site.email}`}
              className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-trail underline underline-offset-4 hover:text-night-text"
            >
              {site.email}
            </a>
          </div>
          <Column title="Services" items={footerNav.services} />
          <Column title="Company" items={footerNav.company} />
          <Column title="Resources" items={footerNav.resources} />
          <Column title="Legal" items={footerNav.legal} />
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-nline pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-night-mute">
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p className="text-xs text-night-mute">
            Managed AI Systems Partner — {site.domain}
          </p>
        </div>
      </div>
    </footer>
  );
}
