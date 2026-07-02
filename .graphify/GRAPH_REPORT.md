# Graph Report - .  (2026-07-02)

## Corpus Check
- 71 files · ~97,263 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 415 nodes · 1254 edges · 15 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output
- Edge kinds: ON_BRANCH: 359 · contains: 291 · MODIFIES: 171 · calls: 126 · imports: 125 · imports_from: 85 · PARENT_OF: 67 · references: 12 · re_exports: 7 · reads_from: 6 · method: 3 · triggers: 2


## Input Scope
- Requested: auto
- Resolved: committed (source: default-auto)
- Included files: 71 · Candidates: 108
- Excluded: 1 untracked · 45554 ignored · 0 sensitive · 0 missing committed
- Recommendation: Use --scope all or graphify.yaml inputs.corpus for a knowledge-base folder.

## Graph Freshness
- Built from Git commit: `ab497d2`
- Compare this hash to `git rev-parse HEAD` before trusting freshness-sensitive graph output.
## God Nodes (most connected - your core abstractions)
1. `calculateDeterministicScorecard()` - 13 edges
2. `SubmitPracticeAttemptError` - 12 edges
3. `GradeAttemptValidationError` - 11 edges
4. `parseGradeAttemptInput()` - 11 edges
5. `parseSubmitPracticeAttemptRequest()` - 10 edges
6. `createClient()` - 10 edges
7. `clampScore()` - 9 edges
8. `gradeAttemptWithAI()` - 8 edges
9. `readObject()` - 8 edges
10. `public.attempts` - 8 edges

## Surprising Connections (you probably didn't know these)
- `1d8a332 Merge pull request #8 from shahaidrr/phase-4a-closeout-validation` --ON_BRANCH--> `phase-4b-2-ai-grading-service`  [EXTRACTED]
  git → git  _Bridges community 1 → community 2_
- `2367649 Merge branch 'main' of https://github.com/shahaidrr/mockr into phase-4b-api-implementation` --PARENT_OF--> `4bee408 Added isolated authenticated AI grading service and grade route`  [EXTRACTED]
  git → git  _Bridges community 2 → community 0_
- `3b7a101 changes to UI/UX, placeholders replaced with values from user connected to supabase; attempt submitted. improved UI, +14 hidden tests for each question and output input` --ON_BRANCH--> `main`  [EXTRACTED]
  git → git  _Bridges community 3 → community 2_

## Communities

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (64): buildJsonPrompt(), DeepSeekChatCompletionResponse, DeepSeekConfig, DeepSeekError, generateJsonWithDeepSeek(), getDeepSeekConfig(), getDeepSeekServerConfig(), getErrorMessage() (+56 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (51): 1d8a332 Merge pull request #8 from shahaidrr/phase-4a-closeout-validation, 28a1956 Implement Phase 1: database-backed question library and practice workspace, 4664dce Implement Phase 2 JavaScript public test execution, 8f31cdd Enforce practice interview stages and fix runner starter/output consistency, db4d01b Merge pull request #2 from shahaidrr/phase-2-js-public-tests, CodeEditorProps, INTERVIEW_OPTIONS, buildDraftKey() (+43 more)

### Community 2 - "Community 2"
Cohesion: 0.23
Nodes (53): main, phase-4a-closeout-validation, phase-4a-deterministic-scorecards, phase-4b-2-ai-grading-service, phase-4b-3-wire-ai-grading-persistence, phase-4b-4-scorecard-polish-reliability, phase-4b-api-implementation, 05165f4 Added code editor for practice demo (+45 more)

### Community 3 - "Community 3"
Cohesion: 0.05
Nodes (21): 3b7a101 changes to UI/UX, placeholders replaced with values from user connected to supabase; attempt submitted. improved UI, +14 hidden tests for each question and output input, c3c34fe fixed vercel connecting issue, d5eca5c Merge pull request #4 from shahaidrr/UI/UX-upgrade, DashboardCardProps, FeatureCardProps, dashboardPreviewStats, featureCards, futureCards (+13 more)

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (32): AssessmentIntegrityGuard(), computeStatus(), Counts, EVENT_SEVERITY, LocalIntegrityEvent, Props, STATUS_STYLE, CATEGORY_LABELS (+24 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (18): ActiveTab, LANGUAGES, SidebarPanel, STARTER_CODE, fetchPublicTestCases(), fetchQuestionById(), fetchQuestionBySlug(), Props (+10 more)

### Community 6 - "Community 6"
Cohesion: 0.14
Nodes (28): buildLists(), calculateDeterministicScorecard(), clampScore(), countMatches(), countWords(), getResultBand(), normaliseText(), scoreAlgorithmicApproach() (+20 more)

### Community 7 - "Community 7"
Cohesion: 0.20
Nodes (21): isObject(), normaliseTestSummary(), parseIntegrityEvent(), parseSubmitPracticeAttemptRequest(), parseTestResult(), parseTestSummary(), readNonNegativeNumber(), readNullableNumber() (+13 more)

### Community 8 - "Community 8"
Cohesion: 0.33
Nodes (10): attempts_updated_at, auth.users, public.attempt_events, public.attempts, public.code_snapshots, public.question_test_cases, public.questions, public.scorecards (+2 more)

### Community 9 - "Community 9"
Cohesion: 0.40
Nodes (9): attempt, auth.users, public.assessment_integrity_events, public.attempts, public.log_assessment_integrity_event(), public.user_consents, v_event_id, v_low_count (+1 more)

### Community 10 - "Community 10"
Cohesion: 0.29
Nodes (6): config, getSupabaseConfig(), getSupabaseKey(), getSupabaseKeyErrorMessage(), SupabaseConfig, updateSession()

### Community 11 - "Community 11"
Cohesion: 0.67
Nodes (1): metadata

### Community 12 - "Community 12"
Cohesion: 1.00
Nodes (1): eslintConfig

### Community 13 - "Community 13"
Cohesion: 1.00
Nodes (1): nextConfig

### Community 14 - "Community 14"
Cohesion: 1.00
Nodes (1): config

## Knowledge Gaps
- **84 isolated node(s):** `HealthPayload`, `LANGUAGE_LABELS`, `QuestionSummary`, `AttemptRowRaw`, `AttemptRow` (+79 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 11`** (1 nodes): `metadata`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 12`** (1 nodes): `eslintConfig`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (1 nodes): `nextConfig`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (1 nodes): `config`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createClient()` connect `Community 5` to `Community 3`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `SubmitPracticeAttemptError` connect `Community 7` to `Community 1`, `Community 5`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `ResultBand` connect `Community 6` to `Community 0`, `Community 4`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `HealthPayload`, `LANGUAGE_LABELS`, `QuestionSummary` to the rest of the system?**
  _84 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05898021308980213 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05879692446856626 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.05410628019323672 - nodes in this community are weakly interconnected._