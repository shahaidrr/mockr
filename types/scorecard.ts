import type { ResultBand, SupportedLanguage, AttemptMode } from "@/types/attempt";
import type { PublicTestRunResult, PublicTestRunSummary } from "@/types/test-run";

export type ScoreCategoryKey =
  | "problem_understanding"
  | "communication"
  | "algorithmic_approach"
  | "code_correctness"
  | "code_quality"
  | "testing_debugging"
  | "complexity_analysis"
  | "hints_followups";

export type ScoreCategoryBreakdown = Record<ScoreCategoryKey, number>;

export type ScoreCategoryFeedback = {
  evidence: string;
  improvement: string;
};

export type ScorecardFeedback = {
  phase: string;
  scoring_method: string;
  limitations: string[];
  public_tests: {
    passed: number;
    failed: number;
    total: number;
    executable?: boolean;
    timedOut?: boolean;
  };
  hidden_tests?: {
    passed: number;
    failed: number;
    total: number;
    status?: string;
  } | null;
  category_explanations?: Partial<Record<ScoreCategoryKey, string>>;
  category_feedback?: Partial<Record<ScoreCategoryKey, ScoreCategoryFeedback>>;
  recommended_next_topic?: string;
  summary?: string;
  caps_applied?: string[];
  grading_metadata?: {
    mode?: AttemptMode;
    language?: SupportedLanguage;
    hints_used?: number;
    run_count?: number | null;
    time_taken_seconds?: number | null;
    hidden_tests_status?: string;
  };
};

export type DeterministicScoreInput = {
  language: SupportedLanguage;
  mode: AttemptMode;
  clarification: string;
  approach: string;
  testingPlan: string;
  edgeCases: string;
  complexityAnswer: string;
  finalCode: string;
  testSummary: PublicTestRunSummary | null;
  testResults: PublicTestRunResult[];
  hintsUsed: number;
  timeTakenSeconds: number | null;
  isExecutable: boolean;
};

export type DeterministicScoreOutput = {
  overall_score: number;
  result_band: ResultBand;
  problem_understanding: number;
  communication: number;
  algorithmic_approach: number;
  code_correctness: number;
  code_quality: number;
  testing_debugging: number;
  complexity_analysis: number;
  hints_followups: number;
  strengths: string[];
  weaknesses: string[];
  improvement_tasks: string[];
  feedback: ScorecardFeedback;
  rubric_version: "deterministic-v1";
  model_used: null;
};

export type PersistedScorecard = {
  overall_score: number;
  result_band: ResultBand;
  problem_understanding: number;
  communication: number;
  algorithmic_approach: number;
  code_correctness: number;
  code_quality: number;
  testing_debugging: number;
  complexity_analysis: number;
  hints_followups: number;
  strengths: string[];
  weaknesses: string[];
  improvement_tasks: string[];
  feedback: ScorecardFeedback;
  rubric_version: string;
  model_used: string | null;
};

export type SavedScorecard = PersistedScorecard & {
  id: string;
  attempt_id: string;
  created_at: string;
};
