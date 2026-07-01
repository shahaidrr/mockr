# Graph Report - mockr  (2026-07-01)

## Corpus Check
- 63 files · ~48,449 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 590 nodes · 765 edges · 45 communities (41 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `86383017`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]

## God Nodes (most connected - your core abstractions)
1. `Documentation Log` - 33 edges
2. `MOCKR.AI — Feature Testing Checklist` - 21 edges
3. `createClient()` - 19 edges
4. `compilerOptions` - 18 edges
5. `Phase 2 Polish — Multi-Language Public Test Runner` - 17 edges
6. `Phase 2 — JavaScript Public Test Execution` - 17 edges
7. `2026-07-01 — Assessment Integrity Database Foundation` - 16 edges
8. `calculateDeterministicScorecard()` - 14 edges
9. `2026-06-30 — Graphify CLI Restored` - 14 edges
10. `Phase 2 Polish — Multi-Language Public Test Execution` - 13 edges

## Surprising Connections (you probably didn't know these)
- `DashboardPage()` --calls--> `createClient()`  [EXTRACTED]
  app/dashboard/page.tsx → lib/supabase/server.ts
- `GET()` --calls--> `createClient()`  [EXTRACTED]
  app/auth/callback/route.ts → lib/supabase/server.ts
- `POST()` --calls--> `createClient()`  [EXTRACTED]
  app/auth/signout/route.ts → lib/supabase/server.ts
- `Home()` --calls--> `createClient()`  [EXTRACTED]
  app/page.tsx → lib/supabase/server.ts
- `DemoPracticePage()` --calls--> `createClient()`  [EXTRACTED]
  app/practice/demo/page.tsx → lib/supabase/server.ts

## Import Cycles
- None detected.

## Communities (45 total, 4 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (32): auth/signout/route.ts, ast_hash, mtime, semantic_hash, dashboard/page.tsx, ast_hash, mtime, semantic_hash (+24 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (25): dependencies, @monaco-editor/react, next, react, react-dom, @supabase/ssr, @supabase/supabase-js, devDependencies (+17 more)

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (21): compilerOptions, allowJs, baseUrl, esModuleInterop, ignoreDeprecations, incremental, isolatedModules, jsx (+13 more)

### Community 3 - "Community 3"
Cohesion: 0.11
Nodes (11): FeatureCardProps, dashboardPreviewStats, featureCards, futureCards, LandingPageProps, navLinks, positioningChips, steps (+3 more)

### Community 4 - "Community 4"
Cohesion: 0.11
Nodes (23): Home(), GET(), DemoPracticePage(), fetchPublicTestCases(), fetchPublishedQuestions(), fetchQuestionById(), fetchQuestionBySlug(), config (+15 more)

### Community 5 - "Community 5"
Cohesion: 0.14
Nodes (13): 2026-06-28 16:12:00 AEST, 2026-06-28 16:14:00 AEST, 2026-06-28 16:18:00 AEST, 2026-06-28 16:22:00 AEST, 2026-06-28 16:26:00 AEST, 2026-06-28 16:29:21 AEST, 2026-06-28 16:31:00 AEST, 2026-06-28 16:33:00 AEST (+5 more)

### Community 6 - "Community 6"
Cohesion: 0.14
Nodes (8): DashboardCardProps, StatCard(), StatCardProps, AttemptRow, AttemptRowRaw, DashboardPage(), LANGUAGE_LABELS, QuestionSummary

### Community 7 - "Community 7"
Cohesion: 0.22
Nodes (7): CodeEditor(), CodeEditorProps, INTERVIEW_OPTIONS, ActiveTab, LANGUAGES, SidebarPanel, STARTER_CODE

### Community 8 - "Community 8"
Cohesion: 0.20
Nodes (10): Files Created, Files Modified, New Routes, Overview, Phase 1 — Database-backed Question Library and Practice Workspace, Phase 1 Limitations, Phases Roadmap, Practice Workspace Layout (integrated coding environment) (+2 more)

### Community 9 - "Community 9"
Cohesion: 0.07
Nodes (39): buildDraftKey(), buildEmptyDraft(), clearDraft(), loadDraft(), saveDraft(), runPublicTests(), spawnWorker(), Props (+31 more)

### Community 10 - "Community 10"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 11 - "Community 11"
Cohesion: 0.13
Nodes (14): 1. Read context first, 2. Query Graphify before touching source files, 3. After meaningful changes — update Graphify, After completing each phase or task, After Meaningful Changes, AGENTS.md — MOCKR.AI Canonical Agent Instructions, Before editing — state intent, Before Every Task — Mandatory Orientation (+6 more)

### Community 16 - "Community 16"
Cohesion: 0.13
Nodes (14): Agent Instructions, Cross-cutting, Dashboard (`/dashboard`), Hidden Test Cases (data authoring), Instruction file consolidation (2026-06-29), Landing Page (`/`), MOCKR.AI — Feature Testing Checklist, Practice Demo (`/practice/demo`) (+6 more)

### Community 17 - "Community 17"
Cohesion: 0.14
Nodes (14): 2026-07-01 — Assessment Integrity Database Foundation, `attempt_events` convention note, How the future frontend should integrate, Integrity status rules (MVP), RLS policy summary, RPC function, Suggested severity mapping, Supabase migration setup (+6 more)

### Community 18 - "Community 18"
Cohesion: 0.15
Nodes (26): buildLists(), calculateDeterministicScorecard(), clampScore(), countMatches(), countWords(), getResultBand(), normaliseText(), scoreAlgorithmicApproach() (+18 more)

### Community 19 - "Community 19"
Cohesion: 0.18
Nodes (11): Current Limitations, Date, Landing Header Fix, Landing Header Fix + Phase 3 — Attempt Persistence, Phase 3 Files Changed, Phase 3 Files Created, Phase 3 Polish (same session), Recommended Next Steps (+3 more)

### Community 20 - "Community 20"
Cohesion: 0.12
Nodes (17): Disable during run, Error Tests — JavaScript, Error Tests — Python, Failing Tests — JavaScript, Failing Tests — Python, No Public Test Cases (edge case), Passing Tests — JavaScript, Passing Tests — Python (+9 more)

### Community 21 - "Community 21"
Cohesion: 0.22
Nodes (9): Assessment Mode Timer, Auth Gate, Draft Saving & Restoration, Interview Panel (bottom-left), Language Tabs, Monaco Editor, Practice Workspace (`/practice/[questionId]`), Question Loading (+1 more)

### Community 22 - "Community 22"
Cohesion: 0.07
Nodes (28): C++ Execution Status, Confirmations, Confirmations, Current Limitations (Phase 2 initial), Current Limitations (Phase 2 Polish), Date, Date, Files Changed (+20 more)

### Community 24 - "Community 24"
Cohesion: 0.25
Nodes (8): Assessment Integrity Mode (Frontend), Edge cases, Fullscreen enforcement, Integrity event detection, Integrity status escalation, Practice Mode isolation, Pre-start rules modal, Submit and persistence

### Community 25 - "Community 25"
Cohesion: 0.22
Nodes (9): 2026-06-30 — Editor, Timer, and Assessment Session Control, Attempt tracking storage keys, Files changed, How Assessment Mode session control works, How editor behaviour now works, How the timer was fixed, Limitations, What should happen next (+1 more)

### Community 26 - "Community 26"
Cohesion: 0.25
Nodes (8): 2026-06-28 — Coding Workspace UI, Current Limitations, Files Changed, Languages Supported (editor UI only), Not Yet Implemented (future additions), Purpose, Suggested Next Steps (superseded by Phase 1), UI-Only — No Execution

### Community 27 - "Community 27"
Cohesion: 0.29
Nodes (7): Assessment Attempt Tracking, Assessment Mode Exit Guard, Assessment Mode — No Side Effects on Practice Mode, Assessment Mode Timer, Editor, Timer, and Assessment Session Control, Monaco Editor — No Suggestions, Practice Mode Timer

### Community 28 - "Community 28"
Cohesion: 0.06
Nodes (39): 2026-06-30 — Graphify CLI Restored, 2026-07-01 — Migration 004: Speech Transcripts, Test Runs Fix, Indexes, 2026-07-01 — Phase 4A Closeout, Auth Behaviour — Unchanged, Commands run, Commands run, Commands run, Date (+31 more)

### Community 29 - "Community 29"
Cohesion: 0.33
Nodes (6): 2026-06-29 20:50:00 AEST — Graphify Fallback Repair, Files/routes/components/tables changed, Issues encountered and assumptions made, Limitations that remain, What should happen next, What was completed

### Community 30 - "Community 30"
Cohesion: 0.33
Nodes (6): 2026-06-29 21:04:04 AEST — Graphify Dependency Cleanup, Files/routes/components/tables changed, Issues encountered and assumptions made, Limitations that remain, What should happen next, What was completed

### Community 31 - "Community 31"
Cohesion: 0.33
Nodes (6): Confirmed counts, Date, Design principles, Hidden Test Authoring — All 7 Questions, Hidden tests by question, Summary

### Community 32 - "Community 32"
Cohesion: 0.07
Nodes (33): AssessmentIntegrityGuard(), computeStatus(), Counts, EVENT_SEVERITY, LocalIntegrityEvent, Props, STATUS_STYLE, CATEGORY_LABELS (+25 more)

### Community 33 - "Community 33"
Cohesion: 0.33
Nodes (6): 2026-06-29 20:41:32 AEST — Phase 4A Deterministic Scorecards, Files/routes/components/tables changed, Issues encountered and assumptions made, Limitations that remain, What should happen next, What was completed

### Community 34 - "Community 34"
Cohesion: 0.33
Nodes (6): Dashboard — real attempt history, Phase 3 — Attempt Persistence, Results page — saved attempt, Submit button states, Submit fallback (Supabase unavailable), Submit saves to Supabase

### Community 35 - "Community 35"
Cohesion: 0.33
Nodes (6): Dashboard — score visibility, JavaScript failing public tests still persists scorecard, Phase 4A — Deterministic Scorecards, Results page — deterministic scorecards, Results page — public test summary and language handling, Scorecard persistence

### Community 36 - "Community 36"
Cohesion: 0.67
Nodes (3): Graphify Workflow, Rules, Session loop

### Community 38 - "Community 38"
Cohesion: 0.40
Nodes (5): Assessment Integrity Foundation (database only — no frontend UI yet), Migration applied correctly, RLS policies, RPC function, TypeScript helper (browser, not wired to UI yet)

### Community 39 - "Community 39"
Cohesion: 0.40
Nodes (5): Assessment Mode timer persists across reloads, Practice and Assessment timers are independent, Practice Mode timer persists across reloads and navigation, Timer Persistence, Timer resets correctly on new attempt

### Community 40 - "Community 40"
Cohesion: 0.40
Nodes (5): Auth, Email Confirmation Callback, Login (`/login`), Sign Out, Sign Up (`/signup`)

### Community 41 - "Community 41"
Cohesion: 0.25
Nodes (8): 2026-06-29 — Agent Instruction Consolidation, Files changed, Issues encountered, Limitations, What should happen next, What was added (new content, not previously in any file), What was completed, What was removed / consolidated

### Community 42 - "Community 42"
Cohesion: 0.25
Nodes (8): 2026-07-01 — Assessment Integrity Mode (Frontend), Files changed, Integrity event storage, Results page, What AssessmentIntegrityGuard does, What it does NOT do, What was completed, What was completed

### Community 43 - "Community 43"
Cohesion: 0.29
Nodes (7): 2026-06-30 — Persistent timer across reloads and navigation, Files changed, Files changed, How it works, Limitations, What should happen next, What was completed

### Community 44 - "Community 44"
Cohesion: 0.29
Nodes (7): 2026-06-30 — "Start" button in question library scrolls to setup section, Files changed, Limitations, Limitations, What should happen next, What should happen next, What was completed

## Knowledge Gaps
- **370 isolated node(s):** `LANGUAGE_LABELS`, `QuestionSummary`, `AttemptRowRaw`, `AttemptRow`, `metadata` (+365 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Documentation Log` connect `Community 5` to `Community 33`, `Community 36`, `Community 8`, `Community 41`, `Community 42`, `Community 43`, `Community 44`, `Community 17`, `Community 19`, `Community 22`, `Community 25`, `Community 26`, `Community 28`, `Community 29`, `Community 30`, `Community 31`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **Why does `createClient()` connect `Community 4` to `Community 9`, `Community 6`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `getSupabaseConfig()` connect `Community 4` to `Community 32`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **What connects `LANGUAGE_LABELS`, `QuestionSummary`, `AttemptRowRaw` to the rest of the system?**
  _370 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._