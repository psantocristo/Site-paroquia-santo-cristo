-- Sensitive operational and personal data must never be readable by anonymous visitors.
-- Authenticated administrators retain access through the existing "Admin Full Access" policies.
drop policy if exists "Public Read Access" on public.system_settings;
drop policy if exists "Public Read Access" on public.payment_settings;
drop policy if exists "Public Read Access" on public.campaign_donations;
drop policy if exists "Public Read Access" on public.page_views;
drop policy if exists "Public Read Access" on public.analytics_summary;

-- Cover the foreign keys reported by the Supabase performance advisor.
create index if not exists idx_campaign_donations_campaign_id
  on public.campaign_donations (campaign_id);

create index if not exists idx_photos_album_id
  on public.photos (album_id);
