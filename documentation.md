# Documentation Log

## 2026-07-01 17:02:54 AEST — Phase 4B.2: Isolated AI Grading Service

### What was completed

Started Phase 4B.2 by adding a dedicated AI grading service abstraction and a new authenticated isolated grading route at `/api/ai/grade`. This reuses the existing DeepSeek backend helper, asks the model for JSON-only rubric feedback, validates the model response, and then combines that AI output with backend-only deterministic correctness scoring and fixed score caps. The route returns a structured grading result but does not save anything to the database and does not alter the real practice submit flow, results page, scorecard UI, clarifying-question behaviour, or any live interviewer logic.

### Files/routes/components/tables changed

- `lib/ai/types.ts` — Extended the shared DeepSeek helper args to support a token limit.
- `lib/ai/deepseek.ts` — Added `max_tokens` passthrough for JSON grading responses.
- `lib/ai/grading-schema.ts` — Added strict grading input/result types, manual request validation, AI-response validation, and a safe sample payload.
- `lib/ai/grading-prompts.ts` — Added the isolated grading system/user prompt builders with explicit responsible-AI constraints.
- `lib/ai/grading.ts` — Added `gradeAttemptWithAI()`, deterministic code-correctness calculation, weighted hybrid scoring, and backend score caps.
- `app/api/ai/grade/route.ts` — Added an authenticated POST-only grading route with safe validation and provider error handling.
- `TESTING.md` — Added manual checks for the isolated AI grading route and a sample fetch payload.

### What the new route does

- Requires an authenticated user through the existing server-side Supabase auth pattern.
- Accepts a structured attempt payload with question metadata, interview notes, final code, and public/hidden test summaries.
- Sends a JSON-only grading request to DeepSeek for the non-correctness rubric categories.
- Validates and clamps the returned rubric categories before using them.
- Calculates `code_correctness` in backend logic from supplied test outcomes instead of trusting the model.
- Calculates the final weighted score and result band in backend logic.
- Returns the structured grading result as JSON without exposing prompts, secrets, or API keys.

### What the new route intentionally does NOT do yet

- It does not save grading results into `attempts`, `scorecards`, or any other database table.
- It does not replace the Phase 4A deterministic scorecard path used by the real submit flow.
- It does not change the results page UI.
- It does not change the practice workspace, clarifying questions, or any live interviewer behaviour.
- It does not reveal hidden test case contents to the model.

### Score calculation rules

Weights:

- Problem understanding and clarification: `10%`
- Explanation and communication: `15%`
- Algorithmic approach: `20%`
- Code correctness: `25%`
- Code quality: `10%`
- Testing and debugging: `10%`
- Complexity analysis: `5%`
- Response to hints and follow-ups: `5%`

Result bands:

- `0–39`: Needs significant improvement
- `40–54`: Below expected level
- `55–69`: Borderline
- `70–84`: Meets expected level
- `85–100`: Strong performance

### Score caps

- If no meaningful final code is provided, overall score cannot exceed `39`.
- If all core tests fail, overall score cannot exceed `45`.
- If hidden test pass rate is below `50%`, overall score cannot exceed `69`.
- If the complexity answer is empty, `complexity_analysis` is forced to `0/10`.
- If edge cases are empty, `testing_debugging` is capped at `5/10`.
- If hints used is `3` or more, `hints_followups` is capped at `5/10`.

### Local testing

Authenticated browser-session test:

```js
fetch("/api/ai/grade", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    question: {
      title: "Balanced Brackets",
      topic: "Stacks",
      difficulty: "easy",
      problemStatement:
        "Given a string of brackets, return true if every opening bracket is closed in the correct order.",
      expectedComplexity: {
        time: "O(n)",
        space: "O(n)",
        notes: "A stack-based approach is expected."
      },
      rubricNotes: [
        "Reward clear justification for using a stack.",
        "Penalise missing edge-case discussion for empty input."
      ]
    },
    attempt: {
      mode: "practice",
      language: "javascript",
      clarificationNotes:
        "I would confirm whether non-bracket characters can appear and whether an empty string should return true.",
      approachExplanation:
        "I would scan once, push opening brackets onto a stack, and pop when I see a matching closer.",
      testingPlan:
        "I would test empty input, a simple balanced pair, nested brackets, and an early mismatch.",
      edgeCases:
        "Empty string, single opening bracket, nested mixed bracket types.",
      complexityAnswer:
        "Time O(n), space O(n) in the worst case because of the stack.",
      finalCode:
        "function balancedBrackets(s) {\\n  const pairs = { ')': '(', ']': '[', '}': '{' };\\n  const stack = [];\\n  for (const char of s) {\\n    if (char === '(' || char === '[' || char === '{') stack.push(char);\\n    else if (pairs[char]) {\\n      if (stack.pop() !== pairs[char]) return false;\\n    }\\n  }\\n  return stack.length === 0;\\n}",
      timeTakenSeconds: 780,
      hintsUsed: 1,
      runCount: 3
    },
    publicTests: {
      passed: 3,
      failed: 1,
      total: 4,
      timedOut: false,
      results: [
        { label: "empty string", status: "passed", error: null, durationMs: 2 },
        { label: "simple pair", status: "passed", error: null, durationMs: 1 },
        { label: "nested case", status: "passed", error: null, durationMs: 1 },
        { label: "mismatch case", status: "failed", error: null, durationMs: 1 }
      ]
    },
    hiddenTests: {
      passed: 4,
      failed: 1,
      total: 5,
      timedOut: false,
      results: [
        { label: null, status: "passed", error: null, durationMs: 1 },
        { label: null, status: "passed", error: null, durationMs: 1 },
        { label: null, status: "passed", error: null, durationMs: 1 },
        { label: null, status: "passed", error: null, durationMs: 1 },
        { label: null, status: "failed", error: null, durationMs: 1 }
      ]
    }
  })
})
  .then((res) => res.json())
  .then(console.log);
```

Expected success shape:

- `ok: true`
- `grading.overall_score`
- `grading.result_band`
- rubric category objects including `score`, `evidence`, and `improvement`
- `grading.feedback.caps_applied`
- `grading.model_used`

### Limitations

- This route depends on a valid logged-in browser session plus the existing DeepSeek environment variables.
- The route grades from supplied payload data only; it does not fetch or verify a real attempt row yet.
- Hidden test case contents are intentionally not passed through to the model, only hidden result summaries.
- AI summary quality can vary; backend validation and scoring caps limit misuse, but this is still not the final production grading flow.

### What should happen next

Phase 4B.3 should connect this isolated grading service to a backend-only attempt-grading orchestration layer, then gate any real persistence or UI adoption behind explicit review so the current practice flow remains stable until approved.

## 2026-07-01 16:45:32 AEST — Phase 4B Started: DeepSeek Backend Integration

### What was completed

Started Phase 4B by adding a small backend-only DeepSeek provider layer and a dedicated health/test route. This does not touch the real practice submission flow, deterministic scorecards, clarifying-question flow, or any scorecard UI. The new helper is fetch-based, uses DeepSeek's OpenAI-compatible `/chat/completions` format, requests JSON via `response_format: { type: "json_object" }`, and is shaped for later grading use without implementing grading yet.

### Files/routes/components/tables changed

- `lib/ai/deepseek.ts` — Added the server-only DeepSeek config/helper layer, reusable `generateJsonWithDeepSeek()` function, and timeout/API/JSON error handling.
- `lib/ai/types.ts` — Added shared AI helper types and DeepSeek error-code definitions.
- `app/api/ai/health/route.ts` — Added a backend-only health/test route that validates configuration, makes a tiny DeepSeek request, parses JSON safely, and returns a sanitized success/failure response.
- `.env.example` — Added safe placeholder env vars for Supabase and DeepSeek.
- `TESTING.md` — Added manual checks for the DeepSeek health endpoint.

### DeepSeek provider decision

- Provider selected: DeepSeek
- Default model: `deepseek-v4-flash`
- Optional future grading model: `deepseek-v4-pro`
- Deprecated model names such as `deepseek-chat` and `deepseek-reasoner` were not used.

### Environment variables

- `DEEPSEEK_API_KEY`
- `DEEPSEEK_BASE_URL=https://api.deepseek.com`
- `DEEPSEEK_MODEL=deepseek-v4-flash`

### Local testing

1. Add `DEEPSEEK_API_KEY`, `DEEPSEEK_BASE_URL`, and `DEEPSEEK_MODEL` to your local `.env.local`.
2. Start the app with `npm run dev`.
3. Open `http://localhost:3000/api/ai/health`.
4. Expected success response: HTTP `200` with `ok: true`, `provider: "deepseek"`, the configured model name, and a parsed JSON health payload.
5. Expected failure responses:
   - missing `DEEPSEEK_API_KEY` → safe JSON error without exposing secrets
   - DeepSeek `429` → safe JSON rate-limit response
   - timeout / upstream failure / invalid JSON → safe JSON failure response

### Limitations

- The new route is only a provider connectivity check. It does not integrate with practice submission, rubric grading, clarifying questions, or the scoreboard yet.
- Testing the success path locally requires a valid `DEEPSEEK_API_KEY` in `.env.local`.
- The route is intentionally server-side only; no client component imports the DeepSeek helper.

### What should happen next

Phase 4C should wire this provider layer into a dedicated grading service abstraction, then connect that grading service to the attempt submission pipeline behind safe feature boundaries. Do not connect it directly from client components.

## 2026-07-01 15:35:00 AEST — Stage Action Buttons + Submitted-Approach Gate

### What was completed

Synced the branch with the latest `main` updates, kept the new assessment integrity flow from `main`, and then tightened the shared practice/assessment workspace stage flow. Clarification skip now advances straight to Stage 2, each stage now exposes a clear next/submit action inside the panel, and Stage 2 now requires an explicit submit action before the editor unlocks. Because practice and assessment both render the same `PracticeSession` component, the updated interview-stage behaviour now applies consistently to both modes.

### Files/routes/components/tables changed

- `app/practice/[questionId]/practice-session.tsx` — Added explicit stage action buttons, made clarification skip jump to Stage 2, introduced a persisted `approachSubmitted` gate so Stage 2 must be submitted before coding unlocks, and kept the assessment-integrity integration from `main` intact.
- `types/practice.ts` — Added persisted `approachSubmitted` draft state.
- `lib/practice-draft.ts` — Added the default `approachSubmitted` field to fresh drafts.
- `TESTING.md` — Added manual checks for skip-to-Stage-2 behaviour, explicit stage action buttons, submitted-approach gating, and assessment-mode parity.

### Merge note

`git pull origin main` required stashing the in-progress workspace changes first. The stash reapplied cleanly except for `documentation.md`, which was merged manually in file contents. Because the repo instructions say not to stage files, Git may still show unmerged/index state until you stage the resolved files yourself.

### What should happen next

Run the shared workspace flow in both `mode=practice` and `mode=assessment` to confirm the explicit Stage 2 submit gate feels right with the new integrity guard from `main`.

## 2026-07-01 — Assessment Integrity Mode (Frontend)

### What was completed

Implemented the browser-side Assessment Integrity Mode on top of the data layer from the previous session. Practice Mode is unchanged.

### Files changed

- `components/assessment/AssessmentIntegrityGuard.tsx` — new component
- `app/practice/[questionId]/practice-session.tsx` — integrated the guard
- `lib/attempts-service.ts` — added `integrityEvents` to `SubmitAttemptArgs`, inserts events into `attempt_events` on submit
- `app/results/[attemptId]/page.tsx` — added integrity summary section for assessment attempts

### What AssessmentIntegrityGuard does

- Shows a required rules confirmation modal before the assessment starts. The workspace is rendered behind the modal but inaccessible.
- Calls `document.documentElement.requestFullscreen()` when the user accepts the rules.
- While assessment is active:
  - Tracks `fullscreenchange` → logs `fullscreen_exit` / `fullscreen_entered`
  - Tracks `visibilitychange` → logs `tab_hidden` / `tab_visible`
  - Tracks `window blur/focus` → logs `window_blur` / `window_focus`
  - Blocks right-click (contextmenu → `context_menu_attempt`)
  - Blocks drag/drop (drag_drop_attempt)
  - Logs copy events (copy_attempt; not prevented to avoid breaking Monaco)
  - Blocks Ctrl+R / Cmd+R / F5 (reload_attempt)
- If fullscreen exits mid-assessment: shows a blocking overlay. User must click "Return to fullscreen" to continue. Their code and answers are preserved.
- Floating badge (bottom-right) shows fullscreen state + integrity status + event count while the assessment is live.
- Exits fullscreen before navigating to results on submit.

### What it does NOT do

- No webcam, screen recording, face tracking, eye tracking, or invasive proctoring.
- No photos, screenshots, audio, or video storage.
- Cannot technically prevent screenshots, photos, switching devices, or using a second screen.
- Does not auto-fail the user for integrity events.
- Does not claim cheating is detected or proven. UI uses language like "logged as integrity events."
- Does not affect Practice Mode at all.

### Integrity event storage

On submit, `submitAttempt` inserts:
1. One `attempt_events` row per integrity event (`event_type = 'integrity_event'`, payload includes type, severity, elapsedSeconds, metadata).
2. One summary row (`event_type = 'integrity_summary'`, `stage = 'submit'`) with finalStatus, totalEvents, lowCount, mediumCount, highCount.

Status rules (matching DB migration 003): 3+ high → compromised; 1+ high or 2+ medium → flagged; 1+ medium or 3+ low → warning; else → clean.

### Results page

If mode is `assessment` and an `integrity_summary` event exists, the results page shows an "Assessment integrity" section with status, event count, and a disclaimer note.

### Limitations

- Migration 003 (assessment_integrity_foundation.sql) must be applied to the remote Supabase project before integrity events will actually persist. Until then, submit succeeds but the `attempt_events` insert may fail silently.
- Graphify CLI unavailable in this environment — graph not updated.
- Fullscreen API availability varies by browser. Safari restricts fullscreen on some elements. The guard has a `fullscreenUnavailable` fallback that allows the assessment to proceed without fullscreen enforcement.
- The `beforeunload` integrity event (page_leave_attempt) fires on unload but state updates from it will not be submitted (page is navigating away). This is expected — the attempt is abandoned in that case.

---

## 2026-07-01 — Assessment Integrity Database Foundation

### What was completed

Prepared the Supabase data layer for Assessment Integrity Mode. No frontend locked-browser UI was implemented. No webcam, audio, video, screenshot, or photo storage was added.

### Tables / columns created

**`public.attempts` — altered (additive only)**

New columns (all safe defaults; existing rows unaffected):

| Column | Type | Default | Purpose |
|---|---|---|---|
| `integrity_status` | `text` | `'clean'` | Current integrity state for the attempt |
| `integrity_event_count` | `int` | `0` | Running total of all integrity events |
| `assessment_started_at` | `timestamptz` | `null` | When the user entered assessment mode |
| `assessment_submitted_at` | `timestamptz` | `null` | When the attempt was submitted in assessment mode |
| `fullscreen_required` | `boolean` | `false` | Whether fullscreen was required for this attempt |
| `fullscreen_active` | `boolean` | `false` | Whether fullscreen is currently active |
| `integrity_metadata` | `jsonb` | `{}` | Arbitrary extra integrity data for future use |

Check constraint added: `integrity_status in ('clean', 'warning', 'flagged', 'compromised')`.

**`public.assessment_integrity_events` — new table**

Append-only log of assessment-environment events. Fields: `id`, `attempt_id`, `user_id`, `event_type`, `severity`, `stage`, `elapsed_seconds`, `occurred_at`, `metadata`, `created_at`. Check constraints on `event_type` (21 allowed values) and `severity` (`info`, `low`, `medium`, `high`). Six indexes.

**`public.user_consents` — new table**

Stores per-user consent records for future modal confirmations. Fields: `id`, `user_id`, `consent_type`, `version`, `consented`, `metadata`, `created_at`. `consent_type = 'assessment_integrity_rules'` is reserved for the assessment rules confirmation modal.

### View created

**`public.assessment_integrity_summary`** — aggregates event counts and current integrity status per attempt. Uses `security_invoker = true` (Postgres 15+) so the underlying RLS on `assessment_integrity_events` and `attempts` applies; each user sees only their own rows.

Columns: `attempt_id`, `user_id`, `total_event_count`, `low_count`, `medium_count`, `high_count`, `last_event_at`, `integrity_status`.

### RPC function

**`public.log_assessment_integrity_event`** — called by the browser client to log one event. Parameters: `p_attempt_id`, `p_event_type`, `p_severity` (default `'info'`), `p_stage`, `p_elapsed_seconds`, `p_metadata`. Returns `{ event_id, integrity_status, integrity_event_count }`. Uses `SECURITY INVOKER` so RLS applies normally; ownership is also verified explicitly before any write.

### Integrity status rules (MVP)

| Condition | Status |
|---|---|
| No medium or high events | `clean` |
| 1 medium event, or 3+ low events | `warning` |
| 2+ medium events, or 1 high event | `flagged` |
| 3+ high events | `compromised` |

### Suggested severity mapping

| Severity | Event types |
|---|---|
| `info` | `assessment_started`, `fullscreen_entered`, `tab_visible`, `window_focus`, `assessment_resumed`, `assessment_submitted`, `assessment_rules_accepted`, `fullscreen_requested`, `fullscreen_unavailable` |
| `low` | `copy_attempt`, `paste_attempt`, `context_menu_attempt`, `drag_drop_attempt` |
| `medium` | `window_blur`, `tab_hidden`, `fullscreen_exit`, `route_change_attempt`, `assessment_paused` |
| `high` | `page_leave_attempt`, `reload_attempt`, `assessment_abandoned` |

### RLS policy summary

- **`assessment_integrity_events`**: SELECT own rows (`user_id = auth.uid()`); INSERT for own attempts (ownership via `attempts.user_id`); no UPDATE or DELETE (append-only).
- **`user_consents`**: SELECT and INSERT own rows only.
- **`attempts`** existing policies unchanged.

### TypeScript files created

- `types/assessment-integrity.ts` — `AssessmentIntegrityStatus`, `AssessmentIntegritySeverity`, `AssessmentIntegrityEventType`, `AssessmentIntegrityEventPayload`, `AssessmentIntegritySummary`, `INTEGRITY_EVENT_SEVERITY` map, `INTEGRITY_STATUS_LABELS` map.
- `lib/assessment-integrity.ts` — `logAssessmentIntegrityEvent()`, `getAssessmentIntegritySummary()`. Uses the existing browser Supabase client (`lib/supabase/client.ts`). Not wired into the UI yet.

### What this system does NOT do

- This is not a true secure lockdown browser. A normal browser cannot prevent OS-level screenshots, phone photos, second devices, or all external tab/window changes.
- No webcam, face tracking, eye tracking, screen recording, audio recording, or video storage.
- No photos or screenshots are stored.
- Users are never auto-failed for integrity events.
- Integrity status never claims cheating was proven — it only records observable browser-environment events.

### How the future frontend should integrate

1. User reads and accepts assessment rules → call `logAssessmentIntegrityEvent({ eventType: 'assessment_rules_accepted', severity: 'info' })` and insert a `user_consents` row with `consent_type = 'assessment_integrity_rules'`.
2. Attempt is created → set `fullscreen_required = true` on the attempt if fullscreen is being enforced.
3. Frontend requests fullscreen → log `fullscreen_requested`, then `fullscreen_entered` or `fullscreen_unavailable`.
4. During the session, browser event hooks log: `tab_hidden`/`tab_visible`, `window_blur`/`window_focus`, `page_leave_attempt`, `reload_attempt`, `route_change_attempt`.
5. On submit → log `assessment_submitted`.
6. Results page reads `getAssessmentIntegritySummary(attemptId)` and displays the integrity badge using `INTEGRITY_STATUS_LABELS`.

### Supabase migration setup

**If Supabase CLI is configured for this project:**

```bash
supabase db push
# or, for local dev stack:
supabase migration up
```

**If Supabase CLI is not configured (current state):**

The SQL is prepared but has not been applied to the remote project. To apply manually:

1. Open the Supabase dashboard → SQL Editor.
2. Copy the full contents of `supabase/migrations/003_assessment_integrity_foundation.sql`.
3. Paste into the SQL Editor and click Run.
4. Verify that `attempts`, `assessment_integrity_events`, `user_consents`, and `assessment_integrity_summary` appear in the Table Editor / Schema view.

### `attempt_events` convention note

The existing `attempt_events` table (from migration 001) is not replaced. Assessment integrity events are stored in the dedicated `assessment_integrity_events` table. Important summary events (e.g. `assessment_submitted`) may optionally be mirrored into `attempt_events` later if the implementation already depends on it; do not duplicate every event unless there is a clear reason.

### What should happen next

Phase: implement the frontend Assessment Integrity Mode UI.

1. Add browser event hooks to `practice-session.tsx` for fullscreen, visibility, window focus, and navigation events.
2. Call `logAssessmentIntegrityEvent` from `lib/assessment-integrity.ts` for each event.
3. On submit in assessment mode, update `attempts.assessment_submitted_at`.
4. Show the integrity badge on `app/results/[attemptId]/page.tsx` using `getAssessmentIntegritySummary`.
5. Apply `003_assessment_integrity_foundation.sql` to the production Supabase project before browser-side writes can work.

---

## 2026-07-01 15:13:00 AEST — Practice Workspace Hydration Mismatch Fix

### What was completed

Fixed the Next.js hydration mismatch introduced by the overview-stage follow-up. The practice workspace was reading `localStorage` and session-only abandonment state inside the `PracticeSession` state initializer, which meant the server always rendered the overview while the client could immediately render a saved stage such as Clarification. Draft restoration now happens after mount, so the server HTML and the first client render both start from the same stable empty draft before browser-only state is applied.

### Files/routes/components/tables changed

- `app/practice/[questionId]/practice-session.tsx` — Moved browser-only draft restoration out of the `useState` initializer and into a post-mount effect, and gated draft persistence until restoration completes so saved drafts are not overwritten during hydration.

### Verification

- `npx tsc --noEmit` passed.
- `npm run lint` passed.

### What should happen next

Reload the practice workspace after navigating away and back to confirm saved stage position still restores correctly without triggering the hydration warning again.

## 2026-07-01 14:42:00 AEST — Interview Panel Follow-up: Overview First, Single-Stage Flow

### What was completed

Refined the practice interview panel interaction after the previous workflow pass. The panel no longer keeps all five stages visible while the user is answering questions. It now opens on a dedicated overview screen that summarises the five interview stages and their current statuses, then moves into a one-stage-at-a-time flow once the user clicks `Begin Stage 1`. The `Overview` button returns the user to the summary screen, while the arrow buttons continue to drive sequential navigation through the active stages.

Also fixed the answer-area usability issue by making the stage text inputs scrollable within the panel. Long clarification, approach, testing-plan, edge-case, and complexity answers can now be read and edited without content disappearing below the panel bounds.

### Files/routes/components/tables changed

- `app/practice/[questionId]/practice-session.tsx` — Added the overview-first interview panel state, restored one-stage-at-a-time navigation, and made the stage input areas scrollable.
- `types/practice.ts` — Added the `overview` interview-panel state.
- `lib/practice-draft.ts` — Practice drafts now default back to the overview panel on a fresh attempt.
- `TESTING.md` — Updated the interview-panel checklist for the overview screen, single-stage navigation, and scrollable answer areas.

### Verification

- `npx tsc --noEmit` passed.
- `npm run lint` passed.
- Manual browser verification on `http://localhost:3000` confirmed:
  - the overview screen appears first,
  - `Begin Stage 1` enters the staged flow,
  - the next-arrow advances to `Stage 2 of 5`,
  - the `Overview` button returns to the summary screen,
  - the active stage textarea reports `overflowY: auto` and supports scrolling when content exceeds the visible height.

### What should happen next

No additional structural follow-up is required for this refinement unless you want the overview screen to become dismissible permanently per attempt instead of remaining available through the `Overview` button.

## 2026-07-01 14:29:37 AEST — Practice Workspace Interview Workflow + Runner Bugfix Pass

### What was completed

Tightened the practice workspace so the interview workflow is a first-class part of the experience instead of a side note. The bottom-left panel now presents the five interview stages as `Clarification → Approach → Code Written → Testing Plan → Submit Review`, makes the stage status explicit, and enforces the key workflow rules: clarification can be intentionally skipped, approach is required before coding, code must meaningfully change from the starter before Stage 3 counts as complete, testing remains encouraged but optional, and submission now requires approach, code, and complexity with specific inline guidance for whichever requirement is missing.

Also fixed the Python starter-name mismatch by deriving the live Python starter function name from the canonical question metadata (`question.function_name`) before it reaches the editor, and updated the seed SQL so all published Python stubs use the same canonical camelCase function names. The public test output UI now shows `YOUR OUTPUT` for each case, including `No output due to runtime error` when execution fails and the underlying error message below it.

### Files/routes/components/tables changed

- `app/practice/[questionId]/practice-session.tsx` — Reworked the interview-stage model, added approach-gated editor locking, stage status cards, intentional clarification skip state, Stage 3 meaningful-code detection, submit validation messaging, Python starter-name alignment, and `YOUR OUTPUT` test-result rendering.
- `components/code-editor.tsx` — Added read-only support so the practice editor can be locked before Stage 2 is complete without changing the Monaco integration.
- `types/practice.ts` — Updated the interview panel union to the new five-stage flow and added persisted clarification-skip state.
- `lib/practice-draft.ts` — Added the default `clarificationSkipped` draft field.
- `supabase/seed/002_seed_questions.sql` — Updated every published Python starter stub to the canonical camelCase function name expected by the runner metadata.
- `TESTING.md` — Added manual verification coverage for the enforced interview-stage workflow, canonical Python starter names, and `YOUR OUTPUT` runner details.
- `.graphify/graph.json` and `.graphify/GRAPH_REPORT.md` — Refreshed with `npx graphify update --no-description --no-label .`.

### Workflow rules now implemented

- Stage 1 Clarification: optional, with an explicit skip action that records the stage as intentionally skipped.
- Stage 2 Approach: required before the editor unlocks, before Run becomes available, and before Submit succeeds.
- Stage 3 Code Written: unlocked only after Stage 2; marked complete only when the current language's code meaningfully differs from the starter stub after comment/whitespace normalization.
- Stage 4 Testing Plan / Edge Cases: encouraged but optional; does not block Run or Submit.
- Stage 5 Submit Review / Complexity: requires approach, meaningful code, and a complexity answer; missing requirements show specific inline guidance.

### Verification

- `npm run lint` passed.
- `npx tsc --noEmit` passed.
- `npm run build` failed inside the sandbox with the known Turbopack `Operation not permitted` process/port restriction, then passed when rerun with elevated permissions.
- `npx graphify update --no-description --no-label .` passed and refreshed the checked-in graph artifacts.
- Manual browser verification succeeded for unauthenticated question-library and question-detail navigation, the Python language selection path for Balanced Brackets, and the auth redirect from Start Practice to `/login?next=...`.

### Limitations that remain

- Full authenticated manual verification of the practice workspace stages and multi-language runner flow is still blocked in this environment because practice routes require login and creating a fresh test account through `/signup` returned the existing generic error state `Something went wrong. Please try again.` No repo code was changed for auth in this pass.
- The Python starter-name fix is applied at the practice-session layer and in the seed SQL. Existing remote question rows that still store snake_case Python starters will display correctly in the editor because the session now normalizes them against `question.function_name`, but the underlying remote seed data still needs to be reseeded if you want the database values themselves to match.
- C++ execution remains unsupported, unchanged from before this task. The output UI changes still apply to the existing C++ error-result path.

### What should happen next

Fix or provide a working test login path so the remaining authenticated manual checks in `TESTING.md` can be exercised end-to-end, especially the locked editor flow, submit validation, and JavaScript/Python/C++ runner result details from the real practice route.

## 2026-07-01 — Phase 4A Closeout

### What was completed

Closed the remaining Phase 4A validation items without starting Phase 4B. Added the TypeScript 6 deprecation suppression recommended by `tsc`, refined results-page fallback messaging for attempts that have summary score fields but no joined `scorecards` row, expanded manual testing coverage for JavaScript submissions with failing public tests, and documented the required production Supabase scorecards insert-policy migration.

### Files/routes/components/tables changed

- `tsconfig.json` — Added `"ignoreDeprecations": "6.0"` so `baseUrl` remains unchanged while TypeScript 6 no longer fails the build.
- `app/results/[attemptId]/page.tsx` — Added a score-summary-only state for saved attempts where `attempts.overall_score` or `attempts.result_band` exists but the detailed scorecard row is missing. Full scorecards still show the category breakdown; old attempts with no score still show the pre-scorecard fallback.
- `TESTING.md` — Added Phase 4A manual coverage for JavaScript attempts with failing public tests still saving attempts, snapshots, public test runs, scorecards, summary fields, lower correctness scoring, dashboard score visibility, and no hidden-test exposure.
- `documentation.md` — Added this closeout record and migration reminder.

### Supabase migration reminder

`supabase/migrations/002_scorecards_insert_policy.sql` must be applied to the real Supabase project before Phase 4A browser-side scorecard inserts can work in production. Without it, `public.attempts` and related rows may save while `public.scorecards` inserts fail due to RLS.

### Verification

- `npm run lint` passed.
- `npx tsc --noEmit` passed after the TypeScript config closeout.
- `npm run build` failed inside the sandbox with the known Turbopack `Operation not permitted` process/port error, then passed when rerun with elevated permissions.

### Commands run

```bash
npx graphify query "What files are relevant to Phase 4A scorecard persistence, results, dashboard, testing docs, and TypeScript config?"
npx graphify query "What files are affected by scorecard RLS, failed public test scorecards, and missing-scorecard fallbacks?"
npx tsc --noEmit
npm run lint
npm run build
npx graphify query "What changed for Phase 4A closeout?"
npx graphify update --no-description --no-label .
```

### Limitations that remain

- The closeout does not apply the Supabase migration to production; it only documents that the user must apply `002_scorecards_insert_policy.sql`.
- Scoring remains deterministic Phase 4A only. No AI scoring, hidden-test execution, server-side execution, C++ execution, Judge0, Piston, or `/api/grade` was added.
- Hidden tests remain authored in the database but are not fetched, exposed, run, or scored by the app.

### What should happen next

Phase 4A is safe to move forward from once the production Supabase scorecards insert policy migration is applied and the new manual checklist items are exercised in browser testing.

## 2026-06-30 — Graphify CLI Restored

### What was completed

Pulled `origin/main` into `phase-4a-deterministic-scorecards`, resolved the documentation/instruction merge conflicts in the working tree, and replaced the temporary repo-local Graphify fallback with the real Graphify CLI package. Installed `@sentropic/graphify` as a dev dependency so `npx graphify query`, `npx graphify explain`, `npx graphify path`, and `npx graphify update --no-description --no-label .` can run as intended from the repo root.

### Files/routes/components/tables changed

- `package.json` and `package-lock.json` — Added `@sentropic/graphify` as a dev dependency; npm removed the stale unrelated `node_modules/graphify` package during install.
- `AGENTS.md` — Updated mandatory Graphify workflow to use `npx graphify ...` instead of `./scripts/graphify`.
- `.codex/hooks.json` and `.claude/settings.json` — Updated Graphify reminders to point agents at `npx graphify`.
- `TESTING.md` — Replaced the fallback-specific Graphify checklist with real CLI checks.
- `scripts/graphify` and `scripts/graphify-cli.js` — Removed the temporary query-only fallback scripts.
- `.graphify/` — Regenerated the real Graphify graph artifacts with the installed CLI.
- `.gitignore` — Added ignore rules for `.graphify` cache and generated assistant-instruction folders.

### Limitations that remain

- The `git pull origin main` merge has been resolved in file contents, but the repo rule says not to run `git add`, so the user must stage the resolved files to clear Git's unmerged index state.
- `npm install --save-dev @sentropic/graphify` reported 15 audit findings from the dependency tree and an engine warning because this environment uses Node `v20.17.0` while one dependency asks for Node `^20.19.0 || ^22.13.0 || >=24`. I did not run `npm audit fix` because that can make unrelated dependency changes.
- `npx graphify portable-check .` still flags `/practice/[questionId]` inside `.graphify/graph.json` as an absolute path. This appears to be a false positive caused by the Next.js dynamic route string, not a local filesystem path.

### Issues encountered and assumptions made

- npm registry research showed the package named `graphify` is an unrelated 2015 random graph generator with no CLI binary.
- The intended current Graphify package is `@sentropic/graphify`; it exposes the `graphify` binary and supersedes the older `graphifyy` package.
- I assumed `npx graphify` is the safest repo-local invocation because the binary is installed in `node_modules/.bin` and is not necessarily on every shell's global `PATH`.

### Commands run

```bash
git pull origin main
npm search graphify --json
npm view @sentropic/graphify name version bin description repository homepage --json
npm install --save-dev @sentropic/graphify
npx graphify --help
npx graphify query "What files are relevant to Phase 4A scorecard persistence, results, dashboard, testing docs, and TypeScript config?"
npx graphify explain "practice-session.tsx"
npx graphify path "practice-session.tsx" "attempts-service.ts"
npx graphify check-update .
npx graphify update .
npx graphify update --no-description --no-label .
npx graphify portable-check .
npm run lint
npx tsc --noEmit
```

### Verification

- `npx graphify --help` passed and showed the real `@sentropic/graphify` CLI command list.
- `npx graphify query ...`, `npx graphify explain "practice-session.tsx"`, and `npx graphify path "practice-session.tsx" "attempts-service.ts"` passed.
- `npx graphify update --no-description --no-label .` passed and regenerated `.graphify/`.
- `npx graphify check-update .` passed after removing stale assistant-instruction outputs.
- `npm run lint` passed.
- `npx tsc --noEmit` still fails only on the known TypeScript 6 `baseUrl` deprecation in `tsconfig.json`; this is deferred to Phase 4A closeout.
- `npx graphify portable-check .` still fails only on `/practice/[questionId]` being detected as an absolute path in `.graphify/graph.json`; this appears to be a false positive for a Next.js route string.

### What should happen next

- Run `npx graphify update --no-description --no-label .` after future structural/code changes unless semantic labels/descriptions are intentionally being filled.
- Stage the resolved merge files manually, then continue with Phase 4A closeout.

## 2026-06-29 21:04:04 AEST — Graphify Dependency Cleanup

### What was completed

Removed the misleading `graphify` dependency from `package.json` and `package-lock.json`. The repo now relies on the checked-in `./scripts/graphify` fallback instead of an unrelated npm package that never provided the expected CLI.

### Files/routes/components/tables changed

- `package.json` — Removed `"graphify": "^1.0.0"` from runtime dependencies.
- `package-lock.json` — Removed the root `graphify` dependency entry and the `node_modules/graphify` lock entry.
- `scripts/graphify-cli.js` — Updated `doctor` output so it reports manifest state correctly and distinguishes between a removed dependency and a stale installed copy still present in `node_modules`.

### Limitations that remain

- `node_modules/graphify` still exists on disk from the earlier install. It is now stale and no longer referenced by the manifests, but it will remain until dependencies are reinstalled or `node_modules` is refreshed.
- `./scripts/graphify update .` is still unsupported in fallback mode because the real external Graphify CLI is not installed.

### Issues encountered and assumptions made

- The previous `doctor` implementation looked only at `node_modules/graphify`, which produced a misleading warning even after the manifest dependency was removed. That was corrected to inspect both `package.json` and `node_modules`.
- I left the stale installed package in `node_modules` because the repo instructions do not justify destructive cleanup here, and the manifest-level fix is the part that affects future installs and future work.
- Required Graphify post-change refresh was attempted via `./scripts/graphify update .` and correctly reported that fallback mode cannot regenerate `graphify-out/`.

### What should happen next

- On the next normal dependency refresh, run the project’s preferred install command so the stale `node_modules/graphify` directory disappears.
- If full graph regeneration becomes necessary, install the real Graphify CLI outside the repo or teach the fallback to delegate when one is available.

## 2026-06-29 20:50:00 AEST — Graphify Fallback Repair

### What was completed

Investigated why Graphify commands were failing in this environment and added a repo-local fallback CLI for future sessions. The root issue is that `package.json` currently references an unrelated npm package named `graphify` that has no CLI binary, so bare `graphify` and `npx graphify` cannot work here. Added `./scripts/graphify` with working `query`, `explain`, `path`, and `doctor` commands over the checked-in `graphify-out/graph.json`, and updated repo instructions/hooks to point at the local command instead of the missing global binary.

### Files/routes/components/tables changed

- `scripts/graphify-cli.js` — New Node-based fallback CLI for Graphify orientation commands.
- `scripts/graphify` — Executable wrapper for the fallback CLI.
- `AGENTS.md` — Updated Graphify commands to use `./scripts/graphify` and documented that `update` may be unsupported in fallback mode.
- `.codex/hooks.json` — Updated the Graphify reminder to reference `./scripts/graphify query`.
- `.claude/settings.json` — Updated Claude-side Graphify reminders to reference `graphify-out/graph.json` and `./scripts/graphify`.
- `documentation.md` — Updated workflow text to use the repo-local Graphify command and recorded the environment issue/fix.

### Limitations that remain

- `./scripts/graphify update .` is intentionally read-only and exits with a clear unsupported message. It does not regenerate `graphify-out/` because the real external Graphify CLI is still not installed in this environment.
- Historical documentation entries still mention older `graphify` commands where they describe what happened at the time; those are left intact as historical records.
- `package.json` and `package-lock.json` still contain the unrelated `graphify` dependency. I did not rewrite them because they were already user-modified and this fallback avoids depending on them.

### Issues encountered and assumptions made

- The `graphify` npm package installed in `node_modules` is `graphify@1.0.0`, a random graph generator with no CLI `bin`, not the repository’s intended Graphify tool.
- Existing hooks and agent instructions assumed a global `graphify` binary on `PATH`, which is why every mandatory Graphify step was failing with `command not found`.
- I assumed a local read-only fallback is preferable to keeping the repo in a permanently broken state while leaving full graph regeneration for a later environment-level fix.

### What should happen next

- Use `./scripts/graphify query ...`, `./scripts/graphify explain ...`, and `./scripts/graphify path ...` for future code orientation in this repo.
- If full graph regeneration is required, install the real Graphify CLI outside the repo and then decide whether to replace the fallback or teach it to delegate to the real binary when present.
- If the user wants, the next cleanup step is to remove or replace the misleading `graphify` npm dependency after confirming it is not needed for anything else.

## 2026-06-29 20:41:32 AEST — Phase 4A Deterministic Scorecards

### What was completed

Implemented Phase 4A deterministic scorecards for persisted attempts. Submitting an attempt now calculates a deterministic rubric-based scorecard, writes it to `public.scorecards`, updates `public.attempts.overall_score` and `public.attempts.result_band`, shows the saved score breakdown on the results page, and surfaces score/result-band data in dashboard attempt history.

### Files/routes/components/tables changed

- `types/scorecard.ts` — Added shared scorecard, feedback, and deterministic scoring input/output types.
- `lib/deterministic-score.ts` — Added pure `calculateDeterministicScorecard()` helper with deterministic v1 heuristics for all eight rubric categories, overall weighting, result bands, and structured strengths/weaknesses/improvement tasks.
- `lib/attempts-service.ts` — Extended `submitAttempt()` to calculate and insert scorecards and update attempt score summary fields without making scorecard failure fatal. Extended saved-attempt fetches to include scorecard and public test summary data.
- `app/results/[attemptId]/page.tsx` — Reworked persisted UUID results to show submitted time, overall score, result band, category breakdown, public test summary, strengths, weaknesses, improvement tasks, and clear deterministic-scoring limitations. Older saved attempts without scorecards now show a friendly fallback instead of failing.
- `app/dashboard/page.tsx` — Recent attempts table now shows saved score/result-band data and a “Not scored yet” fallback for pre-Phase-4A attempts.
- `supabase/migrations/002_scorecards_insert_policy.sql` — Added the missing `INSERT` RLS policy for `public.scorecards`, which is required for browser-side authenticated writes.
- `public.scorecards` — now written on submit.
- `public.attempts` — now updated on submit with `overall_score` and `result_band`.

### Limitations that remain

- Scoring is deterministic only. No AI, no hidden-test execution, and no static analysis are included.
- Code quality is estimated with simple heuristics only and should be treated as conservative.
- C++ remains editor-only. Attempts are scored, but correctness is explicitly unverified because execution is not supported yet.
- Older attempts created before this phase will not have a `scorecards` row; the UI now handles that case intentionally.
- `graphify update .` could not be run because the `graphify` CLI is not installed on `PATH` in this environment (`zsh:1: command not found: graphify`).

### Issues encountered and assumptions made

- The repo’s required Graphify command is unavailable in this shell even though graph artifacts already exist, so graph refresh/query steps had to fall back to the checked-in graph outputs and could not be regenerated.
- `npm run build` failed inside the sandbox with a Turbopack environment error: `Operation not permitted (os error 1)` while creating a process/binding to a port. Re-running the exact build command with elevated permissions succeeded.
- The existing schema already matched the Phase 4A prompt except for the missing `scorecards` insert policy, so a small RLS migration was added instead of altering table structure.

### What should happen next

- Manually test scorecard persistence for JavaScript, Python, and C++ submits using the new `TESTING.md` checklist.
- In a later phase, move hidden-test execution and richer grading to a server-side sandbox while keeping the deterministic helper as a baseline/fallback.
- Restore a working Graphify CLI in the development environment so the graph can be refreshed after structural changes.

## 2026-06-30 — Persistent timer across reloads and navigation

### What was completed

The practice and assessment timers now persist across page reloads, tab navigation, and returning to the same attempt. The timer only resets when the user submits their attempt, resets their draft, or (in assessment mode) abandons the session.

### How it works

A `localStorage` key `mockr:timer-epoch:{draftKey}` stores the wall-clock epoch (milliseconds) when the current attempt started. On component mount, the `useEffect` reads the saved epoch (or writes a new one if none exists). The interval derives elapsed seconds as `Date.now() - epoch`, so the timer resumes from the correct value after any reload or return visit.

The epoch key is cleared in four places:
1. **Submit** (`doNavigateToResults`) — attempt is done; next visit starts fresh.
2. **Reset draft** (`handleReset`) — writes a new epoch immediately so the timer restarts at 0.
3. **Assessment exit** (`handleAssessmentExit`) — abandoned session; re-entry starts fresh.
4. **Assessment re-entry after abandonment** (draft init `useState`) — clears any stale epoch.

The `draftKey` (`mockr:draft:{userId}:{questionId}:{mode}`) scopes the epoch to the same user + question + mode, so switching mode (practice ↔ assessment) correctly gives each a separate timer.

### Files changed

- `app/practice/[questionId]/practice-session.tsx` — added `epochKey` constant; timer `useEffect` reads/writes `localStorage`; `handleReset` clears and resets epoch; `doNavigateToResults` clears epoch on submit; `handleAssessmentExit` clears epoch; assessment abandoned-flag path clears epoch; `persist` callback no longer forces `timerSeconds: 0`.

### Limitations

- On first render after a reload, the timer briefly shows `0` for up to 1 second before the first interval tick corrects it to the true elapsed value. This is a consequence of the React linter rule banning synchronous `setState` inside `useEffect` bodies — the correction happens within one tick and is visually negligible.
- The epoch is stored in `localStorage` which can be cleared by the user. If cleared, the timer starts from 0 on next visit (same behaviour as a brand new attempt).
- Assessment mode's `beforeunload` handler sets the abandoned flag in `sessionStorage` but does not have time to clear the epoch key on hard tab-close — however, the abandoned-flag path clears the epoch on re-entry, so the timer still resets correctly.

### What should happen next

No further timer work needed for the MVP. Future: wire `time_taken_seconds` from the persisted epoch to the Supabase `attempts` table on submit (currently uses the in-memory `timerSeconds` state, which is already correct since the epoch gives the right elapsed at submit time).

## 2026-06-30 — "Start" button in question library scrolls to setup section

### What was completed

- Renamed "Start practice" → "Start" on each question card in the question library (`/questions`).
- "Start" now navigates to `/questions/[slug]#practice-setup` — the same question detail page as "View", but anchored directly to the mode/language/start setup section at the bottom.
- Added `id="practice-setup"` to the setup card in `question-detail-client.tsx` so the anchor has a stable target.
- "View" is unchanged and continues to navigate to `/questions/[slug]` (no anchor).

### Files changed

- `app/questions/question-library-client.tsx` — button label "Start practice" → "Start"; href `/practice/${q.id}` → `/questions/${q.slug}#practice-setup`
- `app/questions/[slug]/question-detail-client.tsx` — added `id="practice-setup"` to the setup card `<div>`

### Limitations

- Hash-based scroll relies on the browser's native anchor behaviour. On slower connections the page may finish painting before the scroll fires; this is standard browser behaviour and not specific to Next.js.
- The anchor scroll is instant (no smooth-scroll animation) unless the user has `scroll-behavior: smooth` set globally — the current `globals.css` sets `scroll-behavior: smooth`, so it will animate on supported browsers.

### What should happen next

No further work needed for this feature.

## 2026-06-30 — Editor, Timer, and Assessment Session Control

### What was completed

1. **Disabled all editor suggestions/hints** in both Practice and Assessment modes — squiggly error markers remain, but hover tooltips, autocomplete, parameter hints, lightbulb code actions, and code lens are all suppressed.
2. **Fixed the Practice Mode timer** — replaced a mode-gated `setInterval` (assessment-only) with a single stable interval using a start-epoch ref. Timer now runs in both modes, never drifts, never creates multiple intervals, and never resets on re-renders.
3. **Added Assessment Mode session control and attempt tracking** — leaving Assessment Mode via the in-app back button now shows a confirmation modal ("Leaving the interview?"). Confirming clears the draft and sets a `sessionStorage` flag. On re-entry, the flag is detected and the draft is discarded so the user must start fresh. Browser tab-close/reload triggers the native `beforeunload` prompt. Attempt count per question is tracked in `localStorage`.

### Files changed

- `components/code-editor.tsx` — Removed `disableSuggestions` prop (was conditional; now all options are always applied). Added `hover: {enabled:false}`, `lightbulb: {enabled: 'off'}`, `codeLens: false`. Typed the options object as `editor.IStandaloneEditorConstructionOptions` for type safety. Now a single interview-mode config shared by all editor instances.
- `app/practice/[questionId]/practice-session.tsx` — Multiple changes:
  - Added `useRef` import.
  - Added `isAssessment`, `abandonedKey`, `attemptCountKey` constants derived from props.
  - Draft initialisation now checks `sessionStorage` for the abandoned flag; clears draft if set.
  - Replaced `timerSeconds` init from draft (stale across page loads) with `useState(0)`.
  - Replaced the assessment-only timer `useEffect` with a single stable interval using `sessionStartRef` (epoch ref). Timer shows in **both** modes — blue for practice, red for assessment.
  - Draft persistence no longer saves `timerSeconds` (always saves 0) — timer is session-scoped.
  - Added assessment attempt count tracking in `localStorage` (`mockr:assessment:attempts:{userId}:{questionId}`).
  - Added `beforeunload` event listener for assessment mode (marks `sessionStorage` abandoned flag).
  - Added `showExitGuard` state and `handleAssessmentExit` function.
  - Top-bar "← Questions" link replaced with a button in assessment mode that opens the exit guard modal.
  - Added exit guard modal ("Leaving the interview?" with "Leave & abandon" / "Stay" buttons).
  - Removed `disableSuggestions` prop from `<CodeEditor>` usage.
  - `isPractice` now derives from `isAssessment` (same logic, cleaner).

### How editor behaviour now works

All Monaco editor instances use `INTERVIEW_OPTIONS` — a single shared constant typed as `IStandaloneEditorConstructionOptions`. Red squiggly underlines are preserved (diagnostics are unaffected). All IntelliSense surfaces are suppressed: `quickSuggestions: false`, `suggestOnTriggerCharacters: false`, `parameterHints: {enabled: false}`, `wordBasedSuggestions: 'off'`, `inlineSuggest: {enabled: false}`, `hover: {enabled: false}`, `lightbulb: {enabled: 'off'}`, `codeLens: false`.

### How the timer was fixed

Old approach: `setInterval` inside a `useEffect([initialMode])` — only ran in assessment mode, and `timerSeconds` was loaded from the persisted draft on page reload (wrong). New approach: `sessionStartRef.current = Date.now()` is set in a `useEffect([], [])` (once on mount). A single `setInterval` ticks every 1 second and sets `timerSeconds = floor((Date.now() - sessionStartRef.current) / 1000)`. No drift. No dependency on changing state inside the interval. Timer always starts at 0 on mount. Timer is shown in both modes.

### How Assessment Mode session control works

| Event | Behaviour |
|---|---|
| User clicks "← Questions" in assessment mode | Exit guard modal shown |
| Confirms exit | `sessionStorage.setItem(abandonedKey, "1")`, draft cleared, `router.push("/questions")` |
| Cancels exit | Modal dismissed, session continues |
| Browser tab close / reload | Native `beforeunload` prompt shown; `sessionStorage` flag set |
| Re-entering the question in assessment mode | Flag detected → draft discarded → fresh attempt |
| Assessment mode mount | Attempt count incremented in `localStorage` |

### Attempt tracking storage keys

- `mockr:assessment:abandoned:{questionId}` — `sessionStorage`, string `"1"` when abandoned
- `mockr:assessment:attempts:{userId}:{questionId}` — `localStorage`, integer count of starts

### Limitations

- The `beforeunload` flag is set before the browser confirms — if the user cancels the browser prompt and stays, the abandoned flag is already set. On page reload (cancel scenario), the next attempt will start fresh. This is conservative and intentional.
- Assessment exit guard only covers the in-app "← Questions" button. Other in-app `<Link>` components elsewhere (e.g. the MOCKR.AI logo) are not guarded — these don't exist in the current workspace top bar, so this is not a current issue.
- Attempt count increments on component mount; if the component mounts twice in strict mode dev, the count will be off by one in development only.
- No server-side attempt tracking — counts are localStorage only; clearing browser storage resets them.

### What should happen next

- Wire attempt tracking to Supabase `attempts` table (currently stored in localStorage only).
- Consider adding a visual attempt count badge on the question detail page.
- Phase 4B: server-side hidden test execution once a sandbox provider is chosen.

## 2026-06-29 — Agent Instruction Consolidation

### What was completed

Consolidated all agent instruction files into one canonical source (`AGENTS.md`) so Claude Code, Codex, and future agents follow identical rules.

### Files changed

- `AGENTS.md` — Rewritten as the single source of truth. Now contains: product identity, MVP scope, what is in/out of scope, mandatory orientation workflow (read-context-first + Graphify), documentation workflow, testing workflow (including available npm scripts), git rules, security/responsible-AI rules, implementation standards, large-task execution workflow, and scope constraints.
- `CLAUDE.md` — Reduced to a single `@AGENTS.md` pointer. Claude Code's `@` include syntax loads `AGENTS.md` automatically.
- `CODEX.md` — Reduced to a one-line redirect telling Codex to read `AGENTS.md`.
- `graphify-out/` — Updated via `graphify update .` (411 nodes, 497 edges, 25 communities).

### What was removed / consolidated

- Duplicate Graphify rules (appeared 3× across the three files, now appear once in `AGENTS.md`).
- Duplicate TESTING.md rules (appeared in both `AGENTS.md` and `CODEX.md`, now once).
- The `nextjs-agent-rules` HTML comment block (content preserved as plain prose under Implementation Standards).
- The `/graphify` skill invocation note moved to `AGENTS.md` Graphify section.
- All content from old `CLAUDE.md` beyond the `@AGENTS.md` pointer was either already in `AGENTS.md` or consolidated there.

### What was added (new content, not previously in any file)

- Product identity section (MVP direction, target audience, Australian students/grads context).
- Explicit in-scope / out-of-scope list.
- Git rules (never stage/commit/push — report only).
- Security and responsible-AI rules.
- Large-task execution workflow (phase-by-phase with user approval gates).
- Explicit note that `npm run build` covers TypeScript checking (no separate typecheck script).

### Limitations

- `.claude/settings.json` and `.codex/hooks.json` are tool-specific hook configs and remain unchanged — they enforce the Graphify-before-grep rule at the tool level and do not need to live in `AGENTS.md`.
- `CODEX.md` uses plain-prose redirect (not a `@` include) because Codex does not support `@file` syntax.

### Issues encountered

- `npx graphify update .` failed with "could not determine executable to run" — the global `graphify` CLI was used instead and succeeded.

### What should happen next

No further instruction-file work needed. Next task should be a product feature (Phase 4B hidden test execution, or whatever the user requests next).

---

## Graphify Workflow

This project uses [Graphify](https://github.com/graphifyy/graphifyy) as a shared knowledge graph so Claude Code, Codex, and human collaborators can understand the codebase before making changes.

**Output location:** `.graphify/` — commit core graph artifacts such as `graph.json`, `GRAPH_REPORT.md`, `manifest.json`, and `scope.json`. Do not commit `.graphify/cache/`, `.graphify/cost.json`, or generated assistant instruction folders.

**Visualiser:** Use the installed Graphify CLI (`npx graphify studio`, `npx graphify export`, or related commands) when a visual export is needed.

### Session loop

1. `git pull`
2. Read `documentation.md` and `.graphify/GRAPH_REPORT.md`
3. Query the graph before touching code:
   ```bash
   npx graphify query "What files are relevant to this task?"
   npx graphify query "What components, routes, and utilities may be affected?"
   ```
4. Make focused changes.
5. Update `documentation.md`.
6. Update the graph: `npx graphify update --no-description --no-label .`
7. Commit code, docs, and graph together.

### Rules

- Query graphify before editing; update graphify after meaningful changes.
- Do not add real code execution, hidden tests, Drawing canvas, voice/video, or AI scoring until those features are scoped.
- Keep Drawing as a sidebar placeholder only.

## 2026-06-28 — Coding Workspace UI

### Files Changed

- `components/code-editor.tsx` — Updated to accept a `language` prop so Monaco switches language mode dynamically. Changed editor height from a fixed `500px` to `100%` so it fills the workspace pane. Removed the outer wrapper div to allow the parent flex container to control layout.
- `app/practice/demo/practice-workspace.tsx` — Full rewrite. Replaced the simple editor+problem layout with a full-screen dark coding workspace: narrow left sidebar, split editor/output panes, top toolbar, and bottom status bar.
- `app/practice/demo/page.tsx` — Unchanged. Auth gate and server component remain as-is.

### Purpose

Builds the visual foundation for MOCKR.AI's coding practice workspace at `/practice/demo`. The screen matches a CoderPad/Replit-style interview room: dark theme, Monaco editor, split output panel, language selector, and a bottom bar with interview participant placeholders.

### Languages Supported (editor UI only)

JavaScript, TypeScript, Python, Java, C++, C#, Go, Ruby. Each language has a starter function template and a coloured badge in the sidebar. Changing language updates the Monaco language mode, the editor content, the sidebar badge, and the toolbar status text.

### UI-Only — No Execution

This implementation is intentionally frontend-only. The Run button writes fake demo output to the output panel. No code is evaluated, no backend routes are called, and no external execution service is connected.

### Current Limitations

- The divider between editor and output panes is visual only — it is not draggable yet.
- The Drawing sidebar item is a placeholder; no canvas or whiteboard is implemented.
- Start Call, What's New, and Feedback in the bottom bar are visual only.
- Settings has no functionality yet.
- No question content is shown — this screen is a blank workspace shell.

### Not Yet Implemented (future additions)

- Real code execution (Judge0, Piston, Web Worker, or similar)
- Public and hidden test cases
- Edge-case evaluation and grading
- AI interviewer and structured feedback
- Attempt storage in Supabase
- Voice/video call integration
- Drawing canvas / whiteboard (Excalidraw or similar)
- Draggable pane splitter
- Dashboard integration / attempt history

### Suggested Next Steps (superseded by Phase 1)

1. Wire the Run button to a real execution service (Judge0 or Piston) behind a Next.js API route.
2. Add a question model to Supabase and render question description alongside the editor.
3. Replace fake output with actual test-case results and a pass/fail indicator.
4. Implement the AI Assist panel using the Claude API for hints and complexity discussion.

## 2026-06-28 16:12:00 AEST

- Added shared UI primitives in [components/site-header.tsx](/Users/shahaidrr/Documents/mockr/components/site-header.tsx), [components/feature-card.tsx](/Users/shahaidrr/Documents/mockr/components/feature-card.tsx), [components/stat-card.tsx](/Users/shahaidrr/Documents/mockr/components/stat-card.tsx), and [components/dashboard-card.tsx](/Users/shahaidrr/Documents/mockr/components/dashboard-card.tsx).
- Introduced a consistent card system with rounded corners, subtle borders, and restrained shadows so the landing page, authentication flow, and dashboard can share one visual language instead of duplicating styling patterns.
- Kept the components intentionally narrow in scope. Each component accepts simple typed props and avoids premature abstraction, which makes the MVP easier to extend without locking the project into an over-engineered design system too early.

## 2026-06-28 16:14:00 AEST

- Updated [app/layout.tsx](/Users/shahaidrr/Documents/mockr/app/layout.tsx) metadata so the application presents itself as MOCKR.AI rather than the default Next.js starter, and added a reusable title template for future route-specific metadata.
- Refined [app/globals.css](/Users/shahaidrr/Documents/mockr/app/globals.css) into a light product foundation with a softer slate-and-blue palette, global box-sizing, smoother scrolling, and a restrained background gradient that supports the requested SaaS/student aesthetic.
- Added the `.surface-grid` utility for subtle patterned sections. This keeps decorative treatment centralized in global CSS instead of scattering repeated background definitions across page components.

## 2026-06-28 16:18:00 AEST

- Replaced the default homepage in [app/page.tsx](/Users/shahaidrr/Documents/mockr/app/page.tsx) with a dedicated MOCKR.AI landing experience built in [components/landing-page.tsx](/Users/shahaidrr/Documents/mockr/components/landing-page.tsx).
- Structured the landing page into clearly separated product sections: header, hero, positioning chips, feature grid, process steps, future roadmap, dashboard preview, final CTA, and footer. This keeps the MVP marketing surface coherent while making future content changes low-risk.
- Updated [app/landingPage/page.tsx](/Users/shahaidrr/Documents/mockr/app/landingPage/page.tsx) to reuse the same landing component. Reusing the component prevents the legacy route from becoming visually stale or semantically inconsistent with the real homepage.

## 2026-06-28 16:22:00 AEST

- Rebuilt [app/login/page.tsx](/Users/shahaidrr/Documents/mockr/app/login/page.tsx) into a two-column authentication layout that explains product value while keeping the actual auth interaction compact and usable.
- Preserved the existing Supabase email/password flow but moved `createClient()` into the submit handler. This reduces render-time coupling and makes the route more resilient when configuration is incomplete during server-side rendering.
- Added explicit in-code guidance for future provider-based auth so another developer can wire Google login through the existing Supabase client utilities rather than introducing redundant auth clients or ad hoc helpers.

## 2026-06-28 16:26:00 AEST

- Reworked [app/dashboard/page.tsx](/Users/shahaidrr/Documents/mockr/app/dashboard/page.tsx) into a structured dashboard with hero copy, stat cards, recent attempts, score breakdowns, weakness tracking, a recommended next step, and a visible product roadmap area.
- Kept the existing server-side auth gate in place because the current Supabase pattern in the repository is clear enough to protect the route without introducing speculative auth abstractions.
- Added explicit documentation in the code that the current dashboard content is demo data and should later be replaced by stored Supabase attempt and scorecard records once the practice flow persists real submissions.

## 2026-06-28 16:31:00 AEST

- Updated [app/practice/demo/practice-workspace.tsx](/Users/shahaidrr/Documents/mockr/app/practice/demo/practice-workspace.tsx) to use lazy state initialization for draft restoration instead of synchronous `setState` calls inside effects.
- Moved the “Saving...” transition into an explicit code-change handler. This aligns the component with React’s current guidance and removes the repository lint violations without altering the user-facing demo workflow.

## 2026-06-28 16:36:00 AEST

- Removed the remote Google font dependency from [app/layout.tsx](/Users/shahaidrr/Documents/mockr/app/layout.tsx) so local and restricted-network builds do not depend on external font fetches.
- Updated [app/globals.css](/Users/shahaidrr/Documents/mockr/app/globals.css) to provide a deliberate local font stack through Tailwind theme variables, preserving a polished product feel while making builds deterministic in offline or sandboxed environments.

## 2026-06-28 16:29:21 AEST

- Added [lib/supabase/config.ts](/Users/shahaidrr/Documents/mockr/lib/supabase/config.ts) to centralize public Supabase configuration lookup and validation across browser, server, and proxy code paths.
- Updated [lib/supabase/client.ts](/Users/shahaidrr/Documents/mockr/lib/supabase/client.ts), [lib/supabase/server.ts](/Users/shahaidrr/Documents/mockr/lib/supabase/server.ts), and [lib/supabase/proxy.ts](/Users/shahaidrr/Documents/mockr/lib/supabase/proxy.ts) to consume the shared config helper rather than duplicating environment reads.
- Added support for both `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and introduced explicit validation for malformed keys so configuration mistakes produce actionable errors instead of ambiguous authentication failures.

## 2026-06-28 16:33:00 AEST

- Traced the login failure to a malformed production Supabase publishable key outside the codebase and added validation in the shared config helper so similar mistakes are surfaced immediately with a precise configuration error.
- Preserved backward compatibility with both Supabase public key naming conventions to reduce coupling between deployment configuration drift and the application auth flow.

## 2026-06-28 16:36:47 AEST

- Added [app/auth/callback/route.ts](/Users/shahaidrr/Documents/mockr/app/auth/callback/route.ts) to handle Supabase email confirmation callbacks by exchanging the returned auth code for a session and redirecting the user into the app.
- Updated [app/login/page.tsx](/Users/shahaidrr/Documents/mockr/app/login/page.tsx) so signup now passes an explicit `emailRedirectTo` based on `window.location.origin` instead of relying on a stale default site URL that pointed to localhost.
- Surfaced callback errors back onto the login route via query parameters so broken confirmation flows fail visibly and are easier to diagnose during future auth work.

## 2026-06-28 16:40:00 AEST

- Increased button contrast across the shared header, landing page secondary CTAs, and dashboard logout action by darkening text and slightly deepening the pale button backgrounds.
- Focused the changes on reused button patterns in [components/site-header.tsx](/Users/shahaidrr/Documents/mockr/components/site-header.tsx), [components/landing-page.tsx](/Users/shahaidrr/Documents/mockr/components/landing-page.tsx), and [app/dashboard/page.tsx](/Users/shahaidrr/Documents/mockr/app/dashboard/page.tsx) so the contrast fix stays consistent instead of becoming page-specific drift.

## 2026-06-28 16:44:00 AEST

- Refined the dark primary CTA treatment across [components/site-header.tsx](/Users/shahaidrr/Documents/mockr/components/site-header.tsx), [components/landing-page.tsx](/Users/shahaidrr/Documents/mockr/components/landing-page.tsx), [app/dashboard/page.tsx](/Users/shahaidrr/Documents/mockr/app/dashboard/page.tsx), and [app/login/page.tsx](/Users/shahaidrr/Documents/mockr/app/login/page.tsx) by moving to a deeper background, softer high-contrast text tone, and a subtle inset highlight.
- Applied the same primary-button recipe everywhere it was reused so the contrast correction covers other dark CTA instances instead of only the two buttons you called out.

## Phase 1 — Database-backed Question Library and Practice Workspace

### Overview

Phase 1 wires the app to real Supabase question data and builds the full practice session flow. The `/practice/demo` sandbox remains untouched.

**Real MVP practice starts at `/questions`.**

### New Routes

| Route | Type | Description |
|---|---|---|
| `/questions` | Server + Client | Question Library — fetch and browse published questions |
| `/questions/[slug]` | Server + Client | Question Detail — problem statement, mode and language selection |
| `/practice/[questionId]` | Server (auth) + Client | Practice Workspace — 7-step stepper with Monaco editor |
| `/results/[attemptId]` | Client | Results Placeholder — local-only submission confirmation |

### Files Created

- `types/question.ts` — Question, QuestionTestCase, QuestionSummary, Difficulty, SupportedLanguage types
- `types/attempt.ts` — AttemptMode, AttemptStatus, ResultBand types
- `types/practice.ts` — PracticeMode, PracticeStage, SupportedLanguage, PracticeDraft types
- `lib/questions-service.ts` — Server-side Supabase helpers: fetchPublishedQuestions, fetchQuestionBySlug, fetchQuestionById, fetchPublicTestCases
- `lib/practice-draft.ts` — localStorage helpers: buildDraftKey, loadDraft, saveDraft, clearDraft, buildEmptyDraft
- `app/questions/page.tsx` — Server component: fetches published questions
- `app/questions/question-library-client.tsx` — Client: card grid, random question button
- `app/questions/[slug]/page.tsx` — Server component: fetches question by slug
- `app/questions/[slug]/question-detail-client.tsx` — Client: mode/language selectors, start practice button
- `app/practice/[questionId]/page.tsx` — Server: auth gate, fetch question by ID
- `app/practice/[questionId]/practice-session.tsx` — Client: full 7-step stepper with Monaco
- `app/results/[attemptId]/page.tsx` — Client: placeholder results page
- `supabase/migrations/001_question_practice_foundation_clean.sql` — Full schema with RLS policies
- `supabase/seed/002_seed_questions.sql` — 7 published questions + 21 public test cases

### Files Modified

- `app/dashboard/page.tsx` — Updated "Start new practice" CTA to `/questions`, added "Browse questions" link

### Supabase Table Assumptions

The app reads from these tables (already created and seeded in production Supabase):

- `public.questions` — use `problem_statement`, NOT `prompt` (old broken column). Filter by `status = 'published'`.
- `public.question_test_cases` — public test cases via `is_hidden = false`. Not executed in Phase 1.
- `public.attempts` — not written in Phase 1. Submissions are local-only.
- `public.attempt_events`, `public.code_snapshots`, `public.test_runs`, `public.scorecards` — created but unused in Phase 1.

### Seeded Questions (7 published)

| Slug | Title | Topic | Difficulty | Est. Time |
|---|---|---|---|---|
| find-matching-pair | Find Matching Pair | Hash maps | easy | 15 min |
| compress-repeated-characters | Compress Repeated Characters | Strings | easy | 15 min |
| longest-unique-segment | Longest Unique Segment | Sliding window | medium | 25 min |
| balanced-brackets | Balanced Brackets | Stacks | easy | 15 min |
| count-connected-rooms | Count Connected Rooms | DFS/BFS | medium | 30 min |
| sum-pair-exists | Sum Pair Exists | Arrays and hash maps | easy | 15 min |
| sum-nodes-in-binary-tree | Sum Nodes in Binary Tree | Trees and recursion | easy | 20 min |

Each question has 3 public test cases (`is_hidden = false`). No hidden tests exist in Phase 1.

### Practice Workspace Layout (integrated coding environment)

`/practice/[questionId]` is one full-screen coding workspace — not a multi-page stepper.

**Left column (40%)**
- Top-left (~2/3): Problem panel — always visible and scrollable. Shows title, topic, difficulty, estimated time, problem statement, input/output descriptions, constraints, and examples. Example values are formatted with `JSON.stringify` so they never display as `[object Object]`.
- Bottom-left (~1/3): Interview panel — cycles through 5 embedded stages with ‹ prev / next › arrows and `Stage N of 5` progress text. Changing this panel does not change the rest of the screen.
  1. Clarification
  2. Approach
  3. Testing & Edge Cases
  4. Complexity
  5. Submit Review (checklist + submit button)

**Right column (60%)**
- Top-right (~2/3): Monaco editor — always visible. Loads starter code from `questions.starter_code[language]`. Language switcher tabs at top. Run button is disabled and labelled "Phase 2".
- Bottom-right (~1/3): Output panel — static placeholder. No execution, no fake results.

Drafts persist in localStorage per `userId:questionId:mode`. Drafts restore on refresh. Reset Draft clears the draft and restores starter code.

### Phase 1 Limitations

- No code execution — Run button is disabled and labelled "Phase 2"
- No AI feedback or scoring
- No attempt persistence — submissions create a `local-{timestamp}` ID only
- No hidden tests — all 21 test cases are public but not executed
- No dashboard attempt history from Supabase — dashboard stats remain demo/placeholder data
- `/practice/demo` remains an untouched sandbox

### Phases Roadmap

- **Phase 2** — ✅ Complete. Browser-based JavaScript public test execution (Web Worker). See Phase 2 section below.
- **Phase 3** — Attempt persistence: write attempts and code snapshots to Supabase.
- **Phase 4+** — Deterministic scoring, hidden tests, AI scorecard (Claude API), dashboard attempt history, voice/video.

---

## Phase 2 — JavaScript Public Test Execution

### Date

2026-06-29

### Files Changed

- `types/question.ts` — Added `function_name: string` to `Question`. Narrowed `QuestionTestCase.input` from `unknown` to `{ args: unknown[] }` to match live Supabase shape.
- `app/practice/[questionId]/page.tsx` — Now fetches public test cases (`fetchPublicTestCases`) alongside the question in parallel, then passes both to `PracticeSession`.
- `app/practice/[questionId]/practice-session.tsx` — Major update. Accepts `testCases` and uses `question.function_name`. Run button is now active for JavaScript. Includes full output panel with per-test pass/fail results. Submit runs tests one final time for JavaScript before navigating to the results page.
- `app/results/[attemptId]/page.tsx` — Minor: updated Phase 2 notice, removed "JavaScript public test execution" from coming-soon list.

### Files Created

- `types/test-run.ts` — `PublicTestRunStatus`, `PublicTestRunResult`, `PublicTestRunSummary` types.
- `lib/public-test-runner.ts` — Browser Web Worker runner. Embeds worker code as a Blob URL to avoid Next.js static-file complexity. Enforces a 2-second timeout. Shadows `fetch`, `XMLHttpRequest`, `importScripts`, `localStorage`, `sessionStorage` in the worker context.

### Supabase Readiness

Verified live against `trjpmxltquzritqtdkmv` (ap-southeast-2):

- 7 published questions, each with exactly 6 public test cases (42 total public test cases)
- 0 hidden test cases
- `questions.function_name` is a non-nullable `text` column — present on all 7 questions
- `question_test_cases.input` is `jsonb` with shape `{ args: [...] }` — confirmed executable
- `question_test_cases.expected_output` is `jsonb` — confirmed usable for deep equality

No stop conditions were triggered. Implementation proceeded.

### Live Supabase Shape Used

```ts
// questions
function_name: string  // e.g. "balancedBrackets"

// question_test_cases
input: { args: unknown[] }           // e.g. { args: ["()[]{}"] }
expected_output: unknown              // e.g. true
is_hidden: boolean                    // always false for public tests
```

### How Public Test Cases Are Fetched

`fetchPublicTestCases(questionId)` in `lib/questions-service.ts` (unchanged). Queries `public.question_test_cases` with `.eq("question_id", questionId).eq("is_hidden", false)`. Called server-side in `app/practice/[questionId]/page.tsx` in parallel with `fetchQuestionById`. Passed as a prop to `PracticeSession`. Hidden tests are never fetched or sent to the browser.

### How JavaScript Execution Works

`runPublicTests(code, functionName, testCases)` in `lib/public-test-runner.ts`:

1. Builds a Blob URL from the embedded worker source string.
2. Spawns a `new Worker(blobUrl)`.
3. Posts `{ code, functionName, testCases }` to the worker.
4. Worker runs `new Function(code + '; return ' + functionName + ';')()` to extract the candidate function.
5. Calls `candidateFn(...testCase.input.args)` for each test case.
6. Compares actual vs expected using recursive `deepEqual` (supports arrays, objects, primitives, null).
7. Posts `{ results }` back to the main thread.

### How Web Worker Timeout Works

A `setTimeout` of 2000ms races the worker's `onmessage`. Whichever fires first wins (guarded by a `settled` flag). On timeout:
- `worker.terminate()` is called immediately — UI does not freeze.
- `URL.revokeObjectURL` releases the Blob URL.
- All test cases are marked `"timeout"` with the message: "Execution timed out after 2 seconds. Check for an infinite loop or an inefficient solution."
- The user can edit and run again.

### How Output Is Displayed

The output panel (bottom-right, `flex-[1]`) shows:
- Summary: "N passed / M failed of X public tests" badges
- One collapsible row per test case showing status badge, label, runtime
- On expand: input args, expected output, actual output (red if failed), error or timeout message

Status values: `"passed"` (green) | `"failed"` (red) | `"error"` (amber) | `"timeout"` (purple).
Values are formatted with `JSON.stringify` — never displays `[object Object]`.

### Submit Behaviour

- **JavaScript selected:** `handleSubmit` calls `runPublicTests` one final time, waits for completion, updates the output panel with results, then navigates to `/results/local-{timestamp}?questionId=...`.
- **Other language selected:** navigates directly to the results page without running tests.
- No data is written to Supabase in either case.
- No attempt record, scorecard, or AI feedback is created.

### `/practice/demo` Status

Untouched. The demo sandbox at `/practice/demo` was not modified in this phase.

### Confirmations

- Only public tests (`is_hidden = false`) are fetched and run.
- Hidden tests are never fetched, never sent to the browser, never executed.
- No attempts are written to `public.attempts`, `public.attempt_events`, `public.code_snapshots`, `public.test_runs`, or `public.scorecards`.
- No AI feedback or scoring is implemented.
- No fake scores are introduced.

### Security Boundary

This is an MVP browser runner using a Web Worker and a 2-second timeout. It is appropriate for PUBLIC test cases only during practice sessions. It is NOT a production-grade secure sandbox. It is not appropriate for hidden tests or high-stakes assessment. Candidate code runs in the browser, never on the server. Shadowed globals (`fetch`, `XMLHttpRequest`, `importScripts`, `localStorage`, `sessionStorage`) reduce accidental side-effects but do not constitute a hardened sandbox.

### Current Limitations (Phase 2 initial)

- JavaScript execution only — Python and C++ were editor-only.
- Public tests only — no hidden test execution.
- No attempt persistence — submissions remain `local-{timestamp}` only.
- No saved test run history.
- No scorecards or AI feedback.
- No dashboard attempt history from Supabase.
- No custom user-defined test input.
- Browser Web Worker is suitable for MVP validation only.
- Deep equality uses `Object.keys` order — sufficient for these questions but not a fully spec-compliant comparison.

### Recommended Next Steps (post Phase 2)

- **Phase 3:** Write attempts and code snapshots to `public.attempts` and `public.code_snapshots` in Supabase.
- **Phase 4:** Add deterministic scoring and hidden test execution (requires server-side sandbox — Judge0, Piston, or a properly isolated backend).
- **Phase 4:** AI scorecard using Claude API against rubric notes.
- **Future:** C++ execution via a server-side compiler (requires type-aware wrapper generation).
- **Future:** Dashboard attempt history pulling from Supabase.
- **Future:** Draggable output panel splitter.

---

## Phase 2 Polish — Multi-Language Public Test Execution

### Date

2026-06-29

### What Changed

Polished Phase 2 to extend browser-based public test execution beyond JavaScript, improve submit UX with a failure warning, and add a local test summary on the results page.

### Files Changed

- `lib/public-test-runner.ts` — Refactored from a single-language function `runPublicTests(code, fn, cases)` to a unified `runPublicTests({ language, code, functionName, testCases })`. Extracted a shared `spawnWorker()` helper. Added `PYTHON_WORKER_SOURCE` (Pyodide-based). Added immediate `"error"` return for C++.
- `app/practice/[questionId]/practice-session.tsx` — Added Python to executable languages (`isExecutable`). Enabled Run button for Python. Updated output panel with Python-specific loading message. Added submit warning modal (X + "Submit anyway") when tests fail. Added `doNavigateToResults()` which stores a local summary in `sessionStorage` before navigating. Updated submit panel text per language.
- `app/results/[attemptId]/page.tsx` — Reads `mockr_last_result` from `sessionStorage` on mount (lazy `useState` initialiser). Shows "Public Test Results" summary card: question title, language, passed/failed/total counts. Clears key after reading.

### Python Execution Method

Python public tests run entirely in the browser using **Pyodide v0.26.0** loaded from `cdn.jsdelivr.net` inside a Web Worker:

1. `importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.0/full/pyodide.js")` — synchronous CDN fetch (browser-cached after first load).
2. `loadPyodide()` — async WASM init.
3. User code is executed via `pyodide.runPython(code)`.
4. `pyodide.globals.get(functionName)` retrieves the candidate function.
5. For each test case: `pyodide.toPy(arg)` converts JS inputs → Python; result is converted back via `.toJs({ dict_converter: Object.fromEntries })`.
6. Deep equality via the same recursive `deepEqual` used for JavaScript.

Timeout: **30 seconds** (to allow Pyodide CDN load on first use). Subsequent runs use the browser HTTP cache and complete in seconds.

### C++ Execution Status

**Not implemented in Phase 2 Polish.** C++ requires a server-side compiler (no safe, free browser-based C++ runtime exists for this use case). The Run button is disabled for C++ with the message "C++ execution is coming later." Submit records a local attempt without running tests.

### Submit Warning Behaviour

- When the user clicks Submit and tests have not been run, tests run first.
- If any result is `failed`, `error`, or the run `timedOut`, a modal appears: *"Some public tests are not passing. You can still submit, but your result summary will show the failures."*
- Modal has an X (dismiss) and "Submit anyway" button.
- If all tests pass, navigation happens immediately with no modal.
- C++ always submits directly (no test run).

### Results Page Local Summary

After submit, `sessionStorage["mockr_last_result"]` stores `{ questionTitle, questionId, language, summary }`. The results page reads and clears this on mount. It displays a "Public Test Results" card with passed/failed/total counts and a "Local Phase 2 result — not saved to the database." note. If no summary is available (C++, or sessionStorage unavailable), the card is omitted and the page still renders cleanly.

### Security Boundary

- Candidate code never runs on the server.
- JavaScript: same Web Worker sandbox as Phase 2 original (2 s timeout, shadowed globals).
- Python: Pyodide WASM sandbox inside a Web Worker (30 s timeout). No network access from candidate Python code (Pyodide's default).
- Only public test cases (`is_hidden = false`) are fetched server-side and passed to the client. Hidden tests are never fetched or sent to the browser.
- No data is written to Supabase during any Phase 2 flow.
- No API keys or environment variables are required for Phase 2 Polish.

### Confirmations

- Only public tests (`is_hidden = false`) are fetched and run.
- Hidden tests are never fetched, never sent to the browser, never executed.
- No attempts are written to `public.attempts`, `public.attempt_events`, `public.code_snapshots`, `public.test_runs`, or `public.scorecards`.
- No AI feedback or scoring.
- No fake scores or fake execution results.
- `/practice/demo` was not modified.
- Phase 3 has not started.

### Current Limitations (Phase 2 Polish)

- Python Pyodide first-load is 10–30 seconds on a cold browser cache; subsequent loads are fast.
- C++ is editor-only — no execution in Phase 2.
- Public tests only — no hidden test execution.
- No attempt persistence — `local-{timestamp}` IDs only, results not saved to Supabase.
- No custom user-defined test input.
- Pyodide version pinned to `v0.26.0` — update `PYTHON_WORKER_SOURCE` URL in `lib/public-test-runner.ts` to upgrade.
- Deep equality for Python uses the same `Object.keys`-order comparison as JavaScript — adequate for current questions.

### Recommended Next Steps

- **Phase 3:** Write attempts and code snapshots to `public.attempts` and `public.code_snapshots` in Supabase.
- **Phase 4:** Hidden test execution via a server-side sandbox (Judge0, Piston self-hosted, or equivalent).
- **Phase 4:** AI scorecard using Claude API.
- **Future:** C++ execution via a server-side compiler with type-aware wrapper generation.
- **Future:** Dashboard attempt history from Supabase.
- **Future:** Draggable output panel splitter.

### Phase 2 Polish Test Report / Issues and Concerns

#### Commands run

```
npm run lint       → ✅ 0 errors (1 initial error fixed: setState-in-effect rule in results page)
npx tsc --noEmit   → ✅ 0 type errors (pre-existing baseUrl deprecation warning only; not caused by these changes)
```

#### Manual checks performed

- Reviewed all changed files for correct TypeScript types and React patterns.
- Confirmed `runPublicTests` signature change propagated to all call sites in `practice-session.tsx`.
- Confirmed `isJavaScript` removed and replaced with `isExecutable` throughout.
- Confirmed submit warning modal appears only for failed/timedOut results.
- Confirmed `doNavigateToResults` writes to sessionStorage before navigation.
- Confirmed results page reads and clears sessionStorage without causing cascading re-renders.

#### Tests that could not be performed

- **Python Pyodide execution end-to-end**: requires a running browser with CDN access. Cannot be verified in this session. The worker source is written to spec; functional verification must be done manually.
- **C++ disabled state**: cannot open a browser in this session; verify by selecting C++ in the practice workspace.
- **Submit warning modal appearance**: requires manual browser test.
- **Results page summary card**: requires navigating through a complete submit flow.

#### Known risks and concerns

- **Pyodide CDN dependency**: if `cdn.jsdelivr.net/pyodide/v0.26.0/full/pyodide.js` is unavailable or the version has been removed, Python execution fails with an error result (not a crash). No fallback CDN is configured.
- **Pyodide 30-second timeout**: on very slow connections, Pyodide may not finish loading in 30 seconds. The user would see all tests as "timeout". They can click Run again (browser cache will be populated if the download completed).
- **`fn.apply(null, pyArgs)` on PyProxy**: Pyodide v0.26 documents that callable PyProxies support `apply`. If this breaks in a future Pyodide version, the catch block returns "error" results for all tests.
- **Python `dict` return values**: `result.toJs({ dict_converter: Object.fromEntries })` converts Python dicts to JS objects. If a question expects a Python dict as output, deep equality against the expected JSON value should work correctly.
- **sessionStorage unavailability**: if sessionStorage is blocked (e.g. strict private browsing), the results page shows without the summary card — it does not crash.

#### Environment variables required

None. Phase 2 Polish uses only browser-native APIs (Web Workers, Blob URLs, sessionStorage) and a public CDN (jsdelivr.net). No API keys, no server-side execution.

#### Graphify

Updated after Phase 2 Polish changes by running `graphify update .`.

---

## UI/UX Redesign — Sign-Up Page, Auth Polish, and Full MVP Flow

### Date

2026-06-29

### Summary

Dedicated sign-up page created. Login page converted to login-only. Full UI/UX pass across the MVP flow: landing page, question library, question detail, practice workspace, results page, and dashboard.

### Files Created

- `app/signup/page.tsx` — Dedicated sign-up page. Two-column layout matching `/login`. Uses `supabase.auth.signUp()` with the existing `emailRedirectTo` callback pattern. Includes email, password, and confirm-password fields with client-side validation. Translates Supabase error strings into user-friendly copy. Shows a post-signup success state with email address and a link to log in.

### Files Changed

- `app/login/page.tsx` — Converted to login-only. Removed the `mode` toggle, signup branch, disabled Google button, and developer-note explanation text. Added a "New to MOCKR.AI? Create an account" link to `/signup`. Moved `?message=` param reading to a lazy `useState` initialiser using `useSearchParams()` to avoid the setState-in-effect lint rule. Friendly Supabase error translation added.
- `app/page.tsx` — Unauthenticated `ctaHref` changed from `/login` to `/signup`.
- `components/landing-page.tsx` — Nav updated: "Dashboard" replaced with "Questions". Header primary CTA label changed to "Sign up free". Hero secondary CTA changed from "See how it works" to "Log in". Bottom CTA "Start practising" relabelled "Create free account". Footer updated: "Dashboard" replaced with "Questions", "Sign up" link added alongside "Log in". Dashboard preview "Open dashboard" button replaced with context-aware "Get started".
- `app/questions/question-library-client.tsx` — Card typography hierarchy improved: topic label uppercased and muted, estimated-time icon added, meta row separated by a top border, empty-state copy made more actionable, card hover border added.
- `app/questions/[slug]/question-detail-client.tsx` — Back link styled as a pill button. `String(ex.input/output)` replaced with `JSON.stringify` for object values (prevents `[object Object]`). "Start Practising" section heading capitalisation fixed. CTA button relabelled "Start practice" with a chevron icon.
- `app/practice/[questionId]/practice-session.tsx` — Stage progress label changed from "Clarification 1 of 5" to "Stage 1 of 5 · Clarification" for clarity. Interview panel prompt text colour lifted from `#6b7280` to `#8b9ab0` for better readability on the dark background. Placeholder hint text added to all four textarea panels (Clarification, Approach, Testing, Complexity). Problem panel Input/Output/Constraints sections grouped into a styled card with improved text contrast (`#b0bcc9`).
- `app/results/[attemptId]/page.tsx` — Heading changed from "Attempt submitted" to "Attempt recorded". Body copy updated. "Coming in future phases" list items rewritten to be more specific. Bullet icons changed from raw `○` characters to a proper SVG circle icon.
- `app/dashboard/page.tsx` — Sample data notice banner added above the stats section to make clear the current dashboard shows placeholder data pending Phase 3 Supabase integration.

### Auth Behaviour — Unchanged

- Supabase `signUp()` and `signInWithPassword()` calls are identical to before.
- `/auth/callback/route.ts` is unchanged.
- Protected route redirects are unchanged.
- No new auth providers, OAuth buttons, or Supabase schema changes were introduced.

### Known Limitations

- `/signup` uses email + password only. No confirm-email flow in the UI beyond the post-signup message (Supabase handles delivery). Profile creation is not wired — no `profiles` table insert on signup.
- Dashboard placeholder amber notice and sample data removed in Phase 3 (see below).

### Recommended Next Steps (superseded by Phase 3 below)

- Consider adding a `?next=` redirect parameter to the sign-up flow so users landing on `/signup` from a protected route return to the right place after confirming their email.

---

## Landing Header Fix + Phase 3 — Attempt Persistence

### Date

2026-06-29

### Summary

Fixed the landing page header to show context-aware CTAs for logged-in vs logged-out users. Implemented Phase 3 attempt persistence: submitted practice sessions now write to `public.attempts`, `public.code_snapshots`, and `public.test_runs` in Supabase. Results page fetches the saved attempt. Dashboard shows real attempt history.

### Landing Header Fix

- `components/landing-page.tsx` — Added `isLoggedIn` prop. Logged-in users now see "Browse questions" (primary) and "Dashboard" (secondary) in the header instead of "Sign up free" / "Log in".
- `app/page.tsx` — Passes `isLoggedIn` to `LandingPage`.

### Phase 3 Files Created

- `lib/attempts-service.ts` — Browser-side Supabase client helpers:
  - `submitAttempt()` — inserts into `public.attempts`, `public.code_snapshots`, and `public.test_runs` in sequence. Returns the saved attempt UUID. Code snapshot and test run failures are non-fatal (logged to console, attempt ID still returned).
  - `fetchAttemptById()` — fetches a single attempt with joined question title/slug for the results page.
  - `fetchRecentAttempts()` — fetches the most recent N submitted attempts for a user (used reference; dashboard uses server-side query instead).

### Phase 3 Files Changed

- `app/practice/[questionId]/practice-session.tsx` — `doNavigateToResults` now calls `submitAttempt()` before navigating. On success, navigates to `/results/{uuid}`. On failure, falls back to `local-{timestamp}` with sessionStorage. Added `startedAt` state (captured on mount), `isSaving` state, and "Saving…" button label. Submit and "Submit anyway" buttons disabled during save.
- `app/results/[attemptId]/page.tsx` — Full rewrite. For UUID attempt IDs: fetches from Supabase via `fetchAttemptById`, shows attempt metadata (question, language, mode, time taken), loading spinner while fetching. For `local-` fallback IDs: reads sessionStorage as before. Both paths show the coming-soon list and action buttons.
- `app/dashboard/page.tsx` — Full rewrite. Server-side fetches `public.attempts` joined with `public.questions`. When attempts exist: shows real stat cards (unique questions, total submissions, top topic, preferred language), real attempt history table with links to result pages, topic breakdown bar chart. When no attempts: shows empty state with "Browse questions" CTA. Placeholder demo data removed. Coming-soon section retained.

### Supabase Tables Written

| Table | When | What |
|---|---|---|
| `public.attempts` | On submit | user_id, question_id, mode, language, status="submitted", all draft fields, started_at, submitted_at, time_taken_seconds |
| `public.code_snapshots` | On submit | attempt_id, language, source_code (final code), stage="submit" |
| `public.test_runs` | On submit (JS/Python only) | attempt_id, code_snapshot_id, question_test_case_id, passed, actual_output, expected_output, execution_time_ms, error_message |

### RLS Verified

- `attempts`: INSERT `with_check (auth.uid() = user_id)`, SELECT `using (auth.uid() = user_id)`, UPDATE both clauses.
- `code_snapshots`: INSERT/SELECT via EXISTS subquery on `attempts.user_id = auth.uid()`.
- `test_runs`: INSERT/SELECT via EXISTS subquery on `attempts.user_id = auth.uid()`.
- No RLS policy changes were needed or made.

### Current Limitations

- AI scoring (`public.scorecards`) is not implemented — Phase 4.
- Hidden test results are not written to `test_runs` (never fetched server-side, by design).
- `time_taken_seconds` is only recorded in assessment mode (timer is 0 in practice mode; stored as `null`).
- Dashboard stat cards show raw counts only — no score averages, result bands, or weakness analysis until Phase 4 scoring is wired.
- The results page shows "coming soon" for scorecards — this is correct and honest for Phase 3.

### Phase 3 Polish (same session)

- `app/practice/[questionId]/practice-session.tsx` — Submit panel copy updated: "record a local attempt" replaced with "save your attempt" for JS, Python, and C++ to reflect actual Phase 3 behaviour.
- `TESTING.md` — Dashboard section updated: stale yellow-notice item removed; replaced with accurate Phase 3 checklist items (empty state, real stat cards, attempt history table, no notice banner).

### Recommended Next Steps

- **Phase 4:** AI scorecard — write to `public.scorecards`, show dimension breakdown on results page and dashboard (deferred pending API key setup).
- **Phase 4:** Hidden test execution via server-side sandbox (Judge0 or Piston); write hidden test results to `public.test_runs`.
- Consider adding `?next=` support to `/signup` for post-confirmation redirects to protected routes.

---

## Hidden Test Authoring — All 7 Questions

### Date

2026-06-29

### Summary

14 original hidden test cases (`is_hidden = true`) inserted directly into `public.question_test_cases` for every published question. All 7 questions now have **6 public + 14 hidden = 20 tests** each (98 hidden total). No schema changes. No code changes. Data only.

### Design principles

- No hidden test duplicates any existing public test input.
- Each set covers: stress inputs (large values, long arrays/strings, deep trees), boundary conditions not in the public set (single-element, two-element, all-same, all-zero, all-negative), and tricky structural cases (diagonal adjacency, snake paths, L-shapes, alternating runs, multiple valid pairs, case sensitivity).
- `expected_output` values are hand-verified against correct O(n) implementations of each function.
- `weight = 1` on all hidden tests (same as public tests).

### Hidden tests by question

| Question | Hidden test themes |
|---|---|
| `find-matching-pair` | Pair at first+last index; two-element arrays; negative target; zero target with negatives; large values; multiple valid pairs (first returned); all-same no-match; long array no-match |
| `sum-pair-exists` | Two-element exact/no-match; negative target; zeros pairing to zero; single zero; large values; all-same with non-matching target; pair at ends of long array; three duplicates; zero target with mixed signs |
| `compress-repeated-characters` | 10-char run; two-char run; alternating (no compression); uppercase; digit characters; run at end; multiple separated runs; two-char string; mixed case sensitivity; spaces as characters |
| `balanced-brackets` | Deep nesting `((([[]])))` ; closing-before-opening; curly-only; square-only; mismatched types `[}`; odd-length string; long valid sequence; unclosed nested; extra closing at end; interleaved wrong order `([)]`; complex nesting; two unmatched openings |
| `longest-unique-segment` | Single char; two same; two distinct; repeat in middle; longest at start/end; digits as chars; three-cluster prefix; interleaved repeats; window resets multiple times; long all-unique; boundary repeat; two equal-length windows; case sensitivity (`aA` treated as distinct) |
| `sum-nodes-in-binary-tree` | All-zero tree; left-only child; right-only child; all-negative; left-skewed 4 levels; right-skewed 4 levels; large values; mixed-sign cancels to zero; full 3-level tree (7 nodes); single large negative; zero root; right subtree with two children; alternating +/−; five-leaf tree |
| `count-connected-rooms` | Single-cell room/wall; one-row all-rooms; one-row alternating; one-column; border ring with interior wall; checkerboard 4×4 (8 components); two separate rows; L-shaped component; diagonal not connected; all-walls 5×5; large single component with hollow; five isolated rooms; snake path (1 component) |

### Confirmed counts

```
balanced-brackets:            6 public  14 hidden
compress-repeated-characters: 6 public  14 hidden
count-connected-rooms:        6 public  14 hidden
find-matching-pair:           6 public  14 hidden
longest-unique-segment:       6 public  14 hidden
sum-nodes-in-binary-tree:     6 public  14 hidden
sum-pair-exists:              6 public  14 hidden
```
