import type { ReactNode } from "react";

type DashboardCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export default function DashboardCard({
  title,
  subtitle,
  children,
}: DashboardCardProps) {
  return (
    <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)]">
      <div className="flex flex-col gap-2 border-b border-slate-100 pb-4">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {subtitle ? (
          <p className="text-sm leading-6 text-slate-500">{subtitle}</p>
        ) : null}
      </div>

      <div className="pt-5">{children}</div>
    </section>
  );
}
