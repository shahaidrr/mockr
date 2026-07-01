import { createClient } from "@/lib/supabase/client";
import type {
  AssessmentIntegrityEventPayload,
  AssessmentIntegritySummary,
  AssessmentIntegrityStatus,
} from "@/types/assessment-integrity";

// Re-export so callers can import the severity map from here
export { INTEGRITY_EVENT_SEVERITY, INTEGRITY_STATUS_LABELS } from "@/types/assessment-integrity";
export type {
  AssessmentIntegrityStatus,
  AssessmentIntegritySeverity,
  AssessmentIntegrityEventType,
  AssessmentIntegrityEventPayload,
  AssessmentIntegritySummary,
} from "@/types/assessment-integrity";

type LogEventResult = {
  eventId: string;
  integrityStatus: AssessmentIntegrityStatus;
  integrityEventCount: number;
};

/**
 * Logs one assessment integrity event via the Supabase RPC function.
 * Called by the frontend assessment hooks as events occur.
 * Returns the event id, updated status, and updated count on success.
 */
export async function logAssessmentIntegrityEvent(
  payload: AssessmentIntegrityEventPayload
): Promise<LogEventResult> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("log_assessment_integrity_event", {
    p_attempt_id:      payload.attemptId,
    p_event_type:      payload.eventType,
    p_severity:        payload.severity ?? "info",
    p_stage:           payload.stage ?? null,
    p_elapsed_seconds: payload.elapsedSeconds ?? null,
    p_metadata:        payload.metadata ?? {},
  });

  if (error) {
    throw new Error(error.message);
  }

  const result = data as {
    event_id: string;
    integrity_status: AssessmentIntegrityStatus;
    integrity_event_count: number;
  };

  return {
    eventId:             result.event_id,
    integrityStatus:     result.integrity_status,
    integrityEventCount: result.integrity_event_count,
  };
}

/**
 * Fetches the integrity summary for one attempt from the
 * assessment_integrity_summary view.
 * Returns null if the attempt has no events or is not owned by the current user.
 */
export async function getAssessmentIntegritySummary(
  attemptId: string
): Promise<AssessmentIntegritySummary | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("assessment_integrity_summary")
    .select(
      "attempt_id, user_id, total_event_count, low_count, medium_count, high_count, last_event_at, integrity_status"
    )
    .eq("attempt_id", attemptId)
    .maybeSingle();

  if (error || !data) return null;

  type SummaryRow = {
    attempt_id: string;
    integrity_status: AssessmentIntegrityStatus;
    total_event_count: number;
    low_count: number;
    medium_count: number;
    high_count: number;
    last_event_at: string | null;
  };

  const row = data as SummaryRow;

  return {
    attemptId:    row.attempt_id,
    status:       row.integrity_status,
    eventCount:   row.total_event_count,
    lowCount:     row.low_count,
    mediumCount:  row.medium_count,
    highCount:    row.high_count,
    lastEventAt:  row.last_event_at,
  };
}
