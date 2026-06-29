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

export type ScorecardFeedback = {
  phase: "Phase 4A deterministic scoring";
  scoring_method: "deterministic_v1";
  limitations: string[];
  public_tests: {
    passed: number;
    failed: number;
    total: number;
    executable: boolean;
  };
  category_explanations: Record<ScoreCategoryKey, string>;
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

export type SavedScorecard = DeterministicScoreOutput & {
  id: string;
  attempt_id: string;
  created_at: string;
};
