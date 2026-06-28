-- Phase 1: Question practice foundation (clean schema)
-- Run after 000_reset_question_practice_tables.sql

-- ─── questions ───────────────────────────────────────────────────────────────

create table if not exists public.questions (
  id                        uuid primary key default gen_random_uuid(),
  slug                      text unique not null,
  title                     text not null,
  short_summary             text,
  difficulty                text not null check (difficulty in ('easy', 'medium', 'hard')),
  topic                     text not null,
  estimated_minutes         int not null default 20,
  role_level                text not null default 'intern_grad',
  status                    text not null default 'draft' check (status in ('draft', 'review', 'published', 'retired')),
  version                   int not null default 1,
  problem_statement         text not null,
  input_description         text,
  output_description        text,
  constraints               text,
  examples                  jsonb not null default '[]'::jsonb,
  expected_time_complexity  text,
  expected_space_complexity text,
  expected_complexity_notes text,
  supported_languages       text[] not null default array['javascript', 'python', 'cpp'],
  starter_code              jsonb not null default '{}'::jsonb,
  hints                     jsonb not null default '[]'::jsonb,
  follow_up_prompts         jsonb not null default '[]'::jsonb,
  clarification_notes       jsonb not null default '[]'::jsonb,
  rubric_notes              jsonb not null default '{}'::jsonb,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

-- ─── question_test_cases ─────────────────────────────────────────────────────

create table if not exists public.question_test_cases (
  id              uuid primary key default gen_random_uuid(),
  question_id     uuid not null references public.questions(id) on delete cascade,
  label           text,
  input           jsonb not null,
  expected_output jsonb not null,
  is_hidden       boolean not null default false,
  weight          int not null default 1,
  explanation     text,
  created_at      timestamptz not null default now()
);

-- ─── attempts ────────────────────────────────────────────────────────────────

create table if not exists public.attempts (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  question_id         uuid not null references public.questions(id) on delete restrict,
  mode                text not null check (mode in ('practice', 'assessment')),
  language            text not null check (language in ('javascript', 'python', 'cpp')),
  status              text not null default 'draft' check (status in ('draft', 'submitted', 'scored', 'abandoned')),
  clarification       text,
  approach            text,
  testing_plan        text,
  edge_cases          text,
  complexity_answer   text,
  final_code          text,
  started_at          timestamptz not null default now(),
  submitted_at        timestamptz,
  time_taken_seconds  int,
  hints_used          int not null default 0,
  overall_score       int,
  result_band         text check (result_band in (
                        'Needs significant improvement',
                        'Below expected level',
                        'Borderline',
                        'Meets expected level',
                        'Strong performance'
                      )),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ─── attempt_events ──────────────────────────────────────────────────────────

create table if not exists public.attempt_events (
  id          uuid primary key default gen_random_uuid(),
  attempt_id  uuid not null references public.attempts(id) on delete cascade,
  event_type  text not null,
  stage       text,
  payload     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

-- ─── code_snapshots ──────────────────────────────────────────────────────────

create table if not exists public.code_snapshots (
  id          uuid primary key default gen_random_uuid(),
  attempt_id  uuid not null references public.attempts(id) on delete cascade,
  language    text not null check (language in ('javascript', 'python', 'cpp')),
  source_code text not null,
  stage       text,
  created_at  timestamptz not null default now()
);

-- ─── test_runs ───────────────────────────────────────────────────────────────

create table if not exists public.test_runs (
  id                    uuid primary key default gen_random_uuid(),
  attempt_id            uuid not null references public.attempts(id) on delete cascade,
  code_snapshot_id      uuid references public.code_snapshots(id) on delete set null,
  question_test_case_id uuid references public.question_test_cases(id) on delete set null,
  passed                boolean,
  stdout                text,
  stderr                text,
  actual_output         jsonb,
  expected_output       jsonb,
  execution_time_ms     int,
  memory_used_kb        int,
  error_message         text,
  created_at            timestamptz not null default now()
);

-- ─── scorecards ──────────────────────────────────────────────────────────────

create table if not exists public.scorecards (
  id                    uuid primary key default gen_random_uuid(),
  attempt_id            uuid not null references public.attempts(id) on delete cascade,
  overall_score         int not null,
  result_band           text not null check (result_band in (
                          'Needs significant improvement',
                          'Below expected level',
                          'Borderline',
                          'Meets expected level',
                          'Strong performance'
                        )),
  problem_understanding int,
  communication         int,
  algorithmic_approach  int,
  code_correctness      int,
  code_quality          int,
  testing_debugging     int,
  complexity_analysis   int,
  hints_followups       int,
  strengths             jsonb not null default '[]'::jsonb,
  weaknesses            jsonb not null default '[]'::jsonb,
  improvement_tasks     jsonb not null default '[]'::jsonb,
  feedback              jsonb not null default '{}'::jsonb,
  rubric_version        text not null default 'v1',
  model_used            text,
  created_at            timestamptz not null default now()
);

-- ─── updated_at trigger helper ───────────────────────────────────────────────

create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger questions_updated_at
  before update on public.questions
  for each row execute procedure public.handle_updated_at();

create or replace trigger attempts_updated_at
  before update on public.attempts
  for each row execute procedure public.handle_updated_at();

-- ─── Row Level Security ───────────────────────────────────────────────────────

alter table public.questions          enable row level security;
alter table public.question_test_cases enable row level security;
alter table public.attempts           enable row level security;
alter table public.attempt_events     enable row level security;
alter table public.code_snapshots     enable row level security;
alter table public.test_runs          enable row level security;
alter table public.scorecards         enable row level security;

-- questions: anyone can read published questions
create policy "Published questions are publicly readable"
  on public.questions for select
  using (status = 'published');

-- question_test_cases: anyone can read public test cases for published questions
create policy "Public test cases are readable for published questions"
  on public.question_test_cases for select
  using (
    is_hidden = false
    and exists (
      select 1 from public.questions q
      where q.id = question_id and q.status = 'published'
    )
  );

-- attempts: users can only access their own
create policy "Users can view their own attempts"
  on public.attempts for select
  using (auth.uid() = user_id);

create policy "Users can create their own attempts"
  on public.attempts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own attempts"
  on public.attempts for update
  using (auth.uid() = user_id);

-- attempt_events: users can access events for their own attempts
create policy "Users can view events for their own attempts"
  on public.attempt_events for select
  using (exists (
    select 1 from public.attempts a where a.id = attempt_id and a.user_id = auth.uid()
  ));

create policy "Users can insert events for their own attempts"
  on public.attempt_events for insert
  with check (exists (
    select 1 from public.attempts a where a.id = attempt_id and a.user_id = auth.uid()
  ));

-- code_snapshots: users can access snapshots for their own attempts
create policy "Users can view snapshots for their own attempts"
  on public.code_snapshots for select
  using (exists (
    select 1 from public.attempts a where a.id = attempt_id and a.user_id = auth.uid()
  ));

create policy "Users can insert snapshots for their own attempts"
  on public.code_snapshots for insert
  with check (exists (
    select 1 from public.attempts a where a.id = attempt_id and a.user_id = auth.uid()
  ));

-- test_runs: users can access test runs for their own attempts
create policy "Users can view test runs for their own attempts"
  on public.test_runs for select
  using (exists (
    select 1 from public.attempts a where a.id = attempt_id and a.user_id = auth.uid()
  ));

-- scorecards: users can view scorecards for their own attempts
create policy "Users can view scorecards for their own attempts"
  on public.scorecards for select
  using (exists (
    select 1 from public.attempts a where a.id = attempt_id and a.user_id = auth.uid()
  ));
