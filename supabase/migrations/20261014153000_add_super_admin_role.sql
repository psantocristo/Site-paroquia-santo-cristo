do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('super_admin', 'admin', 'editor');
  end if;
end;
$$;

alter table public.admin_users
add column if not exists role public.app_role not null default 'super_admin';

update public.admin_users
set role = 'super_admin'
where role is distinct from 'super_admin';

create or replace function public.is_super_admin()
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
      and role = 'super_admin'::public.app_role
  );
$$;

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
      and role in ('super_admin'::public.app_role, 'admin'::public.app_role)
  );
$$;

revoke all on function public.is_super_admin() from public;
revoke all on function public.is_admin() from public;
grant execute on function public.is_super_admin() to authenticated;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "Super admins manage roles" on public.admin_users;
create policy "Super admins manage roles"
on public.admin_users
for all
to authenticated
using ((select public.is_super_admin()))
with check ((select public.is_super_admin()));

