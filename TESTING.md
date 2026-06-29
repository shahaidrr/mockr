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

### Login
- [ ] Valid email + password logs the user in and redirects to `/dashboard`
- [ ] Invalid password shows an error message
- [ ] Empty fields show an error message
- [ ] Visiting `/login?next=/practice/abc` redirects back to `/practice/abc` after login

### Signup
- [ ] Valid new email + password creates an account and shows a confirmation prompt
- [ ] Duplicate email shows an appropriate error
- [ ] Password too short shows a validation error

### Email Confirmation Callback
- [ ] Clicking the email confirmation link redirects to `/dashboard` with an active session
- [ ] Broken or expired confirmation link shows an error on `/login`

### Sign Out
- [ ] Clicking sign out from the dashboard ends the session
- [ ] After sign out, navigating to `/dashboard` redirects to `/login`

---

## Landing Page (`/`)

- [ ] Page loads without error
- [ ] Header navigation links are visible and clickable
- [ ] Hero CTA ("Start Practising" or equivalent) redirects an unauthenticated user to `/login`
- [ ] Hero CTA redirects an authenticated user to `/questions`
- [ ] Feature cards, process steps, and roadmap section render correctly
- [ ] Footer renders without layout overflow

---

## Dashboard (`/dashboard`)

- [ ] Unauthenticated users are redirected to `/login`
- [ ] Authenticated users see the dashboard without error
- [ ] "Start new practice" CTA links to `/questions`
- [ ] "Browse questions" link goes to `/questions`
- [ ] Sign out button ends the session

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
- [ ] Editor updates the Monaco language mode when the language changes
- [ ] Typing in the editor updates the draft in localStorage

### Draft Saving & Restoration
- [ ] Refreshing the page restores the code, notes, and panel position
- [ ] Draft is keyed per user + question + mode (switching mode starts a fresh draft)

### Reset Draft
- [ ] Clicking "Reset Draft" shows a confirm modal
- [ ] Confirming reset clears all code and notes and restores starter code
- [ ] Cancelling leaves the draft unchanged

### Interview Panel (bottom-left)
- [ ] Panel shows "Clarification 1 of 5" on load
- [ ] "›" advances to the next panel; "‹" goes back
- [ ] "‹" is disabled on panel 1; "›" is disabled on panel 5
- [ ] Clarification, Approach, Testing/Edge Cases, and Complexity panels each have a textarea that persists
- [ ] Submit Review panel shows the checklist of completion items
- [ ] Checklist ticks green when the corresponding field is filled in

### Assessment Mode Timer
- [ ] Visiting with `?mode=assessment` starts the timer at 0:00
- [ ] Timer increments every second
- [ ] Timer does not appear in practice mode

---

## Phase 2 Polish — Multi-Language Public Test Runner

### Run Button — JavaScript
- [ ] Run button is active (green, enabled) when JavaScript is selected
- [ ] Clicking Run shows a spinner and "Running…" label on the button
- [ ] UI does not freeze while tests are running
- [ ] After running: output panel shows a summary ("N passed / M failed of X tests")
- [ ] Each test row shows status badge, label, and runtime
- [ ] Clicking a test row expands it to show input, expected, and actual output
- [ ] Values display as readable JSON (not `[object Object]`)

### Passing Tests — JavaScript
- [ ] A correct solution passes all 6 public tests (try `find-matching-pair` with a correct solution)
- [ ] All test rows show green "passed" badge
- [ ] Summary shows "All 6 tests passed"

### Failing Tests — JavaScript
- [ ] An incorrect solution shows "failed" (red) rows for wrong answers
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

## Results Page (`/results/[attemptId]`)

- [ ] Page loads and shows the attempt ID
- [ ] Phase 2 notice is visible ("Phase 2 — local only. Public tests ran in your browser.")
- [ ] If a test summary was produced, a "Public Test Results" section shows: question title, language, N passed, M failed, total count
- [ ] "Local Phase 2 result — not saved to the database." note is visible in the summary
- [ ] If no test summary (C++ or no test cases), the summary section is absent — page still loads cleanly
- [ ] "Retry question" button navigates back to `/practice/[questionId]`
- [ ] "Back to questions" navigates to `/questions`
- [ ] "Dashboard" navigates to `/dashboard`
- [ ] No attempt rows are created in Supabase (verify in dashboard)

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

---

## Cross-cutting

- [ ] Refreshing any page while logged in maintains the session
- [ ] Navigating between questions in a session works without stale state
- [ ] All modals (language switch, reset draft) can be dismissed with Cancel
- [ ] No console errors appear during normal use (open DevTools)
- [ ] No `[object Object]` appears anywhere in the UI
