# Graph Report - .  (2026-07-01)

## Corpus Check
- 58 files · ~68,080 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 255 nodes · 637 edges · 8 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output
- Edge kinds: contains: 164 · ON_BRANCH: 129 · MODIFIES: 127 · imports: 71 · imports_from: 55 · PARENT_OF: 50 · calls: 30 · references: 9 · triggers: 2


## Input Scope
- Requested: auto
- Resolved: committed (source: default-auto)
- Included files: 58 · Candidates: 95
- Excluded: 0 untracked · 44852 ignored · 0 sensitive · 0 missing committed
- Recommendation: Use --scope all or graphify.yaml inputs.corpus for a knowledge-base folder.

## Graph Freshness
- Built from Git commit: `a808551`
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
- `26f9ded Merge pull request #1 from shahaidrr/phase-1-v1.0.0` --PARENT_OF--> `4664dce Implement Phase 2 JavaScript public test execution`  [EXTRACTED]
  git → git  _Bridges community 2 → community 4_
- `28a1956 Implement Phase 1: database-backed question library and practice workspace` --ON_BRANCH--> `main`  [EXTRACTED]
  git → git  _Bridges community 0 → community 2_
- `3b7a101 changes to UI/UX, placeholders replaced with values from user connected to supabase; attempt submitted. improved UI, +14 hidden tests for each question and output input` --ON_BRANCH--> `main`  [EXTRACTED]
  git → git  _Bridges community 1 → community 2_
- `6b3243c add authentication, dashboard and supabase setup` --ON_BRANCH--> `main`  [EXTRACTED]
  git → git  _Bridges community 5 → community 2_
- `c1d2b76 Build MOCKR.AI MVP site skeleton` --PARENT_OF--> `6b97f02 Fix Supabase auth configuration handling`  [EXTRACTED]
  git → git  _Bridges community 1 → community 5_

## Communities

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (40): 28a1956 Implement Phase 1: database-backed question library and practice workspace, f65b270 Refactor /practice/[questionId] into integrated coding workspace, buildDraftKey(), buildEmptyDraft(), clearDraft(), loadDraft(), saveDraft(), fetchPublicTestCases() (+32 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (23): metadata, 3b7a101 changes to UI/UX, placeholders replaced with values from user connected to supabase; attempt submitted. improved UI, +14 hidden tests for each question and output input, c1d2b76 Build MOCKR.AI MVP site skeleton, c3c34fe fixed vercel connecting issue, d5eca5c Merge pull request #4 from shahaidrr/UI/UX-upgrade, DashboardCardProps, FeatureCardProps, dashboardPreviewStats (+15 more)

### Community 2 - "Community 2"
Cohesion: 0.11
Nodes (43): main, phase-4a-closeout-validation, phase-4a-deterministic-scorecards, 05165f4 Added code editor for practice demo, 0aaf552 Merge branch 'main' of https://github.com/shahaidrr/mockr Merge confict resolved to push code editor, 26f9ded Merge pull request #1 from shahaidrr/phase-1-v1.0.0, 2976802 Fix local Graphify workflow and remove wrong dependency, 35516e0 Fixed empty landing page route (+35 more)

### Community 3 - "Community 3"
Cohesion: 0.12
Nodes (30): AttemptPublicTestSummary, fetchAttemptById(), SavedAttempt, submitAttempt(), SubmitAttemptArgs, buildLists(), calculateDeterministicScorecard(), clampScore() (+22 more)

### Community 4 - "Community 4"
Cohesion: 0.15
Nodes (19): CATEGORY_LABELS, formatDateTime(), formatDuration(), LANGUAGE_LABELS, MODE_LABELS, Props, ResultsPage(), StoredResult (+11 more)

### Community 5 - "Community 5"
Cohesion: 0.20
Nodes (8): 6b3243c add authentication, dashboard and supabase setup, 6b97f02 Fix Supabase auth configuration handling, config, getSupabaseConfig(), getSupabaseKey(), getSupabaseKeyErrorMessage(), SupabaseConfig, updateSession()

### Community 6 - "Community 6"
Cohesion: 0.33
Nodes (10): attempts_updated_at, auth.users, public.attempt_events, public.attempts, public.code_snapshots, public.question_test_cases, public.questions, public.scorecards (+2 more)

### Community 7 - "Community 7"
Cohesion: 0.25
Nodes (4): ActiveTab, LANGUAGES, SidebarPanel, STARTER_CODE

## Knowledge Gaps
- **60 isolated node(s):** `LANGUAGE_LABELS`, `QuestionSummary`, `AttemptRowRaw`, `AttemptRow`, `metadata` (+55 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createClient()` connect `Community 0` to `Community 1`, `Community 5`, `Community 7`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `LANGUAGE_LABELS`, `QuestionSummary`, `AttemptRowRaw` to the rest of the system?**
  _60 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06352087114337568 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05254901960784314 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.11294117647058824 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.11932773109243698 - nodes in this community are weakly interconnected._