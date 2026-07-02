"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchAttemptById } from "@/lib/attempts-service";
import type { SavedAttemptResult } from "@/lib/attempts-service";
import type { ScoreCategoryKey } from "@/types/scorecard";
import { createClient } from "@/lib/supabase/client";

const LANGUAGE_LABELS: Record<string, string> = {
  javascript: "JavaScript",
  python: "Python",
  cpp: "C++",
};

const MODE_LABELS: Record<string, string> = {
  practice: "Practice",
  assessment: "Assessment",
};

const CATEGORY_LABELS: Record<ScoreCategoryKey, string> = {
  problem_understanding: "Problem understanding",
  communication: "Communication",
  algorithmic_approach: "Algorithmic approach",
  code_correctness: "Code correctness",
  code_quality: "Code quality",
  testing_debugging: "Testing and debugging",
  complexity_analysis: "Complexity analysis",
  hints_followups: "Hints and follow-ups",
};

function formatDuration(seconds: number | null): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
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
  searchParams: Promise<{ questionId?: string; grading?: string }>;
};

export default function ResultsPage({ params, searchParams }: Props) {
  const { attemptId } = use(params);
  const { questionId, grading } = use(searchParams);
  const router = useRouter();

  const isLocal = attemptId.startsWith("local-");

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

  const [savedAttempt, setSavedAttempt] = useState<SavedAttemptResult | null>(null);
  const [loading, setLoading] = useState(!isLocal);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [integritySummary, setIntegritySummary] = useState<{
    finalStatus: string;
    totalEvents: number;
    lowCount: number;
    mediumCount: number;
    highCount: number;
  } | null>(null);

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
    return () => {
      cancelled = true;
    };
  }, [attemptId, isLocal]);

  // Fetch integrity summary for assessment-mode attempts
  useEffect(() => {
    if (isLocal) return;
    const supabase = createClient();
    supabase
      .from("attempt_events")
      .select("payload")
      .eq("attempt_id", attemptId)
      .eq("event_type", "integrity_summary")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.payload) {
          const p = data.payload as {
            finalStatus: string;
            totalEvents: number;
            lowCount: number;
            mediumCount: number;
            highCount: number;
          };
          setIntegritySummary(p);
        }
      });
  }, [attemptId, isLocal]);

  const effectiveQuestionId =
    questionId ?? savedAttempt?.attempt.question_id ?? storedResult?.questionId;
  const questionTitle = savedAttempt?.questionTitle ?? storedResult?.questionTitle;
  const language = savedAttempt?.attempt.language ?? storedResult?.language;
  const mode = savedAttempt?.attempt.mode;
  const timeTaken = savedAttempt?.attempt.time_taken_seconds ?? null;
  const submittedAt = savedAttempt?.attempt.submitted_at ?? null;
  const publicTestSummary = savedAttempt?.publicTestSummary ?? null;
  const scorecard = savedAttempt?.scorecard ?? null;
  const scorecardFeedback = scorecard?.feedback ?? null;
  const isAiScorecard = scorecardFeedback?.scoring_method === "ai_hybrid_v1";
  const persistedPublicTests = scorecardFeedback?.public_tests;
  const displayPublicTestSummary =
    persistedPublicTests
      ? {
          passed: persistedPublicTests.passed,
          failed: persistedPublicTests.failed,
          total: persistedPublicTests.total,
          executable:
            persistedPublicTests.executable ??
            (savedAttempt?.attempt.language === "javascript" ||
              savedAttempt?.attempt.language === "python"),
          timedOut: persistedPublicTests.timedOut ?? false,
        }
      : publicTestSummary
        ? {
            ...publicTestSummary,
            timedOut: false,
          }
        : null;
  const overallScore = scorecard?.overall_score ?? savedAttempt?.attempt.overall_score ?? null;
  const resultBand = scorecard?.result_band ?? savedAttempt?.attempt.result_band ?? null;
  const hasScoreSummaryOnly =
    Boolean(savedAttempt) && !scorecard && (overallScore !== null || resultBand !== null);
  const gradingFailed = grading === "failed";
  const capsApplied = scorecardFeedback?.caps_applied ?? [];
  const recommendedNextTopic = scorecardFeedback?.recommended_next_topic ?? null;
  const aiSummary = scorecardFeedback?.summary ?? null;
  const categoryOrder: ScoreCategoryKey[] = [
    "problem_understanding",
    "communication",
    "algorithmic_approach",
    "code_correctness",
    "code_quality",
    "testing_debugging",
    "complexity_analysis",
    "hints_followups",
  ];

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-10">
        <div className="w-full max-w-lg">
          <div className="rounded-[36px] border border-slate-200 bg-white p-10 shadow-[0_36px_120px_-56px_rgba(15,23,42,0.4)]">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <svg
                className="animate-spin text-slate-400"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            </div>
            <p className="mt-6 text-lg font-semibold text-slate-950">Saving your attempt…</p>
            <p className="mt-2 text-sm text-slate-500">
              Hang on while we record your submission.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="w-full max-w-3xl">
        <div className="rounded-[36px] border border-slate-200 bg-white p-10 shadow-[0_36px_120px_-56px_rgba(15,23,42,0.4)]">
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
                : scorecard
                  ? isAiScorecard
                    ? "Your attempt has been saved with AI-assisted feedback and backend-controlled scoring based on your public test results and interview fields."
                    : "Your attempt has been saved with a deterministic Phase 4A score based on public tests and the interview fields you completed."
                  : gradingFailed
                    ? "Your attempt was saved, but feedback generation did not complete. The saved attempt details are shown below."
                    : hasScoreSummaryOnly
                      ? "Your attempt has been saved with a score summary, but the detailed scorecard row could not be loaded."
                      : "Your attempt has been saved. This one was recorded before scorecards were enabled."}
            </p>
          )}

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
                <p className="text-sm text-slate-900">
                  {LANGUAGE_LABELS[language ?? ""] ?? language}
                </p>
              </div>
              {mode && (
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-slate-700">Mode</p>
                  <p className="text-sm text-slate-900">{MODE_LABELS[mode] ?? mode}</p>
                </div>
              )}
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-slate-700">Submitted</p>
                <p className="text-right text-sm text-slate-900">{formatDateTime(submittedAt)}</p>
              </div>
              {timeTaken !== null && (
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-slate-700">Time taken</p>
                  <p className="text-sm text-slate-900">{formatDuration(timeTaken)}</p>
                </div>
              )}
            </div>
          )}

          {savedAttempt && !fetchError && (
            <div className="mt-4 rounded-[16px] border border-slate-100 bg-slate-50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Score summary
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                    {overallScore !== null ? `${overallScore}/100` : "Not scored yet"}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {resultBand ??
                      (hasScoreSummaryOnly
                        ? "Score summary saved; result band unavailable."
                        : "This attempt was recorded before scorecards were enabled.")}
                  </p>
                </div>
                {scorecard && (
                  <div className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                    {isAiScorecard ? "AI Grading Phase 4B.3" : "Deterministic Phase 4A"}
                  </div>
                )}
                {hasScoreSummaryOnly && (
                  <div className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                    Score summary only
                  </div>
                )}
                {gradingFailed && !scorecard && (
                  <div className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                    Feedback unavailable
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Assessment integrity section ── */}
          {savedAttempt?.attempt.mode === "assessment" && integritySummary && (
            <div className="mt-4 rounded-[16px] border border-slate-100 bg-slate-50 p-4">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Assessment integrity
              </p>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-700">Integrity status</p>
                  <p className="mt-0.5 text-sm font-semibold capitalize text-slate-950">
                    {integritySummary.finalStatus}
                  </p>
                </div>
                <div>
                  <p className="text-right text-sm font-medium text-slate-700">Events logged</p>
                  <p className="mt-0.5 text-right text-sm text-slate-900">
                    {integritySummary.totalEvents}
                    {integritySummary.highCount > 0 && (
                      <span className="ml-1 text-xs text-red-600">
                        ({integritySummary.highCount} high)
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                Integrity events record observable environment interruptions (tab switches,
                fullscreen exits, etc.). They do not prove misconduct.
              </p>
            </div>
          )}

          {scorecard && (
            <>
              <div className="mt-4 rounded-[16px] border border-slate-100 bg-slate-50 p-4">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Category breakdown
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {categoryOrder.map((key) => (
                    <div key={key} className="rounded-[14px] border border-white bg-white px-3 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-slate-700">{CATEGORY_LABELS[key]}</p>
                        <p className="text-sm font-semibold text-slate-950">{scorecard[key]}/10</p>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {scorecardFeedback?.category_feedback?.[key]?.evidence ??
                          scorecardFeedback?.category_explanations?.[key] ??
                          "No category evidence was saved for this score."}
                      </p>
                      {scorecardFeedback?.category_feedback?.[key]?.improvement && (
                        <p className="mt-2 text-xs leading-5 text-slate-700">
                          Improve: {scorecardFeedback.category_feedback[key]?.improvement}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-[16px] border border-slate-100 bg-slate-50 p-4">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Public test summary
                </p>
                {displayPublicTestSummary?.executable ? (
                  <>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                        {displayPublicTestSummary.passed} passed
                      </span>
                      {displayPublicTestSummary.failed > 0 && (
                        <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                          {displayPublicTestSummary.failed} failed
                        </span>
                      )}
                      {displayPublicTestSummary.timedOut && (
                        <span className="rounded-full border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
                          timed out
                        </span>
                      )}
                      <span className="text-xs text-slate-400">
                        of {displayPublicTestSummary.total} public test
                        {displayPublicTestSummary.total !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <p className="text-xs leading-6 text-slate-500">
                      {isAiScorecard
                        ? "Hidden tests were deferred in Phase 4B.3 and are not included in this score yet."
                        : "Hidden tests are not executed or included in this score yet."}
                    </p>
                  </>
                ) : (
                  <p className="text-sm leading-7 text-slate-600">
                    C++ execution is not supported yet, so code correctness could not be verified
                    for this attempt.
                  </p>
                )}
              </div>

              <div className="mt-4 rounded-[16px] border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm leading-7 text-slate-600">
                  {isAiScorecard
                    ? "This score uses AI-assisted rubric feedback with backend-controlled scoring and public-test-backed correctness. Hidden-test-backed scoring remains a future phase."
                    : "This is a deterministic Phase 4A score based on public tests and completed interview fields. AI feedback and hidden-test scoring are not included yet."}
                </p>
                <ul className="mt-3 space-y-1 text-sm text-slate-500">
                  {scorecardFeedback?.limitations?.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              {aiSummary && (
                <div className="mt-4 rounded-[16px] border border-slate-100 bg-slate-50 p-4">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Summary
                  </p>
                  <p className="text-sm leading-7 text-slate-700">{aiSummary}</p>
                </div>
              )}

              {scorecard.strengths.length > 0 && (
                <div className="mt-4 rounded-[16px] border border-slate-100 bg-slate-50 p-4">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Strengths
                  </p>
                  <ul className="space-y-2 text-sm text-slate-700">
                    {scorecard.strengths.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {scorecard.weaknesses.length > 0 && (
                <div className="mt-4 rounded-[16px] border border-slate-100 bg-slate-50 p-4">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Weaknesses
                  </p>
                  <ul className="space-y-2 text-sm text-slate-700">
                    {scorecard.weaknesses.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {scorecard.improvement_tasks.length > 0 && (
                <div className="mt-4 rounded-[16px] border border-slate-100 bg-slate-50 p-4">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Improvement tasks
                  </p>
                  <ul className="space-y-2 text-sm text-slate-700">
                    {scorecard.improvement_tasks.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {recommendedNextTopic && (
                <div className="mt-4 rounded-[16px] border border-slate-100 bg-slate-50 p-4">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Recommended next topic
                  </p>
                  <p className="text-sm text-slate-700">{recommendedNextTopic}</p>
                </div>
              )}

              {capsApplied.length > 0 && (
                <div className="mt-4 rounded-[16px] border border-slate-100 bg-slate-50 p-4">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Score caps applied
                  </p>
                  <ul className="space-y-2 text-sm text-slate-700">
                    {capsApplied.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {isAiScorecard && (
                <div className="mt-4 rounded-[16px] border border-slate-100 bg-slate-50 p-4">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Grading metadata
                  </p>
                  <div className="space-y-2 text-sm text-slate-700">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-slate-600">Scoring method</p>
                      <p className="text-right">{scorecardFeedback?.scoring_method ?? "—"}</p>
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-slate-600">Rubric version</p>
                      <p className="text-right">{scorecard.rubric_version}</p>
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-slate-600">Model</p>
                      <p className="text-right">{scorecard.model_used ?? "Not recorded"}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

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
                  of {storedResult.summary.total} public test
                  {storedResult.summary.total !== 1 ? "s" : ""}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Saved locally — not persisted to the database.
              </p>
            </div>
          )}

          <div className="mt-4 rounded-[12px] border border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-xs text-slate-400">Attempt ID</p>
            <p className="mt-0.5 break-all font-mono text-xs text-slate-600">{attemptId}</p>
          </div>

          {!scorecard && savedAttempt && !fetchError && (
            <div className="mt-6 rounded-[16px] border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-900">
              {gradingFailed
                ? "This attempt was saved, but AI feedback generation did not complete. Retry support for grading failures has not been added yet."
                : hasScoreSummaryOnly
                  ? "A score summary exists, but the detailed scorecard row could not be loaded. This can happen if scorecard insertion failed or the scorecard was created before detailed scorecard fetching was available."
                  : "This attempt was recorded before scorecards were enabled. Submit a new attempt to see the saved score breakdown."}
            </div>
          )}

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
