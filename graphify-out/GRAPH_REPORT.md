# Graph Report - mockr  (2026-06-29)

## Corpus Check
- 55 files · ~32,547 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 411 nodes · 497 edges · 25 communities (21 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d5eca5c7`
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
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 24|Community 24]]

## God Nodes (most connected - your core abstractions)
1. `Documentation Log` - 21 edges
2. `createClient()` - 19 edges
3. `compilerOptions` - 17 edges
4. `Phase 2 Polish — Multi-Language Public Test Runner` - 17 edges
5. `Phase 2 — JavaScript Public Test Execution` - 17 edges
6. `MOCKR.AI — Feature Testing Checklist` - 13 edges
7. `Phase 2 Polish — Multi-Language Public Test Execution` - 13 edges
8. `Landing Header Fix + Phase 3 — Attempt Persistence` - 11 edges
9. `AGENTS.md — MOCKR.AI Canonical Agent Instructions` - 10 edges
10. `Phase 1 — Database-backed Question Library and Practice Workspace` - 10 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `createClient()`  [EXTRACTED]
  app/auth/callback/route.ts → lib/supabase/server.ts
- `POST()` --calls--> `createClient()`  [EXTRACTED]
  app/auth/signout/route.ts → lib/supabase/server.ts
- `DashboardPage()` --calls--> `createClient()`  [EXTRACTED]
  app/dashboard/page.tsx → lib/supabase/server.ts
- `Home()` --calls--> `createClient()`  [EXTRACTED]
  app/page.tsx → lib/supabase/server.ts
- `DemoPracticePage()` --calls--> `createClient()`  [EXTRACTED]
  app/practice/demo/page.tsx → lib/supabase/server.ts

## Import Cycles
- None detected.

## Communities (25 total, 4 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (32): auth/signout/route.ts, ast_hash, mtime, semantic_hash, dashboard/page.tsx, ast_hash, mtime, semantic_hash (+24 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (24): dependencies, @monaco-editor/react, next, react, react-dom, @supabase/ssr, @supabase/supabase-js, devDependencies (+16 more)

### Community 2 - "Community 2"
Cohesion: 0.10
Nodes (20): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+12 more)

### Community 3 - "Community 3"
Cohesion: 0.11
Nodes (11): FeatureCardProps, dashboardPreviewStats, featureCards, futureCards, LandingPageProps, navLinks, positioningChips, steps (+3 more)

### Community 4 - "Community 4"
Cohesion: 0.10
Nodes (19): Home(), GET(), DashboardCardProps, StatCard(), StatCardProps, AttemptRow, AttemptRowRaw, DashboardPage() (+11 more)

### Community 5 - "Community 5"
Cohesion: 0.05
Nodes (38): 2026-06-28 16:12:00 AEST, 2026-06-28 16:14:00 AEST, 2026-06-28 16:18:00 AEST, 2026-06-28 16:22:00 AEST, 2026-06-28 16:26:00 AEST, 2026-06-28 16:29:21 AEST, 2026-06-28 16:31:00 AEST, 2026-06-28 16:33:00 AEST (+30 more)

### Community 6 - "Community 6"
Cohesion: 0.10
Nodes (19): formatDuration(), LANGUAGE_LABELS, MODE_LABELS, Props, ResultsPage(), StoredResult, fetchAttemptById(), fetchRecentAttempts() (+11 more)

### Community 7 - "Community 7"
Cohesion: 0.25
Nodes (6): CodeEditor(), CodeEditorProps, ActiveTab, LANGUAGES, SidebarPanel, STARTER_CODE

### Community 8 - "Community 8"
Cohesion: 0.20
Nodes (10): Files Created, Files Modified, New Routes, Overview, Phase 1 — Database-backed Question Library and Practice Workspace, Phase 1 Limitations, Phases Roadmap, Practice Workspace Layout (integrated coding environment) (+2 more)

### Community 9 - "Community 9"
Cohesion: 0.12
Nodes (24): buildDraftKey(), buildEmptyDraft(), clearDraft(), loadDraft(), saveDraft(), runPublicTests(), spawnWorker(), CodeEditor (+16 more)

### Community 10 - "Community 10"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 11 - "Community 11"
Cohesion: 0.12
Nodes (16): 1. Read context first, 2. Query Graphify before touching source files, 3. After meaningful changes — update Graphify, AGENTS.md — MOCKR.AI Canonical Agent Instructions, Before Every Task — Mandatory Orientation, Documentation Workflow, Execution Workflow for Large Tasks, Git Rules (+8 more)

### Community 17 - "Community 17"
Cohesion: 0.18
Nodes (11): Current Limitations, Date, Landing Header Fix, Landing Header Fix + Phase 3 — Attempt Persistence, Phase 3 Files Changed, Phase 3 Files Created, Phase 3 Polish (same session), Recommended Next Steps (+3 more)

### Community 18 - "Community 18"
Cohesion: 0.40
Nodes (4): AttemptMode, AttemptStatus, ResultBand, SupportedLanguage

### Community 19 - "Community 19"
Cohesion: 0.12
Nodes (20): fetchPublishedQuestions(), fetchQuestionBySlug(), metadata, QuestionsPage(), DIFFICULTY_STYLES, LANGUAGE_LABELS, Props, generateMetadata() (+12 more)

### Community 20 - "Community 20"
Cohesion: 0.06
Nodes (30): Assessment Mode Timer, Auth, Auth Gate, Cross-cutting, Dashboard (`/dashboard`), Dashboard — real attempt history, Draft Saving & Restoration, Email Confirmation Callback (+22 more)

### Community 21 - "Community 21"
Cohesion: 0.12
Nodes (17): Disable during run, Error Tests — JavaScript, Error Tests — Python, Failing Tests — JavaScript, Failing Tests — Python, No Public Test Cases (edge case), Passing Tests — JavaScript, Passing Tests — Python (+9 more)

### Community 22 - "Community 22"
Cohesion: 0.11
Nodes (19): C++ Execution Status, Commands run, Confirmations, Current Limitations (Phase 2 Polish), Date, Environment variables required, Files Changed, Graphify (+11 more)

### Community 24 - "Community 24"
Cohesion: 0.12
Nodes (16): Confirmations, Current Limitations (Phase 2 initial), Date, Files Changed, Files Created, How JavaScript Execution Works, How Output Is Displayed, How Public Test Cases Are Fetched (+8 more)

## Knowledge Gaps
- **259 isolated node(s):** `LANGUAGE_LABELS`, `QuestionSummary`, `AttemptRowRaw`, `AttemptRow`, `metadata` (+254 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createClient()` connect `Community 4` to `Community 19`, `Community 6`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `Documentation Log` connect `Community 5` to `Community 8`, `Community 17`, `Community 24`, `Community 22`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `getSupabaseConfig()` connect `Community 6` to `Community 4`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **What connects `LANGUAGE_LABELS`, `QuestionSummary`, `AttemptRowRaw` to the rest of the system?**
  _259 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._