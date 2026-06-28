type FeatureCardProps = {
  eyebrow?: string;
  title: string;
  description: string;
};

export default function FeatureCard({
  eyebrow,
  title,
  description,
}: FeatureCardProps) {
  return (
    <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)]">
      {eyebrow ? (
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
          {eyebrow}
        </p>
      ) : null}

      <h3 className="mt-3 text-xl font-semibold text-slate-900">{title}</h3>

      <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
    </article>
  );
}
