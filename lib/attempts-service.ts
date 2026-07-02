import { createClient } from "@/lib/supabase/client";
import {
  submitAttempt as submitAttemptRequest,
  type SubmissionIntegrityEvent,
} from "@/lib/attempt-submission";
import type { ResultBand } from "@/types/attempt";
import type { SavedScorecard } from "@/types/scorecard";
import type { PublicTestRunSummary } from "@/types/test-run";

export type SavedAttempt = {
  id: string;
  user_id: string;
  question_id: string;
  mode: string;
  language: string;
  status: string;
  clarification: string | null;
  approach: string | null;
  testing_plan: string | null;
  edge_cases: string | null;
  complexity_answer: string | null;
  final_code: string | null;
  started_at: string;
  submitted_at: string | null;
  time_taken_seconds: number | null;
  hints_used: number;
  overall_score: number | null;
  result_band: ResultBand | null;
};

export type AttemptPublicTestSummary = {
  passed: number;
  failed: number;
  total: number;
  executable: boolean;
};

export type SavedAttemptResult = {
  attempt: SavedAttempt;
  questionTitle: string;
  questionSlug: string;
  questionTopic: string;
  questionDifficulty: string;
  scorecard: SavedScorecard | null;
  publicTestSummary: AttemptPublicTestSummary | null;
};

type SubmitAttemptArgs = {
  userId: string;
  questionId: string;
  mode: string;
  language: string;
  clarification: string;
  approach: string;
  testingPlan: string;
  edgeCases: string;
  complexity: string;
  finalCode: string;
  startedAt: Date;
  timerSeconds: number;
  testSummary: PublicTestRunSummary | null;
  hintsUsed: number;
  runCount: number | null;
  integrityEvents?: SubmissionIntegrityEvent[];
};

/**
 * Writes the attempt, code snapshot, and public test run rows to Supabase.
 * Returns the saved attempt ID on success, or throws.
 */
export async function submitAttempt(args: SubmitAttemptArgs): Promise<string> {
  const response = await submitAttemptRequest({
    questionId: args.questionId,
    mode: args.mode as "practice" | "assessment",
    language: args.language as "javascript" | "python" | "cpp",
    clarification: args.clarification,
    approach: args.approach,
    testingPlan: args.testingPlan,
    edgeCases: args.edgeCases,
    complexity: args.complexity,
    finalCode: args.finalCode,
    startedAt: args.startedAt.toISOString(),
    timerSeconds: args.timerSeconds,
    publicTestSummary: args.testSummary,
    hintsUsed: args.hintsUsed,
    runCount: args.runCount,
    integrityEvents: args.integrityEvents ?? [],
  });

  return response.attemptId;
}

/**
 * Fetches a single attempt with the question title for the results page.
 * Returns null if not found or not owned by the current user (RLS handles this).
 */
export async function fetchAttemptById(attemptId: string): Promise<SavedAttemptResult | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("attempts")
    .select(`
      id, user_id, question_id, mode, language, status,
      clarification, approach, testing_plan, edge_cases,
      complexity_answer, final_code, started_at, submitted_at,
      time_taken_seconds, hints_used, overall_score, result_band,
      questions (title, slug, topic, difficulty),
      scorecards (
        id, attempt_id, overall_score, result_band,
        problem_understanding, communication, algorithmic_approach,
        code_correctness, code_quality, testing_debugging,
        complexity_analysis, hints_followups,
        strengths, weaknesses, improvement_tasks, feedback,
        rubric_version, model_used, created_at
      ),
      test_runs (passed)
    `)
    .eq("id", attemptId)
    .single();

  if (error || !data) return null;

  type QuestionRef = { title: string; slug: string; topic: string; difficulty: string };
  type ScorecardRow = SavedScorecard | SavedScorecard[] | null;
  type TestRunRow = { passed: boolean | null };
  type RowRaw = SavedAttempt & {
    questions: QuestionRef | QuestionRef[] | null;
    scorecards: ScorecardRow;
    test_runs: TestRunRow[] | null;
  };
  const row = data as RowRaw;
  const q = Array.isArray(row.questions) ? (row.questions[0] ?? null) : row.questions;
  const scorecard = Array.isArray(row.scorecards) ? (row.scorecards[0] ?? null) : row.scorecards;
  const testRuns = row.test_runs ?? [];
  const passed = testRuns.filter((run) => run.passed === true).length;
  const failed = testRuns.filter((run) => run.passed !== true).length;
  const total = testRuns.length;

  return {
    attempt: {
      id: row.id,
      user_id: row.user_id,
      question_id: row.question_id,
      mode: row.mode,
      language: row.language,
      status: row.status,
      clarification: row.clarification,
      approach: row.approach,
      testing_plan: row.testing_plan,
      edge_cases: row.edge_cases,
      complexity_answer: row.complexity_answer,
      final_code: row.final_code,
      started_at: row.started_at,
      submitted_at: row.submitted_at,
      time_taken_seconds: row.time_taken_seconds,
      hints_used: row.hints_used,
      overall_score: row.overall_score,
      result_band: row.result_band,
    },
    questionTitle: q?.title ?? "Unknown question",
    questionSlug: q?.slug ?? "",
    questionTopic: q?.topic ?? "",
    questionDifficulty: q?.difficulty ?? "",
    scorecard,
    publicTestSummary:
      total > 0 || row.language === "javascript" || row.language === "python"
        ? {
            passed,
            failed,
            total,
            executable: row.language === "javascript" || row.language === "python",
          }
        : null,
  };
}

/**
 * Fetches the most recent N attempts for the current user, with question title.
 * Returns [] if none or unauthenticated.
 */
export async function fetchRecentAttempts(limit = 10): Promise<Array<{
  id: string;
  question_id: string;
  questionTitle: string;
  questionSlug: string;
  topic: string;
  difficulty: string;
  language: string;
  mode: string;
  status: string;
  submitted_at: string | null;
  time_taken_seconds: number | null;
  overall_score: number | null;
  result_band: ResultBand | null;
}>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("attempts")
    .select(`
      id, question_id, language, mode, status, submitted_at, time_taken_seconds, overall_score, result_band,
      questions (title, slug, topic, difficulty)
    `)
    .eq("status", "submitted")
    .order("submitted_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  type QSummary = { title: string; slug: string; topic: string; difficulty: string };
  type RawRow = {
    id: string;
    question_id: string;
    language: string;
    mode: string;
    status: string;
    submitted_at: string | null;
    time_taken_seconds: number | null;
    overall_score: number | null;
    result_band: ResultBand | null;
    questions: QSummary | QSummary[] | null;
  };

  return (data as RawRow[]).map((row) => {
    const q = Array.isArray(row.questions) ? (row.questions[0] ?? null) : row.questions;
    return {
      id: row.id,
      question_id: row.question_id,
      questionTitle: q?.title ?? "Unknown",
      questionSlug: q?.slug ?? "",
      topic: q?.topic ?? "",
      difficulty: q?.difficulty ?? "",
      language: row.language,
      mode: row.mode,
      status: row.status,
      submitted_at: row.submitted_at,
      time_taken_seconds: row.time_taken_seconds,
      overall_score: row.overall_score,
      result_band: row.result_band,
    };
  });
}
