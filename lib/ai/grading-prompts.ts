import type { GradeAttemptInput } from "@/lib/ai/grading-schema";

function buildExpectedComplexitySummary(input: GradeAttemptInput): string {
  const parts = [
    input.question.expectedComplexity.time
      ? `Time: ${input.question.expectedComplexity.time}`
      : null,
    input.question.expectedComplexity.space
      ? `Space: ${input.question.expectedComplexity.space}`
      : null,
    input.question.expectedComplexity.notes
      ? `Notes: ${input.question.expectedComplexity.notes}`
      : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" | ") : "Not provided.";
}

export function buildGradingSystemPrompt(): string {
  return [
    "You are evaluating a mock coding interview practice attempt for MOCKR.AI.",
    "Assess observable behaviour only.",
    "Do not predict hiring probability or whether the user would get a real job.",
    "Do not claim hidden tests passed unless the provided system data says they passed.",
    "Do not invent test results.",
    "Do not reveal hidden test cases.",
    "Return valid JSON only.",
    'For each category, return an object with numeric "score" from 0 to 10, string "evidence", and string "improvement".',
    "The response must include: problem_understanding, communication, algorithmic_approach, code_quality, testing_debugging, complexity_analysis, hints_followups, strengths, weaknesses, improvement_tasks, recommended_next_topic, summary.",
    "Keep evidence tied to the provided attempt content rather than generic advice.",
  ].join("\n");
}

export function buildGradingUserPrompt(input: GradeAttemptInput): string {
  const publicFailures = input.publicTests.results
    .filter((result) => result.status !== "passed")
    .map((result) => result.label ?? result.status);

  return JSON.stringify(
    {
      evaluation_context: {
        product: "MOCKR.AI",
        mode: input.attempt.mode,
        language: input.attempt.language,
      },
      question: {
        title: input.question.title,
        topic: input.question.topic,
        difficulty: input.question.difficulty,
        problem_statement: input.question.problemStatement,
        expected_complexity: buildExpectedComplexitySummary(input),
        rubric_notes: input.question.rubricNotes,
      },
      attempt: {
        clarification_notes: input.attempt.clarificationNotes,
        approach_explanation: input.attempt.approachExplanation,
        testing_plan: input.attempt.testingPlan,
        edge_cases: input.attempt.edgeCases,
        complexity_answer: input.attempt.complexityAnswer,
        final_code: input.attempt.finalCode,
        time_taken_seconds: input.attempt.timeTakenSeconds,
        hints_used: input.attempt.hintsUsed,
        run_count: input.attempt.runCount,
      },
      tests: {
        public_summary: {
          passed: input.publicTests.passed,
          failed: input.publicTests.failed,
          total: input.publicTests.total,
          timed_out: input.publicTests.timedOut,
          failing_labels: publicFailures,
        },
        hidden_summary: input.hiddenTests
          ? {
              passed: input.hiddenTests.passed,
              failed: input.hiddenTests.failed,
              total: input.hiddenTests.total,
              timed_out: input.hiddenTests.timedOut,
            }
          : null,
      },
      instructions: [
        "Use only the supplied data.",
        "Do not score code correctness here; backend logic handles correctness separately.",
        "If evidence is weak, lower the score and explain what is missing.",
        "Do not mention secret data, auth, hiring predictions, or hidden test case contents.",
      ],
    },
    null,
    2
  );
}
