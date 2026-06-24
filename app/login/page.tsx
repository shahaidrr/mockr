"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmitting(true);
    setMessage("");

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        setMessage(
          "Account created. Check your email if confirmation is enabled."
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
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6">
      <div className="w-full space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">
            {mode === "login" ? "Log in" : "Create an account"}
          </h1>

          <p className="mt-2 text-sm text-neutral-600">
            Save your interview attempts and track your progress.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium">Email</span>

            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-md border p-3"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Password</span>

            <input
              required
              minLength={8}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-md border p-3"
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-black p-3 text-white disabled:opacity-50"
          >
            {submitting
              ? "Submitting..."
              : mode === "login"
                ? "Log in"
                : "Sign up"}
          </button>
        </form>

        {message && (
          <p role="status" className="text-sm">
            {message}
          </p>
        )}

        <button
          type="button"
          className="text-sm underline"
          onClick={() => {
            setMode((currentMode) =>
              currentMode === "login" ? "signup" : "login"
            );
          }}
        >
          {mode === "login"
            ? "Create an account"
            : "Already have an account? Log in"}
        </button>
      </div>
    </main>
  );
}