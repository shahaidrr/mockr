import Link from "next/link";

type NavLink = {
  href: string;
  label: string;
};

type HeaderAction = {
  href: string;
  label: string;
};

type SiteHeaderProps = {
  links: NavLink[];
  primaryAction: HeaderAction;
  secondaryAction?: HeaderAction;
};

export default function SiteHeader({
  links,
  primaryAction,
  secondaryAction,
}: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-6 py-4 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-3 text-sm font-semibold tracking-[0.22em] text-slate-900"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-200 bg-sky-100 text-base tracking-normal text-sky-700">
            M
          </span>
          MOCKR.AI
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-slate-950"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {secondaryAction ? (
            <Link
              href={secondaryAction.href}
              className="hidden rounded-full border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-200 sm:inline-flex"
            >
              {secondaryAction.label}
            </Link>
          ) : null}

          <Link
            href={primaryAction.href}
            className="inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            {primaryAction.label}
          </Link>
        </div>
      </div>
    </header>
  );
}
