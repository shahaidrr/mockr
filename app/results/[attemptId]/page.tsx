"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchAttemptById } from "@/lib/attempts-service";
import type { SavedAttempt } from "@/lib/attempts-service";

const LANGUAGE_LABELS: Record<string, string> = {
  javascript: "JavaScript",
  python: "Python",
  cpp: "C++",
};

const MODE_LABELS: Record<string, string> = {
  practice: "Practice",
  assessment: "Assessment",
};

function formatDuration(seconds: number | null): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

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

type Props = {
  params: Promise<{ attemptId: string }>;
  searchParams: Promise<{ questionId?: string }>;
};

export default function ResultsPage({ params, searchParams }: Props) {
  const { attemptId } = use(params);
  const { questionId } = use(searchParams);
  const router = useRouter();

  const isLocal = attemptId.startsWith("local-");

  // For local fallback attempts, read session storage
  const [storedResult] = useState<StoredResult | null>(() => {
    if (!isLocal || typeof window === "undefined") return null;
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

  // For real Supabase attempts, fetch from DB
  const [savedAttempt, setSavedAttempt] = useState<{
    attempt: SavedAttempt;
    questionTitle: string;
    questionSlug: string;
  } | null>(null);
  const [loading, setLoading] = useState(!isLocal);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (isLocal) return;
    let cancelled = false;
    fetchAttemptById(attemptId).then((result) => {
      if (cancelled) return;
      if (!result) {
        setFetchError("This attempt could not be found. It may not have saved correctly.");
      } else {
        setSavedAttempt(result);
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [attemptId, isLocal]);

  // Derive display values
  const effectiveQuestionId = questionId ?? savedAttempt?.attempt.question_id ?? storedResult?.questionId;
  const questionTitle = savedAttempt?.questionTitle ?? storedResult?.questionTitle;
  const language = savedAttempt?.attempt.language ?? storedResult?.language;
  const mode = savedAttempt?.attempt.mode;
  const timeTaken = savedAttempt?.attempt.time_taken_seconds ?? null;

  // Loading state
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-10">
        <div className="w-full max-w-lg">
          <div className="rounded-[36px] border border-slate-200 bg-white p-10 shadow-[0_36px_120px_-56px_rgba(15,23,42,0.4)]">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <svg className="animate-spin text-slate-400" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            </div>
            <p className="mt-6 text-lg font-semibold text-slate-950">Saving your attempt…</p>
            <p className="mt-2 text-sm text-slate-500">Hang on while we record your submission.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="w-full max-w-lg">
        <div className="rounded-[36px] border border-slate-200 bg-white p-10 shadow-[0_36px_120px_-56px_rgba(15,23,42,0.4)]">

          {/* Icon */}
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl">
            {isLocal ? "📋" : "✅"}
          </div>

          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950">
            {fetchError ? "Save issue" : "Attempt recorded"}
          </h1>

          {fetchError ? (
            <p className="mt-3 text-base leading-7 text-red-600">{fetchError}</p>
          ) : (
            <p className="mt-3 text-base leading-7 text-slate-600">
              {isLocal
                ? "Your attempt was saved locally. Full attempt history and AI scorecards will be available in a future phase."
                : "Your attempt has been saved. Full AI scorecards and score breakdowns are coming in a future phase."}
            </p>
          )}

          {/* Saved attempt metadata */}
          {savedAttempt && (
            <div className="mt-5 space-y-2 rounded-[16px] border border-slate-100 bg-slate-50 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Attempt details
              </p>
              {questionTitle && (
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-slate-700">Question</p>
                  <p className="text-right text-sm text-slate-900">{questionTitle}</p>
                </div>
              )}
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-slate-700">Language</p>
                <p className="text-sm text-slate-900">{LANGUAGE_LABELS[language ?? ""] ?? language}</p>
              </div>
              {mode && (
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-slate-700">Mode</p>
                  <p className="text-sm text-slate-900">{MODE_LABELS[mode] ?? mode}</p>
                </div>
              )}
              {timeTaken !== null && (
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-slate-700">Time taken</p>
                  <p className="text-sm text-slate-900">{formatDuration(timeTaken)}</p>
                </div>
              )}
            </div>
          )}

          {/* Local fallback summary (sessionStorage) */}
          {isLocal && storedResult?.summary && (
            <div className="mt-4 rounded-[16px] border border-slate-100 bg-slate-50 p-4">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Public test results
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
                  {storedResult.summary.passed} passed
                </span>
                {storedResult.summary.failed > 0 && (
                  <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                    {storedResult.summary.failed} failed
                  </span>
                )}
                {storedResult.summary.timedOut && (
                  <span className="rounded-full border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
                    timed out
                  </span>
                )}
                <span className="text-xs text-slate-400">
                  of {storedResult.summary.total} public test{storedResult.summary.total !== 1 ? "s" : ""}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Saved locally — not persisted to the database.
              </p>
            </div>
          )}

          {/* Attempt ID */}
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
              "AI scorecard — code, reasoning, testing, communication",
              "Score breakdown by category",
              "Recommendations based on past attempts",
              "Comparison across your attempt history",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-[12px] border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-500"
              >
                <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-300">
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </span>
                {item}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-3">
            {effectiveQuestionId && (
              <button
                onClick={() => router.push(`/practice/${effectiveQuestionId}`)}
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
