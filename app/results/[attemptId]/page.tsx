"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = {
  params: Promise<{ attemptId: string }>;
  searchParams: Promise<{ questionId?: string }>;
};

export default function ResultsPage({ params, searchParams }: Props) {
  const { attemptId } = use(params);
  const { questionId } = use(searchParams);
  const router = useRouter();

  const isLocal = attemptId.startsWith("local-");

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="w-full max-w-lg">
        <div className="rounded-[36px] border border-slate-200 bg-white p-10 shadow-[0_36px_120px_-56px_rgba(15,23,42,0.4)]">
          {/* Icon */}
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
            ✅
          </div>

          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950">
            Attempt submitted
          </h1>

          <p className="mt-3 text-base leading-7 text-slate-600">
            Your attempt has been submitted locally. Saved attempts, code execution, and scorecards
            will be added in the next phases.
          </p>

          {isLocal && (
            <div className="mt-5 rounded-[16px] border border-amber-100 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
              <strong>Phase 1 — local only.</strong> This result is not persisted to the database.
              Attempt history and scoring will be available in future phases.
            </div>
          )}

          <div className="mt-2 rounded-[12px] border border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-xs text-slate-400">Attempt ID</p>
            <p className="mt-0.5 font-mono text-xs text-slate-600 break-all">{attemptId}</p>
          </div>

          {/* Coming soon */}
          <div className="mt-6 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Coming in future phases
            </p>
            {[
              "Saved attempt history",
              "JavaScript public test execution",
              "AI scorecard and feedback",
              "Score breakdown by category",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 rounded-[12px] border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-500"
              >
                <span className="text-slate-300">○</span>
                {item}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-3">
            {questionId && (
              <button
                onClick={() => router.push(`/practice/${questionId}`)}
                className="inline-flex w-full items-center justify-center rounded-full border border-slate-950 bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] transition hover:bg-slate-800"
              >
                Retry question
              </button>
            )}
            <Link
              href="/questions"
              className="inline-flex w-full items-center justify-center rounded-full border border-slate-300 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-200"
            >
              Back to questions
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
