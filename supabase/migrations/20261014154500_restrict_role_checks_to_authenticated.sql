-- Role checks are part of the authenticated admin flow only.
-- Explicit revocation is necessary because older grants may have targeted anon.
revoke execute on function public.is_admin() from anon;
revoke execute on function public.is_super_admin() from anon;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_super_admin() to authenticated;
