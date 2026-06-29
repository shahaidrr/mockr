# Graph Report - mockr  (2026-06-29)

## Corpus Check
- 51 files · ~22,837 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 287 nodes · 357 edges · 22 communities (16 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `26f9ded8`
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

## God Nodes (most connected - your core abstractions)
1. `createClient()` - 19 edges
2. `compilerOptions` - 17 edges
3. `Documentation Log` - 17 edges
4. `Phase 2 — JavaScript Public Test Execution` - 16 edges
5. `Phase 1 — Database-backed Question Library and Practice Workspace` - 10 edges
6. `getSupabaseConfig()` - 9 edges
7. `2026-06-28 — Coding Workspace UI` - 8 edges
8. `fetchQuestionBySlug()` - 5 edges
9. `scripts` - 5 edges
10. `PracticePage()` - 4 edges

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

## Communities (22 total, 6 thin omitted)

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
Cohesion: 0.16
Nodes (16): Home(), GET(), DemoPracticePage(), fetchPublicTestCases(), fetchQuestionById(), fetchQuestionBySlug(), PracticePage(), Props (+8 more)

### Community 5 - "Community 5"
Cohesion: 0.07
Nodes (26): 2026-06-28 16:12:00 AEST, 2026-06-28 16:14:00 AEST, 2026-06-28 16:18:00 AEST, 2026-06-28 16:22:00 AEST, 2026-06-28 16:26:00 AEST, 2026-06-28 16:29:21 AEST, 2026-06-28 16:31:00 AEST, 2026-06-28 16:33:00 AEST (+18 more)

### Community 6 - "Community 6"
Cohesion: 0.24
Nodes (8): config, proxy(), createClient(), getSupabaseConfig(), getSupabaseKey(), getSupabaseKeyErrorMessage(), SupabaseConfig, updateSession()

### Community 7 - "Community 7"
Cohesion: 0.25
Nodes (6): CodeEditor(), CodeEditorProps, ActiveTab, LANGUAGES, SidebarPanel, STARTER_CODE

### Community 8 - "Community 8"
Cohesion: 0.13
Nodes (16): fetchPublishedQuestions(), metadata, QuestionsPage(), DIFFICULTY_STYLES, LANGUAGE_LABELS, Props, DIFFICULTY_STYLES, LANGUAGE_OPTIONS (+8 more)

### Community 9 - "Community 9"
Cohesion: 0.12
Nodes (22): buildDraftKey(), buildEmptyDraft(), clearDraft(), loadDraft(), saveDraft(), runPublicTests(), CodeEditor, DetailRow() (+14 more)

### Community 10 - "Community 10"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 11 - "Community 11"
Cohesion: 0.40
Nodes (4): graphify, Graphify Usage, MANDATORY: Query Graphify Before Reading Files, This is NOT the Next.js you know

### Community 17 - "Community 17"
Cohesion: 0.12
Nodes (16): Confirmations, Current Limitations, Date, Files Changed, Files Created, How JavaScript Execution Works, How Output Is Displayed, How Public Test Cases Are Fetched (+8 more)

### Community 18 - "Community 18"
Cohesion: 0.40
Nodes (4): AttemptMode, AttemptStatus, ResultBand, SupportedLanguage

### Community 20 - "Community 20"
Cohesion: 0.18
Nodes (8): DashboardCardProps, StatCard(), StatCardProps, DashboardPage(), recentAttempts, scoreBreakdown, stats, weaknesses

### Community 21 - "Community 21"
Cohesion: 0.25
Nodes (8): 2026-06-28 — Coding Workspace UI, Current Limitations, Files Changed, Languages Supported (editor UI only), Not Yet Implemented (future additions), Purpose, Suggested Next Steps (superseded by Phase 1), UI-Only — No Execution

## Knowledge Gaps
- **168 isolated node(s):** `stats`, `recentAttempts`, `scoreBreakdown`, `weaknesses`, `metadata` (+163 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createClient()` connect `Community 4` to `Community 8`, `Community 20`, `Community 6`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Why does `getSupabaseConfig()` connect `Community 6` to `Community 4`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Why does `Documentation Log` connect `Community 5` to `Community 17`, `Community 21`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **What connects `stats`, `recentAttempts`, `scoreBreakdown` to the rest of the system?**
  _168 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._