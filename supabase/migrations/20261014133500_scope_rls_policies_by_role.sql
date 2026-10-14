-- Preserve the existing access model while making role boundaries explicit.
-- This avoids evaluating auth.role() for every row and prevents public policies
-- from being considered for unrelated database roles.
do $$
declare
  policy_row record;
begin
  for policy_row in
    select tablename
    from pg_policies
    where schemaname = 'public'
      and policyname = 'Admin Full Access'
  loop
    execute format(
      'alter policy %I on public.%I to authenticated using (true) with check (true)',
      'Admin Full Access',
      policy_row.tablename
    );
  end loop;

  for policy_row in
    select tablename
    from pg_policies
    where schemaname = 'public'
      and policyname = 'Public Read Access'
  loop
    execute format(
      'alter policy %I on public.%I to anon using (true)',
      'Public Read Access',
      policy_row.tablename
    );
  end loop;
end
$$;

alter policy "Public Insert Donations"
  on public.campaign_donations
  to anon
  with check (true);

alter policy "Public Insert Page Views"
  on public.page_views
  to anon
  with check (true);
