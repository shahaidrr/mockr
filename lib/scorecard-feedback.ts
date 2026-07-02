import type { AttemptPublicTestSummary } from "@/lib/attempts-service";
import type {
  SavedScorecard,
  ScoreCategoryFeedback,
  ScoreCategoryKey,
  ScorecardFeedback,
} from "@/types/scorecard";

const EMPTY_FEEDBACK: Partial<ScorecardFeedback> = {};

const DEFAULT_EVIDENCE = "Evidence was not stored for this older scorecard.";
const DEFAULT_IMPROVEMENT = "No specific improvement recommendation was stored.";
const DEFAULT_HIDDEN_TEST_STATUS =
  "Hidden tests were deferred in this phase and are not included in this score.";
const DEFAULT_LIMITATION =
  "This score reflects this practice attempt, not a real hiring decision.";

export const SCORECARD_CATEGORY_ORDER: ScoreCategoryKey[] = [
  "problem_understanding",
  "communication",
  "algorithmic_approach",
  "code_correctness",
  "code_quality",
  "testing_debugging",
  "complexity_analysis",
  "hints_followups",
];

export const SCORECARD_CATEGORY_LABELS: Record<ScoreCategoryKey, string> = {
  problem_understanding: "Problem understanding / clarification",
  communication: "Communication",
  algorithmic_approach: "Algorithmic approach",
  code_correctness: "Code correctness",
  code_quality: "Code quality",
  testing_debugging: "Testing / debugging",
  complexity_analysis: "Complexity analysis",
  hints_followups: "Hints / follow-ups",
};

function getFeedbackObject(
  scorecard: SavedScorecard | null
): Partial<ScorecardFeedback> {
  return scorecard?.feedback ?? EMPTY_FEEDBACK;
}

export function getCategoryFeedback(
  scorecard: SavedScorecard | null,
  key: ScoreCategoryKey
): ScoreCategoryFeedback {
  const feedback = getFeedbackObject(scorecard);
  const stored = feedback.category_feedback?.[key];
  const explanation = feedback.category_explanations?.[key];

  return {
    evidence: stored?.evidence ?? explanation ?? DEFAULT_EVIDENCE,
    improvement: stored?.improvement ?? DEFAULT_IMPROVEMENT,
  };
}

export function getCapsApplied(scorecard: SavedScorecard | null): string[] {
  const feedback = getFeedbackObject(scorecard);
  return Array.isArray(feedback.caps_applied) ? feedback.caps_applied : [];
}

export function getLimitations(scorecard: SavedScorecard | null): string[] {
  const feedback = getFeedbackObject(scorecard);
  const limitations = Array.isArray(feedback.limitations)
    ? feedback.limitations.filter(
        (item): item is string => typeof item === "string" && item.trim().length > 0
      )
    : [];

  return limitations.length > 0 ? limitations : [DEFAULT_LIMITATION];
}

export function getPublicTestSummary(
  scorecard: SavedScorecard | null,
  fallback: AttemptPublicTestSummary | null
) {
  const feedback = getFeedbackObject(scorecard);
  const publicTests = feedback.public_tests;

  if (publicTests) {
    return {
      passed: publicTests.passed,
      failed: publicTests.failed,
      total: publicTests.total,
      executable: publicTests.executable ?? fallback?.executable ?? false,
      timedOut: publicTests.timedOut ?? false,
    };
  }

  if (!fallback) {
    return null;
  }

  return {
    ...fallback,
    timedOut: false,
  };
}

export function getHiddenTestStatus(scorecard: SavedScorecard | null): string {
  const feedback = getFeedbackObject(scorecard);
  const hiddenTests = feedback.hidden_tests;

  if (hiddenTests?.status) {
    return hiddenTests.status;
  }

  if (feedback.grading_metadata?.hidden_tests_status === "deferred_not_available") {
    return DEFAULT_HIDDEN_TEST_STATUS;
  }

  if (hiddenTests) {
    return `Hidden tests summary was recorded (${hiddenTests.passed}/${hiddenTests.total} passed), but hidden test contents remain private.`;
  }

  return DEFAULT_HIDDEN_TEST_STATUS;
}

export function getPhaseMarker(scorecard: SavedScorecard | null): string | null {
  const feedback = getFeedbackObject(scorecard);
  return typeof feedback.phase === "string" && feedback.phase.trim().length > 0
    ? feedback.phase
    : null;
}

export function getScoringMethod(scorecard: SavedScorecard | null): string | null {
  const feedback = getFeedbackObject(scorecard);
  return typeof feedback.scoring_method === "string" &&
    feedback.scoring_method.trim().length > 0
    ? feedback.scoring_method
    : null;
}

export function getRecommendedNextTopic(
  scorecard: SavedScorecard | null
): string | null {
  const feedback = getFeedbackObject(scorecard);
  return typeof feedback.recommended_next_topic === "string" &&
    feedback.recommended_next_topic.trim().length > 0
    ? feedback.recommended_next_topic
    : null;
}

export function getSummary(scorecard: SavedScorecard | null): string | null {
  const feedback = getFeedbackObject(scorecard);
  return typeof feedback.summary === "string" && feedback.summary.trim().length > 0
    ? feedback.summary
    : null;
}

export function getGradingMetadata(scorecard: SavedScorecard | null) {
  const feedback = getFeedbackObject(scorecard);
  return feedback.grading_metadata ?? null;
}
