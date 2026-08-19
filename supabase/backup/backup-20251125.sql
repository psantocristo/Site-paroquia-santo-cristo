-- =============================================
-- Backup Completo do Banco de Dados
-- Data: 2025-11-25
-- Projeto: gjcmtlmyjaizibhbgiqp
-- =============================================

-- =============================================
-- TABLES
-- =============================================

-- Table: parishes
CREATE TABLE IF NOT EXISTS public.parishes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL DEFAULT ''::text,
    history TEXT NOT NULL DEFAULT ''::text,
    address TEXT DEFAULT ''::text,
    phone TEXT DEFAULT ''::text,
    email TEXT DEFAULT ''::text,
    founded_year INTEGER DEFAULT 1984,
    logo_url TEXT,
    cloudinary_public_id TEXT,
    landline_phone TEXT,
    whatsapp_phone TEXT,
    confession_hours TEXT,
    office_hours TEXT,
    spiritual_direction_hours TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: priests
CREATE TABLE IF NOT EXISTS public.priests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL DEFAULT ''::text,
    title TEXT NOT NULL DEFAULT 'Pároco'::text,
    short_bio TEXT NOT NULL DEFAULT ''::text,
    full_bio TEXT NOT NULL DEFAULT ''::text,
    photo_url TEXT,
    video_url TEXT,
    video_thumbnail_url TEXT,
    video_description TEXT,
    ordination_year INTEGER,
    parish_since INTEGER,
    is_active BOOLEAN DEFAULT true,
    cloudinary_public_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: priests_gallery
CREATE TABLE IF NOT EXISTS public.priests_gallery (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL DEFAULT ''::text,
    description TEXT NOT NULL DEFAULT ''::text,
    photo_url TEXT,
    video_url TEXT,
    video_thumbnail_url TEXT,
    date_at_parish TEXT,
    was_parish_priest BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    cloudinary_public_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: slides
CREATE TABLE IF NOT EXISTS public.slides (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL DEFAULT ''::text,
    description TEXT NOT NULL DEFAULT ''::text,
    image_url TEXT NOT NULL DEFAULT ''::text,
    button_text TEXT,
    button_link TEXT,
    button_link_type TEXT,
    button_open_new_tab TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    cloudinary_public_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: timeline_events
CREATE TABLE IF NOT EXISTS public.timeline_events (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    year INTEGER NOT NULL DEFAULT 1984,
    title TEXT NOT NULL DEFAULT ''::text,
    description TEXT NOT NULL DEFAULT ''::text,
    image_url TEXT,
    cloudinary_public_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: photo_albums
CREATE TABLE IF NOT EXISTS public.photo_albums (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL DEFAULT ''::text,
    description TEXT DEFAULT ''::text,
    cover_image_url TEXT,
    slug TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    cloudinary_public_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: photos
CREATE TABLE IF NOT EXISTS public.photos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    album_id UUID REFERENCES public.photo_albums(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT ''::text,
    description TEXT,
    image_url TEXT NOT NULL DEFAULT ''::text,
    category TEXT NOT NULL DEFAULT 'community'::text,
    cloudinary_public_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: schedules
CREATE TABLE IF NOT EXISTS public.schedules (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    day_of_week TEXT NOT NULL DEFAULT 'sunday'::text,
    time TEXT NOT NULL DEFAULT ''::text,
    description TEXT DEFAULT ''::text,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: celebrations
CREATE TABLE IF NOT EXISTS public.celebrations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    day_of_week TEXT NOT NULL DEFAULT 'sunday'::text,
    time TEXT NOT NULL DEFAULT ''::text,
    celebration_type TEXT NOT NULL DEFAULT 'Missa'::text,
    community_name TEXT NOT NULL DEFAULT ''::text,
    celebrant_name TEXT NOT NULL DEFAULT ''::text,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: pastorals
CREATE TABLE IF NOT EXISTS public.pastorals (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL DEFAULT ''::text,
    description TEXT NOT NULL DEFAULT ''::text,
    coordinator TEXT NOT NULL DEFAULT ''::text,
    contact_phone TEXT DEFAULT ''::text,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: blog_posts
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL DEFAULT ''::text,
    slug TEXT,
    content TEXT NOT NULL DEFAULT ''::text,
    excerpt TEXT DEFAULT ''::text,
    featured_image TEXT,
    cloudinary_public_id TEXT,
    author TEXT NOT NULL DEFAULT 'Administrador'::text,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: campaigns
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT ''::text,
    description TEXT NOT NULL DEFAULT ''::text,
    goal_amount NUMERIC NOT NULL DEFAULT 0,
    current_amount NUMERIC NOT NULL DEFAULT 0,
    featured_image TEXT,
    cloudinary_public_id TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: campaign_donations
CREATE TABLE IF NOT EXISTS public.campaign_donations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    donor_name TEXT NOT NULL,
    donor_email TEXT NOT NULL,
    donor_phone TEXT,
    amount NUMERIC NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'pending'::text,
    payment_id TEXT,
    payment_method TEXT,
    payment_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: parish_announcements
CREATE TABLE IF NOT EXISTS public.parish_announcements (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL DEFAULT ''::text,
    slug TEXT,
    content TEXT NOT NULL DEFAULT ''::text,
    type TEXT NOT NULL DEFAULT 'announcement'::text,
    event_date TIMESTAMP WITH TIME ZONE,
    flyer_url TEXT,
    whatsapp_contact TEXT,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: programs
CREATE TABLE IF NOT EXISTS public.programs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT ''::text,
    time TEXT NOT NULL,
    days_of_week JSONB DEFAULT '[]'::jsonb,
    featured_image TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: video_testimonials
CREATE TABLE IF NOT EXISTS public.video_testimonials (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL DEFAULT ''::text,
    description TEXT NOT NULL DEFAULT ''::text,
    video_type TEXT NOT NULL DEFAULT 'upload'::text,
    video_url TEXT,
    youtube_id TEXT,
    thumbnail_url TEXT,
    cloudinary_public_id TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: urgent_popups
CREATE TABLE IF NOT EXISTS public.urgent_popups (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL DEFAULT ''::text,
    content TEXT NOT NULL DEFAULT ''::text,
    image_url TEXT,
    cloudinary_public_id TEXT,
    link_url TEXT,
    link_text TEXT DEFAULT 'Saiba mais'::text,
    auto_close_seconds INTEGER DEFAULT 10,
    priority INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: payment_settings
CREATE TABLE IF NOT EXISTS public.payment_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    provider TEXT NOT NULL DEFAULT 'infinitypay'::text,
    api_key TEXT NOT NULL,
    public_key TEXT,
    client_id TEXT,
    client_secret TEXT,
    webhook_url TEXT,
    environment TEXT DEFAULT 'production'::text,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: site_settings
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT NOT NULL,
    logo_url TEXT,
    logo_alt TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: system_settings
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    is_encrypted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: home_sections
CREATE TABLE IF NOT EXISTS public.home_sections (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    section_key TEXT NOT NULL,
    section_name TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: documentation_procedures
CREATE TABLE IF NOT EXISTS public.documentation_procedures (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL DEFAULT ''::text,
    description TEXT NOT NULL DEFAULT ''::text,
    content TEXT NOT NULL DEFAULT ''::text,
    file_url TEXT,
    file_name TEXT,
    file_type TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: page_views
CREATE TABLE IF NOT EXISTS public.page_views (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    page_path TEXT NOT NULL,
    page_title TEXT,
    session_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: analytics_summary
CREATE TABLE IF NOT EXISTS public.analytics_summary (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    total_views INTEGER DEFAULT 0,
    unique_sessions INTEGER DEFAULT 0,
    top_pages JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function: generate_slug
CREATE OR REPLACE FUNCTION public.generate_slug(title text)
RETURNS text
LANGUAGE plpgsql
AS $function$
DECLARE
  slug TEXT;
BEGIN
  -- Converte para minúsculas, remove caracteres especiais e substitui espaços por hífens
  slug := lower(regexp_replace(title, '[^a-zA-Z0-9\s]', '', 'g'));
  slug := regexp_replace(slug, '\s+', '-', 'g');
  slug := trim(both '-' from slug);
  
  -- Garante que não é vazio
  IF slug = '' THEN
    slug := 'post-' || extract(epoch from now())::text;
  END IF;
  
  RETURN slug;
END;
$function$;

-- Function: update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Function: update_celebrations_updated_at
CREATE OR REPLACE FUNCTION public.update_celebrations_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Function: set_blog_post_slug
CREATE OR REPLACE FUNCTION public.set_blog_post_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Only generate slug if it's empty or null
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base_slug := generate_slug(NEW.title);
    final_slug := base_slug;
    
    -- Check for uniqueness and add counter if needed
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

-- Function: set_campaign_slug
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

-- Function: set_photo_album_slug
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

-- Function: set_parish_announcement_slug
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
  -- If slug is NULL/empty, generate from title
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

  -- If user supplied a slug, clean it
  ELSE
    NEW.slug := generate_slug(NEW.slug);
  END IF;

  RETURN NEW;
END;
$function$;

-- Function: increment_campaign_amount
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

-- Function: update_daily_analytics
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
  -- Contar visitas do dia
  SELECT COUNT(*), COUNT(DISTINCT session_id)
  INTO view_count, session_count
  FROM page_views
  WHERE DATE(created_at) = target_date;

  -- Top páginas do dia
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

  -- Inserir ou atualizar estatísticas
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

-- =============================================
-- TRIGGERS
-- =============================================

-- Triggers for updated_at columns
CREATE TRIGGER update_parishes_updated_at BEFORE UPDATE ON public.parishes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_priests_updated_at BEFORE UPDATE ON public.priests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_priests_gallery_updated_at BEFORE UPDATE ON public.priests_gallery FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_photo_albums_updated_at BEFORE UPDATE ON public.photo_albums FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_celebrations_updated_at BEFORE UPDATE ON public.celebrations FOR EACH ROW EXECUTE FUNCTION public.update_celebrations_updated_at();
CREATE TRIGGER update_pastorals_updated_at BEFORE UPDATE ON public.pastorals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_campaign_donations_updated_at BEFORE UPDATE ON public.campaign_donations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_parish_announcements_updated_at BEFORE UPDATE ON public.parish_announcements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON public.programs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_video_testimonials_updated_at BEFORE UPDATE ON public.video_testimonials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_urgent_popups_updated_at BEFORE UPDATE ON public.urgent_popups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payment_settings_updated_at BEFORE UPDATE ON public.payment_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_home_sections_updated_at BEFORE UPDATE ON public.home_sections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_documentation_procedures_updated_at BEFORE UPDATE ON public.documentation_procedures FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_analytics_summary_updated_at BEFORE UPDATE ON public.analytics_summary FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Triggers for slug generation
CREATE TRIGGER set_blog_post_slug_trigger BEFORE INSERT OR UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.set_blog_post_slug();
CREATE TRIGGER set_campaign_slug_trigger BEFORE INSERT OR UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.set_campaign_slug();
CREATE TRIGGER set_photo_album_slug_trigger BEFORE INSERT OR UPDATE ON public.photo_albums FOR EACH ROW EXECUTE FUNCTION public.set_photo_album_slug();
CREATE TRIGGER set_parish_announcement_slug_trigger BEFORE INSERT OR UPDATE ON public.parish_announcements FOR EACH ROW EXECUTE FUNCTION public.set_parish_announcement_slug();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.parishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.priests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.priests_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.celebrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pastorals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parish_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.urgent_popups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentation_procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_summary ENABLE ROW LEVEL SECURITY;

-- RLS Policies for parishes
CREATE POLICY "Public can read parishes" ON public.parishes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage parishes" ON public.parishes FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for priests
CREATE POLICY "Public can read active priests" ON public.priests FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can manage priests" ON public.priests FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for priests_gallery
CREATE POLICY "Public can read active priests gallery" ON public.priests_gallery FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can manage priests gallery" ON public.priests_gallery FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for slides
CREATE POLICY "Public can read active slides" ON public.slides FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can manage slides" ON public.slides FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for timeline_events
CREATE POLICY "Public can read timeline events" ON public.timeline_events FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage timeline events" ON public.timeline_events FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for photo_albums
CREATE POLICY "Public can read active albums" ON public.photo_albums FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can manage albums" ON public.photo_albums FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for photos
CREATE POLICY "Public can read photos" ON public.photos FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage photos" ON public.photos FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for schedules
CREATE POLICY "Public can read active schedules" ON public.schedules FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can manage schedules" ON public.schedules FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for celebrations
CREATE POLICY "Public can read active celebrations" ON public.celebrations FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can manage celebrations" ON public.celebrations FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for pastorals
CREATE POLICY "Public can read active pastorals" ON public.pastorals FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can manage pastorals" ON public.pastorals FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for blog_posts
CREATE POLICY "Public can read published posts" ON public.blog_posts FOR SELECT USING (is_published = true);
CREATE POLICY "Authenticated users can manage blog posts" ON public.blog_posts FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for campaigns
CREATE POLICY "Public can read published campaigns" ON public.campaigns FOR SELECT USING (is_published = true);
CREATE POLICY "Authenticated users can manage campaigns" ON public.campaigns FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for campaign_donations
CREATE POLICY "Anyone can create donations" ON public.campaign_donations FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can view all donations" ON public.campaign_donations FOR SELECT USING (true);
CREATE POLICY "Authenticated users can update donations" ON public.campaign_donations FOR UPDATE USING (true);

-- RLS Policies for parish_announcements
CREATE POLICY "Public can read published announcements" ON public.parish_announcements FOR SELECT USING (is_published = true);
CREATE POLICY "Authenticated users can manage announcements" ON public.parish_announcements FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for programs
CREATE POLICY "Anyone can view active programs" ON public.programs FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can view all programs" ON public.programs FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert programs" ON public.programs FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update programs" ON public.programs FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete programs" ON public.programs FOR DELETE USING (true);

-- RLS Policies for video_testimonials
CREATE POLICY "Public can read active testimonials" ON public.video_testimonials FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can manage testimonials" ON public.video_testimonials FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for urgent_popups
CREATE POLICY "Public can read active popups" ON public.urgent_popups FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can manage popups" ON public.urgent_popups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public can read active urgent popups" ON public.urgent_popups FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can manage urgent popups" ON public.urgent_popups FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for payment_settings
CREATE POLICY "Authenticated users can manage payment settings" ON public.payment_settings FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for site_settings
CREATE POLICY "Anyone can view site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert site settings" ON public.site_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update site settings" ON public.site_settings FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete site settings" ON public.site_settings FOR DELETE USING (true);

-- RLS Policies for system_settings
CREATE POLICY "Authenticated users can manage settings" ON public.system_settings FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for home_sections
CREATE POLICY "Public can read active sections" ON public.home_sections FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can manage sections" ON public.home_sections FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for documentation_procedures
CREATE POLICY "Public can read active documentation procedures" ON public.documentation_procedures FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can manage documentation procedures" ON public.documentation_procedures FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for page_views
CREATE POLICY "Anyone can create page views" ON public.page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can read all page views" ON public.page_views FOR SELECT USING (auth.uid() IS NOT NULL);

-- RLS Policies for analytics_summary
CREATE POLICY "Authenticated users can read analytics summary" ON public.analytics_summary FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Service role can manage analytics summary" ON public.analytics_summary FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================
-- STORAGE BUCKETS
-- =============================================

-- Create storage bucket (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('parish-photos', 'parish-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for parish-photos bucket
CREATE POLICY "Public can view photos" ON storage.objects FOR SELECT USING (bucket_id = 'parish-photos');
CREATE POLICY "Authenticated users can upload photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'parish-photos' AND auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update photos" ON storage.objects FOR UPDATE USING (bucket_id = 'parish-photos' AND auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete photos" ON storage.objects FOR DELETE USING (bucket_id = 'parish-photos' AND auth.uid() IS NOT NULL);

-- =============================================
-- END OF BACKUP
-- =============================================
