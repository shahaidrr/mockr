"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import type { AssessmentIntegrityStatus } from "@/types/assessment-integrity";

// ─── Public types ─────────────────────────────────────────────────────────────

export type LocalIntegrityEvent = {
  eventType: string;
  occurredAt: string;
  elapsedSeconds: number;
  severity: "info" | "low" | "medium" | "high";
  metadata?: Record<string, unknown>;
};

// ─── Internal helpers ─────────────────────────────────────────────────────────

type Counts = { low: number; medium: number; high: number };

function computeStatus(c: Counts): AssessmentIntegrityStatus {
  if (c.high >= 3) return "compromised";
  if (c.high >= 1 || c.medium >= 2) return "flagged";
  if (c.medium >= 1 || c.low >= 3) return "warning";
  return "clean";
}

const STATUS_STYLE: Record<AssessmentIntegrityStatus, { bg: string; color: string }> = {
  clean:       { bg: "#10b98122", color: "#10b981" },
  warning:     { bg: "#f59e0b22", color: "#f59e0b" },
  flagged:     { bg: "#ef444422", color: "#ef4444" },
  compromised: { bg: "#7c3aed22", color: "#a78bfa" },
};

const EVENT_SEVERITY: Record<string, "info" | "low" | "medium" | "high"> = {
  assessment_started:     "info",
  fullscreen_entered:     "info",
  fullscreen_unavailable: "info",
  tab_visible:            "info",
  window_focus:           "info",
  copy_attempt:           "low",
  paste_attempt:          "low",
  context_menu_attempt:   "low",
  drag_drop_attempt:      "low",
  window_blur:            "medium",
  tab_hidden:             "medium",
  fullscreen_exit:        "medium",
  route_change_attempt:   "medium",
  page_leave_attempt:     "high",
  reload_attempt:         "high",
};

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  /** True when mode === 'assessment' and attempt is not yet submitted. */
  active: boolean;
  /** Current elapsed timer seconds — included in each logged event. */
  timerSeconds: number;
  /** Called for every integrity event (info events included for completeness). */
  onEvent: (e: LocalIntegrityEvent) => void;
  /** Called once when rules are accepted and the assessment begins. */
  onStart: () => void;
  children: React.ReactNode;
};

export default function AssessmentIntegrityGuard({
  active,
  timerSeconds,
  onEvent,
  onStart,
  children,
}: Props) {
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenUnavailable, setFullscreenUnavailable] = useState(false);
  const [counts, setCounts] = useState<Counts>({ low: 0, medium: 0, high: 0 });
  const [nonInfoTotal, setNonInfoTotal] = useState(0);

  // Refs for stable closures in effects (synced via useEffect, not during render)
  const timerRef = useRef(timerSeconds);
  const onEventRef = useRef(onEvent);
  const onStartRef = useRef(onStart);

  useEffect(() => { timerRef.current = timerSeconds; }, [timerSeconds]);
  useEffect(() => { onEventRef.current = onEvent; }, [onEvent]);
  useEffect(() => { onStartRef.current = onStart; }, [onStart]);

  const emit = useCallback(
    (eventType: string, metadata?: Record<string, unknown>) => {
      const severity = EVENT_SEVERITY[eventType] ?? "info";
      const event: LocalIntegrityEvent = {
        eventType,
        occurredAt: new Date().toISOString(),
        elapsedSeconds: timerRef.current,
        severity,
        metadata,
      };
      onEventRef.current(event);
      if (severity !== "info") {
        const sev = severity as "low" | "medium" | "high";
        setCounts((prev) => ({ ...prev, [sev]: prev[sev] + 1 }));
        setNonInfoTotal((prev) => prev + 1);
      }
    },
    [] // stable — uses refs only
  );

  // Fullscreen change — re-registers when rulesAccepted flips so closure is always fresh
  useEffect(() => {
    if (!active) return;
    function handler() {
      const inFs = !!document.fullscreenElement;
      setIsFullscreen(inFs);
      if (inFs) {
        emit("fullscreen_entered");
      } else if (rulesAccepted) {
        emit("fullscreen_exit");
      }
    }
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, [active, rulesAccepted, emit]);

  // Integrity event listeners — only after rules accepted
  useEffect(() => {
    if (!active || !rulesAccepted) return;

    const onVisibility = () => {
      if (document.visibilityState === "hidden") emit("tab_hidden");
      else emit("tab_visible");
    };
    const onBlur  = () => emit("window_blur");
    const onFocus = () => emit("window_focus");

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      emit("context_menu_attempt");
    };

    const onDragOver = (e: DragEvent) => e.preventDefault();
    const onDrop     = (e: DragEvent) => {
      e.preventDefault();
      emit("drag_drop_attempt");
    };

    // Copy is logged but NOT prevented — prevents breaks in Monaco editor
    const onCopy = () => emit("copy_attempt");

    const onKeyDown = (e: KeyboardEvent) => {
      const isReload =
        e.key === "F5" ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "r");
      if (isReload) {
        e.preventDefault();
        emit("reload_attempt", { key: e.key });
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur",  onBlur);
    window.addEventListener("focus", onFocus);
    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("dragover",    onDragOver, { passive: false });
    document.addEventListener("drop",        onDrop);
    document.addEventListener("copy",        onCopy);
    document.addEventListener("keydown",     onKeyDown);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur",  onBlur);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("dragover",    onDragOver);
      document.removeEventListener("drop",        onDrop);
      document.removeEventListener("copy",        onCopy);
      document.removeEventListener("keydown",     onKeyDown);
    };
  }, [active, rulesAccepted, emit]);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  async function handleStart() {
    setRulesAccepted(true);
    onStartRef.current();

    if (typeof document?.documentElement?.requestFullscreen === "function") {
      try {
        await document.documentElement.requestFullscreen();
        // fullscreenchange fires → setIsFullscreen(true)
      } catch {
        setFullscreenUnavailable(true);
        emit("fullscreen_unavailable", { reason: "request_failed" });
      }
    } else {
      setFullscreenUnavailable(true);
      emit("fullscreen_unavailable", { reason: "api_unsupported" });
    }

    emit("assessment_started");
  }

  async function handleReturnToFullscreen() {
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      // Stays paused — user must try again or the browser blocked it
    }
  }

  // ─── Derived state ───────────────────────────────────────────────────────────

  if (!active) return <>{children}</>;

  const status   = computeStatus(counts);
  const style    = STATUS_STYLE[status];
  const isLive   = rulesAccepted && (isFullscreen || fullscreenUnavailable);
  const isPaused = rulesAccepted && !isFullscreen && !fullscreenUnavailable;

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      {children}

      {/* ── Rules modal — shown before assessment starts ── */}
      {!rulesAccepted && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 px-4 pt-[8vh]">
          <div
            className="mb-8 w-full max-w-lg rounded-[20px] p-7 shadow-2xl"
            style={{ background: "#1c2128", border: "1px solid #7c3aed55" }}
          >
            {/* Header */}
            <div className="mb-5 flex items-start gap-3">
              <div
                className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
                style={{ background: "#7c3aed22" }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#a78bfa"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div>
                <p className="text-base font-semibold text-white">Assessment Mode Rules</p>
                <p className="mt-1 text-xs" style={{ color: "#8b9ab0" }}>
                  Read carefully before starting.
                </p>
              </div>
            </div>

            {/* Rules body */}
            <div
              className="mb-5 rounded-[12px] p-4 text-xs leading-6"
              style={{ background: "#24292f", color: "#b0bcc9", border: "1px solid #3a4048" }}
            >
              <p className="mb-3">
                Assessment Mode is designed to simulate interview pressure. During this session:
              </p>
              <ul className="space-y-2">
                <li>
                  • The app will use{" "}
                  <strong className="text-white">fullscreen mode</strong> — exiting fullscreen
                  pauses your assessment.
                </li>
                <li>
                  • Tab switches, window focus loss, reload attempts, and navigation attempts
                  are <strong className="text-white">logged as integrity events</strong>.
                </li>
                <li>• Right-click and copy shortcuts are logged.</li>
                <li>
                  • Do not use external help, notes, screenshots, recordings, or another
                  device.
                </li>
              </ul>
              <p
                className="mt-4 rounded px-3 py-2.5 text-[11px] leading-5"
                style={{
                  background: "#7c3aed11",
                  color: "#8b7ab0",
                  border: "1px solid #7c3aed33",
                }}
              >
                <strong className="text-[#a78bfa]">Note:</strong> MOCKR cannot technically
                prevent all forms of cheating in a normal browser. Integrity events may affect
                your result. Tab switches and fullscreen exits are logged — this does not claim
                to prove misconduct.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleStart}
                className="flex-1 rounded-lg px-4 py-2.5 text-sm font-bold transition hover:brightness-110 active:brightness-90"
                style={{ background: "#7c3aed", color: "#fff" }}
              >
                Start assessment
              </button>
              <button
                onClick={() => window.history.back()}
                className="flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition"
                style={{ background: "#3a4048", color: "#9ca3af" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Fullscreen blocking overlay — shown when fullscreen exits mid-assessment ── */}
      {isPaused && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/92 px-4">
          <div
            className="w-full max-w-sm rounded-[20px] p-7 text-center shadow-2xl"
            style={{ background: "#1c2128", border: "1px solid #ef444455" }}
          >
            <div
              className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full"
              style={{ background: "#ef444422" }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <p className="text-base font-semibold text-white">Assessment paused</p>
            <p className="mt-2 text-xs leading-5" style={{ color: "#9ca3af" }}>
              You exited fullscreen. Return to fullscreen to continue. This event has been
              logged.
            </p>
            {nonInfoTotal > 0 && (
              <p className="mt-2 text-xs font-semibold" style={{ color: style.color }}>
                Integrity: {status} · {nonInfoTotal} event{nonInfoTotal !== 1 ? "s" : ""}
              </p>
            )}
            <button
              onClick={handleReturnToFullscreen}
              className="mt-5 w-full rounded-lg px-4 py-2.5 text-sm font-bold transition hover:brightness-110 active:brightness-90"
              style={{ background: "#ef4444", color: "#fff" }}
            >
              Return to fullscreen
            </button>
          </div>
        </div>
      )}

      {/* ── Integrity status badge — visible while assessment is live ── */}
      {isLive && (
        <div
          className="fixed bottom-4 right-4 z-40 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold"
          style={{
            background: style.bg,
            color: style.color,
            border: `1px solid ${style.color}44`,
          }}
        >
          <span
            className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
            style={{ background: isFullscreen ? "#10b981" : "#ef4444" }}
          />
          {isFullscreen ? "Fullscreen" : "Windowed"}
          {nonInfoTotal > 0 && (
            <>
              <span style={{ color: "#4b5563", margin: "0 1px" }}>·</span>
              {nonInfoTotal} {status}
            </>
          )}
        </div>
      )}
    </>
  );
}
