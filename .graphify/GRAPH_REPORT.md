# Graph Report - .  (2026-06-30)

## Corpus Check
- 57 files · ~66,621 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 253 nodes · 584 edges · 8 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output
- Edge kinds: contains: 164 · MODIFIES: 123 · ON_BRANCH: 82 · imports: 71 · imports_from: 55 · PARENT_OF: 48 · calls: 30 · references: 9 · triggers: 2


## Input Scope
- Requested: auto
- Resolved: committed (source: default-auto)
- Included files: 57 · Candidates: 89
- Excluded: 8 untracked · 44848 ignored · 0 sensitive · 2 missing committed
- Recommendation: Use --scope all or graphify.yaml inputs.corpus for a knowledge-base folder.

## Graph Freshness
- Built from Git commit: `2976802`
- Compare this hash to `git rev-parse HEAD` before trusting freshness-sensitive graph output.
## God Nodes (most connected - your core abstractions)
1. `calculateDeterministicScorecard()` - 13 edges
2. `clampScore()` - 9 edges
3. `createClient()` - 8 edges
4. `public.attempts` - 8 edges
5. `getSupabaseConfig()` - 6 edges
6. `scoreProblemUnderstanding()` - 5 edges
7. `scoreCommunication()` - 5 edges
8. `SupportedLanguage` - 5 edges
9. `PublicTestRunResult` - 5 edges
10. `PublicTestRunSummary` - 5 edges

## Surprising Connections (you probably didn't know these)
- `05165f4 Added code editor for practice demo` --ON_BRANCH--> `main`  [EXTRACTED]
  git → git  _Bridges community 6 → community 0_
- `26f9ded Merge pull request #1 from shahaidrr/phase-1-v1.0.0` --ON_BRANCH--> `main`  [EXTRACTED]
  git → git  _Bridges community 3 → community 0_
- `28a1956 Implement Phase 1: database-backed question library and practice workspace` --ON_BRANCH--> `main`  [EXTRACTED]
  git → git  _Bridges community 2 → community 0_
- `28a1956 Implement Phase 1: database-backed question library and practice workspace` --PARENT_OF--> `f65b270 Refactor /practice/[questionId] into integrated coding workspace`  [EXTRACTED]
  git → git  _Bridges community 2 → community 3_
- `2976802 Fix local Graphify workflow and remove wrong dependency` --ON_BRANCH--> `phase-4a-deterministic-scorecards`  [EXTRACTED]
  git → git  _Bridges community 1 → community 0_

## Communities

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (45): metadata, FeatureCardProps, navLinks, positioningChips, featureCards, steps, futureCards, dashboardPreviewStats (+37 more)

### Community 5 - "Community 5"
Cohesion: 0.23
Nodes (8): SupabaseConfig, getSupabaseKey(), getSupabaseKeyErrorMessage(), getSupabaseConfig(), updateSession(), config, 6b3243c add authentication, dashboard and supabase setup, 6b97f02 Fix Supabase auth configuration handling

### Community 4 - "Community 4"
Cohesion: 0.10
Nodes (10): LANGUAGE_LABELS, QuestionSummary, AttemptRowRaw, AttemptRow, DashboardCardProps, StatCardProps, createClient(), 3b7a101 changes to UI/UX, placeholders replaced with values from user connected to supabase; attempt submitted. improved UI, +14 hidden tests for each question and output input (+2 more)

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (24): VALID_MODES, VALID_LANGUAGES, Props, Props, DIFFICULTY_STYLES, LANGUAGE_OPTIONS, Props, metadata (+16 more)

### Community 3 - "Community 3"
Cohesion: 0.11
Nodes (29): CodeEditor, INTERVIEW_PANELS, PANEL_LABELS, LANGUAGE_OPTIONS, DIFFICULTY_COLORS, formatValue(), Props, DetailRow() (+21 more)

### Community 6 - "Community 6"
Cohesion: 0.18
Nodes (7): LANGUAGES, STARTER_CODE, ActiveTab, SidebarPanel, CodeEditorProps, INTERVIEW_OPTIONS, 05165f4 Added code editor for practice demo

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (42): LANGUAGE_LABELS, MODE_LABELS, CATEGORY_LABELS, formatDuration(), formatDateTime(), StoredResult, Props, ResultsPage() (+34 more)

### Community 7 - "Community 7"
Cohesion: 0.33
Nodes (10): public.questions, public.question_test_cases, public.attempts, auth.users, public.attempt_events, public.code_snapshots, public.test_runs, public.scorecards (+2 more)

## Knowledge Gaps
- **60 isolated node(s):** `LANGUAGE_LABELS`, `QuestionSummary`, `AttemptRowRaw`, `AttemptRow`, `metadata` (+55 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createClient()` connect `Community 2` to `Community 0`, `Community 4`, `Community 6`, `Community 5`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `LANGUAGE_LABELS`, `QuestionSummary`, `AttemptRowRaw` to the rest of the system?**
  _60 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06610259122157588 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.09538461538461539 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.08534850640113797 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.11261261261261261 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08078231292517007 - nodes in this community are weakly interconnected._