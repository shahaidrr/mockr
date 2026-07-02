import { NextResponse } from "next/server";
import { DeepSeekError, gradeAttemptWithAI } from "@/lib/ai/grading";
import type { GradeAttemptInput, GradeAttemptResult } from "@/lib/ai/grading-schema";
import {
  parseSubmitPracticeAttemptRequest,
  SubmitPracticeAttemptError,
} from "@/lib/attempt-submission";
import { fetchPublicTestCases, fetchQuestionById } from "@/lib/questions-service";
import { createClient } from "@/lib/supabase/server";
import type { Question } from "@/types/question";
import type {
  ScoreCategoryFeedback,
  ScoreCategoryKey,
  ScorecardFeedback,
} from "@/types/scorecard";

export const dynamic = "force-dynamic";

function buildRubricNotes(question: Question): string[] {
  if (!question.rubric_notes || typeof question.rubric_notes !== "object") {
    return [];
  }

  return Object.entries(question.rubric_notes).flatMap(([key, value]) => {
    if (typeof value === "string" && value.trim().length > 0) {
      return [`${key}: ${value}`];
    }

    if (Array.isArray(value)) {
      return value
        .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
        .map((item) => `${key}: ${item}`);
    }

    return [];
  });
}

function buildGradeAttemptInput(
  question: Question,
  submission: ReturnType<typeof parseSubmitPracticeAttemptRequest>
): GradeAttemptInput {
  return {
    question: {
      title: question.title,
      topic: question.topic,
      difficulty: question.difficulty,
      problemStatement: question.problem_statement,
      expectedComplexity: {
        time: question.expected_time_complexity,
        space: question.expected_space_complexity,
        notes: question.expected_complexity_notes,
      },
      rubricNotes: buildRubricNotes(question),
    },
    attempt: {
      mode: submission.mode,
      language: submission.language,
      clarificationNotes: submission.clarification,
      approachExplanation: submission.approach,
      testingPlan: submission.testingPlan,
      edgeCases: submission.edgeCases,
      complexityAnswer: submission.complexity,
      finalCode: submission.finalCode,
      timeTakenSeconds: submission.timerSeconds > 0 ? submission.timerSeconds : null,
      hintsUsed: submission.hintsUsed,
      runCount: submission.runCount,
    },
    publicTests: submission.publicTestSummary
      ? {
          passed: submission.publicTestSummary.passed,
          failed: submission.publicTestSummary.failed,
          total: submission.publicTestSummary.total,
          timedOut: submission.publicTestSummary.timedOut,
          results: submission.publicTestSummary.results.map((result) => ({
            label: result.label ?? null,
            status: result.status,
            error: result.error ?? null,
            durationMs: result.durationMs ?? null,
          })),
        }
      : {
          passed: 0,
          failed: 0,
          total: 0,
          timedOut: false,
          results: [],
        },
    hiddenTests: null,
  };
}

function buildCategoryFeedback(
  grading: GradeAttemptResult
): Record<ScoreCategoryKey, ScoreCategoryFeedback> {
  return {
    problem_understanding: {
      evidence: grading.problem_understanding.evidence,
      improvement: grading.problem_understanding.improvement,
    },
    communication: {
      evidence: grading.communication.evidence,
      improvement: grading.communication.improvement,
    },
    algorithmic_approach: {
      evidence: grading.algorithmic_approach.evidence,
      improvement: grading.algorithmic_approach.improvement,
    },
    code_correctness: {
      evidence: grading.code_correctness.evidence,
      improvement: grading.code_correctness.improvement,
    },
    code_quality: {
      evidence: grading.code_quality.evidence,
      improvement: grading.code_quality.improvement,
    },
    testing_debugging: {
      evidence: grading.testing_debugging.evidence,
      improvement: grading.testing_debugging.improvement,
    },
    complexity_analysis: {
      evidence: grading.complexity_analysis.evidence,
      improvement: grading.complexity_analysis.improvement,
    },
    hints_followups: {
      evidence: grading.hints_followups.evidence,
      improvement: grading.hints_followups.improvement,
    },
  };
}

function buildScorecardFeedback(
  grading: GradeAttemptResult,
  submission: ReturnType<typeof parseSubmitPracticeAttemptRequest>
): ScorecardFeedback {
  const categoryFeedback = buildCategoryFeedback(grading);
  const categoryExplanations = Object.fromEntries(
    Object.entries(categoryFeedback).map(([key, value]) => [key, value.evidence])
  ) as Record<ScoreCategoryKey, string>;

  return {
    phase: "Phase 4B.3 live AI grading",
    scoring_method: grading.feedback.scoring_method,
    limitations: [
      ...grading.feedback.limitations,
      "Hidden tests were deferred in Phase 4B.3 and were not executed for this score.",
      "Public test execution still runs in the browser in this phase, so the server validates the submitted summary shape but does not rerun candidate code.",
    ],
    public_tests: {
      passed: grading.feedback.public_tests.passed,
      failed: grading.feedback.public_tests.failed,
      total: grading.feedback.public_tests.total,
      executable:
        submission.language === "javascript" || submission.language === "python",
      timedOut: submission.publicTestSummary?.timedOut ?? false,
    },
    hidden_tests: null,
    category_explanations: categoryExplanations,
    category_feedback: categoryFeedback,
    recommended_next_topic: grading.recommended_next_topic,
    summary: grading.summary,
    caps_applied: grading.feedback.caps_applied,
    grading_metadata: {
      mode: submission.mode,
      language: submission.language,
      hints_used: submission.hintsUsed,
      run_count: submission.runCount,
      time_taken_seconds:
        submission.timerSeconds > 0 ? submission.timerSeconds : null,
      hidden_tests_status: "deferred_not_available",
    },
  };
}

export async function POST(request: Request) {
  let attemptId: string | null = null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          ok: false,
          error: "unauthorized",
          message: "You must be signed in to submit an attempt.",
        },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      throw new SubmitPracticeAttemptError(
        "Request body must be valid JSON.",
        400
      );
    }

    const submission = parseSubmitPracticeAttemptRequest(body);
    const startedAt = new Date(submission.startedAt);

    if (Number.isNaN(startedAt.getTime())) {
      throw new SubmitPracticeAttemptError(
        "body.startedAt must be a valid ISO date string.",
        400
      );
    }

    const [question, publicTestCases] = await Promise.all([
      fetchQuestionById(submission.questionId),
      fetchPublicTestCases(submission.questionId),
    ]);

    if (!question) {
      return NextResponse.json(
        {
          ok: false,
          error: "question_not_found",
          message: "The selected question could not be found.",
        },
        {
          status: 404,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    const requiresPublicTestSummary =
      (submission.language === "javascript" || submission.language === "python") &&
      publicTestCases.length > 0;

    if (requiresPublicTestSummary && !submission.publicTestSummary) {
      throw new SubmitPracticeAttemptError(
        "A final public test summary is required before submitting this executable attempt.",
        400
      );
    }

    if (
      submission.publicTestSummary &&
      submission.publicTestSummary.results.length !== publicTestCases.length
    ) {
      throw new SubmitPracticeAttemptError(
        "Submitted public test results did not include the full set of known public test cases.",
        400
      );
    }

    const validPublicTestIds = new Set(publicTestCases.map((testCase) => testCase.id));
    const submittedPublicTestIds = new Set(
      submission.publicTestSummary?.results.map((result) => result.testCaseId) ?? []
    );

    if (
      submission.publicTestSummary &&
      submission.publicTestSummary.results.some(
        (result) => !validPublicTestIds.has(result.testCaseId)
      )
    ) {
      throw new SubmitPracticeAttemptError(
        "Submitted public test results did not match the question's known public test cases.",
        400
      );
    }

    if (
      submission.publicTestSummary &&
      (submittedPublicTestIds.size !== publicTestCases.length ||
        publicTestCases.some((testCase) => !submittedPublicTestIds.has(testCase.id)))
    ) {
      throw new SubmitPracticeAttemptError(
        "Submitted public test results must contain one result for each known public test case.",
        400
      );
    }

    const { data: attempt, error: attemptError } = await supabase
      .from("attempts")
      .insert({
        user_id: user.id,
        question_id: submission.questionId,
        mode: submission.mode,
        language: submission.language,
        status: "submitted",
        clarification: submission.clarification || null,
        approach: submission.approach || null,
        testing_plan: submission.testingPlan || null,
        edge_cases: submission.edgeCases || null,
        complexity_answer: submission.complexity || null,
        final_code: submission.finalCode || null,
        started_at: startedAt.toISOString(),
        submitted_at: new Date().toISOString(),
        time_taken_seconds:
          submission.timerSeconds > 0 ? submission.timerSeconds : null,
        hints_used: submission.hintsUsed,
      })
      .select("id")
      .single();

    if (attemptError || !attempt) {
      throw new SubmitPracticeAttemptError(
        attemptError?.message ?? "Failed to save attempt.",
        500
      );
    }

    attemptId = attempt.id as string;

    const { data: snapshot, error: snapshotError } = await supabase
      .from("code_snapshots")
      .insert({
        attempt_id: attemptId,
        language: submission.language,
        source_code: submission.finalCode,
        stage: "submit",
      })
      .select("id")
      .single();

    if (snapshotError || !snapshot) {
      console.error("Attempt submission snapshot save failed", {
        attemptId,
      });
    }

    const snapshotId = snapshot?.id as string | undefined;

    if (submission.publicTestSummary && submission.publicTestSummary.results.length > 0) {
      const testRunRows = submission.publicTestSummary.results.map((result) => ({
        attempt_id: attemptId,
        code_snapshot_id: snapshotId ?? null,
        question_test_case_id: result.testCaseId,
        passed: result.status === "passed",
        actual_output: result.actual !== undefined ? result.actual : null,
        expected_output: result.expected !== undefined ? result.expected : null,
        execution_time_ms: result.durationMs ?? null,
        error_message: result.error ?? null,
      }));

      const { error: testRunError } = await supabase
        .from("test_runs")
        .insert(testRunRows);

      if (testRunError) {
        console.error("Attempt submission test-run save failed", {
          attemptId,
        });
      }
    }

    if (submission.integrityEvents.length > 0) {
      const eventRows = submission.integrityEvents.map((event) => ({
        attempt_id: attemptId,
        event_type: "integrity_event",
        stage: null as string | null,
        payload: {
          type: event.eventType,
          occurredAt: event.occurredAt,
          elapsedSeconds: event.elapsedSeconds,
          severity: event.severity,
          metadata: event.metadata ?? {},
        },
      }));

      const { error: eventsError } = await supabase
        .from("attempt_events")
        .insert(eventRows);

      if (eventsError) {
        console.error("Attempt submission integrity event save failed", {
          attemptId,
        });
      }

      const severityCounts = submission.integrityEvents.reduce(
        (acc, event) => {
          if (event.severity === "low") acc.low += 1;
          else if (event.severity === "medium") acc.medium += 1;
          else if (event.severity === "high") acc.high += 1;
          return acc;
        },
        { low: 0, medium: 0, high: 0 }
      );

      const finalStatus =
        severityCounts.high >= 3
          ? "compromised"
          : severityCounts.high >= 1 || severityCounts.medium >= 2
            ? "flagged"
            : severityCounts.medium >= 1 || severityCounts.low >= 3
              ? "warning"
              : "clean";

      await supabase.from("attempt_events").insert({
        attempt_id: attemptId,
        event_type: "integrity_summary",
        stage: "submit",
        payload: {
          finalStatus,
          totalEvents: submission.integrityEvents.length,
          lowCount: severityCounts.low,
          mediumCount: severityCounts.medium,
          highCount: severityCounts.high,
        },
      });
    }

    const gradingInput = buildGradeAttemptInput(question, submission);
    const grading = await gradeAttemptWithAI(gradingInput);
    const feedback = buildScorecardFeedback(grading, submission);

    const { data: scorecard, error: scorecardError } = await supabase
      .from("scorecards")
      .insert({
        attempt_id: attemptId,
        overall_score: grading.overall_score,
        result_band: grading.result_band,
        problem_understanding: grading.problem_understanding.score,
        communication: grading.communication.score,
        algorithmic_approach: grading.algorithmic_approach.score,
        code_correctness: grading.code_correctness.score,
        code_quality: grading.code_quality.score,
        testing_debugging: grading.testing_debugging.score,
        complexity_analysis: grading.complexity_analysis.score,
        hints_followups: grading.hints_followups.score,
        strengths: grading.strengths,
        weaknesses: grading.weaknesses,
        improvement_tasks: grading.improvement_tasks,
        feedback,
        rubric_version: grading.rubric_version,
        model_used: grading.model_used,
      })
      .select("id")
      .single();

    if (scorecardError || !scorecard) {
      return NextResponse.json(
        {
          ok: false,
          error: "scorecard_save_failed",
          message:
            "Your attempt was saved, but feedback could not be persisted.",
          attemptId,
          attemptSaved: true,
        },
        {
          status: 500,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    const { error: attemptUpdateError } = await supabase
      .from("attempts")
      .update({
        overall_score: grading.overall_score,
        result_band: grading.result_band,
      })
      .eq("id", attemptId);

    if (attemptUpdateError) {
      console.error("Attempt submission score summary update failed", {
        attemptId,
      });
    }

    return NextResponse.json(
      {
        ok: true,
        attemptId,
        scorecardId: scorecard.id as string,
        attemptSaved: true,
        gradingComplete: true,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    if (error instanceof SubmitPracticeAttemptError) {
      return NextResponse.json(
        {
          ok: false,
          error: error.status >= 500 ? "submission_failed" : "invalid_body",
          message: error.message,
          attemptId,
          attemptSaved: Boolean(attemptId),
        },
        {
          status: error.status,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    if (error instanceof DeepSeekError) {
      console.error("Attempt grading failed", {
        code: error.code,
        status: error.status,
        attemptSaved: Boolean(attemptId),
      });

      return NextResponse.json(
        {
          ok: false,
          error: error.code,
          message:
            attemptId
              ? "Your attempt was saved, but feedback generation failed."
              : error.message,
          attemptId,
          attemptSaved: Boolean(attemptId),
        },
        {
          status: error.status,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    console.error("Attempt submission failed", {
      error: error instanceof Error ? error.name : "unknown_error",
      attemptSaved: Boolean(attemptId),
    });

    return NextResponse.json(
      {
        ok: false,
        error: "submission_failed",
        message:
          attemptId
            ? "Your attempt was saved, but grading could not be completed."
            : "Unable to submit this attempt right now.",
        attemptId,
        attemptSaved: Boolean(attemptId),
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
