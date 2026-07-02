import "server-only";

import type { AttemptMode, ResultBand, SupportedLanguage } from "@/types/attempt";
import type { Difficulty } from "@/types/question";
import type { JsonObject } from "@/lib/ai/types";

export type GradeAttemptCategoryKey =
  | "problem_understanding"
  | "communication"
  | "algorithmic_approach"
  | "code_correctness"
  | "code_quality"
  | "testing_debugging"
  | "complexity_analysis"
  | "hints_followups";

export type AiGradeAttemptCategoryKey = Exclude<
  GradeAttemptCategoryKey,
  "code_correctness"
>;

export type GradeAttemptCategory = {
  score: number;
  evidence: string;
  improvement: string;
};

export type GradeAttemptTestStatus = "passed" | "failed" | "error" | "timeout";

export type GradeAttemptTestResult = {
  label: string | null;
  status: GradeAttemptTestStatus;
  error: string | null;
  durationMs: number | null;
};

export type GradeAttemptTestSummary = {
  passed: number;
  failed: number;
  total: number;
  timedOut: boolean;
  results: GradeAttemptTestResult[];
};

export type GradeAttemptInput = {
  question: {
    title: string;
    topic: string;
    difficulty: Difficulty;
    problemStatement: string;
    expectedComplexity: {
      time: string | null;
      space: string | null;
      notes: string | null;
    };
    rubricNotes: string[];
  };
  attempt: {
    mode: AttemptMode;
    language: SupportedLanguage;
    clarificationNotes: string;
    approachExplanation: string;
    testingPlan: string;
    edgeCases: string;
    complexityAnswer: string;
    finalCode: string;
    timeTakenSeconds: number | null;
    hintsUsed: number;
    runCount: number | null;
  };
  publicTests: GradeAttemptTestSummary;
  hiddenTests: GradeAttemptTestSummary | null;
};

export type GradeAttemptAiResponse = Record<
  AiGradeAttemptCategoryKey,
  GradeAttemptCategory
> & {
  strengths: string[];
  weaknesses: string[];
  improvement_tasks: string[];
  recommended_next_topic: string;
  summary: string;
};

export type GradeAttemptResult = Record<GradeAttemptCategoryKey, GradeAttemptCategory> & {
  overall_score: number;
  result_band: ResultBand;
  strengths: string[];
  weaknesses: string[];
  improvement_tasks: string[];
  recommended_next_topic: string;
  summary: string;
  feedback: {
    phase: string;
    scoring_method: "ai_hybrid_v1";
    limitations: string[];
    caps_applied: string[];
    public_tests: {
      passed: number;
      failed: number;
      total: number;
    };
    hidden_tests: {
      passed: number;
      failed: number;
      total: number;
    } | null;
  };
  rubric_version: "ai-hybrid-v1";
  model_used: string | null;
};

export class GradeAttemptValidationError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "GradeAttemptValidationError";
    this.status = status;
  }
}

const VALID_DIFFICULTIES = new Set<Difficulty>(["easy", "medium", "hard"]);
const VALID_MODES = new Set<AttemptMode>(["practice", "assessment"]);
const VALID_LANGUAGES = new Set<SupportedLanguage>(["javascript", "python", "cpp"]);
const VALID_TEST_STATUSES = new Set<GradeAttemptTestStatus>([
  "passed",
  "failed",
  "error",
  "timeout",
]);

const AI_CATEGORY_KEYS: AiGradeAttemptCategoryKey[] = [
  "problem_understanding",
  "communication",
  "algorithmic_approach",
  "code_quality",
  "testing_debugging",
  "complexity_analysis",
  "hints_followups",
];

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readObject(
  value: unknown,
  path: string
): Record<string, unknown> {
  if (!isObject(value)) {
    throw new GradeAttemptValidationError(`${path} must be an object.`);
  }

  return value;
}

function readString(value: unknown, path: string): string {
  if (typeof value !== "string") {
    throw new GradeAttemptValidationError(`${path} must be a string.`);
  }

  return value;
}

function readOptionalString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

const OUTCOME_CLAIM_PATTERN =
  /\b(job offer|offer from|hiring probability|probability of getting|chance of getting|likely to be hired|would be hired|will get (the )?(job|role|offer)|get rejected|be rejected|guarantee(?:d)? (a )?(job|offer|hire)|pass (a|the) real interview)\b/i;

function sanitizeModelText(value: string, fallback: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    return fallback;
  }

  if (OUTCOME_CLAIM_PATTERN.test(trimmed)) {
    return fallback;
  }

  return trimmed;
}

function sanitizeModelStringList(values: string[], fallback: string): string[] {
  const sanitized = values
    .map((value) => sanitizeModelText(value, ""))
    .filter((value) => value.length > 0);

  return sanitized.length > 0 ? sanitized : [fallback];
}

function readNullableString(value: unknown, path: string): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  return readString(value, path);
}

function readNonNegativeNumber(
  value: unknown,
  path: string
): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new GradeAttemptValidationError(`${path} must be a non-negative number.`);
  }

  return value;
}

function readNullableNumber(
  value: unknown,
  path: string
): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  return readNonNegativeNumber(value, path);
}

function readStringArray(value: unknown, path: string): string[] {
  if (value === null || value === undefined) {
    return [];
  }

  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    throw new GradeAttemptValidationError(`${path} must be an array of strings.`);
  }

  return value;
}

function clampTenPointScore(value: number): number {
  return Math.max(0, Math.min(10, Math.round(value)));
}

function parseTestResult(
  value: unknown,
  index: number,
  path: string
): GradeAttemptTestResult {
  const raw = readObject(value, `${path}[${index}]`);
  const status = readString(raw.status, `${path}[${index}].status`);

  if (!VALID_TEST_STATUSES.has(status as GradeAttemptTestStatus)) {
    throw new GradeAttemptValidationError(
      `${path}[${index}].status must be one of: ${Array.from(VALID_TEST_STATUSES).join(", ")}.`
    );
  }

  return {
    label: readNullableString(raw.label, `${path}[${index}].label`),
    status: status as GradeAttemptTestStatus,
    error: readNullableString(raw.error, `${path}[${index}].error`),
    durationMs: readNullableNumber(raw.durationMs, `${path}[${index}].durationMs`),
  };
}

function parseTestSummary(
  value: unknown,
  path: string
): GradeAttemptTestSummary {
  const raw = readObject(value, path);
  const resultsRaw = raw.results;

  if (!Array.isArray(resultsRaw)) {
    throw new GradeAttemptValidationError(`${path}.results must be an array.`);
  }

  return {
    passed: readNonNegativeNumber(raw.passed, `${path}.passed`),
    failed: readNonNegativeNumber(raw.failed, `${path}.failed`),
    total: readNonNegativeNumber(raw.total, `${path}.total`),
    timedOut: typeof raw.timedOut === "boolean" ? raw.timedOut : false,
    results: resultsRaw.map((item, index) => parseTestResult(item, index, `${path}.results`)),
  };
}

export function parseGradeAttemptInput(value: unknown): GradeAttemptInput {
  const raw = readObject(value, "body");
  const question = readObject(raw.question, "body.question");
  const attempt = readObject(raw.attempt, "body.attempt");
  const difficulty = readString(question.difficulty, "body.question.difficulty");
  const mode = readString(attempt.mode, "body.attempt.mode");
  const language = readString(attempt.language, "body.attempt.language");

  if (!VALID_DIFFICULTIES.has(difficulty as Difficulty)) {
    throw new GradeAttemptValidationError(
      "body.question.difficulty must be one of: easy, medium, hard."
    );
  }

  if (!VALID_MODES.has(mode as AttemptMode)) {
    throw new GradeAttemptValidationError(
      "body.attempt.mode must be one of: practice, assessment."
    );
  }

  if (!VALID_LANGUAGES.has(language as SupportedLanguage)) {
    throw new GradeAttemptValidationError(
      "body.attempt.language must be one of: javascript, python, cpp."
    );
  }

  const expectedComplexity = readObject(
    question.expectedComplexity ?? {},
    "body.question.expectedComplexity"
  );

  return {
    question: {
      title: readString(question.title, "body.question.title"),
      topic: readString(question.topic, "body.question.topic"),
      difficulty: difficulty as Difficulty,
      problemStatement: readString(
        question.problemStatement,
        "body.question.problemStatement"
      ),
      expectedComplexity: {
        time: readNullableString(
          expectedComplexity.time,
          "body.question.expectedComplexity.time"
        ),
        space: readNullableString(
          expectedComplexity.space,
          "body.question.expectedComplexity.space"
        ),
        notes: readNullableString(
          expectedComplexity.notes,
          "body.question.expectedComplexity.notes"
        ),
      },
      rubricNotes: readStringArray(
        question.rubricNotes,
        "body.question.rubricNotes"
      ),
    },
    attempt: {
      mode: mode as AttemptMode,
      language: language as SupportedLanguage,
      clarificationNotes: readString(
        attempt.clarificationNotes,
        "body.attempt.clarificationNotes"
      ),
      approachExplanation: readString(
        attempt.approachExplanation,
        "body.attempt.approachExplanation"
      ),
      testingPlan: readOptionalString(attempt.testingPlan),
      edgeCases: readString(attempt.edgeCases, "body.attempt.edgeCases"),
      complexityAnswer: readString(
        attempt.complexityAnswer,
        "body.attempt.complexityAnswer"
      ),
      finalCode: readString(attempt.finalCode, "body.attempt.finalCode"),
      timeTakenSeconds: readNullableNumber(
        attempt.timeTakenSeconds,
        "body.attempt.timeTakenSeconds"
      ),
      hintsUsed: readNonNegativeNumber(
        attempt.hintsUsed,
        "body.attempt.hintsUsed"
      ),
      runCount: readNullableNumber(attempt.runCount, "body.attempt.runCount"),
    },
    publicTests: parseTestSummary(raw.publicTests, "body.publicTests"),
    hiddenTests:
      raw.hiddenTests === null || raw.hiddenTests === undefined
        ? null
        : parseTestSummary(raw.hiddenTests, "body.hiddenTests"),
  };
}

function parseAiCategory(
  value: unknown,
  path: string
): GradeAttemptCategory {
  const raw = readObject(value, path);

  if (typeof raw.score !== "number" || !Number.isFinite(raw.score)) {
    throw new GradeAttemptValidationError(`${path}.score must be a number.`, 502);
  }

  return {
    score: clampTenPointScore(raw.score),
    evidence: sanitizeModelText(
      readOptionalString(raw.evidence, "No evidence was returned."),
      "Feedback was adjusted to stay focused on observable interview behaviour."
    ),
    improvement: sanitizeModelText(
      readOptionalString(
        raw.improvement,
        "No improvement suggestion was returned."
      ),
      "Add a more concrete explanation of your reasoning and test coverage."
    ),
  };
}

export function parseAiGradeAttemptResponse(
  value: JsonObject
): GradeAttemptAiResponse {
  const categories = Object.fromEntries(
    AI_CATEGORY_KEYS.map((key) => [
      key,
      parseAiCategory(value[key], `ai_response.${key}`),
    ])
  ) as Record<AiGradeAttemptCategoryKey, GradeAttemptCategory>;

  return {
    ...categories,
    strengths: sanitizeModelStringList(
      Array.isArray(value.strengths)
        ? value.strengths.filter((item): item is string => typeof item === "string")
        : [],
      "Clear attempt structure and observable reasoning were present."
    ),
    weaknesses: sanitizeModelStringList(
      Array.isArray(value.weaknesses)
        ? value.weaknesses.filter((item): item is string => typeof item === "string")
        : [],
      "There is still room to make the explanation and validation more explicit."
    ),
    improvement_tasks: sanitizeModelStringList(
      Array.isArray(value.improvement_tasks)
        ? value.improvement_tasks.filter((item): item is string => typeof item === "string")
        : [],
      "Practise explaining the approach, complexity, and validation plan more explicitly."
    ),
    recommended_next_topic: sanitizeModelText(
      readOptionalString(
        value.recommended_next_topic,
        "Strengthen core data structures and algorithm fundamentals."
      ),
      "Strengthen core data structures and algorithm fundamentals."
    ),
    summary: sanitizeModelText(
      readOptionalString(
        value.summary,
        "The attempt has been graded, but the AI summary response was incomplete."
      ),
      "The attempt was graded using observable interview behaviour and available test evidence."
    ),
  };
}

export const GRADE_ATTEMPT_SAMPLE_PAYLOAD: GradeAttemptInput = {
  question: {
    title: "Balanced Brackets",
    topic: "Stacks",
    difficulty: "easy",
    problemStatement:
      "Given a string of brackets, return true if every opening bracket is closed in the correct order.",
    expectedComplexity: {
      time: "O(n)",
      space: "O(n)",
      notes: "A stack-based approach is expected.",
    },
    rubricNotes: [
      "Reward clear justification for using a stack.",
      "Penalise missing edge-case discussion for empty input.",
    ],
  },
  attempt: {
    mode: "practice",
    language: "javascript",
    clarificationNotes:
      "I would confirm whether non-bracket characters can appear and whether an empty string should return true.",
    approachExplanation:
      "I would scan once, push opening brackets onto a stack, and pop when I see a matching closer.",
    testingPlan:
      "I would test empty input, a simple balanced pair, nested brackets, and an early mismatch.",
    edgeCases: "Empty string, single opening bracket, nested mixed bracket types.",
    complexityAnswer: "Time O(n), space O(n) in the worst case because of the stack.",
    finalCode:
      "function balancedBrackets(s) {\n  const pairs = { ')': '(', ']': '[', '}': '{' };\n  const stack = [];\n  for (const char of s) {\n    if (char === '(' || char === '[' || char === '{') stack.push(char);\n    else if (pairs[char]) {\n      if (stack.pop() !== pairs[char]) return false;\n    }\n  }\n  return stack.length === 0;\n}",
    timeTakenSeconds: 780,
    hintsUsed: 1,
    runCount: 3,
  },
  publicTests: {
    passed: 3,
    failed: 1,
    total: 4,
    timedOut: false,
    results: [
      { label: "empty string", status: "passed", error: null, durationMs: 2 },
      { label: "simple pair", status: "passed", error: null, durationMs: 1 },
      { label: "nested case", status: "passed", error: null, durationMs: 1 },
      { label: "mismatch case", status: "failed", error: null, durationMs: 1 },
    ],
  },
  hiddenTests: {
    passed: 4,
    failed: 1,
    total: 5,
    timedOut: false,
    results: [
      { label: null, status: "passed", error: null, durationMs: 1 },
      { label: null, status: "passed", error: null, durationMs: 1 },
      { label: null, status: "passed", error: null, durationMs: 1 },
      { label: null, status: "passed", error: null, durationMs: 1 },
      { label: null, status: "failed", error: null, durationMs: 1 },
    ],
  },
};
