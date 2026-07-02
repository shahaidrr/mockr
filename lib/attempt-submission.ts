import type { AttemptMode, SupportedLanguage } from "@/types/attempt";
import type {
  PublicTestRunResult,
  PublicTestRunStatus,
  PublicTestRunSummary,
} from "@/types/test-run";

export type SubmissionIntegrityEvent = {
  eventType: string;
  occurredAt: string;
  elapsedSeconds: number;
  severity: "info" | "low" | "medium" | "high";
  metadata?: Record<string, unknown>;
};

export type SubmitPracticeAttemptRequest = {
  questionId: string;
  mode: AttemptMode;
  language: SupportedLanguage;
  clarification: string;
  approach: string;
  testingPlan: string;
  edgeCases: string;
  complexity: string;
  finalCode: string;
  startedAt: string;
  timerSeconds: number;
  publicTestSummary: PublicTestRunSummary | null;
  hintsUsed: number;
  runCount: number | null;
  integrityEvents: SubmissionIntegrityEvent[];
};

export type SubmitPracticeAttemptResponse = {
  attemptId: string;
  scorecardId: string | null;
  attemptSaved: boolean;
  gradingComplete: boolean;
};

export class SubmitPracticeAttemptError extends Error {
  status: number;
  attemptId: string | null;
  attemptSaved: boolean;

  constructor(
    message: string,
    status: number,
    attemptId: string | null = null,
    attemptSaved = false
  ) {
    super(message);
    this.name = "SubmitPracticeAttemptError";
    this.status = status;
    this.attemptId = attemptId;
    this.attemptSaved = attemptSaved;
  }
}

const VALID_MODES = new Set<AttemptMode>(["practice", "assessment"]);
const VALID_LANGUAGES = new Set<SupportedLanguage>(["javascript", "python", "cpp"]);
const VALID_TEST_STATUSES = new Set<PublicTestRunStatus>([
  "passed",
  "failed",
  "error",
  "timeout",
]);
const VALID_SEVERITIES = new Set<SubmissionIntegrityEvent["severity"]>([
  "info",
  "low",
  "medium",
  "high",
]);

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readObject(value: unknown, path: string): Record<string, unknown> {
  if (!isObject(value)) {
    throw new SubmitPracticeAttemptError(`${path} must be an object.`, 400);
  }

  return value;
}

function readString(value: unknown, path: string): string {
  if (typeof value !== "string") {
    throw new SubmitPracticeAttemptError(`${path} must be a string.`, 400);
  }

  return value;
}

function readOptionalString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function readNonNegativeNumber(value: unknown, path: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new SubmitPracticeAttemptError(
      `${path} must be a non-negative number.`,
      400
    );
  }

  return value;
}

function readNullableNumber(value: unknown, path: string): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  return readNonNegativeNumber(value, path);
}

function parseTestResult(
  value: unknown,
  index: number,
  path: string
): PublicTestRunResult {
  const raw = readObject(value, `${path}[${index}]`);
  const status = readString(raw.status, `${path}[${index}].status`);

  if (!VALID_TEST_STATUSES.has(status as PublicTestRunStatus)) {
    throw new SubmitPracticeAttemptError(
      `${path}[${index}].status must be one of: ${Array.from(
        VALID_TEST_STATUSES
      ).join(", ")}.`,
      400
    );
  }

  return {
    testCaseId: readString(raw.testCaseId, `${path}[${index}].testCaseId`),
    label:
      raw.label === null || raw.label === undefined
        ? null
        : readString(raw.label, `${path}[${index}].label`),
    status: status as PublicTestRunStatus,
    input: raw.input,
    expected: raw.expected,
    actual: raw.actual,
    error:
      raw.error === null || raw.error === undefined
        ? undefined
        : readString(raw.error, `${path}[${index}].error`),
    durationMs:
      raw.durationMs === null || raw.durationMs === undefined
        ? undefined
        : readNonNegativeNumber(raw.durationMs, `${path}[${index}].durationMs`),
  };
}

function parseTestSummary(
  value: unknown,
  path: string
): PublicTestRunSummary {
  const raw = readObject(value, path);

  if (!Array.isArray(raw.results)) {
    throw new SubmitPracticeAttemptError(`${path}.results must be an array.`, 400);
  }

  return {
    passed: readNonNegativeNumber(raw.passed, `${path}.passed`),
    failed: readNonNegativeNumber(raw.failed, `${path}.failed`),
    total: readNonNegativeNumber(raw.total, `${path}.total`),
    timedOut: typeof raw.timedOut === "boolean" ? raw.timedOut : false,
    results: raw.results.map((item, index) =>
      parseTestResult(item, index, `${path}.results`)
    ),
  };
}

function normaliseTestSummary(
  summary: PublicTestRunSummary | null
): PublicTestRunSummary | null {
  if (!summary) {
    return null;
  }

  const passed = summary.results.filter((result) => result.status === "passed").length;
  const failed = summary.results.filter((result) => result.status !== "passed").length;
  const timedOut =
    summary.timedOut || summary.results.some((result) => result.status === "timeout");

  return {
    passed,
    failed,
    total: summary.results.length,
    timedOut,
    results: summary.results,
  };
}

function parseIntegrityEvent(
  value: unknown,
  index: number,
  path: string
): SubmissionIntegrityEvent {
  const raw = readObject(value, `${path}[${index}]`);
  const severity = readString(raw.severity, `${path}[${index}].severity`);

  if (!VALID_SEVERITIES.has(severity as SubmissionIntegrityEvent["severity"])) {
    throw new SubmitPracticeAttemptError(
      `${path}[${index}].severity must be one of: ${Array.from(
        VALID_SEVERITIES
      ).join(", ")}.`,
      400
    );
  }

  return {
    eventType: readString(raw.eventType, `${path}[${index}].eventType`),
    occurredAt: readString(raw.occurredAt, `${path}[${index}].occurredAt`),
    elapsedSeconds: readNonNegativeNumber(
      raw.elapsedSeconds,
      `${path}[${index}].elapsedSeconds`
    ),
    severity: severity as SubmissionIntegrityEvent["severity"],
    metadata: isObject(raw.metadata) ? raw.metadata : {},
  };
}

export function parseSubmitPracticeAttemptRequest(
  value: unknown
): SubmitPracticeAttemptRequest {
  const raw = readObject(value, "body");
  const mode = readString(raw.mode, "body.mode");
  const language = readString(raw.language, "body.language");

  if (!VALID_MODES.has(mode as AttemptMode)) {
    throw new SubmitPracticeAttemptError(
      "body.mode must be one of: practice, assessment.",
      400
    );
  }

  if (!VALID_LANGUAGES.has(language as SupportedLanguage)) {
    throw new SubmitPracticeAttemptError(
      "body.language must be one of: javascript, python, cpp.",
      400
    );
  }

  const publicTestSummary =
    raw.publicTestSummary === null || raw.publicTestSummary === undefined
      ? null
      : normaliseTestSummary(
          parseTestSummary(raw.publicTestSummary, "body.publicTestSummary")
        );

  const integrityEvents = Array.isArray(raw.integrityEvents)
    ? raw.integrityEvents.map((item, index) =>
        parseIntegrityEvent(item, index, "body.integrityEvents")
      )
    : [];

  return {
    questionId: readString(raw.questionId, "body.questionId"),
    mode: mode as AttemptMode,
    language: language as SupportedLanguage,
    clarification: readOptionalString(raw.clarification),
    approach: readOptionalString(raw.approach),
    testingPlan: readOptionalString(raw.testingPlan),
    edgeCases: readOptionalString(raw.edgeCases),
    complexity: readOptionalString(raw.complexity),
    finalCode: readString(raw.finalCode, "body.finalCode"),
    startedAt: readString(raw.startedAt, "body.startedAt"),
    timerSeconds: readNonNegativeNumber(raw.timerSeconds, "body.timerSeconds"),
    publicTestSummary,
    hintsUsed: readNonNegativeNumber(raw.hintsUsed, "body.hintsUsed"),
    runCount: readNullableNumber(raw.runCount, "body.runCount"),
    integrityEvents,
  };
}

export async function submitAttempt(
  payload: SubmitPracticeAttemptRequest
): Promise<SubmitPracticeAttemptResponse> {
  const response = await fetch("/api/attempts/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  let data: unknown = null;

  try {
    data = await response.json();
  } catch {
    // Ignore JSON parse failure and fall through to generic error handling.
  }

  if (!response.ok) {
    const body = isObject(data) ? data : {};
    throw new SubmitPracticeAttemptError(
      typeof body.message === "string"
        ? body.message
        : "Unable to submit this attempt.",
      response.status,
      typeof body.attemptId === "string" ? body.attemptId : null,
      body.attemptSaved === true
    );
  }

  const body = readObject(data, "response");

  return {
    attemptId: readString(body.attemptId, "response.attemptId"),
    scorecardId:
      body.scorecardId === null || body.scorecardId === undefined
        ? null
        : readString(body.scorecardId, "response.scorecardId"),
    attemptSaved: body.attemptSaved === true,
    gradingComplete: body.gradingComplete === true,
  };
}
