/**
 * Multi-language public test runner for Phase 2.
 *
 * JavaScript — browser Web Worker with sandboxed globals and 2-second timeout.
 * Python     — Pyodide (WASM CPython) inside a Web Worker; 30-second timeout to
 *              allow CDN load on first use. Subsequent runs use the browser cache.
 * C++        — editor-only in Phase 2. No server-side compilation; returns clear
 *              "not yet available" results immediately.
 *
 * Security note: candidate code runs entirely in the browser, never on the server.
 * Public test cases only. Hidden tests are never sent to the browser.
 */

import type { QuestionTestCase } from "@/types/question";
import type { PublicTestRunResult, PublicTestRunSummary } from "@/types/test-run";
import type { SupportedLanguage } from "@/types/practice";

const JS_TIMEOUT_MS = 2000;
const PYTHON_TIMEOUT_MS = 30000;

// ─── JavaScript worker ────────────────────────────────────────────────────────

const JS_WORKER_SOURCE = `
(function () {
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
    var keysA = Object.keys(a);
    var keysB = Object.keys(b);
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

// ─── Python worker (Pyodide) ──────────────────────────────────────────────────
// importScripts is intentionally NOT shadowed here — Pyodide requires it.
// Candidate code cannot call importScripts because the Python scope is isolated.
// Pyodide v0.26.0 is pinned for reproducibility; update as needed.

const PYTHON_WORKER_SOURCE = `
(function () {
  function deepEqual(a, b) {
    if (a === b) return true;
    if (a === null || b === null) return a === b;
    if (typeof a !== typeof b) return false;
    if (typeof a !== "object") return false;
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    var keysA = Object.keys(a);
    var keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every(function (key) { return deepEqual(a[key], b[key]); });
  }

  importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.0/full/pyodide.js");
  var pyodideReady = loadPyodide();

  self.onmessage = function (e) {
    var code = e.data.code;
    var functionName = e.data.functionName;
    var testCases = e.data.testCases;

    pyodideReady.then(function (pyodide) {
      var results = [];

      try {
        pyodide.runPython(code);
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

      var fn = pyodide.globals.get(functionName);
      if (!fn) {
        for (var i = 0; i < testCases.length; i++) {
          var tc2 = testCases[i];
          results.push({
            testCaseId: tc2.id,
            label: tc2.label,
            status: "error",
            input: tc2.input.args,
            expected: tc2.expected_output,
            error: "Function '" + functionName + "' not found. Check your function name.",
          });
        }
        self.postMessage({ results: results });
        return;
      }

      for (var j = 0; j < testCases.length; j++) {
        var tc3 = testCases[j];
        var start = Date.now();
        try {
          var pyArgs = tc3.input.args.map(function (a) { return pyodide.toPy(a); });
          var rawResult = fn.apply(null, pyArgs);
          var durationMs = Date.now() - start;

          var actual;
          if (rawResult !== null && rawResult !== undefined && rawResult.toJs) {
            actual = rawResult.toJs({ dict_converter: Object.fromEntries });
            rawResult.destroy();
          } else {
            actual = rawResult;
          }

          var passed = deepEqual(actual, tc3.expected_output);
          results.push({
            testCaseId: tc3.id,
            label: tc3.label,
            status: passed ? "passed" : "failed",
            input: tc3.input.args,
            expected: tc3.expected_output,
            actual: actual,
            durationMs: durationMs,
          });
        } catch (runErr) {
          results.push({
            testCaseId: tc3.id,
            label: tc3.label,
            status: "error",
            input: tc3.input.args,
            expected: tc3.expected_output,
            error: String(runErr),
            durationMs: Date.now() - start,
          });
        }
      }

      if (fn && fn.destroy) fn.destroy();
      self.postMessage({ results: results });
    }).catch(function (err) {
      var results = testCases.map(function (tc) {
        return {
          testCaseId: tc.id,
          label: tc.label,
          status: "error",
          input: tc.input.args,
          expected: tc.expected_output,
          error: "Python environment failed to load: " + String(err),
        };
      });
      self.postMessage({ results: results });
    });
  };
})();
`;

// ─── Shared worker spawn helper ───────────────────────────────────────────────

function spawnWorker(
  source: string,
  code: string,
  functionName: string,
  testCases: QuestionTestCase[],
  timeoutMs: number
): Promise<PublicTestRunSummary> {
  return new Promise((resolve) => {
    const blob = new Blob([source], { type: "application/javascript" });
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
        error: `Execution timed out after ${timeoutMs / 1000} seconds. Check for an infinite loop or an inefficient solution.`,
      }));
      finish({ passed: 0, failed: 0, total: testCases.length, results, timedOut: true });
    }, timeoutMs);

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

// ─── Public API ───────────────────────────────────────────────────────────────

export async function runPublicTests(opts: {
  language: SupportedLanguage;
  code: string;
  functionName: string;
  testCases: QuestionTestCase[];
}): Promise<PublicTestRunSummary> {
  const { language, code, functionName, testCases } = opts;

  if (language === "javascript") {
    return spawnWorker(JS_WORKER_SOURCE, code, functionName, testCases, JS_TIMEOUT_MS);
  }

  if (language === "python") {
    return spawnWorker(PYTHON_WORKER_SOURCE, code, functionName, testCases, PYTHON_TIMEOUT_MS);
  }

  // C++ — editor-only in Phase 2. No browser-safe compiler is available.
  const results: PublicTestRunResult[] = testCases.map((tc) => ({
    testCaseId: tc.id,
    label: tc.label,
    status: "error",
    input: tc.input.args,
    expected: tc.expected_output,
    error: "C++ execution is coming later. Use JavaScript or Python to run tests.",
  }));
  return { passed: 0, failed: results.length, total: testCases.length, results, timedOut: false };
}
