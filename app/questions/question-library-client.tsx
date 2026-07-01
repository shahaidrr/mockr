"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import type { QuestionSummary, Difficulty } from "@/types/question";

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  easy: "bg-emerald-50 text-emerald-700 border-emerald-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  hard: "bg-red-50 text-red-700 border-red-200",
};

const LANGUAGE_LABELS: Record<string, string> = {
  javascript: "JS",
  python: "PY",
  cpp: "C++",
};

type Props = { questions: QuestionSummary[] };

export default function QuestionLibraryClient({ questions }: Props) {
  const router = useRouter();

  function handleRandom() {
    if (questions.length === 0) return;
    const q = questions[Math.floor(Math.random() * questions.length)];
    router.push(`/practice/${q.id}`);
  }

  return (
    <>
      <div className="flex flex-col gap-6 rounded-[36px] border border-slate-200 bg-white p-8 shadow-[0_36px_120px_-56px_rgba(15,23,42,0.4)] sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">
            Practice
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
            Question Library
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Choose a question to practice the full interview flow — clarification, approach,
            coding, and complexity.
          </p>
        </div>

        <div className="flex flex-shrink-0 flex-col gap-3 sm:flex-row sm:items-start">
          <button
            onClick={handleRandom}
            disabled={questions.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M8 12h.01M12 8h.01M16 12h.01M8 16h.01M16 8h.01" />
            </svg>
            Random Question
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
          >
            Dashboard
          </Link>
        </div>
      </div>

      {questions.length === 0 ? (
        <div className="mt-10 flex flex-col items-center justify-center rounded-[24px] border border-slate-200 bg-slate-50 px-8 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
            📭
          </div>
          <p className="mt-5 text-xl font-semibold text-slate-900">No questions available yet</p>
          <p className="mt-2 text-sm leading-7 text-slate-500">
            Check back soon — new questions are added regularly.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {questions.map((q) => (
            <div
              key={q.id}
              className="flex flex-col rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md"
            >
              {/* Card header: title + difficulty */}
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-base font-semibold leading-snug text-slate-950">{q.title}</h2>
                <span
                  className={`inline-block flex-shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${DIFFICULTY_STYLES[q.difficulty]}`}
                >
                  {q.difficulty}
                </span>
              </div>

              {/* Topic */}
              <p className="mt-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">{q.topic}</p>

              {/* Summary */}
              {q.short_summary && (
                <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{q.short_summary}</p>
              )}

              {/* Meta: time + languages */}
              <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  {q.estimated_minutes} min
                </span>
                <div className="flex gap-1">
                  {q.supported_languages.map((lang) => (
                    <span
                      key={lang}
                      className="rounded bg-slate-100 px-1.5 py-0.5 font-mono font-medium text-slate-600"
                    >
                      {LANGUAGE_LABELS[lang] ?? lang}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2">
                <Link
                  href={`/questions/${q.slug}`}
                  className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  View
                </Link>
                <Link
                  href={`/questions/${q.slug}#practice-setup`}
                  className="flex-1 rounded-full border border-slate-950 bg-slate-950 px-4 py-2 text-center text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] transition hover:bg-slate-800"
                >
                  Start
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
