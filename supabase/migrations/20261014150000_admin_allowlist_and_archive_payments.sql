-- Restrict administrative access to an explicit allowlist while preserving the
-- two accounts that already managed the site before this migration.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

insert into public.admin_users (user_id)
select id from auth.users
on conflict (user_id) do nothing;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

do $$
declare
  policy_record record;
begin
  for policy_record in
    select tablename
    from pg_policies
    where schemaname = 'public'
      and policyname = 'Admin Full Access'
  loop
    execute format(
      'alter policy %I on public.%I to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))',
      'Admin Full Access',
      policy_record.tablename
    );
  end loop;
end;
$$;

-- Payment data remains archived, but no public role can read or add records.
drop policy if exists "Public Insert Donations" on public.campaign_donations;
drop policy if exists "Public Read Access" on public.campaigns;

-- Only allowlisted administrators may modify files in public media buckets.
alter policy "Auth Upload Bucket"
on storage.objects
to authenticated
with check (
  (select public.is_admin())
  and bucket_id = any (array['parish-photos', 'announcement-flyers', 'logos'])
);

alter policy "Auth Update Bucket"
on storage.objects
to authenticated
using (
  (select public.is_admin())
  and bucket_id = any (array['parish-photos', 'announcement-flyers', 'logos'])
)
with check (
  (select public.is_admin())
  and bucket_id = any (array['parish-photos', 'announcement-flyers', 'logos'])
);

alter policy "Auth Delete Bucket"
on storage.objects
to authenticated
using (
  (select public.is_admin())
  and bucket_id = any (array['parish-photos', 'announcement-flyers', 'logos'])
);

update storage.buckets
set file_size_limit = 10485760,
    allowed_mime_types = array[
      'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif',
      'application/pdf'
    ]
where id in ('parish-photos', 'announcement-flyers');

update storage.buckets
set file_size_limit = 5242880,
    allowed_mime_types = array[
      'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'
    ]
where id = 'logos';

