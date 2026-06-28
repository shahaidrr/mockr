import Link from "next/link";
import { redirect } from "next/navigation";
import DashboardCard from "@/components/dashboard-card";
import StatCard from "@/components/stat-card";
import { createClient } from "@/lib/supabase/server";

const stats = [
  {
    label: "Questions completed",
    value: "4",
    hint: "Steady practice already building momentum.",
  },
  {
    label: "Average score",
    value: "72",
    hint: "A solid base with clear room to sharpen execution.",
  },
  {
    label: "Strongest topic",
    value: "Hash maps",
    hint: "Pattern recognition is strongest when the question is indexed.",
  },
  {
    label: "Main weakness",
    value: "Edge-case testing",
    hint: "Test unusual inputs earlier before finalizing the solution.",
  },
];

const recentAttempts = [
  {
    question: "Find Matching Pair",
    topic: "Hash maps",
    score: "74/100",
    outcome: "Meets expected level",
  },
  {
    question: "Balanced Brackets",
    topic: "Stacks",
    score: "66/100",
    outcome: "Borderline",
  },
  {
    question: "Longest Unique Segment",
    topic: "Sliding window",
    score: "71/100",
    outcome: "Meets expected level",
  },
];

const scoreBreakdown = [
  { label: "Problem understanding", value: 68, tone: "bg-sky-500" },
  { label: "Communication", value: 70, tone: "bg-indigo-500" },
  { label: "Code correctness", value: 76, tone: "bg-emerald-500" },
  { label: "Testing/debugging", value: 58, tone: "bg-amber-500" },
  { label: "Complexity analysis", value: 72, tone: "bg-teal-500" },
];

const weaknesses = [
  "Ask clarification questions before coding",
  "Test edge cases earlier",
  "Explain complexity more clearly",
];

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    redirect("/login");
  }

  return (
    <main className="px-6 py-10 lg:px-8">
      <div className="mx-auto max-w-7xl">
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
              href="/practice/demo"
              className="inline-flex items-center justify-center rounded-full border border-slate-950 bg-slate-950 px-5 py-3 text-sm font-semibold text-slate-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] transition hover:bg-slate-800"
            >
              Start new practice
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

        <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
          <DashboardCard
            title="Recent attempts"
            subtitle="Demo data for the MVP shell. Replace this list with Supabase-backed attempt history once the practice flow stores submissions."
          >
            <div className="overflow-hidden rounded-[24px] border border-slate-200">
              <div className="hidden grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_auto_minmax(0,1fr)] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 sm:grid">
                <span>Question</span>
                <span>Topic</span>
                <span>Score</span>
                <span>Result</span>
              </div>

              <div className="divide-y divide-slate-200 bg-white">
                {recentAttempts.map((attempt) => (
                  <div
                    key={attempt.question}
                    className="grid gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_auto_minmax(0,1fr)] sm:items-center sm:gap-4"
                  >
                    <div>
                      <p className="font-medium text-slate-950">
                        {attempt.question}
                      </p>
                      <p className="mt-1 text-sm text-slate-500 sm:hidden">
                        {attempt.topic}
                      </p>
                    </div>
                    <p className="hidden text-sm text-slate-600 sm:block">
                      {attempt.topic}
                    </p>
                    <p className="text-sm font-semibold text-slate-950">
                      {attempt.score}
                    </p>
                    <p className="text-sm text-slate-600">{attempt.outcome}</p>
                  </div>
                ))}
              </div>
            </div>
          </DashboardCard>

          <DashboardCard
            title="Recommended next practice"
            subtitle="Use recent score patterns to drive the next question selection."
          >
            <div className="rounded-[24px] border border-indigo-100 bg-indigo-50 p-5">
              <p className="text-lg font-semibold text-slate-950">
                Try another hash-map question with stricter edge-case testing.
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                The last few attempts show solid pattern recognition, but your
                score drops when tests are added late.
              </p>
            </div>
          </DashboardCard>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)_minmax(0,0.9fr)]">
          <DashboardCard
            title="Score breakdown"
            subtitle="These categories should later be sourced from stored scorecards rather than static demo objects."
          >
            <div className="space-y-5">
              {scoreBreakdown.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{item.label}</span>
                    <span className="font-semibold text-slate-950">
                      {item.value}
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100">
                    <div
                      className={`h-2 rounded-full ${item.tone}`}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>

          <DashboardCard
            title="Weaknesses to address"
            subtitle="Keep the advice short, specific, and tied to observed attempt behaviour."
          >
            <ul className="space-y-3">
              {weaknesses.map((weakness) => (
                <li
                  key={weakness}
                  className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-700"
                >
                  {weakness}
                </li>
              ))}
            </ul>
          </DashboardCard>

          <DashboardCard
            title="Coming soon"
            subtitle="Signal the broader product direction without pretending those flows already exist."
          >
            <div className="space-y-3">
              <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-700">
                Full mock interviews
              </div>
              <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-700">
                Voice practice
              </div>
              <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-700">
                Company-style preparation
              </div>
            </div>
          </DashboardCard>
        </section>
      </div>
    </main>
  );
}
