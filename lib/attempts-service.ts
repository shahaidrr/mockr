import { createClient } from "@/lib/supabase/client";
import { calculateDeterministicScorecard } from "@/lib/deterministic-score";
import type { ResultBand } from "@/types/attempt";
import type { SavedScorecard } from "@/types/scorecard";
import type { PublicTestRunResult, PublicTestRunSummary } from "@/types/test-run";

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
  testResults: PublicTestRunResult[];
  testCaseIds: string[];
};

/**
 * Writes the attempt, code snapshot, and public test run rows to Supabase.
 * Returns the saved attempt ID on success, or throws.
 */
export async function submitAttempt(args: SubmitAttemptArgs): Promise<string> {
  const supabase = createClient();

  // 1. Insert attempt row
  const { data: attempt, error: attemptError } = await supabase
    .from("attempts")
    .insert({
      user_id: args.userId,
      question_id: args.questionId,
      mode: args.mode,
      language: args.language,
      status: "submitted",
      clarification: args.clarification || null,
      approach: args.approach || null,
      testing_plan: args.testingPlan || null,
      edge_cases: args.edgeCases || null,
      complexity_answer: args.complexity || null,
      final_code: args.finalCode || null,
      started_at: args.startedAt.toISOString(),
      submitted_at: new Date().toISOString(),
      time_taken_seconds: args.timerSeconds > 0 ? args.timerSeconds : null,
      hints_used: 0,
    })
    .select("id")
    .single();

  if (attemptError || !attempt) {
    throw new Error(attemptError?.message ?? "Failed to save attempt.");
  }

  const attemptId = attempt.id as string;

  // 2. Insert code snapshot
  const { data: snapshot, error: snapshotError } = await supabase
    .from("code_snapshots")
    .insert({
      attempt_id: attemptId,
      language: args.language,
      source_code: args.finalCode || "",
      stage: "submit",
    })
    .select("id")
    .single();

  if (snapshotError || !snapshot) {
    // Non-fatal: attempt is saved, log and continue
    console.error("Failed to save code snapshot:", snapshotError?.message);
  }

  const snapshotId = snapshot?.id as string | undefined;

  // 3. Insert test run rows (only if we have results and matched case IDs)
  if (args.testResults.length > 0 && args.testCaseIds.length === args.testResults.length) {
    const testRunRows = args.testResults.map((r, i) => ({
      attempt_id: attemptId,
      code_snapshot_id: snapshotId ?? null,
      question_test_case_id: args.testCaseIds[i] ?? null,
      passed: r.status === "passed",
      actual_output: r.actual !== undefined ? r.actual : null,
      expected_output: r.expected !== undefined ? r.expected : null,
      execution_time_ms: r.durationMs ?? null,
      error_message: r.error ?? null,
    }));

    const { error: testRunError } = await supabase.from("test_runs").insert(testRunRows);

    if (testRunError) {
      console.error("Failed to save test runs:", testRunError.message);
    }
  }

  const scorecard = calculateDeterministicScorecard({
    language: args.language as "javascript" | "python" | "cpp",
    mode: args.mode as "practice" | "assessment",
    clarification: args.clarification,
    approach: args.approach,
    testingPlan: args.testingPlan,
    edgeCases: args.edgeCases,
    complexityAnswer: args.complexity,
    finalCode: args.finalCode,
    testSummary: args.testSummary,
    testResults: args.testResults,
    hintsUsed: 0,
    timeTakenSeconds: args.timerSeconds > 0 ? args.timerSeconds : null,
    isExecutable: args.language === "javascript" || args.language === "python",
  });

  const { error: scorecardError } = await supabase.from("scorecards").insert({
    attempt_id: attemptId,
    overall_score: scorecard.overall_score,
    result_band: scorecard.result_band,
    problem_understanding: scorecard.problem_understanding,
    communication: scorecard.communication,
    algorithmic_approach: scorecard.algorithmic_approach,
    code_correctness: scorecard.code_correctness,
    code_quality: scorecard.code_quality,
    testing_debugging: scorecard.testing_debugging,
    complexity_analysis: scorecard.complexity_analysis,
    hints_followups: scorecard.hints_followups,
    strengths: scorecard.strengths,
    weaknesses: scorecard.weaknesses,
    improvement_tasks: scorecard.improvement_tasks,
    feedback: scorecard.feedback,
    rubric_version: scorecard.rubric_version,
    model_used: scorecard.model_used,
  });

  if (scorecardError) {
    console.error("Failed to save scorecard:", scorecardError.message);
  }

  const { error: attemptUpdateError } = await supabase
    .from("attempts")
    .update({
      overall_score: scorecard.overall_score,
      result_band: scorecard.result_band,
    })
    .eq("id", attemptId);

  if (attemptUpdateError) {
    console.error("Failed to update attempt score summary:", attemptUpdateError.message);
  }

  return attemptId;
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
      questions (title, slug),
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

  type QuestionRef = { title: string; slug: string };
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
