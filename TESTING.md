# MOCKR.AI — Feature Testing Checklist

This file is the canonical list of features that need manual testing after implementation.

**Agent rule:** After implementing any feature, add it to this file under the correct section. See `AGENTS.md` for the full instruction.

**How to use this file:**
- `[ ]` — Not yet tested
- `[x]` — Tested and passing
- `[!]` — Tested and failing / blocked

Run tests by visiting the live dev server (`npm run dev`) and following each step.

---

## Auth

### Login (`/login`)
- [ ] Valid email + password logs the user in and redirects to `/dashboard`
- [ ] Invalid password shows a friendly error: "The email or password is incorrect. Please check your details and try again."
- [ ] Empty fields show an HTML5 validation error (fields are required)
- [ ] A `?message=` query param from the auth callback renders a translated error message on the login page
- [ ] "New to MOCKR.AI? Create an account" link navigates to `/signup`
- [ ] "Back to home" link navigates to `/`
- [ ] No Google/OAuth button is shown

### Sign Up (`/signup`)
- [ ] Navigating to `/signup` shows the dedicated sign-up page (not the login page)
- [ ] Valid new email + password + matching confirm creates an account and shows the "Check your email" success state
- [ ] Success state shows the submitted email address and a link to `/login`
- [ ] Duplicate email shows a friendly error: "An account already exists for this email. Try logging in instead."
- [ ] Passwords that do not match show: "Passwords do not match. Please check and try again."
- [ ] Password fewer than 8 characters shows: "Your password must be at least 8 characters."
- [ ] "Already have an account? Log in" link navigates to `/login`
- [ ] "Back to home" link navigates to `/`
- [ ] No Google/OAuth button is shown

### Email Confirmation Callback
- [ ] Clicking the email confirmation link redirects to `/dashboard` with an active session
- [ ] Broken or expired confirmation link shows an error message on `/login`

### Sign Out
- [ ] Clicking sign out from the dashboard ends the session
- [ ] After sign out, navigating to `/dashboard` redirects to `/login`

---

## Landing Page (`/`)

- [ ] Page loads without error
- [ ] Unauthenticated: header shows "Log in" (secondary) and "Sign up free" (primary)
- [ ] Authenticated: header shows "Dashboard" (secondary) and "Browse questions" (primary)
- [ ] Header "Log in" navigates to `/login`
- [ ] Header "Sign up free" navigates to `/signup` (unauthenticated) or `/questions` (authenticated)
- [ ] Hero CTA ("Create free account") redirects an unauthenticated user to `/signup`
- [ ] Hero CTA redirects an authenticated user to `/questions`
- [ ] "Log in" secondary button in hero navigates to `/login`
- [ ] Bottom CTA "Create free account" navigates to `/signup`
- [ ] Bottom CTA "Log in" navigates to `/login`
- [ ] Footer "Sign up" link navigates to `/signup`
- [ ] Footer "Log in" link navigates to `/login`
- [ ] Footer "Questions" link navigates to `/questions`
- [ ] Feature cards, process steps, and roadmap section render correctly
- [ ] Footer renders without layout overflow

---

## Dashboard (`/dashboard`)

- [ ] Unauthenticated users are redirected to `/login`
- [ ] Authenticated users see the dashboard without error
- [ ] A user with no submitted attempts sees the empty state ("No attempts yet") with a "Browse questions" CTA
- [ ] A user with submitted attempts sees real stat cards (questions attempted, total submissions, top topic, preferred language)
- [ ] Recent attempts table shows question name, topic, language, date, and time taken
- [ ] Clicking a question name in the table navigates to `/results/{attemptId}`
- [ ] "Start new practice" CTA links to `/questions`
- [ ] "Browse questions" link goes to `/questions`
- [ ] Sign out button ends the session
- [ ] No yellow/amber placeholder notice is shown

---

## Question Library (`/questions`)

- [ ] Page loads and shows all published questions
- [ ] Each question card shows title, difficulty badge, topic, and estimated time
- [ ] Difficulty badge colour matches difficulty (green/amber/red)
- [ ] "Random question" button navigates to a random question detail page
- [ ] Clicking a question card navigates to `/questions/[slug]`
- [ ] No unpublished questions appear in the list

---

## Question Detail (`/questions/[slug]`)

- [ ] Page loads the correct question for the slug
- [ ] Problem title, topic, difficulty, and estimated time are displayed
- [ ] Mode selector (Practice / Assessment) is visible and selectable
- [ ] Language selector (JavaScript / Python / C++) is visible and selectable
- [ ] "Start Practice" button navigates to `/practice/[questionId]?mode=...&language=...`
- [ ] An unknown slug shows a 404 page

---

## Practice Workspace (`/practice/[questionId]`)

### Auth Gate
- [ ] Unauthenticated users are redirected to `/login?next=/practice/[questionId]`
- [ ] After login, the redirect returns to the correct practice page

### Question Loading
- [ ] The question title appears in the top bar
- [ ] The problem statement is visible and scrollable in the left panel
- [ ] Input description, output description, constraints, and examples render correctly
- [ ] Difficulty badge colour is correct
- [ ] An unknown question ID shows a 404 page

### Language Tabs
- [ ] Language tabs shown match the question's `supported_languages`
- [ ] Clicking a tab with no code change switches language immediately
- [ ] Clicking a tab after writing code shows the "Switch language?" confirm modal
- [ ] Confirming the switch changes the language and preserves the old code
- [ ] Cancelling the switch keeps the current language
- [ ] After switching back, the previously written code is restored

### Monaco Editor
- [ ] Editor loads with the starter code for the selected language
- [ ] Python starter code uses the canonical runner function name for the current question (for example, Balanced Brackets shows `def balancedBrackets(s):`)
- [ ] Editor updates the Monaco language mode when the language changes
- [ ] Typing in the editor updates the draft in localStorage
- [ ] Before Stage 2 is completed, the editor is read-only and shows guidance explaining that the approach must be discussed before coding
- [ ] After entering a non-empty Stage 2 approach, the editor unlocks immediately without reloading the page

### Draft Saving & Restoration
- [ ] Refreshing the page restores the code, notes, and panel position
- [ ] Draft is keyed per user + question + mode (switching mode starts a fresh draft)

### Reset Draft
- [ ] Clicking "Reset Draft" shows a confirm modal
- [ ] Confirming reset clears all code and notes and restores starter code
- [ ] Cancelling leaves the draft unchanged

### Interview Panel (bottom-left)
- [ ] Panel first loads into a workflow overview screen before Stage 1 begins
- [ ] Overview screen shows all 5 stages with their current status labels before the user starts
- [ ] Clicking "Begin Stage 1" enters the one-stage-at-a-time interview flow
- [ ] "›" advances to the next panel; "‹" goes back
- [ ] "Overview" returns from an active stage back to the overview screen
- [ ] "‹" is disabled on panel 1; "›" is disabled on panel 5
- [ ] Stage cards show status labels such as optional, skipped, required, locked, encouraged, completed, or ready
- [ ] Clarification shows a "Skip clarification" action, marks the stage intentionally skipped, and moves directly to Stage 2
- [ ] Each active stage shows a clear next/submit action button in addition to the arrow controls
- [ ] Clarification, Approach, Testing/Edge Cases, and Submit Complexity inputs show the expected placeholder hint text
- [ ] Long answers can be scrolled inside the current stage input area without clipping content below the panel
- [ ] Typing in any textarea persists the content on refresh
- [ ] Stage 2 must be explicitly submitted before Stage 3 unlocks
- [ ] Stage 3 remains locked until Stage 2 Approach has been submitted
- [ ] Stage 3 becomes completed only after code meaningfully changes from the starter stub
- [ ] Stage 4 Testing Plan / Edge Cases can stay empty without blocking Run or Submit
- [ ] Submit Review shows the checklist with Clarification optional/skipped/completed, Approach required, Code written required, Testing plan encouraged, and Complexity required
- [ ] Submit Review shows inline guidance for each missing required item when submit is attempted too early

### Assessment Mode Stage Flow
- [ ] Open `/practice/[questionId]?mode=assessment` — the same overview-first stage flow appears before Stage 1 begins
- [ ] In assessment mode, skipping Clarification moves to Stage 2 and submitting Stage 2 is still required before the editor unlocks
- [ ] In assessment mode, each stage still shows its clear next/submit action button while the assessment integrity guard remains functional

### Assessment Speech Transcription
- [ ] On `/questions/[slug]`, choose Assessment Mode and click Start — if microphone access is not already granted, the browser prompts for microphone access before the workspace opens
- [ ] If microphone permission is already granted, clicking Start in Assessment Mode opens the workspace without an extra browser permission prompt
- [ ] If microphone permission is denied at the start prompt, the app still opens assessment mode and shows guidance that speech transcription may be unavailable until microphone access is enabled
- [ ] Open `/practice/[questionId]?mode=assessment` in Chrome or Edge — stages 1, 2, 4, and 5 show read-only answer fields with microphone controls
- [ ] Click the microphone in Stage 1, allow microphone access, speak a short sentence, then stop — the clarification text is appended and remains in the field
- [ ] Repeat in Stage 2 and Stage 5 — approach and complexity answers append spoken text without unlocking practice-mode typing
- [ ] In Stage 4, start recording `Testing Plan`, then click the `Edge Cases` mic while still speaking — only one field shows the active listening state and new transcript chunks land in the newly selected field
- [ ] Start recording in any assessment speech field, then change to another interview stage — the listening glow/interim transcript stop immediately and no field appears to remain recording
- [ ] Deny microphone permission in the browser — the active assessment field shows a microphone access error message
- [ ] After a microphone error (`not allowed` or `no speech`), retry the same field — the old error clears and recording can start cleanly again
- [ ] Submit an assessment with transcribed answers — the saved attempt and results flow still show the captured clarification, approach, testing, edge-case, and complexity text
- [ ] Open the same assessment URL in an unsupported browser (for example Firefox or Safari) — the speech UI falls back to manual typing so the required assessment fields can still be completed
- [ ] Open `/practice/[questionId]?mode=practice` — the same fields are editable textareas and no microphone controls are shown

### Assessment Mode Timer
- [ ] Visiting with `?mode=assessment` starts the timer at 0:00
- [ ] Timer increments every second
- [ ] Timer does not appear in practice mode

---

## Timer Persistence

### Practice Mode timer persists across reloads and navigation

- [ ] Open a practice session at `/practice/[questionId]?mode=practice` — note the timer value after ~10 seconds
- [ ] Hard-reload the page (Ctrl+R / Cmd+R) — timer resumes from approximately the same elapsed time (within 1 second)
- [ ] Navigate away to `/questions` then return to the same practice URL — timer continues from where it left off
- [ ] Open DevTools → Application → Local Storage — confirm a key `mockr:timer-epoch:mockr:draft:...` exists for the current user + question + mode

### Assessment Mode timer persists across reloads

- [ ] Open an assessment session at `/practice/[questionId]?mode=assessment` — note the timer value after ~10 seconds
- [ ] Hard-reload the page — timer resumes from approximately the same elapsed time (within 1 second)
- [ ] Navigate away and return (without abandoning) — timer continues from where it left off

### Timer resets correctly on new attempt

- [ ] Submit an attempt — navigate to results, then return to the same question in practice mode — timer starts from 0
- [ ] In a practice session, click "Reset Draft" and confirm — timer resets to 0 and starts counting from scratch
- [ ] In assessment mode, click "← Questions" → "Leave & abandon" — then return to the same question in assessment mode — timer starts from 0

### Practice and Assessment timers are independent

- [ ] Start a practice session for a question, let it run for ~15 seconds
- [ ] Open the same question in assessment mode in the same browser — assessment timer starts from 0 (separate epoch key)
- [ ] Return to practice mode — practice timer is still at its original elapsed value

---

## Question Library — "Start" Button

- [ ] Go to `/questions` — each question card shows "Start" (not "Start practice") as the dark primary button
- [ ] Click "View" on any card — navigates to `/questions/[slug]` and lands at the top of the page normally
- [ ] Click "Start" on any card — navigates to `/questions/[slug]#practice-setup` and the browser scrolls directly to the mode/language/start section near the bottom
- [ ] On the question detail page, the setup section (mode selector, language selector, Start practice button) is visible immediately after clicking "Start" without manual scrolling
- [ ] Logged-out users clicking "Start" land on the same setup section (the page does not require auth to view)

---

## Editor, Timer, and Assessment Session Control

### Monaco Editor — No Suggestions

- [ ] Open `/practice/[questionId]?mode=practice&language=javascript`, type a deliberately broken function (e.g. `function foo( { return` ) — red squiggly underlines appear on the broken lines
- [ ] Hover over the squiggly underlined code — **no** hover tooltip or fix suggestion appears
- [ ] Type a partial method name (e.g. `arr.`) — **no** autocomplete dropdown appears
- [ ] Open `/practice/[questionId]?mode=assessment&language=javascript` and repeat both checks above — same behaviour in assessment mode

### Practice Mode Timer

- [ ] Open `/practice/[questionId]?mode=practice` — a blue timer appears in the top bar starting at `0:00`
- [ ] Wait 5 seconds — timer reads `0:05` (does not jump ahead or stay at `0:00`)
- [ ] Type code in the editor — timer continues without resetting
- [ ] Type in the Clarification notes textarea — timer continues without resetting
- [ ] Click between interview panels (Approach, Testing, etc.) — timer continues without resetting
- [ ] Hard refresh the page — timer restarts from `0:00` (does not restore old value)
- [ ] Open DevTools → Performance → check for duplicate `setInterval` calls — only one interval should be running

### Assessment Mode Timer

- [ ] Open `/practice/[questionId]?mode=assessment` — a red timer appears in the top bar starting at `0:00`
- [ ] Wait 5 seconds — timer reads `0:05`
- [ ] Type code in the editor — timer continues without resetting

### Assessment Mode Exit Guard

- [ ] In assessment mode, click "← Questions" in the top bar — a modal appears: "Leaving the interview?"
- [ ] Modal body mentions progress will be lost and a fresh attempt is required on return
- [ ] Click "Stay" — modal closes, session continues normally with no data loss
- [ ] Click "Leave & abandon" — navigated to `/questions`, no errors shown
- [ ] Return to the same question in assessment mode — editor starts with **blank/starter code**, not the previous code
- [ ] In assessment mode, attempt to close the browser tab or refresh — browser shows a native "Leave site?" confirmation prompt

### Assessment Attempt Tracking

- [ ] Open `/practice/[questionId]?mode=assessment` — open DevTools → Application → Local Storage → find key `mockr:assessment:attempts:{userId}:{questionId}` — value should increment by 1 each time you start a new session
- [ ] Abandon an assessment (via "Leave & abandon") — open Application → Session Storage → find key `mockr:assessment:abandoned:{questionId}` with value `"1"` (this is cleared automatically on re-entry)
- [ ] Re-enter assessment for the same question — the abandoned sessionStorage key is gone and the draft is fresh

### Assessment Mode — No Side Effects on Practice Mode

- [ ] Open `/practice/[questionId]?mode=practice` — no exit guard modal on the "← Questions" link (navigates directly)
- [ ] Practice Mode draft is still saved and restored on page refresh
- [ ] Practice Mode timer is blue (not red)

---

## Phase 2 Polish — Multi-Language Public Test Runner

### Run Button — JavaScript
- [ ] Run button is active (green, enabled) when JavaScript is selected
- [ ] Run button stays disabled until Stage 2 Approach is completed
- [ ] Clicking Run shows a spinner and "Running…" label on the button
- [ ] UI does not freeze while tests are running
- [ ] After running: output panel shows a summary ("N passed / M failed of X tests")
- [ ] Each test row shows status badge, label, and runtime
- [ ] Clicking a test row expands it to show INPUT, EXPECTED, YOUR OUTPUT, and ERROR when applicable
- [ ] Values display as readable JSON (not `[object Object]`)
- [ ] Runtime errors show `YOUR OUTPUT` as `No output due to runtime error`

### Passing Tests — JavaScript
- [ ] A correct solution passes all 6 public tests (try `find-matching-pair` with a correct solution)
- [ ] All test rows show green "passed" badge
- [ ] Summary shows "All 6 tests passed"

### Failing Tests — JavaScript
- [ ] An incorrect solution shows "failed" (red) rows for wrong answers
- [ ] Wrong-answer rows show the user's returned value under `YOUR OUTPUT`
- [ ] Expanded row shows expected vs actual output clearly

### Error Tests — JavaScript
- [ ] Code with a syntax error marks all tests as "error" (amber)
- [ ] Expanded row shows the error message
- [ ] Code that throws at runtime marks affected tests as "error"

### Timeout — JavaScript
- [ ] Code with an infinite loop (`while(true){}`) triggers timeout after ~2 seconds
- [ ] All tests are marked "timeout" (purple)
- [ ] Timeout message reads: "Execution timed out after 2 seconds. Check for an infinite loop or an inefficient solution."
- [ ] UI remains fully responsive after timeout
- [ ] User can edit code and run again after a timeout

### Run Button — Python
- [ ] Run button is active (green, enabled) when Python is selected
- [ ] Clicking Run shows a spinner and "Running…" label
- [ ] Output panel shows "Loading Python environment — first run may take 10–30 s." while Pyodide loads
- [ ] After Pyodide loads: test results display the same pass/fail/error/timeout badges
- [ ] Subsequent Python runs (Pyodide cached) complete much faster

### Passing Tests — Python
- [ ] A correct Python solution passes all 6 public tests
- [ ] All test rows show green "passed" badge with runtime in ms

### Failing Tests — Python
- [ ] An incorrect Python solution shows "failed" (red) rows with expected vs actual

### Error Tests — Python
- [ ] Python code with a syntax error marks all tests as "error" (amber) with the error message
- [ ] Python code where the function is missing marks all tests as "error" with "Function not found"

### Run Button — C++
- [ ] Run button is disabled and faded when C++ is selected
- [ ] "Not available" label appears next to the disabled button
- [ ] Output panel shows: "C++ execution is coming later. JavaScript and Python are supported now."
- [ ] No execution attempt is made

### No Public Test Cases (edge case)
- [ ] If a question has no public test cases, the Run button is disabled
- [ ] Output panel shows a "No public test cases found" message

### Submit — with all tests passing
- [ ] Clicking "Submit Attempt →" runs public tests one final time (for JS and Python)
- [ ] If all tests pass, user is navigated directly to `/results/local-{timestamp}?questionId=...` — no warning shown

### Submit — with failing tests warning
- [ ] If any public test fails, a modal appears: "Some tests are not passing"
- [ ] Modal body reads: "Some public tests are not passing. You can still submit, but your result summary will show the failures."
- [ ] Modal has an X button in the top-right corner that dismisses it
- [ ] Modal has a "Submit anyway" button that navigates to the results page
- [ ] Dismissing the modal (X) returns the user to the workspace with no navigation

### Submit — tests not yet run
- [ ] Clicking Submit when tests have not been run first runs the tests, then applies the warning logic if any fail

### Submit — C++
- [ ] Clicking "Submit Attempt →" when C++ is selected navigates directly to `/results/...` without running tests
- [ ] Submit panel shows the C++ "coming later" notice

### Disable during run
- [ ] Run button is disabled while tests are executing (no double-run)
- [ ] Submit button is disabled while the final submit test run is in progress

---

## Phase 3 — Attempt Persistence

### Submit saves to Supabase
- [ ] Completing a JavaScript practice session and clicking "Submit Attempt →" navigates to a results page with a UUID attempt ID (not `local-`)
- [ ] Completing a Python practice session and submitting saves the attempt and navigates to a UUID results page
- [ ] Submitting a C++ session (no tests run) saves the attempt and navigates to a UUID results page
- [ ] After submit, a row appears in `public.attempts` in Supabase with `status = 'submitted'`
- [ ] A row appears in `public.code_snapshots` linked to the attempt with the final submitted code
- [ ] For JS/Python: rows appear in `public.test_runs` linked to the attempt (one per public test case)
- [ ] Passed/failed test runs match what was shown in the output panel

### Submit fallback (Supabase unavailable)
- [ ] If the Supabase insert fails (e.g. network error), the user is still navigated to a results page with a `local-` ID
- [ ] No error page is shown — the fallback is silent

### Submit button states
- [ ] "Submit Attempt →" button shows "Saving…" while the Supabase write is in progress
- [ ] "Submit anyway" in the warning modal also shows "Saving…" during the write
- [ ] Both buttons are disabled during the save (no double-submit)

### Results page — saved attempt
- [ ] Navigating to `/results/{uuid}` shows a loading spinner briefly then "Attempt recorded"
- [ ] Attempt metadata card shows: question name, language, mode, and time taken (if assessment mode)
- [ ] "Retry question" button navigates to `/practice/[questionId]`
- [ ] "Back to questions" navigates to `/questions`
- [ ] "Dashboard" navigates to `/dashboard`

### Dashboard — real attempt history
- [ ] After submitting one attempt, the dashboard shows real stat cards (no amber placeholder notice)
- [ ] Stat cards show correct values: unique questions count, total submissions, top topic, preferred language
- [ ] Recent attempts table shows the question name (linked to its results page), topic, language, date, and time taken
- [ ] Clicking a question name in the table navigates to `/results/{attemptId}`
- [ ] Topic breakdown bar chart reflects the proportion of attempts per topic
- [ ] A new user with no attempts sees the empty state ("No attempts yet") with a "Browse questions" CTA
- [ ] The "Coming soon" section remains visible for all users

## Phase 4A — Deterministic Scorecards

### Scorecard persistence
- [ ] Submitting a JavaScript attempt that saves successfully creates a row in `public.scorecards` linked to the saved attempt
- [ ] Submitting a Python attempt that saves successfully creates a row in `public.scorecards` linked to the saved attempt
- [ ] Submitting a C++ attempt saves a row in `public.scorecards` even though no test runs are created
- [ ] After submit, the matching row in `public.attempts` has `overall_score` and `result_band` populated
- [ ] If the scorecard insert fails but the attempt insert succeeds, the user is still navigated to `/results/{attemptId}` without a crash
- [ ] Before production browser testing, apply `supabase/migrations/002_scorecards_insert_policy.sql` to the real Supabase project; without it, attempts may save but browser-side scorecard inserts may fail due to RLS

### JavaScript failing public tests still persists scorecard
- [ ] In `/questions`, start a JavaScript practice attempt and intentionally submit code that fails at least one public test
- [ ] After submit, a row exists in `public.attempts` for the attempt
- [ ] A linked row exists in `public.code_snapshots` with the submitted JavaScript source
- [ ] Linked rows exist in `public.test_runs`, including at least one failed public test run
- [ ] A linked row exists in `public.scorecards`
- [ ] The matching `public.attempts` row has `overall_score` and `result_band` populated
- [ ] The results page shows a lower `Code correctness` category score than a fully passing JavaScript attempt
- [ ] The results page public test summary shows the failed public test count
- [ ] The dashboard recent attempts row shows the lower score/result band
- [ ] Browser DevTools confirms hidden test cases are not fetched, exposed, run, or scored

### Results page — deterministic scorecards
- [ ] Navigating to a new Phase 4A UUID attempt shows overall score out of 100 and a result band
- [ ] The results page shows all 8 category scores out of 10 for a scored UUID attempt
- [ ] The results page shows the submitted timestamp in the attempt details card
- [ ] The results page shows strengths, weaknesses, and improvement tasks for a scored UUID attempt
- [ ] The results page shows the deterministic-scoring limitation note mentioning public tests/interview fields and no AI/hidden-test scoring yet
- [ ] A pre-Phase-4A saved attempt with no scorecard shows the fallback message: “This attempt was recorded before scorecards were enabled.”
- [ ] If `attempts.overall_score` or `attempts.result_band` exists but no joined `scorecards` row loads, the results page shows the saved summary score and the message: “A score summary exists, but the detailed scorecard row could not be loaded.”

### Results page — public test summary and language handling
- [ ] For a scored JavaScript or Python attempt, the results page shows the saved public test passed/failed summary
- [ ] For a scored C++ attempt, the results page clearly says correctness could not be verified because C++ execution is not supported yet
- [ ] Local fallback attempts with `local-` IDs still show the sessionStorage-based public test summary when available

### Dashboard — score visibility
- [ ] Recent attempts rows show `score/100` and result band for Phase 4A scored attempts
- [ ] Older attempts without saved score data show “Not scored yet” in the recent attempts table
- [ ] On mobile, a recent attempt row includes score/result-band text when the attempt has been scored

## Tooling — Graphify CLI

- [ ] Running `npx graphify --help` shows the real Graphify CLI from `@sentropic/graphify`
- [ ] Running `npx graphify query "dashboard attempts"` returns matching nodes from the checked-in graph
- [ ] Running `npx graphify explain "practice-session.tsx"` returns the practice-session node plus related graph context
- [ ] Running `npx graphify path "practice-session.tsx" "attempts-service.ts"` returns a non-empty path across graph nodes
- [ ] Running `npx graphify update --no-description --no-label .` regenerates graph artifacts without generating assistant-fill instruction files

---

## Results Page (`/results/[attemptId]`)

- [ ] Page loads and shows the attempt ID
- [ ] For a saved (UUID) attempt: shows "Attempt recorded" heading, attempt metadata card
- [ ] For a local fallback attempt: shows "Attempt recorded" with `local-` ID and no metadata card
- [ ] If a local test summary exists in sessionStorage: "Public test results" section shows passed/failed counts
- [ ] If no test summary (C++ or no test cases), the summary section is absent — page still loads cleanly
- [ ] "Retry question" button navigates back to `/practice/[questionId]`
- [ ] "Back to questions" navigates to `/questions`
- [ ] "Dashboard" navigates to `/dashboard`

---

## Practice Demo (`/practice/demo`)

- [ ] `/practice/demo` loads without error
- [ ] The demo workspace renders (editor, language switcher, fake run output)
- [ ] Phase 2 changes did not break the demo page

---

## Supabase Data Integrity

- [ ] Only published questions appear in `/questions`
- [ ] Only public test cases (`is_hidden = false`) are fetched and shown
- [ ] Hidden test cases are never sent to the browser (verify via browser DevTools Network tab)
- [ ] No writes occur to `attempts`, `attempt_events`, `code_snapshots`, `test_runs`, or `scorecards` during any Phase 2 flow

### Hidden Test Cases (data authoring)

- [ ] In Supabase, each of the 7 published questions has exactly 14 hidden test cases (`is_hidden = true`)
- [ ] Total hidden test count across all questions is 98
- [ ] Hidden tests do not appear in the public test runner output panel during practice
- [ ] Hidden tests are not included in any browser network response (confirm via DevTools)

---

## Agent Instructions

### Instruction file consolidation (2026-06-29)

- [ ] Open `AGENTS.md` — confirm it contains product identity, Graphify workflow, documentation workflow, testing workflow, git rules, security rules, implementation standards, and large-task workflow
- [ ] Open `CLAUDE.md` — confirm it contains only `@AGENTS.md` (single line pointer)
- [ ] Open `CODEX.md` — confirm it contains only a one-line redirect to `AGENTS.md`
- [ ] Start a new Claude Code session and ask "what are the project rules?" — confirm Claude cites content from `AGENTS.md` without needing to be told to read it

---

## Assessment Integrity Mode (Frontend)

### Pre-start rules modal
- [ ] Navigate to a question and select Assessment Mode → the rules modal appears before the workspace is usable
- [ ] Click "Cancel" → navigates back (browser history back)
- [ ] Click "Start assessment" → modal disappears and browser requests fullscreen

### Fullscreen enforcement
- [ ] After accepting rules, browser enters fullscreen (green dot + "Fullscreen" badge appears bottom-right)
- [ ] Press Esc or otherwise exit fullscreen → workspace is blocked by the "Assessment paused" overlay
- [ ] Overlay shows "Return to fullscreen" button
- [ ] Clicking "Return to fullscreen" → browser re-enters fullscreen, workspace becomes usable again
- [ ] The fullscreen_exit event is reflected in the integrity badge count

### Integrity event detection
- [ ] Switch to another tab while assessment is active → tab_hidden event logged (badge updates)
- [ ] Return to tab → tab_visible logged
- [ ] Click outside the browser window (e.g. Dock/taskbar) → window_blur logged
- [ ] Press Ctrl+R or Cmd+R → reload is blocked, reload_attempt logged
- [ ] Right-click anywhere in the workspace → context menu suppressed, context_menu_attempt logged
- [ ] Drag a file into the workspace → drag/drop blocked, drag_drop_attempt logged
- [ ] Copy text from the workspace → copy_attempt logged (typing in Monaco editor still works normally)

### Integrity status escalation
- [ ] 0 non-info events → badge shows "clean" (green)
- [ ] 1+ medium severity events (e.g. fullscreen_exit) → badge shows "warning" (amber)
- [ ] 1 high or 2+ medium events → badge shows "flagged" (red)
- [ ] 3+ high events → badge shows "compromised" (purple)

### Submit and persistence
- [ ] Submit the assessment → fullscreen exits automatically before navigation
- [ ] Results page loads → "Assessment integrity" section appears with status and event count
- [ ] Results page shows disclaimer: "does not prove misconduct"
- [ ] If no integrity events were logged → integrity section is not shown on results page

### Practice Mode isolation
- [ ] Navigate to Practice Mode → no rules modal appears
- [ ] No fullscreen request in Practice Mode
- [ ] Right-click works normally in Practice Mode
- [ ] Ctrl+R works normally in Practice Mode
- [ ] No integrity badge appears in Practice Mode

### Edge cases
- [ ] Browser that doesn't support Fullscreen API (e.g. some mobile browsers) → assessment starts without fullscreen, fullscreen_unavailable logged, no blocking overlay shown
- [ ] Fullscreen request rejected by browser (denied permission) → same fallback behaviour as above
- [ ] User submits with 0 integrity events → no `attempt_events` integrity rows inserted, no integrity summary on results page
- [ ] App does not request webcam or screen-recording permissions at any point
- [ ] App only requests microphone permission when the user explicitly activates an assessment speech field

---

## Assessment Integrity Foundation (database only — no frontend UI yet)

These items verify the Supabase migration was applied and the data layer works.
Apply `supabase/migrations/003_assessment_integrity_foundation.sql` first.

### Migration applied correctly
- [ ] Open Supabase dashboard → Table Editor: `assessment_integrity_events` table exists with all columns
- [ ] Open Supabase dashboard → Table Editor: `user_consents` table exists
- [ ] Open Supabase dashboard → Table Editor: `attempts` table now has `integrity_status`, `integrity_event_count`, `assessment_started_at`, `assessment_submitted_at`, `fullscreen_required`, `fullscreen_active`, `integrity_metadata` columns
- [ ] Open Supabase dashboard → Database → Views: `assessment_integrity_summary` view exists

### RPC function
- [ ] Open Supabase dashboard → Database → Functions: `log_assessment_integrity_event` function exists with `SECURITY INVOKER`
- [ ] Call the RPC from the SQL Editor as an authenticated user with a valid `attempt_id` → returns `{ event_id, integrity_status, integrity_event_count }`
- [ ] Call the RPC with an `attempt_id` belonging to a different user → returns an access-denied error

### RLS policies
- [ ] Query `assessment_integrity_events` as an authenticated user → returns only rows where `user_id = auth.uid()`
- [ ] Attempt to INSERT an integrity event for an attempt owned by a different user → INSERT is rejected by RLS
- [ ] Query `user_consents` as an authenticated user → returns only own rows
- [ ] Attempt to INSERT a `user_consents` row with a different `user_id` → INSERT is rejected

### TypeScript helper (browser, not wired to UI yet)
- [ ] Import `logAssessmentIntegrityEvent` from `lib/assessment-integrity.ts` in a test component → no TypeScript errors
- [ ] Import `getAssessmentIntegritySummary` from `lib/assessment-integrity.ts` → no TypeScript errors
- [ ] Import types from `types/assessment-integrity.ts` → all types resolve correctly

---

## Cross-cutting

- [ ] Refreshing any page while logged in maintains the session
- [ ] Navigating between questions in a session works without stale state
- [ ] All modals (language switch, reset draft) can be dismissed with Cancel
- [ ] No console errors appear during normal use (open DevTools)
- [ ] No `[object Object]` appears anywhere in the UI
