import Link from "next/link";
import { redirect } from "next/navigation";
import DashboardCard from "@/components/dashboard-card";
import StatCard from "@/components/stat-card";
import { createClient } from "@/lib/supabase/server";

const LANGUAGE_LABELS: Record<string, string> = {
  javascript: "JavaScript",
  python: "Python",
  cpp: "C++",
};


function formatDuration(seconds: number | null): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type QuestionSummary = {
  title: string;
  slug: string;
  topic: string;
  difficulty: string;
};

type AttemptRowRaw = {
  id: string;
  question_id: string;
  language: string;
  mode: string;
  status: string;
  submitted_at: string | null;
  time_taken_seconds: number | null;
  overall_score: number | null;
  result_band: string | null;
  questions: QuestionSummary | QuestionSummary[] | null;
};

type AttemptRow = Omit<AttemptRowRaw, "questions"> & {
  questions: QuestionSummary | null;
};

function normaliseQuestions(raw: AttemptRowRaw): AttemptRow {
  const q = raw.questions;
  return {
    ...raw,
    questions: Array.isArray(q) ? (q[0] ?? null) : q,
  };
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  if (claimsError || !claimsData?.claims?.sub) {
    redirect("/login");
  }

  // Fetch real attempt history (most recent 10 submitted)
  const { data: attemptsRaw } = await supabase
    .from("attempts")
    .select(`
      id, question_id, language, mode, status, submitted_at, time_taken_seconds, overall_score, result_band,
      questions (title, slug, topic, difficulty)
    `)
    .eq("status", "submitted")
    .order("submitted_at", { ascending: false })
    .limit(10);

  const attempts: AttemptRow[] = (attemptsRaw ?? []).map((r) =>
    normaliseQuestions(r as AttemptRowRaw)
  );
  const hasAttempts = attempts.length > 0;

  // Compute stats from real data
  const totalAttempts = attempts.length;

  // Count unique questions attempted
  const uniqueQuestions = new Set(attempts.map((a) => a.question_id)).size;

  // Most attempted topic
  const topicCounts: Record<string, number> = {};
  for (const a of attempts) {
    const topic = a.questions?.topic;
    if (topic) topicCounts[topic] = (topicCounts[topic] ?? 0) + 1;
  }
  const topTopic = Object.entries(topicCounts).sort((x, y) => y[1] - x[1])[0]?.[0] ?? null;

  // Most used language
  const langCounts: Record<string, number> = {};
  for (const a of attempts) {
    langCounts[a.language] = (langCounts[a.language] ?? 0) + 1;
  }
  const topLanguage = Object.entries(langCounts).sort((x, y) => y[1] - x[1])[0]?.[0] ?? null;

  return (
    <main className="px-6 py-10 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Hero */}
        <div className="flex flex-col gap-6 rounded-[36px] border border-slate-200 bg-white p-8 shadow-[0_36px_120px_-56px_rgba(15,23,42,0.4)] lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">
              Dashboard
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
              Welcome back
            </h1>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Track your interview practice and focus on what to improve next.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/questions"
              className="inline-flex items-center justify-center rounded-full border border-slate-950 bg-slate-950 px-5 py-3 text-sm font-semibold text-slate-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] transition hover:bg-slate-800"
            >
              Start new practice
            </Link>

            <Link
              href="/questions"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-200"
            >
              Browse questions
            </Link>

            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-full border border-slate-300 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-200"
              >
                Log out
              </button>
            </form>
          </div>
        </div>

        {/* Stats — real data when available, zeros for new users */}
        {hasAttempts ? (
          <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Questions attempted"
              value={String(uniqueQuestions)}
              hint="Unique questions you have practised."
            />
            <StatCard
              label="Total submissions"
              value={String(totalAttempts)}
              hint="All submitted practice attempts."
            />
            <StatCard
              label="Most practised topic"
              value={topTopic ?? "—"}
              hint="The topic you have attempted most often."
            />
            <StatCard
              label="Preferred language"
              value={topLanguage ? (LANGUAGE_LABELS[topLanguage] ?? topLanguage) : "—"}
              hint="The language you use most in practice."
            />
          </section>
        ) : (
          <section className="mt-8 flex flex-col items-center justify-center rounded-[24px] border border-slate-200 bg-slate-50 px-8 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
              📋
            </div>
            <h2 className="mt-5 text-xl font-semibold text-slate-900">No attempts yet</h2>
            <p className="mt-2 max-w-sm text-sm leading-7 text-slate-500">
              Complete your first practice session to start tracking your progress here.
            </p>
            <Link
              href="/questions"
              className="mt-6 inline-flex items-center justify-center rounded-full border border-slate-950 bg-slate-950 px-5 py-3 text-sm font-semibold text-slate-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] transition hover:bg-slate-800"
            >
              Browse questions
            </Link>
          </section>
        )}

        {/* Attempt history — only shown when there are real attempts */}
        {hasAttempts && (
          <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,0.5fr)]">
            <DashboardCard
              title="Recent attempts"
              subtitle="Your last 10 submitted practice sessions."
            >
              <div className="overflow-hidden rounded-[24px] border border-slate-200">
                <div className="hidden grid-cols-[minmax(0,1.5fr)_minmax(0,0.8fr)_minmax(0,0.7fr)_minmax(0,0.9fr)_minmax(0,0.7fr)_minmax(0,1fr)] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 sm:grid">
                  <span>Question</span>
                  <span>Topic</span>
                  <span>Language</span>
                  <span>Date</span>
                  <span>Time</span>
                  <span>Score</span>
                </div>

                <div className="divide-y divide-slate-200 bg-white">
                  {attempts.map((attempt) => (
                    <div
                      key={attempt.id}
                      className="grid gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,0.8fr)_minmax(0,0.7fr)_minmax(0,0.9fr)_minmax(0,0.7fr)_minmax(0,1fr)] sm:items-center sm:gap-4"
                    >
                      <div>
                        <Link
                          href={`/results/${attempt.id}`}
                          className="font-medium text-slate-950 hover:text-sky-700 hover:underline"
                        >
                          {attempt.questions?.title ?? "Unknown question"}
                        </Link>
                        <p className="mt-0.5 text-xs text-slate-500 sm:hidden">
                          {attempt.questions?.topic} · {LANGUAGE_LABELS[attempt.language] ?? attempt.language}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500 sm:hidden">
                          {attempt.overall_score !== null
                            ? `${attempt.overall_score}/100 · ${attempt.result_band ?? "Scored"}`
                            : "Not scored yet"}
                        </p>
                      </div>
                      <p className="hidden text-sm text-slate-600 sm:block">
                        {attempt.questions?.topic ?? "—"}
                      </p>
                      <p className="hidden text-sm text-slate-600 sm:block">
                        {LANGUAGE_LABELS[attempt.language] ?? attempt.language}
                      </p>
                      <p className="hidden text-sm text-slate-500 sm:block">
                        {formatDate(attempt.submitted_at)}
                      </p>
                      <p className="hidden text-sm text-slate-500 sm:block">
                        {formatDuration(attempt.time_taken_seconds)}
                      </p>
                      <div className="hidden sm:block">
                        {attempt.overall_score !== null ? (
                          <>
                            <p className="text-sm font-semibold text-slate-900">
                              {attempt.overall_score}/100
                            </p>
                            <p className="text-xs text-slate-500">
                              {attempt.result_band ?? "Scored"}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-slate-500">Not scored yet</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </DashboardCard>

            <DashboardCard
              title="Practice breakdown"
              subtitle="Counts from your submitted attempts."
            >
              <div className="space-y-3">
                {Object.entries(topicCounts)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([topic, count]) => (
                    <div key={topic}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">{topic}</span>
                        <span className="font-semibold text-slate-950">{count}</span>
                      </div>
                      <div className="mt-1.5 h-1.5 rounded-full bg-slate-100">
                        <div
                          className="h-1.5 rounded-full bg-sky-500"
                          style={{ width: `${Math.round((count / totalAttempts) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </DashboardCard>
          </section>
        )}

        {/* Coming soon — always shown */}
        <section className="mt-8">
          <DashboardCard
            title="Coming soon"
            subtitle="Planned for future phases beyond deterministic scoring."
          >
            <div className="grid gap-3 sm:grid-cols-3">
              {["AI scorecards and feedback", "Cross-attempt trend tracking", "Weakness tracking and recommendations"].map((item) => (
                <div
                  key={item}
                  className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-600"
                >
                  {item}
                </div>
              ))}
            </div>
          </DashboardCard>
        </section>

      </div>
    </main>
  );
}
