"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type StoredResult = {
  questionTitle: string;
  questionId: string;
  language: string;
  summary: {
    passed: number;
    failed: number;
    total: number;
    timedOut: boolean;
  } | null;
};

const LANGUAGE_LABELS: Record<string, string> = {
  javascript: "JavaScript",
  python: "Python",
  cpp: "C++",
};

type Props = {
  params: Promise<{ attemptId: string }>;
  searchParams: Promise<{ questionId?: string }>;
};

export default function ResultsPage({ params, searchParams }: Props) {
  const { attemptId } = use(params);
  const { questionId } = use(searchParams);
  const router = useRouter();

  const isLocal = attemptId.startsWith("local-");

  // Read once from sessionStorage on mount; lazy initializer runs only in the browser.
  const [storedResult] = useState<StoredResult | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = sessionStorage.getItem("mockr_last_result");
      if (!raw) return null;
      const data = JSON.parse(raw) as StoredResult;
      sessionStorage.removeItem("mockr_last_result");
      return data;
    } catch {
      return null;
    }
  });

  const hasSummary = storedResult?.summary != null;
  const summary = storedResult?.summary;
  const allPassed = hasSummary && summary && summary.failed === 0 && !summary.timedOut;

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="w-full max-w-lg">
        <div className="rounded-[36px] border border-slate-200 bg-white p-10 shadow-[0_36px_120px_-56px_rgba(15,23,42,0.4)]">
          {/* Icon */}
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
            {allPassed ? "✅" : hasSummary ? "📋" : "✅"}
          </div>

          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950">
            Attempt submitted
          </h1>

          <p className="mt-3 text-base leading-7 text-slate-600">
            Your attempt has been recorded locally. Saved attempts, code execution history, and
            scorecards will be added in future phases.
          </p>

          {isLocal && (
            <div className="mt-5 rounded-[16px] border border-amber-100 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
              <strong>Phase 2 — local only.</strong> Public tests ran in your browser. This result
              is not persisted to the database. Attempt history and AI scoring will be available in
              future phases.
            </div>
          )}

          {/* Public test summary */}
          {hasSummary && summary && (
            <div className="mt-4 rounded-[16px] border border-slate-100 bg-slate-50 p-4">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Public Test Results
              </p>
              {storedResult.questionTitle && (
                <p className="mb-2 text-sm font-medium text-slate-700">
                  {storedResult.questionTitle}
                  {" · "}
                  <span className="font-normal text-slate-500">
                    {LANGUAGE_LABELS[storedResult.language] ?? storedResult.language}
                  </span>
                </p>
              )}
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                  {summary.passed} passed
                </span>
                {summary.failed > 0 && (
                  <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                    {summary.failed} failed
                  </span>
                )}
                {summary.timedOut && (
                  <span className="rounded-full border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
                    timed out
                  </span>
                )}
                <span className="text-xs text-slate-400">
                  of {summary.total} public test{summary.total !== 1 ? "s" : ""}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Local Phase 2 result — not saved to the database.
              </p>
            </div>
          )}

          <div className="mt-4 rounded-[12px] border border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-xs text-slate-400">Attempt ID</p>
            <p className="mt-0.5 break-all font-mono text-xs text-slate-600">{attemptId}</p>
          </div>

          {/* Coming soon */}
          <div className="mt-6 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Coming in future phases
            </p>
            {[
              "Saved attempt history",
              "AI scorecard and feedback",
              "Score breakdown by category",
              "Dashboard attempt history",
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
            {(questionId ?? storedResult?.questionId) && (
              <button
                onClick={() =>
                  router.push(`/practice/${questionId ?? storedResult?.questionId}`)
                }
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
