"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { fetchAttemptById } from "@/lib/attempts-service";
import type { SavedAttemptResult } from "@/lib/attempts-service";
import {
  getCapsApplied,
  getCategoryFeedback,
  getGradingMetadata,
  getHiddenTestStatus,
  getLimitations,
  getPhaseMarker,
  getPublicTestSummary,
  getRecommendedNextTopic,
  getScoringMethod,
  getSummary,
  SCORECARD_CATEGORY_LABELS,
  SCORECARD_CATEGORY_ORDER,
} from "@/lib/scorecard-feedback";

const LANGUAGE_LABELS: Record<string, string> = {
  javascript: "JavaScript",
  python: "Python",
  cpp: "C++",
};

const MODE_LABELS: Record<string, string> = {
  practice: "Practice",
  assessment: "Assessment",
};

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

type IntegritySummary = {
  finalStatus: string;
  totalEvents: number;
  lowCount: number;
  mediumCount: number;
  highCount: number;
};

type Props = {
  params: Promise<{ attemptId: string }>;
  searchParams: Promise<{ questionId?: string; grading?: string }>;
};

function formatDuration(seconds: number | null): string {
  if (!seconds) return "—";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
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

function formatDifficulty(value: string | null): string {
  if (!value) return "—";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getScorecardVariant(savedAttempt: SavedAttemptResult | null) {
  const scoringMethod = getScoringMethod(savedAttempt?.scorecard ?? null);

  if (scoringMethod === "ai_hybrid_v1") {
    return {
      label: "AI Grading Phase 4B.4",
      tone: "border-sky-200 bg-sky-50 text-sky-700",
      summary:
        "Phase 4B.4 keeps correctness public-test-backed while presenting the saved AI scorecard more clearly. Hidden-test-backed scoring is still deferred.",
    };
  }

  return {
    label: "Deterministic Scorecard",
    tone: "border-slate-200 bg-slate-100 text-slate-700",
    summary:
      "This older scorecard uses deterministic public-test-backed scoring without the newer AI evidence metadata.",
  };
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className="text-right text-sm text-slate-950">{value}</p>
    </div>
  );
}

function SectionTitle({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-lg font-semibold text-slate-950">{title}</h2>
      {subtitle && <p className="mt-1 text-sm leading-6 text-slate-600">{subtitle}</p>}
    </div>
  );
}

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
      const parsed = JSON.parse(raw) as StoredResult;
      sessionStorage.removeItem("mockr_last_result");
      return parsed;
    } catch {
      return null;
    }
  });

  const [savedAttempt, setSavedAttempt] = useState<SavedAttemptResult | null>(null);
  const [loading, setLoading] = useState(!isLocal);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [integritySummary, setIntegritySummary] = useState<IntegritySummary | null>(null);

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
          setIntegritySummary(data.payload as IntegritySummary);
        }
      });
  }, [attemptId, isLocal]);

  const effectiveQuestionId =
    questionId ?? savedAttempt?.attempt.question_id ?? storedResult?.questionId;
  const questionTitle = savedAttempt?.questionTitle ?? storedResult?.questionTitle ?? "Unknown question";
  const questionTopic = savedAttempt?.questionTopic ?? "";
  const questionDifficulty = savedAttempt?.questionDifficulty ?? "";
  const language = savedAttempt?.attempt.language ?? storedResult?.language ?? "";
  const mode = savedAttempt?.attempt.mode ?? null;
  const submittedAt = savedAttempt?.attempt.submitted_at ?? null;
  const timeTaken = savedAttempt?.attempt.time_taken_seconds ?? null;
  const scorecard = savedAttempt?.scorecard ?? null;
  const displayPublicTests = getPublicTestSummary(
    scorecard,
    savedAttempt?.publicTestSummary ?? null
  );
  const hiddenTestStatus = getHiddenTestStatus(scorecard);
  const limitations = getLimitations(scorecard);
  const capsApplied = getCapsApplied(scorecard);
  const phaseMarker = getPhaseMarker(scorecard);
  const scoringMethod = getScoringMethod(scorecard);
  const gradingMetadata = getGradingMetadata(scorecard);
  const recommendedNextTopic = getRecommendedNextTopic(scorecard);
  const summary = getSummary(scorecard);
  const scorecardVariant = getScorecardVariant(savedAttempt);
  const overallScore = scorecard?.overall_score ?? savedAttempt?.attempt.overall_score ?? null;
  const resultBand = scorecard?.result_band ?? savedAttempt?.attempt.result_band ?? null;
  const gradingFailed = grading === "failed";
  const hasScoreSummaryOnly =
    Boolean(savedAttempt) && !scorecard && (overallScore !== null || resultBand !== null);

  const strengths = scorecard?.strengths ?? [];
  const weaknesses = scorecard?.weaknesses ?? [];
  const improvementTasks = scorecard?.improvement_tasks ?? [];
  const hasNarrativeFeedback =
    strengths.length > 0 ||
    weaknesses.length > 0 ||
    improvementTasks.length > 0 ||
    Boolean(summary) ||
    Boolean(recommendedNextTopic);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-10">
        <div className="w-full max-w-xl rounded-[36px] border border-slate-200 bg-white p-10 shadow-[0_36px_120px_-56px_rgba(15,23,42,0.4)]">
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
          <h1 className="mt-6 text-2xl font-semibold text-slate-950">Loading saved results…</h1>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            We are reading the persisted attempt and scorecard now.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="px-6 py-10 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-[36px] border border-slate-200 bg-white p-8 shadow-[0_36px_120px_-56px_rgba(15,23,42,0.4)]">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl">
                {fetchError ? "⚠️" : isLocal ? "📋" : "✅"}
              </div>
              <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-950">
                {fetchError ? "Result unavailable" : "Attempt recorded"}
              </h1>
              <p className="mt-3 text-base leading-7 text-slate-600">
                {fetchError
                  ? fetchError
                  : isLocal
                    ? "This result only exists in local browser state. Persisted AI scorecards are available on saved attempts."
                    : scorecard
                      ? `${scorecardVariant.summary} This score reflects this practice attempt, not a real hiring decision.`
                      : gradingFailed
                        ? "Your attempt was saved, but feedback generation did not complete. The results page stays read-only and does not fabricate missing feedback."
                        : hasScoreSummaryOnly
                          ? "Your attempt has a saved score summary, but the detailed scorecard row is missing."
                          : "Your attempt was saved, but no detailed scorecard is available for this record."}
              </p>
            </div>

            {!fetchError && savedAttempt && (
              <div className="flex flex-col gap-3 sm:items-end">
                <div className="rounded-[20px] border border-slate-100 bg-slate-50 px-5 py-4 text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Overall performance
                  </p>
                  <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
                    {overallScore !== null ? `${overallScore}/100` : "Not scored"}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {resultBand ??
                      (gradingFailed
                        ? "Feedback unavailable"
                        : "No saved result band for this attempt")}
                  </p>
                </div>

                {scorecard && (
                  <div
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${scorecardVariant.tone}`}
                  >
                    {scorecardVariant.label}
                  </div>
                )}

                {gradingFailed && !scorecard && (
                  <div className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                    Feedback unavailable
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {savedAttempt && !fetchError && (
          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <SectionTitle
                eyebrow="Overall Performance"
                title={questionTitle}
                subtitle="The saved question context and attempt details for this score."
              />

              <div className="mt-5 space-y-3 rounded-[20px] border border-slate-100 bg-slate-50 p-4">
                <InfoRow label="Topic" value={questionTopic || "—"} />
                <InfoRow label="Difficulty" value={formatDifficulty(questionDifficulty)} />
                <InfoRow label="Mode" value={mode ? MODE_LABELS[mode] ?? mode : "—"} />
                <InfoRow
                  label="Language"
                  value={LANGUAGE_LABELS[language] ?? language ?? "—"}
                />
                <InfoRow label="Submitted" value={formatDateTime(submittedAt)} />
                <InfoRow label="Time taken" value={formatDuration(timeTaken)} />
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <SectionTitle
                eyebrow="Technical Summary"
                title="Evidence-backed scoring"
                subtitle="Correctness is grounded in the saved public test summary and the attempt fields that were submitted."
              />

              <div className="mt-5 space-y-4">
                {displayPublicTests?.executable ? (
                  <>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                        {displayPublicTests.passed} passed
                      </span>
                      {displayPublicTests.failed > 0 && (
                        <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                          {displayPublicTests.failed} failed
                        </span>
                      )}
                      {displayPublicTests.timedOut && (
                        <span className="rounded-full border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
                          timed out
                        </span>
                      )}
                      <span className="text-sm text-slate-500">
                        {displayPublicTests.total} public tests
                      </span>
                    </div>
                    <p className="text-sm leading-7 text-slate-600">
                      Phase 4B.4 scoring is still public-test-backed only for correctness. Hidden
                      tests were not run here, and hidden test contents are never shown on this page.
                    </p>
                  </>
                ) : (
                  <p className="text-sm leading-7 text-slate-600">
                    No executable public-test summary was saved for this attempt. For C++, code
                    correctness could not be verified in-browser in this phase.
                  </p>
                )}

                <div className="rounded-[18px] border border-slate-100 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-700">Hidden tests</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{hiddenTestStatus}</p>
                </div>

                <div className="rounded-[18px] border border-slate-100 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-700">Trust note</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Strong communication does not fully override missing technical evidence. Backend
                    safeguards and saved test outcomes keep the score tied to observable attempt data.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {savedAttempt?.attempt.mode === "assessment" && integritySummary && (
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <SectionTitle
              eyebrow="Assessment Integrity"
              title="Observed environment interruptions"
              subtitle="These events describe the assessment environment only. They do not prove misconduct."
            />

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[18px] border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-600">Integrity status</p>
                <p className="mt-1 text-lg font-semibold capitalize text-slate-950">
                  {integritySummary.finalStatus}
                </p>
              </div>
              <div className="rounded-[18px] border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-600">Events logged</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">
                  {integritySummary.totalEvents}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {integritySummary.lowCount} low · {integritySummary.mediumCount} medium ·{" "}
                  {integritySummary.highCount} high
                </p>
              </div>
            </div>
          </section>
        )}

        {scorecard && (
          <>
            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <SectionTitle
                eyebrow="Rubric Breakdown"
                title="Score, evidence, and improvement"
                subtitle="Each rubric score is paired with the saved evidence and the next improvement target."
              />

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {SCORECARD_CATEGORY_ORDER.map((key) => {
                  const categoryFeedback = getCategoryFeedback(scorecard, key);

                  return (
                    <article
                      key={key}
                      className="rounded-[20px] border border-slate-100 bg-slate-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-sm font-semibold text-slate-900">
                          {SCORECARD_CATEGORY_LABELS[key]}
                        </h3>
                        <p className="text-sm font-semibold text-slate-950">
                          {scorecard[key]}/10
                        </p>
                      </div>

                      <div className="mt-4 space-y-3">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                            Evidence
                          </p>
                          <p className="mt-1 text-sm leading-6 text-slate-700">
                            {categoryFeedback.evidence}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                            How to improve
                          </p>
                          <p className="mt-1 text-sm leading-6 text-slate-700">
                            {categoryFeedback.improvement}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <SectionTitle
                  eyebrow="Feedback Summary"
                  title="What went well and what needs work"
                  subtitle="Narrative feedback stays tied to this saved attempt."
                />

                <div className="mt-5 space-y-4">
                  <div className="rounded-[18px] border border-slate-100 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-900">Strengths</p>
                    {strengths.length > 0 ? (
                      <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-700">
                        {strengths.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        No specific strengths were stored for this older scorecard.
                      </p>
                    )}
                  </div>

                  <div className="rounded-[18px] border border-slate-100 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-900">Weaknesses</p>
                    {weaknesses.length > 0 ? (
                      <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-700">
                        {weaknesses.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        No specific weaknesses were stored for this older scorecard.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <SectionTitle
                  eyebrow="Next Steps"
                  title="Concrete follow-up"
                  subtitle="Use this section to decide what to practise next."
                />

                <div className="mt-5 space-y-4">
                  <div className="rounded-[18px] border border-slate-100 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-900">Improvement tasks</p>
                    {improvementTasks.length > 0 ? (
                      <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-700">
                        {improvementTasks.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        No saved improvement tasks were stored for this scorecard.
                      </p>
                    )}
                  </div>

                  {recommendedNextTopic && (
                    <div className="rounded-[18px] border border-slate-100 bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-900">Recommended next topic</p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {recommendedNextTopic}
                      </p>
                    </div>
                  )}

                  {summary && (
                    <div className="rounded-[18px] border border-slate-100 bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-900">Summary paragraph</p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">{summary}</p>
                    </div>
                  )}

                  {!hasNarrativeFeedback && (
                    <div className="rounded-[18px] border border-slate-100 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                      No additional narrative feedback was stored for this scorecard.
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <SectionTitle
                eyebrow="Reliability / Metadata"
                title="How this score was produced"
                subtitle="This section stays subtle, but it explains the backend safeguards and stored metadata behind the score."
              />

              <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <div className="space-y-4">
                  <div className="rounded-[18px] border border-slate-100 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-900">Score caps</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Score caps are backend safeguards. They prevent strong written communication
                      from fully overriding missing technical evidence or failed required checks.
                    </p>
                    {capsApplied.length > 0 ? (
                      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                        {capsApplied.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        No score caps were applied to this attempt.
                      </p>
                    )}
                  </div>

                  <div className="rounded-[18px] border border-slate-100 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-900">Limitations</p>
                    <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-700">
                      {limitations.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="rounded-[18px] border border-slate-100 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">Saved metadata</p>
                  <div className="mt-3 space-y-3">
                    <InfoRow label="Rubric version" value={scorecard.rubric_version} />
                    <InfoRow label="Model used" value={scorecard.model_used ?? "Not recorded"} />
                    <InfoRow label="Scoring method" value={scoringMethod ?? "Not recorded"} />
                    <InfoRow label="Phase marker" value={phaseMarker ?? "Not recorded"} />
                    <InfoRow
                      label="Hints used"
                      value={
                        gradingMetadata?.hints_used !== undefined
                          ? String(gradingMetadata.hints_used)
                          : "Not recorded"
                      }
                    />
                    <InfoRow
                      label="Run count"
                      value={
                        gradingMetadata?.run_count !== undefined &&
                        gradingMetadata.run_count !== null
                          ? String(gradingMetadata.run_count)
                          : "Not recorded"
                      }
                    />
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {isLocal && storedResult?.summary && (
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <SectionTitle
              eyebrow="Local Result"
              title="Browser-only public test summary"
              subtitle="This fallback result was not persisted to the database."
            />

            <div className="mt-5 rounded-[18px] border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-700">
                {storedResult.questionTitle} · {LANGUAGE_LABELS[storedResult.language] ?? storedResult.language}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
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
                <span className="text-sm text-slate-500">
                  {storedResult.summary.total} public tests
                </span>
              </div>
            </div>
          </section>
        )}

        {!scorecard && savedAttempt && !fetchError && (
          <section className="rounded-[28px] border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <SectionTitle
              eyebrow={gradingFailed ? "Grading Failure" : "Missing Scorecard"}
              title={gradingFailed ? "Feedback generation failed" : "Detailed feedback is unavailable"}
              subtitle={
                gradingFailed
                  ? "Retry grading is not available yet. Your attempt was saved and this page remains read-only."
                  : hasScoreSummaryOnly
                    ? "A score summary exists, but the detailed scorecard row could not be loaded."
                    : "This saved attempt does not have a detailed scorecard to render."
              }
            />

            <div className="mt-5 rounded-[18px] border border-amber-200 bg-white/70 p-4 text-sm leading-6 text-amber-950">
              {gradingFailed
                ? "No AI feedback, category evidence, or improvement recommendations are shown here because they were not successfully generated and persisted."
                : hasScoreSummaryOnly
                  ? "The page will show only saved attempt basics and any saved score summary. It will not fabricate missing category evidence or summary text."
                  : "This page is intentionally read-only. Refreshing it will not create a scorecard or regenerate feedback."}
            </div>
          </section>
        )}

        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-400">Attempt ID</p>
          <p className="mt-1 break-all font-mono text-xs text-slate-600">{attemptId}</p>
        </section>

        <section className="flex flex-col gap-3 sm:flex-row">
          {effectiveQuestionId && (
            <button
              onClick={() => router.push(`/practice/${effectiveQuestionId}`)}
              className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-950 bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] transition hover:bg-slate-800"
            >
              Retry question
            </button>
          )}
          <Link
            href="/questions"
            className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-300 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-200"
          >
            Back to questions
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Dashboard
          </Link>
        </section>
      </div>
    </main>
  );
}
