"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Question, Difficulty, SupportedLanguage } from "@/types/question";
import type { PracticeMode } from "@/types/practice";

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  easy: "bg-emerald-50 text-emerald-700 border-emerald-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  hard: "bg-red-50 text-red-700 border-red-200",
};

const LANGUAGE_OPTIONS: { id: SupportedLanguage; label: string }[] = [
  { id: "javascript", label: "JavaScript" },
  { id: "python", label: "Python" },
  { id: "cpp", label: "C++" },
];

type Props = { question: Question };

export default function QuestionDetailClient({ question }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<PracticeMode>("practice");
  const [language, setLanguage] = useState<SupportedLanguage>(
    question.supported_languages[0] ?? "javascript"
  );

  function handleStart() {
    router.push(`/practice/${question.id}?mode=${mode}&language=${language}`);
  }

  return (
    <div className="space-y-8">
      {/* Back link */}
      <Link href="/questions" className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Question Library
      </Link>

      {/* Header card */}
      <div className="rounded-[24px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-start gap-3">
          <h1 className="flex-1 text-2xl font-semibold tracking-tight text-slate-950">
            {question.title}
          </h1>
          <span
            className={`flex-shrink-0 rounded-full border px-3 py-1 text-xs font-semibold capitalize ${DIFFICULTY_STYLES[question.difficulty]}`}
          >
            {question.difficulty}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
          <span>{question.topic}</span>
          <span>·</span>
          <span>⏱ {question.estimated_minutes} min</span>
          {question.supported_languages.length > 0 && (
            <>
              <span>·</span>
              <span className="flex gap-1">
                {question.supported_languages.map((lang) => (
                  <span key={lang} className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs font-medium text-slate-600">
                    {lang === "cpp" ? "C++" : lang === "python" ? "Python" : "JavaScript"}
                  </span>
                ))}
              </span>
            </>
          )}
        </div>

        {question.short_summary && (
          <p className="mt-4 text-base leading-7 text-slate-600">{question.short_summary}</p>
        )}
      </div>

      {/* Problem statement */}
      <div className="rounded-[24px] border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
          Problem
        </h2>
        <p className="mt-4 whitespace-pre-wrap text-base leading-8 text-slate-800">
          {question.problem_statement}
        </p>

        {question.input_description && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-slate-700">Input</h3>
            <p className="mt-1 text-sm leading-7 text-slate-600">{question.input_description}</p>
          </div>
        )}

        {question.output_description && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-slate-700">Output</h3>
            <p className="mt-1 text-sm leading-7 text-slate-600">{question.output_description}</p>
          </div>
        )}

        {question.constraints && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-slate-700">Constraints</h3>
            <pre className="mt-1 whitespace-pre-wrap font-mono text-sm leading-7 text-slate-600">
              {question.constraints}
            </pre>
          </div>
        )}
      </div>

      {/* Examples */}
      {Array.isArray(question.examples) && question.examples.length > 0 && (
        <div className="rounded-[24px] border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Examples
          </h2>
          <div className="mt-4 space-y-4">
            {question.examples.map((ex, i) => (
              <div key={i} className="rounded-[16px] border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Example {i + 1}
                </p>
                <div className="mt-3 space-y-2 font-mono text-sm text-slate-800">
                  <div>
                    <span className="font-sans text-xs font-semibold text-slate-500">Input: </span>
                    {typeof ex.input === "object" ? JSON.stringify(ex.input) : String(ex.input)}
                  </div>
                  <div>
                    <span className="font-sans text-xs font-semibold text-slate-500">Output: </span>
                    {typeof ex.output === "object" ? JSON.stringify(ex.output) : String(ex.output)}
                  </div>
                </div>
                {ex.explanation && (
                  <p className="mt-2 text-xs leading-6 text-slate-500">{ex.explanation}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Complexity */}
      {(question.expected_time_complexity || question.expected_space_complexity) && (
        <div className="rounded-[24px] border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Expected Complexity
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {question.expected_time_complexity && (
              <div className="rounded-[16px] border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Time</p>
                <p className="mt-1 font-mono text-base font-semibold text-slate-900">
                  {question.expected_time_complexity}
                </p>
              </div>
            )}
            {question.expected_space_complexity && (
              <div className="rounded-[16px] border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Space</p>
                <p className="mt-1 font-mono text-base font-semibold text-slate-900">
                  {question.expected_space_complexity}
                </p>
              </div>
            )}
          </div>
          {question.expected_complexity_notes && (
            <p className="mt-4 text-sm leading-7 text-slate-600">{question.expected_complexity_notes}</p>
          )}
        </div>
      )}

      {/* Start practice card */}
      <div id="practice-setup" className="rounded-[24px] border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
          Start practising
        </h2>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {/* Mode selection */}
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-700">Mode</p>
            <div className="flex flex-col gap-2">
              {(["practice", "assessment"] as PracticeMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex items-start gap-3 rounded-[16px] border p-4 text-left transition ${
                    mode === m
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <div className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                    mode === m ? "border-white" : "border-slate-400"
                  }`}>
                    {mode === m && <div className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold capitalize">{m}</p>
                    <p className={`mt-0.5 text-xs leading-5 ${mode === m ? "text-slate-300" : "text-slate-500"}`}>
                      {m === "practice"
                        ? "Supportive guidance, no time pressure"
                        : "Timed, minimal prompts — closer to real interview conditions"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Language selection */}
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-700">Language</p>
            <div className="flex flex-col gap-2">
              {LANGUAGE_OPTIONS.filter((l) =>
                question.supported_languages.includes(l.id)
              ).map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLanguage(l.id)}
                  className={`flex items-center gap-3 rounded-[16px] border p-4 text-left transition ${
                    language === l.id
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <div className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                    language === l.id ? "border-white" : "border-slate-400"
                  }`}>
                    {language === l.id && <div className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                  <span className="text-sm font-semibold">{l.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleStart}
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-950 bg-slate-950 px-5 py-3.5 text-sm font-semibold text-slate-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] transition hover:bg-slate-800"
        >
          Start practice
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
