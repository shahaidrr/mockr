/**
 * MVP browser-based JavaScript public test runner.
 *
 * Security note: This is a best-effort sandbox using a Web Worker and a 2-second
 * timeout. It is appropriate for running PUBLIC test cases only. It is NOT a
 * production-grade secure sandbox. Hidden tests must never be sent to the browser.
 * Candidate code must never execute on the server.
 */

import type { QuestionTestCase } from "@/types/question";
import type { PublicTestRunResult, PublicTestRunSummary } from "@/types/test-run";

const TIMEOUT_MS = 2000;

// Embedded worker source. Runs in a separate thread with no DOM access.
// Shadowed globals reduce accidental or intentional side-effects.
const WORKER_SOURCE = `
(function () {
  // Shadow globals that should not be used in candidate code
  try { self.fetch = undefined; } catch (_) {}
  try { self.XMLHttpRequest = undefined; } catch (_) {}
  try { self.localStorage = undefined; } catch (_) {}
  try { self.sessionStorage = undefined; } catch (_) {}
  self.importScripts = function () {
    throw new Error("importScripts is disabled in the test runner.");
  };

  function deepEqual(a, b) {
    if (a === b) return true;
    if (a === null || b === null) return a === b;
    if (typeof a !== typeof b) return false;
    if (typeof a !== "object") return false;
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every(function (key) { return deepEqual(a[key], b[key]); });
  }

  self.onmessage = function (e) {
    var code = e.data.code;
    var functionName = e.data.functionName;
    var testCases = e.data.testCases;
    var results = [];
    var candidateFn;

    try {
      candidateFn = new Function(code + "\\n; return " + functionName + ";")();
    } catch (err) {
      for (var i = 0; i < testCases.length; i++) {
        var tc = testCases[i];
        results.push({
          testCaseId: tc.id,
          label: tc.label,
          status: "error",
          input: tc.input.args,
          expected: tc.expected_output,
          error: String(err),
        });
      }
      self.postMessage({ results: results });
      return;
    }

    for (var j = 0; j < testCases.length; j++) {
      var tc2 = testCases[j];
      var start = Date.now();
      try {
        var actual = candidateFn.apply(null, tc2.input.args);
        var durationMs = Date.now() - start;
        var passed = deepEqual(actual, tc2.expected_output);
        results.push({
          testCaseId: tc2.id,
          label: tc2.label,
          status: passed ? "passed" : "failed",
          input: tc2.input.args,
          expected: tc2.expected_output,
          actual: actual,
          durationMs: durationMs,
        });
      } catch (runErr) {
        results.push({
          testCaseId: tc2.id,
          label: tc2.label,
          status: "error",
          input: tc2.input.args,
          expected: tc2.expected_output,
          error: String(runErr),
          durationMs: Date.now() - start,
        });
      }
    }

    self.postMessage({ results: results });
  };
})();
`;

export async function runPublicTests(
  code: string,
  functionName: string,
  testCases: QuestionTestCase[]
): Promise<PublicTestRunSummary> {
  return new Promise((resolve) => {
    const blob = new Blob([WORKER_SOURCE], { type: "application/javascript" });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);
    let settled = false;

    function finish(summary: PublicTestRunSummary) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      resolve(summary);
    }

    const timer = setTimeout(() => {
      const results: PublicTestRunResult[] = testCases.map((tc) => ({
        testCaseId: tc.id,
        label: tc.label,
        status: "timeout",
        input: tc.input.args,
        expected: tc.expected_output,
        error:
          "Execution timed out after 2 seconds. Check for an infinite loop or an inefficient solution.",
      }));
      finish({ passed: 0, failed: 0, total: testCases.length, results, timedOut: true });
    }, TIMEOUT_MS);

    worker.onmessage = (e: MessageEvent<{ results: PublicTestRunResult[] }>) => {
      const { results } = e.data;
      const passed = results.filter((r) => r.status === "passed").length;
      const failed = results.filter((r) => r.status !== "passed").length;
      finish({ passed, failed, total: testCases.length, results, timedOut: false });
    };

    worker.onerror = (e: ErrorEvent) => {
      const results: PublicTestRunResult[] = testCases.map((tc) => ({
        testCaseId: tc.id,
        label: tc.label,
        status: "error",
        input: tc.input.args,
        expected: tc.expected_output,
        error: e.message ?? "Unknown worker error",
      }));
      finish({
        passed: 0,
        failed: results.length,
        total: testCases.length,
        results,
        timedOut: false,
      });
    };

    worker.postMessage({ code, functionName, testCases });
  });
}
