import type { ResultBand } from "@/types/attempt";
import type {
  DeterministicScoreInput,
  DeterministicScoreOutput,
  ScoreCategoryBreakdown,
  ScoreCategoryKey,
} from "@/types/scorecard";

const WEIGHTS: Record<ScoreCategoryKey, number> = {
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

function normaliseText(value: string): string {
  return value.trim().toLowerCase();
}

function countWords(value: string): number {
  const trimmed = value.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function countMatches(value: string, patterns: RegExp[]): number {
  return patterns.reduce((total, pattern) => total + (pattern.test(value) ? 1 : 0), 0);
}

function getResultBand(score: number): ResultBand {
  if (score <= 39) return "Needs significant improvement";
  if (score <= 54) return "Below expected level";
  if (score <= 69) return "Borderline";
  if (score <= 84) return "Meets expected level";
  return "Strong performance";
}

function scoreProblemUnderstanding(text: string): [number, string] {
  const words = countWords(text);
  if (words === 0) {
    return [0, "No clarification notes were recorded, so problem-understanding evidence is limited."];
  }

  const keywordHits = countMatches(text, [
    /\binput\b/,
    /\boutput\b/,
    /\bconstraint/,
    /\bedge case/,
    /\bassumption/,
    /\bempty\b/,
    /\bnull\b/,
    /\breturn\b/,
    /\bquestion\b/,
  ]);

  const questionLike = /\?/.test(text);
  let score = 2;
  if (words >= 8) score += 2;
  if (words >= 18) score += 2;
  score += Math.min(3, keywordHits);
  if (questionLike) score += 1;

  return [
    clampScore(score),
    keywordHits > 0 || questionLike
      ? "Clarification notes mention assumptions, constraints, or edge cases, which supports problem understanding."
      : "Clarification notes exist, but they stay fairly high-level and could be more specific about constraints or assumptions.",
  ];
}

function scoreCommunication(text: string): [number, string] {
  const words = countWords(text);
  if (words === 0) {
    return [0, "No approach explanation was recorded, so communication was hard to assess."];
  }

  const keywordHits = countMatches(text, [
    /\bbecause\b/,
    /\btherefore\b/,
    /\bso that\b/,
    /\bhash\b/,
    /\bmap\b/,
    /\bstack\b/,
    /\bqueue\b/,
    /\btwo pointer/,
    /\bsliding window\b/,
    /\bbrute/,
    /\boptim/,
    /\biterate\b/,
  ]);

  let score = 2;
  if (words >= 10) score += 2;
  if (words >= 25) score += 2;
  score += Math.min(4, keywordHits);

  return [
    clampScore(score),
    keywordHits >= 2
      ? "The approach explanation includes concrete reasoning and implementation detail rather than only a short summary."
      : "The approach explanation exists, but it could do more to explain why the chosen strategy works.",
  ];
}

function scoreCodeCorrectness(input: DeterministicScoreInput): [number, string] {
  if (!input.isExecutable) {
    return [0, "C++ execution is not supported in this phase, so code correctness could not be verified automatically."];
  }

  if (!input.testSummary || input.testSummary.total === 0) {
    return [input.finalCode.trim() ? 2 : 0, "No public test results were available, so correctness evidence is limited."];
  }

  const total = input.testSummary.total;
  const passed = input.testSummary.passed;
  const ratio = total > 0 ? passed / total : 0;
  const errorCount = input.testResults.filter((result) => result.status === "error").length;
  const timeoutCount = input.testResults.filter((result) => result.status === "timeout").length;
  const penalty = errorCount + timeoutCount * 2;
  const score = clampScore(ratio * 10 - penalty);

  if (ratio === 1) {
    return [10, "All available public tests passed."];
  }

  if (timeoutCount > 0) {
    return [score, "Some public tests timed out, which significantly lowered the correctness score."];
  }

  if (errorCount > 0) {
    return [score, "Runtime or execution errors occurred on public tests, so correctness remains unproven."];
  }

  return [score, `Passed ${passed} of ${total} available public tests.`];
}

function scoreAlgorithmicApproach(
  approachScore: number,
  correctnessScore: number,
  hasApproach: boolean
): [number, string] {
  if (!hasApproach && correctnessScore === 0) {
    return [0, "There is little evidence of a clear algorithmic plan yet."];
  }

  const score = clampScore(approachScore * 0.6 + correctnessScore * 0.4);
  return [
    score,
    score >= 7
      ? "The recorded approach and observed test outcomes suggest a solid algorithmic direction."
      : "The algorithmic approach shows some signal, but the explanation or test outcomes leave room for improvement.",
  ];
}

function scoreCodeQuality(finalCode: string, correctnessScore: number): [number, string] {
  const trimmed = finalCode.trim();
  if (!trimmed) {
    return [0, "No final code was submitted."];
  }

  const lines = trimmed.split("\n").filter((line) => line.trim().length > 0).length;
  let score = 2;
  if (trimmed.length >= 40) score += 2;
  if (lines >= 4) score += 1;
  if (/(return|def |function |=>|if\s*\(|for\s*\(|while\s*\()/.test(trimmed)) score += 1;
  if (correctnessScore >= 7) score += 1;

  return [
    clampScore(score),
    "Code-quality scoring is heuristic-only in this phase, based mainly on whether the submitted code looks complete and structured.",
  ];
}

function scoreTestingDebugging(input: DeterministicScoreInput): [number, string] {
  const testingWords = countWords(input.testingPlan);
  const edgeCaseWords = countWords(input.edgeCases);
  const hasTestingNotes = testingWords > 0 || edgeCaseWords > 0;
  const hasTestRun = Boolean(input.testSummary && input.testSummary.total > 0);

  if (!hasTestingNotes && !hasTestRun) {
    return [0, "No testing notes or public test evidence were recorded."];
  }

  let score = 1;
  if (testingWords >= 8) score += 3;
  else if (testingWords > 0) score += 2;
  if (edgeCaseWords >= 5) score += 3;
  else if (edgeCaseWords > 0) score += 2;
  if (hasTestRun) score += 2;

  return [
    clampScore(score),
    hasTestingNotes && hasTestRun
      ? "Testing notes were recorded and public tests were run, which gives stronger debugging evidence."
      : "Testing evidence exists, but it could be stronger with both explicit edge cases and executed tests.",
  ];
}

function scoreComplexityAnalysis(text: string): [number, string] {
  const trimmed = text.trim();
  if (!trimmed) {
    return [0, "No time or space complexity analysis was recorded."];
  }

  let score = 3;
  if (/\bO\s*\(/i.test(trimmed)) score += 3;
  if (/\btime\b/i.test(trimmed)) score += 2;
  if (/\bspace\b/i.test(trimmed)) score += 2;

  return [
    clampScore(score),
    /\bO\s*\(/i.test(trimmed)
      ? "Complexity analysis explicitly mentions Big-O notation."
      : "Complexity analysis exists, but it could be clearer by stating time and space complexity explicitly.",
  ];
}

function scoreHintsFollowups(hintsUsed: number): [number, string] {
  if (hintsUsed <= 0) {
    return [10, "No hints were recorded for this attempt."];
  }

  const score = clampScore(10 - hintsUsed * 2);
  return [score, `Hints were used ${hintsUsed} time${hintsUsed === 1 ? "" : "s"}, which reduced this category modestly.`];
}

function buildLists(
  input: DeterministicScoreInput,
  scores: ScoreCategoryBreakdown,
  overallScore: number
): Pick<DeterministicScoreOutput, "strengths" | "weaknesses" | "improvement_tasks"> {
  const strengths = new Set<string>();
  const weaknesses = new Set<string>();
  const improvementTasks = new Set<string>();

  if (input.isExecutable && input.testSummary?.total && input.testSummary.passed === input.testSummary.total) {
    strengths.add("Passed all available public tests.");
  } else if (input.isExecutable && input.testSummary?.failed) {
    weaknesses.add("Public tests are still failing.");
    improvementTasks.add("Retry the question and aim to pass all public tests.");
  }

  if (!input.isExecutable) {
    weaknesses.add("Code correctness could not be verified for C++ in this phase.");
  }

  if (scores.problem_understanding >= 6) {
    strengths.add("Recorded useful clarification notes before coding.");
  } else {
    weaknesses.add("Did not record strong clarifying assumptions or questions.");
    improvementTasks.add("Before coding, write at least two clarification questions or assumptions.");
  }

  if (scores.communication >= 6) {
    strengths.add("Provided a meaningful approach explanation.");
  } else {
    weaknesses.add("Approach explanation is missing or too brief.");
    improvementTasks.add("Explain the brute-force idea first, then the optimised approach.");
  }

  if (scores.testing_debugging >= 6) {
    strengths.add("Included testing or edge-case notes.");
  } else {
    weaknesses.add("Testing plan is missing or shallow.");
    improvementTasks.add("Add at least three edge cases before your next submission.");
  }

  if (scores.complexity_analysis >= 6) {
    strengths.add("Included explicit complexity analysis.");
  } else {
    weaknesses.add("Complexity analysis is missing or incomplete.");
    improvementTasks.add("State time and space complexity explicitly using Big-O notation.");
  }

  if (scores.hints_followups >= 8) {
    strengths.add("Completed the attempt without relying on hints.");
  }

  if (overallScore < 55) {
    improvementTasks.add("Focus on getting a correct baseline solution working before optimising.");
  }

  return {
    strengths: Array.from(strengths).slice(0, 4),
    weaknesses: Array.from(weaknesses).slice(0, 4),
    improvement_tasks: Array.from(improvementTasks).slice(0, 4),
  };
}

export function calculateDeterministicScorecard(
  input: DeterministicScoreInput
): DeterministicScoreOutput {
  const clarificationText = normaliseText(input.clarification);
  const approachText = normaliseText(input.approach);
  const complexityText = normaliseText(input.complexityAnswer);

  const [problemUnderstanding, problemExplanation] = scoreProblemUnderstanding(clarificationText);
  const [communication, communicationExplanation] = scoreCommunication(approachText);
  const [codeCorrectness, correctnessExplanation] = scoreCodeCorrectness(input);
  const [algorithmicApproach, approachExplanation] = scoreAlgorithmicApproach(
    communication,
    codeCorrectness,
    Boolean(approachText)
  );
  const [codeQuality, codeQualityExplanation] = scoreCodeQuality(input.finalCode, codeCorrectness);
  const [testingDebugging, testingExplanation] = scoreTestingDebugging(input);
  const [complexityAnalysis, complexityExplanation] = scoreComplexityAnalysis(complexityText);
  const [hintsFollowups, hintsExplanation] = scoreHintsFollowups(input.hintsUsed);

  const categoryScores: ScoreCategoryBreakdown = {
    problem_understanding: problemUnderstanding,
    communication,
    algorithmic_approach: algorithmicApproach,
    code_correctness: codeCorrectness,
    code_quality: codeQuality,
    testing_debugging: testingDebugging,
    complexity_analysis: complexityAnalysis,
    hints_followups: hintsFollowups,
  };

  const overallScore = Math.round(
    Object.entries(categoryScores).reduce((total, [key, score]) => {
      return total + (score * WEIGHTS[key as ScoreCategoryKey]) / 10;
    }, 0)
  );
  const resultBand = getResultBand(overallScore);
  const lists = buildLists(input, categoryScores, overallScore);

  const limitations = [
    "Public tests only.",
    "Hidden tests are not executed yet.",
    "No AI feedback is included yet.",
    "Code quality is estimated using simple heuristics only.",
  ];

  if (!input.isExecutable) {
    limitations.push("C++ execution is not supported yet, so correctness could not be verified automatically.");
  }

  return {
    overall_score: overallScore,
    result_band: resultBand,
    ...categoryScores,
    ...lists,
    feedback: {
      phase: "Phase 4A deterministic scoring",
      scoring_method: "deterministic_v1",
      limitations,
      public_tests: {
        passed: input.testSummary?.passed ?? 0,
        failed: input.testSummary?.failed ?? 0,
        total: input.testSummary?.total ?? 0,
        executable: input.isExecutable,
      },
      category_explanations: {
        problem_understanding: problemExplanation,
        communication: communicationExplanation,
        algorithmic_approach: approachExplanation,
        code_correctness: correctnessExplanation,
        code_quality: codeQualityExplanation,
        testing_debugging: testingExplanation,
        complexity_analysis: complexityExplanation,
        hints_followups: hintsExplanation,
      },
    },
    rubric_version: "deterministic-v1",
    model_used: null,
  };
}
