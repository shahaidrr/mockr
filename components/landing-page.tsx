import Link from "next/link";
import FeatureCard from "@/components/feature-card";
import SiteHeader from "@/components/site-header";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "/questions", label: "Questions" },
];

const positioningChips = [
  "Built for CS students",
  "Internship prep",
  "Graduate roles",
  "Coding interviews",
  "Feedback-focused",
];

const featureCards = [
  {
    eyebrow: "Practice",
    title: "Interview-style coding practice",
    description:
      "Work through realistic coding prompts in a focused environment designed for preparation rather than screening.",
  },
  {
    eyebrow: "Feedback",
    title: "Structured scorecards",
    description:
      "Review each attempt through clear dimensions so you know whether the issue was reasoning, correctness, or communication.",
  },
  {
    eyebrow: "Review",
    title: "Code, testing and complexity feedback",
    description:
      "Get actionable notes on edge cases, debugging habits, and whether your time and space analysis is convincing.",
  },
  {
    eyebrow: "History",
    title: "Attempt history",
    description:
      "Keep a visible record of what you practised, how you scored, and which topics need another round.",
  },
  {
    eyebrow: "Growth",
    title: "Weakness tracking",
    description:
      "Spot recurring patterns like weak edge-case testing or rushed explanations before they show up in real interviews.",
  },
  {
    eyebrow: "Next step",
    title: "Recommended next practice",
    description:
      "Move from one focused question to the next with lightweight guidance on what to repeat and what to level up.",
  },
];

const steps = [
  {
    step: "01",
    title: "Choose a question",
    description:
      "Start with one coding prompt tailored to interview-style preparation.",
  },
  {
    step: "02",
    title: "Explain your approach",
    description:
      "Practise outlining tradeoffs and the solution shape before you dive into code.",
  },
  {
    step: "03",
    title: "Code and test",
    description:
      "Write your implementation, think through cases, and build stronger debugging habits.",
  },
  {
    step: "04",
    title: "Review feedback",
    description:
      "Use structured notes and scorecards to decide what to improve on the next attempt.",
  },
];

const futureCards = [
  {
    title: "Single-question practice",
    description:
      "The current MVP starts with focused coding questions and feedback loops.",
  },
  {
    title: "Timed interview rounds",
    description:
      "Add realistic time pressure and pacing once the fundamentals are in place.",
  },
  {
    title: "Full AI mock interviews",
    description:
      "Expand into end-to-end interview sessions with richer coaching and review.",
  },
  {
    title: "Company-style preparation",
    description:
      "Organize practice around different interview formats without claiming exact employer replication.",
  },
];

const dashboardPreviewStats = [
  { label: "Questions completed", value: "4" },
  { label: "Average score", value: "72" },
  { label: "Main focus", value: "Edge-case testing" },
];

type LandingPageProps = {
  ctaHref?: string;
  isLoggedIn?: boolean;
};

export default function LandingPage({ ctaHref = "/signup", isLoggedIn = false }: LandingPageProps) {
  const headerPrimary = isLoggedIn
    ? { href: "/questions", label: "Browse questions" }
    : { href: "/signup", label: "Sign up free" };

  const headerSecondary = isLoggedIn
    ? { href: "/dashboard", label: "Dashboard" }
    : { href: "/login", label: "Log in" };

  return (
    <div className="min-h-screen text-slate-900">
      <SiteHeader
        links={navLinks}
        secondaryAction={headerSecondary}
        primaryAction={headerPrimary}
      />

      <main>
        <section className="relative overflow-hidden px-6 py-16 lg:px-8 lg:py-24">
          <div className="absolute inset-x-0 top-0 -z-10 mx-auto h-[520px] max-w-7xl rounded-[48px] bg-gradient-to-br from-sky-100 via-white to-teal-100 blur-3xl" />

          <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center">
            <div className="max-w-2xl">
              <div className="inline-flex rounded-full border border-sky-200 bg-white/80 px-4 py-2 text-sm font-medium text-sky-800">
                Focused coding practice now, fuller mock interviews next.
              </div>

              <h1 className="mt-8 text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
                Practise coding interviews before the real one.
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                Practise realistic coding interview questions, get feedback on
                your code, reasoning, testing and communication, track your
                weaker patterns, and build toward future full mock interviews.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href={ctaHref}
                  className="inline-flex items-center justify-center rounded-full border border-slate-950 bg-slate-950 px-6 py-3 text-sm font-semibold text-slate-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] transition hover:bg-slate-800"
                >
                  Create free account
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-200"
                >
                  Log in
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                {positioningChips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-600"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>

            <div className="surface-grid rounded-[36px] border border-slate-200/80 bg-white/70 p-4 shadow-[0_36px_120px_-56px_rgba(15,23,42,0.45)] sm:p-6">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                <div className="rounded-[28px] border border-slate-200 bg-white p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        AI interviewer
                      </p>
                      <h2 className="mt-2 text-lg font-semibold">
                        Guided coding round
                      </h2>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Live soon
                    </span>
                  </div>

                  <div className="mt-5 rounded-[24px] bg-slate-950 p-5 text-slate-50">
                    <p className="text-sm text-slate-300">
                      Prompt
                    </p>
                    <p className="mt-3 text-base font-medium">
                      Find Matching Pair
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      Explain your approach first, then implement a hash-map
                      solution and talk through edge-case testing.
                    </p>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[22px] border border-slate-200 bg-sky-50 p-4">
                      <p className="text-sm font-medium text-slate-500">
                        Score preview
                      </p>
                      <p className="mt-2 text-3xl font-semibold text-slate-950">
                        72
                        <span className="text-base text-slate-400">/100</span>
                      </p>
                    </div>

                    <div className="rounded-[22px] border border-slate-200 bg-teal-50 p-4">
                      <p className="text-sm font-medium text-slate-500">
                        Next focus
                      </p>
                      <p className="mt-2 text-base font-semibold text-slate-950">
                        Edge-case testing
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-[28px] border border-slate-200 bg-white p-5">
                    <p className="text-sm font-medium text-slate-500">
                      Coding question
                    </p>
                    <div className="mt-4 space-y-3">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm font-medium text-slate-700">
                          Topic
                        </p>
                        <p className="mt-1 text-base font-semibold text-slate-950">
                          Hash maps
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm font-medium text-slate-700">
                          Difficulty
                        </p>
                        <p className="mt-1 text-base font-semibold text-slate-950">
                          Interview warm-up
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-slate-200 bg-white p-5">
                    <p className="text-sm font-medium text-slate-500">
                      Progress snapshot
                    </p>
                    <div className="mt-4 space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-sm text-slate-600">
                          <span>Problem understanding</span>
                          <span>68</span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-slate-100">
                          <div className="h-2 w-[68%] rounded-full bg-sky-500" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm text-slate-600">
                          <span>Testing</span>
                          <span>58</span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-slate-100">
                          <div className="h-2 w-[58%] rounded-full bg-teal-500" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm text-slate-600">
                          <span>Complexity analysis</span>
                          <span>72</span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-slate-100">
                          <div className="h-2 w-[72%] rounded-full bg-indigo-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="mx-auto max-w-7xl px-6 py-20 lg:px-8"
        >
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">
              Features
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Everything you need to improve between interviews
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              MOCKR.AI is built to help candidates practise deliberately rather
              than cram blindly between recruiting cycles.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featureCards.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </section>

        <section
          id="how-it-works"
          className="border-y border-slate-200/80 bg-sky-50/70 px-6 py-20 lg:px-8"
        >
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">
                How it works
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                A simple loop for stronger interview habits
              </h2>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {steps.map((item) => (
                <article
                  key={item.step}
                  className="rounded-[28px] border border-slate-200 bg-white p-6"
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {item.step}
                  </p>
                  <h3 className="mt-4 text-xl font-semibold text-slate-950">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">
                Future vision
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Start with focused question practice, then build toward full
                mock interviews
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                The MVP is intentionally narrow: one coding question, one
                review loop, and one clear improvement path at a time. That
                foundation will later expand into richer interview simulations.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {futureCards.map((card) => (
                <article
                  key={card.title}
                  className="rounded-[28px] border border-slate-200 bg-white p-6"
                >
                  <h3 className="text-xl font-semibold text-slate-950">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {card.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-20 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[36px] border border-slate-200 bg-white p-8 shadow-[0_36px_120px_-56px_rgba(15,23,42,0.45)] lg:p-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">
                  Dashboard preview
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                  Keep your progress visible between sessions
                </h2>
                <p className="mt-4 text-lg leading-8 text-slate-600">
                  Track improvement over time with recent attempts, score
                  breakdowns, and an obvious next area to practise.
                </p>
              </div>

              <Link
                href={ctaHref}
                className="inline-flex rounded-full border border-slate-300 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-200"
              >
                Get started
              </Link>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  {dashboardPreviewStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-slate-200 bg-white p-4"
                    >
                      <p className="text-sm text-slate-500">{stat.label}</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-950">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto] sm:items-center">
                    <p className="font-medium text-slate-950">
                      Find Matching Pair
                    </p>
                    <p className="text-sm text-slate-500">Hash maps</p>
                    <p className="text-sm font-semibold text-slate-900">
                      74/100
                    </p>
                    <p className="text-sm text-emerald-700">
                      Meets expected level
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-indigo-50 p-6">
                <p className="text-sm font-medium text-slate-500">
                  Recommended next practice
                </p>
                <p className="mt-4 text-xl font-semibold text-slate-950">
                  Try another hash-map question with stricter edge-case testing.
                </p>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  The dashboard keeps the next action obvious so practice feels
                  cumulative instead of random.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 pb-20 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[36px] border border-slate-200 bg-slate-900 px-8 py-12 text-white lg:px-12">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Ready to practise smarter?
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
              Build confidence with focused question practice now, then grow
              into fuller interview preparation over time.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href={ctaHref}
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Create free account
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-white transition hover:border-slate-500 hover:bg-slate-800"
              >
                Log in
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/80 bg-white/80 px-6 py-10 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-900">
              MOCKR.AI
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Student-friendly interview preparation for coding practice,
              structured feedback, and steady improvement across attempts.
            </p>
          </div>

          <div className="flex gap-8 text-sm text-slate-600">
            <Link href="#features" className="transition hover:text-slate-950">
              Product
            </Link>
            <Link href="/questions" className="transition hover:text-slate-950">
              Questions
            </Link>
            <Link href="/signup" className="transition hover:text-slate-950">
              Sign up
            </Link>
            <Link href="/login" className="transition hover:text-slate-950">
              Log in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
