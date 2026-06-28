"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return new URLSearchParams(window.location.search).get("message") ?? "";
  });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmitting(true);
    setMessage("");

    try {
      const supabase = createClient();

      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
          },
        });

        if (error) {
          throw error;
        }

        setMessage(
          "Account created. Check your email and confirm your address to finish signing in."
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Authentication failed."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="px-6 py-10 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(420px,520px)]">
        <section className="relative overflow-hidden rounded-[36px] border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-teal-50 p-8 shadow-[0_36px_120px_-56px_rgba(15,23,42,0.4)] lg:p-10">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(20,184,166,0.14),transparent_28%)]" />

          <Link
            href="/"
            className="inline-flex rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white"
          >
            Back to home
          </Link>

          <div className="mt-12 max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">
              Interview prep, not screening
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Practise coding interviews and track your progress.
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Build a repeatable prep loop with structured scorecards, attempt
              history, and recommendations for what to practise next.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[24px] border border-slate-200 bg-white/85 p-5">
              <p className="text-sm font-medium text-slate-500">Scorecards</p>
              <p className="mt-2 text-base font-semibold text-slate-950">
                Code, reasoning, testing, communication
              </p>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-white/85 p-5">
              <p className="text-sm font-medium text-slate-500">History</p>
              <p className="mt-2 text-base font-semibold text-slate-950">
                Review trends across attempts
              </p>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-white/85 p-5">
              <p className="text-sm font-medium text-slate-500">
                Recommendations
              </p>
              <p className="mt-2 text-base font-semibold text-slate-950">
                Keep the next practice step obvious
              </p>
            </div>
          </div>
        </section>

        <section className="flex items-center">
          <div className="w-full rounded-[36px] border border-slate-200 bg-white p-8 shadow-[0_36px_120px_-56px_rgba(15,23,42,0.4)]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
                Account access
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                {mode === "login" ? "Log in" : "Create your account"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {mode === "login"
                  ? "Return to your dashboard and continue practising."
                  : "Create an account to save attempts, scorecards, and future recommendations."}
              </p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Email</span>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-sky-300 focus:bg-white"
                  placeholder="you@student.edu"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Password
                </span>
                <input
                  required
                  minLength={8}
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-sky-300 focus:bg-white"
                  placeholder="At least 8 characters"
                />
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Submitting..."
                  : mode === "login"
                    ? "Log in"
                    : "Create account"}
              </button>

              <button
                type="button"
                disabled
                className="w-full rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-400"
              >
                Continue with Google
              </button>
            </form>

            {message ? (
              <p
                role="status"
                className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600"
              >
                {message}
              </p>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 text-sm text-slate-600">
              <button
                type="button"
                className="w-fit font-medium text-sky-700 transition hover:text-sky-800"
                onClick={() => {
                  setMode((currentMode) =>
                    currentMode === "login" ? "signup" : "login"
                  );
                }}
              >
                {mode === "login"
                  ? "Need an account? Create one"
                  : "Already have an account? Log in"}
              </button>

              <p>
                Google auth is intentionally left as a placeholder until the
                Supabase provider configuration is enabled for this project.
              </p>
            </div>

            {/* Reuse the existing Supabase browser client utilities here rather
                than creating page-specific auth helpers. Add provider auth flows
                in this component once the Supabase project configuration is ready.
                Signup confirmation uses /auth/callback so email verification can
                exchange the PKCE auth code into a session before redirecting. */}
          </div>
        </section>
      </div>
    </main>
  );
}
