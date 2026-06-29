"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function translateAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("user already registered") || lower.includes("already registered")) {
    return "An account already exists for this email. Try logging in instead.";
  }
  if (lower.includes("password should be at least") || lower.includes("password must be")) {
    return "Your password must be at least 8 characters.";
  }
  if (lower.includes("invalid email") || lower.includes("unable to validate email")) {
    return "Please enter a valid email address.";
  }
  if (lower.includes("signup is disabled") || lower.includes("signups not allowed")) {
    return "Account creation is temporarily unavailable. Please try again later.";
  }
  if (lower.includes("network") || lower.includes("fetch")) {
    return "A network error occurred. Please check your connection and try again.";
  }
  return "Something went wrong. Please try again.";
}

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match. Please check and try again." });
      return;
    }

    if (password.length < 8) {
      setMessage({ type: "error", text: "Your password must be at least 8 characters." });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const supabase = createClient();

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

      setMessage({
        type: "success",
        text: "Account created. Check your inbox and click the confirmation link to finish signing in.",
      });
    } catch (error) {
      const raw = error instanceof Error ? error.message : "Authentication failed.";
      setMessage({ type: "error", text: translateAuthError(raw) });
    } finally {
      setSubmitting(false);
    }
  }

  const showSuccess = message?.type === "success";

  return (
    <main className="px-6 py-10 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(420px,520px)]">

        {/* Left: product value proposition */}
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
              Save your progress
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Track every attempt and improve with every session.
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Create an account to save your practice attempts, review your
              scorecard history, and keep your next improvement step visible
              across sessions.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[24px] border border-slate-200 bg-white/85 p-5">
              <p className="text-sm font-medium text-slate-500">Attempts</p>
              <p className="mt-2 text-base font-semibold text-slate-950">
                Save and revisit every practice session
              </p>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-white/85 p-5">
              <p className="text-sm font-medium text-slate-500">Scorecards</p>
              <p className="mt-2 text-base font-semibold text-slate-950">
                Code, reasoning, testing, communication
              </p>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-white/85 p-5">
              <p className="text-sm font-medium text-slate-500">Progress</p>
              <p className="mt-2 text-base font-semibold text-slate-950">
                Know exactly what to focus on next
              </p>
            </div>
          </div>
        </section>

        {/* Right: sign-up form */}
        <section className="flex items-center">
          <div className="w-full rounded-[36px] border border-slate-200 bg-white p-8 shadow-[0_36px_120px_-56px_rgba(15,23,42,0.4)]">

            {showSuccess ? (
              <div className="flex flex-col items-center py-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl">
                  ✉️
                </div>
                <h2 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950">
                  Check your email
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  We sent a confirmation link to{" "}
                  <span className="font-medium text-slate-900">{email}</span>.
                  Click the link to activate your account and start practising.
                </p>
                <p className="mt-4 text-sm text-slate-500">
                  Already confirmed?{" "}
                  <Link href="/login" className="font-medium text-sky-700 hover:text-sky-800">
                    Log in
                  </Link>
                </p>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
                    Create account
                  </p>
                  <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                    Start your practice journey
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Create a free account to save attempts, scorecards, and your
                    improvement path.
                  </p>
                </div>

                <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
                  <div>
                    <label htmlFor="signup-email" className="block text-sm font-medium text-slate-700">
                      Email
                    </label>
                    <input
                      id="signup-email"
                      required
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-sky-300 focus:bg-white"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="signup-password" className="block text-sm font-medium text-slate-700">
                      Password
                    </label>
                    <input
                      id="signup-password"
                      required
                      minLength={8}
                      type="password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-sky-300 focus:bg-white"
                      placeholder="At least 8 characters"
                    />
                  </div>

                  <div>
                    <label htmlFor="signup-confirm" className="block text-sm font-medium text-slate-700">
                      Confirm password
                    </label>
                    <input
                      id="signup-confirm"
                      required
                      minLength={8}
                      type="password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-sky-300 focus:bg-white"
                      placeholder="Re-enter your password"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-full border border-slate-950 bg-slate-950 px-5 py-3 text-sm font-semibold text-slate-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? "Creating account…" : "Create account"}
                  </button>
                </form>

                {message?.type === "error" && (
                  <p
                    role="alert"
                    className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
                  >
                    {message.text}
                  </p>
                )}

                <div className="mt-6 text-sm text-slate-600">
                  <Link
                    href="/login"
                    className="font-medium text-sky-700 transition hover:text-sky-800"
                  >
                    Already have an account? Log in
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
