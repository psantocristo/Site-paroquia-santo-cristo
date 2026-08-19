-- ============================================================
-- BACKUP COMPLETO DO BANCO DE DADOS
-- Paróquia Santo Cristo
-- Data: 16/02/2026
-- Projeto Supabase: gjcmtlmyjaizibhbgiqp
-- ============================================================

-- ============================================================
-- 1. FUNÇÕES (FUNCTIONS)
-- ============================================================

CREATE OR REPLACE FUNCTION public.generate_slug(title text)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
  slug TEXT;
BEGIN
  slug := lower(regexp_replace(title, '[^a-zA-Z0-9\s]', '', 'g'));
  slug := regexp_replace(slug, '\s+', '-', 'g');
  slug := trim(both '-' from slug);
  IF slug = '' THEN
    slug := 'post-' || extract(epoch from now())::text;
  END IF;
  RETURN slug;
END;
$function$;

CREATE OR REPLACE FUNCTION public.increment_campaign_amount(campaign_id uuid, increment_value numeric)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  UPDATE campaigns
  SET current_amount = current_amount + increment_value,
      updated_at = now()
  WHERE id = campaign_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_blog_post_slug()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base_slug := generate_slug(NEW.title);
    final_slug := base_slug;
    WHILE EXISTS (
      SELECT 1 FROM blog_posts
      WHERE slug = final_slug
      AND id != COALESCE(NEW.id, '')
    ) LOOP
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    NEW.slug := final_slug;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_campaign_slug()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base_slug := generate_slug(NEW.title);
    final_slug := base_slug;
    WHILE EXISTS (
      SELECT 1 FROM campaigns
      WHERE slug = final_slug
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) LOOP
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    NEW.slug := final_slug;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_parish_announcement_slug()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
  exists_conflict BOOLEAN;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base_slug := generate_slug(NEW.title);
    final_slug := base_slug;
    LOOP
      IF TG_OP = 'UPDATE' AND NEW.id IS NOT NULL THEN
        SELECT EXISTS(
          SELECT 1 FROM parish_announcements
          WHERE slug = final_slug AND id <> NEW.id
        ) INTO exists_conflict;
      ELSE
        SELECT EXISTS(
          SELECT 1 FROM parish_announcements
          WHERE slug = final_slug
        ) INTO exists_conflict;
      END IF;
      EXIT WHEN NOT exists_conflict;
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    NEW.slug := final_slug;
  ELSE
    NEW.slug := generate_slug(NEW.slug);
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_photo_album_slug()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base_slug := generate_slug(NEW.name);
    final_slug := base_slug;
    WHILE EXISTS (
      SELECT 1 FROM photo_albums
      WHERE slug = final_slug
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) LOOP
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    NEW.slug := final_slug;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_celebrations_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_daily_analytics()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  target_date DATE := CURRENT_DATE;
  view_count INTEGER;
  session_count INTEGER;
  pages_data JSONB;
BEGIN
  SELECT COUNT(*), COUNT(DISTINCT session_id)
  INTO view_count, session_count
  FROM page_views
  WHERE DATE(created_at) = target_date;

  SELECT jsonb_agg(
    jsonb_build_object(
      'path', page_path,
      'views', view_count
    )
  )
  INTO pages_data
  FROM (
    SELECT page_path, COUNT(*) as view_count
    FROM page_views
    WHERE DATE(created_at) = target_date
    GROUP BY page_path
    ORDER BY view_count DESC
    LIMIT 10
  ) top_pages;

  INSERT INTO analytics_summary (date, total_views, unique_sessions, top_pages)
  VALUES (target_date, view_count, session_count, COALESCE(pages_data, '[]'::jsonb))
  ON CONFLICT (date)
  DO UPDATE SET
    total_views = EXCLUDED.total_views,
    unique_sessions = EXCLUDED.unique_sessions,
    top_pages = EXCLUDED.top_pages,
    updated_at = NOW();
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_mercadopago_webhooks_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- ============================================================
-- 2. TABELAS (TABLES)
-- ============================================================

-- analytics_summary
CREATE TABLE IF NOT EXISTS public.analytics_summary (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL,
  total_views integer DEFAULT 0,
  unique_sessions integer DEFAULT 0,
  top_pages jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT analytics_summary_date_key UNIQUE (date)
);

-- blog_posts
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL DEFAULT ''::text,
  content text NOT NULL DEFAULT ''::text,
  excerpt text DEFAULT ''::text,
  featured_image text,
  author text NOT NULL DEFAULT 'Administrador'::text,
  is_published boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  slug text,
  cloudinary_public_id text
);

-- campaign_donations
CREATE TABLE IF NOT EXISTS public.campaign_donations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id uuid NOT NULL,
  donor_name text NOT NULL,
  donor_email text NOT NULL,
  donor_phone text,
  amount numeric NOT NULL,
  payment_status text NOT NULL DEFAULT 'pending'::text,
  payment_id text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  payment_method text,
  payment_type text
);

-- campaigns
CREATE TABLE IF NOT EXISTS public.campaigns (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL,
  title text NOT NULL DEFAULT ''::text,
  description text NOT NULL DEFAULT ''::text,
  goal_amount numeric NOT NULL DEFAULT 0,
  current_amount numeric NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  is_published boolean DEFAULT false,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  featured_image text,
  cloudinary_public_id text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT campaigns_slug_key UNIQUE (slug)
);

-- celebrations
CREATE TABLE IF NOT EXISTS public.celebrations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_name text NOT NULL DEFAULT ''::text,
  celebrant_name text NOT NULL DEFAULT ''::text,
  celebration_type text NOT NULL DEFAULT 'Missa'::text,
  time text NOT NULL DEFAULT ''::text,
  day_of_week text NOT NULL DEFAULT 'sunday'::text,
  is_active boolean DEFAULT true,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- documentation_procedures
CREATE TABLE IF NOT EXISTS public.documentation_procedures (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL DEFAULT ''::text,
  description text NOT NULL DEFAULT ''::text,
  content text NOT NULL DEFAULT ''::text,
  file_url text,
  file_name text,
  file_type text,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- home_sections
CREATE TABLE IF NOT EXISTS public.home_sections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key text NOT NULL,
  section_name text NOT NULL,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT home_sections_section_key_key UNIQUE (section_key)
);

-- page_views
CREATE TABLE IF NOT EXISTS public.page_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path text NOT NULL,
  page_title text,
  session_id text,
  user_agent text,
  ip_address text,
  referrer text,
  created_at timestamp with time zone DEFAULT now()
);

-- parish_announcements
CREATE TABLE IF NOT EXISTS public.parish_announcements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL DEFAULT ''::text,
  content text NOT NULL DEFAULT ''::text,
  type text NOT NULL DEFAULT 'announcement'::text,
  event_date timestamp with time zone,
  flyer_url text,
  whatsapp_contact text,
  is_published boolean DEFAULT false,
  slug text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT parish_announcements_slug_key UNIQUE (slug)
);

-- parishes
CREATE TABLE IF NOT EXISTS public.parishes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL DEFAULT ''::text,
  history text NOT NULL DEFAULT ''::text,
  founded_year integer DEFAULT 1984,
  address text DEFAULT ''::text,
  phone text DEFAULT ''::text,
  email text DEFAULT ''::text,
  logo_url text,
  cloudinary_public_id text,
  confession_hours text,
  spiritual_direction_hours text,
  office_hours text,
  landline_phone text,
  whatsapp_phone text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- pastorals
CREATE TABLE IF NOT EXISTS public.pastorals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL DEFAULT ''::text,
  coordinator text NOT NULL DEFAULT ''::text,
  description text NOT NULL DEFAULT ''::text,
  contact_phone text DEFAULT ''::text,
  is_active boolean DEFAULT true,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- payment_settings
CREATE TABLE IF NOT EXISTS public.payment_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider text NOT NULL DEFAULT 'infinitypay'::text,
  api_key text NOT NULL,
  public_key text,
  client_id text,
  client_secret text,
  webhook_url text,
  environment text DEFAULT 'production'::text,
  is_active boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- photo_albums
CREATE TABLE IF NOT EXISTS public.photo_albums (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL DEFAULT ''::text,
  description text DEFAULT ''::text,
  cover_image_url text,
  cloudinary_public_id text,
  is_active boolean DEFAULT true,
  order_index integer DEFAULT 0,
  slug text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- photos
CREATE TABLE IF NOT EXISTS public.photos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL DEFAULT ''::text,
  description text,
  image_url text NOT NULL DEFAULT ''::text,
  category text NOT NULL DEFAULT 'community'::text,
  album_id uuid,
  cloudinary_public_id text,
  created_at timestamp with time zone DEFAULT now()
);

-- priests
CREATE TABLE IF NOT EXISTS public.priests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL DEFAULT ''::text,
  title text NOT NULL DEFAULT 'Pároco'::text,
  photo_url text,
  short_bio text NOT NULL DEFAULT ''::text,
  full_bio text NOT NULL DEFAULT ''::text,
  ordination_year integer,
  parish_since integer,
  is_active boolean DEFAULT true,
  cloudinary_public_id text,
  video_url text,
  video_thumbnail_url text,
  video_description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- priests_gallery
CREATE TABLE IF NOT EXISTS public.priests_gallery (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL DEFAULT ''::text,
  description text NOT NULL DEFAULT ''::text,
  photo_url text,
  cloudinary_public_id text,
  date_at_parish text,
  was_parish_priest boolean DEFAULT false,
  video_url text,
  video_thumbnail_url text,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- programs
CREATE TABLE IF NOT EXISTS public.programs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL DEFAULT ''::text,
  time text NOT NULL,
  slug text NOT NULL,
  days_of_week jsonb DEFAULT '[]'::jsonb,
  featured_image text,
  is_active boolean DEFAULT true,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- schedules
CREATE TABLE IF NOT EXISTS public.schedules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day_of_week text NOT NULL DEFAULT 'sunday'::text,
  time text NOT NULL DEFAULT ''::text,
  description text DEFAULT ''::text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- site_settings
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL,
  logo_url text,
  logo_alt text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- slides
CREATE TABLE IF NOT EXISTS public.slides (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL DEFAULT ''::text,
  description text NOT NULL DEFAULT ''::text,
  image_url text NOT NULL DEFAULT ''::text,
  cloudinary_public_id text,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  button_text text,
  button_link text,
  button_link_type text,
  button_open_new_tab text,
  created_at timestamp with time zone DEFAULT now()
);

-- system_settings
CREATE TABLE IF NOT EXISTS public.system_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL,
  value text NOT NULL,
  description text,
  is_encrypted boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- timeline_events
CREATE TABLE IF NOT EXISTS public.timeline_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  year integer NOT NULL DEFAULT 1984,
  title text NOT NULL DEFAULT ''::text,
  description text NOT NULL DEFAULT ''::text,
  image_url text,
  cloudinary_public_id text,
  created_at timestamp with time zone DEFAULT now()
);

-- urgent_popups
CREATE TABLE IF NOT EXISTS public.urgent_popups (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL DEFAULT ''::text,
  content text NOT NULL DEFAULT ''::text,
  image_url text,
  cloudinary_public_id text,
  link_url text,
  link_text text DEFAULT 'Saiba mais'::text,
  is_active boolean DEFAULT false,
  priority integer DEFAULT 1,
  auto_close_seconds integer DEFAULT 10,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- video_testimonials
CREATE TABLE IF NOT EXISTS public.video_testimonials (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL DEFAULT ''::text,
  description text NOT NULL DEFAULT ''::text,
  video_type text NOT NULL DEFAULT 'upload'::text,
  video_url text,
  cloudinary_public_id text,
  youtube_id text,
  thumbnail_url text,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- ============================================================
-- 3. FOREIGN KEYS
-- ============================================================

ALTER TABLE public.campaign_donations
  ADD CONSTRAINT campaign_donations_campaign_id_fkey
  FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id);

ALTER TABLE public.photos
  ADD CONSTRAINT photos_album_id_fkey
  FOREIGN KEY (album_id) REFERENCES public.photo_albums(id);

-- ============================================================
-- 4. ÍNDICES (INDEXES)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_analytics_summary_date ON public.analytics_summary USING btree (date DESC);
CREATE INDEX IF NOT EXISTS blog_posts_cloudinary_public_id_idx ON public.blog_posts USING btree (cloudinary_public_id);
CREATE INDEX IF NOT EXISTS blog_posts_published_idx ON public.blog_posts USING btree (is_published, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS blog_posts_slug_idx ON public.blog_posts USING btree (slug);
CREATE INDEX IF NOT EXISTS celebrations_active_idx ON public.celebrations USING btree (is_active, day_of_week, order_index);
CREATE INDEX IF NOT EXISTS celebrations_community_idx ON public.celebrations USING btree (community_name);
CREATE INDEX IF NOT EXISTS celebrations_day_idx ON public.celebrations USING btree (day_of_week, "time");
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON public.page_views USING btree (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON public.page_views USING btree (page_path);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON public.page_views USING btree (session_id);
CREATE INDEX IF NOT EXISTS parish_announcements_date_idx ON public.parish_announcements USING btree (event_date DESC);
CREATE INDEX IF NOT EXISTS parish_announcements_published_idx ON public.parish_announcements USING btree (is_published, event_date DESC);
CREATE INDEX IF NOT EXISTS parish_announcements_type_idx ON public.parish_announcements USING btree (type, event_date DESC);
CREATE INDEX IF NOT EXISTS parish_announcements_whatsapp_idx ON public.parish_announcements USING btree (whatsapp_contact) WHERE (whatsapp_contact IS NOT NULL);
CREATE INDEX IF NOT EXISTS parishes_cloudinary_public_id_idx ON public.parishes USING btree (cloudinary_public_id);
CREATE INDEX IF NOT EXISTS pastorals_active_idx ON public.pastorals USING btree (is_active, order_index);
CREATE INDEX IF NOT EXISTS photos_album_idx ON public.photos USING btree (album_id);
CREATE INDEX IF NOT EXISTS photos_category_idx ON public.photos USING btree (category);
CREATE INDEX IF NOT EXISTS priests_active_idx ON public.priests USING btree (is_active);
CREATE INDEX IF NOT EXISTS priests_gallery_active_idx ON public.priests_gallery USING btree (is_active, order_index);
CREATE INDEX IF NOT EXISTS slides_active_order_idx ON public.slides USING btree (is_active, order_index);
CREATE INDEX IF NOT EXISTS timeline_events_year_idx ON public.timeline_events USING btree (year);
CREATE INDEX IF NOT EXISTS video_testimonials_active_idx ON public.video_testimonials USING btree (is_active, order_index);

-- ============================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.analytics_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.celebrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentation_procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parish_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pastorals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.priests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.priests_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.urgent_popups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_testimonials ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 6. POLÍTICAS RLS (RLS POLICIES)
-- ============================================================

-- analytics_summary
CREATE POLICY "Authenticated users can read analytics summary" ON public.analytics_summary
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Service role can manage analytics summary" ON public.analytics_summary
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- blog_posts
CREATE POLICY "Authenticated users can manage blog posts" ON public.blog_posts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public can read published posts" ON public.blog_posts
  FOR SELECT USING (is_published = true);

-- campaign_donations
CREATE POLICY "Anyone can create donations" ON public.campaign_donations
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update donations" ON public.campaign_donations
  FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can view all donations" ON public.campaign_donations
  FOR SELECT USING (true);

-- campaigns
CREATE POLICY "Authenticated users can manage campaigns" ON public.campaigns
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public can read published campaigns" ON public.campaigns
  FOR SELECT USING (is_published = true);

-- celebrations
CREATE POLICY "Authenticated users can manage celebrations" ON public.celebrations
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public can read active celebrations" ON public.celebrations
  FOR SELECT USING (is_active = true);

-- documentation_procedures
CREATE POLICY "Authenticated users can manage documentation procedures" ON public.documentation_procedures
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public can read active documentation procedures" ON public.documentation_procedures
  FOR SELECT USING (is_active = true);

-- home_sections
CREATE POLICY "Authenticated users can manage sections" ON public.home_sections
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public can read active sections" ON public.home_sections
  FOR SELECT USING (is_active = true);

-- page_views
CREATE POLICY "Anyone can create page views" ON public.page_views
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can read all page views" ON public.page_views
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- parish_announcements
CREATE POLICY "Authenticated users can manage announcements" ON public.parish_announcements
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public can read published announcements" ON public.parish_announcements
  FOR SELECT USING (is_published = true);

-- parishes
CREATE POLICY "Authenticated users can manage parishes" ON public.parishes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public can read parishes" ON public.parishes
  FOR SELECT USING (true);

-- pastorals
CREATE POLICY "Authenticated users can manage pastorals" ON public.pastorals
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public can read active pastorals" ON public.pastorals
  FOR SELECT USING (is_active = true);

-- payment_settings
CREATE POLICY "Authenticated users can manage payment settings" ON public.payment_settings
  FOR ALL USING (true) WITH CHECK (true);

-- photo_albums
CREATE POLICY "Authenticated users can manage albums" ON public.photo_albums
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public can read active albums" ON public.photo_albums
  FOR SELECT USING (is_active = true);

-- photos
CREATE POLICY "Authenticated users can manage photos" ON public.photos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public can read photos" ON public.photos
  FOR SELECT USING (true);

-- priests
CREATE POLICY "Authenticated users can manage priests" ON public.priests
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public can read active priests" ON public.priests
  FOR SELECT USING (is_active = true);

-- priests_gallery
CREATE POLICY "Authenticated users can manage priests gallery" ON public.priests_gallery
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public can read active priests gallery" ON public.priests_gallery
  FOR SELECT USING (is_active = true);

-- programs
CREATE POLICY "Anyone can view active programs" ON public.programs
  FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can delete programs" ON public.programs
  FOR DELETE USING (true);
CREATE POLICY "Authenticated users can insert programs" ON public.programs
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update programs" ON public.programs
  FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can view all programs" ON public.programs
  FOR SELECT USING (true);

-- schedules
CREATE POLICY "Authenticated users can manage schedules" ON public.schedules
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public can read active schedules" ON public.schedules
  FOR SELECT USING (is_active = true);

-- site_settings
CREATE POLICY "Anyone can view site settings" ON public.site_settings
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can delete site settings" ON public.site_settings
  FOR DELETE USING (true);
CREATE POLICY "Authenticated users can insert site settings" ON public.site_settings
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update site settings" ON public.site_settings
  FOR UPDATE USING (true) WITH CHECK (true);

-- slides
CREATE POLICY "Authenticated users can manage slides" ON public.slides
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public can read active slides" ON public.slides
  FOR SELECT USING (is_active = true);

-- system_settings
CREATE POLICY "Authenticated users can manage settings" ON public.system_settings
  FOR ALL USING (true) WITH CHECK (true);

-- timeline_events
CREATE POLICY "Authenticated users can manage timeline events" ON public.timeline_events
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public can read timeline events" ON public.timeline_events
  FOR SELECT USING (true);

-- urgent_popups
CREATE POLICY "Authenticated users can manage popups" ON public.urgent_popups
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage urgent popups" ON public.urgent_popups
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public can read active popups" ON public.urgent_popups
  FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read active urgent popups" ON public.urgent_popups
  FOR SELECT USING (is_active = true);

-- video_testimonials
CREATE POLICY "Authenticated users can manage testimonials" ON public.video_testimonials
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public can read active testimonials" ON public.video_testimonials
  FOR SELECT USING (is_active = true);

-- ============================================================
-- 7. TRIGGERS
-- ============================================================

-- Nota: Os triggers não foram encontrados no information_schema.
-- Abaixo estão os triggers esperados baseados nas funções de trigger existentes:

CREATE TRIGGER set_blog_post_slug_trigger
  BEFORE INSERT OR UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_blog_post_slug();

CREATE TRIGGER set_campaign_slug_trigger
  BEFORE INSERT OR UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.set_campaign_slug();

CREATE TRIGGER set_parish_announcement_slug_trigger
  BEFORE INSERT OR UPDATE ON public.parish_announcements
  FOR EACH ROW EXECUTE FUNCTION public.set_parish_announcement_slug();

CREATE TRIGGER set_photo_album_slug_trigger
  BEFORE INSERT OR UPDATE ON public.photo_albums
  FOR EACH ROW EXECUTE FUNCTION public.set_photo_album_slug();

CREATE TRIGGER update_celebrations_updated_at_trigger
  BEFORE UPDATE ON public.celebrations
  FOR EACH ROW EXECUTE FUNCTION public.update_celebrations_updated_at();

CREATE TRIGGER update_updated_at_parishes
  BEFORE UPDATE ON public.parishes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_updated_at_pastorals
  BEFORE UPDATE ON public.pastorals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_updated_at_priests
  BEFORE UPDATE ON public.priests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_updated_at_blog_posts
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 8. STORAGE BUCKETS
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('parish-photos', 'parish-photos', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- FIM DO BACKUP
-- ============================================================
