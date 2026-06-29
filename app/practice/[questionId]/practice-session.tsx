"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  buildDraftKey,
  loadDraft,
  saveDraft,
  clearDraft,
  buildEmptyDraft,
} from "@/lib/practice-draft";
import { runPublicTests } from "@/lib/public-test-runner";
import type { Question, QuestionExample, QuestionTestCase } from "@/types/question";
import type { PracticeMode, SupportedLanguage, PracticeDraft, InterviewPanel } from "@/types/practice";
import type { PublicTestRunSummary, PublicTestRunResult } from "@/types/test-run";

const CodeEditor = dynamic(() => import("@/components/code-editor"), { ssr: false });

const INTERVIEW_PANELS: InterviewPanel[] = [
  "clarification",
  "approach",
  "testing",
  "complexity",
  "submit",
];

const PANEL_LABELS: Record<InterviewPanel, string> = {
  clarification: "Clarification",
  approach: "Approach",
  testing: "Testing & Edge Cases",
  complexity: "Complexity",
  submit: "Submit Review",
};

const LANGUAGE_OPTIONS: { id: SupportedLanguage; label: string }[] = [
  { id: "javascript", label: "JavaScript" },
  { id: "python", label: "Python" },
  { id: "cpp", label: "C++" },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "#10b981",
  medium: "#f59e0b",
  hard: "#ef4444",
};

function formatExampleValue(value: unknown): string {
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}

function formatValue(value: unknown): string {
  if (value === undefined) return "";
  if (typeof value === "string") return JSON.stringify(value);
  return JSON.stringify(value, null, 0);
}

type Props = {
  question: Question;
  testCases: QuestionTestCase[];
  initialMode: PracticeMode;
  initialLanguage: SupportedLanguage;
  userId: string;
};

export default function PracticeSession({
  question,
  testCases,
  initialMode,
  initialLanguage,
  userId,
}: Props) {
  const router = useRouter();
  const draftKey = buildDraftKey(userId, question.id, initialMode);

  const [draft, setDraft] = useState<PracticeDraft>(() => {
    const saved = loadDraft(draftKey);
    return saved ?? buildEmptyDraft(initialLanguage);
  });

  const [timerSeconds, setTimerSeconds] = useState(() => {
    const saved = loadDraft(draftKey);
    return saved?.timerSeconds ?? 0;
  });

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [langSwitchTarget, setLangSwitchTarget] = useState<SupportedLanguage | null>(null);
  const [testSummary, setTestSummary] = useState<PublicTestRunSummary | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showSubmitWarning, setShowSubmitWarning] = useState(false);
  const [pendingSubmitSummary, setPendingSubmitSummary] = useState<PublicTestRunSummary | null>(null);

  const currentLanguage = draft.selectedLanguage;
  const starterCode = question.starter_code?.[currentLanguage] ?? "";
  const currentCode = draft.codeByLanguage[currentLanguage] ?? starterCode;
  const currentPanelIdx = INTERVIEW_PANELS.indexOf(draft.currentPanel);
  const isExecutable = currentLanguage === "javascript" || currentLanguage === "python";

  // Assessment mode timer
  useEffect(() => {
    if (initialMode !== "assessment") return;
    const interval = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [initialMode]);

  // Persist draft whenever it changes
  const persist = useCallback(
    (d: PracticeDraft, t: number) => saveDraft(draftKey, { ...d, timerSeconds: t }),
    [draftKey]
  );

  useEffect(() => {
    persist(draft, timerSeconds);
  }, [draft, timerSeconds, persist]);

  function updateDraft(changes: Partial<PracticeDraft>) {
    setDraft((prev) => ({ ...prev, ...changes }));
  }

  function setCode(code: string) {
    updateDraft({ codeByLanguage: { ...draft.codeByLanguage, [currentLanguage]: code } });
  }

  function goNextPanel() {
    const next = INTERVIEW_PANELS[currentPanelIdx + 1];
    if (next) updateDraft({ currentPanel: next });
  }

  function goPrevPanel() {
    const prev = INTERVIEW_PANELS[currentPanelIdx - 1];
    if (prev) updateDraft({ currentPanel: prev });
  }

  function confirmSwitchLanguage(lang: SupportedLanguage) {
    const existingCode = draft.codeByLanguage[currentLanguage];
    const hasModifiedCode = existingCode && existingCode !== starterCode;
    if (hasModifiedCode) {
      setLangSwitchTarget(lang);
    } else {
      updateDraft({ selectedLanguage: lang });
    }
  }

  function doSwitchLanguage() {
    if (!langSwitchTarget) return;
    updateDraft({ selectedLanguage: langSwitchTarget });
    setLangSwitchTarget(null);
  }

  function handleReset() {
    clearDraft(draftKey);
    setDraft(buildEmptyDraft(initialLanguage));
    setTimerSeconds(0);
    setTestSummary(null);
    setShowResetConfirm(false);
  }

  async function handleRun() {
    if (!isExecutable || isRunning || testCases.length === 0) return;
    setIsRunning(true);
    setTestSummary(null);
    try {
      const summary = await runPublicTests({
        language: currentLanguage,
        code: currentCode,
        functionName: question.function_name,
        testCases,
      });
      setTestSummary(summary);
    } finally {
      setIsRunning(false);
    }
  }

  function doNavigateToResults(summary: PublicTestRunSummary | null) {
    try {
      sessionStorage.setItem(
        "mockr_last_result",
        JSON.stringify({
          questionTitle: question.title,
          questionId: question.id,
          language: currentLanguage,
          summary,
        })
      );
    } catch {
      // sessionStorage may be unavailable (e.g. private browsing with strict settings)
    }
    const attemptId = `local-${Date.now()}`;
    router.push(`/results/${attemptId}?questionId=${question.id}`);
  }

  async function handleSubmit() {
    if (isRunning) return;
    if (isExecutable && testCases.length > 0) {
      setIsRunning(true);
      try {
        const summary = await runPublicTests({
          language: currentLanguage,
          code: currentCode,
          functionName: question.function_name,
          testCases,
        });
        setTestSummary(summary);
        if (summary.failed > 0 || summary.timedOut) {
          setPendingSubmitSummary(summary);
          setShowSubmitWarning(true);
          return;
        }
        doNavigateToResults(summary);
      } finally {
        setIsRunning(false);
      }
    } else {
      doNavigateToResults(null);
    }
  }

  function handleSubmitAnyway() {
    setShowSubmitWarning(false);
    doNavigateToResults(pendingSubmitSummary);
    setPendingSubmitSummary(null);
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  const isPractice = initialMode === "practice";
  const diffColor = DIFFICULTY_COLORS[question.difficulty] ?? "#9ca3af";
  const panelProgress = `${PANEL_LABELS[draft.currentPanel]} ${currentPanelIdx + 1} of ${INTERVIEW_PANELS.length}`;

  // ─── Bottom-left interview panel content ────────────────────────────────

  const PANEL_PROMPTS: Record<string, { practice: string; assessment: string }> = {
    clarification: {
      practice:
        "Before you start coding, ask any clarifying questions. Consider the inputs and outputs, edge cases, constraints, and expected return format.",
      assessment:
        "Note your clarifying questions and any assumptions you are making.",
    },
    approach: {
      practice:
        "Describe your approach before writing any code. Start with a brute-force solution, then consider optimisations. Explain which data structures you will use and why.",
      assessment: "Describe your approach and the reasoning behind it.",
    },
    testing: {
      practice: "Describe how you would test your solution.",
      assessment: "Describe your testing approach.",
    },
    complexity: {
      practice:
        "Analyse the time and space complexity of your solution. Explain your reasoning for both.",
      assessment: "State the time and space complexity of your solution.",
    },
  };

  function renderInterviewPanel() {
    const promptText =
      PANEL_PROMPTS[draft.currentPanel]?.[isPractice ? "practice" : "assessment"] ?? "";

    switch (draft.currentPanel) {
      case "clarification":
        return (
          <div className="flex flex-1 flex-col overflow-hidden">
            <p className="flex-shrink-0 px-3 pt-3 text-xs leading-6" style={{ color: "#6b7280" }}>
              {promptText}
            </p>
            <textarea
              value={draft.clarification}
              onChange={(e) => updateDraft({ clarification: e.target.value })}
              className="flex-1 resize-none bg-transparent px-3 pb-3 pt-2 text-sm leading-6 text-[#f1f5f9] outline-none"
            />
          </div>
        );

      case "approach":
        return (
          <div className="flex flex-1 flex-col overflow-hidden">
            <p className="flex-shrink-0 px-3 pt-3 text-xs leading-6" style={{ color: "#6b7280" }}>
              {promptText}
            </p>
            <textarea
              value={draft.approach}
              onChange={(e) => updateDraft({ approach: e.target.value })}
              className="flex-1 resize-none bg-transparent px-3 pb-3 pt-2 text-sm leading-6 text-[#f1f5f9] outline-none"
            />
          </div>
        );

      case "testing":
        return (
          <div className="flex flex-1 flex-col overflow-hidden">
            <p className="flex-shrink-0 px-3 pt-3 text-xs leading-6" style={{ color: "#6b7280" }}>
              {promptText}
            </p>
            <textarea
              value={draft.testingPlan}
              onChange={(e) => updateDraft({ testingPlan: e.target.value })}
              className="flex-1 resize-none bg-transparent px-3 pb-2 pt-2 text-sm leading-6 text-[#f1f5f9] outline-none"
              style={{ borderBottom: "1px solid #3a4048" }}
            />
            <p
              className="flex-shrink-0 px-3 pt-2 text-xs leading-6"
              style={{ color: "#6b7280" }}
            >
              List specific edge cases to verify.
            </p>
            <textarea
              value={draft.edgeCases}
              onChange={(e) => updateDraft({ edgeCases: e.target.value })}
              className="flex-1 resize-none bg-transparent px-3 pb-3 pt-2 text-sm leading-6 text-[#f1f5f9] outline-none"
            />
          </div>
        );

      case "complexity":
        return (
          <div className="flex flex-1 flex-col overflow-hidden">
            <p className="flex-shrink-0 px-3 pt-3 text-xs leading-6" style={{ color: "#6b7280" }}>
              {promptText}
            </p>
            <textarea
              value={draft.complexity}
              onChange={(e) => updateDraft({ complexity: e.target.value })}
              className="flex-1 resize-none bg-transparent px-3 pb-3 pt-2 text-sm leading-6 text-[#f1f5f9] outline-none"
            />
          </div>
        );

      case "submit": {
        const hasCode =
          !!draft.codeByLanguage[currentLanguage] &&
          draft.codeByLanguage[currentLanguage] !== starterCode;

        const checks = [
          { label: "Clarification", done: !!draft.clarification.trim() },
          { label: "Approach", done: !!draft.approach.trim() },
          { label: "Code written", done: hasCode },
          { label: "Testing plan", done: !!draft.testingPlan.trim() },
          { label: "Complexity", done: !!draft.complexity.trim() },
        ];

        return (
          <div className="flex flex-1 flex-col gap-3 overflow-auto p-3">
            <div className="space-y-1.5">
              {checks.map((c) => (
                <div key={c.label} className="flex items-center gap-2 text-xs">
                  <span className={c.done ? "text-[#31d67b]" : "text-[#4b5563]"}>
                    {c.done ? "✓" : "○"}
                  </span>
                  <span style={{ color: c.done ? "#d1d5db" : "#6b7280" }}>{c.label}</span>
                </div>
              ))}
            </div>

            {currentLanguage === "javascript" && (
              <p className="text-[10px] leading-4" style={{ color: "#4b5563" }}>
                Submit will run JavaScript public tests one final time, then record a local attempt.
              </p>
            )}
            {currentLanguage === "python" && (
              <p className="text-[10px] leading-4" style={{ color: "#4b5563" }}>
                Submit will run Python public tests in-browser via Pyodide, then record a local attempt.
              </p>
            )}
            {currentLanguage === "cpp" && (
              <p className="text-[10px] leading-4" style={{ color: "#4b5563" }}>
                C++ execution is coming later. Submit will record a local attempt without running tests.
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={isRunning}
              className="w-full rounded px-3 py-2 text-xs font-bold transition hover:brightness-110 active:brightness-90 disabled:opacity-50"
              style={{ background: "#31d67b", color: "#000" }}
            >
              {isRunning ? "Running tests…" : "Submit Attempt →"}
            </button>
          </div>
        );
      }
    }
  }

  // ─── Output panel ────────────────────────────────────────────────────────

  function renderOutputPanel() {
    const monoStyle: React.CSSProperties = {
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      fontSize: 12,
    };

    if (!isExecutable) {
      return (
        <div className="flex h-full flex-col justify-center px-4 py-4">
          <p style={{ color: "#6b7280", ...monoStyle }}>
            C++ execution is coming later.
          </p>
          <p style={{ color: "#374151", ...monoStyle, marginTop: 4 }}>
            JavaScript and Python are supported now.
          </p>
        </div>
      );
    }

    if (testCases.length === 0) {
      return (
        <div className="flex h-full flex-col justify-center px-4 py-4">
          <p style={{ color: "#6b7280", ...monoStyle }}>
            No public test cases found for this question.
          </p>
        </div>
      );
    }

    if (isRunning) {
      return (
        <div className="flex h-full flex-col justify-center px-4 py-4">
          <p style={{ color: "#9ca3af", ...monoStyle }}>
            Running {testCases.length} public test{testCases.length !== 1 ? "s" : ""}…
          </p>
          {currentLanguage === "python" && (
            <p style={{ color: "#4b5563", ...monoStyle, marginTop: 4 }}>
              Loading Python environment — first run may take 10–30 s.
            </p>
          )}
        </div>
      );
    }

    if (!testSummary) {
      return (
        <div className="flex h-full flex-col justify-center px-4 py-4">
          <p style={{ color: "#4b5563", ...monoStyle }}>
            Ready. Click Run to execute {testCases.length} public test{testCases.length !== 1 ? "s" : ""}.
            {currentLanguage === "python" ? " (Pyodide Python runner)" : ""}
          </p>
        </div>
      );
    }

    return (
      <div className="h-full overflow-auto px-4 py-3">
        {/* Summary row */}
        <div className="mb-3 flex items-center gap-3">
          {testSummary.timedOut ? (
            <span
              className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              style={{ background: "#7c3aed22", color: "#a78bfa" }}
            >
              Timeout
            </span>
          ) : (
            <>
              <span
                className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                style={{ background: "#10b98122", color: "#10b981" }}
              >
                {testSummary.passed} passed
              </span>
              {testSummary.failed > 0 && (
                <span
                  className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                  style={{ background: "#ef444422", color: "#ef4444" }}
                >
                  {testSummary.failed} failed
                </span>
              )}
              <span className="text-[10px]" style={{ color: "#4b5563" }}>
                of {testSummary.total} public test{testSummary.total !== 1 ? "s" : ""}
              </span>
            </>
          )}
        </div>

        {/* Per-test results */}
        <div className="space-y-2">
          {testSummary.results.map((r: PublicTestRunResult, idx: number) => (
            <TestResultRow key={r.testCaseId} result={r} index={idx} />
          ))}
        </div>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div
      className="flex h-screen flex-col overflow-hidden"
      style={{ background: "#1f2328", color: "#fff" }}
    >
      {/* ── Top bar ── */}
      <div
        className="flex flex-shrink-0 items-center gap-3 px-4 py-2.5"
        style={{ background: "#24292f", borderBottom: "1px solid #3a4048" }}
      >
        <Link
          href="/questions"
          className="flex items-center gap-1 text-xs transition hover:text-white"
          style={{ color: "#6b7280" }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Questions
        </Link>

        <div className="h-3.5 w-px flex-shrink-0" style={{ background: "#3a4048" }} />

        <span className="text-[11px] font-black tracking-widest" style={{ color: "#31d67b" }}>
          MOCKR.AI
        </span>

        <div className="h-3.5 w-px flex-shrink-0" style={{ background: "#3a4048" }} />

        <span className="flex-1 truncate text-sm font-semibold text-white">
          {question.title}
        </span>

        <span
          className="flex-shrink-0 rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
          style={{
            background: initialMode === "assessment" ? "#7c3aed22" : "#0ea5e922",
            color: initialMode === "assessment" ? "#a78bfa" : "#38bdf8",
          }}
        >
          {initialMode}
        </span>

        {initialMode === "assessment" && (
          <span
            className="flex-shrink-0 font-mono text-sm font-semibold tabular-nums"
            style={{ color: "#f87171" }}
          >
            {formatTime(timerSeconds)}
          </span>
        )}

        <span
          className="flex-shrink-0 rounded px-2 py-0.5 font-mono text-[10px] font-semibold"
          style={{ background: "#3a4048", color: "#e2e8f0" }}
        >
          {LANGUAGE_OPTIONS.find((l) => l.id === currentLanguage)?.label ?? currentLanguage}
        </span>

      </div>

      {/* ── Main two-column layout ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT COLUMN (40%) ── */}
        <div
          className="flex w-[40%] flex-shrink-0 flex-col overflow-hidden"
          style={{ borderRight: "1px solid #3a4048" }}
        >

          {/* TOP-LEFT: Problem (~2/3) — always visible, scrollable */}
          <div
            className="flex-1 overflow-y-auto p-5"
            style={{ borderBottom: "1px solid #3a4048" }}
          >
            {/* Meta row */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span
                className="rounded px-2 py-0.5 text-[10px] font-bold capitalize"
                style={{ background: `${diffColor}22`, color: diffColor }}
              >
                {question.difficulty}
              </span>
              <span className="text-xs" style={{ color: "#9ca3af" }}>
                {question.topic}
              </span>
              <span style={{ color: "#4b5563" }}>·</span>
              <span className="text-xs" style={{ color: "#9ca3af" }}>
                ⏱ {question.estimated_minutes} min
              </span>
            </div>

            {/* Problem statement */}
            <p className="mb-5 text-sm leading-7" style={{ color: "#e2e8f0" }}>
              {question.problem_statement}
            </p>

            {question.input_description && (
              <div className="mb-3">
                <p
                  className="mb-1 text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: "#6b7280" }}
                >
                  Input
                </p>
                <p className="text-xs leading-5" style={{ color: "#9ca3af" }}>
                  {question.input_description}
                </p>
              </div>
            )}

            {question.output_description && (
              <div className="mb-3">
                <p
                  className="mb-1 text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: "#6b7280" }}
                >
                  Output
                </p>
                <p className="text-xs leading-5" style={{ color: "#9ca3af" }}>
                  {question.output_description}
                </p>
              </div>
            )}

            {question.constraints && (
              <div className="mb-4">
                <p
                  className="mb-1 text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: "#6b7280" }}
                >
                  Constraints
                </p>
                <pre
                  className="whitespace-pre-wrap font-mono text-[11px] leading-5"
                  style={{ color: "#9ca3af" }}
                >
                  {question.constraints}
                </pre>
              </div>
            )}

            {Array.isArray(question.examples) && question.examples.length > 0 && (
              <div>
                <p
                  className="mb-2 text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: "#6b7280" }}
                >
                  Examples
                </p>
                <div className="space-y-2">
                  {question.examples.map((ex: QuestionExample, i: number) => (
                    <div
                      key={i}
                      className="rounded p-3"
                      style={{ background: "#2b3036", border: "1px solid #3a4048" }}
                    >
                      <p
                        className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider"
                        style={{ color: "#6b7280" }}
                      >
                        Example {i + 1}
                      </p>
                      <div className="font-mono text-xs" style={{ color: "#d1d5db" }}>
                        <div>
                          <span style={{ color: "#6b7280" }}>In: </span>
                          {formatExampleValue(ex.input)}
                        </div>
                        <div className="mt-0.5">
                          <span style={{ color: "#6b7280" }}>Out: </span>
                          {formatExampleValue(ex.output)}
                        </div>
                      </div>
                      {ex.explanation && (
                        <p
                          className="mt-1.5 text-[10px] leading-4"
                          style={{ color: "#6b7280" }}
                        >
                          {ex.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* BOTTOM-LEFT: Interview panel (~1/3) */}
          <div className="flex flex-1 flex-col overflow-hidden" style={{ minHeight: 0 }}>
            {/* Panel header with prev/next */}
            <div
              className="flex flex-shrink-0 items-center justify-between px-3 py-2"
              style={{ borderBottom: "1px solid #3a4048", background: "#24292f" }}
            >
              <button
                onClick={goPrevPanel}
                disabled={currentPanelIdx === 0}
                className="flex h-5 w-5 items-center justify-center rounded transition hover:text-white disabled:opacity-25"
                style={{ color: "#9ca3af" }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              <span
                className="text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: "#9ca3af" }}
              >
                {panelProgress}
              </span>

              <button
                onClick={goNextPanel}
                disabled={currentPanelIdx === INTERVIEW_PANELS.length - 1}
                className="flex h-5 w-5 items-center justify-center rounded transition hover:text-white disabled:opacity-25"
                style={{ color: "#9ca3af" }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>

            {/* Panel content */}
            <div className="flex flex-1 flex-col overflow-hidden">
              {renderInterviewPanel()}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN (60%) ── */}
        <div className="flex flex-1 flex-col overflow-hidden">

          {/* Editor toolbar */}
          <div
            className="flex flex-shrink-0 items-center gap-2 px-4 py-2"
            style={{ background: "#24292f", borderBottom: "1px solid #3a4048" }}
          >
            {/* Language tabs */}
            <div className="flex gap-1">
              {LANGUAGE_OPTIONS.filter((l) =>
                question.supported_languages.includes(l.id)
              ).map((l) => (
                <button
                  key={l.id}
                  onClick={() => confirmSwitchLanguage(l.id)}
                  className="rounded px-3 py-1 text-xs font-semibold transition"
                  style={{
                    background: currentLanguage === l.id ? "#3a4048" : "transparent",
                    color: currentLanguage === l.id ? "#fff" : "#9ca3af",
                  }}
                >
                  {l.label}
                </button>
              ))}
            </div>

            <div className="flex-1" />

            {/* Reload starter code */}
            <button
              onClick={() => setShowResetConfirm(true)}
              aria-label="Reload starter code"
              title="Reload starter code"
              className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full transition hover:text-white"
              style={{ background: "#3a4048", color: "#9ca3af" }}
            >
              <svg width="10" height="10" viewBox="-1 -1 26 26" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {/* Arc: 3 o'clock → clockwise 300° → 1 o'clock */}
                <path d="M20 12A8 8 0 1 1 16 5" />
                {/* Arrowhead at 1 o'clock, arms 2× original */}
                <polyline points="12 1 16 5 12 9" />
              </svg>
            </button>

            {/* Run button — active for JS and Python, disabled for C++ */}
            {isExecutable ? (
              <button
                onClick={handleRun}
                disabled={isRunning || testCases.length === 0}
                className="flex items-center gap-1.5 rounded px-3 py-1 text-xs font-bold transition hover:brightness-110 active:brightness-90 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ background: "#31d67b", color: "#000" }}
              >
                {isRunning ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="7" height="9" viewBox="0 0 9 11" fill="currentColor">
                    <path d="M0 0L9 5.5L0 11V0Z" />
                  </svg>
                )}
                {isRunning ? "Running…" : "Run"}
              </button>
            ) : (
              <>
                <button
                  disabled
                  title="C++ execution is coming later."
                  className="flex cursor-not-allowed items-center gap-1.5 rounded px-3 py-1 text-xs font-bold opacity-40"
                  style={{ background: "#31d67b", color: "#000" }}
                >
                  <svg width="7" height="9" viewBox="0 0 9 11" fill="currentColor">
                    <path d="M0 0L9 5.5L0 11V0Z" />
                  </svg>
                  Run
                </button>
                <span className="text-[9px]" style={{ color: "#4b5563" }}>Not available</span>
              </>
            )}
          </div>

          {/* Monaco editor (~2/3 of right column) */}
          <div className="flex-[2] overflow-hidden" style={{ minHeight: 0 }}>
            <CodeEditor code={currentCode} language={currentLanguage} onChange={setCode} disableSuggestions />
          </div>

          {/* Divider */}
          <div className="flex-shrink-0" style={{ height: 1, background: "#3a4048" }} />

          {/* Output panel (~1/3 of right column) */}
          <div
            className="flex-[1] overflow-hidden"
            style={{ background: "#161b22", minHeight: 0 }}
          >
            <div className="flex h-full flex-col">
              {/* Output header */}
              <div
                className="flex flex-shrink-0 items-center gap-2 px-4 py-2"
                style={{ borderBottom: "1px solid #1e242b" }}
              >
                <p
                  className="text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: "#4b5563" }}
                >
                  Output
                </p>
                {testSummary && !testSummary.timedOut && (
                  <span
                    className="text-[10px]"
                    style={{ color: testSummary.failed === 0 ? "#10b981" : "#ef4444" }}
                  >
                    {testSummary.failed === 0
                      ? `All ${testSummary.total} tests passed`
                      : `${testSummary.passed}/${testSummary.total} passed`}
                  </span>
                )}
              </div>

              {/* Output content */}
              <div className="flex-1 overflow-hidden">
                {renderOutputPanel()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Language switch confirm modal ── */}
      {langSwitchTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            className="mx-4 max-w-sm rounded-[16px] p-6 shadow-xl"
            style={{ background: "#24292f", border: "1px solid #3a4048" }}
          >
            <p className="text-sm font-semibold text-white">Switch language?</p>
            <p className="mt-2 text-xs leading-5" style={{ color: "#9ca3af" }}>
              Your current{" "}
              {LANGUAGE_OPTIONS.find((l) => l.id === currentLanguage)?.label} code will be saved
              — you can switch back any time.
            </p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={doSwitchLanguage}
                className="flex-1 rounded px-3 py-2 text-xs font-bold transition hover:brightness-110"
                style={{ background: "#31d67b", color: "#000" }}
              >
                Switch to {LANGUAGE_OPTIONS.find((l) => l.id === langSwitchTarget)?.label}
              </button>
              <button
                onClick={() => setLangSwitchTarget(null)}
                className="flex-1 rounded px-3 py-2 text-xs font-semibold transition"
                style={{ background: "#3a4048", color: "#9ca3af" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Submit warning modal ── */}
      {showSubmitWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            className="relative mx-4 max-w-sm rounded-[16px] p-6 shadow-xl"
            style={{ background: "#24292f", border: "1px solid #3a4048" }}
          >
            <button
              onClick={() => setShowSubmitWarning(false)}
              className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded transition hover:text-white"
              style={{ color: "#6b7280" }}
              aria-label="Dismiss"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <p className="text-sm font-semibold text-white">Some tests are not passing</p>
            <p className="mt-2 text-xs leading-5" style={{ color: "#9ca3af" }}>
              Some public tests are not passing. You can still submit, but your result summary
              will show the failures.
            </p>
            <div className="mt-4">
              <button
                onClick={handleSubmitAnyway}
                className="w-full rounded px-3 py-2 text-xs font-bold transition hover:brightness-110"
                style={{ background: "#31d67b", color: "#000" }}
              >
                Submit anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reset draft confirm modal ── */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            className="mx-4 max-w-sm rounded-[16px] p-6 shadow-xl"
            style={{ background: "#24292f", border: "1px solid #3a4048" }}
          >
            <p className="text-sm font-semibold text-white">Reset draft?</p>
            <p className="mt-2 text-xs leading-5" style={{ color: "#9ca3af" }}>
              This clears all notes, code, and progress for this question. This cannot be undone.
            </p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 rounded px-3 py-2 text-xs font-semibold text-white transition hover:brightness-110"
                style={{ background: "#ef4444" }}
              >
                Reset
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 rounded px-3 py-2 text-xs font-semibold transition"
                style={{ background: "#3a4048", color: "#9ca3af" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Test result row component ───────────────────────────────────────────────

function TestResultRow({ result, index }: { result: PublicTestRunResult; index: number }) {
  const [expanded, setExpanded] = useState(false);

  const statusColor: Record<string, string> = {
    passed: "#10b981",
    failed: "#ef4444",
    error: "#f59e0b",
    timeout: "#a78bfa",
  };

  const statusBg: Record<string, string> = {
    passed: "#10b98122",
    failed: "#ef444422",
    error: "#f59e0b22",
    timeout: "#7c3aed22",
  };

  const color = statusColor[result.status] ?? "#9ca3af";
  const bg = statusBg[result.status] ?? "#3a404822";

  const label = result.label ?? `Test ${index + 1}`;

  return (
    <div
      className="rounded overflow-hidden"
      style={{ border: `1px solid ${color}33`, background: "#1f2328" }}
    >
      {/* Header row */}
      <button
        className="flex w-full items-center gap-2 px-3 py-2 text-left transition hover:brightness-110"
        style={{ background: bg }}
        onClick={() => setExpanded((v) => !v)}
      >
        <span
          className="flex-shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
          style={{ background: `${color}33`, color }}
        >
          {result.status}
        </span>
        <span className="flex-1 truncate text-[11px] font-medium" style={{ color: "#d1d5db" }}>
          {label}
        </span>
        {result.durationMs !== undefined && (
          <span className="flex-shrink-0 text-[9px]" style={{ color: "#4b5563" }}>
            {result.durationMs}ms
          </span>
        )}
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          style={{ color: "#4b5563", transform: expanded ? "rotate(180deg)" : "none", flexShrink: 0 }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="space-y-2 p-3" style={{ borderTop: `1px solid ${color}22` }}>
          <DetailRow label="Input" value={result.input} />
          <DetailRow label="Expected" value={result.expected} />
          {result.status !== "timeout" && result.actual !== undefined && (
            <DetailRow label="Actual" value={result.actual} highlight={result.status === "failed"} />
          )}
          {result.error && (
            <div>
              <p className="mb-1 text-[9px] font-semibold uppercase tracking-wider" style={{ color: "#6b7280" }}>
                {result.status === "timeout" ? "Message" : "Error"}
              </p>
              <p
                className="font-mono text-[11px] leading-5"
                style={{ color: result.status === "timeout" ? "#a78bfa" : "#f59e0b" }}
              >
                {result.error}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DetailRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: unknown;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-wider" style={{ color: "#6b7280" }}>
        {label}
      </p>
      <p
        className="font-mono text-[11px] leading-5 break-all"
        style={{ color: highlight ? "#ef4444" : "#d1d5db" }}
      >
        {formatValue(value)}
      </p>
    </div>
  );
}
