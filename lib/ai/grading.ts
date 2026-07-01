import { DeepSeekError, generateJsonWithDeepSeek } from "@/lib/ai/deepseek";
import {
  type GradeAttemptAiResponse,
  type GradeAttemptCategory,
  type GradeAttemptCategoryKey,
  type GradeAttemptInput,
  type GradeAttemptResult,
  type GradeAttemptTestSummary,
  parseAiGradeAttemptResponse,
} from "@/lib/ai/grading-schema";
import {
  buildGradingSystemPrompt,
  buildGradingUserPrompt,
} from "@/lib/ai/grading-prompts";
import type { ResultBand } from "@/types/attempt";

const WEIGHTS: Record<GradeAttemptCategoryKey, number> = {
  problem_understanding: 10,
  communication: 15,
  algorithmic_approach: 20,
  code_correctness: 25,
  code_quality: 10,
  testing_debugging: 10,
  complexity_analysis: 5,
  hints_followups: 5,
};

function clampScore(value: number): number {
  return Math.max(0, Math.min(10, Math.round(value)));
}

function getResultBand(score: number): ResultBand {
  if (score <= 39) return "Needs significant improvement";
  if (score <= 54) return "Below expected level";
  if (score <= 69) return "Borderline";
  if (score <= 84) return "Meets expected level";
  return "Strong performance";
}

function buildCategory(
  score: number,
  evidence: string,
  improvement: string
): GradeAttemptCategory {
  return {
    score: clampScore(score),
    evidence,
    improvement,
  };
}

function hasMeaningfulFinalCode(finalCode: string): boolean {
  const trimmed = finalCode.trim();

  if (trimmed.length < 20) {
    return false;
  }

  return /(function\s+\w+|def\s+\w+|class\s+\w+|return\b|=>|if\s*\(|for\s*\(|while\s*\()/.test(
    trimmed
  );
}

function countStatuses(
  summary: GradeAttemptTestSummary | null,
  statuses: Array<"error" | "timeout">
): number {
  if (!summary) {
    return 0;
  }

  const allowedStatuses = new Set<"error" | "timeout">(statuses);

  return summary.results.filter((result) =>
    allowedStatuses.has(result.status as "error" | "timeout")
  ).length;
}

function calculatePassRate(summary: GradeAttemptTestSummary | null): number | null {
  if (!summary || summary.total <= 0) {
    return null;
  }

  return summary.passed / summary.total;
}

function calculateCodeCorrectness(
  input: GradeAttemptInput
): GradeAttemptCategory {
  const publicTotal = input.publicTests.total;
  const publicPassed = input.publicTests.passed;
  const hiddenTotal = input.hiddenTests?.total ?? 0;
  const hiddenPassed = input.hiddenTests?.passed ?? 0;
  const total = publicTotal + hiddenTotal;
  const passed = publicPassed + hiddenPassed;

  if (total <= 0) {
    return buildCategory(
      hasMeaningfulFinalCode(input.attempt.finalCode) ? 2 : 0,
      "No executable test results were supplied, so correctness evidence is limited.",
      "Run both public and hidden tests before using this score in the live grading flow."
    );
  }

  const passRate = passed / total;
  const errorCount =
    countStatuses(input.publicTests, ["error"]) +
    countStatuses(input.hiddenTests, ["error"]);
  const timeoutCount =
    countStatuses(input.publicTests, ["timeout"]) +
    countStatuses(input.hiddenTests, ["timeout"]);
  const penalty = errorCount * 0.5 + timeoutCount;
  const score = clampScore(passRate * 10 - penalty);

  return buildCategory(
    score,
    `Passed ${passed} of ${total} combined tests (${publicPassed}/${publicTotal} public${input.hiddenTests ? `, ${hiddenPassed}/${hiddenTotal} hidden` : ""}).`,
    score >= 8
      ? "Keep validating with broader edge cases to make sure the solution stays robust."
      : "Fix failing or unstable test cases before relying on this solution."
  );
}

function applyCategoryCaps(
  input: GradeAttemptInput,
  ai: GradeAttemptAiResponse
): {
  categories: Record<GradeAttemptCategoryKey, GradeAttemptCategory>;
  capsApplied: string[];
} {
  const capsApplied: string[] = [];
  const codeCorrectness = calculateCodeCorrectness(input);

  const complexityAnalysis = input.attempt.complexityAnswer.trim()
    ? ai.complexity_analysis
    : buildCategory(
        0,
        "No complexity answer was provided.",
        "State both time and space complexity explicitly."
      );

  if (!input.attempt.complexityAnswer.trim()) {
    capsApplied.push("Complexity analysis score forced to 0 because the complexity answer was empty.");
  }

  const testingDebugging =
    input.attempt.edgeCases.trim().length > 0
      ? ai.testing_debugging
      : buildCategory(
          Math.min(ai.testing_debugging.score, 5),
          ai.testing_debugging.evidence,
          `${ai.testing_debugging.improvement} Add explicit edge cases next time.`
        );

  if (!input.attempt.edgeCases.trim() && testingDebugging.score > 5) {
    testingDebugging.score = 5;
  }

  if (!input.attempt.edgeCases.trim()) {
    capsApplied.push("Testing/debugging score capped at 5 because edge-case notes were empty.");
  }

  const hintsFollowups =
    input.attempt.hintsUsed >= 3
      ? buildCategory(
          Math.min(ai.hints_followups.score, 5),
          ai.hints_followups.evidence,
          `${ai.hints_followups.improvement} Work toward solving the question with fewer hints.`
        )
      : ai.hints_followups;

  if (input.attempt.hintsUsed >= 3) {
    capsApplied.push("Hints/follow-ups score capped at 5 because 3 or more hints were used.");
  }

  return {
    categories: {
      problem_understanding: ai.problem_understanding,
      communication: ai.communication,
      algorithmic_approach: ai.algorithmic_approach,
      code_correctness: codeCorrectness,
      code_quality: ai.code_quality,
      testing_debugging: testingDebugging,
      complexity_analysis: complexityAnalysis,
      hints_followups: hintsFollowups,
    },
    capsApplied,
  };
}

function calculateWeightedOverall(
  categories: Record<GradeAttemptCategoryKey, GradeAttemptCategory>
): number {
  return Math.round(
    Object.entries(categories).reduce((total, [key, value]) => {
      return total + (value.score * WEIGHTS[key as GradeAttemptCategoryKey]) / 10;
    }, 0)
  );
}

function applyOverallCaps(
  input: GradeAttemptInput,
  rawScore: number
): {
  overallScore: number;
  capsApplied: string[];
} {
  const capsApplied: string[] = [];
  let overallScore = rawScore;
  const meaningfulCode = hasMeaningfulFinalCode(input.attempt.finalCode);
  const publicTotal = input.publicTests.total;
  const hiddenTotal = input.hiddenTests?.total ?? 0;
  const coreTotal = publicTotal + hiddenTotal;
  const corePassed = input.publicTests.passed + (input.hiddenTests?.passed ?? 0);
  const hiddenPassRate = calculatePassRate(input.hiddenTests);

  if (!meaningfulCode && overallScore > 39) {
    overallScore = 39;
    capsApplied.push("Overall score capped at 39 because no meaningful final code was provided.");
  }

  if (coreTotal > 0 && corePassed === 0 && overallScore > 45) {
    overallScore = 45;
    capsApplied.push("Overall score capped at 45 because all core tests failed.");
  }

  if (hiddenPassRate !== null && hiddenPassRate < 0.5 && overallScore > 69) {
    overallScore = 69;
    capsApplied.push("Overall score capped at 69 because hidden test pass rate was below 50%.");
  }

  return {
    overallScore,
    capsApplied,
  };
}

function buildLimitations(input: GradeAttemptInput): string[] {
  const limitations = [
    "The route is isolated and does not save the result to the real attempt or scorecard tables yet.",
    "Code correctness is computed from supplied test results rather than trusting the model.",
    "The AI output is validated and clamped before use.",
    "Hidden test case contents are not sent to the model.",
  ];

  if (input.hiddenTests === null) {
    limitations.push("Hidden test results were not supplied for this request.");
  }

  return limitations;
}

export async function gradeAttemptWithAI(
  input: GradeAttemptInput
): Promise<GradeAttemptResult> {
  const aiResponse = await generateJsonWithDeepSeek({
    schemaName: "mockr_ai_grading_v1",
    systemPrompt: buildGradingSystemPrompt(),
    userPrompt: buildGradingUserPrompt(input),
    timeoutMs: 20000,
    maxTokens: 2200,
  });

  const ai = parseAiGradeAttemptResponse(aiResponse.data);
  const categoryResult = applyCategoryCaps(input, ai);
  const rawOverallScore = calculateWeightedOverall(categoryResult.categories);
  const overallCapResult = applyOverallCaps(input, rawOverallScore);

  return {
    overall_score: overallCapResult.overallScore,
    result_band: getResultBand(overallCapResult.overallScore),
    ...categoryResult.categories,
    strengths: ai.strengths.slice(0, 4),
    weaknesses: ai.weaknesses.slice(0, 4),
    improvement_tasks: ai.improvement_tasks.slice(0, 4),
    recommended_next_topic: ai.recommended_next_topic,
    summary: ai.summary,
    feedback: {
      phase: "Phase 4B.2 isolated AI grading",
      scoring_method: "ai_hybrid_v1",
      limitations: buildLimitations(input),
      caps_applied: [
        ...categoryResult.capsApplied,
        ...overallCapResult.capsApplied,
      ],
      public_tests: {
        passed: input.publicTests.passed,
        failed: input.publicTests.failed,
        total: input.publicTests.total,
      },
      hidden_tests: input.hiddenTests
        ? {
            passed: input.hiddenTests.passed,
            failed: input.hiddenTests.failed,
            total: input.hiddenTests.total,
          }
        : null,
    },
    rubric_version: "ai-hybrid-v1",
    model_used: aiResponse.model,
  };
}

export { DeepSeekError };
