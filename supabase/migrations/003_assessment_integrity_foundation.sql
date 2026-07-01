-- 003_assessment_integrity_foundation.sql
-- Assessment Integrity Mode: database foundation
--
-- Adds integrity tracking columns to attempts, creates
-- assessment_integrity_events, user_consents, an RPC function for
-- logging events, and a summary view.
--
-- This migration is additive — no existing tables are dropped or reset.
-- All new columns use safe defaults so existing rows are unaffected.

-- ─── A. Alter attempts: add integrity columns ─────────────────────────────────

alter table public.attempts
  add column if not exists integrity_status        text        not null default 'clean',
  add column if not exists integrity_event_count   int         not null default 0,
  add column if not exists assessment_started_at   timestamptz,
  add column if not exists assessment_submitted_at timestamptz,
  add column if not exists fullscreen_required     boolean     not null default false,
  add column if not exists fullscreen_active       boolean     not null default false,
  add column if not exists integrity_metadata      jsonb       not null default '{}'::jsonb;

-- Check constraint for integrity_status (idempotent: catches duplicate_object)
do $$ begin
  alter table public.attempts
    add constraint attempts_integrity_status_check
    check (integrity_status in ('clean', 'warning', 'flagged', 'compromised'));
exception when duplicate_object then null;
end $$;

-- ─── B. assessment_integrity_events ──────────────────────────────────────────
-- Append-only log of assessment-environment events.
-- Normal users may INSERT and SELECT their own rows; UPDATE/DELETE are denied.

create table if not exists public.assessment_integrity_events (
  id              uuid        primary key default gen_random_uuid(),
  attempt_id      uuid        not null references public.attempts(id) on delete cascade,
  user_id         uuid        not null references auth.users(id) on delete cascade,
  event_type      text        not null,
  severity        text        not null default 'info',
  stage           text,
  elapsed_seconds int,
  occurred_at     timestamptz not null default now(),
  metadata        jsonb       not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),

  constraint aie_event_type_check check (event_type in (
    'assessment_rules_accepted',
    'assessment_started',
    'fullscreen_requested',
    'fullscreen_entered',
    'fullscreen_exit',
    'fullscreen_unavailable',
    'tab_hidden',
    'tab_visible',
    'window_blur',
    'window_focus',
    'page_leave_attempt',
    'reload_attempt',
    'route_change_attempt',
    'copy_attempt',
    'paste_attempt',
    'context_menu_attempt',
    'drag_drop_attempt',
    'assessment_paused',
    'assessment_resumed',
    'assessment_submitted',
    'assessment_abandoned'
  )),

  constraint aie_severity_check check (severity in ('info', 'low', 'medium', 'high'))
);

create index if not exists aie_attempt_id_idx
  on public.assessment_integrity_events (attempt_id);

create index if not exists aie_user_id_idx
  on public.assessment_integrity_events (user_id);

create index if not exists aie_attempt_occurred_idx
  on public.assessment_integrity_events (attempt_id, occurred_at);

create index if not exists aie_attempt_severity_idx
  on public.assessment_integrity_events (attempt_id, severity);

create index if not exists aie_user_created_idx
  on public.assessment_integrity_events (user_id, created_at desc);

create index if not exists aie_event_type_idx
  on public.assessment_integrity_events (event_type);

-- ─── C. user_consents ────────────────────────────────────────────────────────
-- Stores per-user consent records, including assessment integrity rule
-- acceptance. consent_type = 'assessment_integrity_rules' is reserved for
-- the future assessment rules confirmation modal.

create table if not exists public.user_consents (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users(id) on delete cascade,
  consent_type text        not null,
  version      text        not null default 'v1',
  consented    boolean     not null,
  metadata     jsonb       not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

-- ─── D. Row Level Security ────────────────────────────────────────────────────

alter table public.assessment_integrity_events enable row level security;
alter table public.user_consents               enable row level security;

-- assessment_integrity_events: users see only their own rows
create policy "Users can view their own integrity events"
  on public.assessment_integrity_events for select
  using (user_id = auth.uid());

-- assessment_integrity_events: users can insert for attempts they own
create policy "Users can insert integrity events for their own attempts"
  on public.assessment_integrity_events for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.attempts a
      where a.id = attempt_id and a.user_id = auth.uid()
    )
  );

-- No UPDATE or DELETE policies — table is append-only for normal users.

-- user_consents: users see and create only their own records
create policy "Users can view their own consent records"
  on public.user_consents for select
  using (user_id = auth.uid());

create policy "Users can insert their own consent records"
  on public.user_consents for insert
  with check (user_id = auth.uid());

-- ─── E. RPC: log_assessment_integrity_event ──────────────────────────────────
-- Called by the browser client to log one integrity event per browser-side
-- occurrence. Atomically inserts the event, recalculates counts, updates
-- attempts.integrity_status, and returns a JSON summary.
--
-- Security model: SECURITY INVOKER — the function runs with the caller's
-- privileges so RLS on all tables applies normally. auth.uid() is the
-- authenticated user; ownership is verified explicitly before any write.

create or replace function public.log_assessment_integrity_event(
  p_attempt_id      uuid,
  p_event_type      text,
  p_severity        text  default 'info',
  p_stage           text  default null,
  p_elapsed_seconds int   default null,
  p_metadata        jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id      uuid;
  v_event_id     uuid;
  v_event_count  int;
  v_low_count    int;
  v_medium_count int;
  v_high_count   int;
  v_new_status   text;
begin
  -- Verify the calling user owns this attempt (RLS also enforces this on DML,
  -- but an explicit check gives a clear error message to the caller).
  select user_id into v_user_id
  from public.attempts
  where id = p_attempt_id and user_id = auth.uid();

  if v_user_id is null then
    raise exception 'Attempt not found or access denied';
  end if;

  -- Insert the integrity event
  insert into public.assessment_integrity_events (
    attempt_id, user_id, event_type, severity,
    stage, elapsed_seconds, metadata
  )
  values (
    p_attempt_id,
    v_user_id,
    p_event_type,
    p_severity,
    p_stage,
    p_elapsed_seconds,
    coalesce(p_metadata, '{}'::jsonb)
  )
  returning id into v_event_id;

  -- Recalculate counts including the just-inserted event
  select
    count(*) filter (where severity = 'low'),
    count(*) filter (where severity = 'medium'),
    count(*) filter (where severity = 'high'),
    count(*)
  into v_low_count, v_medium_count, v_high_count, v_event_count
  from public.assessment_integrity_events
  where attempt_id = p_attempt_id;

  -- MVP status rules:
  --   3+ high events         → compromised
  --   1+ high or 2+ medium   → flagged
  --   1 medium or 3+ low     → warning
  --   otherwise              → clean
  if v_high_count >= 3 then
    v_new_status := 'compromised';
  elsif v_high_count >= 1 or v_medium_count >= 2 then
    v_new_status := 'flagged';
  elsif v_medium_count >= 1 or v_low_count >= 3 then
    v_new_status := 'warning';
  else
    v_new_status := 'clean';
  end if;

  -- Update attempt summary; track fullscreen state when relevant
  update public.attempts
  set
    integrity_status      = v_new_status,
    integrity_event_count = v_event_count,
    fullscreen_active = case
      when p_event_type = 'fullscreen_entered' then true
      when p_event_type = 'fullscreen_exit'    then false
      else fullscreen_active
    end
  where id = p_attempt_id;

  return jsonb_build_object(
    'event_id',              v_event_id,
    'integrity_status',      v_new_status,
    'integrity_event_count', v_event_count
  );
end;
$$;

-- ─── F. View: assessment_integrity_summary ───────────────────────────────────
-- Per-attempt integrity summary for the results page and future scoring logic.
-- Uses security_invoker = true (Postgres 15+) so RLS on the underlying tables
-- applies; each user sees only their own rows.

create or replace view public.assessment_integrity_summary
  with (security_invoker = true)
as
select
  aie.attempt_id,
  aie.user_id,
  count(*)                                             as total_event_count,
  count(*) filter (where aie.severity = 'low')         as low_count,
  count(*) filter (where aie.severity = 'medium')      as medium_count,
  count(*) filter (where aie.severity = 'high')        as high_count,
  max(aie.occurred_at)                                 as last_event_at,
  a.integrity_status
from public.assessment_integrity_events aie
join public.attempts a on a.id = aie.attempt_id
group by aie.attempt_id, aie.user_id, a.integrity_status;
