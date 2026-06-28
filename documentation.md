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

### Suggested Next Steps

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
