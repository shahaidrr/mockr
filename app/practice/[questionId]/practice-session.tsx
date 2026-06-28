"use client";

import { useState, useEffect, useCallback } from "react";
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
import type { Question, QuestionExample } from "@/types/question";
import type { PracticeMode, SupportedLanguage, PracticeDraft, InterviewPanel } from "@/types/practice";

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

type Props = {
  question: Question;
  initialMode: PracticeMode;
  initialLanguage: SupportedLanguage;
  userId: string;
};

export default function PracticeSession({
  question,
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

  const currentLanguage = draft.selectedLanguage;
  const starterCode = question.starter_code?.[currentLanguage] ?? "";
  const currentCode = draft.codeByLanguage[currentLanguage] ?? starterCode;
  const currentPanelIdx = INTERVIEW_PANELS.indexOf(draft.currentPanel);

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
    setShowResetConfirm(false);
  }

  function handleSubmit() {
    const attemptId = `local-${Date.now()}`;
    router.push(`/results/${attemptId}?questionId=${question.id}`);
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

  function renderInterviewPanel() {
    switch (draft.currentPanel) {
      case "clarification":
        return (
          <textarea
            value={draft.clarification}
            onChange={(e) => updateDraft({ clarification: e.target.value })}
            placeholder={
              isPractice
                ? "Ask your clarifying questions before coding. What are the inputs and outputs? Are there edge cases? What constraints should you assume?"
                : "Your clarification notes and assumptions..."
            }
            className="w-full flex-1 resize-none bg-transparent p-3 text-sm leading-6 placeholder-[#4b5563] text-[#d1d5db] outline-none"
          />
        );

      case "approach":
        return (
          <textarea
            value={draft.approach}
            onChange={(e) => updateDraft({ approach: e.target.value })}
            placeholder={
              isPractice
                ? "Describe your approach before writing code. Brute force first, then an optimised solution. What data structures will you use and why?"
                : "Describe your approach and reasoning..."
            }
            className="w-full flex-1 resize-none bg-transparent p-3 text-sm leading-6 placeholder-[#4b5563] text-[#d1d5db] outline-none"
          />
        );

      case "testing":
        return (
          <div className="flex flex-1 flex-col gap-2 overflow-auto p-3">
            <textarea
              value={draft.testingPlan}
              onChange={(e) => updateDraft({ testingPlan: e.target.value })}
              placeholder="Testing strategy — what cases will you verify?"
              rows={3}
              className="w-full resize-none rounded p-2 text-xs leading-5 placeholder-[#4b5563] text-[#d1d5db] outline-none"
              style={{ background: "#24292f" }}
            />
            <textarea
              value={draft.edgeCases}
              onChange={(e) => updateDraft({ edgeCases: e.target.value })}
              placeholder="Edge cases — empty input, single element, negatives, duplicates, max values..."
              rows={3}
              className="w-full resize-none rounded p-2 text-xs leading-5 placeholder-[#4b5563] text-[#d1d5db] outline-none"
              style={{ background: "#24292f" }}
            />
          </div>
        );

      case "complexity":
        return (
          <textarea
            value={draft.complexity}
            onChange={(e) => updateDraft({ complexity: e.target.value })}
            placeholder="Time: O(?) because... Space: O(?) because... Explain your reasoning clearly."
            className="w-full flex-1 resize-none bg-transparent p-3 text-sm leading-6 placeholder-[#4b5563] text-[#d1d5db] outline-none"
          />
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

            <p className="text-[10px] leading-4" style={{ color: "#4b5563" }}>
              Phase 1 — local submission only. Scoring and attempt storage are coming in a future phase.
            </p>

            <button
              onClick={handleSubmit}
              className="w-full rounded px-3 py-2 text-xs font-bold transition hover:brightness-110 active:brightness-90"
              style={{ background: "#31d67b", color: "#000" }}
            >
              Submit Attempt →
            </button>
          </div>
        );
      }
    }
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

        <button
          onClick={() => setShowResetConfirm(true)}
          className="flex-shrink-0 rounded px-2.5 py-1 text-[10px] font-medium transition hover:text-white"
          style={{ background: "#3a4048", color: "#9ca3af" }}
        >
          Reset Draft
        </button>
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
            className="flex-[2] overflow-y-auto p-5"
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
          <div className="flex flex-[1] flex-col overflow-hidden" style={{ minHeight: 0 }}>
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

            {/* Run — disabled, Phase 2 */}
            <button
              disabled
              title="Code execution coming in Phase 2"
              className="flex cursor-not-allowed items-center gap-1.5 rounded px-3 py-1 text-xs font-bold opacity-40"
              style={{ background: "#31d67b", color: "#000" }}
            >
              <svg width="7" height="9" viewBox="0 0 9 11" fill="currentColor">
                <path d="M0 0L9 5.5L0 11V0Z" />
              </svg>
              Run
            </button>
            <span className="text-[9px]" style={{ color: "#4b5563" }}>Phase 2</span>
          </div>

          {/* Monaco editor (~2/3 of right column) */}
          <div className="flex-[2] overflow-hidden" style={{ minHeight: 0 }}>
            <CodeEditor code={currentCode} language={currentLanguage} onChange={setCode} />
          </div>

          {/* Divider */}
          <div className="flex-shrink-0" style={{ height: 1, background: "#3a4048" }} />

          {/* Output panel (~1/3 of right column) */}
          <div
            className="flex-[1] overflow-auto p-4"
            style={{ background: "#161b22", minHeight: 0 }}
          >
            <p
              className="mb-2 text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: "#4b5563" }}
            >
              Output
            </p>
            <p style={{ color: "#4b5563", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace", fontSize: 12, lineHeight: "1.75" }}>
              Ready to run your solution.
            </p>
            <p style={{ color: "#374151", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace", fontSize: 12, lineHeight: "1.75" }}>
              Code execution and public test cases will be added in Phase 2.
            </p>
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
