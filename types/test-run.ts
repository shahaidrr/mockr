export type PublicTestRunStatus = "passed" | "failed" | "error" | "timeout";

export type PublicTestRunResult = {
  testCaseId: string;
  label?: string | null;
  status: PublicTestRunStatus;
  input: unknown;
  expected: unknown;
  actual?: unknown;
  error?: string;
  durationMs?: number;
};

export type PublicTestRunSummary = {
  passed: number;
  failed: number;
  total: number;
  results: PublicTestRunResult[];
  timedOut: boolean;
};
