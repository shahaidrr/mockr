# Graph Report - .  (2026-07-02)

## Corpus Check
- 71 files · ~96,344 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 408 nodes · 1187 edges · 12 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output
- Edge kinds: ON_BRANCH: 301 · contains: 286 · MODIFIES: 170 · imports: 125 · calls: 124 · imports_from: 85 · PARENT_OF: 66 · references: 12 · re_exports: 7 · reads_from: 6 · method: 3 · triggers: 2


## Input Scope
- Requested: auto
- Resolved: committed (source: default-auto)
- Included files: 71 · Candidates: 108
- Excluded: 0 untracked · 45567 ignored · 0 sensitive · 0 missing committed
- Recommendation: Use --scope all or graphify.yaml inputs.corpus for a knowledge-base folder.

## Graph Freshness
- Built from Git commit: `f26208b`
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
  git → git  _Bridges community 0 → community 1_
- `1d8a332 Merge pull request #8 from shahaidrr/phase-4a-closeout-validation` --PARENT_OF--> `2367649 Merge branch 'main' of https://github.com/shahaidrr/mockr into phase-4b-api-implementation`  [EXTRACTED]
  git → git  _Bridges community 0 → community 7_
- `2367649 Merge branch 'main' of https://github.com/shahaidrr/mockr into phase-4b-api-implementation` --ON_BRANCH--> `phase-4b-2-ai-grading-service`  [EXTRACTED]
  git → git  _Bridges community 7 → community 1_
- `3b7a101 changes to UI/UX, placeholders replaced with values from user connected to supabase; attempt submitted. improved UI, +14 hidden tests for each question and output input` --ON_BRANCH--> `main`  [EXTRACTED]
  git → git  _Bridges community 4 → community 1_

## Communities

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (18): buildRubricNotes(), buildGradeAttemptInput(), buildCategoryFeedback(), buildScorecardFeedback(), POST(), VALID_MODES, VALID_LANGUAGES, Props (+10 more)

### Community 7 - "Community 7"
Cohesion: 0.17
Nodes (17): HealthPayload, DeepSeekChatCompletionResponse, DeepSeekConfig, DeepSeekError, getDeepSeekConfig(), buildJsonPrompt(), getErrorMessage(), getDeepSeekServerConfig() (+9 more)

### Community 4 - "Community 4"
Cohesion: 0.05
Nodes (23): LANGUAGE_LABELS, QuestionSummary, AttemptRowRaw, AttemptRow, metadata, DashboardCardProps, FeatureCardProps, navLinks (+15 more)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (49): CodeEditor, INTERVIEW_PANELS, PANEL_LABELS, LANGUAGE_OPTIONS, DIFFICULTY_COLORS, formatValue(), stripCodeComments(), normalizeCodeForComparison() (+41 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (49): LANGUAGE_LABELS, MODE_LABELS, CATEGORY_LABELS, formatDuration(), formatDateTime(), StoredResult, Props, ResultsPage() (+41 more)

### Community 1 - "Community 1"
Cohesion: 0.17
Nodes (54): CodeEditorProps, INTERVIEW_OPTIONS, eslintConfig, nextConfig, config, 05165f4 Added code editor for practice demo, 0aaf552 Merge branch 'main' of https://github.com/shahaidrr/mockr Merge confict resolved to push code editor, 26f9ded Merge pull request #1 from shahaidrr/phase-1-v1.0.0 (+46 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (48): buildExpectedComplexitySummary(), buildGradingSystemPrompt(), buildGradingUserPrompt(), GradeAttemptCategoryKey, AiGradeAttemptCategoryKey, GradeAttemptCategory, GradeAttemptTestStatus, GradeAttemptTestResult (+40 more)

### Community 8 - "Community 8"
Cohesion: 0.27
Nodes (8): LogEventResult, AssessmentIntegrityStatus, AssessmentIntegritySeverity, AssessmentIntegrityEventType, AssessmentIntegrityEventPayload, AssessmentIntegritySummary, INTEGRITY_EVENT_SEVERITY, INTEGRITY_STATUS_LABELS

### Community 6 - "Community 6"
Cohesion: 0.20
Nodes (21): SubmissionIntegrityEvent, SubmitPracticeAttemptRequest, SubmitPracticeAttemptResponse, SubmitPracticeAttemptError, VALID_MODES, VALID_LANGUAGES, VALID_TEST_STATUSES, VALID_SEVERITIES (+13 more)

### Community 11 - "Community 11"
Cohesion: 0.29
Nodes (6): SupabaseConfig, getSupabaseKey(), getSupabaseKeyErrorMessage(), getSupabaseConfig(), updateSession(), config

### Community 9 - "Community 9"
Cohesion: 0.33
Nodes (10): public.questions, public.question_test_cases, public.attempts, auth.users, public.attempt_events, public.code_snapshots, public.test_runs, public.scorecards (+2 more)

### Community 10 - "Community 10"
Cohesion: 0.40
Nodes (9): public.assessment_integrity_events, public.attempts, auth.users, public.user_consents, public.log_assessment_integrity_event(), v_user_id, v_event_id, v_low_count (+1 more)

## Knowledge Gaps
- **83 isolated node(s):** `HealthPayload`, `LANGUAGE_LABELS`, `QuestionSummary`, `AttemptRowRaw`, `AttemptRow` (+78 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createClient()` connect `Community 5` to `Community 4`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `ResultBand` connect `Community 2` to `Community 3`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `SubmitPracticeAttemptError` connect `Community 6` to `Community 0`, `Community 5`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **What connects `HealthPayload`, `LANGUAGE_LABELS`, `QuestionSummary` to the rest of the system?**
  _83 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 5` be split into smaller, more focused modules?**
  _Cohesion score 0.08571428571428572 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.05279034690799397 - nodes in this community are weakly interconnected._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06349206349206349 - nodes in this community are weakly interconnected._