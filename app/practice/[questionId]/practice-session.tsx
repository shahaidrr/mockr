"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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
import { submitAttempt } from "@/lib/attempts-service";
import { SubmitPracticeAttemptError } from "@/lib/attempt-submission";
import type { Question, QuestionExample, QuestionTestCase } from "@/types/question";
import type { PracticeMode, SupportedLanguage, PracticeDraft, InterviewPanel } from "@/types/practice";
import type { PublicTestRunSummary, PublicTestRunResult } from "@/types/test-run";
import AssessmentIntegrityGuard from "@/components/assessment/AssessmentIntegrityGuard";
import type { LocalIntegrityEvent } from "@/components/assessment/AssessmentIntegrityGuard";

const CodeEditor = dynamic(() => import("@/components/code-editor"), { ssr: false });

const INTERVIEW_PANELS: InterviewPanel[] = [
  "clarification",
  "approach",
  "code",
  "testing",
  "submit",
];

const PANEL_LABELS: Record<InterviewPanel, string> = {
  overview: "Workflow Overview",
  clarification: "Clarification",
  approach: "Approach",
  code: "Code Written",
  testing: "Testing Plan & Edge Cases",
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

function stripCodeComments(code: string, language: SupportedLanguage): string {
  if (!code) return "";

  if (language === "python") {
    return code.replace(/#[^\n]*/g, "");
  }

  return code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n]*/g, "");
}

function normalizeCodeForComparison(code: string, language: SupportedLanguage): string {
  return stripCodeComments(code, language).replace(/\s+/g, "");
}

function hasMeaningfulCodeChange(
  code: string,
  starterCode: string,
  language: SupportedLanguage
): boolean {
  const normalizedCurrent = normalizeCodeForComparison(code, language);
  const normalizedStarter = normalizeCodeForComparison(starterCode, language);
  return normalizedCurrent.length > 0 && normalizedCurrent !== normalizedStarter;
}

function alignPythonStarterFunctionName(starterCode: string, functionName: string): string {
  if (!starterCode || !functionName) return starterCode;
  return starterCode.replace(/def\s+[A-Za-z_][A-Za-z0-9_]*\s*\(/, `def ${functionName}(`);
}

function getStarterCode(question: Question, language: SupportedLanguage): string {
  const rawStarter = question.starter_code?.[language] ?? "";
  if (language === "python") {
    return alignPythonStarterFunctionName(rawStarter, question.function_name);
  }
  return rawStarter;
}

function getUserOutputLabel(result: PublicTestRunResult): string {
  if (result.status === "error") return "No output due to runtime error";
  if (result.status === "timeout") return "No output due to timeout";
  if (result.actual === undefined) return "undefined";
  return formatValue(result.actual);
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

  // Assessment mode: detect re-entry after abandonment and start fresh
  const isAssessment = initialMode === "assessment";
  const abandonedKey = `mockr:assessment:abandoned:${question.id}`;
  const attemptCountKey = `mockr:assessment:attempts:${userId}:${question.id}`;
  // Timer persistence: store the wall-clock epoch (ms) when this attempt started.
  // Keyed by draftKey so it is scoped to the same user + question + mode.
  const epochKey = `mockr:timer-epoch:${draftKey}`;

  const [draft, setDraft] = useState<PracticeDraft>(buildEmptyDraft(initialLanguage));
  const [hasLoadedDraft, setHasLoadedDraft] = useState(false);
  const hasRestoredDraftRef = useRef(false);

  // Timer — persisted across reloads using a localStorage epoch (ms wall-clock).
  // On mount: load the saved epoch for this attempt, or record a new one.
  // The interval derives elapsed seconds from Date.now() - epoch, so it never drifts.
  // Load (or create) the persisted epoch outside the component hook chain so we can
  // use it as both the ref initial value and the useState initial value without
  // touching a ref during render.
  const sessionStartRef = useRef<number>(0);
  const pendingExitRef  = useRef(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  useEffect(() => {
    if (hasRestoredDraftRef.current) return;
    hasRestoredDraftRef.current = true;

    // Restore browser-only draft state after hydration so the server and client
    // both start from the same initial markup.
    let nextDraft: PracticeDraft | null = null;

    if (isAssessment) {
      const wasAbandoned = sessionStorage.getItem(abandonedKey);
      if (wasAbandoned) {
        sessionStorage.removeItem(abandonedKey);
        clearDraft(draftKey);
        try { localStorage.removeItem(epochKey); } catch { /* noop */ }
      } else {
        const saved = loadDraft(draftKey);
        if (saved) {
          const savedPanel = String(saved.currentPanel ?? "clarification");
          nextDraft = {
            ...saved,
            clarificationSkipped: saved.clarificationSkipped ?? false,
            approachSubmitted: saved.approachSubmitted ?? false,
            currentPanel:
              savedPanel === "complexity"
                ? "submit"
                : savedPanel === "overview" || INTERVIEW_PANELS.includes(saved.currentPanel as InterviewPanel)
                  ? (saved.currentPanel as InterviewPanel)
                  : "overview",
          } as PracticeDraft;
        }
      }
    } else {
      const saved = loadDraft(draftKey);
      if (saved) {
        const savedPanel = String(saved.currentPanel ?? "clarification");
        nextDraft = {
          ...saved,
          clarificationSkipped: saved.clarificationSkipped ?? false,
          approachSubmitted: saved.approachSubmitted ?? false,
          currentPanel:
            savedPanel === "complexity"
              ? "submit"
              : savedPanel === "overview" || INTERVIEW_PANELS.includes(saved.currentPanel as InterviewPanel)
                ? (saved.currentPanel as InterviewPanel)
                : "overview",
        } as PracticeDraft;
      }
    }

    const restoreTimer = window.setTimeout(() => {
      if (nextDraft) {
        setDraft(nextDraft);
      }
      setHasLoadedDraft(true);
    }, 0);

    return () => window.clearTimeout(restoreTimer);
  }, [abandonedKey, draftKey, epochKey, initialLanguage, isAssessment]);

  useEffect(() => {
    // Runs once on mount — safe to read/write localStorage and the ref here.
    let epoch: number;
    try {
      const saved = localStorage.getItem(epochKey);
      epoch = saved ? parseInt(saved, 10) : Date.now();
      if (!saved) localStorage.setItem(epochKey, String(epoch));
    } catch {
      epoch = Date.now();
    }
    sessionStartRef.current = epoch;
    // Tick every second — first tick fires after 1s, so the display starts at 0
    // then corrects itself to the true elapsed value on the first interval fire.
    const interval = setInterval(() => {
      setTimerSeconds(Math.floor((Date.now() - sessionStartRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
    // epochKey is a mount-time constant (derived from draftKey which is also stable);
    // adding it to deps would cause the effect to never re-run differently in practice.
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Track assessment attempt count
  useEffect(() => {
    if (!isAssessment) return;
    try {
      const prev = parseInt(localStorage.getItem(attemptCountKey) ?? "0", 10);
      localStorage.setItem(attemptCountKey, String(prev + 1));
    } catch {
      // localStorage unavailable
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Integrity event accumulator — collects events logged by AssessmentIntegrityGuard
  const [integrityEvents, setIntegrityEvents] = useState<LocalIntegrityEvent[]>([]);
  const handleIntegrityEvent = useCallback((e: LocalIntegrityEvent) => {
    setIntegrityEvents((prev) => [...prev, e]);
  }, []);

  // Assessment exit guard — warn on browser unload / tab close
  useEffect(() => {
    if (!isAssessment) return;
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      pendingExitRef.current = true;
      handleIntegrityEvent({
        eventType: "page_leave_attempt",
        occurredAt: new Date().toISOString(),
        elapsedSeconds: Math.floor((Date.now() - sessionStartRef.current) / 1000),
        severity: "high",
      });
      // Mark as abandoned so re-entry starts fresh
      try { sessionStorage.setItem(abandonedKey, "1"); } catch { /* noop */ }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isAssessment, abandonedKey, handleIntegrityEvent]);

  const [startedAt] = useState(() => new Date());
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showExitGuard, setShowExitGuard] = useState(false);
  const [langSwitchTarget, setLangSwitchTarget] = useState<SupportedLanguage | null>(null);
  const [testSummary, setTestSummary] = useState<PublicTestRunSummary | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [runCount, setRunCount] = useState(0);
  const [showSubmitWarning, setShowSubmitWarning] = useState(false);
  const [pendingSubmitSummary, setPendingSubmitSummary] = useState<PublicTestRunSummary | null>(null);
  const [submitErrors, setSubmitErrors] = useState<string[]>([]);
  const hintsUsed = 0;

  // When user cancels the native "Leave?" dialog and focus returns, show our exit
  // guard instead — so they stay in the browser and go through the normal exit flow.
  useEffect(() => {
    if (!isAssessment) return;
    function handleFocusAfterCancel() {
      if (!pendingExitRef.current) return;
      pendingExitRef.current = false;
      // They chose to stay — clear the abandoned flag set by beforeunload
      try { sessionStorage.removeItem(abandonedKey); } catch { /* noop */ }
      setShowExitGuard(true);
    }
    window.addEventListener("focus", handleFocusAfterCancel);
    return () => window.removeEventListener("focus", handleFocusAfterCancel);
  }, [isAssessment, abandonedKey]);

  // Intercept Cmd+W / Ctrl+W before the browser processes it.
  // Some Chromium builds honour preventDefault here when inside a fullscreen page,
  // which lets us show the exit guard instead of closing the tab.
  // Falls back gracefully to the beforeunload → Cancel → exit-guard flow when
  // the browser ignores the interception.
  useEffect(() => {
    if (!isAssessment) return;
    function handleTabClose(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "w") {
        e.preventDefault();
        setShowExitGuard(true);
      }
    }
    document.addEventListener("keydown", handleTabClose);
    return () => document.removeEventListener("keydown", handleTabClose);
  }, [isAssessment]);

  const currentLanguage = draft.selectedLanguage;
  const starterCode = getStarterCode(question, currentLanguage);
  const currentCode = draft.codeByLanguage[currentLanguage] ?? starterCode;
  const currentPanelIdx = INTERVIEW_PANELS.indexOf(draft.currentPanel);
  const isOverviewPanel = draft.currentPanel === "overview";
  const isExecutable = currentLanguage === "javascript" || currentLanguage === "python";
  const hasApproachText = draft.approach.trim().length > 0;
  const approachCompleted = hasApproachText && !!draft.approachSubmitted;
  const clarificationCompleted = draft.clarification.trim().length > 0;
  const clarificationSkipped = !clarificationCompleted && !!draft.clarificationSkipped;
  const codeWrittenCompleted = hasMeaningfulCodeChange(currentCode, starterCode, currentLanguage);
  const testingCompleted =
    draft.testingPlan.trim().length > 0 || draft.edgeCases.trim().length > 0;
  const complexityCompleted = draft.complexity.trim().length > 0;
  const editorLocked = !approachCompleted;

  // Persist draft whenever it changes (timer epoch is persisted separately via epochKey)
  const persist = useCallback(
    (d: PracticeDraft) => saveDraft(draftKey, d),
    [draftKey]
  );

  useEffect(() => {
    if (!hasLoadedDraft) return;
    persist(draft);
  }, [draft, hasLoadedDraft, persist]);

  function updateDraft(changes: Partial<PracticeDraft>) {
    if (submitErrors.length > 0) {
      setSubmitErrors([]);
    }
    setDraft((prev) => ({ ...prev, ...changes }));
  }

  function setCode(code: string) {
    if (editorLocked) return;
    updateDraft({ codeByLanguage: { ...draft.codeByLanguage, [currentLanguage]: code } });
  }

  function handleClarificationSkip() {
    updateDraft({
      clarification: "",
      clarificationSkipped: true,
      currentPanel: "approach",
    });
  }

  function handleClarificationNext() {
    updateDraft({
      clarificationSkipped: draft.clarification.trim().length === 0 ? true : false,
      currentPanel: "approach",
    });
  }

  function handleApproachSubmit() {
    if (!hasApproachText) return;
    updateDraft({
      approachSubmitted: true,
      currentPanel: "code",
    });
  }

  function goNextPanel() {
    if (isOverviewPanel) {
      updateDraft({ currentPanel: INTERVIEW_PANELS[0] });
      return;
    }
    if (draft.currentPanel === "approach" && !approachCompleted) return;
    const next = INTERVIEW_PANELS[currentPanelIdx + 1];
    if (next) updateDraft({ currentPanel: next });
  }

  function goPrevPanel() {
    if (isOverviewPanel) return;
    const prev = INTERVIEW_PANELS[currentPanelIdx - 1];
    if (prev) {
      updateDraft({ currentPanel: prev });
    } else {
      updateDraft({ currentPanel: "overview" });
    }
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
    setCode(question.starter_code?.[currentLanguage] ?? "");
    setTestSummary(null);
    setShowResetConfirm(false);
  }

  function handleOpenExitGuard() {
    if (isAssessment) {
      handleIntegrityEvent({
        eventType: "route_change_attempt",
        occurredAt: new Date().toISOString(),
        elapsedSeconds: Math.floor((Date.now() - sessionStartRef.current) / 1000),
        severity: "medium",
      });
    }
    setShowExitGuard(true);
  }

  async function handleAssessmentExit() {
    if (typeof document !== "undefined" && document.fullscreenElement) {
      try { await document.exitFullscreen(); } catch { /* noop */ }
    }
    // Mark abandoned so re-entry starts fresh, clear draft and timer epoch
    try { sessionStorage.setItem(abandonedKey, "1"); } catch { /* noop */ }
    clearDraft(draftKey);
    try { localStorage.removeItem(epochKey); } catch { /* noop */ }
    // Go back to the question page the user came from (not the questions list)
    router.back();
  }

  async function handleRun() {
    if (!approachCompleted || !isExecutable || isRunning || testCases.length === 0) return;
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
      setRunCount((count) => count + 1);
    } finally {
      setIsRunning(false);
    }
  }

  async function doNavigateToResults(
    summary: PublicTestRunSummary | null,
    submissionRunCount = runCount
  ) {
    setIsSaving(true);
    try {
      const attemptId = await submitAttempt({
        userId,
        questionId: question.id,
        mode: initialMode,
        language: currentLanguage,
        clarification: draft.clarification,
        approach: draft.approach,
        testingPlan: draft.testingPlan,
        edgeCases: draft.edgeCases,
        complexity: draft.complexity,
        finalCode: currentCode,
        startedAt,
        timerSeconds,
        testSummary: summary,
        hintsUsed,
        runCount: submissionRunCount,
        integrityEvents: isAssessment ? integrityEvents : [],
      });
      if (typeof document !== "undefined" && document.fullscreenElement) {
        try { await document.exitFullscreen(); } catch { /* noop */ }
      }
      try { localStorage.removeItem(epochKey); } catch { /* noop */ }
      router.push(`/results/${attemptId}?questionId=${question.id}`);
    } catch (err) {
      console.error("Failed to submit attempt:", err);

      if (
        err instanceof SubmitPracticeAttemptError &&
        err.attemptSaved &&
        err.attemptId
      ) {
        if (typeof document !== "undefined" && document.fullscreenElement) {
          try { await document.exitFullscreen(); } catch { /* noop */ }
        }
        try { localStorage.removeItem(epochKey); } catch { /* noop */ }
        router.push(
          `/results/${err.attemptId}?questionId=${question.id}&grading=failed`
        );
        return;
      }

      setSubmitErrors([
        err instanceof Error
          ? err.message
          : "We couldn't submit your attempt right now. Please try again.",
      ]);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSubmit() {
    if (isRunning) return;

    const errors: string[] = [];
    if (!approachCompleted) errors.push("Explain your approach before submitting.");
    if (!codeWrittenCompleted) errors.push("Write your solution before submitting.");
    if (!complexityCompleted) errors.push("Add your time and space complexity before submitting.");

    if (errors.length > 0) {
      setSubmitErrors(errors);
      return;
    }

    setSubmitErrors([]);
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
        setRunCount((count) => count + 1);
        if (summary.failed > 0 || summary.timedOut) {
          setPendingSubmitSummary(summary);
          setShowSubmitWarning(true);
          return;
        }
        doNavigateToResults(summary, runCount + 1);
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

  const isPractice = !isAssessment;
  const diffColor = DIFFICULTY_COLORS[question.difficulty] ?? "#9ca3af";
  const panelProgress = isOverviewPanel
    ? "Interview workflow overview"
    : `Stage ${currentPanelIdx + 1} of ${INTERVIEW_PANELS.length} · ${PANEL_LABELS[draft.currentPanel]}`;

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
    code: {
      practice:
        "Write the implementation after you have explained your plan. In a real interview, this is where you translate your approach into working code while narrating key choices.",
      assessment:
        "Implement the solution that matches the approach you described.",
    },
    testing: {
      practice:
        "List the test cases and edge cases you would use to validate the solution. This is encouraged during practice, but not required for Run or Submit.",
      assessment: "Describe the test cases and edge cases you would use.",
    },
  };

  const stageItems = [
    {
      panel: "clarification" as InterviewPanel,
      number: 1,
      title: "Clarification",
      status: clarificationCompleted ? "completed" : clarificationSkipped ? "skipped" : "optional",
      note: clarificationCompleted
        ? "Questions or assumptions captured."
        : clarificationSkipped
          ? "Intentionally skipped."
          : "Optional before coding.",
    },
    {
      panel: "approach" as InterviewPanel,
      number: 2,
      title: "Approach",
      status: approachCompleted ? "completed" : "required",
      note: approachCompleted
        ? "Plan submitted. Editor unlocked."
        : hasApproachText
          ? "Write-up ready. Submit this stage to unlock coding."
          : "Required before coding or running tests.",
    },
    {
      panel: "code" as InterviewPanel,
      number: 3,
      title: "Code Written",
      status: !approachCompleted
        ? "locked"
        : codeWrittenCompleted
          ? "completed"
          : "required",
      note: !approachCompleted
        ? "Locked until Stage 2 is submitted."
        : codeWrittenCompleted
          ? "Meaningful code has been written."
          : "Write code beyond the starter stub.",
    },
    {
      panel: "testing" as InterviewPanel,
      number: 4,
      title: "Testing Plan",
      status: testingCompleted ? "completed" : "encouraged",
      note: testingCompleted
        ? "Testing notes added."
        : "Encouraged, but not required for Run or Submit.",
    },
    {
      panel: "submit" as InterviewPanel,
      number: 5,
      title: "Submit Review",
      status:
        approachCompleted && codeWrittenCompleted && complexityCompleted ? "ready" : "required",
      note:
        approachCompleted && codeWrittenCompleted && complexityCompleted
          ? "Ready to submit."
          : "Requires approach, code, and complexity.",
    },
  ] as const;

  const stageStatusStyles: Record<string, { border: string; background: string; text: string }> = {
    optional: { border: "#334155", background: "#1e293b55", text: "#94a3b8" },
    skipped: { border: "#475569", background: "#33415566", text: "#cbd5e1" },
    required: { border: "#7c3aed66", background: "#312e8155", text: "#c4b5fd" },
    locked: { border: "#4b5563", background: "#1f293766", text: "#6b7280" },
    encouraged: { border: "#0ea5e966", background: "#082f4955", text: "#7dd3fc" },
    completed: { border: "#10b98166", background: "#064e3b66", text: "#6ee7b7" },
    ready: { border: "#10b98166", background: "#14532d66", text: "#86efac" },
  };

  function renderInterviewPanel() {
    if (isOverviewPanel) {
      return (
        <div className="flex h-full flex-col overflow-hidden">
          <div className="border-b px-3 py-3" style={{ borderColor: "#3a4048" }}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: "#8b9ab0" }}>
              Interview workflow
            </p>
            <p className="mt-2 text-sm leading-6" style={{ color: "#d1d5db" }}>
              Review the five interview stages before you begin, then step through them one at a time with the arrows or the stage action buttons.
            </p>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-3">
            <div className="space-y-2">
              {stageItems.map((stage) => {
                const style = stageStatusStyles[stage.status];
                return (
                  <div
                    key={stage.panel}
                    className="rounded-xl border px-3 py-2"
                    style={{ borderColor: style.border, background: style.background }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold" style={{ color: "#f1f5f9" }}>
                        {stage.number}. {stage.title}
                      </span>
                      <span
                        className="rounded px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em]"
                        style={{ background: `${style.border}22`, color: style.text }}
                      >
                        {stage.status}
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] leading-4" style={{ color: "#94a3b8" }}>
                      {stage.note}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="border-t p-3" style={{ borderColor: "#3a4048" }}>
            <button
              type="button"
              onClick={() => updateDraft({ currentPanel: "clarification" })}
              className="w-full rounded px-3 py-2 text-xs font-bold transition hover:brightness-110"
              style={{ background: "#31d67b", color: "#000" }}
            >
              Begin Stage 1 →
            </button>
          </div>
        </div>
      );
    }

    const promptText =
      PANEL_PROMPTS[draft.currentPanel]?.[isPractice ? "practice" : "assessment"] ?? "";

    switch (draft.currentPanel) {
      case "clarification":
        return (
          <div className="flex flex-1 flex-col overflow-hidden">
            <p className="flex-shrink-0 px-3 pt-3 text-xs leading-6" style={{ color: "#8b9ab0" }}>
              {promptText}
            </p>
            <div className="flex flex-shrink-0 items-center justify-between px-3 pt-2">
              <span className="text-[10px] uppercase tracking-[0.18em]" style={{ color: "#4b5563" }}>
                Optional
              </span>
              <button
                type="button"
                onClick={handleClarificationSkip}
                className="rounded border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] transition hover:text-white"
                style={{ borderColor: "#3a4048", color: "#9ca3af" }}
              >
                Skip clarification
              </button>
            </div>
            <textarea
              value={draft.clarification}
              onChange={(e) =>
                updateDraft({
                  clarification: e.target.value,
                  clarificationSkipped: e.target.value.trim().length === 0 ? draft.clarificationSkipped : false,
                })
              }
              placeholder="e.g. Can the array be empty? Are values always integers? What should I return if there is no valid pair?"
              className="min-h-0 flex-1 resize-none overflow-y-auto bg-transparent px-3 pb-3 pt-2 text-sm leading-6 text-[#f1f5f9] outline-none placeholder:text-[#3a4048]"
            />
            {clarificationSkipped && (
              <p className="px-3 pb-3 text-[11px] leading-5" style={{ color: "#9ca3af" }}>
                Clarification was intentionally skipped for this attempt.
              </p>
            )}
            <div className="flex flex-shrink-0 justify-end px-3 pb-3">
              <button
                type="button"
                onClick={handleClarificationNext}
                className="rounded px-3 py-2 text-xs font-bold transition hover:brightness-110"
                style={{ background: "#31d67b", color: "#000" }}
              >
                Next: Approach →
              </button>
            </div>
          </div>
        );

      case "approach":
        return (
          <div className="flex flex-1 flex-col overflow-hidden">
            <p className="flex-shrink-0 px-3 pt-3 text-xs leading-6" style={{ color: "#8b9ab0" }}>
              {promptText}
            </p>
            <p className="px-3 pt-2 text-[11px] leading-5" style={{ color: "#c4b5fd" }}>
              Required before coding, running tests, or submitting. Submit this stage to unlock the editor.
            </p>
            <textarea
              value={draft.approach}
              onChange={(e) =>
                updateDraft({
                  approach: e.target.value,
                  approachSubmitted: e.target.value.trim().length === 0 ? false : draft.approachSubmitted,
                })
              }
              placeholder="e.g. I'll use a hash map to store seen values. For each element I check if the complement exists…"
              className="min-h-0 flex-1 resize-none overflow-y-auto bg-transparent px-3 pb-3 pt-2 text-sm leading-6 text-[#f1f5f9] outline-none placeholder:text-[#3a4048]"
            />
            <div className="flex flex-shrink-0 justify-end px-3 pb-3">
              <button
                type="button"
                onClick={handleApproachSubmit}
                disabled={!hasApproachText}
                className="rounded px-3 py-2 text-xs font-bold transition hover:brightness-110 disabled:opacity-50"
                style={{ background: "#31d67b", color: "#000" }}
              >
                Submit Approach →
              </button>
            </div>
          </div>
        );

      case "code":
        return (
          <div className="flex flex-1 flex-col overflow-hidden">
            <p className="flex-shrink-0 px-3 pt-3 text-xs leading-6" style={{ color: "#8b9ab0" }}>
              {promptText}
            </p>
            <div className="flex-1 px-3 pb-3 pt-3">
              <div
                className="rounded-xl border p-3"
                style={{
                  borderColor: editorLocked ? "#4b5563" : codeWrittenCompleted ? "#10b98155" : "#3a4048",
                  background: editorLocked ? "#11182799" : "#161b22",
                }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: editorLocked ? "#6b7280" : "#8b9ab0" }}>
                  {editorLocked ? "Locked" : codeWrittenCompleted ? "Completed" : "In progress"}
                </p>
                <p className="mt-2 text-[12px] leading-5" style={{ color: editorLocked ? "#9ca3af" : "#d1d5db" }}>
                  {editorLocked
                    ? "Explain your approach and submit Stage 2 before coding. In a real interview, you should talk through your plan before implementation."
                    : codeWrittenCompleted
                      ? "Meaningful code has been written beyond the starter stub."
                      : "Use the editor to implement your solution. Stage 3 completes once the code meaningfully changes from the starter stub."}
                </p>
              </div>
            </div>
            <div className="flex flex-shrink-0 justify-end px-3 pb-3">
              <button
                type="button"
                onClick={() => updateDraft({ currentPanel: "testing" })}
                className="rounded px-3 py-2 text-xs font-bold transition hover:brightness-110"
                style={{ background: "#31d67b", color: "#000" }}
              >
                Next: Testing Plan →
              </button>
            </div>
          </div>
        );

      case "testing":
        return (
          <div className="flex flex-1 flex-col overflow-hidden">
            <p className="flex-shrink-0 px-3 pt-3 text-xs leading-6" style={{ color: "#8b9ab0" }}>
              {promptText}
            </p>
            <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3 pt-2">
              <textarea
                value={draft.testingPlan}
                onChange={(e) => updateDraft({ testingPlan: e.target.value })}
                placeholder="e.g. I'll test a normal case, an empty input, duplicate values, and a single-element array…"
                className="min-h-[9rem] w-full resize-y overflow-y-auto rounded border bg-transparent px-3 py-2 text-sm leading-6 text-[#f1f5f9] outline-none placeholder:text-[#3a4048]"
                style={{ borderColor: "#3a4048" }}
              />
              <p
                className="px-1 pt-3 text-xs leading-6"
                style={{ color: "#8b9ab0" }}
              >
                List specific edge cases to verify.
              </p>
              <textarea
                value={draft.edgeCases}
                onChange={(e) => updateDraft({ edgeCases: e.target.value })}
                placeholder="e.g. Empty array → return null; all same values; negative numbers; very large inputs…"
                className="min-h-[9rem] w-full resize-y overflow-y-auto rounded border bg-transparent px-3 py-2 text-sm leading-6 text-[#f1f5f9] outline-none placeholder:text-[#3a4048]"
                style={{ borderColor: "#3a4048" }}
              />
            </div>
            <div className="flex flex-shrink-0 justify-end px-3 pb-3">
              <button
                type="button"
                onClick={() => updateDraft({ currentPanel: "submit" })}
                className="rounded px-3 py-2 text-xs font-bold transition hover:brightness-110"
                style={{ background: "#31d67b", color: "#000" }}
              >
                Next: Submit Review →
              </button>
            </div>
          </div>
        );

      case "submit": {
        const checks = [
          {
            label: "Clarification",
            status: clarificationCompleted ? "completed" : clarificationSkipped ? "skipped" : "optional",
          },
          { label: "Approach", status: approachCompleted ? "completed" : "required" },
          { label: "Code written", status: codeWrittenCompleted ? "completed" : "required" },
          { label: "Testing plan", status: testingCompleted ? "completed" : "encouraged" },
          { label: "Complexity", status: complexityCompleted ? "completed" : "required" },
        ];

        return (
          <div className="flex flex-1 flex-col gap-3 overflow-auto p-3">
            <div className="space-y-1.5">
              {checks.map((c) => (
                <div key={c.label} className="flex items-center gap-2 text-xs">
                  <span
                    className={
                      c.status === "completed"
                        ? "text-[#31d67b]"
                        : c.status === "skipped"
                          ? "text-[#cbd5e1]"
                          : c.status === "encouraged"
                            ? "text-[#7dd3fc]"
                            : "text-[#c4b5fd]"
                    }
                  >
                    {c.status === "completed" ? "✓" : c.status === "skipped" ? "↷" : "○"}
                  </span>
                  <span style={{ color: c.status === "completed" ? "#d1d5db" : "#94a3b8" }}>
                    {c.label}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.16em]" style={{ color: stageStatusStyles[c.status].text }}>
                    {c.status}
                  </span>
                </div>
              ))}
            </div>

            <div>
              <p
                className="mb-1 text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: "#8b9ab0" }}
              >
                Complexity
              </p>
              <textarea
                value={draft.complexity}
                onChange={(e) => updateDraft({ complexity: e.target.value })}
                placeholder="e.g. Time: O(n) — one pass through the array. Space: O(n) — hash map stores up to n values."
                className="min-h-24 w-full resize-y rounded border bg-transparent px-3 py-2 text-sm leading-6 text-[#f1f5f9] outline-none placeholder:text-[#3a4048]"
                style={{ borderColor: "#3a4048" }}
              />
            </div>

            {submitErrors.length > 0 && (
              <div
                className="rounded-lg border px-3 py-2"
                style={{ borderColor: "#ef444455", background: "#3f1d1d66" }}
              >
                {submitErrors.map((message) => (
                  <p key={message} className="text-[11px] leading-5" style={{ color: "#fca5a5" }}>
                    {message}
                  </p>
                ))}
              </div>
            )}

            {currentLanguage === "javascript" && (
              <p className="text-[10px] leading-4" style={{ color: "#4b5563" }}>
                Submit will run JavaScript public tests one final time, then save your attempt.
              </p>
            )}
            {currentLanguage === "python" && (
              <p className="text-[10px] leading-4" style={{ color: "#4b5563" }}>
                Submit will run Python public tests in-browser via Pyodide, then save your attempt.
              </p>
            )}
            {currentLanguage === "cpp" && (
              <p className="text-[10px] leading-4" style={{ color: "#4b5563" }}>
                C++ execution is coming later. Submit will save your attempt without running tests.
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={isRunning || isSaving}
              className="w-full rounded px-3 py-2 text-xs font-bold transition hover:brightness-110 active:brightness-90 disabled:opacity-50"
              style={{ background: "#31d67b", color: "#000" }}
            >
              {isSaving ? "Generating feedback…" : isRunning ? "Running tests…" : "Submit Attempt →"}
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
    <AssessmentIntegrityGuard
      active={isAssessment}
      timerSeconds={timerSeconds}
      onEvent={handleIntegrityEvent}
      onStart={() => {}}
    >
    <div
      className="flex h-screen flex-col overflow-hidden"
      style={{ background: "#1f2328", color: "#fff" }}
    >
      {/* ── Top bar ── */}
      <div
        className="flex flex-shrink-0 items-center gap-3 px-4 py-2.5"
        style={{ background: "#24292f", borderBottom: "1px solid #3a4048" }}
      >
        {isAssessment ? (
          <button
            onClick={handleOpenExitGuard}
            className="flex items-center gap-1 text-xs transition hover:text-white"
            style={{ color: "#6b7280" }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Questions
          </button>
        ) : (
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
        )}

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

        <span
          className="flex-shrink-0 font-mono text-sm font-semibold tabular-nums"
          style={{ color: isAssessment ? "#f87171" : "#38bdf8" }}
        >
          {formatTime(timerSeconds)}
        </span>

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
            <p className="mb-5 text-sm leading-7" style={{ color: "#e8ecf2" }}>
              {question.problem_statement}
            </p>

            {(question.input_description || question.output_description || question.constraints) && (
              <div className="mb-4 space-y-3 rounded p-3" style={{ background: "#2b3036", border: "1px solid #3a4048" }}>
                {question.input_description && (
                  <div>
                    <p
                      className="mb-1 text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: "#8b9ab0" }}
                    >
                      Input
                    </p>
                    <p className="text-xs leading-5" style={{ color: "#b0bcc9" }}>
                      {question.input_description}
                    </p>
                  </div>
                )}

                {question.output_description && (
                  <div>
                    <p
                      className="mb-1 text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: "#8b9ab0" }}
                    >
                      Output
                    </p>
                    <p className="text-xs leading-5" style={{ color: "#b0bcc9" }}>
                      {question.output_description}
                    </p>
                  </div>
                )}

                {question.constraints && (
                  <div>
                    <p
                      className="mb-1 text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: "#8b9ab0" }}
                    >
                      Constraints
                    </p>
                    <pre
                      className="whitespace-pre-wrap font-mono text-[11px] leading-5"
                      style={{ color: "#b0bcc9" }}
                    >
                      {question.constraints}
                    </pre>
                  </div>
                )}
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
            <div
              className="flex flex-shrink-0 items-center justify-between gap-3 px-3 py-3"
              style={{ borderBottom: "1px solid #3a4048", background: "#24292f" }}
            >
              <span
                className="text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: "#9ca3af" }}
              >
                {panelProgress}
              </span>
              <div className="flex items-center gap-1">
                {!isOverviewPanel && (
                  <button
                    type="button"
                    onClick={() => updateDraft({ currentPanel: "overview" })}
                    className="rounded border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] transition hover:text-white"
                    style={{ borderColor: "#3a4048", color: "#9ca3af" }}
                  >
                    Overview
                  </button>
                )}
                <button
                  onClick={goPrevPanel}
                  disabled={isOverviewPanel}
                  className="flex h-5 w-5 items-center justify-center rounded transition hover:text-white disabled:opacity-25"
                  style={{ color: "#9ca3af" }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button
                  onClick={goNextPanel}
                  disabled={!isOverviewPanel && currentPanelIdx === INTERVIEW_PANELS.length - 1}
                  className="flex h-5 w-5 items-center justify-center rounded transition hover:text-white disabled:opacity-25"
                  style={{ color: "#9ca3af" }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
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
                disabled={editorLocked || isRunning || testCases.length === 0}
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
            <div className="relative h-full">
              <CodeEditor
                code={currentCode}
                language={currentLanguage}
                onChange={setCode}
                readOnly={editorLocked}
              />
              {editorLocked && (
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 z-10 border-b px-4 py-3"
                  style={{ borderColor: "#7c3aed44", background: "#111827dd" }}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: "#c4b5fd" }}>
                    Editor locked until Stage 2 is submitted
                  </p>
                  <p className="mt-1 text-sm leading-5" style={{ color: "#d1d5db" }}>
                    Explain your approach and submit Stage 2 before coding. In a real interview, you should talk through your plan before implementation.
                  </p>
                </div>
              )}
            </div>
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
                disabled={isSaving}
                className="w-full rounded px-3 py-2 text-xs font-bold transition hover:brightness-110 disabled:opacity-50"
                style={{ background: "#31d67b", color: "#000" }}
              >
                {isSaving ? "Generating feedback…" : "Submit anyway"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Assessment exit guard modal ── */}
      {showExitGuard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div
            className="w-full max-w-sm rounded-[16px] p-6 shadow-xl"
            style={{ background: "#24292f", border: "1px solid #7c3aed55" }}
          >
            {/* Icon + heading */}
            <div className="flex items-start gap-3">
              <div
                className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full"
                style={{ background: "#7c3aed22" }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Leaving the interview?</p>
                <p className="mt-1.5 text-xs leading-5" style={{ color: "#9ca3af" }}>
                  This attempt will be marked as abandoned. Your code and notes will not be saved,
                  and you will need to start from scratch if you return.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 flex gap-2.5">
              <button
                onClick={() => setShowExitGuard(false)}
                className="flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition hover:brightness-110"
                style={{ background: "#3a4048", color: "#d1d5db" }}
              >
                Stay in interview
              </button>
              <button
                onClick={handleAssessmentExit}
                className="flex-1 rounded-lg px-3 py-2 text-xs font-semibold text-white transition hover:brightness-110"
                style={{ background: "#ef4444" }}
              >
                Walk out
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
            <p className="text-sm font-semibold text-white">Reset code?</p>
            <p className="mt-2 text-xs leading-5" style={{ color: "#9ca3af" }}>
              This reloads the starter template for {
                LANGUAGE_OPTIONS.find((l) => l.id === currentLanguage)?.label ?? currentLanguage
              }. Your notes and answers will not be affected.
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
    </AssessmentIntegrityGuard>
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
          <DetailRow
            label="Your Output"
            value={getUserOutputLabel(result)}
            highlight={result.status === "failed" || result.status === "error" || result.status === "timeout"}
            preformatted
          />
          {result.error && (
            <div>
              <p className="mb-1 text-[9px] font-semibold uppercase tracking-wider" style={{ color: "#6b7280" }}>
                Error
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
  preformatted,
}: {
  label: string;
  value: unknown;
  highlight?: boolean;
  preformatted?: boolean;
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
        {preformatted ? String(value) : formatValue(value)}
      </p>
    </div>
  );
}
