create policy "Users can insert scorecards for their own attempts"
  on public.scorecards for insert
  with check (exists (
    select 1 from public.attempts a where a.id = attempt_id and a.user_id = auth.uid()
  ));
