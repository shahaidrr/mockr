export type AssessmentIntegrityStatus =
  | "clean"
  | "warning"
  | "flagged"
  | "compromised";

export type AssessmentIntegritySeverity =
  | "info"
  | "low"
  | "medium"
  | "high";

export type AssessmentIntegrityEventType =
  | "assessment_rules_accepted"
  | "assessment_started"
  | "fullscreen_requested"
  | "fullscreen_entered"
  | "fullscreen_exit"
  | "fullscreen_unavailable"
  | "tab_hidden"
  | "tab_visible"
  | "window_blur"
  | "window_focus"
  | "page_leave_attempt"
  | "reload_attempt"
  | "route_change_attempt"
  | "copy_attempt"
  | "paste_attempt"
  | "context_menu_attempt"
  | "drag_drop_attempt"
  | "assessment_paused"
  | "assessment_resumed"
  | "assessment_submitted"
  | "assessment_abandoned";

export type AssessmentIntegrityEventPayload = {
  attemptId: string;
  eventType: AssessmentIntegrityEventType;
  severity?: AssessmentIntegritySeverity;
  stage?: string | null;
  elapsedSeconds?: number | null;
  metadata?: Record<string, unknown>;
};

export type AssessmentIntegritySummary = {
  attemptId: string;
  status: AssessmentIntegrityStatus;
  eventCount: number;
  lowCount: number;
  mediumCount: number;
  highCount: number;
  lastEventAt: string | null;
};

// Suggested severity mapping for each event type.
// Frontend uses this to pick the right severity before calling logAssessmentIntegrityEvent.
export const INTEGRITY_EVENT_SEVERITY: Record<
  AssessmentIntegrityEventType,
  AssessmentIntegritySeverity
> = {
  assessment_rules_accepted: "info",
  assessment_started:        "info",
  fullscreen_requested:      "info",
  fullscreen_entered:        "info",
  fullscreen_unavailable:    "info",
  tab_visible:               "info",
  window_focus:              "info",
  assessment_resumed:        "info",
  assessment_submitted:      "info",

  copy_attempt:              "low",
  paste_attempt:             "low",
  context_menu_attempt:      "low",
  drag_drop_attempt:         "low",

  window_blur:               "medium",
  tab_hidden:                "medium",
  fullscreen_exit:           "medium",
  route_change_attempt:      "medium",
  assessment_paused:         "medium",

  page_leave_attempt:        "high",
  reload_attempt:            "high",
  assessment_abandoned:      "high",
};

// Human-readable labels for integrity status values.
// Used on the results page and in scoring output.
export const INTEGRITY_STATUS_LABELS: Record<AssessmentIntegrityStatus, string> = {
  clean:       "Clean",
  warning:     "Warning",
  flagged:     "Flagged",
  compromised: "Compromised",
} as const;

// Future scoring integration notes (not implemented yet):
//
// - results page: show an integrity badge using INTEGRITY_STATUS_LABELS
// - scorecard: add an integrity_note field with status and event summary
// - scoring deduction: small optional deduction may be applied for
//   'flagged' or 'compromised' status at the scoring layer's discretion
// - integrity status NEVER claims cheating was proven; it only records
//   observable environment events logged by the browser
