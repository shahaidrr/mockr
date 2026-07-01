# Graph Report - .  (2026-07-01)

## Corpus Check
- 65 files · ~89,360 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 321 nodes · 891 edges · 18 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output
- Edge kinds: ON_BRANCH: 244 · contains: 210 · MODIFIES: 155 · imports: 83 · PARENT_OF: 64 · imports_from: 63 · calls: 44 · references: 12 · re_exports: 7 · reads_from: 6 · triggers: 2 · method: 1


## Input Scope
- Requested: auto
- Resolved: committed (source: default-auto)
- Included files: 65 · Candidates: 102
- Excluded: 4 untracked · 45278 ignored · 0 sensitive · 0 missing committed
- Recommendation: Use --scope all or graphify.yaml inputs.corpus for a knowledge-base folder.

## Graph Freshness
- Built from Git commit: `2367649`
- Compare this hash to `git rev-parse HEAD` before trusting freshness-sensitive graph output.
## God Nodes (most connected - your core abstractions)
1. `calculateDeterministicScorecard()` - 13 edges
2. `clampScore()` - 9 edges
3. `createClient()` - 8 edges
4. `public.attempts` - 8 edges
5. `public.log_assessment_integrity_event()` - 7 edges
6. `generateJsonWithDeepSeek()` - 6 edges
7. `createClient()` - 6 edges
8. `getSupabaseConfig()` - 6 edges
9. `DeepSeekError` - 5 edges
10. `scoreProblemUnderstanding()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `26f9ded Merge pull request #1 from shahaidrr/phase-1-v1.0.0` --PARENT_OF--> `4664dce Implement Phase 2 JavaScript public test execution`  [EXTRACTED]
  git → git  _Bridges community 1 → community 2_
- `3b7a101 changes to UI/UX, placeholders replaced with values from user connected to supabase; attempt submitted. improved UI, +14 hidden tests for each question and output input` --ON_BRANCH--> `main`  [EXTRACTED]
  git → git  _Bridges community 10 → community 1_
- `673550b created documentation file` --PARENT_OF--> `c1d2b76 Build MOCKR.AI MVP site skeleton`  [EXTRACTED]
  git → git  _Bridges community 1 → community 5_
- `6b97f02 Fix Supabase auth configuration handling` --ON_BRANCH--> `main`  [EXTRACTED]
  git → git  _Bridges community 3 → community 1_
- `c1d2b76 Build MOCKR.AI MVP site skeleton` --PARENT_OF--> `6b97f02 Fix Supabase auth configuration handling`  [EXTRACTED]
  git → git  _Bridges community 5 → community 3_

## Communities

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (47): AssessmentIntegrityGuard(), computeStatus(), Counts, EVENT_SEVERITY, LocalIntegrityEvent, Props, STATUS_STYLE, CATEGORY_LABELS (+39 more)

### Community 1 - "Community 1"
Cohesion: 0.17
Nodes (50): main, phase-4a-closeout-validation, phase-4a-deterministic-scorecards, phase-4b-2-ai-grading-service, phase-4b-api-implementation, 05165f4 Added code editor for practice demo, 0aaf552 Merge branch 'main' of https://github.com/shahaidrr/mockr Merge confict resolved to push code editor, 1d8a332 Merge pull request #8 from shahaidrr/phase-4a-closeout-validation (+42 more)

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (45): 28a1956 Implement Phase 1: database-backed question library and practice workspace, 4664dce Implement Phase 2 JavaScript public test execution, 6c2726c added python, report page, submit warning, c2b927c Merge pull request #3 from shahaidrr/phase-2-js-public-tests, db4d01b Merge pull request #2 from shahaidrr/phase-2-js-public-tests, f65b270 Refactor /practice/[questionId] into integrated coding workspace, buildDraftKey(), buildEmptyDraft() (+37 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (18): 6b97f02 Fix Supabase auth configuration handling, fetchPublicTestCases(), fetchPublishedQuestions(), fetchQuestionById(), fetchQuestionBySlug(), config, Props, VALID_LANGUAGES (+10 more)

### Community 4 - "Community 4"
Cohesion: 0.20
Nodes (13): buildJsonPrompt(), DeepSeekChatCompletionResponse, DeepSeekConfig, DeepSeekError, generateJsonWithDeepSeek(), getDeepSeekConfig(), getDeepSeekServerConfig(), getErrorMessage() (+5 more)

### Community 5 - "Community 5"
Cohesion: 0.17
Nodes (4): metadata, c1d2b76 Build MOCKR.AI MVP site skeleton, DashboardCardProps, StatCardProps

### Community 6 - "Community 6"
Cohesion: 0.17
Nodes (8): FeatureCardProps, dashboardPreviewStats, featureCards, futureCards, LandingPageProps, navLinks, positioningChips, steps

### Community 7 - "Community 7"
Cohesion: 0.27
Nodes (8): LogEventResult, AssessmentIntegrityEventPayload, AssessmentIntegrityEventType, AssessmentIntegritySeverity, AssessmentIntegrityStatus, AssessmentIntegritySummary, INTEGRITY_EVENT_SEVERITY, INTEGRITY_STATUS_LABELS

### Community 8 - "Community 8"
Cohesion: 0.33
Nodes (10): attempts_updated_at, auth.users, public.attempt_events, public.attempts, public.code_snapshots, public.question_test_cases, public.questions, public.scorecards (+2 more)

### Community 9 - "Community 9"
Cohesion: 0.20
Nodes (2): d5eca5c Merge pull request #4 from shahaidrr/UI/UX-upgrade, createClient()

### Community 10 - "Community 10"
Cohesion: 0.20
Nodes (6): 3b7a101 changes to UI/UX, placeholders replaced with values from user connected to supabase; attempt submitted. improved UI, +14 hidden tests for each question and output input, c3c34fe fixed vercel connecting issue, AttemptRow, AttemptRowRaw, LANGUAGE_LABELS, QuestionSummary

### Community 11 - "Community 11"
Cohesion: 0.40
Nodes (9): attempt, auth.users, public.assessment_integrity_events, public.attempts, public.log_assessment_integrity_event(), public.user_consents, v_event_id, v_low_count (+1 more)

### Community 12 - "Community 12"
Cohesion: 0.33
Nodes (4): ActiveTab, LANGUAGES, SidebarPanel, STARTER_CODE

### Community 13 - "Community 13"
Cohesion: 0.33
Nodes (4): DIFFICULTY_STYLES, LANGUAGE_LABELS, Props, Difficulty

### Community 14 - "Community 14"
Cohesion: 0.40
Nodes (3): HeaderAction, NavLink, SiteHeaderProps

### Community 15 - "Community 15"
Cohesion: 1.00
Nodes (1): eslintConfig

### Community 16 - "Community 16"
Cohesion: 1.00
Nodes (1): nextConfig

### Community 17 - "Community 17"
Cohesion: 1.00
Nodes (1): config

## Knowledge Gaps
- **68 isolated node(s):** `HealthPayload`, `LANGUAGE_LABELS`, `QuestionSummary`, `AttemptRowRaw`, `AttemptRow` (+63 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 9`** (2 nodes): `d5eca5c Merge pull request #4 from shahaidrr/UI/UX-upgrade`, `createClient()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (1 nodes): `eslintConfig`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (1 nodes): `nextConfig`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (1 nodes): `config`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createClient()` connect `Community 9` to `Community 0`, `Community 7`, `Community 3`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `createClient()` connect `Community 3` to `Community 9`, `Community 10`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **What connects `HealthPayload`, `LANGUAGE_LABELS`, `QuestionSummary` to the rest of the system?**
  _68 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06918238993710692 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.07756813417190776 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.08108108108108109 - nodes in this community are weakly interconnected._