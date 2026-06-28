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
import type { PracticeMode, PracticeStage, SupportedLanguage, PracticeDraft } from "@/types/practice";

const CodeEditor = dynamic(() => import("@/components/code-editor"), { ssr: false });

const STAGES: PracticeStage[] = [
  "problem",
  "clarification",
  "approach",
  "coding",
  "testing",
  "complexity",
  "submit",
];

const STAGE_LABELS: Record<PracticeStage, string> = {
  problem: "Problem",
  clarification: "Clarification",
  approach: "Approach",
  coding: "Coding",
  testing: "Testing",
  complexity: "Complexity",
  submit: "Submit",
};

const LANGUAGE_OPTIONS: { id: SupportedLanguage; label: string }[] = [
  { id: "javascript", label: "JavaScript" },
  { id: "python", label: "Python" },
  { id: "cpp", label: "C++" },
];

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
  const key = buildDraftKey(userId, question.id, initialMode);

  const [draft, setDraft] = useState<PracticeDraft>(() => {
    const saved = loadDraft(key);
    if (saved) return saved;
    return buildEmptyDraft(initialLanguage);
  });

  const [timerSeconds, setTimerSeconds] = useState(() => {
    const saved = loadDraft(key);
    return saved?.timerSeconds ?? 0;
  });

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [langSwitchTarget, setLangSwitchTarget] = useState<SupportedLanguage | null>(null);

  const currentStageIdx = STAGES.indexOf(draft.currentStage);
  const currentLanguage = draft.selectedLanguage;
  const starterCode = question.starter_code?.[currentLanguage] ?? "";
  const currentCode = draft.codeByLanguage[currentLanguage] ?? starterCode;

  // Assessment timer
  useEffect(() => {
    if (initialMode !== "assessment") return;
    const interval = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [initialMode]);

  // Persist draft on changes
  const persist = useCallback(
    (d: PracticeDraft, t: number) => saveDraft(key, { ...d, timerSeconds: t }),
    [key]
  );

  useEffect(() => {
    persist(draft, timerSeconds);
  }, [draft, timerSeconds, persist]);

  function updateDraft(changes: Partial<PracticeDraft>) {
    setDraft((prev) => ({ ...prev, ...changes }));
  }

  function goToStage(stage: PracticeStage) {
    updateDraft({ currentStage: stage });
  }

  function goNext() {
    const next = STAGES[currentStageIdx + 1];
    if (next) goToStage(next);
  }

  function goPrev() {
    const prev = STAGES[currentStageIdx - 1];
    if (prev) goToStage(prev);
  }

  function setCode(code: string) {
    updateDraft({
      codeByLanguage: { ...draft.codeByLanguage, [currentLanguage]: code },
    });
  }

  function confirmSwitchLanguage(lang: SupportedLanguage) {
    const hasCode =
      draft.codeByLanguage[currentLanguage] &&
      draft.codeByLanguage[currentLanguage] !== starterCode;
    if (hasCode) {
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
    clearDraft(key);
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

  // ─── Stage renderers ────────────────────────────────────────────────────────

  function renderProblem() {
    return (
      <div className="mx-auto max-w-2xl space-y-6 px-6 py-8">
        {isPractice && (
          <div className="rounded-[16px] border border-sky-100 bg-sky-50 px-5 py-4 text-sm leading-7 text-sky-800">
            <strong>Interview-style practice.</strong> Before jumping to code, work through
            clarification and approach first — just like you would in a real interview.
          </div>
        )}

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Problem
          </h2>
          <p className="mt-3 whitespace-pre-wrap text-base leading-8 text-slate-800">
            {question.problem_statement}
          </p>
        </div>

        {question.input_description && (
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Input</h3>
            <p className="mt-1 text-sm leading-7 text-slate-600">{question.input_description}</p>
          </div>
        )}

        {question.output_description && (
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Output</h3>
            <p className="mt-1 text-sm leading-7 text-slate-600">{question.output_description}</p>
          </div>
        )}

        {question.constraints && (
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Constraints</h3>
            <pre className="mt-1 whitespace-pre-wrap font-mono text-sm leading-7 text-slate-600">
              {question.constraints}
            </pre>
          </div>
        )}

        {Array.isArray(question.examples) && question.examples.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Examples</h3>
            <div className="mt-2 space-y-3">
              {question.examples.map((ex: QuestionExample, i: number) => (
                <div
                  key={i}
                  className="rounded-[14px] border border-slate-100 bg-slate-50 p-4 font-mono text-sm text-slate-800"
                >
                  <div>
                    <span className="font-sans text-xs font-semibold text-slate-400">Input: </span>
                    {String(ex.input)}
                  </div>
                  <div className="mt-1">
                    <span className="font-sans text-xs font-semibold text-slate-400">Output: </span>
                    {String(ex.output)}
                  </div>
                  {ex.explanation && (
                    <p className="mt-2 font-sans text-xs leading-5 text-slate-500">{ex.explanation}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderClarification() {
    return (
      <div className="mx-auto max-w-2xl space-y-5 px-6 py-8">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Clarification</h2>
          {isPractice ? (
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Before writing any code, ask clarifying questions. Think about: What are the inputs and
              outputs? Are there edge cases? What format should the output be? Are there constraints
              on time or space? What should happen with empty or invalid inputs?
            </p>
          ) : (
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Note any clarifying questions or assumptions about the problem.
            </p>
          )}
        </div>
        <textarea
          value={draft.clarification}
          onChange={(e) => updateDraft({ clarification: e.target.value })}
          placeholder={
            isPractice
              ? "e.g. Can I assume the array is non-empty? Should I return the indices or the values? Are there duplicate elements?"
              : "Your clarification notes..."
          }
          rows={10}
          className="w-full resize-none rounded-[16px] border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-800 placeholder-slate-400 shadow-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
        />
      </div>
    );
  }

  function renderApproach() {
    return (
      <div className="mx-auto max-w-2xl space-y-5 px-6 py-8">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Approach</h2>
          {isPractice ? (
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Explain your approach before writing code. Cover: the brute-force solution, a more
              optimal solution if you can see one, and why your chosen approach works. Include the
              data structures or algorithms you plan to use.
            </p>
          ) : (
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Briefly describe your approach and the reasoning behind it.
            </p>
          )}
        </div>
        <textarea
          value={draft.approach}
          onChange={(e) => updateDraft({ approach: e.target.value })}
          placeholder={
            isPractice
              ? "e.g. Brute force: check every pair — O(n²). Optimal: use a hash map to store complements as I iterate — O(n) time, O(n) space..."
              : "Your approach..."
          }
          rows={10}
          className="w-full resize-none rounded-[16px] border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-800 placeholder-slate-400 shadow-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
        />
      </div>
    );
  }

  function renderCoding() {
    return (
      <div className="flex h-full flex-col">
        {/* Language selector */}
        <div
          className="flex items-center gap-3 border-b border-slate-200 px-5 py-2.5"
          style={{ background: "#1f2328" }}
        >
          <span className="text-xs text-slate-400">Language:</span>
          {LANGUAGE_OPTIONS.filter((l) =>
            question.supported_languages.includes(l.id)
          ).map((l) => (
            <button
              key={l.id}
              onClick={() => confirmSwitchLanguage(l.id)}
              className={`rounded px-3 py-1 text-xs font-semibold transition ${
                currentLanguage === l.id
                  ? "bg-slate-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {l.label}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-2">
            <span
              className="rounded border border-slate-600 px-2.5 py-1 text-xs text-slate-400"
              title="Code execution is not available in Phase 1"
            >
              Run — Phase 2
            </span>
          </div>
        </div>

        {/* Monaco */}
        <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
          <CodeEditor code={currentCode} language={currentLanguage} onChange={setCode} />
        </div>

        {/* Language switch confirm modal */}
        {langSwitchTarget && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="mx-4 max-w-sm rounded-[20px] bg-white p-6 shadow-xl">
              <p className="text-base font-semibold text-slate-900">Switch language?</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                You have code for{" "}
                <strong>
                  {LANGUAGE_OPTIONS.find((l) => l.id === currentLanguage)?.label}
                </strong>
                . Switching will keep your current code saved — you can switch back any time.
              </p>
              <div className="mt-5 flex gap-3">
                <button
                  onClick={doSwitchLanguage}
                  className="flex-1 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Switch to {LANGUAGE_OPTIONS.find((l) => l.id === langSwitchTarget)?.label}
                </button>
                <button
                  onClick={() => setLangSwitchTarget(null)}
                  className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
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

  function renderTesting() {
    return (
      <div className="mx-auto max-w-2xl space-y-6 px-6 py-8">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Testing Plan</h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            {isPractice
              ? "Describe how you would test your solution. Think about normal cases, edge cases, and boundary values."
              : "Describe your testing approach."}
          </p>
        </div>

        <textarea
          value={draft.testingPlan}
          onChange={(e) => updateDraft({ testingPlan: e.target.value })}
          placeholder="Describe your testing strategy..."
          rows={5}
          className="w-full resize-none rounded-[16px] border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-800 placeholder-slate-400 shadow-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
        />

        <div>
          <h3 className="text-sm font-semibold text-slate-700">Edge Cases</h3>
          <p className="mt-1 text-xs leading-6 text-slate-500">
            {isPractice
              ? "List specific edge cases you considered: empty inputs, single element, duplicates, max/min values, negative numbers, etc."
              : "List edge cases."}
          </p>
          <textarea
            value={draft.edgeCases}
            onChange={(e) => updateDraft({ edgeCases: e.target.value })}
            placeholder="e.g. Empty array, single element, all duplicates, target not found..."
            rows={4}
            className="mt-2 w-full resize-none rounded-[16px] border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-800 placeholder-slate-400 shadow-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          />
        </div>

        {/* Show examples for reference */}
        {Array.isArray(question.examples) && question.examples.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Given Examples</h3>
            <div className="mt-2 space-y-2">
              {question.examples.map((ex: QuestionExample, i: number) => (
                <div
                  key={i}
                  className="rounded-[12px] border border-slate-100 bg-slate-50 px-4 py-3 font-mono text-xs text-slate-700"
                >
                  <span className="font-sans font-semibold text-slate-400">In: </span>
                  {String(ex.input)}
                  <span className="mx-2 font-sans text-slate-300">→</span>
                  <span className="font-sans font-semibold text-slate-400">Out: </span>
                  {String(ex.output)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderComplexity() {
    return (
      <div className="mx-auto max-w-2xl space-y-6 px-6 py-8">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Complexity Analysis</h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            Analyse the time and space complexity of your solution.
            {isPractice && " Scoring will be added in a future phase — focus on explaining your reasoning clearly."}
          </p>
        </div>

        <textarea
          value={draft.complexity}
          onChange={(e) => updateDraft({ complexity: e.target.value })}
          placeholder="e.g. Time: O(n) — one pass through the array. Space: O(n) — hash map stores at most n entries..."
          rows={8}
          className="w-full resize-none rounded-[16px] border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-800 placeholder-slate-400 shadow-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
        />

        {(question.expected_time_complexity || question.expected_space_complexity) && (
          <div className="rounded-[16px] border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Reference complexity (from question)
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {question.expected_time_complexity && (
                <div>
                  <p className="text-xs text-slate-500">Time</p>
                  <p className="font-mono text-sm font-semibold text-slate-900">
                    {question.expected_time_complexity}
                  </p>
                </div>
              )}
              {question.expected_space_complexity && (
                <div>
                  <p className="text-xs text-slate-500">Space</p>
                  <p className="font-mono text-sm font-semibold text-slate-900">
                    {question.expected_space_complexity}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderSubmit() {
    const hasCode =
      !!draft.codeByLanguage[currentLanguage] &&
      draft.codeByLanguage[currentLanguage] !== (question.starter_code?.[currentLanguage] ?? "");

    const items = [
      { label: "Question", value: question.title },
      { label: "Mode", value: initialMode === "practice" ? "Practice" : "Assessment" },
      { label: "Language", value: LANGUAGE_OPTIONS.find((l) => l.id === currentLanguage)?.label ?? currentLanguage },
      { label: "Clarification", value: draft.clarification.trim() ? "Written" : "Not completed", done: !!draft.clarification.trim() },
      { label: "Approach", value: draft.approach.trim() ? "Written" : "Not completed", done: !!draft.approach.trim() },
      { label: "Code", value: hasCode ? "Modified" : "Using starter code", done: hasCode },
      { label: "Testing Plan", value: draft.testingPlan.trim() ? "Written" : "Not completed", done: !!draft.testingPlan.trim() },
      { label: "Complexity", value: draft.complexity.trim() ? "Written" : "Not completed", done: !!draft.complexity.trim() },
    ];

    return (
      <div className="mx-auto max-w-2xl space-y-6 px-6 py-8">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Review & Submit</h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            Review your attempt before submitting. This is a Phase 1 local submission — your attempt
            will not be saved to the database yet.
          </p>
        </div>

        <div className="divide-y divide-slate-100 rounded-[20px] border border-slate-200 bg-white shadow-sm">
          {items.map((item) => (
            <div key={item.label} className="flex items-center justify-between px-5 py-3.5">
              <span className="text-sm text-slate-600">{item.label}</span>
              <span
                className={`text-sm font-semibold ${"done" in item ? (item.done ? "text-emerald-600" : "text-slate-400") : "text-slate-900"}`}
              >
                {"done" in item && item.done && (
                  <span className="mr-1.5 text-emerald-500">✓</span>
                )}
                {item.value}
              </span>
            </div>
          ))}
        </div>

        <div className="rounded-[16px] border border-amber-100 bg-amber-50 px-5 py-4 text-sm leading-7 text-amber-800">
          <strong>Phase 1 note:</strong> Submitting will create a local placeholder result.
          Attempt persistence, code execution, and scorecards are coming in future phases.
        </div>

        <button
          onClick={handleSubmit}
          className="w-full rounded-full border border-slate-950 bg-slate-950 px-5 py-3.5 text-sm font-semibold text-slate-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] transition hover:bg-slate-800"
        >
          Submit Attempt →
        </button>
      </div>
    );
  }

  function renderCurrentStage() {
    switch (draft.currentStage) {
      case "problem":       return renderProblem();
      case "clarification": return renderClarification();
      case "approach":      return renderApproach();
      case "coding":        return renderCoding();
      case "testing":       return renderTesting();
      case "complexity":    return renderComplexity();
      case "submit":        return renderSubmit();
    }
  }

  const isCodingStage = draft.currentStage === "coding";

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      {/* ── Header ── */}
      <header className="flex flex-shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-6 py-4">
        <Link
          href="/questions"
          className="flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-900"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Questions
        </Link>

        <div className="h-4 w-px bg-slate-200" />

        <h1 className="flex-1 truncate text-sm font-semibold text-slate-900">
          {question.title}
        </h1>

        <span className="flex-shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-600">
          {initialMode}
        </span>

        {initialMode === "assessment" && (
          <div className="flex-shrink-0 font-mono text-sm font-semibold tabular-nums text-slate-900">
            {formatTime(timerSeconds)}
          </div>
        )}

        <button
          onClick={() => setShowResetConfirm(true)}
          className="flex-shrink-0 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
        >
          Reset Draft
        </button>
      </header>

      {/* ── Stepper ── */}
      <div className="flex flex-shrink-0 items-center overflow-x-auto border-b border-slate-200 bg-white px-4 py-3">
        {STAGES.map((stage, idx) => {
          const isActive = stage === draft.currentStage;
          const isPast = idx < currentStageIdx;
          return (
            <div key={stage} className="flex items-center">
              <button
                onClick={() => goToStage(stage)}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  isActive
                    ? "bg-slate-950 text-white"
                    : isPast
                    ? "text-slate-500 hover:text-slate-900"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <span
                  className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    isActive
                      ? "bg-white text-slate-950"
                      : isPast
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {isPast ? "✓" : idx + 1}
                </span>
                <span className="hidden sm:inline">{STAGE_LABELS[stage]}</span>
              </button>
              {idx < STAGES.length - 1 && (
                <div
                  className={`mx-1 h-px w-4 flex-shrink-0 ${
                    idx < currentStageIdx ? "bg-emerald-200" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Content ── */}
      <div
        className={`flex-1 overflow-auto ${isCodingStage ? "relative flex flex-col" : ""}`}
        style={isCodingStage ? { minHeight: 0 } : undefined}
      >
        {renderCurrentStage()}
      </div>

      {/* ── Footer navigation ── */}
      {!isCodingStage && (
        <footer className="flex flex-shrink-0 items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
          <button
            onClick={goPrev}
            disabled={currentStageIdx === 0}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Previous
          </button>

          <span className="text-xs text-slate-400">
            Step {currentStageIdx + 1} of {STAGES.length}
          </span>

          {draft.currentStage !== "submit" ? (
            <button
              onClick={goNext}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-950 bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] transition hover:bg-slate-800"
            >
              Next →
            </button>
          ) : (
            <div className="w-20" />
          )}
        </footer>
      )}

      {isCodingStage && (
        <footer className="flex flex-shrink-0 items-center justify-between border-t border-slate-700 px-6 py-3" style={{ background: "#1f2328" }}>
          <button
            onClick={goPrev}
            className="rounded-full border border-slate-600 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-400 hover:text-white"
          >
            ← Previous
          </button>
          <span className="text-xs text-slate-500">
            Step {currentStageIdx + 1} of {STAGES.length}
          </span>
          <button
            onClick={goNext}
            className="rounded-full border border-slate-400 bg-slate-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-600"
          >
            Next →
          </button>
        </footer>
      )}

      {/* ── Reset confirm modal ── */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 max-w-sm rounded-[20px] bg-white p-6 shadow-xl">
            <p className="text-base font-semibold text-slate-900">Reset draft?</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              This will clear all your notes, code, and progress for this question. This cannot be
              undone.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Reset
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
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
