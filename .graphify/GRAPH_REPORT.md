# Graph Report - .  (2026-07-01)

## Corpus Check
- 62 files · ~86,806 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 297 nodes · 733 edges · 11 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output
- Edge kinds: contains: 196 · MODIFIES: 142 · ON_BRANCH: 135 · imports: 76 · imports_from: 61 · PARENT_OF: 58 · calls: 38 · references: 12 · re_exports: 7 · reads_from: 6 · triggers: 2


## Input Scope
- Requested: auto
- Resolved: committed (source: default-auto)
- Included files: 62 · Candidates: 99
- Excluded: 0 untracked · 45116 ignored · 0 sensitive · 0 missing committed
- Recommendation: Use --scope all or graphify.yaml inputs.corpus for a knowledge-base folder.

## Graph Freshness
- Built from Git commit: `8638301`
- Compare this hash to `git rev-parse HEAD` before trusting freshness-sensitive graph output.
## God Nodes (most connected - your core abstractions)
1. `calculateDeterministicScorecard()` - 13 edges
2. `clampScore()` - 9 edges
3. `createClient()` - 8 edges
4. `public.attempts` - 8 edges
5. `public.log_assessment_integrity_event()` - 7 edges
6. `createClient()` - 6 edges
7. `getSupabaseConfig()` - 6 edges
8. `scoreProblemUnderstanding()` - 5 edges
9. `scoreCommunication()` - 5 edges
10. `SupportedLanguage` - 5 edges

## Surprising Connections (you probably didn't know these)
- `26f9ded Merge pull request #1 from shahaidrr/phase-1-v1.0.0` --ON_BRANCH--> `main`  [EXTRACTED]
  git → git  _Bridges community 4 → community 1_
- `26f9ded Merge pull request #1 from shahaidrr/phase-1-v1.0.0` --PARENT_OF--> `4664dce Implement Phase 2 JavaScript public test execution`  [EXTRACTED]
  git → git  _Bridges community 4 → community 5_
- `28a1956 Implement Phase 1: database-backed question library and practice workspace` --PARENT_OF--> `e1f75a7 Fix start practising auth redirect`  [EXTRACTED]
  git → git  _Bridges community 4 → community 0_
- `3b7a101 changes to UI/UX, placeholders replaced with values from user connected to supabase; attempt submitted. improved UI, +14 hidden tests for each question and output input` --ON_BRANCH--> `main`  [EXTRACTED]
  git → git  _Bridges community 0 → community 1_
- `4664dce Implement Phase 2 JavaScript public test execution` --ON_BRANCH--> `main`  [EXTRACTED]
  git → git  _Bridges community 5 → community 1_

## Communities

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (24): metadata, 3b7a101 changes to UI/UX, placeholders replaced with values from user connected to supabase; attempt submitted. improved UI, +14 hidden tests for each question and output input, c1d2b76 Build MOCKR.AI MVP site skeleton, c3c34fe fixed vercel connecting issue, d5eca5c Merge pull request #4 from shahaidrr/UI/UX-upgrade, e1f75a7 Fix start practising auth redirect, DashboardCardProps, FeatureCardProps (+16 more)

### Community 1 - "Community 1"
Cohesion: 0.12
Nodes (44): main, phase-4a-closeout-validation, phase-4a-deterministic-scorecards, 05165f4 Added code editor for practice demo, 0aaf552 Merge branch 'main' of https://github.com/shahaidrr/mockr Merge confict resolved to push code editor, 2976802 Fix local Graphify workflow and remove wrong dependency, 35516e0 Fixed empty landing page route, 38e2be8 Small change to <a> color inheritance to fix buttons (+36 more)

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (40): AssessmentIntegrityGuard(), computeStatus(), Counts, EVENT_SEVERITY, LocalIntegrityEvent, Props, STATUS_STYLE, AttemptPublicTestSummary (+32 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (23): fetchPublicTestCases(), fetchPublishedQuestions(), fetchQuestionById(), fetchQuestionBySlug(), Props, VALID_LANGUAGES, VALID_MODES, metadata (+15 more)

### Community 4 - "Community 4"
Cohesion: 0.11
Nodes (29): 26f9ded Merge pull request #1 from shahaidrr/phase-1-v1.0.0, 28a1956 Implement Phase 1: database-backed question library and practice workspace, f65b270 Refactor /practice/[questionId] into integrated coding workspace, buildDraftKey(), buildEmptyDraft(), clearDraft(), loadDraft(), saveDraft() (+21 more)

### Community 5 - "Community 5"
Cohesion: 0.18
Nodes (16): CATEGORY_LABELS, formatDateTime(), formatDuration(), LANGUAGE_LABELS, MODE_LABELS, Props, ResultsPage(), StoredResult (+8 more)

### Community 6 - "Community 6"
Cohesion: 0.20
Nodes (8): 6b3243c add authentication, dashboard and supabase setup, 6b97f02 Fix Supabase auth configuration handling, config, getSupabaseConfig(), getSupabaseKey(), getSupabaseKeyErrorMessage(), SupabaseConfig, updateSession()

### Community 7 - "Community 7"
Cohesion: 0.27
Nodes (8): LogEventResult, AssessmentIntegrityEventPayload, AssessmentIntegrityEventType, AssessmentIntegritySeverity, AssessmentIntegrityStatus, AssessmentIntegritySummary, INTEGRITY_EVENT_SEVERITY, INTEGRITY_STATUS_LABELS

### Community 8 - "Community 8"
Cohesion: 0.33
Nodes (10): attempts_updated_at, auth.users, public.attempt_events, public.attempts, public.code_snapshots, public.question_test_cases, public.questions, public.scorecards (+2 more)

### Community 9 - "Community 9"
Cohesion: 0.40
Nodes (9): attempt, auth.users, public.assessment_integrity_events, public.attempts, public.log_assessment_integrity_event(), public.user_consents, v_event_id, v_low_count (+1 more)

### Community 10 - "Community 10"
Cohesion: 0.25
Nodes (4): ActiveTab, LANGUAGES, SidebarPanel, STARTER_CODE

## Knowledge Gaps
- **65 isolated node(s):** `LANGUAGE_LABELS`, `QuestionSummary`, `AttemptRowRaw`, `AttemptRow`, `metadata` (+60 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createClient()` connect `Community 0` to `Community 5`, `Community 7`, `Community 2`, `Community 6`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `createClient()` connect `Community 3` to `Community 0`, `Community 6`, `Community 10`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `LANGUAGE_LABELS`, `QuestionSummary`, `AttemptRowRaw` to the rest of the system?**
  _65 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05203619909502263 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.11755102040816326 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.0841813135985199 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.08253968253968254 - nodes in this community are weakly interconnected._