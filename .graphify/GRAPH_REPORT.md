# Graph Report - .  (2026-07-02)

## Corpus Check
- 69 files · ~93,696 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 377 nodes · 1081 edges · 10 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output
- Edge kinds: ON_BRANCH: 300 · contains: 259 · MODIFIES: 161 · imports: 105 · calls: 88 · imports_from: 74 · PARENT_OF: 65 · references: 12 · re_exports: 7 · reads_from: 6 · method: 2 · triggers: 2


## Input Scope
- Requested: auto
- Resolved: committed (source: default-auto)
- Included files: 69 · Candidates: 106
- Excluded: 2 untracked · 45439 ignored · 0 sensitive · 0 missing committed
- Recommendation: Use --scope all or graphify.yaml inputs.corpus for a knowledge-base folder.

## Graph Freshness
- Built from Git commit: `4bee408`
- Compare this hash to `git rev-parse HEAD` before trusting freshness-sensitive graph output.
## God Nodes (most connected - your core abstractions)
1. `calculateDeterministicScorecard()` - 13 edges
2. `GradeAttemptValidationError` - 11 edges
3. `parseGradeAttemptInput()` - 11 edges
4. `clampScore()` - 9 edges
5. `createClient()` - 9 edges
6. `public.attempts` - 8 edges
7. `generateJsonWithDeepSeek()` - 7 edges
8. `readObject()` - 7 edges
9. `gradeAttemptWithAI()` - 7 edges
10. `public.log_assessment_integrity_event()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `1d8a332 Merge pull request #8 from shahaidrr/phase-4a-closeout-validation` --ON_BRANCH--> `phase-4b-2-ai-grading-service`  [EXTRACTED]
  git → git  _Bridges community 0 → community 2_
- `1d8a332 Merge pull request #8 from shahaidrr/phase-4a-closeout-validation` --PARENT_OF--> `2367649 Merge branch 'main' of https://github.com/shahaidrr/mockr into phase-4b-api-implementation`  [EXTRACTED]
  git → git  _Bridges community 0 → community 6_
- `2367649 Merge branch 'main' of https://github.com/shahaidrr/mockr into phase-4b-api-implementation` --ON_BRANCH--> `phase-4b-2-ai-grading-service`  [EXTRACTED]
  git → git  _Bridges community 6 → community 2_
- `3b7a101 changes to UI/UX, placeholders replaced with values from user connected to supabase; attempt submitted. improved UI, +14 hidden tests for each question and output input` --ON_BRANCH--> `main`  [EXTRACTED]
  git → git  _Bridges community 4 → community 2_
- `6b97f02 Fix Supabase auth configuration handling` --ON_BRANCH--> `main`  [EXTRACTED]
  git → git  _Bridges community 5 → community 2_

## Communities

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (53): 1d8a332 Merge pull request #8 from shahaidrr/phase-4a-closeout-validation, 28a1956 Implement Phase 1: database-backed question library and practice workspace, 4664dce Implement Phase 2 JavaScript public test execution, 8f31cdd Enforce practice interview stages and fix runner starter/output consistency, db4d01b Merge pull request #2 from shahaidrr/phase-2-js-public-tests, CodeEditorProps, INTERVIEW_OPTIONS, buildDraftKey() (+45 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (49): AssessmentIntegrityGuard(), computeStatus(), Counts, EVENT_SEVERITY, LocalIntegrityEvent, Props, STATUS_STYLE, CATEGORY_LABELS (+41 more)

### Community 2 - "Community 2"
Cohesion: 0.19
Nodes (51): main, phase-4a-closeout-validation, phase-4a-deterministic-scorecards, phase-4b-2-ai-grading-service, phase-4b-3-wire-ai-grading-persistence, phase-4b-api-implementation, 05165f4 Added code editor for practice demo, 0aaf552 Merge branch 'main' of https://github.com/shahaidrr/mockr Merge confict resolved to push code editor (+43 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (46): applyCategoryCaps(), applyOverallCaps(), buildCategory(), buildLimitations(), calculateCodeCorrectness(), calculatePassRate(), calculateWeightedOverall(), clampScore() (+38 more)

### Community 4 - "Community 4"
Cohesion: 0.05
Nodes (23): metadata, 3b7a101 changes to UI/UX, placeholders replaced with values from user connected to supabase; attempt submitted. improved UI, +14 hidden tests for each question and output input, c1d2b76 Build MOCKR.AI MVP site skeleton, c3c34fe fixed vercel connecting issue, d5eca5c Merge pull request #4 from shahaidrr/UI/UX-upgrade, DashboardCardProps, FeatureCardProps, dashboardPreviewStats (+15 more)

### Community 5 - "Community 5"
Cohesion: 0.08
Nodes (19): 6b97f02 Fix Supabase auth configuration handling, ActiveTab, LANGUAGES, SidebarPanel, STARTER_CODE, fetchPublicTestCases(), fetchQuestionById(), fetchQuestionBySlug() (+11 more)

### Community 6 - "Community 6"
Cohesion: 0.18
Nodes (16): buildJsonPrompt(), DeepSeekChatCompletionResponse, DeepSeekConfig, DeepSeekError, generateJsonWithDeepSeek(), getDeepSeekConfig(), getDeepSeekServerConfig(), getErrorMessage() (+8 more)

### Community 7 - "Community 7"
Cohesion: 0.27
Nodes (8): LogEventResult, AssessmentIntegrityEventPayload, AssessmentIntegrityEventType, AssessmentIntegritySeverity, AssessmentIntegrityStatus, AssessmentIntegritySummary, INTEGRITY_EVENT_SEVERITY, INTEGRITY_STATUS_LABELS

### Community 8 - "Community 8"
Cohesion: 0.33
Nodes (10): attempts_updated_at, auth.users, public.attempt_events, public.attempts, public.code_snapshots, public.question_test_cases, public.questions, public.scorecards (+2 more)

### Community 9 - "Community 9"
Cohesion: 0.40
Nodes (9): attempt, auth.users, public.assessment_integrity_events, public.attempts, public.log_assessment_integrity_event(), public.user_consents, v_event_id, v_low_count (+1 more)

## Knowledge Gaps
- **80 isolated node(s):** `HealthPayload`, `LANGUAGE_LABELS`, `QuestionSummary`, `AttemptRowRaw`, `AttemptRow` (+75 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ResultBand` connect `Community 1` to `Community 3`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `createClient()` connect `Community 5` to `Community 4`, `Community 3`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `HealthPayload`, `LANGUAGE_LABELS`, `QuestionSummary` to the rest of the system?**
  _80 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05711849957374254 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06558441558441558 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.08295625942684766 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.05254901960784314 - nodes in this community are weakly interconnected._