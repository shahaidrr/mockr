# Graph Report - mockr  (2026-06-28)

## Corpus Check
- 35 files · ~10,469 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 186 nodes · 194 edges · 17 communities (12 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f6e48348`
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
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 17 edges
2. `Documentation Log` - 15 edges
3. `createClient()` - 10 edges
4. `getSupabaseConfig()` - 9 edges
5. `2026-06-28 — Coding Workspace UI` - 8 edges
6. `scripts` - 5 edges
7. `auth/signout/route.ts` - 4 edges
8. `dashboard/page.tsx` - 4 edges
9. `landingPage/page.tsx` - 4 edges
10. `layout.tsx` - 4 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `createClient()`  [EXTRACTED]
  app/auth/callback/route.ts → lib/supabase/server.ts
- `POST()` --calls--> `createClient()`  [EXTRACTED]
  app/auth/signout/route.ts → lib/supabase/server.ts
- `DashboardPage()` --calls--> `createClient()`  [EXTRACTED]
  app/dashboard/page.tsx → lib/supabase/server.ts
- `DemoPracticePage()` --calls--> `createClient()`  [EXTRACTED]
  app/practice/demo/page.tsx → lib/supabase/server.ts
- `proxy()` --calls--> `updateSession()`  [EXTRACTED]
  proxy.ts → lib/supabase/proxy.ts

## Import Cycles
- None detected.

## Communities (17 total, 5 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (28): auth/signout/route.ts, ast_hash, mtime, semantic_hash, dashboard/page.tsx, ast_hash, mtime, semantic_hash (+20 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (24): dependencies, @monaco-editor/react, next, react, react-dom, @supabase/ssr, @supabase/supabase-js, devDependencies (+16 more)

### Community 2 - "Community 2"
Cohesion: 0.10
Nodes (20): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+12 more)

### Community 3 - "Community 3"
Cohesion: 0.10
Nodes (10): FeatureCardProps, dashboardPreviewStats, featureCards, futureCards, navLinks, positioningChips, steps, HeaderAction (+2 more)

### Community 4 - "Community 4"
Cohesion: 0.15
Nodes (12): GET(), DashboardCardProps, StatCard(), StatCardProps, DashboardPage(), recentAttempts, scoreBreakdown, stats (+4 more)

### Community 5 - "Community 5"
Cohesion: 0.12
Nodes (16): 2026-06-28 16:12:00 AEST, 2026-06-28 16:14:00 AEST, 2026-06-28 16:18:00 AEST, 2026-06-28 16:22:00 AEST, 2026-06-28 16:26:00 AEST, 2026-06-28 16:29:21 AEST, 2026-06-28 16:31:00 AEST, 2026-06-28 16:33:00 AEST (+8 more)

### Community 6 - "Community 6"
Cohesion: 0.24
Nodes (8): config, proxy(), createClient(), getSupabaseConfig(), getSupabaseKey(), getSupabaseKeyErrorMessage(), SupabaseConfig, updateSession()

### Community 7 - "Community 7"
Cohesion: 0.25
Nodes (6): CodeEditor(), CodeEditorProps, ActiveTab, LANGUAGES, SidebarPanel, STARTER_CODE

### Community 8 - "Community 8"
Cohesion: 0.25
Nodes (8): 2026-06-28 — Coding Workspace UI, Current Limitations, Files Changed, Languages Supported (editor UI only), Not Yet Implemented (future additions), Purpose, Suggested Next Steps, UI-Only — No Execution

### Community 10 - "Community 10"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 11 - "Community 11"
Cohesion: 0.50
Nodes (3): graphify, Graphify Usage, This is NOT the Next.js you know

### Community 17 - "Community 17"
Cohesion: 0.50
Nodes (4): layout.tsx, ast_hash, mtime, semantic_hash

## Knowledge Gaps
- **117 isolated node(s):** `graphify`, `Graphify Usage`, `Graphify Usage`, `Session loop`, `Rules` (+112 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createClient()` connect `Community 4` to `Community 6`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `getSupabaseConfig()` connect `Community 6` to `Community 4`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `Documentation Log` connect `Community 5` to `Community 8`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **What connects `graphify`, `Graphify Usage`, `Graphify Usage` to the rest of the system?**
  _117 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._