"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function translateAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials") || lower.includes("invalid credentials")) {
    return "The email or password is incorrect. Please check your details and try again.";
  }
  if (lower.includes("email not confirmed")) {
    return "Please confirm your email address before logging in. Check your inbox for the confirmation link.";
  }
  if (lower.includes("too many requests") || lower.includes("rate limit")) {
    return "Too many login attempts. Please wait a moment and try again.";
  }
  if (lower.includes("user not found") || lower.includes("no user found")) {
    return "No account found for this email. Check your details or create an account.";
  }
  if (lower.includes("network") || lower.includes("fetch")) {
    return "A network error occurred. Please check your connection and try again.";
  }
  return "Something went wrong. Please try again.";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(() => {
    const raw = searchParams.get("message");
    return raw ? { type: "info", text: translateAuthError(raw) } : null;
  });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        throw error;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      const raw = error instanceof Error ? error.message : "Authentication failed.";
      setMessage({ type: "error", text: translateAuthError(raw) });
    } finally {
      setSubmitting(false);
    }
  }

  const messageStyles: Record<string, string> = {
    error: "border-red-100 bg-red-50 text-red-700",
    info: "border-slate-200 bg-slate-50 text-slate-600",
    success: "border-emerald-100 bg-emerald-50 text-emerald-700",
  };

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

        {/* Right: login form */}
        <section className="flex items-center">
          <div className="w-full rounded-[36px] border border-slate-200 bg-white p-8 shadow-[0_36px_120px_-56px_rgba(15,23,42,0.4)]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
                Welcome back
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                Log in to your account
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Return to your dashboard and continue practising.
              </p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  id="login-email"
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
                <label htmlFor="login-password" className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  id="login-password"
                  required
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-sky-300 focus:bg-white"
                  placeholder="Your password"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full border border-slate-950 bg-slate-950 px-5 py-3 text-sm font-semibold text-slate-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Logging in…" : "Log in"}
              </button>
            </form>

            {message && (
              <p
                role={message.type === "error" ? "alert" : "status"}
                className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${messageStyles[message.type]}`}
              >
                {message.text}
              </p>
            )}

            <div className="mt-6 space-y-2 text-sm text-slate-600">
              <div>
                <Link
                  href="/signup"
                  className="font-medium text-sky-700 transition hover:text-sky-800"
                >
                  New to MOCKR.AI? Create an account
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <LoginForm />
  );
}
