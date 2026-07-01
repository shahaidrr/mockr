-- 004_speech_transcripts_indexes_and_fixes.sql
--
-- Addresses real gaps found in migrations 001–003:
--   A. Missing INSERT policy on test_runs (silent RLS bug — submitAttempt() fails silently)
--   B. speech_transcripts table (required for STT storage, not yet created)
--   C. Performance indexes missing on attempt_events, code_snapshots, test_runs,
--      scorecards, question_test_cases, and attempts
--
-- This migration is additive and idempotent. No tables are dropped or altered.

-- ─── A. Fix: missing INSERT policy on test_runs ───────────────────────────────
-- Migration 001 only created a SELECT policy. submitAttempt() in attempts-service.ts
-- inserts per-test-case rows into test_runs; without this policy they silently fail.

do $$ begin
  create policy "Users can insert test runs for their own attempts"
    on public.test_runs for insert
    with check (exists (
      select 1 from public.attempts a
      where a.id = attempt_id and a.user_id = auth.uid()
    ));
exception when duplicate_object then null;
end $$;

-- ─── B. speech_transcripts ────────────────────────────────────────────────────
-- Stores speech-to-text output per attempt stage.
-- Raw audio is NOT stored in this MVP — transcript text only.
-- Provider defaults to web_speech_api (browser Web Speech API).

create table if not exists public.speech_transcripts (
  id               uuid        primary key default gen_random_uuid(),
  attempt_id       uuid        not null references public.attempts(id) on delete cascade,
  user_id          uuid        not null references auth.users(id) on delete cascade,
  stage            text        not null,
  transcript       text        not null,
  provider         text        not null default 'web_speech_api',
  duration_seconds int,
  confidence       numeric,
  is_final         boolean     not null default true,
  metadata         jsonb       not null default '{}'::jsonb,
  created_at       timestamptz not null default now(),

  constraint speech_transcripts_provider_check check (provider in (
    'web_speech_api',
    'openai',
    'deepgram',
    'assemblyai',
    'google',
    'manual'
  ))
);

alter table public.speech_transcripts enable row level security;

do $$ begin
  create policy "Users can view their own speech transcripts"
    on public.speech_transcripts for select
    using (user_id = auth.uid());
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can insert their own speech transcripts"
    on public.speech_transcripts for insert
    with check (
      user_id = auth.uid()
      and exists (
        select 1 from public.attempts a
        where a.id = attempt_id and a.user_id = auth.uid()
      )
    );
exception when duplicate_object then null;
end $$;

create index if not exists speech_transcripts_attempt_id_idx
  on public.speech_transcripts (attempt_id);

create index if not exists speech_transcripts_user_id_idx
  on public.speech_transcripts (user_id);

create index if not exists speech_transcripts_attempt_stage_idx
  on public.speech_transcripts (attempt_id, stage);

-- ─── C. Performance indexes on existing tables ────────────────────────────────

-- attempts
create index if not exists attempts_user_id_idx
  on public.attempts (user_id);

create index if not exists attempts_question_id_idx
  on public.attempts (question_id);

create index if not exists attempts_user_created_idx
  on public.attempts (user_id, created_at desc);

create index if not exists attempts_user_status_idx
  on public.attempts (user_id, status);

-- question_test_cases
create index if not exists qtc_question_id_idx
  on public.question_test_cases (question_id);

create index if not exists qtc_question_hidden_idx
  on public.question_test_cases (question_id, is_hidden);

-- attempt_events
create index if not exists attempt_events_attempt_id_idx
  on public.attempt_events (attempt_id);

create index if not exists attempt_events_attempt_created_idx
  on public.attempt_events (attempt_id, created_at);

create index if not exists attempt_events_event_type_idx
  on public.attempt_events (event_type);

-- code_snapshots
create index if not exists code_snapshots_attempt_id_idx
  on public.code_snapshots (attempt_id);

create index if not exists code_snapshots_attempt_created_idx
  on public.code_snapshots (attempt_id, created_at);

-- test_runs
create index if not exists test_runs_attempt_id_idx
  on public.test_runs (attempt_id);

create index if not exists test_runs_attempt_created_idx
  on public.test_runs (attempt_id, created_at);

-- scorecards
create index if not exists scorecards_attempt_id_idx
  on public.scorecards (attempt_id);

create index if not exists scorecards_created_at_idx
  on public.scorecards (created_at desc);

-- user_consents
create index if not exists user_consents_user_id_idx
  on public.user_consents (user_id);

create index if not exists user_consents_user_consent_type_idx
  on public.user_consents (user_id, consent_type);
