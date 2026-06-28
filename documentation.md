# Documentation Log

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

- **Phase 2** — Browser-based JavaScript public test execution (Web Worker). Python and C++ await a secure sandbox (Judge0, Piston, or similar).
- **Phase 3** — Attempt persistence: write attempts and code snapshots to Supabase.
- **Phase 4+** — Deterministic scoring, hidden tests, AI scorecard (Claude API), dashboard attempt history, voice/video.
