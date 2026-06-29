# Documentation Log

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

**Output location:** `graphify-out/` — commit `graph.json`, `graph.html`, `GRAPH_REPORT.md`, and `manifest.json`. Do not commit `graphify-out/cache/` or `graphify-out/cost.json`.

**Visualiser:** Open `graphify-out/graph.html` in a browser to inspect nodes, links, routes, and component relationships.

### Session loop

1. `git pull`
2. Read `documentation.md` and `graphify-out/GRAPH_REPORT.md`
3. Query the graph before touching code:
   ```bash
   graphify query "What files are relevant to this task?"
   graphify query "What components, routes, and utilities may be affected?"
   ```
4. Make focused changes.
5. Update `documentation.md`.
6. Update the graph: `graphify update .`
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
