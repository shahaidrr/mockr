"use client";

import { useEffect, useState } from "react";
import CodeEditor from "@/components/code-editor";

const STORAGE_KEY = "mockr-demo-code-draft";

const STARTER_CODE = `function findPair(numbers, target) {
  // Write your solution here

}
`;

export default function PracticeWorkspace() {
  const [code, setCode] = useState(() => {
    if (typeof window === "undefined") {
      return STARTER_CODE;
    }

    return window.localStorage.getItem(STORAGE_KEY) ?? STARTER_CODE;
  });
  const [saveStatus, setSaveStatus] = useState(() => {
    if (typeof window === "undefined") {
      return "Loading draft...";
    }

    return window.localStorage.getItem(STORAGE_KEY) !== null
      ? "Draft restored"
      : "No saved draft";
  });

  useEffect(() => {
    const saveTimer = window.setTimeout(() => {
      window.localStorage.setItem(STORAGE_KEY, code);
      setSaveStatus("Draft saved");
    }, 500);

    return () => {
      window.clearTimeout(saveTimer);
    };
  }, [code]);

  function handleCodeChange(value: string) {
    setCode(value);
    setSaveStatus("Saving...");
  }

  function handleReset() {
    const confirmed = window.confirm(
      "Reset your code to the original starter code?"
    );

    if (!confirmed) {
      return;
    }

    window.localStorage.removeItem(STORAGE_KEY);
    setCode(STARTER_CODE);
    setSaveStatus("Draft reset");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <p className="mb-2 text-sm font-medium uppercase tracking-wider text-blue-400">
            MOCKR.AI Practice
          </p>

          <h1 className="text-3xl font-bold">
            Find a Matching Pair
          </h1>

          <p className="mt-3 max-w-3xl text-slate-300">
            Given an array of integers and a target value, return the indices
            of two different numbers whose values add up to the target.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-5 flex flex-wrap gap-2 text-sm">
              <span className="rounded-full bg-green-950 px-3 py-1 text-green-300">
                Easy
              </span>

              <span className="rounded-full bg-blue-950 px-3 py-1 text-blue-300">
                Hash maps
              </span>

              <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-300">
                JavaScript
              </span>
            </div>

            <h2 className="text-xl font-semibold">Problem</h2>

            <p className="mt-3 leading-7 text-slate-300">
              Write a function named{" "}
              <code className="rounded bg-slate-800 px-1.5 py-0.5 text-blue-300">
                findPair
              </code>{" "}
              that accepts an array of numbers and a target number.
            </p>

            <p className="mt-3 leading-7 text-slate-300">
              Return the indices of the two numbers whose sum equals the
              target. You may assume that exactly one valid pair exists.
            </p>

            <div className="mt-6">
              <h3 className="font-semibold">Example</h3>

              <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm text-slate-300">
{`Input:
numbers = [2, 7, 11, 15]
target = 9

Output:
[0, 1]`}
              </pre>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold">Constraints</h3>

              <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-300">
                <li>The array contains at least two numbers.</li>
                <li>Exactly one valid pair exists.</li>
                <li>You cannot use the same element twice.</li>
                <li>Return the two indices in any order.</li>
              </ul>
            </div>

            <div className="mt-6 rounded-lg border border-amber-900 bg-amber-950/40 p-4">
              <p className="text-sm leading-6 text-amber-200">
                Code execution is intentionally not included yet. This page
                currently focuses only on editing and local draft saving.
              </p>
            </div>
          </section>

          <section>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Code editor</h2>

                <p className="mt-1 text-sm text-slate-400">
                  {saveStatus}
                </p>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg border border-red-500 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-950"
              >
                Reset code
              </button>
            </div>

            <CodeEditor code={code} onChange={handleCodeChange} />
          </section>
        </div>
      </div>
    </main>
  );
}
